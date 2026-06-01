"""
Paper Service — LLM-powered research paper analysis, learning plans, defense outlines.
"""

from __future__ import annotations

import re
import uuid
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.models import ResearchPaper
from app.config import get_settings
from app.services.llm import get_llm
from app.services.ingestion import IngestionService
from app.services.prompts import PAPER_ANALYSIS_SYSTEM, PAPER_ANALYSIS_USER, PAPER_ANALYSIS_SCHEMA

PAPER_IMPORT_SYSTEM = """你是科研论文信息抽取助手。请从上传的 PDF 文本中提取结构化文献信息。

要求：
1. 只根据提供的 PDF 文本抽取，不要编造不存在的信息。
2. 如果 PDF 中没有明确中文标题，可将 title_zh 留空字符串。
3. year 必须是四位数字；无法确认时返回 0。
4. keywords 与 related_concepts 请返回简洁列表。
5. source_type 固定返回“学术文献”。
6. teaching_value 与 research_value 要从教学和科研角度分别概括，不要泛泛而谈。
"""

PAPER_IMPORT_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "title_zh": {"type": "string"},
        "direction": {"type": "string"},
        "venue": {"type": "string"},
        "year": {"type": "integer"},
        "source_type": {"type": "string"},
        "keywords": {"type": "array", "items": {"type": "string"}},
        "abstract": {"type": "string"},
        "core_problem": {"type": "string"},
        "method_summary": {"type": "string"},
        "key_finding": {"type": "string"},
        "teaching_value": {"type": "string"},
        "research_value": {"type": "string"},
        "related_concepts": {"type": "array", "items": {"type": "string"}},
    },
    "required": [
        "title",
        "direction",
        "year",
        "source_type",
        "keywords",
        "abstract",
        "core_problem",
        "method_summary",
        "key_finding",
        "teaching_value",
        "research_value",
        "related_concepts",
    ],
    "additionalProperties": False,
}


