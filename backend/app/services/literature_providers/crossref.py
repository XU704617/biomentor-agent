from __future__ import annotations

import httpx

from app.services.literature_providers import BaseLiteratureProvider

CROSSREF_SEARCH_URL = "https://api.crossref.org/works"


class CrossrefProvider(BaseLiteratureProvider):

    def get_source_name(self) -> str:
        return "crossref"

    async def search(self, query: str, limit: int = 5) -> list[dict]:
        clamped_limit = max(1, min(limit, 20))
        params = {
            "query": query,
            "rows": clamped_limit,
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(CROSSREF_SEARCH_URL, params=params)

        if response.status_code != 200:
            raise RuntimeError(
                f"Crossref API returned status {response.status_code}"
            )

        data = await response.json()
        items = data.get("message", {}).get("items", [])
        if not isinstance(items, list):
            items = []

        results = []
        for item in items:
            doi = item.get("DOI")
            title_list = item.get("title") or []
            title = title_list[0] if title_list else None

            authors_raw = item.get("author") or []
            authors = []
            for a in authors_raw:
                given = a.get("given", "")
                family = a.get("family", "")
                full = f"{given} {family}".strip()
                if full:
                    authors.append(full)

            year = None
            date_parts = (
                item.get("published-print", {})
                .get("date-parts", [[None]])[0]
            )
            if date_parts and date_parts[0]:
                year = date_parts[0]
            else:
                date_parts = (
                    item.get("published-online", {})
                    .get("date-parts", [[None]])[0]
                )
                if date_parts and date_parts[0]:
                    year = date_parts[0]
                else:
                    date_parts = (
                        item.get("issued", {})
                        .get("date-parts", [[None]])[0]
                    )
                    if date_parts and date_parts[0]:
                        year = date_parts[0]

            container = item.get("container-title") or []
            venue = container[0] if container else None

            url = item.get("URL")

            abstract = item.get("abstract")
            if abstract is None:
                abstract = None

            results.append({
                "id": doi,
                "title": title,
                "authors": authors,
                "year": year,
                "venue": venue,
                "doi": doi,
                "pmid": None,
                "url": url,
                "abstract": abstract,
                "source_provider": "crossref",
                "raw_id": doi,
            })

        return results