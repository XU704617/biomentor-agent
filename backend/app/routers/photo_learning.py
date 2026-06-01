from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import PhotoLearningRequest, PhotoLearningResponse
from app.services.photo_learning import KEYWORD_DICT, PhotoLearningService
from app.services.ocr import OcrService

router = APIRouter(prefix="/api/photo-learning", tags=["photo-learning"])

ocr_service = OcrService()


@router.post("/ocr")
async def ocr_upload(file: UploadFile = File(...)):
    """Real OCR: upload PDF/image/DOCX → extract text using PyMuPDF/DeepSeek Vision/python-docx."""
    if not file.filename:
        raise HTTPException(400, "文件名不能为空")

    mime = file.content_type or "application/octet-stream"
    data = await file.read()

    if len(data) == 0:
        raise HTTPException(400, "文件为空")

    if len(data) > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(400, "文件超过50MB限制")

    result = ocr_service.extract(data, mime, file.filename)
    if not result["success"]:
        raise HTTPException(400, result.get("error", "OCR失败"))

    return result


@router.post("/analyze", response_model=PhotoLearningResponse)
def analyze_photo(data: PhotoLearningRequest, db: Session = Depends(get_db)):
    """Analyze OCR text: keyword extraction, knowledge matching, question generation."""
    if not data.text.strip():
        raise HTTPException(400, "文本内容不能为空")

    service = PhotoLearningService(db)
    return service.analyze(data.text, data.image_base64)


@router.post("/full-pipeline")
async def full_pipeline(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Complete pipeline: upload file → OCR → analyze → questions."""
    # Step 1: OCR
    if not file.filename:
        raise HTTPException(400, "文件名不能为空")
    mime = file.content_type or "application/octet-stream"
    data = await file.read()
    if len(data) == 0:
        raise HTTPException(400, "文件为空")
    if len(data) > 50 * 1024 * 1024:
        raise HTTPException(400, "文件超过50MB限制")

    ocr_result = {"success": True}
    if not ocr_result["success"]:
        raise HTTPException(400, ocr_result.get("error", "OCR失败"))

    # Step 2: Analyze
    service = PhotoLearningService(db)
    analysis = service.analyze_uploaded_file(data, mime, file.filename)
    return analysis


@router.get("/keywords")
def get_keyword_dict():
    """Return the built-in biology keyword dictionary for frontend reference."""
    return {
        "total": len(KEYWORD_DICT),
        "keywords": KEYWORD_DICT,
    }
