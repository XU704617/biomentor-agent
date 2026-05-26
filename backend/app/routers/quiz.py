from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.quiz import Quiz
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizResponse, QuizListResponse

router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@router.get("/", response_model=QuizListResponse)
def list_quizzes(
    course_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Quiz).filter(Quiz.course_id == course_id)
    total = query.count()
    quizzes = query.offset(skip).limit(limit).all()
    return {"total": total, "quizzes": quizzes}


@router.post("/", response_model=QuizResponse, status_code=201)
def create_quiz(data: QuizCreate, db: Session = Depends(get_db)):
    question_ids = data.model_dump().pop("question_ids", [])
    quiz = Quiz(**data.model_dump(exclude={"question_ids"}))
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    # TODO: associate questions with quiz via quiz_questions join table
    return quiz


@router.get("/{quiz_id}", response_model=QuizResponse)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz


@router.put("/{quiz_id}", response_model=QuizResponse)
def update_quiz(quiz_id: int, data: QuizUpdate, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(quiz, key, value)
    db.commit()
    db.refresh(quiz)
    return quiz


@router.delete("/{quiz_id}", status_code=204)
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()
    return None
