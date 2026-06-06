"""
Question service: CRUD plus real LLM-backed generation.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.models import Question, QuestionStatus, QuestionType
from app.services.llm import get_llm
from app.services.prompts import (
    QUESTION_GENERATION_SCHEMA,
    QUESTION_GENERATION_SYSTEM,
    QUESTION_GENERATION_USER,
)


def _utcnow():
    return datetime.now(timezone.utc)


class QuestionService:
    def __init__(self, db: Session):
        self.db = db
        self.llm = get_llm()

    def list_questions(
        self,
        course_id: int | None = None,
        status: str | None = None,
        type: str | None = None,
        difficulty: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[Question], int]:
        query = self.db.query(Question)
        if course_id is not None:
            query = query.filter(Question.course_id == course_id)
        if status:
            query = query.filter(Question.status == status)
        if type:
            query = query.filter(Question.type == type)
        if difficulty:
            query = query.filter(Question.difficulty == difficulty)
        total = query.count()
        items = query.order_by(Question.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_question(self, question_id: int) -> Question | None:
        return self.db.query(Question).filter(Question.id == question_id).first()

    def create_question(self, data: dict) -> Question:
        question = Question(**data)
        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def update_question(self, question_id: int, data: dict) -> Question | None:
        question = self.get_question(question_id)
        if not question:
            return None
        for key, value in data.items():
            if hasattr(question, key):
                setattr(question, key, value)
        question.updated_at = _utcnow()
        self.db.commit()
        self.db.refresh(question)
        return question

    def delete_question(self, question_id: int) -> bool:
        question = self.get_question(question_id)
        if not question:
            return False
        self.db.delete(question)
        self.db.commit()
        return True

    def publish_question(self, question_id: int) -> Question | None:
        return self.update_question(question_id, {"status": QuestionStatus.published.value})

    def generate_questions(
        self,
        knowledge_points: list[str],
        evidence_text: str,
        question_types: list[str],
        count: int = 5,
        difficulty: str = "medium",
        course_id: int | None = None,
        strict: bool = True,
    ) -> list[Question]:
        if not knowledge_points:
            knowledge_points = ["通用生命科学"]
        if not self.llm.available:
            raise RuntimeError("LLM service unavailable for question generation")

        try:
            generated = self._llm_generate(
                knowledge_points=knowledge_points,
                evidence=evidence_text,
                question_types=question_types,
                count=count,
                difficulty=difficulty,
                course_id=course_id,
            )
        except Exception:
            if strict:
                raise
            return []

        if generated:
            return generated
        if strict:
            raise RuntimeError("LLM returned no usable questions")
        return []

    def _llm_generate(
        self,
        knowledge_points: list[str],
        evidence: str,
        question_types: list[str],
        count: int,
        difficulty: str,
        course_id: int | None,
    ) -> list[Question]:
        user_prompt = QUESTION_GENERATION_USER.format(
            knowledge_points="、".join(knowledge_points),
            evidence=evidence[:2000] if evidence else "无额外参考材料",
            question_types="、".join(question_types),
            count=count,
            difficulty=difficulty,
        )

        result = self.llm.generate_json(
            system_prompt=QUESTION_GENERATION_SYSTEM,
            user_prompt=user_prompt,
            schema=QUESTION_GENERATION_SCHEMA,
            temperature=0.4,
            max_tokens=1600,
        )

        questions_data = result.get("questions", [])
        if not isinstance(questions_data, list):
            raise RuntimeError("LLM returned invalid question payload")

        generated: list[Question] = []
        for qd in questions_data[:count]:
            if not isinstance(qd, dict):
                continue
            try:
                question = Question(
                    course_id=course_id,
                    knowledge_point_ids=knowledge_points,
                    type=QuestionType(str(qd["type"])),
                    stem=str(qd["stem"]).strip(),
                    options=qd.get("options", []),
                    answer=str(qd["answer"]).strip(),
                    explanation=str(qd.get("explanation", "")).strip(),
                    rubric=qd.get("rubric", []),
                    source_refs=[],
                    bloom_level=qd.get("bloom_level", "understand"),
                    difficulty=qd.get("difficulty", difficulty),
                    status=QuestionStatus.draft,
                    created_by="ai",
                    ai_confidence=0.85,
                    needs_review=True,
                )
                if not question.stem or not question.answer:
                    continue
                self.db.add(question)
                self.db.commit()
                self.db.refresh(question)
                generated.append(question)
            except Exception:
                self.db.rollback()
                continue

        return generated

    def validate_question(self, question_id: int) -> dict[str, Any]:
        question = self.get_question(question_id)
        if not question:
            return {"valid": False, "errors": ["Question not found"]}

        errors: list[str] = []
        if not question.stem or len(question.stem) < 5:
            errors.append("Question stem is too short")
        if not question.answer:
            errors.append("Answer is missing")
        if question.type.value == "choice":
            if not question.options or len(question.options) < 2:
                errors.append("Choice question needs at least two options")
            else:
                labels = [opt.get("label", "") if isinstance(opt, dict) else "" for opt in question.options]
                if len(labels) != len(set(labels)):
                    errors.append("Choice option labels are duplicated")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "suggestion": "Question format is valid" if not errors else "Fix the reported validation issues",
        }
