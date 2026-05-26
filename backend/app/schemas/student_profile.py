from pydantic import BaseModel, ConfigDict
from typing import Optional


class StudentProfileBase(BaseModel):
    student_id: int
    course_id: int
    concept_score: float = 0.0
    mechanism_score: float = 0.0
    application_score: float = 0.0
    literature_score: float = 0.0
    research_design_score: float = 0.0
    transfer_score: float = 0.0


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileUpdate(BaseModel):
    concept_score: Optional[float] = None
    mechanism_score: Optional[float] = None
    application_score: Optional[float] = None
    literature_score: Optional[float] = None
    research_design_score: Optional[float] = None
    transfer_score: Optional[float] = None


class StudentProfileResponse(StudentProfileBase):
    model_config = ConfigDict(from_attributes=True)


class StudentProfileListResponse(BaseModel):
    total: int
    profiles: list[StudentProfileResponse]
