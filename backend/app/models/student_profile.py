from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    student_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    course_id = Column(Integer, ForeignKey("courses.id"), primary_key=True)
    concept_score = Column(Float, default=0.0)
    mechanism_score = Column(Float, default=0.0)
    application_score = Column(Float, default=0.0)
    literature_score = Column(Float, default=0.0)
    research_design_score = Column(Float, default=0.0)
    transfer_score = Column(Float, default=0.0)

    student = relationship("User", back_populates="student_profiles")
    course = relationship("Course", back_populates="student_profiles")
