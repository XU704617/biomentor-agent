from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum, func
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    role = Column(SAEnum("teacher", "student", name="user_role"), nullable=False, default="student")
    email = Column(String(200), unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    courses_owned = relationship("Course", back_populates="teacher")
    student_profiles = relationship("StudentProfile", back_populates="student")
    attempts = relationship("Attempt", back_populates="student")
