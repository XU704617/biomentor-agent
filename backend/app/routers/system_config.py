from __future__ import annotations

from pathlib import Path
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import get_settings
from app.services.llm import reset_llm

router = APIRouter(prefix="/api/system/llm", tags=["system-config"])


class LLMConfigView(BaseModel):
    api_key_set: bool
    api_key: str = ""
    base_url: str
    model: str


class LLMConfigUpdate(BaseModel):
    api_key: str
    base_url: str = "https://open.bigmodel.cn/api/paas/v4"
    model: str = "glm-4-flash"


class LLMTestRequest(BaseModel):
    api_key: str
    base_url: str = "https://open.bigmodel.cn/api/paas/v4"
    model: str = "glm-4-flash"


class LLMTestResponse(BaseModel):
    ok: bool
    balance_ok: bool
    chat_ok: bool
    base_url: str
    model: str
    balance: dict[str, Any] | None = None
    chat_summary: str = ""
    error: str = ""


def _normalize_base_url(base_url: str) -> str:
    clean = (base_url or "").strip().rstrip("/")
    return clean or "https://open.bigmodel.cn/api/paas/v4"


def _build_chat_completions_url(base_url: str) -> str:
    normalized = _normalize_base_url(base_url)
    if normalized.lower().endswith("/api/paas/v4"):
        return f"{normalized}/chat/completions"
    if normalized.lower().endswith("/v1"):
        return f"{normalized}/chat/completions"
    return f"{normalized}/v1/chat/completions"


def _is_glm_base_url(base_url: str) -> bool:
    return "bigmodel.cn" in (base_url or "").lower()


def _env_path() -> Path:
    return Path(__file__).resolve().parents[2] / ".env"


def _frontend_env_path() -> Path:
    return Path(__file__).resolve().parents[3] / "frontend" / ".env.local"


def _read_env_lines(path: Path) -> list[str]:
    if not path.exists():
        return []
    return path.read_text(encoding="utf-8").splitlines()


def _write_env_value(lines: list[str], key: str, value: str) -> list[str]:
    prefix = f"{key}="
    output: list[str] = []
    replaced = False
    for line in lines:
        if line.startswith(prefix):
            output.append(f"{prefix}{value}")
            replaced = True
        else:
            output.append(line)
    if not replaced:
        output.append(f"{prefix}{value}")
    return output


def _reload_runtime_config() -> None:
    get_settings.cache_clear()
    reset_llm()


def _write_backend_env(api_key: str, base_url: str, model: str) -> None:
    path = _env_path()
    lines = _read_env_lines(path)
    for key, value in (
        ("OPENAI_API_KEY", api_key),
        ("OPENAI_BASE_URL", base_url),
        ("LLM_MODEL", model),
        ("GLM_API_KEY", api_key),
        ("GLM_BASE_URL", base_url),
        ("GLM_MODEL", model),
    ):
        lines = _write_env_value(lines, key, value)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def _write_frontend_env(api_key: str, base_url: str, model: str) -> None:
    path = _frontend_env_path()
    lines = _read_env_lines(path)
    for key, value in (
        ("DEEPSEEK_API_KEY", api_key),
        ("DEEPSEEK_BASE_URL", base_url),
        ("DEEPSEEK_MODEL", model),
    ):
        lines = _write_env_value(lines, key, value)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


@router.get("/config", response_model=LLMConfigView)
def get_llm_config() -> LLMConfigView:
    settings = get_settings()
    return LLMConfigView(
        api_key_set=bool(settings.resolved_llm_api_key()),
        api_key=settings.resolved_llm_api_key(),
        base_url=settings.resolved_llm_base_url(),
        model=settings.resolved_llm_model(),
    )


@router.post("/config", response_model=LLMConfigView)
def save_llm_config(payload: LLMConfigUpdate) -> LLMConfigView:
    api_key = payload.api_key.strip()
    base_url = _normalize_base_url(payload.base_url)
    model = payload.model.strip()

    if not api_key:
        raise HTTPException(status_code=400, detail="API key is required")
    if not base_url:
        raise HTTPException(status_code=400, detail="Base URL is required")
    if not model:
        raise HTTPException(status_code=400, detail="Model is required")

    _write_backend_env(api_key, base_url, model)
    _write_frontend_env(api_key, base_url, model)
    _reload_runtime_config()

    settings = get_settings()
    return LLMConfigView(
        api_key_set=bool(settings.resolved_llm_api_key()),
        api_key=settings.resolved_llm_api_key(),
        base_url=settings.resolved_llm_base_url(),
        model=settings.resolved_llm_model(),
    )


@router.post("/test", response_model=LLMTestResponse)
def test_llm_config(payload: LLMTestRequest) -> LLMTestResponse:
    api_key = payload.api_key.strip()
    base_url = _normalize_base_url(payload.base_url)
    model = payload.model.strip()

    if not api_key:
        raise HTTPException(status_code=400, detail="API key is required")
    if not base_url:
        raise HTTPException(status_code=400, detail="Base URL is required")
    if not model:
        raise HTTPException(status_code=400, detail="Model is required")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    balance_ok = False
    chat_ok = False
    balance_data: dict[str, Any] | None = None
    chat_summary = ""
    errors: list[str] = []

    with httpx.Client(timeout=30.0, trust_env=False) as client:
        if _is_glm_base_url(base_url):
            balance_data = {
                "supported": False,
                "message": "GLM 当前未公开余额查询接口，已跳过余额测试。",
            }
        else:
            try:
                balance_res = client.get(f"{base_url}/user/balance", headers=headers)
                balance_res.raise_for_status()
                balance_data = balance_res.json()
                balance_ok = True
            except Exception as exc:
                errors.append(f"balance: {exc}")

        try:
            chat_res = client.post(
                _build_chat_completions_url(base_url),
                headers=headers,
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": "Reply with pong."}],
                    "temperature": 0,
                    "max_tokens": 8,
                },
            )
            if chat_res.status_code == 429:
                chat_ok = True
                chat_summary = "Provider returned 429. The key, base URL, and model path are reachable, but the account is currently rate-limited or quota-limited."
            else:
                chat_res.raise_for_status()
                chat_json = chat_res.json()
                chat_summary = (
                    (((chat_json.get("choices") or [{}])[0]).get("message") or {}).get("content") or ""
                ).strip()
                chat_ok = True
        except Exception as exc:
            errors.append(f"chat: {exc}")

    return LLMTestResponse(
        ok=chat_ok,
        balance_ok=balance_ok,
        chat_ok=chat_ok,
        base_url=base_url,
        model=model,
        balance=balance_data,
        chat_summary=chat_summary,
        error="; ".join(errors),
    )
