from fastapi import APIRouter, Query

from app.schemas import LiteratureSearchResponse, LiteratureSearchItem
from app.services.literature_service import LiteratureSearchService

router = APIRouter(prefix="/api/literature", tags=["literature"])


@router.get("/search", response_model=LiteratureSearchResponse)
def search_literature(
    q: str = Query(..., min_length=1, description="检索关键词"),
    limit: int = Query(5, ge=1, le=50, description="返回结果数量上限"),
):
    service = LiteratureSearchService()
    result = service.search(query=q, limit=limit)
    return LiteratureSearchResponse(
        query=result["query"],
        results=[LiteratureSearchItem(**item) for item in result["results"]],
        source=result["source"],
        message=result["message"],
    )