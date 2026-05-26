from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    knowledge_node_id = Column(Integer, ForeignKey("knowledge_nodes.id"), nullable=True)
    type = Column(
        String(30), nullable=False
    )
    stem = Column(Text, nullable=False)
    options = Column(JSON, default=list)
    answer = Column(Text, nullable=False)
    explanation = Column(Text, default="")
    rubric = Column(JSON, default=dict)
    difficulty = Column(
        String(10), nullable=False, default="medium"
    )
    source_refs = Column(JSON, default=list)
    status = Column(
        String(20), nullable=False, default="draft"
    )

    course = relationship("Course", back_populates="questions")
    knowledge_node = relationship("KnowledgeNode", back_populates="questions")
    responses = relationship("Response", back_populates="question")