class PaperService:

    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm()
        self.settings = get_settings()

    def list_papers(self, direction: str | None = None, difficulty: str | None = None,
                    page: int = 1, page_size: int = 20) -> tuple[list[ResearchPaper], int]:
        q = self.db.query(ResearchPaper)
        if direction: q = q.filter(ResearchPaper.direction == direction)
        if difficulty: q = q.filter(ResearchPaper.reading_difficulty == difficulty)
        total = q.count()
        items = q.order_by(ResearchPaper.suggested_reading_order, ResearchPaper.year.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_paper(self, paper_id: int) -> ResearchPaper | None:
        return self.db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()

    def create_paper(self, data: dict) -> ResearchPaper:
        paper = ResearchPaper(**data)
        self.db.add(paper)
        self.db.commit()
        self.db.refresh(paper)
        return paper

    def import_pdf(self, filename: str, content: bytes) -> ResearchPaper:
        if not filename.lower().endswith(".pdf"):
            raise ValueError("Only PDF files are supported")
        if not self.llm.available:
            raise RuntimeError("LLM service unavailable for paper PDF import")

        storage_dir = Path(self.settings.UPLOAD_DIR) / "research_papers"
        storage_dir.mkdir(parents=True, exist_ok=True)

        safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", Path(filename).stem).strip("._") or "paper"
        storage_name = f"{safe_stem}-{uuid.uuid4().hex[:12]}.pdf"
        storage_path = storage_dir / storage_name
        storage_path.write_bytes(content)

        extracted_text = IngestionService.extract_text_from_pdf(str(storage_path)).strip()
        if not extracted_text or extracted_text.startswith("[PDF"):
            storage_path.unlink(missing_ok=True)
            raise RuntimeError("Failed to extract readable text from PDF")

        user_prompt = (
            f"原始文件名：{filename}\n"
            "请从以下 PDF 文本中抽取文献信息并输出 JSON。\n\n"
            f"{extracted_text[:16000]}"
        )
        parsed = self.llm.generate_json(
            system_prompt=PAPER_IMPORT_SYSTEM,
            user_prompt=user_prompt,
            schema=PAPER_IMPORT_SCHEMA,
            temperature=0.1,
        )

        if (
            not parsed.get("title")
            or not parsed.get("direction")
            or not parsed.get("abstract")
            or not parsed.get("core_problem")
            or not parsed.get("method_summary")
            or not parsed.get("key_finding")
        ):
            storage_path.unlink(missing_ok=True)
            raise RuntimeError("LLM returned incomplete paper metadata")

        year = parsed.get("year")
        if not isinstance(year, int) or year < 1000 or year > 2100:
            year = 0

        payload = {
            "title": str(parsed.get("title", "")).strip(),
            "title_zh": str(parsed.get("title_zh", "")).strip(),
            "direction": str(parsed.get("direction", "")).strip(),
            "venue": str(parsed.get("venue", "")).strip(),
            "year": year,
            "source_type": str(parsed.get("source_type", "学术文献")).strip() or "学术文献",
            "keywords": self._normalize_text_list(parsed.get("keywords")),
            "abstract": str(parsed.get("abstract", "")).strip(),
            "core_problem": str(parsed.get("core_problem", "")).strip(),
            "method_summary": str(parsed.get("method_summary", "")).strip(),
            "key_finding": str(parsed.get("key_finding", "")).strip(),
            "teaching_value": str(parsed.get("teaching_value", "")).strip(),
            "research_value": str(parsed.get("research_value", "")).strip(),
            "related_concepts": self._normalize_text_list(parsed.get("related_concepts")),
            "pdf_filename": filename,
            "pdf_storage_path": str(storage_path.resolve()),
            "pdf_text_char_count": len(extracted_text),
        }
        return self.create_paper(payload)

    def update_paper(self, paper_id: int, data: dict) -> ResearchPaper | None:
        paper = self.get_paper(paper_id)
        if not paper:
            return None

        for key, value in data.items():
            if hasattr(paper, key):
                setattr(paper, key, value)

        self.db.commit()
        self.db.refresh(paper)
        return paper

    def delete_paper(self, paper_id: int) -> bool:
        paper = self.get_paper(paper_id)
        if not paper:
            return False

        if paper.pdf_storage_path:
            try:
                Path(paper.pdf_storage_path).unlink(missing_ok=True)
            except Exception:
                pass

        self.db.delete(paper)
        self.db.commit()
        return True

    def search_papers(self, query: str, limit: int = 10) -> list[ResearchPaper]:
        lower = query.lower()
        return self.db.query(ResearchPaper).filter(
            ResearchPaper.title.contains(lower) | ResearchPaper.title_zh.contains(lower) |
            ResearchPaper.direction.contains(lower) | ResearchPaper.abstract.contains(lower)
        ).limit(limit).all()

    def get_demo_papers(self) -> list[ResearchPaper]:
        return self.db.query(ResearchPaper).filter(ResearchPaper.can_support_demo == True).order_by(
            ResearchPaper.suggested_reading_order).limit(12).all()

    # ── LLM-Powered Paper Analysis ───────────────────────────────

    def analyze_paper(self, paper_id: int) -> dict[str, Any]:
        """LLM deep analysis of a paper."""
        paper = self.get_paper(paper_id)
        if not paper: return {"error": "Paper not found"}

        if not self.llm.available:
            raise RuntimeError("LLM service unavailable for paper analysis")

        user_prompt = PAPER_ANALYSIS_USER.format(
            title=paper.title_zh or paper.title,
            abstract=paper.abstract or paper.core_problem,
            methods=paper.method_summary,
            findings=paper.key_finding,
            direction=paper.direction,
        )
        result = self.llm.generate_json(
            system_prompt=PAPER_ANALYSIS_SYSTEM,
            user_prompt=user_prompt,
            schema=PAPER_ANALYSIS_SCHEMA,
            temperature=0.4,
        )

        if not result.get("one_sentence_summary") or not result.get("teaching_points"):
            raise RuntimeError("LLM returned incomplete paper analysis")

        return {"paper_id": paper.id, "title": paper.title_zh, **result}

    def build_learning_plan(self, paper_id: int) -> dict[str, Any] | None:
        paper = self.get_paper(paper_id)
        if not paper: return None

        # Try LLM analysis first
        analysis = self.analyze_paper(paper_id)

        return {
            "paper_id": paper.id, "title": paper.title_zh or paper.title,
            "learning_goal": f"深入理解《{paper.title_zh}》，掌握{paper.direction}领域的核心方法",
            "prerequisite_concepts": paper.related_concepts or [],
            "one_sentence_summary": analysis.get("one_sentence_summary", ""),
            "key_innovation": analysis.get("key_innovation", ""),
            "reading_steps": [
                f"第一步：阅读摘要和引言（5-10分钟）——理解研究动机",
                f"第二步：精读方法部分（15-20分钟）——重点关注：{paper.method_summary[:100]}",
                f"第三步：理解核心发现（10分钟）——{paper.key_finding[:100]}",
                f"第四步：思考教学和研究价值（10分钟）",
                f"第五步：阅读讨论部分，记录疑问和思考",
            ],
            "method_breakdown": analysis.get("method_breakdown", []),
            "experiment_thinking": analysis.get("experiment_ideas", []),
            "defense_talking_points": analysis.get("defense_talking_points", [
                f"核心贡献：{paper.key_finding[:150]}",
                f"领域定位：{paper.direction}领域的{paper.source_type}",
                f"教学启示：{paper.teaching_value[:150]}",
            ]),
            "discussion_questions": analysis.get("discussion_questions", paper.demo_questions or []),
            "reading_difficulty": analysis.get("reading_difficulty", "中等"),
        }

    def build_defense_outline(self, paper_ids: list[int]) -> list[str]:
        papers = self.db.query(ResearchPaper).filter(ResearchPaper.id.in_(paper_ids)).all()
        if not papers: return ["尚未选择文献，无法生成答辩提纲"]

        outline = [
            "一、为什么选择这些文献",
            *[f"  {i}. 《{p.title_zh}》— {p.direction} — {p.venue} ({p.year})" for i, p in enumerate(papers, 1)],
            f"  覆盖{len(set(p.direction for p in papers))}个生物学前沿方向", "",
            "二、研究方向覆盖",
            *[f"  · {p.direction}：{p.core_problem[:80]}..." for p in papers], "",
            "三、对BioMentor知识库的支撑",
            *[f"  · 《{p.title_zh[:30]}》：{p.teaching_value[:100]}..." for p in papers], "",
            "四、AI + 生物制造教育创新",
            "  · AI在生物学研究中的应用：蛋白质设计、知识图谱推理、单细胞模型解释",
            "  · 计算与实验融合的新范式", "  · 前沿文献转化为可教可学的教学资源",
        ]
        return outline

    def _normalize_text_list(self, value: Any) -> list[str]:
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            return [item.strip() for item in re.split(r"[，,;；\n]", value) if item.strip()]
        return []
