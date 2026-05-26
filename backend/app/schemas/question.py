from pydantic import BaseModel, ConfigDict
from typing import Optional, Any
from datetime import datetime


class QuestionBase(BaseModel):
    course_id: int
    knowledge_node_id: Optional[int] = None
    type: str
    stem: str
    options: Optional[Any] = None
    answer: str
    explanation: str = ""
    rubric: Optional[Any] = None
    difficulty: str = "medium"
    source_refs: Optional[Any] = None
    status: str = "draft"


class QuestionCreate(QuestionBase):
    pass


class QuestionUpdate(BaseModel):
    knowledge_node_id: Optional[int] = None
    type: Optional[str] = None
    stem: Optional[str] = None
    options: Optional[Any] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None
    rubric: Optional[Any] = None
    difficulty: Optional[str] = None
    source_refs: Optional[Any] = None
    status: Optional[str] = None


class QuestionResponse(QuestionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class QuestionListResponse(BaseModel):
    total: int
    questions: list[QuestionResponse]


class QuestionGenerateRequest(BaseModel):
    course_id: int
    count: int = 5
    type: Optional[str] = None
    difficulty: Optional[str] = None
    knowledge_node_ids: Optional[list[int]] = None
