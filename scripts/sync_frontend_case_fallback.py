#!/usr/bin/env python3
"""Sync frontend industry-case fallback data from the backend seed file."""

from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
SEED_PATH = ROOT / "backend/app/seed_data/industry_cases.json"
FRONTEND_PATH = ROOT / "frontend/data/industryCases.ts"


EVIDENCE_LEVEL = {
    "high": "高",
    "medium": "中",
    "developing": "发展中",
    "low": "发展中",
}

SOURCE_TYPE = {
    "academic": "学术文献",
    "clinical_trial": "临床试验",
    "patent": "专利文献",
    "regulatory": "监管文件",
    "product_page": "产品页",
    "review": "学术文献",
}


def to_ref_type(url: str, raw_type: str | None) -> str:
    raw = (raw_type or "").lower()
    host = urlparse(url).netloc.lower()
    path = urlparse(url).path.lower()
    if "pubmed" in host:
        return "PubMed"
    if "cancer.gov" in host:
        return "NCI"
    if "accessdata.fda.gov" in host or "fda.gov" in host:
        if path.endswith(".pdf") or "label" in path:
            return "Label"
        return "FDA"
    if "doi.org" in host or raw == "academic":
        return "DOI"
    if raw == "product_page":
        return "ProductPage"
    if raw == "review":
        return "Review"
    return "Other"


def source_title(url: str, idx: int) -> str:
    host = urlparse(url).netloc.replace("www.", "")
    if "pubmed" in host:
        return f"PubMed reference {idx}"
    if "fda.gov" in host or "accessdata.fda.gov" in host:
        return f"FDA reference {idx}"
    if "cancer.gov" in host:
        return f"NCI reference {idx}"
    if "doi.org" in host:
        return f"DOI reference {idx}"
    return f"{host or 'Reference'} {idx}"


def migration_path(case: dict) -> dict:
    raw = case.get("migration_path") or {}
    textbook = raw.get("textbookBase") or []
    frontier = raw.get("researchFrontier") or []
    application = raw.get("industryApplication") or []
    if textbook or frontier or application:
        return {
            "textbookBase": textbook,
            "researchFrontier": frontier,
            "industryApplication": application,
        }

    knowledge_points = [x for x in case.get("knowledge_points", []) if isinstance(x, str)]
    keywords = [x for x in case.get("recommended_keywords", []) if isinstance(x, str)]
    return {
        "textbookBase": knowledge_points[:3] or [case.get("category") or "生命科学基础"],
        "researchFrontier": (
            [case.get("linked_research_task")]
            + keywords[:2]
        )[:3],
        "industryApplication": [
            x
            for x in [
                case.get("real_product_or_technology"),
                case.get("industry_direction"),
                case.get("category"),
            ]
            if isinstance(x, str) and x
        ][:3],
    }


def convert_case(case: dict) -> dict:
    refs = []
    raw_refs = case.get("references") or []
    source_urls = case.get("source_urls") or []

    if raw_refs:
        for idx, ref in enumerate(raw_refs, start=1):
            url = ref.get("url") or ""
            if not url:
                continue
            refs.append(
                {
                    "title": ref.get("title") or source_title(url, idx),
                    "url": url,
                    "type": to_ref_type(url, ref.get("type")),
                }
            )
    else:
        for idx, url in enumerate(source_urls, start=1):
            refs.append(
                {
                    "title": source_title(url, idx),
                    "url": url,
                    "type": to_ref_type(url, None),
                }
            )

    return {
        "id": case.get("case_key") or case.get("id"),
        "title": case.get("title") or "",
        "subtitle": case.get("subtitle") or "",
        "category": case.get("category") or "",
        "realProductOrTechnology": case.get("real_product_or_technology") or "",
        "relatedKnowledgePoints": case.get("knowledge_points") or [],
        "industryDirection": case.get("industry_direction") or "",
        "coreProblem": case.get("core_problem") or case.get("problem_statement") or "",
        "researchFoundation": case.get("research_foundation") or "",
        "applicationValue": case.get("application_value") or "",
        "requiredAbilities": case.get("required_abilities") or [],
        "recommendedKeywords": case.get("recommended_keywords") or [],
        "guideQuestions": case.get("guide_questions") or [],
        "linkedResearchTask": case.get("linked_research_task") or "",
        "evidenceLevel": EVIDENCE_LEVEL.get(case.get("evidence_level"), "发展中"),
        "sourceType": SOURCE_TYPE.get(case.get("source_type"), "产业报告"),
        "background": case.get("background") or "",
        "applicationScenario": case.get("application_scenario") or "",
        "displayFocus": case.get("display_focus") or "",
        "notes": case.get("analysis_text") or "",
        "migrationPath": migration_path(case),
        "references": refs,
        "sourceUrls": source_urls,
    }


def main() -> None:
    cases = json.loads(SEED_PATH.read_text(encoding="utf-8"))
    frontend_cases = [convert_case(case) for case in cases]

    source = FRONTEND_PATH.read_text(encoding="utf-8")
    replacement = (
        "export const industryCases: IndustryCase[] = "
        + json.dumps(frontend_cases, ensure_ascii=False, indent=2)
        + ";"
    )

    next_source, count = re.subn(
        r"export const industryCases: IndustryCase\[] = \[.*?\];\n\nexport const industryDirections",
        replacement + "\n\nexport const industryDirections",
        source,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not locate industryCases array in frontend/data/industryCases.ts")

    FRONTEND_PATH.write_text(next_source, encoding="utf-8")
    print(f"Synced {len(frontend_cases)} cases into {FRONTEND_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
