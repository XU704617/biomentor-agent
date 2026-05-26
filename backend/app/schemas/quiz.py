from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class QuizBase(BaseModel):
    course_id: int
    title: str
    description: str = ""
    status: str = "draft"
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class QuizCreate(QuizBase):
    question_ids: list[int] = []


class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    question_ids: Optional[list[int]] = None


class QuizResponse(QuizBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class QuizListResponse(BaseModel):
    total: int
    quizzes: list[QuizResponse]
