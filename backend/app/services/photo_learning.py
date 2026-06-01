"""
Photo Learning Service — LLM-powered OCR text analysis, concept extraction, question generation.
"""

from __future__ import annotations

import os
from typing import Any

from sqlalchemy.orm import Session

from app.models import KnowledgePoint, ResearchPaper
from app.services.llm import get_llm
from app.services.ocr import OcrService
from app.services.prompts import PHOTO_ANALYSIS_SYSTEM, PHOTO_ANALYSIS_USER, PHOTO_ANALYSIS_SCHEMA
from app.services.questions import QuestionService

# Built-in keyword dictionary as fallback
KEYWORD_DICT = [
    "CRISPR", "Cas9", "Cas12", "Prime editing", "碱基编辑", "基因编辑",
    "细胞凋亡", "caspase", "Bcl-2", "Bax", "p53", "线粒体途径",
    "mRNA", "LNP", "脂质纳米颗粒", "递送", "mRNA疫苗", "mRNA治疗",
    "蛋白质结构", "AlphaFold", "定向进化", "蛋白质工程",
    "单细胞", "TCR", "抗原", "转录组", "知识图谱",
    "NHEJ", "HDR", "DNA修复", "基因治疗", "免疫治疗",
    "合成生物学", "代谢工程", "酶催化", "生物催化",
    "干细胞", "iPSC", "类器官", "NGS", "RNA-seq",
    "肿瘤微环境", "CAR-T", "微生物组", "发酵",
]


