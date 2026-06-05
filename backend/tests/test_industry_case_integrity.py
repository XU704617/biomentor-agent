import json
import re
from pathlib import Path
from types import SimpleNamespace

from app.schemas import IndustryCaseOut
from app.services.retrieval_service import RetrievalService


ROOT = Path(__file__).resolve().parents[2]
SEED_PATH = ROOT / "backend/app/seed_data/industry_cases.json"
FRONTEND_PATH = ROOT / "frontend/data/industryCases.ts"


def _seed_cases():
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


def _frontend_cases():
    source = FRONTEND_PATH.read_text(encoding="utf-8")
    match = re.search(
        r"export const industryCases: IndustryCase\[] = (\[[\s\S]*?\]);\s*export const industryDirections",
        source,
    )
    assert match, "frontend fallback case array should be parseable"
    return json.loads(match.group(1))


def test_backend_seed_and_frontend_fallback_are_aligned():
    seed = _seed_cases()
    frontend = _frontend_cases()

    assert len(seed) == 36
    assert len(frontend) == len(seed)
    assert [item["case_key"] for item in seed] == [item["id"] for item in frontend]

    numbers = [int(item["case_key"].split("-")[-1]) for item in seed]
    assert numbers == list(range(1, 37))


def test_industry_case_distribution_is_balanced():
    seed = _seed_cases()
    distribution = {}
    for item in seed:
        distribution[item["category"]] = distribution.get(item["category"], 0) + 1

    assert len(distribution) == 9
    assert min(distribution.values()) >= 3
    assert max(distribution.values()) <= 5


def test_all_cases_keep_detail_fields_and_traceable_sources():
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

    for item in _seed_cases():
        missing = [field for field in required_fields if not item.get(field)]
        assert not missing, f"{item['case_key']} missing {missing}"
        assert len(item["guide_questions"]) >= 3
        assert len(item["required_abilities"]) >= 3
        assert len(item["references"]) >= 1
        for ref in item["references"]:
            assert ref.get("title")
            assert ref.get("url", "").startswith("https://")
        joined = json.dumps(item, ensure_ascii=False)
        assert "DOI 待补" not in joined
        assert "PMID 待补" not in joined


def test_new_cases_are_not_card_only_summaries():
    for item in _seed_cases():
        case_no = int(item["case_key"].split("-")[-1])
        if case_no < 31:
            continue
        assert len(item["background"]) >= 120
        assert len(item["research_foundation"]) >= 120
        assert len(item["application_scenario"]) >= 80
        assert len(item["application_value"]) >= 80
        assert len(item["analysis_text"]) >= 80


def test_industry_case_response_schema_includes_detail_fields():
    case = _seed_cases()[3]
    payload = IndustryCaseOut.model_validate(SimpleNamespace(id=4, **case)).model_dump()

    assert payload["case_key"] == "case-004"
    assert payload["background"]
    assert payload["research_foundation"]
    assert payload["application_scenario"]
    assert payload["application_value"]
    assert payload["guide_questions"]
    assert payload["references"]


def test_retrieval_uses_local_case_detail_evidence():
    case = SimpleNamespace(**_seed_cases()[3])
    evidence = RetrievalService()._case_evidence(case)

    assert evidence["id"] == "case-detail-case-004"
    assert evidence["source_type"] == "local_case_detail"
    assert evidence["source_name"] == "本地产业案例详情"
    assert evidence["trust_level"] == "curated"
    assert "科研基础" in evidence["snippet"]
    assert "应用场景" in evidence["snippet"]
