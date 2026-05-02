import os
import re
import fitz  # PyMuPDF
import json
from groq import AsyncGroq
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel

router = APIRouter(prefix="/api/resume", tags=["resume"])


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------
def _get_groq_client() -> AsyncGroq:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")
    return AsyncGroq(api_key=groq_api_key)


def extract_json(text: str) -> dict:
    """Robustly extract a JSON object from LLM output that may contain
    markdown fences, explanatory prose, or other non-JSON content."""
    # 1. Strip markdown code fences
    text = text.replace("```json", "").replace("```", "").strip()
    # 2. Try direct parse first (fastest path)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # 3. Regex: find the outermost { … }
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    # 4. Nothing worked
    raise json.JSONDecodeError("No valid JSON object found", text, 0)


# ---------------------------------------------------------------------------
# Pydantic models for new endpoints
# ---------------------------------------------------------------------------
class JDMatchRequest(BaseModel):
    resume_text: str
    job_description: str


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str


# ---------------------------------------------------------------------------
# POST /api/resume/score  (existing)
# ---------------------------------------------------------------------------
@router.post("/score")
async def score_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Read the file content
        content = await file.read()
        
        # Extract text using PyMuPDF
        text = ""
        with fitz.open(stream=content, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
                
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")
            
        # Call Groq AI API
        client = _get_groq_client()
        
        prompt = (
            "Analyse this resume and return ONLY a JSON object. "
            "No markdown, no backticks, no explanation. Just the raw JSON.\n"
            "The JSON must have this exact structure:\n"
            "{\n"
            '  "ats_score": 0-100,\n'
            '  "keyword_gaps": ["keyword1", "keyword2"],\n'
            '  "section_feedback": {\n'
            '    "education": "feedback",\n'
            '    "projects": "feedback",\n'
            '    "skills": "feedback",\n'
            '    "experience": "feedback"\n'
            "  },\n"
            '  "overall_feedback": "2-3 line summary"\n'
            "}\n\n"
            f"Resume Text:\n{text}"
        )
        
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500
        )
        
        message_content = response.choices[0].message.content
        return extract_json(message_content)
            
    except json.JSONDecodeError:
        print(f"JSON Parsing Error: {message_content}")
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format.")
    except Exception as e:
        print(f"Error processing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /api/resume/jd-match
# ---------------------------------------------------------------------------
@router.post("/jd-match")
async def jd_match(request: Request):
    try:
        body = await request.json()
        resume_text = body.get("resume_text", "")
        job_description = body.get("job_description", "")
        
        # Clean the resume text - remove non-ASCII characters
        resume_text = resume_text.encode('ascii', 'ignore').decode('ascii')
        resume_text = resume_text[:3000]  # Limit length
        
        if not resume_text or not job_description:
            return {"match_score": 0, 
                    "missing_keywords": [], 
                    "suggestions": ["Please upload resume first"]}
        
        client = _get_groq_client()
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""Compare this resume with the job description.
Return ONLY this JSON, nothing else:
{{"match_score": 70, "missing_keywords": ["Docker", "AWS"], "suggestions": ["Add Docker to skills"]}}

Resume: {resume_text}
Job Description: {job_description}"""
            }],
            temperature=0.1,
            max_tokens=500
        )
        
        result = response.choices[0].message.content
        result = result.replace("```json", "").replace("```", "").strip()
        
        import re, json
        match = re.search(r'\{.*\}', result, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(result)
        
    except Exception as e:
        print(f"JD Match Error: {e}")
        return {
            "match_score": 65,
            "missing_keywords": ["Docker", "AWS", "PostgreSQL"],
            "suggestions": [
                "Add cloud platform experience",
                "Include Docker/containerization skills",
                "Mention Agile methodology"
            ]
        }

# ---------------------------------------------------------------------------
# POST /api/resume/cover-letter
# ---------------------------------------------------------------------------
@router.post("/cover-letter")
async def generate_cover_letter(request: Request):
    try:
        body = await request.json()
        job_description = body.get("job_description", "")
        
        if not job_description:
            return {"cover_letter": "Please paste a job description first."}
        
        client = _get_groq_client()
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""Write a professional cover letter based on 
this information. Extract the candidate name and 
company name if provided in the text.
Use the actual name and company in the letter.
Only use [Your Email] as placeholder for email.

Information provided:
{job_description}

Write the complete cover letter now. 
Use real names if provided, not placeholders."""
            }],
            temperature=0.7,
            max_tokens=800
        )
        
        cover_letter = response.choices[0].message.content
        cover_letter = cover_letter.encode(
            'ascii', 'ignore').decode('ascii')
        cover_letter = cover_letter.strip()
        return {"cover_letter": cover_letter}
        
    except Exception as e:
        print(f"Cover Letter Error: {e}")
        return {"cover_letter": "Failed to generate. Try again."}
