import os
import json
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import AsyncGroq

router = APIRouter(prefix="/api/offers", tags=["offers"])

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class OfferItem(BaseModel):
    company: str
    role: str
    ctc: float          # in LPA
    location: str
    bond: float         # years, 0 if none
    work_mode: str      # WFH / Hybrid / Office
    growth_rating: int   # 1-5


class AnalyseRequest(BaseModel):
    offers: List[OfferItem]


class AnalyseResponse(BaseModel):
    best_for_money: str
    best_for_growth: str
    best_for_balance: str
    summary: str


# ---------------------------------------------------------------------------
# POST /api/offers/analyse
# ---------------------------------------------------------------------------
@router.post("/analyse", response_model=AnalyseResponse)
async def analyse_offers(req: AnalyseRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    if len(req.offers) < 2:
        raise HTTPException(status_code=400, detail="At least 2 offers are required for comparison.")

    # Build a text description of all offers
    offers_text = "\n".join(
        f"- {o.company}: Role={o.role}, CTC={o.ctc} LPA, Location={o.location}, "
        f"Bond={o.bond} years, Work Mode={o.work_mode}, Growth Rating={o.growth_rating}/5"
        for o in req.offers
    )

    system_prompt = (
        "You are a career advisor helping a fresh graduate compare job offers.\n"
        "Analyse the following offers and respond in EXACTLY this JSON format "
        "(no extra text, no markdown fences):\n"
        "{\n"
        '  "best_for_money": "<company name>: <1-2 sentence reason>",\n'
        '  "best_for_growth": "<company name>: <1-2 sentence reason>",\n'
        '  "best_for_balance": "<company name>: <1-2 sentence reason>",\n'
        '  "summary": "<2-3 line overall recommendation>"\n'
        "}\n\n"
        "Consider CTC, bond period (lower is better), work mode flexibility, "
        "growth potential, and location when making your analysis."
    )

    user_message = f"Here are my job offers:\n{offers_text}"

    client = AsyncGroq(api_key=groq_api_key)

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.6,
            max_tokens=800,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")

    reply = response.choices[0].message.content.strip()

    # Clean up potential markdown fences
    reply = reply.replace("```json", "").replace("```", "").strip()

    try:
        result = json.loads(reply)
    except json.JSONDecodeError:
        # Try to extract JSON from the response
        try:
            start = reply.index("{")
            end = reply.rindex("}") + 1
            result = json.loads(reply[start:end])
        except (ValueError, json.JSONDecodeError):
            raise HTTPException(
                status_code=500,
                detail="Failed to parse AI response. Please try again."
            )

    return AnalyseResponse(
        best_for_money=result.get("best_for_money", "N/A"),
        best_for_growth=result.get("best_for_growth", "N/A"),
        best_for_balance=result.get("best_for_balance", "N/A"),
        summary=result.get("summary", "N/A"),
    )
