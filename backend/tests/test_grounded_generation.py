import pytest

from app.services.ai_provider import GLMAIProvider
from app.services.grounded_generation_service import GroundedGenerationService


@pytest.mark.anyio
async def test_glm_provider_without_key_returns_not_configured(monkeypatch):
    monkeypatch.setenv("GLM_API_KEY", "")
    from app.config import get_settings
    get_settings.cache_clear()

    result = await GLMAIProvider().generate_json("system", "user", ["answer"])

    assert result.success is False
    assert result.error_type == "not_configured"
    assert result.source_mode == "local_fallback"


@pytest.mark.anyio
async def test_grounded_task_falls_back_to_four_compatible_tasks(monkeypatch):
    monkeypatch.setenv("GLM_API_KEY", "")
    from app.config import get_settings
    get_settings.cache_clear()

    fallback = {
        "topic": "mRNA vaccine LNP delivery",
        "case_key": "case-004",
        "mode": "case_driven",
        "research_question": "mRNA vaccine LNP delivery",
        "background": "测试提示：当前为本地训练框架生成",
        "tasks": [
            {"type": "literature_review", "title": "文献调研", "goal": "g", "steps": [{"title": "s", "description": "d"}], "output_requirement": "o", "suggested_keywords": ["mRNA"], "example_outline": "e"},
            {"type": "experiment_design", "title": "实验设计", "goal": "g", "steps": [{"title": "s", "description": "d"}], "output_requirement": "o", "suggested_keywords": ["LNP"], "example_outline": "e"},
            {"type": "mechanism_explanation", "title": "机制解释", "goal": "g", "steps": [{"title": "s", "description": "d"}], "output_requirement": "o", "suggested_keywords": ["delivery"], "example_outline": "e"},
            {"type": "evidence_judgement", "title": "产业转化分析", "goal": "g", "steps": [{"title": "s", "description": "d"}], "output_requirement": "o", "suggested_keywords": ["safety"], "example_outline": "e"},
        ],
    }

    payload = await GroundedGenerationService().generate_research_tasks(
        "mRNA vaccine LNP delivery",
        local_builder=lambda: dict(fallback),
    )

    assert payload["source_mode"] == "local_fallback"
    assert len(payload["tasks"]) == 4
    assert payload["evidence_items"]
    assert payload["limitations"]


@pytest.mark.anyio
async def test_evidence_note_fallback_is_structured_and_grounded(monkeypatch):
    monkeypatch.setenv("GLM_API_KEY", "")
    from app.config import get_settings
    get_settings.cache_clear()

    payload = await GroundedGenerationService().generate_evidence_note(
        task_title="LNP 递送机制分析",
        task_description="解释 LNP 如何帮助 mRNA 递送",
        selected_literature=[
            {
                "id": "pmid-1",
                "title": "Lipid Nanoparticles for mRNA Delivery",
                "authors": ["A Researcher"],
                "year": 2021,
                "pmid": "123456",
                "abstract": "LNPs can protect mRNA and support delivery.",
                "source_provider": "pubmed",
            }
        ],
        case_title="mRNA 疫苗递送技术",
    )

    assert payload["source_mode"] == "local_fallback"
    assert payload["direct_answer"]
    assert payload["literature_roles"][0]["evidence_id"] == "pmid-1"
    assert "不替代完整论文阅读" in payload["limitations"]


@pytest.mark.anyio
async def test_tutor_fallback_uses_selected_task_and_boundary(monkeypatch):
    monkeypatch.setenv("GLM_API_KEY", "")
    from app.config import get_settings
    get_settings.cache_clear()

    payload = await GroundedGenerationService().answer_tutor(
        question="我应该怎么设计实验对照组？",
        case_title="mRNA 疫苗递送技术",
        selected_task={"title": "实验设计", "goal": "设计 LNP 递送验证框架", "suggested_keywords": ["mRNA", "LNP"]},
        selected_literature=[],
    )

    assert payload["source_mode"] == "local_fallback"
    assert "实验设计" in payload["answer"]
    assert payload["suggested_next_questions"]
    assert "不替代真实实验设计审批" in payload["boundary"]
