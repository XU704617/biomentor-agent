from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ResearchPaperOut, ResearchPaperUpdate
from app.services.papers import PaperService

router = APIRouter(prefix="/api/research/papers", tags=["paper-library"])


@router.patch("/{paper_id}", response_model=ResearchPaperOut)
def update_paper(
    paper_id: int,
    payload: ResearchPaperUpdate,
    db: Session = Depends(get_db),
):
    service = PaperService(db)
    updated = service.update_paper(
        paper_id,
        payload.model_dump(exclude_none=True),
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="Paper not found")
    return updated


@router.delete("/{paper_id}")
def delete_paper(
    paper_id: int,
    db: Session = Depends(get_db),
):
    service = PaperService(db)
    deleted = service.delete_paper(paper_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Paper not found")
    return {"success": True, "paper_id": paper_id}
