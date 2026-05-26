from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/student/{student_id}")
def student_report(student_id: int, course_id: int, db: Session = Depends(get_db)):
    # TODO: aggregate StudentProfile scores, attempt history, per-dimension analysis
    return {"message": "Student report not yet implemented"}


@router.get("/class/{course_id}")
def class_report(course_id: int, db: Session = Depends(get_db)):
    # TODO: aggregate all student profiles in course, generate class heatmap data
    return {"message": "Class report not yet implemented"}


@router.get("/quiz/{quiz_id}")
def quiz_report(quiz_id: int, db: Session = Depends(get_db)):
    # TODO: aggregate attempt results for quiz, per-question stats, difficulty analysis
    return {"message": "Quiz report not yet implemented"}
