from __future__ import annotations

import io
import os
from dataclasses import dataclass
from pathlib import Path

import httpx

from app.config import get_settings


@dataclass
class ParsedFileResult:
    text: str
    engine: str
    parsing_result_url: str = ""


class GLMFileParserService:
    MIME_TO_TYPE = {
        "application/msword": "doc",
        "application/pdf": "pdf",
        "application/vnd.ms-excel": "xls",
        "application/vnd.ms-powerpoint": "ppt",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
        "text/csv": "csv",
        "text/html": "html",
        "text/plain": "txt",
        "text/markdown": "md",
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/webp": "webp",
        "image/bmp": "bmp",
        "image/gif": "gif",
        "image/heic": "heic",
        "image/heif": "heif",
        "image/tiff": "tiff",
        "image/x-icon": "icns",
        "image/jp2": "jp2",
        "image/x-pcx": "pcx",
        "image/x-portable-pixmap": "ppm",
        "image/x-xbitmap": "xbm",
        "application/postscript": "eps",
        "application/vnd.ms-works": "wps",
    }

    EXT_TO_TYPE = {
        ".doc": "doc",
        ".pdf": "pdf",
        ".docx": "docx",
        ".ppt": "ppt",
        ".pptx": "pptx",
        ".xls": "xls",
        ".xlsx": "xlsx",
        ".csv": "csv",
        ".html": "html",
        ".htm": "html",
        ".txt": "txt",
        ".md": "md",
        ".wps": "wps",
        ".png": "png",
        ".jpg": "jpg",
        ".jpeg": "jpg",
        ".webp": "webp",
        ".bmp": "bmp",
        ".gif": "gif",
        ".heic": "heic",
        ".heif": "heif",
        ".eps": "eps",
        ".icns": "icns",
        ".im": "im",
        ".pcx": "pcx",
        ".ppm": "ppm",
        ".tif": "tiff",
        ".tiff": "tiff",
        ".xbm": "xbm",
        ".jp2": "jp2",
    }

    def __init__(self) -> None:
        self.settings = get_settings()
        self.api_key = self.settings.resolved_llm_api_key()
        self.base_url = self.settings.resolved_llm_base_url().rstrip("/")
        self.timeout = self.settings.GLM_FILE_PARSER_TIMEOUT_SECONDS
        self.tool_type = self.settings.GLM_FILE_PARSER_TOOL or "prime-sync"

    @property
    def available(self) -> bool:
        return bool(self.api_key)

    def parse_bytes(self, file_bytes: bytes, mime_type: str, filename: str = "") -> ParsedFileResult:
        if not self.available:
            raise RuntimeError("GLM API key is not configured")
        if not file_bytes:
            raise RuntimeError("Uploaded file is empty")

        file_type = self._resolve_file_type(mime_type, filename)
        if not file_type:
            raise RuntimeError(f"GLM file parser does not support: {mime_type or filename or 'unknown file'}")

        files = {
            "file": (filename or f"upload.{file_type}", io.BytesIO(file_bytes), mime_type or "application/octet-stream"),
        }
        data = {
            "tool_type": self.tool_type,
            "file_type": file_type,
        }
        headers = {"Authorization": f"Bearer {self.api_key}"}

        try:
            with httpx.Client(timeout=self.timeout, trust_env=False) as client:
                response = client.post(
                    f"{self.base_url}/files/parser/sync",
                    headers=headers,
                    files=files,
                    data=data,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:500]
            raise RuntimeError(f"GLM file parser failed: HTTP {exc.response.status_code} {detail}") from exc
        except httpx.TimeoutException as exc:
            raise RuntimeError("GLM file parser timed out") from exc
        except httpx.HTTPError as exc:
            raise RuntimeError(f"GLM file parser request failed: {exc}") from exc

        payload = response.json()
        if str(payload.get("status", "")).strip().lower() == "failed":
            message = str(payload.get("message", "") or payload.get("detail", "")).strip()
            if message:
                raise RuntimeError(f"GLM file parser failed: {message}")

        text = str(payload.get("content", "") or "").strip()
        if not text:
            message = str(payload.get("message", "") or payload.get("detail", "")).strip()
            if message:
                raise RuntimeError(f"GLM file parser returned empty content: {message}")
            raise RuntimeError("GLM file parser returned empty content")

        return ParsedFileResult(
            text=text,
            engine=f"glm-file-parser:{self.tool_type}",
            parsing_result_url=str(payload.get("parsing_result_url", "") or "").strip(),
        )

    def parse_path(self, file_path: str, mime_type: str = "") -> ParsedFileResult:
        path = Path(file_path)
        guessed_mime = mime_type or self._guess_mime_type(path.name)
        return self.parse_bytes(path.read_bytes(), guessed_mime, path.name)

    def _resolve_file_type(self, mime_type: str, filename: str) -> str:
        mime = (mime_type or "").strip().lower()
        if mime in self.MIME_TO_TYPE:
            return self.MIME_TO_TYPE[mime]

        ext = os.path.splitext(filename or "")[1].lower()
        return self.EXT_TO_TYPE.get(ext, "")

    def _guess_mime_type(self, filename: str) -> str:
        ext = os.path.splitext(filename or "")[1].lower()
        for mime, file_type in self.MIME_TO_TYPE.items():
            if self.EXT_TO_TYPE.get(ext) == file_type:
                return mime
        return "application/octet-stream"
