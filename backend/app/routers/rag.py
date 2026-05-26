from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.database import get_db

router = APIRouter(prefix="/rag", tags=["rag"])


class RAGSearchRequest(BaseModel):
    query: str
    course_id: int
    top_k: int = 5


class RAGSearchResult(BaseModel):
    chunk_id: int
    content: str
    chapter_title: str
    page_number: int
    score: float


@router.post("/search")
def search(request: RAGSearchRequest, db: Session = Depends(get_db)):
    # TODO: embed query, query ChromaDB, return top_k KnowledgeChunks
    return {"message": "RAG search not yet implemented", "results": []}


@router.post("/parse/{file_resource_id}")
def trigger_parse(file_resource_id: int, db: Session = Depends(get_db)):
    # TODO: parse file (PDF/DOCX), chunk, embed, store to ChromaDB + KnowledgeChunk
    return {"message": "Parse not yet implemented"}
