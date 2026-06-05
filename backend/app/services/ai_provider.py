from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import get_settings


AI_ERROR_TYPES = {
    "not_configured",
    "auth_error",
    "insufficient_balance",
    "rate_limited",
    "timeout",
    "network_error",
    "invalid_json",
    "schema_invalid",
    "unknown_error",
}


@dataclass
class AIResult:
    success: bool
    content: dict | None
    error_type: str | None
    source_mode: str
    raw_text: str | None = None


class GLMAIProvider:
    """Small OpenAI-compatible GLM client with defensive error mapping."""

    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.resolved_llm_api_key()
        self.base_url = settings.resolved_llm_base_url().rstrip("/")
        self.model = settings.resolved_llm_model() or "glm-4.7-flash"
        self.timeout = settings.GLM_TIMEOUT_SECONDS

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        required_fields: list[str],
        temperature: float = 0.2,
    ) -> AIResult:
        if not self.api_key:
            return AIResult(False, None, "not_configured", "local_fallback")

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout, trust_env=False) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
        except httpx.TimeoutException:
            return AIResult(False, None, "timeout", "local_fallback")
        except httpx.NetworkError:
            return AIResult(False, None, "network_error", "local_fallback")
        except httpx.HTTPError:
            return AIResult(False, None, "network_error", "local_fallback")
        except Exception:
            return AIResult(False, None, "unknown_error", "local_fallback")

        if response.status_code in (401, 403):
            return AIResult(False, None, "auth_error", "local_fallback", response.text[:1000])
        if response.status_code == 402 or _looks_like_balance_error(response.text):
            return AIResult(False, None, "insufficient_balance", "local_fallback", response.text[:1000])
        if response.status_code == 429:
            return AIResult(False, None, "rate_limited", "local_fallback", response.text[:1000])
        if response.status_code >= 400:
            return AIResult(False, None, "unknown_error", "local_fallback", response.text[:1000])

        try:
            data = response.json()
            raw_text = data["choices"][0]["message"]["content"]
        except Exception:
            return AIResult(False, None, "invalid_json", "local_fallback", response.text[:1000])

        try:
            parsed = _extract_json_object(raw_text)
        except Exception:
            return AIResult(False, None, "invalid_json", "local_fallback", raw_text[:2000])

        if not _has_required_fields(parsed, required_fields):
            return AIResult(False, parsed, "schema_invalid", "local_fallback", raw_text[:2000])

        return AIResult(True, parsed, None, "ai_grounded", raw_text)


def _looks_like_balance_error(text: str) -> bool:
    lowered = (text or "").lower()
    return any(token in lowered for token in ("insufficient balance", "balance", "quota"))


def _extract_json_object(text: str) -> dict[str, Any]:
    raw = (text or "").strip()
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:].strip()
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start < 0 or end <= start:
            raise
        parsed = json.loads(raw[start : end + 1])
    if not isinstance(parsed, dict):
        raise ValueError("JSON root must be an object")
    return parsed


def _has_required_fields(value: dict[str, Any], required_fields: list[str]) -> bool:
    for field in required_fields:
        if field not in value:
            return False
        item = value[field]
        if item is None:
            return False
        if isinstance(item, str) and not item.strip():
            return False
        if isinstance(item, list) and len(item) == 0:
            return False
    return True