class PhotoLearningService:

    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm()
        self.question_service = QuestionService(db)
        self.ocr_service = OcrService()

    def analyze_uploaded_file(self, file_bytes: bytes, mime_type: str, filename: str = "") -> dict[str, Any]:
        file_kind = self._resolve_file_kind(mime_type, filename)

        if file_kind == "pdf":
            analysis = self._analyze_pdf_with_llm(file_bytes, filename)
            return self._attach_processing_metadata(
                analysis,
                file_kind="pdf",
                engine="pdf-llm",
                char_count=len(analysis.get("raw_text", "")),
                filename=filename,
            )

        extracted = self.ocr_service.extract(file_bytes, mime_type, filename)
        if not extracted.get("success"):
            raise RuntimeError(extracted.get("error", "File extraction failed"))

        analysis = self.analyze(str(extracted.get("text", "")))
        return self._attach_processing_metadata(
            analysis,
            file_kind=file_kind,
            engine=str(extracted.get("engine", "")),
            char_count=int(extracted.get("char_count", 0) or 0),
            filename=str(extracted.get("filename", filename)),
        )

    def analyze(self, text: str, image_base64: str | None = None) -> dict[str, Any]:
        """Full photo learning pipeline: OCR text -> LLM analysis -> questions."""

        llm_result = self._run_text_analysis(text)
        return self._build_analysis(text, llm_result)

    def _run_text_analysis(self, text: str) -> dict[str, Any]:
        """Analyze already extracted text with the standard LLM schema."""

        if not self.llm.available:
            raise RuntimeError("LLM service unavailable for photo learning analysis")

        user_prompt = PHOTO_ANALYSIS_USER.format(text=text[:3000])
        return self.llm.generate_json(
            system_prompt=PHOTO_ANALYSIS_SYSTEM,
            user_prompt=user_prompt,
            schema=PHOTO_ANALYSIS_SCHEMA,
            temperature=0.3,
        )

    def _analyze_pdf_with_llm(self, file_bytes: bytes, filename: str) -> dict[str, Any]:
        """Read PDF directly with LLM file input instead of OCR/text extraction."""

        if not self.llm.available:
            raise RuntimeError("LLM service unavailable for PDF analysis")

        llm_result = self.llm.generate_json_from_file(
            system_prompt=PHOTO_ANALYSIS_SYSTEM,
            user_prompt=(
                f"学生上传了一份 PDF 文档（文件名：{filename or 'document.pdf'}）。"
                "请直接阅读 PDF 内容并完成分析。"
                "如果内容较长，优先抓取主题、核心概念、定义、机制、实验流程和结论。"
                "请尽量填写 source_excerpt，给出一段适合前端展示的内容摘录或梳理。"
            ),
            schema=PHOTO_ANALYSIS_SCHEMA,
            file_bytes=file_bytes,
            filename=filename or "document.pdf",
            temperature=0.2,
        )

        raw_text = str(llm_result.get("source_excerpt", "")).strip()
        if not raw_text:
            summary = str(llm_result.get("summary", "")).strip()
            raw_text = f"[PDF direct LLM parsing] {filename or 'document.pdf'}\n\n{summary}"

        return self._build_analysis(raw_text, llm_result)

    def _build_analysis(self, text: str, llm_result: dict[str, Any]) -> dict[str, Any]:
        llm_keywords = llm_result.get("keywords", [])
        domain = llm_result.get("domain", "")
        summary = llm_result.get("summary", "")

        if not llm_keywords or not summary:
            raise RuntimeError("LLM returned incomplete photo learning analysis")

        # Fallback: dictionary-based keyword extraction (less accurate than LLM)
        fallback_keywords = self._dict_extract(text)
        all_keywords = list(dict.fromkeys(llm_keywords + fallback_keywords))[:12]

        # Match against knowledge base
        concepts, papers = self._match_knowledge(all_keywords[:8])

        # Generate questions
        questions = self._generate_questions(text, all_keywords, concepts, papers)

        # Build summary if LLM didn't provide one
        if not summary:
            summary = self._build_fallback_summary(text, all_keywords, concepts, papers)
            if not llm_result:
                summary = "⚠️ LLM 不可用，以下为基于字典匹配的简要分析：\n" + summary

        return {
            "raw_text": text,
            "extracted_keywords": all_keywords,
            "domain": domain,
            "matched_concepts": concepts[:8],
            "matched_papers": papers[:6],
            "matched_tasks": [],
            "summary": summary,
            "learning_suggestions": llm_result.get("learning_suggestions", []),
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
        if (mime_type or "").startswith("image/") or ext in {".png", ".jpg", ".jpeg", ".webp", ".bmp"}:
            return "image"
        if mime_type == "application/pdf" or ext == ".pdf":
            return "pdf"
        if (
            mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            or ext == ".docx"
        ):
            return "docx"
        if mime_type in {"text/plain", "text/markdown"} or ext in {".txt", ".md"}:
            return "text"
        return "unknown"

    def _dict_extract(self, text: str) -> list[str]:
        found: set[str] = set()
        lower_text = text.lower()
        for kw in KEYWORD_DICT:
            if kw.lower() in lower_text:
                found.add(kw)
        return sorted(found, key=lambda x: -len(x))

    def _match_knowledge(self, keywords: list[str]) -> tuple[list[dict], list[dict]]:
        concept_map: dict[int, dict] = {}
        paper_map: dict[int, dict] = {}
        for kw in keywords:
            for kp in self.db.query(KnowledgePoint).filter(
                KnowledgePoint.name.contains(kw) | KnowledgePoint.definition.contains(kw)
            ).limit(5).all():
                concept_map[kp.id] = {"id": kp.id, "name": kp.name, "category": kp.category, "definition": kp.definition[:200]}
            for p in self.db.query(ResearchPaper).filter(
                ResearchPaper.title.contains(kw) | ResearchPaper.title_zh.contains(kw)
            ).limit(5).all():
                paper_map[p.id] = {"id": p.id, "title": p.title, "title_zh": p.title_zh, "direction": p.direction, "core_problem": p.core_problem[:200]}
        return list(concept_map.values()), list(paper_map.values())

    def _generate_questions(
        self, text: str, keywords: list[str], concepts: list[dict], papers: list[dict],
    ) -> list[dict]:
        kp_names = [c["name"] for c in concepts[:3]] or keywords[:3]
        if not kp_names: return []
        qs = self.question_service.generate_questions(
            knowledge_points=kp_names, evidence_text=text[:1000],
            question_types=["choice", "choice", "truefalse", "short_answer", "research", "industry"],
            count=6, difficulty="medium", strict=True,
        )
        return [
            {"id": str(q.id), "type": q.type.value, "question": q.stem,
             "options": q.options if isinstance(q.options, list) else [],
             "answer": q.answer, "explanation": q.explanation,
             "related_concept_ids": q.knowledge_point_ids or [], "related_paper_ids": []}
            for q in qs
        ]

    def _build_fallback_summary(self, text: str, keywords: list[str], concepts: list[dict], papers: list[dict]) -> str:
        kw_list = "、".join(keywords[:6]) or "生物学"
        cats = set(c.get("category", "") for c in concepts)
        cat_str = "、".join(cats) if cats else "生命科学"
        concept_names = "、".join(c["name"] for c in concepts[:4])
        paper_names = "、".join(p["title_zh"][:20] for p in papers[:3])
        hint = "，可进一步连接到产业应用" if any(c.get("category") in ("应用方向", "前沿技术") for c in concepts) else ""
        return f"系统识别到 {kw_list} 等关键词，属于 {cat_str} 大类，涉及 {concept_names or '基础生物学'} 等知识。可连接到 {paper_names or '前沿科研方向'} 等科研前沿{hint}。"
