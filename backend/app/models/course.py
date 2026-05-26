from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    teacher = relationship("User", back_populates="courses_owned")
    file_resources = relationship("FileResource", back_populates="course")
    knowledge_chunks = relationship("KnowledgeChunk", back_populates="course")
    knowledge_nodes = relationship("KnowledgeNode", back_populates="course")
    questions = relationship("Question", back_populates="course")
    quizzes = relationship("Quiz", back_populates="course")
    student_profiles = relationship("StudentProfile", back_populates="course")
