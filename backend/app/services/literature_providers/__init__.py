from __future__ import annotations

from abc import ABC, abstractmethod


class BaseLiteratureProvider(ABC):

    def __init__(self, api_key: str = ""):
        self._api_key = api_key

    @abstractmethod
    async def search(self, query: str, limit: int = 5) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    def get_source_name(self) -> str:
        raise NotImplementedError


def get_provider(provider_name: str, api_key: str = "", ncbi_api_key: str = "", ncbi_tool: str = "biomentor-agent", ncbi_email: str = "") -> BaseLiteratureProvider | None:
    provider_name = provider_name.lower().strip()
    if provider_name == "semantic_scholar":
        from app.services.literature_providers.semantic_scholar import (
            SemanticScholarProvider,
        )
        return SemanticScholarProvider(api_key=api_key)
    if provider_name == "crossref":
        from app.services.literature_providers.crossref import CrossrefProvider
        return CrossrefProvider()
    if provider_name == "pubmed":
        from app.services.literature_providers.pubmed import PubMedProvider
        return PubMedProvider(api_key=ncbi_api_key, tool=ncbi_tool, email=ncbi_email)
    return None