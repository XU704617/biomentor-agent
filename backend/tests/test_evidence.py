import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestEvidenceSearchNotConfigured:

    def test_not_configured_returns_empty_results(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "mRNA vaccine delivery strategy",
                "task_description": None,
                "case_title": "mRNA vaccine",
                "limit": 5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "mRNA vaccine delivery strategy mRNA vaccine"
        assert data["source"] == "not_configured"
        assert data["task_title"] == "mRNA vaccine delivery strategy"
        assert data["results"] == []
        assert data["error"] is None

    def test_not_configured_returns_expected_fields_structure(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "test task",
                "limit": 5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "source" in data
        assert "task_title" in data
        assert "results" in data
        assert "message" in data
        assert "error" in data
        assert isinstance(data["results"], list)


class TestEvidenceSearchQueryPriority:

    def test_explicit_query_is_used(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "mRNA vaccine delivery",
                "case_title": "mRNA vaccine",
                "query": "lipid nanoparticle LNP",
                "limit": 5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "lipid nanoparticle LNP"

    def test_no_query_generates_from_task_and_case(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "CRISPR knock-in",
                "case_title": "Gene editing",
                "limit": 5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "CRISPR knock-in Gene editing"

    def test_no_query_and_no_case_uses_task_only(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "Single cell sequencing",
                "limit": 5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "Single cell sequencing"

    def test_empty_query_falls_back_to_task(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "Protein folding",
                "query": "",
                "limit": 5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "Protein folding"

    def test_whitespace_only_query_falls_back(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "Drug repurposing",
                "query": "   ",
                "limit": 5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "Drug repurposing"


class TestEvidenceSearchLimitBounds:

    def test_limit_zero_is_rejected(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "test",
                "limit": 0,
            },
        )
        assert response.status_code == 422

    def test_limit_above_20_is_rejected(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "test",
                "limit": 21,
            },
        )
        assert response.status_code == 422

    def test_limit_1_is_accepted(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "test",
                "limit": 1,
            },
        )
        assert response.status_code == 200

    def test_limit_20_is_accepted(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "test",
                "limit": 20,
            },
        )
        assert response.status_code == 200

    def test_missing_task_title_is_rejected(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "limit": 5,
            },
        )
        assert response.status_code == 422


class TestEvidenceNoteStructuredNote:

    def test_generates_note_from_selected_literature(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "mRNA vaccine delivery",
                "task_description": None,
                "selected_literature": [
                    {
                        "id": "12345",
                        "title": "LNP-mRNA Vaccine Design",
                        "authors": ["Smith J", "Doe K"],
                        "year": 2023,
                        "venue": "Nature Biotechnology",
                        "doi": "10.1234/test.doi",
                        "pmid": "12345678",
                        "url": "https://pubmed.ncbi.nlm.nih.gov/12345678/",
                        "source_provider": "pubmed",
                    },
                    {
                        "id": "67890",
                        "title": "mRNA Stability Engineering",
                        "authors": ["Chen L", "Wong M"],
                        "year": 2024,
                        "venue": "Mol Ther",
                        "doi": "10.5678/another.doi",
                        "pmid": "87654321",
                        "url": "https://pubmed.ncbi.nlm.nih.gov/87654321/",
                        "source_provider": "pubmed",
                    },
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["task_title"] == "mRNA vaccine delivery"
        assert data["selected_count"] == 2
        assert "evidence_note" in data
        note = data["evidence_note"]
        assert "summary" in note
        assert "已选择 2 篇文献" in note["summary"]
        assert "references" in note
        assert len(note["references"]) == 2
        assert note["references"][0]["title"] == "LNP-mRNA Vaccine Design"
        assert note["references"][0]["authors"] == ["Smith J", "Doe K"]
        assert note["references"][0]["year"] == 2023
        assert note["references"][0]["doi"] == "10.1234/test.doi"
        assert note["references"][0]["pmid"] == "12345678"
        assert note["references"][0]["source_provider"] == "pubmed"
        assert "limitations" in note
        assert len(note["limitations"]) == 3


class TestEvidenceNoteNoFabrication:

    def test_note_preserves_null_fields(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "Unknown topic",
                "selected_literature": [
                    {
                        "title": None,
                        "authors": [],
                        "year": None,
                        "venue": None,
                        "doi": None,
                        "pmid": None,
                        "url": None,
                        "source_provider": "",
                    },
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        note = data["evidence_note"]
        ref = note["references"][0]
        assert ref["title"] is None
        assert ref["authors"] == []
        assert ref["year"] is None
        assert ref["venue"] is None
        assert ref["doi"] is None
        assert ref["pmid"] is None
        assert ref["url"] is None
        assert ref["source_provider"] == ""

    def test_note_does_not_add_fields(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "test",
                "selected_literature": [
                    {
                        "title": "Some Paper",
                        "authors": ["Author A"],
                        "year": 2022,
                        "source_provider": "crossref",
                    },
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        ref = data["evidence_note"]["references"][0]
        assert ref["title"] == "Some Paper"
        assert ref["authors"] == ["Author A"]
        assert ref["year"] == 2022
        assert ref["source_provider"] == "crossref"
        assert ref["doi"] is None
        assert ref["pmid"] is None
        assert ref["url"] is None
        assert ref["venue"] is None


class TestEvidenceNoteLimitations:

    def test_note_includes_required_limitations(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "test",
                "selected_literature": [],
            },
        )
        assert response.status_code == 200
        limitations = response.json()["evidence_note"]["limitations"]
        assert any("全文解析" in lim for lim in limitations)
        assert any("证据强度判断" in lim for lim in limitations)
        assert any("缺失字段" in lim for lim in limitations)


class TestEvidenceNoteEmptyLiterature:

    def test_empty_selected_literature_returns_controlled_result(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "test task",
                "selected_literature": [],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["selected_count"] == 0
        assert data["evidence_note"]["references"] == []
        assert "已选择 0 篇文献" in data["evidence_note"]["summary"]
        assert data["error"] is None

    def test_missing_selected_literature_field_is_ok(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "test",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["selected_count"] == 0
        assert data["evidence_note"]["references"] == []

    def test_single_entry_returns_correct_count(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "test",
                "selected_literature": [
                    {
                        "title": "Single paper",
                        "authors": ["Author X"],
                        "year": 2025,
                        "source_provider": "semantic_scholar",
                    },
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["selected_count"] == 1
        assert "已选择 1 篇文献" in data["evidence_note"]["summary"]


class TestEvidenceNoteMissingTaskTitle:

    def test_missing_task_title_is_rejected(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "selected_literature": [],
            },
        )
        assert response.status_code == 422


class TestLiteratureTestsStillWork:

    def test_literature_search_unchanged(self):
        response = client.get("/api/literature/search?q=mRNA&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["source"] == "not_configured"
        assert data["results"] == []

    def test_literature_search_with_limit(self):
        response = client.get("/api/literature/search?q=test&limit=3")
        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "test"


class TestEvidenceResponseSchemaFields:

    def test_search_response_has_expected_fields(self):
        response = client.post(
            "/api/evidence/search",
            json={
                "task_title": "mRNA vaccine",
                "query": "mRNA",
                "limit": 3,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert set(data.keys()) == {
            "query", "source", "task_title", "results", "message", "error"
        }

    def test_note_response_has_expected_fields(self):
        response = client.post(
            "/api/evidence/note",
            json={
                "task_title": "test",
                "selected_literature": [
                    {
                        "title": "test paper",
                        "authors": ["Author"],
                        "year": 2023,
                        "source_provider": "pubmed",
                    }
                ],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert set(data.keys()) == {
            "task_title", "selected_count", "evidence_note", "message", "error"
        }
        note = data["evidence_note"]
        assert set(note.keys()) == {"summary", "references", "limitations"}