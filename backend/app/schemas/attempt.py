from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class AttemptBase(BaseModel):
    quiz_id: int
    student_id: int


class AttemptCreate(AttemptBase):
    pass


class AttemptUpdate(BaseModel):
    score: Optional[float] = None
    status: Optional[str] = None


class AttemptSubmitRequest(BaseModel):
    responses: list[dict]


class AttemptResponse(AttemptBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    score: Optional[float] = None
    status: str
    submitted_at: Optional[datetime] = None


class AttemptListResponse(BaseModel):
    total: int
    attempts: list[AttemptResponse]
