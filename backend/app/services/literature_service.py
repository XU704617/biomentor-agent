"""
Literature search service with pluggable provider adapter architecture.

Supported providers: not_configured, semantic_scholar, crossref.
No fake DOIs, PMIDs, or paper titles are ever generated.
"""

from __future__ import annotations

from app.config import get_settings
from app.services.literature_providers import get_provider, BaseLiteratureProvider

VALID_PROVIDERS = {"not_configured", "semantic_scholar", "crossref", "pubmed"}


class LiteratureSearchService:

    def __init__(self):
        settings = get_settings()
        provider_name = settings.LITERATURE_PROVIDER.strip().lower()
        self._provider_name = provider_name
        self._provider: BaseLiteratureProvider | None = get_provider(
            provider_name,
            api_key=settings.LITERATURE_SEMANTIC_SCHOLAR_API_KEY,
            ncbi_api_key=settings.LITERATURE_NCBI_API_KEY,
            ncbi_tool=settings.LITERATURE_NCBI_TOOL,
            ncbi_email=settings.LITERATURE_NCBI_EMAIL,
        )

    async def search(self, query: str, limit: int = 5) -> dict:
        if self._provider_name == "not_configured":
            return {
                "query": query,
                "results": [],
                "source": "not_configured",
                "message": (
                    "真实文献检索 API 尚未配置，当前仅提供检索入口"
                    "和关键词建议。"
                ),
                "error": None,
            }

        if self._provider_name not in VALID_PROVIDERS:
            return {
                "query": query,
                "results": [],
                "source": self._provider_name,
                "message": None,
                "error": (
                    f"未知的文献检索 provider: '{self._provider_name}'。"
                    f"支持: {', '.join(sorted(VALID_PROVIDERS))}"
                ),
            }

        try:
            results = await self._provider.search(query=query, limit=limit)
            return {
                "query": query,
                "results": results,
                "source": self._provider.get_source_name(),
                "message": None,
                "error": None,
            }
        except Exception as exc:
            return {
                "query": query,
                "results": [],
                "source": self._provider.get_source_name(),
                "message": None,
                "error": (
                    f"文献检索 provider '{self._provider.get_source_name()}' "
                    f"暂时不可用: {exc}"
                ),
            }