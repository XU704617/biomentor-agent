from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class CourseBase(BaseModel):
    title: str
    description: str = ""


class CourseCreate(CourseBase):
    teacher_id: int


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class CourseResponse(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    teacher_id: int
    created_at: datetime


class CourseListResponse(BaseModel):
    total: int
    courses: list[CourseResponse]
