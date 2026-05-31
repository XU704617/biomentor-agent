from __future__ import annotations

import re

import httpx

from app.services.literature_providers import BaseLiteratureProvider

ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
ESUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"


class PubMedProvider(BaseLiteratureProvider):

    def __init__(self, api_key: str = "", tool: str = "biomentor-agent", email: str = ""):
        super().__init__(api_key=api_key)
        self._tool = tool
        self._email = email

    def get_source_name(self) -> str:
        return "pubmed"

    def _build_params(self, **extra) -> dict:
        params = {
            "db": "pubmed",
            "retmode": "json",
            "tool": self._tool,
        }
        if self._api_key:
            params["api_key"] = self._api_key
        if self._email:
            params["email"] = self._email
        params.update(extra)
        return params

    async def _esearch(self, query: str, limit: int) -> list[str]:
        clamped_limit = max(1, min(limit, 20))
        params = self._build_params(term=query, retmax=clamped_limit)

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(ESEARCH_URL, params=params)

        if response.status_code != 200:
            raise RuntimeError(
                f"PubMed ESearch returned status {response.status_code}"
            )

        try:
            data = response.json()
        except Exception:
            raise RuntimeError("PubMed ESearch returned invalid JSON")

        id_list = data.get("esearchresult", {}).get("idlist", [])
        if not isinstance(id_list, list):
            raise RuntimeError("PubMed ESearch returned unexpected structure")

        return id_list

    async def _esummary(self, pmids: list[str]) -> list[dict]:
        params = self._build_params(id=",".join(pmids))

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(ESUMMARY_URL, params=params)

        if response.status_code != 200:
            raise RuntimeError(
                f"PubMed ESummary returned status {response.status_code}"
            )

        try:
            data = response.json()
        except Exception:
            raise RuntimeError("PubMed ESummary returned invalid JSON")

        result = data.get("result", {})
        if not isinstance(result, dict):
            raise RuntimeError("PubMed ESummary returned unexpected structure")

        uids = result.get("uids", [])
        if not isinstance(uids, list):
            uids = []

        summaries = []
        for uid in uids:
            summary = result.get(uid)
            if isinstance(summary, dict):
                summaries.append(summary)

        return summaries

    def _extract_year(self, pubdate: str | None, epubdate: str | None) -> int | None:
        for date_str in (pubdate, epubdate):
            if date_str and isinstance(date_str, str):
                match = re.search(r"(\d{4})", date_str)
                if match:
                    return int(match.group(1))
        return None

    def _extract_doi(self, articleids: list | None) -> str | None:
        if not articleids or not isinstance(articleids, list):
            return None
        for aid in articleids:
            if isinstance(aid, dict) and aid.get("idtype") == "doi":
                return aid.get("value")
        return None

    async def search(self, query: str, limit: int = 5) -> list[dict]:
        pmids = await self._esearch(query=query, limit=limit)

        if not pmids:
            return []

        summaries = await self._esummary(pmids)

        results = []
        for summary in summaries:
            uid = summary.get("uid")
            title = summary.get("title")
            author_list = summary.get("authors") or []
            authors = []
            for a in author_list:
                if isinstance(a, dict):
                    name = a.get("name", "")
                    if name:
                        authors.append(name)

            pubdate = summary.get("pubdate")
            epubdate = summary.get("epubdate")
            year = self._extract_year(pubdate, epubdate)

            venue = summary.get("fulljournalname") or summary.get("source")

            articleids = summary.get("articleids")
            doi = self._extract_doi(articleids)

            url = f"https://pubmed.ncbi.nlm.nih.gov/{uid}/" if uid else None

            results.append({
                "id": uid,
                "title": title,
                "authors": authors,
                "year": year,
                "venue": venue,
                "doi": doi,
                "pmid": uid,
                "url": url,
                "abstract": None,
                "source_provider": "pubmed",
                "raw_id": uid,
            })

        return results