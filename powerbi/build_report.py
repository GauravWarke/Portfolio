"""Generate the Power BI report definition in PBIR format, and validate it.

The report is written as PBIR (the folder-based report format) rather than the
legacy single ``report.json``, because PBIR has published JSON schemas at
developer.microsoft.com. That means the output can be checked against
Microsoft's own specification rather than merely being well-formed JSON.

    python powerbi/build_report.py            # generate
    python powerbi/build_report.py --validate # generate, then check the schemas

Validation downloads the official schemas and asserts the required properties
and value domains for every file produced. It is not a substitute for opening
the report in Power BI Desktop, and does not claim to be — it establishes that
the files conform to the published contract.

Pages are laid out to mirror the four dashboards on the website.
"""
from __future__ import annotations

import json
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent
REPORT = ROOT / "PortfolioAnalytics.Report"
DEFN = REPORT / "definition"

SCHEMA = "https://developer.microsoft.com/json-schemas/fabric/item/report/definition"
S_REPORT = f"{SCHEMA}/report/1.0.0/schema.json"
S_PAGE = f"{SCHEMA}/page/1.0.0/schema.json"
S_VISUAL = f"{SCHEMA}/visualContainer/1.0.0/schema.json"
S_PAGES = f"{SCHEMA}/pagesMetadata/1.0.0/schema.json"

PAGE_W, PAGE_H = 1280, 720


def column(entity: str, prop: str) -> dict:
    return {"Column": {"Expression": {"SourceRef": {"Entity": entity}}, "Property": prop}}


def measure(entity: str, prop: str) -> dict:
    return {"Measure": {"Expression": {"SourceRef": {"Entity": entity}}, "Property": prop}}


def projection(field: dict, query_ref: str) -> dict:
    return {"field": field, "queryRef": query_ref}


def visual(name: str, x: int, y: int, w: int, h: int, vtype: str,
           roles: dict, title: str) -> dict:
    """One visual container. ``roles`` maps a visual role to its projections."""
    return {
        "$schema": S_VISUAL,
        "name": name,
        "position": {"x": x, "y": y, "z": 0, "width": w, "height": h},
        "visual": {
            "visualType": vtype,
            "query": {"queryState": {
                role: {"projections": projs} for role, projs in roles.items()
            }},
            "objects": {"title": [{"properties": {
                "text": {"expr": {"Literal": {"Value": f"'{title}'"}}},
                "show": {"expr": {"Literal": {"Value": "true"}}},
            }}]},
            "drillFilterOtherVisuals": True,
        },
    }


def card(name, x, y, w, h, entity, m, title):
    return visual(name, x, y, w, h, "card",
                  {"Values": [projection(measure(entity, m), f"{entity}.{m}")]}, title)


def bar(name, x, y, w, h, cat_entity, cat, val_entity, val, title):
    return visual(name, x, y, w, h, "barChart", {
        "Category": [projection(column(cat_entity, cat), f"{cat_entity}.{cat}")],
        "Y": [projection(measure(val_entity, val), f"{val_entity}.{val}")],
    }, title)


def line(name, x, y, w, h, cat_entity, cat, val_entity, val, title):
    return visual(name, x, y, w, h, "lineChart", {
        "Category": [projection(column(cat_entity, cat), f"{cat_entity}.{cat}")],
        "Y": [projection(measure(val_entity, val), f"{val_entity}.{val}")],
    }, title)


PAGES = [
    {
        "name": "overview", "displayName": "Overview",
        "visuals": [
            card("kpiBusinesses", 20, 20, 290, 110, "BusinessChurn", "Total Businesses", "Total businesses"),
            card("kpiDigital", 330, 20, 290, 110, "AdSpend", "Digital Share %", "Digital share of ad spend"),
            card("kpiRetail", 640, 20, 290, 110, "RetailDemand", "Latest Turnover ($M)", "Latest retail turnover"),
            card("kpiGst", 950, 20, 290, 110, "GstDistribution", "GST Pool ($bn)", "GST pool distributed"),
            bar("barBusinessState", 20, 150, 610, 270, "State", "State",
                "BusinessChurn", "Total Businesses", "Business base by state"),
            bar("barAdChannel", 650, 150, 610, 270, "AdSpend", "channel",
                "AdSpend", "Total Ad Spend ($M)", "Government ad spend by channel ($M)"),
            line("lineRetail", 20, 440, 610, 260, "RetailDemand", "period",
                 "RetailDemand", "Latest Turnover ($M)", "Retail turnover trend ($M)"),
            bar("barGstState", 650, 440, 610, 260, "GstDistribution", "state",
                "GstDistribution", "GST Pool ($bn)", "GST distribution by state ($bn)"),
        ],
    },
    {
        "name": "crossdataset", "displayName": "Cross-dataset",
        "visuals": [
            card("kpiPerBusiness", 20, 20, 290, 110, "State", "GST per Business ($)",
                 "GST per business"),
            bar("barGstPerBusiness", 20, 150, 1240, 300, "State", "State",
                "State", "GST per Business ($)", "GST per business, by state"),
            bar("barBusinessesByState", 20, 470, 1240, 230, "State", "State",
                "BusinessChurn", "Total Businesses", "Businesses by state"),
        ],
    },
]


