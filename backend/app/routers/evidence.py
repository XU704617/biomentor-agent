from fastapi import APIRouter

from app.schemas import (
    EvidenceSearchRequest,
    EvidenceSearchResponse,
    EvidenceNoteRequest,
    EvidenceNoteResponse,
    LiteratureSearchItem,
)
from app.services.evidence_service import EvidenceService

router = APIRouter(prefix="/api/evidence", tags=["evidence"])


@router.post("/search", response_model=EvidenceSearchResponse)
async def evidence_search(body: EvidenceSearchRequest):
    service = EvidenceService()
    result = await service.search(
        task_title=body.task_title,
        task_description=body.task_description,
        case_title=body.case_title,
        query=body.query,
        limit=body.limit,
        recommended_keywords=body.recommended_keywords,
    )
    return EvidenceSearchResponse(
        query=result["query"],
        source=result["source"],
        task_title=result["task_title"],
        results=[LiteratureSearchItem(**item) for item in result["results"]],
        message=result.get("message"),
        error=result.get("error"),
    )


@router.post("/note", response_model=EvidenceNoteResponse)
async def evidence_note(body: EvidenceNoteRequest):
    service = EvidenceService()
    result = await service.generate_note(
        task_title=body.task_title,
        task_description=body.task_description,
        selected_literature=[item.model_dump() for item in body.selected_literature],
        case_title=body.case_title,
    )
    return EvidenceNoteResponse(**result)
