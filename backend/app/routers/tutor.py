"""
AI tutor router for general chat and stream responses.
"""

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.knowledge import KnowledgeService
from app.services.llm import get_llm
from app.services.prompts import TUTOR_SYSTEM

router = APIRouter(prefix="/api/tutor", tags=["tutor"])


@router.post("/chat")
def tutor_chat(payload: dict, db: Session = Depends(get_db)):
    query = str(payload.get("query", "") or "").strip()
    history = payload.get("history", [])
    use_rag = payload.get("use_rag", True)
    mode = payload.get("mode", "tutor")
    context = str(payload.get("context", "") or "").strip()

    if not query:
        raise HTTPException(400, "query不能为空")

    llm = get_llm()
    messages = [{"role": "system", "content": TUTOR_SYSTEM}]

    if mode == "socratic":
        messages[0]["content"] += "\n\n当前模式：苏格拉底式教学。请优先通过提问引导学生自己推导答案。"
    elif mode == "explain":
        messages[0]["content"] += "\n\n当前模式：详细解释。请用清晰、易懂、结构化的方式回答。"

    if context:
        messages[0]["content"] += f"\n\n当前学习上下文如下，请优先基于它回答：\n{context[:4000]}"

    if use_rag:
        knowledge = KnowledgeService(db)
        rag_result = knowledge.search_all(query, top_k=3)
        if rag_result.get("answer"):
            messages[0]["content"] += f"\n\n补充参考资料：\n{str(rag_result['answer'])[:2000]}"

    for item in history[-10:]:
        messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})
    messages.append({"role": "user", "content": query})

    response = llm.chat(messages, temperature=0.5, max_tokens=1000)
    return {
        "query": query,
        "answer": response.content,
        "mode": mode,
        "tokens": response.tokens_total,
        "model": response.model,
    }


@router.post("/chat/stream")
async def tutor_chat_stream(payload: dict, db: Session = Depends(get_db)):
    query = str(payload.get("query", "") or "").strip()
    history = payload.get("history", [])
    mode = payload.get("mode", "tutor")
    use_rag = payload.get("use_rag", True)
    context = str(payload.get("context", "") or "").strip()

    if not query:
        raise HTTPException(400, "query不能为空")

    llm = get_llm()
    messages = [{"role": "system", "content": TUTOR_SYSTEM}]

    if mode == "socratic":
        messages[0]["content"] += "\n\n当前模式：苏格拉底式教学。请优先通过提问引导学生自己推导答案。"
    elif mode == "explain":
        messages[0]["content"] += "\n\n当前模式：详细解释。请用清晰、易懂、结构化的方式回答。"

    if context:
        messages[0]["content"] += f"\n\n当前学习上下文如下，请优先基于它回答：\n{context[:4000]}"

    if use_rag:
        knowledge = KnowledgeService(db)
        rag_result = knowledge.search_all(query, top_k=3)
        if rag_result.get("answer"):
            messages[0]["content"] += f"\n\n补充参考资料：\n{str(rag_result['answer'])[:1500]}"

    for item in history[-10:]:
        messages.append({"role": item.get("role", "user"), "content": item.get("content", "")})
    messages.append({"role": "user", "content": query})

    async def generate():
        try:
            for chunk in llm.chat_stream(messages, temperature=0.5, max_tokens=1000):
                yield f"data: {json.dumps({'content': chunk}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'error': str(exc)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/health")
def tutor_health():
    llm = get_llm()
    return {"status": "ok", "llm_available": llm.available, "model": llm.settings.resolved_llm_model()}
