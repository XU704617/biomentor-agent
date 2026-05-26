"""
科研训练模块 JSON Schema 验证测试

不引入 jsonschema 依赖，仅用 json.load() 检查 JSON 可解析和 required 字段存在。
"""

import json
import pytest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_DIR = PROJECT_ROOT / "schemas"

SCHEMA_FILES = [
    "knowledge_point.schema.json",
    "evidence_card.schema.json",
    "evidence_matrix.schema.json",
    "research_case.schema.json",
    "agent_role.schema.json",
    "research_report.schema.json",
    "student_profile.schema.json",
]


def load_schema(filename: str) -> dict:
    """加载并解析 JSON Schema 文件"""
    path = SCHEMA_DIR / filename
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class TestSchemaParsable:
    """所有 schema JSON 可解析"""

    @pytest.mark.parametrize("filename", SCHEMA_FILES)
    def test_schema_is_valid_json(self, filename):
        schema = load_schema(filename)
        assert isinstance(schema, dict)

    @pytest.mark.parametrize("filename", SCHEMA_FILES)
    def test_schema_has_required_field(self, filename):
        schema = load_schema(filename)
        assert "required" in schema, f"{filename} 缺少 required 字段"
        assert isinstance(schema["required"], list), f"{filename} 的 required 不是数组"
        assert len(schema["required"]) > 0, f"{filename} 的 required 为空"


class TestEvidenceCardSchemaRequiredFields:
    """evidence_card.schema.json required 中必须包含特定字段"""

    def test_required_contains_limitations(self):
        schema = load_schema("evidence_card.schema.json")
        assert "limitations" in schema["required"]

    def test_required_contains_evidence_strength(self):
        schema = load_schema("evidence_card.schema.json")
        assert "evidence_strength" in schema["required"]

    def test_required_contains_source_refs(self):
        schema = load_schema("evidence_card.schema.json")
        assert "source_refs" in schema["required"]


class TestResearchReportSchemaRequiredFields:
    """research_report.schema.json required 中必须包含特定字段"""

    def test_required_contains_reviewer_questions(self):
        schema = load_schema("research_report.schema.json")
        assert "reviewer_questions" in schema["required"]

    def test_required_contains_requires_teacher_review(self):
        schema = load_schema("research_report.schema.json")
        assert "requires_teacher_review" in schema["required"]
