"""
Photo learning service for server-side material analysis.

All uploaded images, PDFs, and supported documents are first parsed by GLM's
file parser. The extracted text is then analyzed by GLM text generation.
"""

from __future__ import annotations

import os
import re
from typing import Any

from sqlalchemy.orm import Session

from app.models import KnowledgePoint, ResearchPaper
from app.services.llm import get_llm
from app.services.ocr import OcrService
from app.services.prompts import PHOTO_ANALYSIS_SCHEMA, PHOTO_ANALYSIS_SYSTEM, PHOTO_ANALYSIS_USER
from app.services.questions import QuestionService

KEYWORD_DICT = [
    "CRISPR",
    "Cas9",
    "Cas12",
    "Prime editing",
    "base editing",
    "single-cell",
    "RNA-seq",
    "LNP",
    "mRNA",
    "AlphaFold",
    "protein design",
    "organoid",
    "TCR",
    "CAR-T",
    "spatial transcriptomics",
    "gene therapy",
    "合成生物学",
    "基因编辑",
    "蛋白质工程",
    "单细胞组学",
    "肿瘤微环境",
    "转录组",
]


class PhotoLearningService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm()
        self.question_service = QuestionService(db)
        self.ocr_service = OcrService()

    def analyze_uploaded_file(self, file_bytes: bytes, mime_type: str, filename: str = "") -> dict[str, Any]:
        file_kind = self._resolve_file_kind(mime_type, filename)
        extracted = self.ocr_service.extract(file_bytes, mime_type, filename)
        if not extracted.get("success"):
            raise RuntimeError(str(extracted.get("error", "File extraction failed")))

        extracted_text = str(extracted.get("text", "")).strip()
        if not extracted_text:
            raise RuntimeError("没有提取到可分析文本")

        analysis = self.analyze(extracted_text)
        return self._attach_processing_metadata(
            analysis,
            file_kind=file_kind,
            engine=str(extracted.get("engine", "")),
            char_count=int(extracted.get("char_count", 0) or 0),
            filename=str(extracted.get("filename", filename)),
        )

    def analyze(self, text: str, image_base64: str | None = None) -> dict[str, Any]:
        normalized_text = text.strip()
        if not normalized_text:
            raise RuntimeError("没有可分析的文本内容")

        llm_result: dict[str, Any] = {}
        try:
            llm_result = self._run_text_analysis(normalized_text)
        except Exception:
            llm_result = {}

        return self._build_analysis(normalized_text, llm_result)

    def _run_text_analysis(self, text: str) -> dict[str, Any]:
        if not self.llm.available:
            raise RuntimeError("LLM service unavailable for photo learning analysis")

        user_prompt = PHOTO_ANALYSIS_USER.format(text=text[:5000])
        return self.llm.generate_json(
            system_prompt=PHOTO_ANALYSIS_SYSTEM,
            user_prompt=user_prompt,
            schema=PHOTO_ANALYSIS_SCHEMA,
            temperature=0.3,
        )

    def _build_analysis(self, text: str, llm_result: dict[str, Any]) -> dict[str, Any]:
        llm_keywords = self._normalize_string_list(llm_result.get("keywords"))
        dict_keywords = self._dict_extract(text)
        heuristic_keywords = self._heuristic_extract(text)
        all_keywords = list(dict.fromkeys(llm_keywords + dict_keywords + heuristic_keywords))[:12]
        if not all_keywords:
            all_keywords = ["生命科学", "学习资料"]

        concepts, papers = self._match_knowledge(all_keywords[:8])

        summary = str(llm_result.get("summary", "")).strip()
        if not summary:
            summary = self._build_fallback_summary(text, all_keywords, concepts, papers)

        learning_suggestions = self._normalize_string_list(llm_result.get("learning_suggestions"))
        if not learning_suggestions:
            learning_suggestions = self._build_learning_suggestions(all_keywords, concepts, papers)

        questions = self._generate_questions(text, all_keywords, concepts, papers)

        return {
            "raw_text": text,
            "extracted_keywords": all_keywords,
            "domain": str(llm_result.get("domain", "")).strip() or self._infer_domain(all_keywords, concepts),
            "matched_concepts": concepts[:8],
            "matched_papers": papers[:6],
            "matched_tasks": [],
            "summary": summary,
            "learning_suggestions": learning_suggestions,
            "questions": questions,
        }

    def _attach_processing_metadata(
        self,
        analysis: dict[str, Any],
        *,
        file_kind: str,
        engine: str,
        char_count: int,
        filename: str,
    ) -> dict[str, Any]:
        analysis["source_kind"] = file_kind
        analysis["processing_engine"] = engine
        analysis["processing_char_count"] = char_count
        analysis["processing_filename"] = filename
        analysis["ocr_engine"] = engine
        analysis["ocr_char_count"] = char_count
        analysis["ocr_filename"] = filename
        return analysis

    def _resolve_file_kind(self, mime_type: str, filename: str) -> str:
        ext = os.path.splitext(filename or "")[1].lower()
        if (mime_type or "").startswith("image/") or ext in {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"}:
            return "image"
        if mime_type == "application/pdf" or ext == ".pdf":
            return "pdf"
        if mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or ext == ".docx":
            return "docx"
        if mime_type in {"text/plain", "text/markdown"} or ext in {".txt", ".md"}:
            return "text"
        return "unknown"

    def _normalize_string_list(self, value: Any) -> list[str]:
        if not isinstance(value, list):
            return []
        return [str(item).strip() for item in value if str(item).strip()]

    def _dict_extract(self, text: str) -> list[str]:
        lower_text = text.lower()
        found = [kw for kw in KEYWORD_DICT if kw.lower() in lower_text]
        return sorted(set(found), key=lambda item: -len(item))

    def _heuristic_extract(self, text: str) -> list[str]:
        candidates = re.findall(r"[A-Za-z][A-Za-z0-9+/\-]{2,}|[\u4e00-\u9fff]{2,10}", text)
        ranked: list[str] = []
        seen: set[str] = set()
        stop_words = {
            "学生",
            "内容",
            "分析",
            "知识",
            "学习",
            "建议",
            "问题",
            "答案",
            "解析",
            "文档",
            "教材",
            "文献",
        }
        for token in candidates:
            clean = token.strip()
            if not clean or clean.isdigit() or clean in stop_words or clean in seen:
                continue
            seen.add(clean)
            ranked.append(clean)
            if len(ranked) >= 8:
                break
        return ranked

    def _match_knowledge(self, keywords: list[str]) -> tuple[list[dict], list[dict]]:
        concept_map: dict[int, dict] = {}
        paper_map: dict[int, dict] = {}

        for kw in keywords:
            for kp in (
                self.db.query(KnowledgePoint)
                .filter(KnowledgePoint.name.contains(kw) | KnowledgePoint.definition.contains(kw))
                .limit(5)
                .all()
            ):
                concept_map[kp.id] = {
                    "id": kp.id,
                    "name": kp.name,
                    "category": kp.category,
                    "definition": kp.definition[:200],
                }

            for paper in (
                self.db.query(ResearchPaper)
                .filter(ResearchPaper.title.contains(kw) | ResearchPaper.title_zh.contains(kw))
                .limit(5)
                .all()
            ):
                paper_map[paper.id] = {
                    "id": paper.id,
                    "title": paper.title,
                    "title_zh": paper.title_zh,
                    "direction": paper.direction,
                    "core_problem": paper.core_problem[:200],
                }

        return list(concept_map.values()), list(paper_map.values())

    def _generate_questions(
        self,
        text: str,
        keywords: list[str],
        concepts: list[dict],
        papers: list[dict],
    ) -> list[dict]:
        knowledge_points = [concept["name"] for concept in concepts[:3]] or keywords[:3]
        if not knowledge_points:
            return []

        questions = self.question_service.generate_questions(
            knowledge_points=knowledge_points,
            evidence_text=text[:1200],
            question_types=["choice", "choice", "truefalse", "short_answer", "research", "industry"],
            count=6,
            difficulty="medium",
            strict=False,
        )

        return [
            {
                "id": str(question.id),
                "type": question.type.value,
                "question": question.stem,
                "options": question.options if isinstance(question.options, list) else [],
                "answer": question.answer,
                "explanation": question.explanation,
                "related_concept_ids": question.knowledge_point_ids or [],
                "related_paper_ids": [],
            }
            for question in questions
        ]

    def _infer_domain(self, keywords: list[str], concepts: list[dict]) -> str:
        joined = " ".join(keywords + [str(concept.get("category", "")) for concept in concepts]).lower()
        if any(marker in joined for marker in ["crispr", "cas", "gene", "dna", "rna", "基因", "转录"]):
            return "分子生物学"
        if any(marker in joined for marker in ["细胞", "凋亡", "周期", "信号"]):
            return "细胞生物学"
        if any(marker in joined for marker in ["protein", "蛋白", "alphafold", "enzyme", "酶"]):
            return "蛋白质科学"
        return "生命科学"

    def _build_learning_suggestions(
        self,
        keywords: list[str],
        concepts: list[dict],
        papers: list[dict],
    ) -> list[str]:
        focus = "、".join(keywords[:4]) or "核心概念"
        suggestions = [
            f"先围绕 {focus} 建立概念框架，再回到原文定位定义、机制和结论之间的关系。",
            "把关键术语整理成术语表，区分概念、过程、实验方法和应用场景。",
            "尝试用一张结构图把核心概念、流程和因果关系串起来。",
        ]
        if papers:
            suggestions.append("对照关联文献继续扩展阅读，比较不同研究问题、方法和发现。")
        elif concepts:
            suggestions.append("先复习匹配到的基础知识点，再回看原文中的例子和推理链。")
        return suggestions[:4]

    def _build_fallback_summary(
        self,
        text: str,
        keywords: list[str],
        concepts: list[dict],
        papers: list[dict],
    ) -> str:
        keyword_text = "、".join(keywords[:6]) or "核心概念"
        concept_text = "、".join(concept["name"] for concept in concepts[:4]) or "基础生命科学知识"
        summary = f"系统识别到 {keyword_text} 等关键词，内容主要关联 {concept_text}。"
        if papers:
            paper_text = "、".join(
                (paper.get("title_zh") or paper.get("title") or "")[:24]
                for paper in papers[:3]
                if paper.get("title_zh") or paper.get("title")
            )
            if paper_text:
                summary += f" 还可继续连接到 {paper_text} 等相关文献。"
        snippet = text[:180].replace("\n", " ").strip()
        if snippet:
            summary += f" 原文片段：{snippet}"
        return summary
