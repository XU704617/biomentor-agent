from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("file_resources.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, default=0)
    chapter_title = Column(String(300), default="")
    embedding_id = Column(String(200), default="")
    metadata_ = Column("metadata", JSON, default=dict)

    file_resource = relationship("FileResource", back_populates="knowledge_chunks")
    course = relationship("Course", back_populates="knowledge_chunks")
