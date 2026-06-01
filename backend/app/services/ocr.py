"""
Real OCR Service — Extract text from uploaded files.
- PDF: PyMuPDF (fitz) — local, no API needed
- DOCX: python-docx — local, no API needed
- Images: PIL + local OCR (DeepSeek does not support vision API)
"""

from __future__ import annotations

import base64
import io
import os
from typing import Any

import fitz  # PyMuPDF
from docx import Document


class OcrService:
    """Extract text from PDF, DOCX, and images using real tools."""

    # MIME type → handler map
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
        """Main entry: extract text from any supported file type."""
        clean_name = filename.rsplit(".", 1)[0] if filename else "untitled"
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        handler_type = self.MIME_MAP.get(mime_type)
        if not handler_type:
            # Try by extension
            if ext in ("pdf",):
                handler_type = "pdf"
            elif ext in ("png", "jpg", "jpeg", "webp", "bmp"):
                handler_type = "image"
            elif ext in ("docx",):
                handler_type = "docx"
            elif ext in ("txt", "md"):
                handler_type = "text"

        if handler_type == "pdf":
            text = self._extract_pdf(file_bytes)
            engine = "PyMuPDF"
        elif handler_type == "image":
            text = self._extract_image(file_bytes, mime_type)
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
                return {"success": False, "error": f"不支持的文件类型: {mime_type}", "text": "", "engine": "none"}

        # Truncate very long text
        if len(text) > 10000:
            text = text[:10000] + "\n\n…(内容过长，已截断前10000字符)"

        return {
            "success": True,
            "text": text.strip(),
            "engine": engine,
            "filename": filename,
            "char_count": len(text),
        }

    def _extract_pdf(self, data: bytes) -> str:
        """Extract text from PDF using PyMuPDF."""
        doc = fitz.open(stream=data, filetype="pdf")
        pages = []
        for page in doc:
            pages.append(page.get_text("text"))
        doc.close()
        return "\n\n".join(pages)

    def _extract_docx(self, data: bytes) -> str:
        """Extract text from DOCX using python-docx."""
        doc = Document(io.BytesIO(data))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)

    def _extract_image(self, data: bytes, mime_type: str) -> str:
        """Extract text from image using EasyOCR (local, no API needed).

        EasyOCR is a pure-Python OCR engine that supports Chinese + English.
        First run downloads model weights (~100MB), cached for subsequent calls.
        """
        try:
            import easyocr
            import numpy as np
            from PIL import Image

            # Lazy-init reader (singleton, cached after first init)
            if not hasattr(self, '_easyocr_reader'):
                lang_list = os.getenv("EASYOCR_LANG", "ch_sim,en").split(",")
                self._easyocr_reader = easyocr.Reader(
                    [l.strip() for l in lang_list],
                    gpu=False,
                )
                self._vision_model = "EasyOCR (local)"

            img = Image.open(io.BytesIO(data))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            arr = np.array(img)

            results = self._easyocr_reader.readtext(arr)
            if not results:
                return "[OCR 未识别到文字] 图片中可能没有文字。"

            lines = [text for (_, text, _) in results if text.strip()]
            return "\n".join(lines) if lines else "[OCR 未识别到文字]"

        except ImportError as e:
            self._vision_model = "unavailable"
            return f"[OCR 不可用] 缺少依赖。请运行: pip install easyocr Pillow numpy"
        except Exception as e:
            self._vision_model = "error"
            return f"[OCR 识别失败: {e}]"
