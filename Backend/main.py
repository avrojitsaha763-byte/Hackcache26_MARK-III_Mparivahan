import asyncio
import time
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Header, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from supabase_client import (
    fetch_application_by_number,
    fetch_all_applications,
    insert_application,
    update_application_status,
    fetch_questions,
    fetch_signs,
    book_appointment_slot,
    fetch_slot,
    authenticate_officer,
    list_officers,
    is_connected,
    SUPABASE_URL
)

app = FastAPI(
    title="Licence Saathi (EasyDL) Backend API",
    description="Enterprise-grade Indian RTO & Sarathi Parivahan Backend service powered by Supabase & FastAPI.",
    version="2.0.0"
)

# Enable CORS for Vite SPA dev server and production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------
class EligibilityRequest(BaseModel):
    dob: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD format")
    age: Optional[int] = Field(None, description="Current completed age in years")
    vehicle_class: str = Field(..., description="Vehicle class: MCWOG_50, MCWG, MCWOG, LMV, COMBO, TRANS")
    has_aadhaar: bool = True

class QuizSubmission(BaseModel):
    answers: Dict[str, int] = Field(..., description="Map of question ID to chosen option index")

class ApplicationSubmission(BaseModel):
    applicant_name: str = Field(..., description="Full legal name of the applicant")
    dob: Optional[str] = Field("2004-06-15", description="Date of birth in YYYY-MM-DD format")
    rto_code: str = Field(..., description="State RTO circle code (e.g. DL-01, MH-02, KA-01)")
    vehicle_classes: List[str] = Field(..., description="Selected vehicle classes (e.g. ['MCWG', 'LMV'])")
    mobile: Optional[str] = Field(None, description="Citizen 10-digit mobile number")
    phone: Optional[str] = Field(None, description="Alternative mobile number field")
    email: Optional[str] = Field(None, description="Citizen email address")
    address: Optional[str] = Field(None, description="Residential address")
    verification_mode: Optional[str] = Field("digilocker", description="Verification mode (digilocker or manual)")
    status: Optional[str] = Field("Under Scrutiny", description="Initial application status")
    fee_amount: Optional[str] = Field(None, description="Fee amount string")
    documents: Optional[List[Dict[str, Any]]] = Field(None, description="Attached or e-KYC documents")

class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="New status string")
    remarks: Optional[str] = Field("", description="Officer remarks or correction instructions")
    officer_name: Optional[str] = Field("RTO Scrutiny Officer", description="Name of the scrutiny officer")

class SlotBookingRequest(BaseModel):
    app_no: str = Field(..., description="Application or Form 3 LL number")
    applicant_name: Optional[str] = Field("Citizen Applicant", description="Name of candidate")
    track_type: str = Field("car", description="Track type: car or bike")
    ground: str = Field("IDTR-DELHI", description="RTO track identifier")
    ground_name: Optional[str] = Field(None, description="Full name of RTO automated track")
    test_date: str = Field(..., description="Appointment date in YYYY-MM-DD format")
    slot_time: str = Field("09:30 AM - 11:00 AM", description="Time window for driving test")

class OfficerLoginRequest(BaseModel):
    identifier: str = Field(..., description="Officer Employee ID or Official Email")
    password: str = Field(..., description="Secure officer password")

class ChatRequest(BaseModel):
    query: str = Field(..., description="Citizen natural language query")
    lang: Optional[str] = Field("en", description="Language: en or hi")

class DigiLockerAuthRequest(BaseModel):
    loginType: str = Field(..., description="request_otp, verify_otp, or password")
    phone: Optional[str] = Field(None, description="Citizen 10-digit mobile number")
    username: Optional[str] = Field(None, description="Demo username")
    password: Optional[str] = Field(None, description="Password / PIN")
    otp: Optional[str] = Field(None, description="6-digit verification OTP")

class DigiLockerDocRequest(BaseModel):
    vehicleClass: Optional[str] = Field("motorcycle-gear", description="e.g. gearless-50cc or motorcycle-gear")

# ----------------- Routes -----------------

