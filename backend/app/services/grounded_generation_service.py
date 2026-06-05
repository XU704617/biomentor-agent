from __future__ import annotations

import json
from typing import Any

from sqlalchemy.orm import Session

from app.services.ai_provider import GLMAIProvider
from app.services.retrieval_service import RetrievalService


GROUNDED_SYSTEM_PROMPT = """你是科研训练助手。
你只能基于提供的 evidence_items、case_context 和 selected_task 回答。
如果证据中没有的信息，必须说“当前资料不足，不能确认”。
不得编造论文、DOI、PMID、作者、年份、监管状态、临床结论。
回答要包含：
1. 直接回答
2. 证据依据
3. 机制解释
4. 局限性
5. 下一步建议
输出必须是合法 JSON，不要输出 Markdown。"""


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
        package = await self.retrieval.collect(topic, case_key=case_key, limit=6)
        fallback = local_builder() if local_builder else {}
        fallback.update(self._task_meta("local_fallback", package, "测试提示：当前为本地训练框架生成"))

        if package["evidence_count"] < 1:
            return fallback

        prompt = json.dumps(
            {
                "topic": topic,
                "case_context": package["case_context"],
                "evidence_items": package["evidence_items"],
                "required_task_types": ["文献调研", "实验设计", "机制解释", "产业转化分析"],
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
        )
        if not result.success or not result.content:
            fallback["debug_hint"] = self._debug_hint(result.error_type)
            return fallback

        tasks = result.content.get("tasks")
        if not isinstance(tasks, list) or len(tasks) < 4:
            fallback["debug_hint"] = "测试提示：AI 输出结构不完整，当前使用本地训练框架"
            return fallback

        content = result.content
        content.update(self._task_meta("ai_grounded", package, "测试提示：使用 GLM 基于检索证据生成"))
        return content

    async def generate_evidence_note(
        self,
        task_title: str,
        task_description: str | None,
        selected_literature: list[dict[str, Any]],
        case_title: str | None = None,
    ) -> dict[str, Any]:
        query = " ".join([case_title or "", task_title, task_description or ""]).strip()
        package = await self.retrieval.collect(
            query=query or task_title,
            selected_task={"title": task_title, "goal": task_description or ""},
            selected_literature=selected_literature,
            limit=5,
        )
        fallback = self._fallback_note(task_title, task_description, selected_literature, package, case_title)
        if not selected_literature:
            return fallback

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
        )
        if not result.success or not result.content:
            return fallback

        return {
            **result.content,
            "source_mode": "ai_grounded",
            "evidence_items": package["evidence_items"],
            "summary": self._note_summary(result.content),
            "limitations_list": [result.content.get("limitations") or "该笔记基于已选文献信息生成，不替代完整论文阅读。"],
        }

    async def answer_tutor(
        self,
        question: str,
        case_id: str | None = None,
        case_title: str | None = None,
        selected_task: dict[str, Any] | None = None,
        selected_literature: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        package = await self.retrieval.collect(
            query=" ".join([case_title or "", selected_task.get("title", "") if selected_task else "", question]).strip(),
            case_key=case_id,
            selected_task=selected_task,
            selected_literature=selected_literature,
            limit=5,
        )
        fallback = self._fallback_tutor(question, selected_task, package)

        prompt = json.dumps(
            {
                "question": question,
                "case_context": {"case_id": case_id, "case_title": case_title},
                "selected_task": selected_task or {},
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
        )
        if not result.success or not result.content:
            return fallback
        return {"source_mode": "ai_grounded", **result.content}

    def _task_meta(self, source_mode: str, package: dict[str, Any], debug_hint: str) -> dict[str, Any]:
        external = package.get("has_external_evidence")
        local = package.get("has_local_evidence")
        evidence_mode = "external_and_local" if external and local else "external_only" if external else "local_only"
        return {
            "source_mode": source_mode,
            "evidence_mode": evidence_mode,
            "debug_hint": debug_hint,
            "evidence_items": package.get("evidence_items", []),
            "limitations": "生成内容用于科研训练，不等同于完整实验方案。",
        }

    def _fallback_note(
        self,
        task_title: str,
        task_description: str | None,
        selected_literature: list[dict[str, Any]],
        package: dict[str, Any],
        case_title: str | None,
    ) -> dict[str, Any]:
        roles = []
        for idx, lit in enumerate(selected_literature, start=1):
            evidence_id = lit.get("id") or lit.get("pmid") or lit.get("doi") or f"selected-{idx}"
            roles.append({
                "evidence_id": evidence_id,
                "title": lit.get("title") or "未提供标题",
                "role": "用于支撑当前科研训练任务的背景、方法或证据边界。",
                "usable_evidence": lit.get("abstract") or "可用于定位原始文献并整理研究线索。",
                "limitation": "未进行全文解析，不能直接替代原文阅读或完整证据评价。",
            })
        direct = f"已选择 {len(selected_literature)} 篇文献，可用于围绕「{task_title}」整理证据线索。"
        return {
            "source_mode": "local_fallback",
            "note_title": f"{case_title or task_title} 的文献支撑笔记",
            "direct_answer": direct,
            "core_question": task_description or task_title,
            "literature_roles": roles,
            "case_connection": "这些资料可帮助把案例核心问题、任务目标和公开文献线索连接起来。",
            "seminar_quote": "可在答辩中说明：当前判断来自已选择文献和案例资料，仍需回到原文确认方法、结论和适用边界。",
            "next_steps": ["补充阅读原文", "比较不同文献的证据类型", "整理仍无法确认的问题"],
            "limitations": "该笔记基于已选文献信息生成，不替代完整论文阅读。",
            "evidence_items": package.get("evidence_items", []),
            "summary": direct,
            "limitations_list": ["该笔记基于已选文献信息生成，不替代完整论文阅读。"],
        }

    def _fallback_tutor(self, question: str, selected_task: dict[str, Any] | None, package: dict[str, Any]) -> dict[str, Any]:
        task_title = selected_task.get("title") if selected_task else "当前问题"
        return {
            "source_mode": "local_fallback",
            "answer": (
                f"可以先围绕「{task_title}」把问题拆成研究方向、关键词、证据来源和训练任务四部分。"
                f"针对你的问题「{question}」，建议先确认已选文献是否直接支持该判断；若没有直接证据，应写明当前资料不足，不能确认。"
            ),
            "evidence_used": [item.get("id") for item in package.get("evidence_items", [])[:2] if item.get("id")],
            "suggested_next_questions": ["哪些证据能直接支持这个判断？", "实验对照应该如何设置？", "当前资料还有哪些不能证明的部分？"],
            "boundary": "该回答用于科研训练，不替代真实实验设计审批。",
        }

    def _debug_hint(self, error_type: str | None) -> str:
        mapping = {
            "not_configured": "测试提示：当前为本地训练框架生成",
            "insufficient_balance": "测试提示：AI 增强暂不可用，当前使用本地训练框架",
            "timeout": "测试提示：AI 响应超时，当前使用本地训练框架",
            "network_error": "测试提示：AI 增强暂不可用，当前使用本地训练框架",
        }
        return mapping.get(error_type or "", "测试提示：当前为本地训练框架生成")

    def _note_summary(self, content: dict[str, Any]) -> str:
        lines = [
            f"直接回答：{content.get('direct_answer', '')}",
            f"证据怎么支持：{content.get('case_connection', '')}",
            "每篇文献的作用：",
        ]
        for role in content.get("literature_roles", []):
            lines.append(f"- {role.get('title', '未提供标题')}：{role.get('role', '')} 局限：{role.get('limitation', '')}")
        lines.extend([
            f"可用于答辩的一句话：{content.get('seminar_quote', '')}",
            "下一步建议：" + "；".join(content.get("next_steps", [])),
            f"使用边界：{content.get('limitations', '')}",
        ])
        return "\n".join(lines)
