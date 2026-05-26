from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class FileResourceBase(BaseModel):
    course_id: int
    filename: str
    file_type: str
    file_path: str


class FileResourceCreate(FileResourceBase):
    parse_status: str = "pending"
    summary: str = ""


class FileResourceUpdate(BaseModel):
    parse_status: Optional[str] = None
    summary: Optional[str] = None


class FileResourceResponse(FileResourceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parse_status: str
    summary: str
    created_at: datetime


class FileResourceListResponse(BaseModel):
    total: int
    files: list[FileResourceResponse]
