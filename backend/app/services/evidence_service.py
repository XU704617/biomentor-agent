"""
Evidence link service for connecting research tasks with literature evidence.

Provides metadata-based evidence notes without AI summarization,
conclusion generation, or field fabrication.
"""

from __future__ import annotations

from app.schemas import EvidenceReferenceItem
from app.services.literature_service import LiteratureSearchService


class EvidenceService:

    def __init__(self):
        self._literature_service = LiteratureSearchService()

    async def search(
        self,
        task_title: str,
        task_description: str | None = None,
        case_title: str | None = None,
        query: str | None = None,
        limit: int = 5,
    ) -> dict:
        search_query = self._build_query(
            query=query,
            task_title=task_title,
            case_title=case_title,
        )

        result = await self._literature_service.search(
            query=search_query,
            limit=limit,
        )
        result["task_title"] = task_title
        return result

    def generate_note(
        self,
        task_title: str,
        task_description: str | None = None,
        selected_literature: list[dict] | None = None,
    ) -> dict:
        if selected_literature is None:
            selected_literature = []

        selected_count = len(selected_literature)

        summary = (
            f"已选择 {selected_count} 篇文献作为该科研训练任务的参考元数据。"
            f"当前 note 仅整理文献来源，不自动判断结论有效性。"
        )

        references = []
        for lit in selected_literature:
            ref = EvidenceReferenceItem(
                title=lit.get("title"),
                authors=lit.get("authors") or [],
                year=lit.get("year"),
                venue=lit.get("venue"),
                doi=lit.get("doi"),
                pmid=lit.get("pmid"),
                url=lit.get("url"),
                source_provider=lit.get("source_provider") or "",
            )
            references.append(ref)

        limitations = [
            "当前 evidence note 基于文献元数据，不包含全文解析。",
            "当前 evidence note 不代表自动科研查证或证据强度判断。",
            "缺失字段保持 null 或空数组，不进行补全。",
        ]

        return {
            "task_title": task_title,
            "selected_count": selected_count,
            "evidence_note": {
                "summary": summary,
                "references": [ref.model_dump() for ref in references],
                "limitations": limitations,
            },
            "message": None,
            "error": None,
        }

    @staticmethod
    def _build_query(
        query: str | None,
        task_title: str,
        case_title: str | None = None,
    ) -> str:
        if query and query.strip():
            return query.strip()

        parts = [task_title.strip()]
        if case_title and case_title.strip():
            parts.append(case_title.strip())

        return " ".join(parts)