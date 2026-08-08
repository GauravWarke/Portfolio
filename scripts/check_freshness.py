"""Detect when a publisher has issued a release newer than the one we parse.

    python scripts/check_freshness.py

Each ``fetch_*.py`` pins the exact file it reads, because a URL like
``.../jul2021-jun2025/8165DC01.xlsx`` names one release. That makes every run
reproducible, but it also means a new release does not break anything: the
pinned file keeps downloading and the figures quietly age.

This script closes that gap. It reads each publisher's landing page, finds the
data file they currently link to, and compares it with the pinned URL. A
difference is reported as a failure so the scheduled CI run turns staleness
into a red check.

It deliberately does **not** switch to the new file. Doing so would change
every published figure without anyone reading the new release first, which is
the opposite of what the reconciliation checks are for. The intended response
to a failure here is to look at what changed, update the pinned URL, re-run the
pipeline, and update the expected values in ``tests/`` in the same commit.

Network failures are reported but do not fail the run: an unreachable
publisher is not evidence of a new release. Requests go through
``common.http_get``, which retries and sends the User-Agent each host will
actually serve -- without that, cgc.gov.au and finance.gov.au reset the
connection and two of the four sources could never be checked at all.
"""
from __future__ import annotations

import re
import sys

import fetch_business_churn as churn
import fetch_govt_ad_spend as ads
import fetch_gst_reconciliation as gst
import fetch_retail_demand as retail
from common import http_get

# name -> (landing page, pinned file URL, pattern matching the file we parse)
#
# A pattern of None means the landing page cannot be read programmatically, so
# the release listing cannot be compared. finance.gov.au answers with an Akamai
# bot-detection interstitial rather than the page; defeating that is not
# something this repo will do, and the file itself is served without it. Those
# sources fall back to confirming the pinned file is still published, and are
# reported as needing a manual look rather than being quietly passed.
SOURCES = {
    "ABS business counts (8165.0)": (
        churn.RELEASE_PAGE, churn.DATACUBE_URL, r"8165DC01\.xlsx"),
    "ABS retail trade (8501.0)": (
        retail.RELEASE_PAGE, f"{retail.BASE}/850101.xlsx", r"850101\.xlsx"),
    "CGC GST update": (
        gst.REPORT_PAGE, gst.REPORT_DOCX, r"[Uu]pdate\.docx"),
    "Finance campaign advertising": (
        ads.REPORT_PAGE, ads.REPORT_DOCX, None),
}


def fetch(url: str) -> str | None:
    try:
        return http_get(url, timeout=180).decode("utf-8", errors="replace")
    except (OSError, TimeoutError) as exc:
        print(f"    could not reach the landing page ({exc})")
        return None


def absolute(href: str, page_url: str) -> str:
    if href.startswith("http"):
        return href
    root = "/".join(page_url.split("/")[:3])
    return root + href if href.startswith("/") else f"{root}/{href}"


def latest_link(html: str, page_url: str, pattern: str) -> str | None:
    """The file the publisher currently links to, if we can identify one."""
    found = re.findall(rf'href="([^"]*{pattern})"', html)
    if not found:
        return None
    # Prefer the most recently dated path when a page lists several releases.
    return absolute(sorted(found)[-1], page_url)


def still_published(url: str) -> bool:
    """Confirm the pinned file is still served, without reading the listing."""
    try:
        return http_get(url, timeout=300)[:2] == b"PK"
    except (OSError, TimeoutError) as exc:
        print(f"    the pinned file could not be downloaded ({exc})")
        return False


def main() -> None:
    print("Checking each source for a newer release\n")
    stale, unreachable, manual = [], [], []

    for name, (page, pinned, pattern) in SOURCES.items():
        print(f"  {name}")

        if pattern is None:
            if still_published(pinned):
                print("    pinned file still published; the release listing is "
                      "not machine-readable, so check the page by hand")
                manual.append(name)
            else:
                unreachable.append(name)
            continue

        html = fetch(page)
        if html is None:
            unreachable.append(name)
            continue

        current = latest_link(html, page, pattern)
        if current is None:
            print("    no matching data file on the landing page; "
                  "the page layout may have changed")
            unreachable.append(name)
            continue

        if current.rstrip("/") == pinned.rstrip("/"):
            print("    up to date")
        else:
            print("    NEWER RELEASE AVAILABLE")
            print(f"      pinned:    {pinned}")
            print(f"      published: {current}")
            stale.append(name)

    print()
    if manual:
        print(f"  {len(manual)} source(s) verified only as still published, "
              f"not compared against a listing: {', '.join(manual)}")
    if unreachable:
        print(f"  {len(unreachable)} source(s) could not be checked: "
              f"{', '.join(unreachable)}")
    if stale:
        print(f"  {len(stale)} source(s) have a newer release.\n")
        print("  Update the pinned URL in the matching fetch_*.py, re-run")
        print("  scripts/run_all.py, and update the expected values in tests/")
        print("  in the same commit so the change is reviewed, not absorbed.")
        sys.exit(1)
    print("  Every reachable source matches the release we parse.")


if __name__ == "__main__":
    main()
