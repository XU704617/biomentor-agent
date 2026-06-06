#!/usr/bin/env python3
"""Audit local industry-case materials against backend seed and frontend fallback."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
SEED_PATH = ROOT / "backend/app/seed_data/industry_cases.json"
FRONTEND_PATH = ROOT / "frontend/data/industryCases.ts"
DETAIL_DOCX = ROOT.parent / "生物产业案例_23个方向_案例正文.docx"
DIRECTION_XLSX = ROOT.parent / "生物产业案例_23个方向_产业方向与大类汇总表.xlsx"
CARD_DOCX = ROOT.parent / "生物产业案例_23个方向_前端卡片.docx"

DETAIL_LABELS = {
    "审核结论",
    "案例名称",
    "副标题",
    "生物产业大类",
    "对应产业方向",
    "真实产品/技术",
    "相关知识点",
    "核心问题",
    "简短背景",
    "科研基础",
    "应用场景",
    "应用价值",
    "训练能力",
    "推荐关键词",
    "可关联训练任务",
    "推荐展示重点",
    "证据等级",
    "备注",
    "主要资料来源或参考链接",
}


def _load_docx_paragraphs(path: Path) -> list[str]:
    try:
        from docx import Document
    except ImportError as exc:  # pragma: no cover - depends on local tooling
        raise SystemExit("python-docx is required to parse local docx materials") from exc

    document = Document(path)
    return [paragraph.text.strip() for paragraph in document.paragraphs if paragraph.text.strip()]


def parse_case_detail_docx(path: Path = DETAIL_DOCX) -> list[dict[str, object]]:
    paragraphs = _load_docx_paragraphs(path)
    cases: list[dict[str, object]] = []
    current: dict[str, object] | None = None
    label: str | None = None

    for text in paragraphs:
        heading = re.match(r"^(\d+)\.\s*(.+)$", text)
        if heading:
            if current:
                cases.append(current)
            current = {"order": int(heading.group(1)), "heading": heading.group(2)}
            label = None
            continue
        if current is None:
            continue
        if text in DETAIL_LABELS:
            label = text
            current.setdefault(label, "")
            continue
        if label:
            previous = str(current.get(label) or "")
            current[label] = f"{previous}\n{text}".strip() if previous else text

    if current:
        cases.append(current)
    return cases


def _xlsx_rows(path: Path) -> list[list[str]]:
    ns = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    with ZipFile(path) as archive:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            for item in root.findall("x:si", ns):
                shared_strings.append("".join(t.text or "" for t in item.findall(".//x:t", ns)))

        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows: list[list[str]] = []
        for row in sheet.findall(".//x:row", ns):
            values: list[str] = []
            for cell in row.findall("x:c", ns):
                value_node = cell.find("x:v", ns)
                inline = cell.find("x:is", ns)
                value = ""
                if inline is not None:
                    value = "".join(t.text or "" for t in inline.findall(".//x:t", ns))
                elif value_node is not None:
                    value = value_node.text or ""
                    if cell.attrib.get("t") == "s":
                        value = shared_strings[int(value)]
                values.append(value)
            rows.append(values)
        return rows


def parse_direction_xlsx(path: Path = DIRECTION_XLSX) -> list[dict[str, str]]:
    rows = _xlsx_rows(path)
    if not rows:
        return []
    header = rows[0]
    output = []
    for row in rows[1:]:
        output.append({header[idx]: value for idx, value in enumerate(row) if idx < len(header)})
    return output


def parse_card_docx(path: Path = CARD_DOCX) -> list[dict[str, str]]:
    paragraphs = _load_docx_paragraphs(path)
    cards = []
    for text in paragraphs:
        match = re.match(r"^(\d+)\.\s*(case-\d+)｜(.+)$", text)
        if match:
            cards.append({"order": match.group(1), "case_key": match.group(2), "title": match.group(3)})
    return cards


def extract_frontend_cases() -> list[dict[str, object]]:
    source = FRONTEND_PATH.read_text(encoding="utf-8")
    match = re.search(
        r"export const industryCases: IndustryCase\[] = (\[[\s\S]*?\]);\s*export const industryDirections",
        source,
    )
    if not match:
        raise SystemExit("Could not parse frontend industryCases array")
    return json.loads(match.group(1))


def _is_present(value: object) -> bool:
    if value is None or value == "":
        return False
    if isinstance(value, (list, dict)):
        return len(value) > 0
    return True


def audit() -> dict[str, object]:
    seed_cases = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    frontend_cases = extract_frontend_cases()
    detail_cases = parse_case_detail_docx()
    direction_rows = parse_direction_xlsx()
    card_cases = parse_card_docx()

    required_fields = [
        "case_key",
        "title",
        "subtitle",
        "category",
        "industry_direction",
        "real_product_or_technology",
        "knowledge_points",
        "core_problem",
        "background",
        "research_foundation",
        "application_scenario",
        "application_value",
        "required_abilities",
        "recommended_keywords",
        "guide_questions",
        "linked_research_task",
        "display_focus",
        "migration_path",
        "evidence_level",
        "references",
    ]
    incomplete = []
    for case in seed_cases:
        missing = [field for field in required_fields if not _is_present(case.get(field))]
        if missing:
            incomplete.append({"case_key": case.get("case_key"), "title": case.get("title"), "missing": missing})

    case_numbers = [int(str(case["case_key"]).split("-")[-1]) for case in seed_cases]
    return {
        "backend_seed_count": len(seed_cases),
        "frontend_fallback_count": len(frontend_cases),
        "detail_docx_count": len(detail_cases),
        "direction_xlsx_count": len(direction_rows),
        "card_docx_count": len(card_cases),
        "category_distribution": dict(Counter(case.get("category") for case in seed_cases)),
        "case_keys_continuous": case_numbers == list(range(1, max(case_numbers) + 1)),
        "incomplete_cases": incomplete,
        "detail_docx_titles": [str(case.get("案例名称") or case.get("heading") or "") for case in detail_cases],
    }


def main() -> None:
    json.dump(audit(), sys.stdout, ensure_ascii=False, indent=2)
    print()


if __name__ == "__main__":
    main()
