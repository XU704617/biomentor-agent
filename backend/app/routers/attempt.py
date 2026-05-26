from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.attempt import Attempt
from app.schemas.attempt import AttemptCreate, AttemptResponse, AttemptListResponse, AttemptSubmitRequest

router = APIRouter(prefix="/attempts", tags=["attempts"])


@router.post("/", response_model=AttemptResponse, status_code=201)
def start_attempt(data: AttemptCreate, db: Session = Depends(get_db)):
    attempt = Attempt(**data.model_dump())
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.get("/{attempt_id}", response_model=AttemptResponse)
def get_attempt(attempt_id: int, db: Session = Depends(get_db)):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt


@router.post("/{attempt_id}/submit")
def submit_attempt(attempt_id: int, data: AttemptSubmitRequest, db: Session = Depends(get_db)):
    attempt = db.query(Attempt).filter(Attempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    # TODO: save each response, auto-grade objective questions, trigger AI grading for subjective
    # TODO: update attempt status to "submitted" / "graded" and compute score
    return {"message": "Submit not yet implemented"}


@router.get("/", response_model=AttemptListResponse)
def list_attempts(
    quiz_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Attempt).filter(Attempt.quiz_id == quiz_id)
    total = query.count()
    attempts = query.offset(skip).limit(limit).all()
    return {"total": total, "attempts": attempts}
