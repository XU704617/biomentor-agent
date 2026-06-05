"""
Backend file extraction service backed entirely by GLM.

Despite the legacy name, this service no longer uses local OCR/PDF/DOCX
libraries. Supported uploads are sent to GLM's synchronous file parser.
"""

from __future__ import annotations

from typing import Any

from app.services.glm_file_parser import GLMFileParserService


class OcrService:
    def __init__(self) -> None:
        self._parser = GLMFileParserService()

    def extract(self, file_bytes: bytes, mime_type: str, filename: str = "") -> dict[str, Any]:
        try:
            parsed = self._parser.parse_bytes(file_bytes, mime_type, filename)
        except Exception as exc:
            return {
                "success": False,
                "error": str(exc),
                "text": "",
                "engine": "glm-file-parser",
                "filename": filename,
                "char_count": 0,
            }

        text = parsed.text.strip()
        if len(text) > 20000:
            text = text[:20000] + "\n\n[truncated to first 20000 chars]"

        return {
            "success": True,
            "text": text,
            "engine": parsed.engine,
            "filename": filename,
            "char_count": len(text),
            "parsing_result_url": parsed.parsing_result_url,
        }
