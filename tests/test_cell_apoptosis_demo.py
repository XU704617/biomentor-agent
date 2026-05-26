"""
细胞凋亡 Demo 数据验证测试

验证 cell_apoptosis.demo.json 的结构完整性和数据合规性。
"""

import json
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEMO_FILE = PROJECT_ROOT / "examples" / "demo_topics" / "cell_apoptosis.demo.json"


def load_demo() -> dict:
    """加载 demo 数据"""
    with open(DEMO_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


class TestDemoDataParsable:
    """Demo 数据可解析"""

    def test_demo_is_valid_json(self):
        data = load_demo()
        assert isinstance(data, dict)


class TestDemoTopLevelFlags:
    """顶层 demo 标记"""

    def test_demo_only_true(self):
        data = load_demo()
        assert data.get("demo_only") is True

    def test_not_real_benchmark_true(self):
        data = load_demo()
        assert data.get("not_real_benchmark") is True

    def test_requires_teacher_review_true(self):
        data = load_demo()
        assert data.get("requires_teacher_review") is True


class TestEvidenceCards:
    """证据卡片验证"""

    def test_at_least_3_cards(self):
        data = load_demo()
        cards = data.get("evidence_cards", [])
        assert len(cards) >= 3

    def test_all_cards_have_demo_flags(self):
        data = load_demo()
        for card in data.get("evidence_cards", []):
            assert card.get("demo_only") is True, f"card {card.get('card_id')} 缺少 demo_only=true"
            assert card.get("not_real_benchmark") is True, f"card {card.get('card_id')} 缺少 not_real_benchmark=true"
            assert card.get("requires_teacher_review") is True, f"card {card.get('card_id')} 缺少 requires_teacher_review=true"

    def test_all_paper_identifiers_are_mock(self):
        data = load_demo()
        for card in data.get("evidence_cards", []):
            pid = card.get("paper_identifier", {})
            pid_type = pid.get("type", "")
            assert pid_type in ("mock_pmid", "demo_paper_id"), (
                f"card {card.get('card_id')} 的 paper_identifier.type={pid_type}，"
                f"应为 mock_pmid 或 demo_paper_id"
            )
            assert card.get("verified") is not True, (
                f"card {card.get('card_id')} 不允许 verified=true"
            )


class TestEvidenceMatrix:
    """证据矩阵验证"""

    def test_matrix_exists(self):
        data = load_demo()
        assert "evidence_matrix" in data

    def test_all_card_ids_exist(self):
        data = load_demo()
        matrix = data["evidence_matrix"]
        card_ids_in_matrix = set(matrix.get("card_ids", []))
        actual_card_ids = {c["card_id"] for c in data.get("evidence_cards", [])}
        missing = card_ids_in_matrix - actual_card_ids
        assert not missing, f"evidence_matrix 引用了不存在的 card_id: {missing}"


class TestAgentRoles:
    """Agent 角色验证"""

    def test_at_least_5_roles(self):
        data = load_demo()
        roles = data.get("agent_roles", [])
        assert len(roles) >= 5


class TestResearchReport:
    """调研报告验证"""

    def test_report_exists(self):
        data = load_demo()
        assert "research_report" in data

    def test_report_status_not_final(self):
        data = load_demo()
        report = data["research_report"]
        assert report.get("status") != "final", "research_report.status 不应为 final"

    def test_report_has_demo_flags(self):
        data = load_demo()
        report = data["research_report"]
        assert report.get("demo_only") is True
        assert report.get("not_real_benchmark") is True
        assert report.get("requires_teacher_review") is True
