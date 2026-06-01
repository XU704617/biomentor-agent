from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestPaperPdfImport:

    def test_rejects_non_pdf_upload(self):
        response = client.post(
            "/api/research/papers/import-pdf",
            files={"file": ("notes.txt", b"plain text", "text/plain")},
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Only PDF files are supported"

    def test_import_pdf_saves_file_and_creates_paper_then_delete_removes_file(self, tmp_path):
        extracted_text = (
            "Title: Engineered CAR-T cells for solid tumors\n"
            "Journal: Nature Biotechnology\n"
            "Year: 2026\n"
            "Abstract: This paper studies CAR-T optimization."
        )
        llm_payload = {
            "title": "Engineered CAR-T cells for solid tumors",
            "title_zh": "工程化 CAR-T 细胞用于实体瘤治疗",
            "direction": "CAR-T",
            "venue": "Nature Biotechnology",
            "year": 2026,
            "source_type": "学术文献",
            "keywords": ["CAR-T", "solid tumor"],
            "abstract": "This paper studies CAR-T optimization.",
            "core_problem": "How to improve CAR-T efficacy in solid tumors?",
            "method_summary": "Engineering and validation of CAR-T constructs.",
            "key_finding": "The engineered design improves persistence and tumor killing.",
            "teaching_value": "Useful for teaching CAR design and validation logic.",
            "research_value": "Provides a practical route for solid tumor CAR-T optimization.",
            "related_concepts": ["CAR-T", "tumor microenvironment"],
        }

        with (
            patch("app.services.papers.get_settings") as mock_settings,
            patch("app.services.papers.IngestionService.extract_text_from_pdf", return_value=extracted_text),
            patch("app.services.papers.get_llm") as mock_get_llm,
        ):
            mock_settings.return_value.UPLOAD_DIR = str(tmp_path)
            mock_llm = mock_get_llm.return_value
            mock_llm.available = True
            mock_llm.generate_json.return_value = llm_payload

            response = client.post(
                "/api/research/papers/import-pdf",
                files={"file": ("car-t-paper.pdf", b"%PDF-1.4 mock", "application/pdf")},
            )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == llm_payload["title"]
        assert data["title_zh"] == llm_payload["title_zh"]
        assert data["pdf_filename"] == "car-t-paper.pdf"
        assert data["pdf_text_char_count"] == len(extracted_text)

        saved_pdf = Path(data["pdf_storage_path"])
        assert saved_pdf.exists()
        assert saved_pdf.read_bytes() == b"%PDF-1.4 mock"

        delete_response = client.delete(f"/api/research/papers/{data['id']}")
        assert delete_response.status_code == 200
        assert not saved_pdf.exists()
