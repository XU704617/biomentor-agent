from __future__ import annotations

import json
from typing import Any

from sqlalchemy.orm import Session

from app.services.ai_provider import GLMAIProvider
from app.services.retrieval_service import RetrievalService

GROUNDED_SYSTEM_PROMPT = """你是一名生命科学科研训练助手。

只能基于传入的 case_context、selected_task、selected_literature 和 evidence_items 回答。
不要编造论文、DOI、PMID、作者、年份、临床结论、监管状态或外部搜索结果。
如果证据不足，请明确说明“当前证据不足，不能确认”。
输出必须是一个合法 JSON 对象，不要输出 Markdown。"""


class GroundedGenerationService:
    def __init__(self, db: Session | None = None):
        self.retrieval = RetrievalService(db)
        self.ai = GLMAIProvider()

    async def generate_research_tasks(
        self,
        topic: str,
        case_key: str | None = None,
        mode: str = "independent",
        local_builder=None,
    ) -> dict[str, Any]:
        del local_builder
        package = await self.retrieval.collect(topic, case_key=case_key, limit=4)
        if package["evidence_count"] < 1:
            raise RuntimeError("No evidence was available for research task generation")

        prompt = json.dumps(
            {
                "topic": topic,
                "mode": mode,
                "case_context": package["case_context"],
                "evidence_items": self._compact_evidence_items(package["evidence_items"]),
                "required_task_types": ["literature_review", "experiment_design", "mechanism_explanation", "evidence_judgement"],
                "output_schema": {
                    "research_question": "string",
                    "background": "string",
                    "tasks": [
                        {
                            "id": "string",
                            "type": "literature_review | experiment_design | mechanism_explanation | evidence_judgement",
                            "title": "string",
                            "goal": "string",
                            "why_this_task": "string",
                            "steps": ["string"],
                            "expected_output": "string",
                            "keywords": ["string"],
                            "evidence_ids": ["string"],
                            "difficulty": "入门 | 中等 | 挑战",
                        }
                    ],
                    "mentor_advice": "string",
                    "seminar_topic": "string",
                    "limitations": "string",
                },
            },
            ensure_ascii=False,
        )
        result = await self.ai.generate_json(
            GROUNDED_SYSTEM_PROMPT,
            prompt,
            required_fields=["research_question", "background", "tasks", "mentor_advice", "limitations"],
            max_tokens=1800,
            retries=2,
        )
        if not result.success or not result.content:
            raise RuntimeError(self._format_ai_error(result.error_type, result.raw_text))

        tasks = result.content.get("tasks")
        if not isinstance(tasks, list) or len(tasks) < 4:
            raise RuntimeError("GLM returned incomplete research task content")

        content = result.content
        content.update(self._task_meta("ai_grounded", package))
        return content

    async def generate_evidence_note(
        self,
        task_title: str,
        task_description: str | None,
        selected_literature: list[dict[str, Any]],
        case_title: str | None = None,
    ) -> dict[str, Any]:
        if not selected_literature:
            raise RuntimeError("At least one selected literature item is required")

        query = " ".join([case_title or "", task_title, task_description or ""]).strip()
        package = await self.retrieval.collect(
            query=query or task_title,
            selected_task={"title": task_title, "goal": task_description or ""},
            selected_literature=selected_literature,
            limit=5,
        )

        prompt = json.dumps(
            {
                "case_context": {"title": case_title or ""},
                "selected_task": {"title": task_title, "goal": task_description or ""},
                "selected_literature": selected_literature,
                "evidence_items": package["evidence_items"],
                "output_schema": {
                    "note_title": "string",
                    "direct_answer": "string",
                    "core_question": "string",
                    "literature_roles": [
                        {
                            "evidence_id": "string",
                            "title": "string",
                            "role": "string",
                            "usable_evidence": "string",
                            "limitation": "string",
                        }
                    ],
                    "case_connection": "string",
                    "seminar_quote": "string",
                    "next_steps": ["string"],
                    "limitations": "string",
                },
            },
            ensure_ascii=False,
        )
        result = await self.ai.generate_json(
            GROUNDED_SYSTEM_PROMPT,
            prompt,
            required_fields=["note_title", "direct_answer", "literature_roles", "limitations"],
            max_tokens=2000,
            retries=2,
        )
        if not result.success or not result.content:
            raise RuntimeError(self._format_ai_error(result.error_type, result.raw_text))

        return {
            **result.content,
            "source_mode": "ai_grounded",
            "evidence_items": package["evidence_items"],
            "summary": self._note_summary(result.content),
            "limitations_list": [result.content.get("limitations") or "该结果仅用于科研训练。"],
        }

    async def answer_tutor(
        self,
        question: str,
        case_id: str | None = None,
        case_title: str | None = None,
        selected_task: dict[str, Any] | None = None,
        selected_literature: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        if not selected_task:
            raise RuntimeError("selected_task is required for research tutor")

        package = await self.retrieval.collect(
            query=" ".join([case_title or "", selected_task.get("title", ""), question]).strip(),
            case_key=case_id,
            selected_task=selected_task,
            selected_literature=selected_literature,
            limit=5,
        )

        prompt = json.dumps(
            {
                "question": question,
                "case_context": {"case_id": case_id, "case_title": case_title},
                "selected_task": selected_task,
                "selected_literature": selected_literature or [],
                "evidence_items": package["evidence_items"],
                "output_schema": {
                    "answer": "string",
                    "evidence_used": ["string"],
                    "suggested_next_questions": ["string"],
                    "boundary": "string",
                },
            },
            ensure_ascii=False,
        )
        result = await self.ai.generate_json(
            GROUNDED_SYSTEM_PROMPT,
            prompt,
            required_fields=["answer", "evidence_used", "suggested_next_questions", "boundary"],
            max_tokens=1200,
            retries=2,
        )
        if result.content and isinstance(result.content, dict):
            answer = str(result.content.get("answer") or "").strip()
            if answer:
                evidence_used = result.content.get("evidence_used")
                suggested_next_questions = result.content.get("suggested_next_questions")
                boundary = str(result.content.get("boundary") or "").strip()
                return {
                    "source_mode": "ai_grounded",
                    "answer": answer,
                    "evidence_used": evidence_used if isinstance(evidence_used, list) and evidence_used else [],
                    "suggested_next_questions": suggested_next_questions if isinstance(suggested_next_questions, list) and suggested_next_questions else [],
                    "boundary": boundary or "当前回答仅基于已选任务、已选文献和检索到的证据，不代表完整文献综述结论。",
                }
        if not result.success or not result.content:
            raise RuntimeError(self._format_ai_error(result.error_type, result.raw_text))
        return {"source_mode": "ai_grounded", **result.content}

    def _task_meta(self, source_mode: str, package: dict[str, Any]) -> dict[str, Any]:
        external = package.get("has_external_evidence")
        local = package.get("has_local_evidence")
        evidence_mode = "external_and_local" if external and local else "external_only" if external else "local_only"
        return {
            "source_mode": source_mode,
            "evidence_mode": evidence_mode,
            "debug_hint": "基于真实检索证据生成",
            "evidence_items": package.get("evidence_items", []),
            "limitations": "生成内容用于科研训练，不等同于完整实验方案。",
        }

    def _format_ai_error(self, error_type: str | None, raw_text: str | None) -> str:
        mapping = {
            "not_configured": "GLM API key is not configured",
            "auth_error": "GLM authentication failed",
            "insufficient_balance": "GLM account balance or quota is insufficient",
            "rate_limited": "GLM provider rate-limited the request",
            "timeout": "GLM request timed out",
            "network_error": "GLM request failed due to a network error",
            "invalid_json": "GLM returned invalid JSON",
            "schema_invalid": "GLM returned incomplete structured content",
        }
        base = mapping.get(error_type or "", "GLM grounded generation failed")
        suffix = f": {raw_text[:200]}" if raw_text else ""
        return f"{base}{suffix}"

    def _note_summary(self, content: dict[str, Any]) -> str:
        lines = [
            f"直接回答：{content.get('direct_answer', '')}",
            f"证据如何支持：{content.get('case_connection', '')}",
            "每篇文献的作用：",
        ]
        for role in content.get("literature_roles", []):
            lines.append(
                f"- {role.get('title', '未提供标题')}：{role.get('role', '')} 限制：{role.get('limitation', '')}"
            )
        lines.extend(
            [
                f"可用于答辩的一句话：{content.get('seminar_quote', '')}",
                "下一步建议：" + "；".join(content.get("next_steps", [])),
                f"使用边界：{content.get('limitations', '')}",
            ]
        )
        return "\n".join(lines)

    def _compact_evidence_items(self, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
        compact: list[dict[str, Any]] = []
        for item in items[:4]:
            compact.append(
                {
                    "id": item.get("id"),
                    "title": item.get("title"),
                    "source_type": item.get("source_type"),
                    "year": item.get("year"),
                    "pmid": item.get("pmid"),
                    "doi": item.get("doi"),
                    "snippet": item.get("snippet"),
                    "relevance_reason": item.get("relevance_reason"),
                    "trust_level": item.get("trust_level"),
                }
            )
        return compact
