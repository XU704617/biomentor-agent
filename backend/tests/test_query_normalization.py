"""
Tests for query normalization and literature search query builder.

Ensures that:
1. Chinese long queries are normalized to English keywords
2. mRNA / PET / CAR-T / venetoclax demo cases form proper English queries
3. Empty keywords fallback without error
4. No fabrication of fields
5. Backward compatibility with existing API contracts
"""

import pytest

from app.services.query_builder import (
    build_literature_search_query,
    normalize_literature_query,
    _is_chinese_heavy,
    _extract_english_words,
    _filter_stopwords,
)
from app.services.evidence_service import EvidenceService


class TestIsChineseHeavy:

    def test_pure_chinese(self):
        assert _is_chinese_heavy("如何把不稳定易降解的mRNA递送进细胞") is True

    def test_chinese_with_few_english(self):
        assert _is_chinese_heavy(
            "如何把不稳定易降解的mRNA安全递送进细胞"
        ) is True

    def test_pure_english(self):
        assert _is_chinese_heavy("mRNA vaccine delivery") is False

    def test_mixed_english_dominant(self):
        assert _is_chinese_heavy("mRNA vaccine delivery 策略") is False

    def test_empty_string(self):
        assert _is_chinese_heavy("") is False

    def test_only_chinese_punctuation(self):
        assert _is_chinese_heavy("，。！？") is True


class TestExtractEnglishWords:

    def test_simple_english(self):
        assert _extract_english_words("mRNA vaccine delivery") == [
            "mRNA", "vaccine", "delivery"
        ]

    def test_chinese_mixed(self):
        result = _extract_english_words(
            "如何把不稳定易降解的mRNA安全递送进细胞"
        )
        assert "mRNA" in result

    def test_hyphenated_words(self):
        result = _extract_english_words("CAR-T cell therapy")
        assert "CAR-T" in result

    def test_no_english(self):
        assert _extract_english_words("这是一个纯中文句子") == []

    def test_numbers_attached(self):
        result = _extract_english_words("PET-2024 depolymerase")
        assert "PET-2024" in result or "PET" in result


class TestFilterStopwords:

    def test_removes_common_stops(self):
        result = _filter_stopwords(
            ["how", "to", "deliver", "the", "mRNA", "into", "cells"]
        )
        assert "deliver" in result
        assert "mRNA" in result
        assert "cells" in result
        assert "the" not in result
        assert "to" not in result
        assert "into" not in result


class TestNormalizeLiteratureQuery:

    def test_chinese_long_sentence_normalized(self):
        result = normalize_literature_query(
            "如何把不稳定、易降解的mRNA安全递送进细胞，并让细胞短暂表达目标抗原以诱导免疫反应？"
        )
        assert "mRNA" in result
        assert len(result) < 80

    def test_chinese_long_sentence_not_passed_raw(self):
        raw = "如何把不稳定、易降解的mRNA安全递送进细胞，并让细胞短暂表达目标抗原以诱导免疫反应？"
        result = normalize_literature_query(raw)
        assert result != raw

    def test_pure_english_preserved(self):
        result = normalize_literature_query("mRNA vaccine delivery")
        assert result == "mRNA vaccine delivery"

    def test_english_with_stopwords_preserved(self):
        result = normalize_literature_query("how to deliver mRNA")
        assert "mRNA" in result

    def test_empty_query(self):
        assert normalize_literature_query("") == ""
        assert normalize_literature_query("   ") == ""
        assert normalize_literature_query(None) == ""

    def test_pet_depolymerase(self):
        result = normalize_literature_query(
            "PET depolymerase LCC protein engineering enzymatic recycling"
        )
        assert "PET" in result
        assert "depolymerase" in result
        assert "protein" in result or "engineering" in result

    def test_car_t_therapy(self):
        result = normalize_literature_query("CAR-T cell therapy antigen receptor")
        assert "CAR-T" in result


