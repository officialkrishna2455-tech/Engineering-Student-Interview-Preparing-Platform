import os
import json
import re
from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import AsyncGroq

router = APIRouter(prefix="/api/gd", tags=["group-discussion"])

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str       # "user" | "assistant"
    content: str


class GDChatRequest(BaseModel):
    messages: List[ChatMessage]
    topic: str
    user_message: str


class GDChatResponse(BaseModel):
    reply: str
    is_final: bool = False
    scores: Optional[dict] = None


# ---------------------------------------------------------------------------
# System prompt builder
# ---------------------------------------------------------------------------

def build_system_prompt(topic: str, user_msg_count: int) -> str:
    base = (
        f"You are moderating a group discussion on: {topic}\n"
        "You play 3 participants:\n"
        "- Riya: strongly supportive, enthusiastic\n"
        "- Arjun: strongly against, concerned\n"
        "- Priya: neutral, wants balance\n\n"
        "After user speaks, respond as 1-2 participants "
        "(2-3 sentences each, natural debate style).\n"
        "Format response EXACTLY as:\n"
        "RIYA: [message]\n"
        "ARJUN: [message]\n\n"
        "Only include participants who would naturally respond. "
        "Keep it conversational and engaging like a real group discussion."
    )

    if user_msg_count >= 5:
        base += (
            "\n\nThis is the user's 5th (or more) contribution. "
            "After responding as participants, you MUST add the following score block "
            "at the end of your response. Use EXACTLY this format:\n"
            'GD_SCORE:{"clarity_score": <1-10>, "counter_handling": <1-10>, '
            '"leadership": <1-10>, "overall": <1-10>, '
            '"feedback": "<specific feedback about the user performance>"}'
        )

    return base


# ---------------------------------------------------------------------------
# POST /api/gd/chat
# ---------------------------------------------------------------------------
@router.post("/chat", response_model=GDChatResponse)
async def gd_chat(req: GDChatRequest):
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    # Count how many user messages exist (including the new one)
    user_msg_count = sum(1 for m in req.messages if m.role == "user") + 1

    system_prompt = build_system_prompt(req.topic, user_msg_count)

    # Build messages for Groq
    messages = [{"role": "system", "content": system_prompt}]

    for msg in req.messages:
        messages.append({"role": msg.role, "content": msg.content})

    # Add the new user message
    messages.append({"role": "user", "content": req.user_message})

    client = AsyncGroq(api_key=groq_api_key)

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.8,
            max_tokens=1500,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")

    reply = response.choices[0].message.content.strip()

    # Check for GD_SCORE in the response
    is_final = "GD_SCORE:" in reply
    scores = None
    if is_final:
        try:
            score_str = reply.split("GD_SCORE:")[1].strip()
            # Clean up potential markdown backticks or trailing content
            score_str = score_str.replace("```json", "").replace("```", "").strip()
            # Extract just the JSON object
            brace_start = score_str.index("{")
            brace_count = 0
            end_idx = brace_start
            for i in range(brace_start, len(score_str)):
                if score_str[i] == "{":
                    brace_count += 1
                elif score_str[i] == "}":
                    brace_count -= 1
                    if brace_count == 0:
                        end_idx = i + 1
                        break
            score_json = score_str[brace_start:end_idx]
            scores = json.loads(score_json)
            # Remove the GD_SCORE part from the visible reply
            reply = reply.split("GD_SCORE:")[0].strip()
        except (json.JSONDecodeError, IndexError, ValueError):
            is_final = False

    return GDChatResponse(reply=reply, is_final=is_final, scores=scores)
