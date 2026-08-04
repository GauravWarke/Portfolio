"""Minimal .xlsx reader built on the standard library.

The ABS publishes its detailed data as Excel datacubes. An .xlsx file is a ZIP
of XML parts, so the shared-string table and cell values can be read with
``zipfile`` and ``xml.etree`` alone — no pandas or openpyxl required. That keeps
the pipeline runnable anywhere Python 3.11 is available.

Only what the pipeline needs is implemented: sheet discovery and reading a
worksheet into rows of values. Formatting, formulas and dates are ignored.
"""
from __future__ import annotations

import re
import xml.etree.ElementTree as ET
import zipfile

NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RNS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"

_COL_RE = re.compile(r"([A-Z]+)")


def _column_index(cell_ref: str) -> int:
    """'C7' -> 2. Excel column letters are base-26, 1-indexed."""
    letters = _COL_RE.match(cell_ref).group(1)
    n = 0
    for ch in letters:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def sheet_targets(path: str) -> dict[str, str]:
    """Map sheet name -> internal XML path, in workbook order."""
    with zipfile.ZipFile(path) as z:
        workbook = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        by_rid = {r.get("Id"): r.get("Target") for r in rels}

        out: dict[str, str] = {}
        for sheet in workbook.iter(f"{NS}sheet"):
            target = by_rid.get(sheet.get(f"{RNS}id"), "")
            if target.startswith("/xl/"):
                target = target[1:]
            elif not target.startswith("xl/"):
                target = "xl/" + target
            out[sheet.get("name")] = target
        return out


def read_sheet(path: str, target: str, max_rows: int | None = None) -> list[list]:
    """Read a worksheet into a list of rows. Empty cells become ``None``."""
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if "xl/sharedStrings.xml" in z.namelist():
            table = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in table.iter(f"{NS}si"):
                shared.append("".join(t.text or "" for t in si.iter(f"{NS}t")))

        rows: list[list] = []
        for row in ET.fromstring(z.read(target)).iter(f"{NS}row"):
            cells: dict[int, object] = {}
            for c in row.iter(f"{NS}c"):
                value = _cell_value(c, shared)
                if value is not None and value != "":
                    cells[_column_index(c.get("r", "A1"))] = value
            rows.append([cells.get(i) for i in range(max(cells) + 1)] if cells else [])
            if max_rows and len(rows) >= max_rows:
                break
        return rows


def _cell_value(cell: ET.Element, shared: list[str]):
    kind = cell.get("t")
    if kind == "inlineStr":
        inline = cell.find(f"{NS}is")
        return "".join(t.text or "" for t in inline.iter(f"{NS}t")) if inline is not None else None

    v = cell.find(f"{NS}v")
    if v is None or v.text is None:
        return None
    if kind == "s":
        return shared[int(v.text)]
    try:
        number = float(v.text)
        return int(number) if number == int(number) else number
    except ValueError:
        return v.text


def find_row(rows: list[list], label: str, column: int = 0):
    """First row whose ``column`` equals ``label`` (case-insensitive)."""
    want = label.strip().casefold()
    for row in rows:
        if row and row[column] is not None and str(row[column]).strip().casefold() == want:
            return row
    return None
