"""
Query normalization and builder for literature search.

Ensures that PubMed / literature providers receive English keywords
rather than long Chinese sentences.

Priority:
1. recommended_keywords / keywords (if available)
2. case_title / case keywords
3. English keywords extracted from task_title / query
4. Fallback to original query (only if it is not a Chinese long sentence)
"""

from __future__ import annotations

import re
from typing import Any


def _is_chinese_heavy(text: str, threshold: float = 0.3) -> bool:
    """Return True if the text has mostly Chinese characters or CJK punctuation."""
    if not text:
        return False
    cjk_ranges = [
        ("\u4e00", "\u9fff"),
        ("\u3000", "\u303f"),
        ("\uff00", "\uffef"),
    ]
    cjk_count = 0
    for ch in text:
        for start, end in cjk_ranges:
            if start <= ch <= end:
                cjk_count += 1
                break
    total_alpha = sum(1 for ch in text if ch.isalpha())
    if total_alpha == 0:
        return cjk_count > 0
    return cjk_count / total_alpha > threshold


def _extract_english_words(text: str) -> list[str]:
    """Extract consecutive ASCII word tokens from text."""
    return re.findall(r"[A-Za-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)*", text)


def _dedupe_preserve_order(tokens: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for t in tokens:
        low = t.lower()
        if low not in seen:
            seen.add(low)
            out.append(t)
    return out


def _filter_stopwords(tokens: list[str]) -> list[str]:
    """Remove common English stopwords that are poor literature search terms."""
    stops = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "can", "that", "this", "these",
        "those", "it", "its", "how", "what", "when", "where", "which", "who",
        "why", "not", "no", "as", "so", "if", "into", "about", "than",
        "then", "also", "very", "just", "up", "out", "over", "under",
    }
    return [t for t in tokens if t.lower() not in stops]


def _normalize_task_title(task_title: str) -> str:
    """Extract English keywords from a task_title (possibly Chinese)."""
    tokens = _extract_english_words(task_title)
    tokens = _filter_stopwords(tokens)
    tokens = _dedupe_preserve_order(tokens)
    return " ".join(tokens)


def _extract_keywords_list(data: dict | None, *keys: str) -> list[str]:
    """Safely extract a list of keywords from a dict under several key names."""
    if not data:
        return []
    for k in keys:
        v = data.get(k)
        if isinstance(v, list) and v:
            return [str(x).strip() for x in v if str(x).strip()]
    return []


def _format_search_phrase(token: str) -> str:
    value = str(token or "").strip()
    if not value:
        return ""
    if " " in value and not value.startswith('"') and not value.endswith('"'):
        return f'"{value}"'
    return value


def build_literature_search_query(
    query: str | None = None,
    task_title: str | None = None,
    task_description: str | None = None,
    case_title: str | None = None,
    case: dict[str, Any] | None = None,
    task: dict[str, Any] | None = None,
) -> str:
    """
    Build a literature-friendly English keyword search query.

    Priority:
    0. Explicit non-Chinese user query (respects backward compatibility)
    1. recommended_keywords from task or case
    2. English keywords from task_title / case_title
    3. English keywords extracted from raw query (if Chinese-heavy)
    4. Fallback to cleaned query or task_title
    """
    # Priority 0: explicit user query (if not Chinese-heavy) - backward compat
    if query and query.strip():
        if not _is_chinese_heavy(query):
            return query.strip()

    # Priority 1: recommended_keywords from task / case
    task_kw = _extract_keywords_list(task, "recommended_keywords", "keywords", "suggested_keywords")
    case_kw = _extract_keywords_list(case, "recommended_keywords", "keywords")
    all_keywords = task_kw + case_kw
    if all_keywords:
        deduped = _dedupe_preserve_order(all_keywords)
        return " ".join(_format_search_phrase(item) for item in deduped if _format_search_phrase(item))

    parts: list[str] = []

    # Priority 2: task_title English keywords
    if task_title and task_title.strip():
        normalized = _normalize_task_title(task_title.strip())
        if normalized:
            parts.append(normalized)

    # Priority 2b: case_title English keywords
    if case_title and case_title.strip():
        normalized = _normalize_task_title(case_title.strip())
        if normalized and normalized.lower() not in [p.lower() for p in parts]:
            parts.append(normalized)

    # Priority 3: English keywords from raw query (if Chinese-heavy)
    if query and query.strip():
        if _is_chinese_heavy(query):
            extracted = _extract_english_words(query)
            extracted = _filter_stopwords(extracted)
            extracted = _dedupe_preserve_order(extracted)
            if extracted:
                extracted_joined = " ".join(extracted)
                if extracted_joined.lower() not in [p.lower() for p in parts]:
                    parts.append(extracted_joined)

    if parts:
        return " ".join(parts)

    # Priority 4: fallback to query or task_title as-is
    if query and query.strip():
        return query.strip()
    if task_title and task_title.strip():
        return task_title.strip()
    return ""


def normalize_literature_query(query: str) -> str:
    """
    Normalize a single raw query string for literature search.

    If the query is Chinese-heavy, extract English keywords.
    Otherwise return the query trimmed and cleaned.
    """
    if not query or not query.strip():
        return ""

    query = query.strip()

    if _is_chinese_heavy(query):
        tokens = _extract_english_words(query)
        tokens = _filter_stopwords(tokens)
        tokens = _dedupe_preserve_order(tokens)
        if tokens:
            return " ".join(tokens)

    return query
