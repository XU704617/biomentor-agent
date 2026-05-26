from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.database import Base


class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    score = Column(Float, nullable=True, default=None)
    status = Column(
        String(20), nullable=False, default="in_progress"
    )
    submitted_at = Column(DateTime, nullable=True)

    quiz = relationship("Quiz", back_populates="attempts")
    student = relationship("User", back_populates="attempts")
    responses = relationship("Response", back_populates="attempt")
