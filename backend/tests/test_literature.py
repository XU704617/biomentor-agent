from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestLiteratureSearchNotConfigured:

    def test_not_configured_returns_empty_results_with_placeholder_message(self):
        response = client.get("/api/literature/search?q=mRNA&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "mRNA"
        assert data["source"] == "not_configured"
        assert data["results"] == []
        assert data["message"] == (
            "真实文献检索 API 尚未配置，当前仅提供检索入口和关键词建议。"
        )
        assert data["error"] is None

    def test_not_configured_returns_expected_fields_structure(self):
        response = client.get("/api/literature/search?q=test")
        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "source" in data
        assert "results" in data
        assert "message" in data
        assert "error" in data
        assert isinstance(data["results"], list)


class TestLiteratureSearchLimitBounds:

    def test_limit_zero_is_rejected_by_fastapi(self):
        response = client.get("/api/literature/search?q=test&limit=0")
        assert response.status_code == 422

    def test_limit_above_20_is_rejected_by_fastapi(self):
        response = client.get("/api/literature/search?q=test&limit=21")
        assert response.status_code == 422

    def test_limit_1_is_accepted(self):
        response = client.get("/api/literature/search?q=test&limit=1")
        assert response.status_code == 200

    def test_limit_20_is_accepted(self):
        response = client.get("/api/literature/search?q=test&limit=20")
        assert response.status_code == 200

    def test_no_query_returns_422(self):
        response = client.get("/api/literature/search")
        assert response.status_code == 422


class TestSemanticScholarMapping:

    @pytest.fixture(autouse=True)
    def auto_patch(self):
        with (
            patch(
                "app.services.literature_providers.semantic_scholar.httpx.AsyncClient"
            ) as mock_client,
        ):
            self.mock_client = mock_client
            yield

    def _mock_response(self, data, status_code=200):
        mock_get = AsyncMock()
        mock_resp = AsyncMock()
        mock_resp.status_code = status_code
        mock_resp.json = AsyncMock(return_value=data)
        mock_get.get.return_value = mock_resp
        self.mock_client.return_value.__aenter__.return_value = mock_get

    def test_maps_semantic_scholar_paper_correctly(self):
        s2_data = {
            "data": [
                {
                    "paperId": "abc123",
                    "title": "mRNA Vaccine Design",
                    "authors": [
                        {"name": "Jane Smith"},
                        {"name": "John Doe"},
                    ],
                    "year": 2021,
                    "venue": "Nature Biotechnology",
                    "externalIds": {
                        "DOI": "10.1234/test.doi",
                        "PubMed": "34567890",
                    },
                    "url": "https://www.semanticscholar.org/paper/abc123",
                    "abstract": "A study on mRNA vaccines.",
                }
            ]
        }
        self._mock_response(s2_data)

        from app.services.literature_providers.semantic_scholar import (
            SemanticScholarProvider,
        )

        async def run():
            provider = SemanticScholarProvider()
            return await provider.search("mRNA", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert len(results) == 1
        r = results[0]
        assert r["id"] == "abc123"
        assert r["title"] == "mRNA Vaccine Design"
        assert r["authors"] == ["Jane Smith", "John Doe"]
        assert r["year"] == 2021
        assert r["venue"] == "Nature Biotechnology"
        assert r["doi"] == "10.1234/test.doi"
        assert r["pmid"] == "34567890"
        assert r["url"] == "https://www.semanticscholar.org/paper/abc123"
        assert r["abstract"] == "A study on mRNA vaccines."
        assert r["source_provider"] == "semantic_scholar"
        assert r["raw_id"] == "abc123"

    def test_maps_empty_authors_and_external_ids(self):
        s2_data = {
            "data": [
                {
                    "paperId": "minimal",
                    "title": None,
                    "authors": [],
                    "year": None,
                    "venue": None,
                    "externalIds": {},
                    "url": None,
                    "abstract": None,
                }
            ]
        }
        self._mock_response(s2_data)

        from app.services.literature_providers.semantic_scholar import (
            SemanticScholarProvider,
        )

        async def run():
            provider = SemanticScholarProvider()
            return await provider.search("minimal", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert len(results) == 1
        r = results[0]
        assert r["title"] is None
        assert r["authors"] == []
        assert r["year"] is None
        assert r["venue"] is None
        assert r["doi"] is None
        assert r["pmid"] is None
        assert r["abstract"] is None

    def test_handles_invalid_response_gracefully(self):
        self.mock_client.return_value.__aenter__.side_effect = Exception(
            "Connection error"
        )

        from app.services.literature_providers.semantic_scholar import (
            SemanticScholarProvider,
        )

        async def run():
            provider = SemanticScholarProvider()
            return await provider.search("test", limit=5)

        import asyncio
        with pytest.raises(Exception):
            asyncio.get_event_loop().run_until_complete(run())


class TestCrossrefMapping:

    @pytest.fixture(autouse=True)
    def auto_patch(self):
        with (
            patch(
                "app.services.literature_providers.crossref.httpx.AsyncClient"
            ) as mock_client,
        ):
            self.mock_client = mock_client
            yield

    def _mock_response(self, data, status_code=200):
        mock_get = AsyncMock()
        mock_resp = AsyncMock()
        mock_resp.status_code = status_code
        mock_resp.json = AsyncMock(return_value=data)
        mock_get.get.return_value = mock_resp
        self.mock_client.return_value.__aenter__.return_value = mock_get

    def test_maps_crossref_work_correctly(self):
        crossref_data = {
            "message": {
                "items": [
                    {
                        "DOI": "10.5678/crossref.test",
                        "title": ["Lipid Nanoparticle Delivery Systems"],
                        "author": [
                            {"given": "Alice", "family": "Brown"},
                            {"given": "Bob", "family": "Green"},
                        ],
                        "published-print": {
                            "date-parts": [[2022, 3, 15]]
                        },
                        "container-title": ["Journal of Controlled Release"],
                        "URL": "https://doi.org/10.5678/crossref.test",
                        "abstract": "This paper reviews LNP delivery.",
                    }
                ]
            }
        }
        self._mock_response(crossref_data)

        from app.services.literature_providers.crossref import (
            CrossrefProvider,
        )

        async def run():
            provider = CrossrefProvider()
            return await provider.search("LNP", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert len(results) == 1
        r = results[0]
        assert r["id"] == "10.5678/crossref.test"
        assert r["title"] == "Lipid Nanoparticle Delivery Systems"
        assert r["authors"] == ["Alice Brown", "Bob Green"]
        assert r["year"] == 2022
        assert r["venue"] == "Journal of Controlled Release"
        assert r["doi"] == "10.5678/crossref.test"
        assert r["pmid"] is None
        assert r["url"] == "https://doi.org/10.5678/crossref.test"
        assert r["abstract"] == "This paper reviews LNP delivery."
        assert r["source_provider"] == "crossref"
        assert r["raw_id"] == "10.5678/crossref.test"

    def test_uses_published_online_when_print_missing(self):
        crossref_data = {
            "message": {
                "items": [
                    {
                        "DOI": "10.1234/online.only",
                        "title": ["Online First Article"],
                        "author": [],
                        "published-online": {
                            "date-parts": [[2023]]
                        },
                    }
                ]
            }
        }
        self._mock_response(crossref_data)

        from app.services.literature_providers.crossref import (
            CrossrefProvider,
        )

        async def run():
            provider = CrossrefProvider()
            return await provider.search("online", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert results[0]["year"] == 2023

    def test_uses_issued_when_no_published_date(self):
        crossref_data = {
            "message": {
                "items": [
                    {
                        "DOI": "10.1234/issued.only",
                        "title": ["Issued Only Article"],
                        "author": [],
                        "issued": {
                            "date-parts": [[2024]]
                        },
                    }
                ]
            }
        }
        self._mock_response(crossref_data)

        from app.services.literature_providers.crossref import (
            CrossrefProvider,
        )

        async def run():
            provider = CrossrefProvider()
            return await provider.search("issued", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert results[0]["year"] == 2024

    def test_maps_minimal_entry_correctly(self):
        crossref_data = {
            "message": {
                "items": [
                    {
                        "DOI": "10.1234/minimal",
                        "author": [],
                    }
                ]
            }
        }
        self._mock_response(crossref_data)

        from app.services.literature_providers.crossref import (
            CrossrefProvider,
        )

        async def run():
            provider = CrossrefProvider()
            return await provider.search("minimal", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        r = results[0]
        assert r["title"] is None
        assert r["authors"] == []
        assert r["year"] is None
        assert r["venue"] is None
        assert r["doi"] == "10.1234/minimal"
        assert r["pmid"] is None
        assert r["abstract"] is None


class TestInvalidProvider:

    def test_invalid_provider_returns_controlled_error(self):
        with patch(
            "app.services.literature_service.get_settings"
        ) as mock_settings:
            mock_settings.return_value.LITERATURE_PROVIDER = "invalid_provider"
            mock_settings.return_value.LITERATURE_SEMANTIC_SCHOLAR_API_KEY = ""

            from app.services.literature_service import LiteratureSearchService

            async def run():
                service = LiteratureSearchService()
                return await service.search("test", limit=5)

            import asyncio
            result = asyncio.get_event_loop().run_until_complete(run())

            assert result["results"] == []
            assert result["source"] == "invalid_provider"
            assert "未知的文献检索 provider" in result["error"]


class TestProviderErrorPropagation:

    def test_service_returns_error_on_provider_exception(self):
        with patch(
            "app.services.literature_service.get_settings"
        ) as mock_settings:
            mock_settings.return_value.LITERATURE_PROVIDER = "semantic_scholar"
            mock_settings.return_value.LITERATURE_SEMANTIC_SCHOLAR_API_KEY = ""

            from app.services.literature_service import LiteratureSearchService
            from app.services.literature_providers.semantic_scholar import (
                SemanticScholarProvider,
            )

            async def mock_search(self, query, limit):
                raise RuntimeError("API timeout")

            with patch.object(
                SemanticScholarProvider, "search", mock_search
            ):
                async def run():
                    service = LiteratureSearchService()
                    return await service.search("test", limit=5)

                import asyncio
                result = asyncio.get_event_loop().run_until_complete(run())

                assert result["results"] == []
                assert result["source"] == "semantic_scholar"
                assert "暂时不可用" in result["error"]