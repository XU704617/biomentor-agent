"""
Literature search service — placeholder for real external API integration.

When no external API (PubMed / Semantic Scholar / Crossref) is configured,
returns an empty result set with a clear status message.
No fake DOIs, PMIDs, or paper titles are ever generated.
"""

from __future__ import annotations


class LiteratureSearchService:

    def __init__(self, config: dict | None = None):
        self._config = config or {}
        self._api_key = self._config.get("api_key", "")
        self._source = self._config.get("source", "not_configured")

    @property
    def configured(self) -> bool:
        return bool(self._api_key)

    def search(self, query: str, limit: int = 5) -> dict:
        if not self.configured:
            return {
                "query": query,
                "results": [],
                "source": "not_configured",
                "message": "真实文献检索 API 尚未配置，当前仅提供检索入口和关键词建议。",
            }

        return {
            "query": query,
            "results": [],
            "source": self._source,
            "message": "文献检索 API 已配置但尚未实现具体检索逻辑。",
        }