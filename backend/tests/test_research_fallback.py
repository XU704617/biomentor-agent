from unittest.mock import patch

from app.routers.research import generate_task
from app.schemas import ResearchTaskGenerateRequest


class FakeUnavailableLLM:
    available = False

    def generate_json(self, *args, **kwargs):
        raise AssertionError("generate_json should not be called when LLM is unavailable")


class FakeFailingLLM:
    available = True

    def __init__(self, message: str):
        self.message = message

    def generate_json(self, *args, **kwargs):
        raise RuntimeError(self.message)


def _post_generate_task(topic: str = "mRNA 疫苗为什么需要 LNP？"):
    with patch(
        "app.services.research_service.ResearchService._match_local_cases",
        return_value=(
            [{"case_key": "case-004", "title": "mRNA 疫苗递送技术", "reason": "测试匹配"}],
            ["mRNA", "脂质纳米颗粒", "递送系统"],
            ["mRNA", "LNP", "vaccine delivery"],
        ),
    ):
        return generate_task(
            ResearchTaskGenerateRequest(topic=topic, case_key=None, mode="independent"),
            db=object(),
        )


def _assert_stable_fallback_response(data):
    assert data.topic
    assert data.research_question
    assert isinstance(data.related_knowledge_points, list)
    assert len(data.tasks) == 4
    assert [task.type for task in data.tasks] == [
        "literature_review",
        "experiment_design",
        "mechanism_explanation",
        "evidence_judgement",
    ]
    for task in data.tasks:
        assert task.title
        assert task.goal
        assert isinstance(task.steps, list)
        assert task.steps
        assert task.output_requirement
        assert isinstance(task.suggested_keywords, list)
        assert task.example_outline
    assert "本地训练框架" in data.source_scope
    assert "学习参考" in data.disclaimer


def test_generate_task_returns_four_tasks_when_llm_unavailable():
    with patch("app.services.research_service.get_llm", return_value=FakeUnavailableLLM()):
        data = _post_generate_task()

    _assert_stable_fallback_response(data)


def test_generate_task_returns_four_tasks_when_deepseek_balance_error():
    with patch("app.services.research_service.get_llm", return_value=FakeFailingLLM("402 Insufficient Balance")):
        data = _post_generate_task()

    _assert_stable_fallback_response(data)


def test_generate_task_returns_four_tasks_when_llm_raises_network_error():
    with patch("app.services.research_service.get_llm", return_value=FakeFailingLLM("network timeout")):
        data = _post_generate_task("CAR-T 细胞治疗为什么会出现抗原逃逸？")

    _assert_stable_fallback_response(data)
