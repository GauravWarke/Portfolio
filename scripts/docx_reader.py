"""Minimal .docx table reader built on the standard library.

The Commonwealth Grants Commission publishes the GST distribution as a Word
report rather than a spreadsheet, so the figures have to be read out of the
document itself. A .docx is a ZIP of XML parts, so its tables can be extracted
with ``zipfile`` and ``xml.etree`` alone — the same approach ``xlsx_reader``
takes for the ABS datacubes.

Only table extraction is implemented, which is all the pipeline needs.
"""
from __future__ import annotations

import xml.etree.ElementTree as ET
import zipfile

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def _cell_text(cell: ET.Element) -> str:
    return "".join(t.text or "" for t in cell.iter(f"{W}t")).strip()


def tables(path: str) -> list[list[list[str]]]:
    """Every table in the document, as rows of cell strings."""
    document = ET.fromstring(zipfile.ZipFile(path).read("word/document.xml"))
    out: list[list[list[str]]] = []
    for tbl in document.iter(f"{W}tbl"):
        rows = [[_cell_text(c) for c in tr.iter(f"{W}tc")]
                for tr in tbl.iter(f"{W}tr")]
        if rows:
            out.append(rows)
    return out


def find_table(all_tables, *, must_contain: list[str]) -> list[list[str]] | None:
    """First table whose text contains every one of ``must_contain``."""
    wanted = [w.upper() for w in must_contain]
    for table in all_tables:
        joined = " ".join(" ".join(r) for r in table).upper()
        if all(w in joined for w in wanted):
            return table
    return None


def row_starting(table, label: str, *, after: str | list[str] | None = None):
    """Row whose first cell equals ``label``, after passing marker rows.

    The CGC tables repeat both the row labels and the financial-year headings
    in several blocks — "2026-27" appears once under relativities, again under
    shares, and again under the dollar distribution. A single marker therefore
    matches too early, so ``after`` accepts an ordered list of markers that
    must be seen in sequence before ``label`` is accepted.
    """
    if after is None:
        markers = []
    elif isinstance(after, str):
        markers = [after]
    else:
        markers = list(after)

    for row in table:
        if not row:
            continue
        first = row[0].strip()
        if markers:
            if first == markers[0]:
                markers.pop(0)
            continue
        if first == label:
            return row
    return None


def to_number(text: str) -> float | None:
    """'26,123' -> 26123.0. Returns None for blanks and dashes."""
    cleaned = text.replace(",", "").replace("$", "").strip()
    if not cleaned or cleaned in {"-", "–", "—", ".."}:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None
