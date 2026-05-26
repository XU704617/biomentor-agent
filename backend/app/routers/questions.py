from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.question import Question
from app.schemas.question import (
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    QuestionListResponse,
    QuestionGenerateRequest,
)

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("/", response_model=QuestionListResponse)
def list_questions(
    course_id: Optional[int] = None,
    type: Optional[str] = None,
    difficulty: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Question)
    if course_id:
        query = query.filter(Question.course_id == course_id)
    if type:
        query = query.filter(Question.type == type)
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if status:
        query = query.filter(Question.status == status)
    total = query.count()
    questions = query.offset(skip).limit(limit).all()
    return {"total": total, "questions": questions}


@router.post("/", response_model=QuestionResponse, status_code=201)
def create_question(data: QuestionCreate, db: Session = Depends(get_db)):
    question = Question(**data.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question


@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, data: QuestionUpdate, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(question, key, value)
    db.commit()
    db.refresh(question)
    return question


@router.delete("/{question_id}", status_code=204)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()
    return None
