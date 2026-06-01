from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import QuizOut, QuizCreate
from app.services.quiz import QuizService

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


def _serialize_quiz(quiz) -> QuizOut:
    return QuizOut(
        id=quiz.id,
        course_id=quiz.course_id,
        title=quiz.title,
        description=quiz.description or "",
        time_limit_minutes=quiz.time_limit_minutes or 0,
        total_score=quiz.total_score or 0.0,
        status=quiz.status.value if hasattr(quiz.status, "value") else str(quiz.status),
        knowledge_point_ids=quiz.knowledge_point_ids or [],
        quiz_questions=[
            {
                "id": item.id,
                "question_id": item.question_id,
                "order": item.order,
                "score": item.score,
            }
            for item in (quiz.quiz_questions or [])
        ],
        created_at=quiz.created_at,
        published_at=quiz.published_at,
        due_at=quiz.due_at,
    )


@router.get("/", response_model=dict)
def list_quizzes(
    course_id: int | None = Query(None),
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = QuizService(db)
    items, total = service.list_quizzes(course_id, status, page, page_size)
    return {
        "items": [_serialize_quiz(q) for q in items],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{quiz_id}", response_model=QuizOut)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    service = QuizService(db)
    quiz = service.get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    return _serialize_quiz(quiz)


@router.post("/", response_model=QuizOut, status_code=201)
def create_quiz(data: QuizCreate, db: Session = Depends(get_db)):
    service = QuizService(db)
    return _serialize_quiz(service.create_quiz(data.model_dump()))


@router.post("/{quiz_id}/publish")
def publish_quiz(quiz_id: int, db: Session = Depends(get_db)):
    service = QuizService(db)
    quiz = service.publish_quiz(quiz_id)
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    return {"detail": "published"}


@router.post("/{quiz_id}/close")
def close_quiz(quiz_id: int, db: Session = Depends(get_db)):
    service = QuizService(db)
    quiz = service.close_quiz(quiz_id)
    if not quiz:
        raise HTTPException(404, "Quiz not found")
    return {"detail": "closed"}


@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    service = QuizService(db)
    if not service.delete_quiz(quiz_id):
        raise HTTPException(404, "Quiz not found")
    return {"detail": "deleted"}
