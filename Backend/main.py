from datetime import datetime, date
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from supabase_client import (
    fetch_application_by_number,
    fetch_questions,
    insert_application,
    is_connected,
    SUPABASE_URL
)

app = FastAPI(
    title="Licence Saathi (EasyDL) Backend API",
    description="Backend service powered by Supabase & FastAPI for Mparivahan Learner's Licence assistance.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------
class EligibilityRequest(BaseModel):
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    vehicle_class: str = Field(..., description="Vehicle class: MCWOG, MCWG, LMV")
    has_aadhaar: bool = True

class QuizSubmission(BaseModel):
    answers: Dict[int, int] = Field(..., description="Map of question ID to chosen option index")

# ----------------- Routes -----------------
@app.get("/")
def root():
    return {
        "service": "Licence Saathi Backend API",
        "status": "operational",
        "supabase_connected": is_connected,
        "supabase_url": SUPABASE_URL,
        "endpoints": [
            "/api/applications/{app_number}",
            "/api/questions",
            "/api/check-eligibility",
            "/api/quiz/submit"
        ]
    }

@app.get("/api/applications/{app_number}")
def get_application_status(app_number: str):
    """Query live or mock application status by application number."""
    record = fetch_application_by_number(app_number)
    if not record:
        raise HTTPException(status_code=404, detail=f"Application '{app_number}' not found. Try sample numbers: DL-2026-98124 or MH-2026-11492")
    return {
        "status": "success",
        "data": record
    }

@app.get("/api/track")
def track_application_query(app_no: str = Query(..., description="Application number")):
    """Query application status via ?app_no=... parameter, returning formatted timeline."""
    record = fetch_application_by_number(app_no)
    if not record:
        return {"success": False, "message": "Application not found"}
    timeline = [
        {
            "step": t["title"],
            "status": "done" if t.get("completed") else "pending",
            "date": t.get("date") if t.get("date") not in ["Pending", "In Progress"] else None
        }
        for t in record.get("timeline", [])
    ]
    return {
        "success": True,
        "data": record,
        "timeline": timeline
    }

@app.get("/api/questions")
def get_practice_questions(category: Optional[str] = Query(None, description="Category filter (Road Signs, Traffic Rules, Safety)"), limit: int = 15):
    """Retrieve RTO driving licence exam questions."""
    questions = fetch_questions(category=category, limit=limit)
    return {
        "status": "success",
        "count": len(questions),
        "data": questions
    }

@app.post("/api/check-eligibility")
def check_eligibility(req: EligibilityRequest):
    """Calculate age and determine driving licence eligibility based on Motor Vehicles Act rules."""
    try:
        birth_date = datetime.strptime(req.dob, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")
    
    today = date.today()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

    vehicle_class = req.vehicle_class.upper()
    eligible = False
    min_age = 18
    guidance = ""

    if vehicle_class in ["MCWOG", "MOTORCYCLE WITHOUT GEAR"]:
        min_age = 16
        eligible = age >= 16
        guidance = "Eligible for 50cc / gearless two-wheeler with parental/guardian consent if age is between 16 and 18."
    elif vehicle_class in ["MCWG", "MOTORCYCLE WITH GEAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for geared two-wheelers."
    elif vehicle_class in ["LMV", "LIGHT MOTOR VEHICLE", "CAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for non-transport cars and light passenger vehicles."
    elif vehicle_class in ["TRANS", "TRANSPORT", "COMMERCIAL"]:
        min_age = 20
        eligible = age >= 20
        guidance = "Requires minimum 1 year of holding a valid LMV licence before applying for commercial/transport badge."
    else:
        min_age = 18
        eligible = age >= 18
        guidance = f"Standard eligibility criteria for {vehicle_class}."

    return {
        "status": "success",
        "age": age,
        "vehicle_class": vehicle_class,
        "eligible": eligible,
        "minimum_age_required": min_age,
        "guidance": guidance,
        "required_documents": [
            "Aadhaar Card (e-KYC paperless verification)" if req.has_aadhaar else "Physical Address & ID Proof",
            "Proof of Age (Birth Certificate / 10th Marksheet / Passport)",
            "Self-declaration Medical Fitness (Form 1)"
        ]
    }

@app.post("/api/quiz/submit")
def submit_quiz(submission: QuizSubmission):
    """Score submitted RTO mock test questions."""
    all_questions = fetch_questions(limit=50)
    q_map = {q["id"]: q for q in all_questions}

    score = 0
    total = len(submission.answers)
    results = []

    for q_id, chosen_idx in submission.answers.items():
        if q_id in q_map:
            q = q_map[q_id]
            is_correct = (chosen_idx == q["correct_index"])
            if is_correct:
                score += 1
            results.append({
                "question_id": q_id,
                "is_correct": is_correct,
                "chosen_index": chosen_idx,
                "correct_index": q["correct_index"],
                "explanation": q.get("explanation", "")
            })

    # Standard RTO pass criterion is usually 60% (e.g. 9/15 or 12/20)
    pass_mark = max(1, int(total * 0.6))
    passed = score >= pass_mark

    return {
        "status": "success",
        "score": score,
        "total": total,
        "percentage": round((score / total) * 100, 1) if total > 0 else 0,
        "passed": passed,
        "pass_mark": pass_mark,
        "breakdown": results
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