@app.get("/")
def root():
    """System Diagnostics & Active Service Capabilities."""
    return {
        "service": "Licence Saathi (EasyDL) Backend API",
        "status": "operational",
        "version": "2.0.0",
        "statutory_compliance": "Motor Vehicles Act 1988 | CMVR 1989 | DPDPA 2023",
        "supabase_connected": is_connected,
        "supabase_url": SUPABASE_URL,
        "active_endpoints": [
            "POST /api/check-eligibility (CMVR Rule 32 Dynamic Fee & MV Act Sec 4)",
            "POST /api/applications (Form 2 Submission with Dual Storage)",
            "GET /api/applications (List Applications for RTO Desk)",
            "GET /api/applications/{app_number} (Full Application Dossier)",
            "PUT /api/applications/{app_number}/status (Scrutiny Approval & Form 3 Minting)",
            "GET /api/track (Timeline Tracker with Rule 11(3) Urgency Countdown)",
            "GET /api/questions (STALL Exam Question Bank)",
            "POST /api/quiz/submit (Automated LL Test Grader & Explanations)",
            "GET /api/signs (Master Traffic Signs Catalog with Audio Script)",
            "POST /api/slots/book (ADTT Track Slot Booking with Rule 15 Verification)",
            "GET /api/slots/{slot_id} (Appointment Slip Retrieval)",
            "POST /api/admin/login (Dedicated RTO Officer Authentication)",
            "GET /api/admin/officers (Authorized Transport Officers)",
            "POST /api/chat (Multilingual Saathi AI Citizen Assistant)",
            "POST /api/auth (DigiLocker / UIDAI OAuth & OTP Simulation)",
            "POST /api/documents (API Setu Document Retrieval & Age Verification)"
        ]
    }

# --- Phase 2: Multi-Vehicle & Dynamic Fee Endpoints ---

