from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(prefix="/materials", tags=["materials"])


@router.post("/upload")
async def upload_material(
    file: UploadFile = File(...),
    course_id: int = Form(...),
    db: Session = Depends(get_db),
):
    # TODO: save file to disk, create FileResource record, trigger parse pipeline
    return {"message": "Upload not yet implemented"}


@router.get("/")
def list_materials(course_id: int, db: Session = Depends(get_db)):
    # TODO: list FileResource records filtered by course_id
    return {"message": "List not yet implemented"}


@router.get("/{material_id}")
def get_material(material_id: int, db: Session = Depends(get_db)):
    # TODO: get single FileResource with knowledge_chunks
    return {"message": "Get not yet implemented"}


@router.delete("/{material_id}", status_code=204)
def delete_material(material_id: int, db: Session = Depends(get_db)):
    # TODO: delete FileResource and associated file on disk
    return None
