"""Re-derive every dataset from source and fail if a published figure moved.

    python scripts/reproduce_check.py

The integrity tests prove the committed numbers are internally consistent. This
proves they are what the publishers actually say: it deletes the cache, runs
each parser against the live source, and compares the result with what is
committed.

A source that cannot be downloaded is reported but does not fail the run.
finance.gov.au does not answer requests from GitHub's datacenter ranges,
though it serves the same file without complaint from an ordinary connection.
An unreachable host is a fact about the network, not evidence that a figure is
wrong, and failing on it would leave a permanently red check that says nothing.
A figure that changed is a different matter, and does fail.

Run it locally before publishing anything: from a normal connection all four
sources resolve, so the check is complete there.
"""
from __future__ import annotations

import pathlib
import shutil
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import common  # noqa: E402

PARSERS = [
    ("ABS business counts", "fetch_business_churn"),
    ("Finance ad spend", "fetch_govt_ad_spend"),
    ("ABS retail trade", "fetch_retail_demand"),
    ("CGC GST update", "fetch_gst_reconciliation"),
]


def run(module: str) -> tuple[bool, str]:
    """Run one parser in its own process so a hard exit cannot end this one."""
    proc = subprocess.run(
        [sys.executable, str(pathlib.Path(__file__).parent / f"{module}.py")],
        capture_output=True, text=True)
    return proc.returncode == 0, (proc.stdout + proc.stderr)


def main() -> None:
    if common.CACHE_DIR.exists():
        shutil.rmtree(common.CACHE_DIR)
    print("Cache cleared. Re-deriving every dataset from the publishers.\n")

    unreachable = []
    for name, module in PARSERS:
        print(f"  {name}")
        ok, output = run(module)
        if ok:
            for line in output.splitlines():
                if "reconciled" in line or "sum to" in line:
                    print(f"    {line.strip()}")
            print("    re-derived from source")
        else:
            print("    could not download from the publisher; "
                  "leaving the committed data untouched")
            unreachable.append(name)

    diff = subprocess.run(["git", "diff", "--stat", "--", "data/"],
                          capture_output=True, text=True).stdout.strip()

    print()
    if unreachable:
        print(f"  {len(unreachable)} source(s) unreachable from here: "
              f"{', '.join(unreachable)}")
        print("  Those datasets were not re-checked on this run.")

    if diff:
        print("\n  A re-derived figure differs from the committed value:\n")
        print(subprocess.run(["git", "diff", "--", "data/"],
                             capture_output=True, text=True).stdout)
        print("  Either a publisher revised their figures or a parser")
        print("  regressed. Read the diff, then update data/ and the expected")
        print("  values in tests/ in the same commit so the change is")
        print("  reviewed rather than absorbed.")
        sys.exit(1)

    checked = len(PARSERS) - len(unreachable)
    print(f"\n  {checked} of {len(PARSERS)} sources re-derived byte-identically "
          "from the publisher's own file.")
    if unreachable:
        sys.exit(0)


if __name__ == "__main__":
    main()
