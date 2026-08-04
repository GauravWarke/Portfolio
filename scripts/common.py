"""Shared helpers for the portfolio data pipeline.

Every ``fetch_*.py`` script sources a real Australian open dataset, reduces it
to the handful of figures the matching dashboard renders, and writes a tidy
artefact into ``data/``. The dashboards themselves are static single files, so
these scripts document (and reproduce) the numbers behind them.

Design notes
------------
* Fetches are wrapped in :func:`get` with a timeout and a cached copy on disk,
  so a run is fast on repeat and still works offline against the last snapshot.
* Nothing here is synthetic: each script points at the publisher's own API or
  data-file URL and carries the published figures as a fallback snapshot.
"""
from __future__ import annotations

import csv
import json
import pathlib
import sys
import time
from typing import Any, Iterable
from urllib.error import URLError
from urllib.request import Request, urlopen

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
CACHE_DIR = ROOT / "data" / ".cache"

USER_AGENT = "gaurav-warke-portfolio/1.0 (+https://github.com/GauravWarke/Portfolio)"


def _ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def get(url: str, *, timeout: int = 120, ttl_seconds: int = 86_400,
        as_file: str | None = None):
    """Fetch ``url`` and cache it.

    Returns the response body as bytes, or — when ``as_file`` is given — the
    path to the cached copy on disk, which is what the Excel reader needs.

    A cached copy younger than ``ttl_seconds`` is reused without a round-trip;
    on failure we fall back to whatever cached copy exists, however old, so a
    run still works offline against the last download.
    """
    _ensure_dirs()
    if as_file:
        cache_path = CACHE_DIR / as_file
    else:
        key = "".join(c if c.isalnum() else "_" for c in url)[-120:]
        cache_path = CACHE_DIR / f"{key}.bin"

    fresh = cache_path.exists() and (time.time() - cache_path.stat().st_mtime) < ttl_seconds
    if not fresh:
        try:
            req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
            with urlopen(req, timeout=timeout) as resp:  # noqa: S310 (trusted gov URLs)
                body = resp.read()
            cache_path.write_bytes(body)
        except (URLError, TimeoutError, OSError) as exc:  # offline / endpoint moved
            print(f"  ! download failed ({exc})", file=sys.stderr)
            if not cache_path.exists():
                if as_file:
                    raise SystemExit(f"cannot proceed without {url}") from exc
                return None
            print("  using the previously downloaded copy", file=sys.stderr)

    return str(cache_path) if as_file else cache_path.read_bytes()


def write_json(name: str, payload: Any) -> pathlib.Path:
    _ensure_dirs()
    path = DATA_DIR / name
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"  -> wrote {path.relative_to(ROOT)}")
    return path


def write_csv(name: str, rows: Iterable[dict[str, Any]], fieldnames: list[str]) -> pathlib.Path:
    _ensure_dirs()
    path = DATA_DIR / name
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"  -> wrote {path.relative_to(ROOT)}")
    return path


def banner(title: str, source: str) -> None:
    print(f"\n{title}")
    print(f"  source: {source}")
