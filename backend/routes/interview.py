import os
import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from groq import AsyncGroq
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import InterviewSession

router = APIRouter(prefix="/api/interview", tags=["interview"])

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class InterviewChatRequest(BaseModel):
    messages: List[ChatMessage]
    interview_type: str  # Technical / HR / Mixed
    company_type: str    # FAANG-style / Product Startup / Service MNC / Banking Tech
    is_first_message: bool = False


class InterviewChatResponse(BaseModel):
    reply: str
    is_final_report: bool = False
    report: Optional[dict] = None


class SaveSessionRequest(BaseModel):
    user_email: str
    interview_type: str
    company_type: str
    score: int
    strengths: List[str] = []
    weaknesses: List[str] = []
    topics_to_revise: List[str] = []


class SessionResponse(BaseModel):
    id: str
    user_email: str
    interview_type: str
    company_type: str
    score: int
    date: str


# ---------------------------------------------------------------------------
# System prompts per company type
# ---------------------------------------------------------------------------

SYSTEM_PROMPTS = {
    "FAANG-style": (
        "You are a senior FAANG interviewer conducting a rigorous technical interview. "
        "Ask hard DSA questions covering arrays, trees, dynamic programming, and graphs. "
        "Ask only ONE question at a time. After each user answer, give concise 2-line feedback "
        "(what was good, what could be improved), then ask the next question. "
        "Keep track of how many questions you have asked. "
        "After you have asked and received answers for exactly 8 questions, output ONLY a final report "
        "in the EXACT format below (no extra text before or after):\n"
        "FINAL_REPORT:{\n"
        '  "overall_score": <0-100>,\n'
        '  "strengths": ["point1", "point2"],\n'
        '  "weaknesses": ["point1", "point2"],\n'
        '  "topics_to_revise": ["topic1", "topic2"]\n'
        "}"
    ),
    "Product Startup": (
        "You are an experienced interviewer at a fast-paced product startup. "
        "Focus on problem solving, practical coding, system design basics, and product thinking. "
        "Ask only ONE question at a time. After each answer, give concise 2-line feedback, "
        "then ask the next question. "
        "After 8 questions, output ONLY a final report "
        "in the EXACT format below (no extra text before or after):\n"
        "FINAL_REPORT:{\n"
        '  "overall_score": <0-100>,\n'
        '  "strengths": ["point1", "point2"],\n'
        '  "weaknesses": ["point1", "point2"],\n'
        '  "topics_to_revise": ["topic1", "topic2"]\n'
        "}"
    ),
    "Service MNC": (
        "You are a technical interviewer at a large service-based MNC (like TCS, Infosys, Wipro). "
        "Ask questions on Object-Oriented Programming, DBMS, Operating Systems basics, and simple coding. "
        "Ask only ONE question at a time. After each answer give concise 2-line feedback, "
        "then ask the next question. "
        "After 8 questions, output ONLY a final report "
        "in the EXACT format below (no extra text before or after):\n"
        "FINAL_REPORT:{\n"
        '  "overall_score": <0-100>,\n'
        '  "strengths": ["point1", "point2"],\n'
        '  "weaknesses": ["point1", "point2"],\n'
        '  "topics_to_revise": ["topic1", "topic2"]\n'
        "}"
    ),
    "Banking Tech": (
        "You are a technical interviewer at a banking/financial technology company. "
        "Focus on SQL, data structures, basic finance concepts, and analytical thinking. "
        "Ask only ONE question at a time. After each answer give concise 2-line feedback, "
        "then ask the next question. "
        "After 8 questions, output ONLY a final report "
        "in the EXACT format below (no extra text before or after):\n"
        "FINAL_REPORT:{\n"
        '  "overall_score": <0-100>,\n'
        '  "strengths": ["point1", "point2"],\n'
        '  "weaknesses": ["point1", "point2"],\n'
        '  "topics_to_revise": ["topic1", "topic2"]\n'
        "}"
    ),
}

# HR / Mixed modifiers
INTERVIEW_TYPE_MODIFIERS = {
    "Technical": "",
    "HR": (
        " Additionally, include behavioral and HR questions such as "
        "'Tell me about yourself', 'Why this company?', 'Describe a challenging project', "
        "leadership and teamwork scenarios."
    ),
    "Mixed": (
        " Mix technical questions with behavioral/HR questions. "
        "Alternate between technical and HR-style questions."
    ),
}


# ---------------------------------------------------------------------------
# POST /api/interview/chat
# ---------------------------------------------------------------------------
@router.post("/chat", response_model=InterviewChatResponse)
async def interview_chat(req: InterviewChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    # Build system prompt
    base_prompt = SYSTEM_PROMPTS.get(req.company_type)
    if not base_prompt:
        raise HTTPException(status_code=400, detail=f"Unknown company_type: {req.company_type}")

    modifier = INTERVIEW_TYPE_MODIFIERS.get(req.interview_type, "")
    system_prompt = base_prompt + modifier

    # Build messages for Groq
    messages = [{"role": "system", "content": system_prompt}]

    if req.is_first_message:
        messages.append({
            "role": "user",
            "content": "Start the interview. Introduce yourself briefly and ask the first question."
        })
    else:
        for msg in req.messages:
            messages.append({"role": msg.role, "content": msg.content})

    client = AsyncGroq(api_key=groq_api_key)

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=2000,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")

    reply = response.choices[0].message.content.strip()

    # Check for final report
    is_final = "FINAL_REPORT:" in reply
    report = None
    if is_final:
        try:
            report_json_str = reply.split("FINAL_REPORT:")[1].strip()
            # Clean up potential markdown backticks
            report_json_str = report_json_str.replace("```json", "").replace("```", "").strip()
            report = json.loads(report_json_str)
        except (json.JSONDecodeError, IndexError):
            # If parsing fails, still return the reply
            is_final = False

    return InterviewChatResponse(reply=reply, is_final_report=is_final, report=report)


# ---------------------------------------------------------------------------
# POST /api/interview/save-session
# ---------------------------------------------------------------------------
@router.post("/save-session", response_model=SessionResponse)
def save_session(req: SaveSessionRequest, db: Session = Depends(get_db)):
    session = InterviewSession(
        user_email=req.user_email,
        interview_type=req.interview_type,
        company_type=req.company_type,
        score=req.score,
        strengths=json.dumps(req.strengths),
        weaknesses=json.dumps(req.weaknesses),
        topics_to_revise=json.dumps(req.topics_to_revise),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return SessionResponse(
        id=session.id,
        user_email=session.user_email,
        interview_type=session.interview_type,
        company_type=session.company_type,
        score=session.score,
        date=session.date.isoformat(),
    )


# ---------------------------------------------------------------------------
# GET /api/interview/sessions/{email}
# ---------------------------------------------------------------------------
@router.get("/sessions/{email}")
def get_sessions(email: str, db: Session = Depends(get_db)):
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_email == email)
        .order_by(InterviewSession.date.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "interview_type": s.interview_type,
            "company_type": s.company_type,
            "score": s.score,
            "date": s.date.isoformat(),
        }
        for s in sessions
    ]
