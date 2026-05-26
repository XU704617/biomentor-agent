from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.database import Base


class FileResource(Base):
    __tablename__ = "file_resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    filename = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_path = Column(String(1000), nullable=False)
    parse_status = Column(
        String(20), nullable=False, default="pending"
    )
    summary = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())

    course = relationship("Course", back_populates="file_resources")
    knowledge_chunks = relationship("KnowledgeChunk", back_populates="file_resource")
