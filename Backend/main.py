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

class ApplicationSubmission(BaseModel):
    applicant_name: str = Field(..., description="Full legal name of the applicant")
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD format")
    rto_code: str = Field(..., description="State RTO circle code")
    vehicle_classes: List[str] = Field(..., description="Selected vehicle classes (e.g. MCWG, LMV)")
    mobile: Optional[str] = Field(None, description="Citizen 10-digit mobile number")
    email: Optional[str] = Field(None, description="Citizen email address")
    address: Optional[str] = Field(None, description="Residential address")
    verification_mode: Optional[str] = Field("digilocker", description="Verification mode (digilocker or manual)")
    status: Optional[str] = Field("Form 2 Submitted", description="Initial application status")

# ----------------- Routes -----------------
@app.get("/")
def root():
    return {
        "service": "Licence Saathi Backend API",
        "status": "operational",
        "supabase_connected": is_connected,
        "supabase_url": SUPABASE_URL,
        "endpoints": [
            "POST /api/applications",
            "GET /api/applications/{app_number}",
            "GET /api/track",
            "GET /api/questions",
            "POST /api/check-eligibility",
            "POST /api/quiz/submit"
        ]
    }

@app.post("/api/applications")
def create_application(app_data: ApplicationSubmission):
    """Submit a new Learner's Licence application into Supabase or fallback store."""
    payload = app_data.model_dump()
    payload["submission_date"] = datetime.now().strftime("%Y-%m-%d")
    payload["stage_index"] = 0
    payload["timeline"] = [
        {"title": "Application Submitted (Form 2)", "date": payload["submission_date"], "completed": True},
        {"title": "Document Scrutiny", "date": "In Progress", "completed": False, "active": True},
        {"title": "LL Test Slot Booking", "date": "Pending", "completed": False},
        {"title": "Learner's Licence Approval", "date": "Pending", "completed": False}
    ]
    result = insert_application(payload)
    return {
        "status": "success",
        "message": "Application submitted successfully per CMVR Rule 14",
        "data": result
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

    if vehicle_class in ["MCWOG_50", "GEARLESS-50CC", "MOPED"]:
        min_age = 16
        eligible = age >= 16
        guidance = "Eligible for 50cc / gearless two-wheeler with parental/guardian consent (Form 2 Part II) if age is between 16 and 18."
    elif vehicle_class in ["MCWG_LMV", "COMBO", "BOTH", "BIKE_CAR", "COMBO-BIKE-CAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for dual combined licence for both Geared Motorcycle (MCWG) and Private Car (LMV). Statutory fee: ₹350."
    elif vehicle_class in ["LMV", "LIGHT MOTOR VEHICLE", "CAR", "LMV-CAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for non-transport cars, hatchbacks, sedans, and light passenger vehicles under Section 4 of MV Act."
    elif vehicle_class in ["MCWG", "MOTORCYCLE WITH GEAR", "MOTORCYCLE-GEAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for standard geared motorcycles and motorbikes."
    elif vehicle_class in ["MCWOG", "GEARLESS-SCOOTER"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for automatic scooters exceeding 50cc engine capacity (e.g. Activa, Jupiter, EV scooters)."
    elif vehicle_class in ["TRANS", "TRANSPORT", "COMMERCIAL", "COMMERCIAL-TRANSPORT"]:
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