@app.post("/api/check-eligibility")
def check_eligibility(req: EligibilityRequest):
    """
    Validate applicant age and compute statutory fees under Motor Vehicles Act Section 4
    and Central Motor Vehicles Rules (CMVR) 1989 Rule 32.
    """
    age = req.age
    if age is None and req.dob:
        try:
            birth_date = datetime.strptime(req.dob, "%Y-%m-%d").date()
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")
    elif age is None:
        age = 18

    vclass = req.vehicle_class.upper()
    eligible = False
    min_age = 18
    guidance = ""
    fee_breakdown = []
    total_fee = 200

    if vclass in ["MCWOG_50", "GEARLESS-50CC", "MOPED"]:
        min_age = 16
        eligible = age >= 16
        guidance = "Eligible for 50cc / gearless two-wheeler with parental/guardian consent (Form 2 Part II) if age is between 16 and 18."
        fee_breakdown = [
            {"label": "50cc Moped Learner's Licence Fee", "amount": 150},
            {"label": "Online STALL Test Fee", "amount": 50}
        ]
        total_fee = 200
    elif vclass in ["MCWG_LMV", "COMBO", "BOTH", "BIKE_CAR", "COMBO-BIKE-CAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for dual combined licence for both Geared Motorcycle (MCWG) and Private Car (LMV). Statutory fee: ₹350."
        fee_breakdown = [
            {"label": "Motorcycle with Gear (MCWG) LL Fee", "amount": 150},
            {"label": "Light Motor Vehicle (LMV) Car LL Fee", "amount": 150},
            {"label": "Online STALL Computer Test Fee", "amount": 50}
        ]
        total_fee = 350
    elif vclass in ["LMV", "LIGHT MOTOR VEHICLE", "CAR", "LMV-CAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for non-transport cars, hatchbacks, sedans, and light passenger vehicles under Section 4 of MV Act."
        fee_breakdown = [
            {"label": "Private Car (LMV) LL Fee", "amount": 150},
            {"label": "Online STALL Test Fee", "amount": 50}
        ]
        total_fee = 200
    elif vclass in ["MCWG", "MOTORCYCLE WITH GEAR", "MOTORCYCLE-GEAR"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for standard geared motorcycles and motorbikes under MV Act Section 4."
        fee_breakdown = [
            {"label": "Geared Motorcycle (MCWG) LL Fee", "amount": 150},
            {"label": "Online STALL Test Fee", "amount": 50}
        ]
        total_fee = 200
    elif vclass in ["MCWOG", "GEARLESS-SCOOTER"]:
        min_age = 18
        eligible = age >= 18
        guidance = "Eligible for automatic scooters exceeding 50cc engine capacity (e.g. Activa, Jupiter, EV scooters)."
        fee_breakdown = [
            {"label": "Gearless Scooter LL Fee", "amount": 150},
            {"label": "Online STALL Test Fee", "amount": 50}
        ]
        total_fee = 200
    elif vclass in ["TRANS", "TRANSPORT", "COMMERCIAL", "COMMERCIAL-TRANSPORT"]:
        min_age = 20
        eligible = age >= 20
        guidance = "Requires minimum 1 year of holding a valid LMV licence before applying for commercial/transport badge."
        fee_breakdown = [
            {"label": "Commercial Transport (TRANS) LL Fee", "amount": 200},
            {"label": "RTO Driving Test Slot Fee", "amount": 100}
        ]
        total_fee = 300
    else:
        min_age = 18
        eligible = age >= 18
        guidance = f"Standard statutory criteria for vehicle category {vclass}."
        fee_breakdown = [{"label": "Standard LL Fee", "amount": 150}, {"label": "Test Fee", "amount": 50}]
        total_fee = 200

    return {
        "status": "success",
        "age": age,
        "vehicle_class": vclass,
        "eligible": eligible,
        "minimum_age_required": min_age,
        "guidance": guidance,
        "fee_details": {
            "breakdown": fee_breakdown,
            "total": total_fee,
            "rule_citation": "Central Motor Vehicles Rules 1989, Rule 32"
        },
        "required_documents": [
            "Aadhaar Card (e-KYC paperless verification)" if req.has_aadhaar else "Physical Address & ID Proof",
            "Proof of Age (Birth Certificate / 10th Marksheet / Passport)",
            "Self-declaration Medical Fitness (Form 1)"
        ]
    }

@app.post("/api/applications")
def create_application(app_data: ApplicationSubmission):
    """Submit a new Form 2 Learner's Licence application into Supabase with dual fallback."""
    payload = app_data.model_dump()
    payload["submission_date"] = datetime.now().strftime("%Y-%m-%d")
    payload["stage_index"] = 0
    payload["phone"] = payload.get("phone") or payload.get("mobile") or "+91 98765 00000"
    
    # Generate timeline
    payload["timeline"] = [
        {"step": "Application Submitted & Fee Paid", "title": "Application Submitted & Fee Paid", "date": payload["submission_date"], "status": "done", "completed": True},
        {"step": "DigiLocker / Manual Document Scrutiny", "title": "Document Scrutiny", "date": "In Progress", "status": "active", "completed": False, "active": True},
        {"step": "RTO Scrutiny Desk Approval", "title": "RTO Scrutiny Approval", "date": "Pending", "status": "pending", "completed": False},
        {"step": "Learner's Licence Issued (Form 3)", "title": "Learner's Licence Issued (Form 3)", "date": "Pending", "status": "pending", "completed": False}
    ]

    result = insert_application(payload)
    return {
        "status": "success",
        "message": "Form 2 Application successfully submitted per CMVR 1989 Rule 14",
        "data": result["data"]
    }

# --- Phase 3: Application Status & Rule 11(3) Urgency Tracker ---

@app.get("/api/applications/{app_number}")
def get_application_status(app_number: str):
    """Retrieve full application dossier by application reference number."""
    record = fetch_application_by_number(app_number)
    if not record:
        raise HTTPException(
            status_code=404, 
            detail=f"Application '{app_number}' not found. Try sample numbers: DL-2026-98124, MH-2026-11492, or KA-2026-55319"
        )
    return {
        "status": "success",
        "data": record
    }

@app.get("/api/track")
def track_application_query(app_no: str = Query(..., description="Application number to track")):
    """
    Search application timeline and compute CMVR Rule 11(3) 7-day automatic cancellation countdown.
    """
    clean_no = app_no.strip().upper()
    record = fetch_application_by_number(clean_no)
    if not record:
        return {
            "success": False,
            "message": f"Application '{clean_no}' not found in national registry."
        }

    # Calculate Rule 11(3) remaining window (7 days from submission)
    days_remaining = 7
    try:
        sub_date_str = record.get("submission_date") or record.get("created_at", "2026-10-24")[:10]
        sub_date = datetime.strptime(sub_date_str, "%Y-%m-%d").date()
        days_passed = (date.today() - sub_date).days
        days_remaining = max(0, 7 - days_passed)
    except Exception:
        days_remaining = 5

    timeline = record.get("timeline", [])
    formatted_timeline = [
        {
            "step": t.get("step") or t.get("title", ""),
            "status": t.get("status", "done" if t.get("completed") else "pending"),
            "date": t.get("date") if t.get("date") not in ["Pending", "In Progress", None] else None
        }
        for t in timeline
    ]

    return {
        "success": True,
        "data": {
            **record,
            "rule11_days_remaining": days_remaining,
            "rule11_status": "urgent" if days_remaining <= 3 else "normal"
        },
        "timeline": formatted_timeline
    }

# --- Phase 4: STALL Exam Simulator & Master Traffic Signs ---

@app.get("/api/questions")
def get_practice_questions(
    category: Optional[str] = Query(None, description="Category filter (Road Signs, Traffic Rules, Safety)"), 
    limit: int = 15
):
    """Retrieve official MoRTH STALL exam questions."""
    questions = fetch_questions(category=category, limit=limit)
    return {
        "status": "success",
        "count": len(questions),
        "data": questions
    }

@app.post("/api/quiz/submit")
def submit_quiz(submission: QuizSubmission):
    """Score submitted RTO mock test against statutory 60% pass mark."""
    all_questions = fetch_questions(limit=50)
    q_map = {str(q["id"]): q for q in all_questions}

    score = 0
    total = len(submission.answers)
    results = []

    for q_id_str, chosen_idx in submission.answers.items():
        if q_id_str in q_map:
            q = q_map[q_id_str]
            correct_idx = q.get("correct_index", 0)
            is_correct = (chosen_idx == correct_idx)
            if is_correct:
                score += 1
            results.append({
                "question_id": q_id_str,
                "is_correct": is_correct,
                "chosen_index": chosen_idx,
                "correct_index": correct_idx,
                "explanation": q.get("explanation", "Standard MoRTH statutory driving rule.")
            })

    # Standard RTO pass criterion is 60% (9/15)
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

@app.get("/api/signs")
def get_traffic_signs(category: Optional[str] = Query(None, description="Sign category: Mandatory, Cautionary, Informatory")):
    """Retrieve master Indian RTO traffic signs repository."""
    signs = fetch_signs(category=category)
    return {
        "status": "success",
        "count": len(signs),
        "data": signs
    }

# --- Phase 5: RTO Scrutiny Desk, ADTT Slot Booking & Saathi AI ---

@app.get("/api/admin/applications")
def list_admin_applications(
    rto_code: Optional[str] = Query(None, description="State RTO Circle Filter (DL-01, MH-02, KA-01)"),
    status: Optional[str] = Query(None, description="Status filter")
):
    """List applications for the Official RTO Scrutiny Desk."""
    apps = fetch_all_applications(rto_code=rto_code, status=status)
    return {
        "status": "success",
        "count": len(apps),
        "data": apps
    }

@app.put("/api/applications/{app_number}/status")
def update_status(app_number: str, req: StatusUpdateRequest):
    """
    RTO Scrutiny action: Approve application & issue digital Form 3 LL number,
    or dispatch correction notice with officer remarks.
    """
    updated = update_application_status(
        app_number=app_number,
        new_status=req.status,
        remarks=req.remarks or "",
        officer_name=req.officer_name or "RTO Officer"
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Application '{app_number}' not found.")
    return {
        "status": "success",
        "message": f"Status updated to '{req.status}'",
        "data": updated
    }

@app.post("/api/slots/book")
def book_slot(req: SlotBookingRequest):
    """
    Book an appointment slot on an Automated Driving Test Track (ADTT)
    validating CMVR Rule 15 constraints.
    """
    result = book_appointment_slot(req.model_dump())
    return {
        "status": "success",
        "message": "Appointment slot confirmed per CMVR Rule 15",
        "data": result["data"]
    }

@app.get("/api/slots/{slot_id}")
def get_slot_details(slot_id: str):
    """Fetch booked ADTT appointment slip by ID."""
    slot = fetch_slot(slot_id)
    if not slot:
        raise HTTPException(status_code=404, detail=f"Appointment slot '{slot_id}' not found.")
    return {
        "status": "success",
        "data": slot
    }

@app.post("/api/chat")
def saathi_ai_chat(req: ChatRequest):
    """
    Multilingual 24/7 Saathi AI citizen assistant responding to statutory questions.
    """
    query = req.query.lower()
    is_hindi = req.lang == "hi"

    if any(k in query for k in ["7", "day", "दिन", "cancel", "रद्द", "rule 11"]):
        reply = (
            "नियम 11(3) CMVR (कर्नाटक एवं सारथी पोर्टल) के अनुसार, आवेदन जमा करने के 7 दिनों के भीतर ऑनलाइन परीक्षा देना अनिवार्य है। यदि आप 7 दिनों में परीक्षा नहीं देते, तो आवेदन स्वतः रद्द हो जाता है।"
            if is_hindi else
            "Under Rule 11(3) of CMVR (enforced on Sarathi Parivahan in Karnataka and multiple states), applicants must take the online LL test within 7 days of application submission, failing which the application is automatically cancelled and fees are forfeited."
        )
    elif any(k in query for k in ["30", "wait", "permanent", "स्थायी", "rule 15", "rule15"]):
        reply = (
            "नियम 15 CMVR के तहत, स्थायी ड्राइविंग टेस्ट देने से पहले आपके पास कम से कम 30 दिनों तक वैध लर्नर्स लाइसेंस होना अनिवार्य है। यह 180 दिनों (6 महीने) तक पूरे भारत में वैध रहता है।"
            if is_hindi else
            "Under Rule 15 of CMVR, you must hold a valid Form 3 Learner's Licence for a minimum of 30 days before appearing for the permanent DL practical driving test. The Learner's Licence remains valid for 180 days across India."
        )
    elif any(k in query for k in ["fee", "cost", "फीस", "रुपये", "rupee", "paisa", "rule 32"]):
        reply = (
            "CMVR नियम 32 के अनुसार: सिंगल क्लास (केवल बाइक या केवल कार) = ₹200 (₹150 LL + ₹50 टेस्ट)। बाइक + कार कॉम्बो = ₹350 (₹150 + ₹150 + ₹50)। कमर्शियल ट्रांसपोर्ट = ₹300।"
            if is_hindi else
            "Per CMVR Rule 32: Single category (Motorcycle or Car) = ₹200 (₹150 LL + ₹50 test). Dual Bike + Car combo = ₹350 (₹150 MCWG + ₹150 LMV + ₹50 test). Commercial Transport = ₹300."
        )
    elif any(k in query for k in ["adtt", "track", "parking", "gradient", "ढलान", "रिवर्स", "पार्किंग"]):
        reply = (
            "स्वचालित टेस्ट ट्रैक (ADTT) पर मुख्य परीक्षण: 1) 1:6 ढलान पर कार रोकें और बिना 15 सेमी से अधिक पीछे लुढ़के आगे बढ़ें। 2) 3 मिनट में समानांतर पार्किंग करें। 3) अनिवार्य सीटबेल्ट बांधें।"
            if is_hindi else
            "Key Automated Driving Test Track (ADTT) requirements: 1) On a 1:6 uphill gradient, restart without rolling back >15 cm (6 inches). 2) Complete parallel parking in 3 minutes without touching boundary sensor poles. 3) Fasten seatbelt before moving."
        )
    else:
        reply = (
            "सटीक आरटीओ नियमों, फॉर्म 2 आवेदन अथवा टेस्ट स्लॉट बुकिंग हेतु सारथी साथी पोर्टल के मेन्यू विकल्पों का उपयोग करें।"
            if is_hindi else
            "For official transport regulations, Form 2 assistance, or appointment booking, explore the guided features on Licence Saathi or visit parivahan.gov.in."
        )

    return {
        "status": "success",
        "query": req.query,
        "lang": req.lang,
        "reply": reply
    }

# --- Phase 6: Officer Authentication Endpoints ---

@app.post("/api/admin/login")
def officer_login(req: OfficerLoginRequest):
    """Authenticate an RTO scrutiny officer and issue a verified session token."""
    officer = authenticate_officer(req.identifier, req.password)
    if not officer:
        raise HTTPException(
            status_code=401, 
            detail="Invalid Officer Credentials. Ensure you use an authorized Employee ID (e.g. RTO-OFFICER-DL01) and valid password."
        )
    return {
        "status": "success",
        "message": f"Welcome, Officer {officer['name']} ({officer['rto']})",
        "data": officer
    }

@app.get("/api/admin/officers")
def get_authorized_officers():
    """List authorized RTO scrutiny officers for jurisdiction reference."""
    officers = list_officers()
    return {
        "status": "success",
        "count": len(officers),
        "data": officers
    }

# --- DigiLocker & API Setu Verification Endpoints ---

@app.post("/api/auth")
@app.post("/api/digilocker/auth")
async def digilocker_auth(req: DigiLockerAuthRequest):
    """
    DigiLocker / Aadhaar Authentication Handler:
    - Flow A: Request OTP via registered mobile number
    - Flow B: Verify OTP (accepts demo static OTP '123456')
    - Flow C: Username & PIN/Password (demo_user / 123456)
    """
    try:
        # Simulate network latency for realism
        await asyncio.sleep(0.8)

        # FLOW A: User requests an OTP via Phone Number
        if req.loginType == "request_otp":
            if not req.phone or len(req.phone) < 10:
                return JSONResponse(status_code=400, content={"error": "Invalid phone"})
            return JSONResponse(
                status_code=200, 
                content={
                    "success": True, 
                    "message": "OTP sent to registered mobile.", 
                    "txnId": f"TXN-{int(time.time() * 1000)}"
                }
            )

        # FLOW B: User submits the OTP
        if req.loginType == "verify_otp":
            # For the live demo, we accept a static OTP "123456"
            if req.otp != "123456":
                return JSONResponse(status_code=401, content={"error": "Invalid OTP"})
            return JSONResponse(status_code=200, content={"success": True, "token": "mock_oauth_token_8892"})

        # FLOW C: User logs in with Username & PIN/Password
        if req.loginType == "password":
            if req.username == "demo_user" and req.password == "123456":
                return JSONResponse(status_code=200, content={"success": True, "token": "mock_oauth_token_8892"})
            return JSONResponse(status_code=401, content={"error": "Invalid credentials"})

        return JSONResponse(status_code=400, content={"error": "Invalid login type"})

    except Exception:
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})


def calculate_age_from_dob_string(dob_string: str) -> int:
    today = date.today()
    birth_date = datetime.strptime(dob_string, "%Y-%m-%d").date()
    age = today.year - birth_date.year
    m = today.month - birth_date.month
    if m < 0 or (m == 0 and today.day < birth_date.day):
        age -= 1
    return age


@app.post("/api/documents")
@app.post("/api/digilocker/documents")
async def digilocker_documents(req: DigiLockerDocRequest, request: Request):
    """
    API Setu Document Retrieval & RTO Guidelines Verification Engine:
    - Requires Bearer mock_oauth_token_8892 authorization header
    - Fetches verified Class X Marksheet and Voter ID
    - Calculates applicant age and evaluates vehicle class eligibility
    """
    try:
        auth_header = request.headers.get("authorization")
        if auth_header != "Bearer mock_oauth_token_8892":
            return JSONResponse(status_code=401, content={"error": "Unauthorized"})

        # Simulate API Setu document retrieval delay
        await asyncio.sleep(1.5)

        # MOCK DATA: Simulating fetched documents (Class 10 Certificate & Voter ID)
        # NOTE: For privacy & compliance, never generate mock Aadhaar numbers.
        fetched_docs = {
            "applicant_name": "Ramesh Kumar",
            "dob": "2005-04-14",
            "address": "123, Vasant Vihar, New Delhi, 110057",
            "documents_found": ["Class X Marksheet", "Voter ID Card"],
            "kyc_status": "VERIFIED"
        }

        # RTO GUIDELINES VERIFICATION ENGINE
        age = calculate_age_from_dob_string(fetched_docs["dob"])
        vehicle_class = req.vehicleClass or "motorcycle-gear"

        if vehicle_class == "gearless-50cc":
            is_eligible = age >= 16
            rto_message = "Eligible for MC50CC." if is_eligible else "Must be 16+ for gearless vehicles."
        else:
            is_eligible = age >= 18
            rto_message = "Eligible for standard Learner's Licence." if is_eligible else "Must be 18+ for standard vehicles."

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "data": fetched_docs,
                "verification": {
                    "calculated_age": age,
                    "is_rto_eligible": is_eligible,
                    "remarks": rto_message
                }
            }
        )

    except Exception:
        return JSONResponse(status_code=500, content={"error": "Failed to fetch documents"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
