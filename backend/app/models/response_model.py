from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Response(Base):
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    student_answer = Column(Text, default="")
    is_correct = Column(Boolean, default=False)
    score = Column(Float, default=0.0)
    ai_feedback = Column(Text, default="")
    error_type = Column(String(100), default="")

    attempt = relationship("Attempt", back_populates="responses")
    question = relationship("Question", back_populates="responses")
