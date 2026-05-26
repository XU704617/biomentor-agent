from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship

from app.database import Base


class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    name = Column(String(200), nullable=False)
    description = Column(Text, default="")
    parent_id = Column(Integer, ForeignKey("knowledge_nodes.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    course = relationship("Course", back_populates="knowledge_nodes")
    questions = relationship("Question", back_populates="knowledge_node")
