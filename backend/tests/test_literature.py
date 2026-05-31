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


class TestPubMedProvider:

    def test_pubmed_provider_is_registered(self):
        from app.services.literature_providers import get_provider
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = get_provider("pubmed", ncbi_api_key="test-key")
        assert provider is not None
        assert isinstance(provider, PubMedProvider)

    def test_pubmed_provider_source_name(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()
        assert provider.get_source_name() == "pubmed"


class TestPubMedMapping:

    def test_maps_pubmed_paper_correctly(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        async def run():
            with patch.object(provider, "_esearch", return_value=["12345678"]):
                with patch.object(provider, "_esummary", return_value=[{
                    "uid": "12345678",
                    "title": "mRNA Vaccine Design",
                    "authors": [
                        {"name": "Smith J", "authtype": "Author"},
                        {"name": "Doe K", "authtype": "Author"},
                    ],
                    "pubdate": "2021 Jan 15",
                    "epubdate": "2021 Jan 10",
                    "fulljournalname": "Nature Biotechnology",
                    "source": "Nat Biotechnol",
                    "articleids": [
                        {"idtype": "pubmed", "value": "12345678"},
                        {"idtype": "doi", "value": "10.1234/test.doi"},
                        {"idtype": "pmc", "value": "PMC12345678"},
                    ],
                }]):
                    return await provider.search("mRNA", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert len(results) == 1
        r = results[0]
        assert r["id"] == "12345678"
        assert r["title"] == "mRNA Vaccine Design"
        assert r["authors"] == ["Smith J", "Doe K"]
        assert r["year"] == 2021
        assert r["venue"] == "Nature Biotechnology"
        assert r["doi"] == "10.1234/test.doi"
        assert r["pmid"] == "12345678"
        assert r["url"] == "https://pubmed.ncbi.nlm.nih.gov/12345678/"
        assert r["abstract"] is None
        assert r["source_provider"] == "pubmed"
        assert r["raw_id"] == "12345678"

    def test_doi_extracted_from_articleids(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        esummary_data = {
            "uid": "99999999",
            "title": "DOI Test",
            "authors": [],
            "pubdate": "2022 Jun",
            "epubdate": "",
            "fulljournalname": "",
            "articleids": [
                {"idtype": "pubmed", "value": "99999999"},
                {"idtype": "doi", "value": "10.9999/doi.test"},
                {"idtype": "pmc", "value": "PMC99999999"},
            ],
        }

        async def run():
            with patch.object(provider, "_esearch", return_value=["99999999"]):
                with patch.object(provider, "_esummary", return_value=[esummary_data]):
                    return await provider.search("doi", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert results[0]["doi"] == "10.9999/doi.test"

    def test_year_from_pubdate_fallback_to_epubdate(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        esummary_data = {
            "uid": "11111111",
            "title": "Year Test",
            "authors": [],
            "pubdate": "",
            "epubdate": "2023 Mar 15",
            "fulljournalname": "",
            "articleids": [],
        }

        async def run():
            with patch.object(provider, "_esearch", return_value=["11111111"]):
                with patch.object(provider, "_esummary", return_value=[esummary_data]):
                    return await provider.search("year", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert results[0]["year"] == 2023

    def test_venue_from_source_when_fulljournalname_missing(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        esummary_data = {
            "uid": "22222222",
            "title": "Venue Test",
            "authors": [],
            "pubdate": "2024",
            "source": "J Biol Chem",
            "articleids": [],
        }

        async def run():
            with patch.object(provider, "_esearch", return_value=["22222222"]):
                with patch.object(provider, "_esummary", return_value=[esummary_data]):
                    return await provider.search("venue", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert results[0]["venue"] == "J Biol Chem"

    def test_missing_fields_return_null_or_empty(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        esummary_data = {
            "uid": "33333333",
            "title": None,
            "authors": [],
            "pubdate": None,
            "epubdate": None,
            "fulljournalname": None,
            "source": None,
            "articleids": None,
        }

        async def run():
            with patch.object(provider, "_esearch", return_value=["33333333"]):
                with patch.object(provider, "_esummary", return_value=[esummary_data]):
                    return await provider.search("minimal", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        r = results[0]
        assert r["title"] is None
        assert r["authors"] == []
        assert r["year"] is None
        assert r["venue"] is None
        assert r["doi"] is None
        assert r["pmid"] == "33333333"
        assert r["abstract"] is None

    def test_esearch_empty_results(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        async def run():
            with patch.object(provider, "_esearch", return_value=[]):
                return await provider.search("noresults", limit=5)

        import asyncio
        results = asyncio.get_event_loop().run_until_complete(run())

        assert results == []

    def test_esearch_error_returns_controlled_error(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        async def run():
            with patch.object(provider, "_esearch", side_effect=RuntimeError("PubMed ESearch timeout")):
                return await provider.search("error", limit=5)

        import asyncio
        with pytest.raises(RuntimeError, match="PubMed ESearch timeout"):
            asyncio.get_event_loop().run_until_complete(run())

    def test_esummary_error_returns_controlled_error(self):
        from app.services.literature_providers.pubmed import PubMedProvider

        provider = PubMedProvider()

        async def run():
            with patch.object(provider, "_esearch", return_value=["44444444"]):
                with patch.object(provider, "_esummary", side_effect=RuntimeError("PubMed ESummary failed")):
                    return await provider.search("error", limit=5)

        import asyncio
        with pytest.raises(RuntimeError, match="PubMed ESummary failed"):
            asyncio.get_event_loop().run_until_complete(run())


class TestPubMedServiceIntegration:

    def test_pubmed_provider_selected_by_env(self):
        with patch(
            "app.services.literature_service.get_settings"
        ) as mock_settings:
            mock_settings.return_value.LITERATURE_PROVIDER = "pubmed"
            mock_settings.return_value.LITERATURE_SEMANTIC_SCHOLAR_API_KEY = ""
            mock_settings.return_value.LITERATURE_NCBI_API_KEY = "test-key"
            mock_settings.return_value.LITERATURE_NCBI_TOOL = "biomentor-agent"
            mock_settings.return_value.LITERATURE_NCBI_EMAIL = ""

            from app.services.literature_service import LiteratureSearchService

            async def run():
                service = LiteratureSearchService()
                return service

            import asyncio
            service = asyncio.get_event_loop().run_until_complete(run())

            assert service._provider_name == "pubmed"
            assert service._provider is not None
            assert service._provider.get_source_name() == "pubmed"

    def test_pubmed_service_returns_error_on_provider_exception(self):
        with patch(
            "app.services.literature_service.get_settings"
        ) as mock_settings:
            mock_settings.return_value.LITERATURE_PROVIDER = "pubmed"
            mock_settings.return_value.LITERATURE_SEMANTIC_SCHOLAR_API_KEY = ""
            mock_settings.return_value.LITERATURE_NCBI_API_KEY = ""
            mock_settings.return_value.LITERATURE_NCBI_TOOL = "biomentor-agent"
            mock_settings.return_value.LITERATURE_NCBI_EMAIL = ""

            from app.services.literature_service import LiteratureSearchService
            from app.services.literature_providers.pubmed import PubMedProvider

            async def mock_search(self, query, limit):
                raise RuntimeError("NCBI API timeout")

            with patch.object(PubMedProvider, "search", mock_search):
                async def run():
                    service = LiteratureSearchService()
                    return await service.search("test", limit=5)

                import asyncio
                result = asyncio.get_event_loop().run_until_complete(run())

                assert result["results"] == []
                assert result["source"] == "pubmed"
                assert "暂时不可用" in result["error"]

    def test_pubmed_empty_results_message(self):
        with patch(
            "app.services.literature_service.get_settings"
        ) as mock_settings:
            mock_settings.return_value.LITERATURE_PROVIDER = "pubmed"
            mock_settings.return_value.LITERATURE_SEMANTIC_SCHOLAR_API_KEY = ""
            mock_settings.return_value.LITERATURE_NCBI_API_KEY = ""
            mock_settings.return_value.LITERATURE_NCBI_TOOL = "biomentor-agent"
            mock_settings.return_value.LITERATURE_NCBI_EMAIL = ""

            from app.services.literature_service import LiteratureSearchService
            from app.services.literature_providers.pubmed import PubMedProvider

            async def mock_search_empty(self, query, limit):
                return []

            with patch.object(PubMedProvider, "search", mock_search_empty):
                async def run():
                    service = LiteratureSearchService()
                    return await service.search("mRNA", limit=5)

                import asyncio
                result = asyncio.get_event_loop().run_until_complete(run())

                assert result["query"] == "mRNA"
                assert result["source"] == "pubmed"
                assert result["results"] == []
                assert result["error"] is None