class TestBuildLiteratureSearchQuery:

    def test_recommended_keywords_priority(self):
        result = build_literature_search_query(
            query="中文问题",
            task_title="mRNA vaccine delivery",
            case_title="mRNA",
            task={"recommended_keywords": ["lipid nanoparticle", "LNP", "mRNA"]},
        )
        assert "lipid nanoparticle" in result
        assert "LNP" in result
        assert "mRNA" in result

    def test_case_keywords_fallback(self):
        result = build_literature_search_query(
            task_title="PET recycling",
            case={"recommended_keywords": ["depolymerase", "protein engineering"]},
        )
        assert "depolymerase" in result
        assert "protein engineering" in result

    def test_task_title_english_extraction(self):
        result = build_literature_search_query(
            query="中文问题",
            task_title="mRNA vaccine delivery strategy",
        )
        assert "mRNA" in result
        assert "vaccine" in result
        assert "delivery" in result

    def test_chinese_query_normalized_not_raw(self):
        chinese = (
            "如何把不稳定、易降解的mRNA安全递送进细胞，"
            "并让细胞短暂表达目标抗原以诱导免疫反应？"
        )
        result = build_literature_search_query(query=chinese)
        assert result != chinese
        assert "mRNA" in result

    def test_explicit_english_query_preserved(self):
        result = build_literature_search_query(
            query="lipid nanoparticle LNP",
            task_title="mRNA vaccine",
        )
        assert result == "lipid nanoparticle LNP"

    def test_explicit_chinese_query_normalized(self):
        result = build_literature_search_query(
            query="如何递送mRNA到细胞中",
            task_title="mRNA delivery",
        )
        assert result != "如何递送mRNA到细胞中"

    def test_empty_keywords_no_error(self):
        result = build_literature_search_query(
            task_title="mRNA vaccine",
            case_title="",
            query="",
            task={},
            case={},
        )
        assert result is not None
        assert isinstance(result, str)

    def test_all_empty(self):
        result = build_literature_search_query()
        assert result == ""

    def test_venetoclax_case(self):
        result = build_literature_search_query(
            task_title="venetoclax BCL-2 apoptosis inhibitor",
        )
        assert "venetoclax" in result
        assert "BCL-2" in result
        assert "apoptosis" in result

    def test_car_t_case(self):
        result = build_literature_search_query(
            task_title="CAR T cell therapy antigen receptor engineering",
        )
        assert "CAR" in result
        assert "cell" in result
        assert "therapy" in result
        assert "antigen" in result
        assert "receptor" in result

    def test_deduplication(self):
        result = build_literature_search_query(
            task_title="mRNA vaccine",
            case_title="mRNA",
            task={"recommended_keywords": ["mRNA", "vaccine"]},
        )
        parts = result.lower().split()
        assert parts.count("mrna") == 1


class TestEvidenceServiceQueryNormalization:

    def test_chinese_query_normalized_in_evidence_search(self):
        service = EvidenceService()
        query = (
            "如何把不稳定、易降解的mRNA安全递送进细胞，"
            "并让细胞短暂表达目标抗原以诱导免疫反应？"
        )
        built = service._build_query(
            query=query,
            task_title="mRNA vaccine delivery",
            case_title="mRNA",
        )
        assert built != query
        assert "mRNA" in built

    def test_english_query_passed_through(self):
        service = EvidenceService()
        query = "lipid nanoparticle LNP"
        built = service._build_query(
            query=query,
            task_title="mRNA vaccine",
            case_title="mRNA",
        )
        assert built == "lipid nanoparticle LNP"

    def test_recommended_keywords_in_evidence_search(self):
        service = EvidenceService()
        built = service._build_query(
            query="中文问题",
            task_title="PET recycling",
            recommended_keywords=["depolymerase", "protein engineering"],
        )
        assert "depolymerase" in built
        assert "protein engineering" in built

    def test_pet_depolymerase_case(self):
        service = EvidenceService()
        built = service._build_query(
            query="PET depolymerase protein engineering",
            task_title="PET depolymerase",
        )
        assert "PET" in built
        assert "depolymerase" in built

    def test_venetoclax_case(self):
        service = EvidenceService()
        built = service._build_query(
            task_title="venetoclax BCL-2 apoptosis inhibitor",
        )
        assert "venetoclax" in built
        assert "BCL-2" in built
        assert "apoptosis" in built or "inhibitor" in built

    def test_empty_fallback_no_error(self):
        service = EvidenceService()
        built = service._build_query(
            query="",
            task_title="mRNA vaccine",
            case_title="",
        )
        assert isinstance(built, str)
        assert len(built) > 0


class TestNoFabrication:

    def test_query_builder_does_not_fabricate_fields(self):
        result = build_literature_search_query(
            query="test",
            task_title="test title",
        )
        assert "doi" not in result.lower()
        assert "pmid" not in result.lower()
        assert "author" not in result.lower()
        assert "abstract" not in result.lower()

    def test_normalized_query_only_contains_keywords(self):
        chinese = "如何把mRNA递送到细胞中表达抗原"
        result = normalize_literature_query(chinese)
        assert "doi" not in result.lower()
        assert "pmid" not in result.lower()