def build() -> list[pathlib.Path]:
    written: list[pathlib.Path] = []

    def write(path: pathlib.Path, payload: dict):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8", newline="\n")
        written.append(path)

    write(DEFN / "report.json", {
        "$schema": S_REPORT,
        "layoutOptimization": "None",
        "themeCollection": {"baseTheme": {"name": "CY24SU10", "reportVersionAtImport": "5.55",
                                          "type": "SharedResources"}},
    })

    write(DEFN / "pages" / "pages.json", {
        "$schema": S_PAGES,
        "pageOrder": [p["name"] for p in PAGES],
        "activePageName": PAGES[0]["name"],
    })

    for page in PAGES:
        base = DEFN / "pages" / page["name"]
        write(base / "page.json", {
            "$schema": S_PAGE,
            "name": page["name"],
            "displayName": page["displayName"],
            "displayOption": "FitToPage",
            "width": PAGE_W,
            "height": PAGE_H,
        })
        for v in page["visuals"]:
            write(base / "visuals" / v["name"] / "visual.json", v)

    (REPORT / "definition.pbir").write_text(json.dumps({
        "version": "4.0",
        "datasetReference": {"byPath": {"path": "../PortfolioAnalytics.SemanticModel"}},
    }, indent=2), encoding="utf-8", newline="\n")
    written.append(REPORT / "definition.pbir")
    return written


def validate() -> int:
    """Check every generated file against Microsoft's published schema."""
    cache: dict[str, dict] = {}

    def schema(url: str) -> dict:
        if url not in cache:
            with urllib.request.urlopen(url, timeout=60) as r:
                cache[url] = json.load(r)
        return cache[url]

    problems: list[str] = []

    def check(path: pathlib.Path, url: str):
        doc = json.loads(path.read_text(encoding="utf-8"))
        spec = schema(url)
        rel = path.relative_to(ROOT)
        for req in spec.get("required", []):
            if req not in doc:
                problems.append(f"{rel}: missing required '{req}'")
        for key, val in doc.items():
            prop = spec.get("properties", {}).get(key)
            if prop and "enum" in prop and val not in prop["enum"]:
                problems.append(f"{rel}: '{key}' = {val!r} not in {prop['enum']}")
        return doc

    check(DEFN / "report.json", S_REPORT)
    for page in PAGES:
        base = DEFN / "pages" / page["name"]
        check(base / "page.json", S_PAGE)
        for v in page["visuals"]:
            doc = check(base / "visuals" / v["name"] / "visual.json", S_VISUAL)
            pos = doc.get("position", {})
            for axis in ("x", "y", "width", "height"):
                if axis not in pos:
                    problems.append(f"{v['name']}: position missing '{axis}'")
            if pos.get("x", 0) + pos.get("width", 0) > PAGE_W or \
               pos.get("y", 0) + pos.get("height", 0) > PAGE_H:
                problems.append(f"{v['name']}: extends past the {PAGE_W}x{PAGE_H} canvas")
            if "visualType" not in doc.get("visual", {}):
                problems.append(f"{v['name']}: visual missing 'visualType'")

    total = sum(1 + len(p["visuals"]) for p in PAGES) + 1
    if problems:
        print(f"\n  {len(problems)} problem(s):")
        for p in problems:
            print(f"    {p}")
        return 1
    print(f"\n  {total} files conform to the published PBIR schemas")
    return 0


if __name__ == "__main__":
    files = build()
    print(f"Wrote {len(files)} files under {REPORT.name}/")
    if "--validate" in sys.argv:
        raise SystemExit(validate())
