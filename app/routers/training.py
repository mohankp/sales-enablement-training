from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.ingestion import process_pdf_document
from app.assessment import start_new_session, generate_question, submit_answer
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class StartSessionRequest(BaseModel):
    user_id: int
    project_id: Optional[int] = None
    topic_id: Optional[int] = None

class AnswerRequest(BaseModel):
    session_id: int
    question_text: str
    user_answer: str

from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks, Form

@router.post("/upload_pdf")
async def upload_pdf(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...), 
    context: Optional[str] = Form(None),
    project_id: Optional[int] = Form(None)
):
    return await process_pdf_document(file, background_tasks, context, project_id)

@router.post("/start_assessment")
def start_assessment(request: StartSessionRequest, db: Session = Depends(get_db)):
    return start_new_session(db, request.user_id, request.project_id, request.topic_id)

@router.get("/get_question/{session_id}")
def get_next_question(session_id: int, db: Session = Depends(get_db)):
    return generate_question(db, session_id)

@router.post("/submit_answer")
def submit_assessment_answer(request: AnswerRequest, db: Session = Depends(get_db)):
    return submit_answer(db, request.session_id, request.user_answer, request.question_text)
