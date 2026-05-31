from __future__ import annotations

import httpx

from app.services.literature_providers import BaseLiteratureProvider

S2_SEARCH_URL = "https://api.semanticscholar.org/graph/v1/paper/search"
S2_FIELDS = "title,authors,year,venue,externalIds,url,abstract"


class SemanticScholarProvider(BaseLiteratureProvider):

    def get_source_name(self) -> str:
        return "semantic_scholar"

    async def search(self, query: str, limit: int = 5) -> list[dict]:
        clamped_limit = max(1, min(limit, 20))
        params = {
            "query": query,
            "limit": clamped_limit,
            "fields": S2_FIELDS,
        }
        headers = {}
        if self._api_key:
            headers["x-api-key"] = self._api_key

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(S2_SEARCH_URL, params=params, headers=headers)

        if response.status_code != 200:
            raise RuntimeError(
                f"Semantic Scholar API returned status {response.status_code}"
            )

        data = await response.json()
        papers = data.get("data", [])
        if not isinstance(papers, list):
            papers = []

        results = []
        for paper in papers:
            external_ids = paper.get("externalIds") or {}
            authors_raw = paper.get("authors") or []
            authors = [a.get("name", "") for a in authors_raw]

            results.append({
                "id": paper.get("paperId"),
                "title": paper.get("title"),
                "authors": authors,
                "year": paper.get("year"),
                "venue": paper.get("venue"),
                "doi": external_ids.get("DOI"),
                "pmid": external_ids.get("PubMed"),
                "url": paper.get("url"),
                "abstract": paper.get("abstract"),
                "source_provider": "semantic_scholar",
                "raw_id": paper.get("paperId"),
            })

        return results