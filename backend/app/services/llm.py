"""
LLM Service - DeepSeek chat client with structured output, retry, and streaming.
"""

from __future__ import annotations

import json
import os
import re
import time
from dataclasses import dataclass
from typing import Any

import httpx

from app.config import get_settings


@dataclass
class LLMResponse:
    content: str
    parsed: dict[str, Any] | None = None
    model: str = ""
    tokens_prompt: int = 0
    tokens_completion: int = 0
    tokens_total: int = 0
    duration_ms: int = 0
    finish_reason: str = "stop"


class LLMService:

    def __init__(self):
        self._clients: list[tuple[str, httpx.Client]] | None = None
        self._http_clients: list[httpx.Client] = []

    @property
    def settings(self):
        return get_settings()

    @property
    def clients(self) -> list[tuple[str, httpx.Client]]:
        if self._clients is None:
            self._clients = []
            self._http_clients = []
            for proxy_url in self._resolve_proxy_urls():
                label = proxy_url or "direct"
                http_client_kwargs: dict[str, Any] = {
                    "trust_env": False,
                    "timeout": self.settings.AGENT_TIMEOUT_SECONDS,
                }
                if proxy_url:
                    http_client_kwargs["proxy"] = proxy_url
                http_client = httpx.Client(**http_client_kwargs)
                self._http_clients.append(http_client)
                self._clients.append((label, http_client))
        return self._clients

    @property
    def available(self) -> bool:
        return bool(self.settings.DEEPSEEK_API_KEY)

    @property
    def is_deepseek(self) -> bool:
        return "deepseek" in (self.settings.DEEPSEEK_BASE_URL or "").lower()

    # ── Chat Completion ──────────────────────────────────────────

    def chat(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        response_schema: dict | None = None,
        retries: int | None = None,
    ) -> LLMResponse:
        model = model or self.settings.LLM_MODEL
        temperature = temperature if temperature is not None else self.settings.LLM_TEMPERATURE
        max_tokens = max_tokens or self.settings.LLM_MAX_TOKENS
        max_retries = retries if retries is not None else self.settings.AGENT_MAX_RETRIES

        if not self.available:
            return self._fallback_response(messages)

        # Inject JSON output instructions for providers without strict mode.
        # Use natural language to describe expected fields, NOT a raw JSON schema,
        # otherwise DeepSeek may echo the schema back instead of filling it.
        if response_schema:
            props = response_schema.get("properties", {})
            required = response_schema.get("required", [])
            field_descs = []
            for name, prop in props.items():
                ptype = prop.get("type", "string")
                is_array = "array of " if ptype == "array" else ""
                item_type = ""
                if ptype == "array" and "items" in prop:
                    item_type = prop["items"].get("type", "string")
                desc = f'- "{name}": {is_array}{item_type or ptype}'
                if name in required:
                    desc += " (必填)"
                field_descs.append(desc)

            schema_prompt = (
                "\n\n你必须输出一个纯 JSON 对象，不要包含 markdown 代码块标记。"
                "JSON 必须包含以下字段：\n" + "\n".join(field_descs) +
                "\n\n直接输出 JSON，不要输出任何其他内容。"
            )
            if messages and messages[0]["role"] == "system":
                messages[0]["content"] += schema_prompt
            else:
                messages.insert(0, {"role": "system", "content": schema_prompt.strip()})

        start = time.time()

        kwargs: dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if response_schema:
            kwargs["response_format"] = {"type": "json_object"}

        last_error: Exception | None = None
        for attempt in range(max_retries + 1):
            for client_label, client in self.clients:
                try:
                    response = client.post(
                        self._chat_url(),
                        headers=self._headers(),
                        json=kwargs,
                    )
                    response.raise_for_status()
                    completion = response.json()
                    elapsed = int((time.time() - start) * 1000)

                    choice = (completion.get("choices") or [{}])[0]
                    message = choice.get("message") or {}
                    content = message.get("content") or ""
                    usage = completion.get("usage") or {}

                    parsed = None
                    if response_schema:
                        parsed = self._extract_json(content)

                    return LLMResponse(
                        content=content,
                        parsed=parsed,
                        model=completion.get("model") or model,
                        tokens_prompt=usage.get("prompt_tokens") or 0,
                        tokens_completion=usage.get("completion_tokens") or 0,
                        tokens_total=usage.get("total_tokens") or 0,
                        duration_ms=elapsed,
                        finish_reason=choice.get("finish_reason") or "stop",
                    )

                except Exception as e:
                    last_error = RuntimeError(f"[{client_label}] {e}")
                    continue

            if attempt < max_retries:
                time.sleep(2 ** attempt)

        raise RuntimeError(f"LLM call failed after {max_retries + 1} attempts: {last_error}")

    # ── Streaming ─────────────────────────────────────────────────

    def chat_stream(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ):
        model = model or self.settings.LLM_MODEL
        temperature = temperature if temperature is not None else self.settings.LLM_TEMPERATURE
        max_tokens = max_tokens or self.settings.LLM_MAX_TOKENS

        if not self.available:
            yield "AI 服务暂未配置。请设置 DEEPSEEK_API_KEY。"
            return

        try:
            last_error: Exception | None = None
            for _client_label, client in self.clients:
                try:
                    payload = {
                        "model": model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                        "stream": True,
                    }
                    with client.stream("POST", self._chat_url(), headers=self._headers(), json=payload) as stream:
                        stream.raise_for_status()
                        for line in stream.iter_lines():
                            if not line:
                                continue
                            data = line.removeprefix("data: ").strip()
                            if data == "[DONE]":
                                return
                            try:
                                chunk = json.loads(data)
                            except json.JSONDecodeError:
                                continue
                            choice = (chunk.get("choices") or [{}])[0]
                            delta = choice.get("delta") or {}
                            if delta.get("content"):
                                yield delta["content"]
                    return
                except Exception as e:
                    last_error = e
                    continue
            if last_error is not None:
                raise last_error
        except Exception as e:
            yield f"\n[错误: {e}]"

    # ── Embeddings ────────────────────────────────────────────────

    def embed(self, texts: list[str], model: str | None = None) -> list[list[float]]:
        """DeepSeek does not provide an Embedding API.

        Returns empty list to signal callers to use ChromaDB's built-in
        embedding function (all-MiniLM-L6-v2, runs locally via ONNX).
        """
        return []

    def embed_single(self, text: str, model: str | None = None) -> list[float]:
        return self.embed([text], model)[0]

    # ── Convenience Methods ───────────────────────────────────────

    def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: dict,
        model: str | None = None,
        temperature: float = 0.2,
    ) -> dict[str, Any]:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        response = self.chat(messages=messages, model=model, temperature=temperature, response_schema=schema)
        return response.parsed or {}

    def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> LLMResponse:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        return self.chat(messages=messages, model=model, temperature=temperature, max_tokens=max_tokens)

    def generate_json_from_file(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: dict,
        file_bytes: bytes,
        filename: str,
        model: str | None = None,
        temperature: float = 0.2,
        max_output_tokens: int | None = None,
    ) -> dict[str, Any]:
        model = model or self.settings.LLM_MODEL
        max_output_tokens = max_output_tokens or self.settings.LLM_MAX_TOKENS
        max_retries = self.settings.AGENT_MAX_RETRIES

        if not self.available:
            return {}

        props = schema.get("properties", {})
        required = schema.get("required", [])
        field_descs = []
        for name, prop in props.items():
            ptype = prop.get("type", "string")
            is_array = "array of " if ptype == "array" else ""
            item_type = ""
            if ptype == "array" and "items" in prop:
                item_type = prop["items"].get("type", "string")
            desc = f'- "{name}": {is_array}{item_type or ptype}'
            if name in required:
                desc += " (必填)"
            field_descs.append(desc)

        instructions = (
            f"{system_prompt}\n\n"
            "你必须输出一个纯 JSON 对象，不要包含 markdown 代码块标记。\n"
            "JSON 必须包含以下字段：\n"
            + "\n".join(field_descs)
            + "\n\n直接输出 JSON，不要输出任何其他内容。"
        )

        last_error: Exception | None = None
        for attempt in range(max_retries + 1):
            start = time.time()
            for client_label, client in self.clients:
                try:
                    response = client.post(
                        self._chat_url(),
                        headers=self._headers(),
                        json={
                            "model": model,
                            "messages": [
                                {"role": "system", "content": instructions},
                                {
                                    "role": "user",
                                    "content": (
                                        f"{user_prompt}\n\n"
                                        f"附件名称：{filename or 'document.pdf'}\n"
                                        "当前接口仅接收文本提示；如需解析 PDF/DOCX/PPT，请先提取正文后再提交。"
                                    ),
                                },
                            ],
                            "temperature": temperature,
                            "max_tokens": max_output_tokens,
                            "response_format": {"type": "json_object"},
                        },
                    )
                    response.raise_for_status()
                    data = response.json()
                    _elapsed = int((time.time() - start) * 1000)
                    choice = (data.get("choices") or [{}])[0]
                    message = choice.get("message") or {}
                    parsed = self._extract_json(message.get("content") or "")
                    if parsed:
                        return parsed
                    last_error = RuntimeError(f"[{client_label}] empty or invalid JSON from file response")
                except Exception as e:
                    last_error = RuntimeError(f"[{client_label}] {e}")
                    continue

            if attempt < max_retries:
                time.sleep(2 ** attempt)

        raise RuntimeError(f"LLM file call failed after {max_retries + 1} attempts: {last_error}")

    # ── Helpers ───────────────────────────────────────────────────

    def _extract_json(self, text: str) -> dict[str, Any]:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        match = re.search(r'```(?:json)?\s*([\s\S]*?)```', text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
        return {}

    def _chat_url(self) -> str:
        base = (self.settings.DEEPSEEK_BASE_URL or "https://api.deepseek.com/v1").strip().rstrip("/")
        if base.endswith("/chat/completions"):
            return base
        if base.endswith("/v1"):
            return f"{base}/chat/completions"
        return f"{base}/v1/chat/completions"

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.settings.DEEPSEEK_API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

    def _fallback_response(self, messages: list[dict[str, str]]) -> LLMResponse:
        return LLMResponse(
            content=json.dumps({"message": "AI 服务未配置", "fallback": True}, ensure_ascii=False),
            parsed={"message": "AI 服务未配置", "fallback": True},
            model="fallback", tokens_total=0,
        )

    def _resolve_proxy_urls(self) -> list[str | None]:
        candidates: list[str | None] = []

        for key in ("HTTPS_PROXY", "ALL_PROXY", "HTTP_PROXY"):
            proxy_url = self._normalize_proxy_url(os.getenv(key, ""))
            if proxy_url:
                candidates.append(proxy_url)

        system_proxy = self._load_windows_proxy()
        if system_proxy:
            candidates.append(system_proxy)

        candidates.append(None)

        deduped: list[str | None] = []
        seen: set[str] = set()
        for candidate in candidates:
            marker = candidate or "__direct__"
            if marker in seen:
                continue
            seen.add(marker)
            deduped.append(candidate)
        return deduped

    def _normalize_proxy_url(self, proxy_url: str) -> str | None:
        value = proxy_url.strip()
        if not value:
            return None

        lowered = value.lower()
        if lowered in {
            "http://127.0.0.1:9",
            "https://127.0.0.1:9",
            "127.0.0.1:9",
            "http://localhost:9",
            "https://localhost:9",
            "localhost:9",
        }:
            return None

        if "://" not in value:
            return f"http://{value}"
        return value

    def _load_windows_proxy(self) -> str | None:
        if os.name != "nt":
            return None

        try:
            import winreg

            with winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\CurrentVersion\Internet Settings",
            ) as key:
                proxy_enabled = int(winreg.QueryValueEx(key, "ProxyEnable")[0] or 0)
                if proxy_enabled != 1:
                    return None
                raw_proxy = str(winreg.QueryValueEx(key, "ProxyServer")[0] or "").strip()
        except Exception:
            return None

        if not raw_proxy:
            return None

        if "=" in raw_proxy:
            pairs = {}
            for item in raw_proxy.split(";"):
                if "=" not in item:
                    continue
                scheme, address = item.split("=", 1)
                pairs[scheme.strip().lower()] = address.strip()
            raw_proxy = pairs.get("https") or pairs.get("http") or ""

        return self._normalize_proxy_url(raw_proxy)


_llm_instance: LLMService | None = None


def get_llm() -> LLMService:
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = LLMService()
    return _llm_instance


def reset_llm() -> None:
    global _llm_instance
    if _llm_instance is not None:
        for client in _llm_instance._http_clients:
            try:
                client.close()
            except Exception:
                pass
    _llm_instance = None
