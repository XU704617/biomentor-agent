"""
Photo learning service for server-side material analysis.

- Images: OCR first, then LLM analysis
- PDF: prefer file-capable LLM path, fall back to local PDF text extraction + LLM
- DOCX/TXT/MD: local text extraction + LLM
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
    "碱基编辑",
    "基因编辑",
    "细胞凋亡",
    "caspase",
    "Bcl-2",
    "Bax",
    "p53",
    "线粒体途径",
    "mRNA",
    "LNP",
    "脂质纳米颗粒",
    "递送",
    "mRNA疫苗",
    "mRNA治疗",
    "蛋白质结构",
    "AlphaFold",
    "定向进化",
    "蛋白质工程",
    "单细胞",
    "TCR",
    "抗原",
    "转录组",
    "知识图谱",
    "NHEJ",
    "HDR",
    "DNA修复",
    "基因治疗",
    "免疫治疗",
    "合成生物学",
    "代谢工程",
    "酶催化",
    "生物催化",
    "干细胞",
    "iPSC",
    "类器官",
    "NGS",
    "RNA-seq",
    "肿瘤微环境",
    "CAR-T",
    "微生物组",
    "发酵",
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
            analysis, engine, char_count = self._analyze_pdf_with_llm(file_bytes, filename)
            return self._attach_processing_metadata(
                analysis,
                file_kind="pdf",
                engine=engine,
                char_count=char_count,
                filename=filename,
            )

        extracted = self.ocr_service.extract(file_bytes, mime_type, filename)
        if not extracted.get("success"):
            raise RuntimeError(str(extracted.get("error", "File extraction failed")))

        extracted_text = str(extracted.get("text", "")).strip()
        if not extracted_text:
            raise RuntimeError("未提取到可分析文本")

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

        user_prompt = PHOTO_ANALYSIS_USER.format(text=text[:3000])
        return self.llm.generate_json(
            system_prompt=PHOTO_ANALYSIS_SYSTEM,
            user_prompt=user_prompt,
            schema=PHOTO_ANALYSIS_SCHEMA,
            temperature=0.3,
        )

    def _analyze_pdf_with_llm(self, file_bytes: bytes, filename: str) -> tuple[dict[str, Any], str, int]:
        if not self.llm.available:
            raise RuntimeError("LLM service unavailable for PDF analysis")

        direct_error: Exception | None = None

        try:
            llm_result = self.llm.generate_json_from_file(
                system_prompt=PHOTO_ANALYSIS_SYSTEM,
                user_prompt=(
                    f"学生上传了一份 PDF 文档（文件名：{filename or 'document.pdf'}）。"
                    "请直接阅读 PDF 内容并完成分析。"
                    "如果内容较长，优先提取主题、核心概念、定义、机制、实验流程和结论。"
                    "请尽量填写 source_excerpt，给出一段适合前端展示的内容摘录。"
                ),
                schema=PHOTO_ANALYSIS_SCHEMA,
                file_bytes=file_bytes,
                filename=filename or "document.pdf",
                temperature=0.2,
            )
            raw_text = str(llm_result.get("source_excerpt", "")).strip()
            if not raw_text:
                raw_text = f"[PDF direct LLM parsing] {filename or 'document.pdf'}\n\n{llm_result.get('summary', '')}"
            analysis = self._build_analysis(raw_text, llm_result)
            return analysis, "pdf-llm", len(raw_text)
        except Exception as exc:
            direct_error = exc

        extracted = self.ocr_service.extract(file_bytes, "application/pdf", filename or "document.pdf")
        if not extracted.get("success"):
            raise RuntimeError(str(extracted.get("error", "PDF text extraction failed")))

        extracted_text = str(extracted.get("text", "")).strip()
        if not extracted_text:
            message = "PDF 中未提取到可分析文本"
            if direct_error is not None:
                message = f"{message}; direct_pdf_llm={direct_error}"
            raise RuntimeError(message)

        llm_result: dict[str, Any] = {}
        try:
            llm_result = self._run_text_analysis(extracted_text)
        except Exception:
            llm_result = {}

        analysis = self._build_analysis(extracted_text, llm_result)
        return analysis, "pdf-text-llm", len(extracted_text)

    def _build_analysis(self, text: str, llm_result: dict[str, Any]) -> dict[str, Any]:
        llm_keywords = self._normalize_string_list(llm_result.get("keywords"))
        fallback_keywords = self._dict_extract(text)
        heuristic_keywords = self._heuristic_extract(text)
        all_keywords = list(dict.fromkeys(llm_keywords + fallback_keywords + heuristic_keywords))[:12]
        if not all_keywords:
            all_keywords = ["知识点解析"]

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
        if (mime_type or "").startswith("image/") or ext in {".png", ".jpg", ".jpeg", ".webp", ".bmp"}:
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
        result: list[str] = []
        for item in value:
            text = str(item).strip()
            if text:
                result.append(text)
        return result

    def _dict_extract(self, text: str) -> list[str]:
        found: set[str] = set()
        lower_text = text.lower()
        for kw in KEYWORD_DICT:
            if kw.lower() in lower_text:
                found.add(kw)
        return sorted(found, key=lambda item: -len(item))

    def _heuristic_extract(self, text: str) -> list[str]:
        candidates = re.findall(r"[A-Za-z][A-Za-z0-9+/\-]{2,}|[\u4e00-\u9fff]{2,10}", text)
        ranked: list[str] = []
        seen: set[str] = set()
        stop_words = {"学生", "内容", "分析", "知识", "学习", "建议", "问题", "答案", "解析", "文档", "教材", "文献"}
        for token in candidates:
            clean = token.strip()
            if not clean or clean in seen or clean in stop_words or clean.isdigit():
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

    def _generate_questions(self, text: str, keywords: list[str], concepts: list[dict], papers: list[dict]) -> list[dict]:
        kp_names = [concept["name"] for concept in concepts[:3]] or keywords[:3]
        if not kp_names:
            return []

        questions = self.question_service.generate_questions(
            knowledge_points=kp_names,
            evidence_text=text[:1000],
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
        joined = " ".join(keywords + [concept.get("category", "") for concept in concepts]).lower()
        if any(marker in joined for marker in ["crispr", "cas", "gene", "dna", "rna", "基因", "转录", "翻译"]):
            return "分子生物学"
        if any(marker in joined for marker in ["细胞", "凋亡", "周期", "信号"]):
            return "细胞生物学"
        if any(marker in joined for marker in ["蛋白", "protein", "酶", "alphafold"]):
            return "蛋白质科学"
        return "生命科学"

    def _build_learning_suggestions(self, keywords: list[str], concepts: list[dict], papers: list[dict]) -> list[str]:
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

    def _build_fallback_summary(self, text: str, keywords: list[str], concepts: list[dict], papers: list[dict]) -> str:
        keyword_text = "、".join(keywords[:6]) or "核心概念"
        concept_text = "、".join(concept["name"] for concept in concepts[:4]) or "基础生命科学知识"
        paper_text = "、".join((paper.get("title_zh") or paper.get("title") or "")[:24] for paper in papers[:3] if paper.get("title_zh") or paper.get("title"))
        summary = f"系统识别到 {keyword_text} 等关键词，内容主要关联 {concept_text}。"
        if paper_text:
            summary += f" 还可进一步连接到 {paper_text} 等相关文献。"
        snippet = text[:180].replace("\n", " ").strip()
        if snippet:
            summary += f" 原文片段显示：{snippet}"
        return summary
