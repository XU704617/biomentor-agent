"""
Real OCR service for uploaded files.

- PDF: PyMuPDF local text extraction
- DOCX: python-docx local text extraction
- Images: EasyOCR local OCR
"""

from __future__ import annotations

import io
import os
from typing import Any

import fitz
from docx import Document


class OcrService:
    """Extract text from PDF, DOCX, images, and plain text."""

    MIME_MAP = {
        "application/pdf": "pdf",
        "image/png": "image",
        "image/jpeg": "image",
        "image/jpg": "image",
        "image/webp": "image",
        "image/bmp": "image",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "text/plain": "text",
        "text/markdown": "text",
    }

    def __init__(self):
        self._vision_model: str = ""

    def extract(self, file_bytes: bytes, mime_type: str, filename: str = "") -> dict[str, Any]:
        """Main entry: extract text from a supported file."""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        handler_type = self.MIME_MAP.get(mime_type)
        if not handler_type:
            if ext in {"pdf"}:
                handler_type = "pdf"
            elif ext in {"png", "jpg", "jpeg", "webp", "bmp"}:
                handler_type = "image"
            elif ext in {"docx"}:
                handler_type = "docx"
            elif ext in {"txt", "md"}:
                handler_type = "text"

        if handler_type == "pdf":
            text = self._extract_pdf(file_bytes)
            engine = "PyMuPDF"
        elif handler_type == "image":
            text = self._extract_image(file_bytes)
            engine = self._vision_model or "local"
        elif handler_type == "docx":
            text = self._extract_docx(file_bytes)
            engine = "python-docx"
        elif handler_type == "text":
            text = file_bytes.decode("utf-8", errors="replace")
            engine = "utf-8"
        else:
            try:
                text = file_bytes.decode("utf-8", errors="replace")
                engine = "utf-8 fallback"
            except Exception:
                return {
                    "success": False,
                    "error": f"Unsupported file type: {mime_type or 'unknown'}",
                    "text": "",
                    "engine": "none",
                    "filename": filename,
                    "char_count": 0,
                }

        text = text.strip()

        if handler_type == "image" and (
            engine in {"unavailable", "error"}
            or text.startswith("[OCR unavailable]")
            or text.startswith("[OCR failed:")
        ):
            return {
                "success": False,
                "error": text or "Image OCR failed",
                "text": "",
                "engine": engine,
                "filename": filename,
                "char_count": 0,
            }

        if len(text) > 10000:
            text = text[:10000] + "\n\n[truncated to first 10000 chars]"

        return {
            "success": True,
            "text": text,
            "engine": engine,
            "filename": filename,
            "char_count": len(text),
        }

    def _extract_pdf(self, data: bytes) -> str:
        doc = fitz.open(stream=data, filetype="pdf")
        try:
            pages = [page.get_text("text") for page in doc]
            return "\n\n".join(pages)
        finally:
            doc.close()

    def _extract_docx(self, data: bytes) -> str:
        doc = Document(io.BytesIO(data))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)

    def _extract_image(self, data: bytes) -> str:
        """Extract text from image using EasyOCR."""
        try:
            import easyocr
            import numpy as np
            from PIL import Image

            if not hasattr(self, "_easyocr_reader"):
                lang_list = [item.strip() for item in os.getenv("EASYOCR_LANG", "ch_sim,en").split(",") if item.strip()]
                self._easyocr_reader = easyocr.Reader(lang_list or ["ch_sim", "en"], gpu=False)
                self._vision_model = "EasyOCR (local)"

            img = Image.open(io.BytesIO(data))
            if img.mode in {"RGBA", "P"}:
                img = img.convert("RGB")
            arr = np.array(img)

            results = self._easyocr_reader.readtext(arr)
            if not results:
                return "[OCR no text detected]"

            lines = [text for (_, text, _) in results if str(text).strip()]
            return "\n".join(lines) if lines else "[OCR no text detected]"
        except ImportError:
            self._vision_model = "unavailable"
            return "[OCR unavailable] Missing dependencies. Run: pip install easyocr Pillow numpy"
        except Exception as exc:
            self._vision_model = "error"
            return f"[OCR failed: {exc}]"
