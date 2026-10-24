import os
import json
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://hhsisahbdmriugkyigrk.supabase.co")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

# Initialize client
supabase: Optional[Client] = None
is_connected = False

if SUPABASE_KEY and SUPABASE_KEY != "your_supabase_anon_or_service_key_here":
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        is_connected = True
        print(f"[OK] Connected to Supabase at: {SUPABASE_URL}")
    except Exception as e:
        print(f"[WARN] Failed to initialize Supabase client: {e}")
else:
    print("[INFO] SUPABASE_KEY not set. Running with fallback sample data for Hackathon demo.")

# Path to src/data for master data synchronization
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src", "data"))

def load_master_json(filename: str) -> Dict[str, Any]:
    """Helper to load JSON datasets from src/data."""
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[WARN] Could not load {filename}: {e}")
    return {}

MASTER_SIGNS_DATA = load_master_json("signs.json")
MASTER_QUESTIONS_DATA = load_master_json("questions.json")

# Fallback In-Memory Seed Applications (aligns with Phase 1-6 frontend store)
SAMPLE_APPLICATIONS: Dict[str, Dict[str, Any]] = {
    "DL-2026-98124": {
        "application_number": "DL-2026-98124",
        "appNo": "DL-2026-98124",
        "applicant_name": "Avrojit Saha",
        "name": "Avrojit Saha",
        "phone": "+91 98765 43210",
        "dob": "2004-05-14",
        "rto_code": "DL-01",
        "rto": "DL-01 (Mall Road / North Delhi)",
        "vehicle_classes": ["MCWG", "LMV"],
        "category": "MCWG + LMV (Bike & Car Combo)",
        "feePaid": "₹350 (CMVR Rule 32)",
        "fee_amount": "₹350 (CMVR Rule 32)",
        "ekycStatus": "Verified (Aadhaar / DigiLocker)",
        "verification_mode": "digilocker",
        "stage_index": 2,
        "status": "Under Scrutiny",
        "submission_date": "2026-10-22",
        "address": "Flat 402, Shivalik Enclave, Model Town, Delhi - 110009",
        "bloodGroup": "B+ Positive",
        "fatherOrSpouse": "Debabrata Saha",
        "documents": [
            {
                "id": "form-1",
                "title": "Form 1 Medical Self-Declaration",
                "type": "Medical Declaration (Rule 5(2))",
                "verified": True,
                "authority": "Citizen e-Sign Self-Certification",
                "docNumber": "MED-DECL-2026-DL-98124",
                "details": "Vision acuity 6/6 bilateral, normal color perception."
            },
            {
                "id": "aadhaar-ekyc",
                "title": "Aadhaar e-KYC DigiLocker Certificate",
                "type": "UIDAI e-KYC (DPDP 2023 Compliant)",
                "verified": True,
                "authority": "UIDAI National DigiLocker Gateway",
                "docNumber": "XXXXXXXX4921",
                "details": "Demographic match 100%. Postal index 110009 verified."
            },
            {
                "id": "marksheet-10",
                "title": "Class 10 CBSE Marksheet & Certificate",
                "type": "Age & Educational Proof (Rule 4 CMVR)",
                "verified": True,
                "authority": "CBSE DigiLocker Board Archive",
                "docNumber": "CBSE/2020/ROLL-6129841",
                "details": "Date of birth recorded: 14-May-2004."
            },
            {
                "id": "fee-challan",
                "title": "Statutory Fee e-Challan Receipt",
                "type": "Treasury Payment Receipt (Rule 32)",
                "verified": True,
                "authority": "BharatKosh / Parivahan e-Pay",
                "docNumber": "CHALLAN-DL-2026-881230",
                "details": "₹150 (MCWG LL) + ₹150 (LMV LL) + ₹50 (Online STALL Test) = ₹350 Paid via UPI."
            }
        ],
        "timeline": [
            {"step": "Application Submitted & Fee Paid (₹350)", "title": "Application Submitted & Fee Paid (₹350)", "date": "2026-10-22", "status": "done", "completed": True},
            {"step": "DigiLocker e-KYC & Document Verification", "title": "DigiLocker e-KYC & Document Verification", "date": "2026-10-22", "status": "done", "completed": True},
            {"step": "RTO Scrutiny Desk Approval", "title": "RTO Scrutiny Desk Approval", "date": "In Progress", "status": "active", "completed": False, "active": True},
            {"step": "Learner's Licence Issued (Form 3)", "title": "Learner's Licence Issued (Form 3)", "date": "Pending", "status": "pending", "completed": False}
        ]
    },
    "MH-2026-11492": {
        "application_number": "MH-2026-11492",
        "appNo": "MH-2026-11492",
        "applicant_name": "Shubham Kumar",
        "name": "Shubham Kumar",
        "phone": "+91 98112 23344",
        "dob": "2003-11-20",
        "rto_code": "MH-02",
        "rto": "MH-02 (Andheri / Mumbai West)",
        "vehicle_classes": ["LMV"],
        "category": "LMV (Private Motor Car)",
        "feePaid": "₹200",
        "fee_amount": "₹200",
        "ekycStatus": "Verified (DigiLocker)",
        "verification_mode": "digilocker",
        "stage_index": 1,
        "status": "Under Scrutiny",
        "submission_date": "2026-10-23",
        "address": "B-201, Palm Beach Heights, Lokhandwala, Andheri West, Mumbai - 400053",
        "bloodGroup": "O+ Positive",
        "fatherOrSpouse": "R. K. Kumar",
        "documents": [
            {
                "id": "form-1",
                "title": "Form 1 Medical Self-Declaration",
                "type": "Medical Declaration (Rule 5(2))",
                "verified": True,
                "authority": "Citizen e-Sign Self-Certification",
                "docNumber": "MED-DECL-2026-MH-11492",
                "details": "Clear vision without glasses, certified fit to drive."
            },
            {
                "id": "aadhaar-ekyc",
                "title": "Aadhaar Card (DigiLocker Verified)",
                "type": "UIDAI e-KYC",
                "verified": True,
                "authority": "DigiLocker Repository",
                "docNumber": "XXXXXXXX7819",
                "details": "Address verified with Mumbai Suburban Jurisdiction."
            }
        ],
        "timeline": [
            {"step": "Application Submitted & Fee Paid (₹200)", "title": "Application Submitted & Fee Paid (₹200)", "date": "2026-10-23", "status": "done", "completed": True},
            {"step": "DigiLocker e-KYC Verification", "title": "DigiLocker e-KYC Verification", "date": "2026-10-23", "status": "done", "completed": True},
            {"step": "RTO Scrutiny Desk Approval", "title": "RTO Scrutiny Desk Approval", "date": "In Progress", "status": "active", "completed": False, "active": True},
            {"step": "Learner's Licence Issued (Form 3)", "title": "Learner's Licence Issued (Form 3)", "date": "Pending", "status": "pending", "completed": False}
        ]
    },
    "KA-2026-55319": {
        "application_number": "KA-2026-55319",
        "appNo": "KA-2026-55319",
        "applicant_name": "Aritro Roy",
        "name": "Aritro Roy",
        "phone": "+91 98450 12345",
        "dob": "2002-08-09",
        "rto_code": "KA-01",
        "rto": "KA-01 (Koramangala / Bengaluru Central)",
        "vehicle_classes": ["MCWG"],
        "category": "MCWG (Geared Motorbike)",
        "feePaid": "₹200",
        "fee_amount": "₹200",
        "ekycStatus": "Verified (Aadhaar OTP)",
        "verification_mode": "digilocker",
        "stage_index": 3,
        "status": "Approved & LL Issued (Form 3)",
        "llNumber": "KA-01-LL-2026-0099418",
        "submission_date": "2026-10-20",
        "approvalDate": "2026-10-21",
        "address": "12th Main, 4th Block, Koramangala, Bengaluru - 560034",
        "bloodGroup": "A+ Positive",
        "fatherOrSpouse": "Siddhartha Roy",
        "documents": [],
        "timeline": [
            {"step": "Application Submitted & Fee Paid", "title": "Application Submitted & Fee Paid", "date": "2026-10-20", "status": "done", "completed": True},
            {"step": "Aadhaar e-KYC Verified", "title": "Aadhaar e-KYC Verified", "date": "2026-10-20", "status": "done", "completed": True},
            {"step": "RTO Scrutiny Approved by Officer Priya Venkatesh", "title": "RTO Scrutiny Approved", "date": "2026-10-21", "status": "done", "completed": True},
            {"step": "Digital LL Issued (Form 3: KA-01-LL-2026-0099418)", "title": "Digital LL Issued", "date": "2026-10-21", "status": "done", "completed": True}
        ]
    }
}

# Fallback Seed Officers (aligns with Phase 6 Admin Auth)
REGISTERED_OFFICERS: List[Dict[str, Any]] = [
    {
        "officerId": "RTO-OFFICER-DL01",
        "email": "rajeshwar.sharma@parivahan.gov.in",
        "name": "Rajeshwar Sharma",
        "designation": "Senior Motor Vehicle Inspector (MVI)",
        "rto": "DL-01 (Mall Road / North Delhi)",
        "rtoCode": "DL-01",
        "badgeNumber": "MVI-DL-8819",
        "password": "AdminPassword2026!",
        "joinedDate": "2018-04-12",
        "clearanceLevel": "Level 3 (Form 3 Issuing Authority)"
    },
    {
        "officerId": "RTO-OFFICER-MH02",
        "email": "sanjay.kulkarni@parivahan.gov.in",
        "name": "Sanjay Kulkarni",
        "designation": "RTO Scrutiny Superintendent",
        "rto": "MH-02 (Andheri / Mumbai West)",
        "rtoCode": "MH-02",
        "badgeNumber": "MVI-MH-4421",
        "password": "AdminPassword2026!",
        "joinedDate": "2019-09-01",
        "clearanceLevel": "Level 3 (Form 3 Issuing Authority)"
    },
    {
        "officerId": "RTO-OFFICER-KA01",
        "email": "priya.venkatesh@parivahan.gov.in",
        "name": "Priya Venkatesh",
        "designation": "Assistant Transport Commissioner",
        "rto": "KA-01 (Koramangala / Bengaluru Central)",
        "rtoCode": "KA-01",
        "badgeNumber": "ATC-KA-1109",
        "password": "AdminPassword2026!",
        "joinedDate": "2016-01-15",
        "clearanceLevel": "Level 4 (Supervisory & Final Appeal Authority)"
    }
]

# In-memory appointment slot bookings
BOOKED_APPOINTMENTS: Dict[str, Dict[str, Any]] = {
    "SLOT-2026-9812": {
        "slot_id": "SLOT-2026-9812",
        "app_no": "DL-2026-98124",
        "applicant_name": "Avrojit Saha",
        "track_type": "car",
        "ground": "IDTR-DELHI",
        "ground_name": "IDTR Automated Track (Loni Road, Delhi)",
        "test_date": "2026-11-25",
        "slot_time": "09:30 AM - 11:00 AM",
        "status": "Confirmed",
        "created_at": "2026-10-24"
    }
}

# --- Database & Store Operations ---

def fetch_application_by_number(app_number: str) -> Optional[Dict[str, Any]]:
    """Fetch application by number from Supabase or fallback sample data."""
    clean_no = app_number.strip().upper()
    
    # 1. Try local memory store first to preserve instant session modifications
    if clean_no in SAMPLE_APPLICATIONS:
        return SAMPLE_APPLICATIONS[clean_no]

    # 2. Try Supabase cloud database
    if is_connected and supabase:
        try:
            response = supabase.table("applications").select("*").eq("application_number", clean_no).single().execute()
            if response.data:
                record = response.data
                # Normalize keys for frontend compatibility
                record["appNo"] = record.get("application_number", clean_no)
                record["name"] = record.get("applicant_name", "")
                if "timeline" not in record:
                    record["timeline"] = [
                        {"step": "Application Submitted (Form 2)", "status": "done", "date": record.get("created_at", "2026-10-22")[:10]},
                        {"step": "Document Scrutiny", "status": "active" if record.get("status") == "In Progress" else "done", "date": "In Progress"},
                        {"step": "LL Test Slot Booking", "status": "pending", "date": None},
                        {"step": "Learner's Licence Approval", "status": "pending", "date": None}
                    ]
                return record
        except Exception as e:
            print(f"[WARN] Supabase query error for {clean_no}: {e}")

    return None

def fetch_all_applications(rto_code: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """List applications with optional RTO code and status filter."""
    apps = list(SAMPLE_APPLICATIONS.values())

    # Try fetching latest from Supabase if connected
    if is_connected and supabase:
        try:
            query = supabase.table("applications").select("*")
            if rto_code and rto_code != "ALL":
                query = query.eq("rto_code", rto_code)
            res = query.order("created_at", desc=True).limit(50).execute()
            if res.data:
                # Merge into in-memory representation
                for row in res.data:
                    num = row.get("application_number")
                    if num and num not in SAMPLE_APPLICATIONS:
                        SAMPLE_APPLICATIONS[num] = {
                            "application_number": num,
                            "appNo": num,
                            "applicant_name": row.get("applicant_name"),
                            "name": row.get("applicant_name"),
                            "dob": row.get("dob"),
                            "rto_code": row.get("rto_code"),
                            "rto": f"{row.get('rto_code', 'DL-01')} Jurisdiction",
                            "vehicle_classes": [row.get("vehicle_class", "LMV")],
                            "category": row.get("vehicle_class", "LMV"),
                            "status": row.get("status", "Under Scrutiny"),
                            "submission_date": row.get("created_at", "2026-10-24")[:10],
                            "timeline": [
                                {"step": "Application Submitted", "status": "done", "date": row.get("created_at", "2026-10-24")[:10]},
                                {"step": "Document Scrutiny", "status": "active", "date": "In Progress"},
                                {"step": "RTO Scrutiny Approval", "status": "pending", "date": None},
                                {"step": "Learner's Licence Issued", "status": "pending", "date": None}
                            ]
                        }
                apps = list(SAMPLE_APPLICATIONS.values())
        except Exception as e:
            print(f"[WARN] Supabase fetch_all_applications error: {e}")

    # Apply filters
    if rto_code and rto_code != "ALL":
        apps = [a for a in apps if a.get("rto_code", "").upper() == rto_code.upper()]
    if status and status != "ALL":
        apps = [a for a in apps if status.lower() in a.get("status", "").lower()]

    return apps

def insert_application(data: Dict[str, Any]) -> Dict[str, Any]:
    """Store Form 2 application into Supabase and memory fallback."""
    app_num = data.get("application_number") or data.get("appNo")
    if not app_num:
        rto_prefix = (data.get("rto_code") or "DL-01").split("-")[0]
        app_num = f"{rto_prefix}-2026-{10000 + len(SAMPLE_APPLICATIONS) + 1}"
    
    data["application_number"] = app_num
    data["appNo"] = app_num
    data["name"] = data.get("name") or data.get("applicant_name", "Citizen Applicant")
    data["applicant_name"] = data["name"]

    # 1. Store in Supabase if online
    if is_connected and supabase:
        try:
            # Map to columns existing in Supabase 'applications' table
            supabase_payload = {
                "application_number": app_num,
                "applicant_name": data["applicant_name"],
                "dob": data.get("dob", "2004-06-15"),
                "rto_code": data.get("rto_code", "DL-01"),
                "vehicle_class": ", ".join(data.get("vehicle_classes", ["LMV"])) if isinstance(data.get("vehicle_classes"), list) else str(data.get("vehicle_class", "LMV")),
                "current_stage": "Document Scrutiny",
                "stage_index": data.get("stage_index", 0),
                "status": data.get("status", "Under Scrutiny")
            }
            supabase.table("applications").insert(supabase_payload).execute()
            print(f"[OK] Stored application {app_num} in Supabase cloud PostgreSQL")
        except Exception as e:
            print(f"[WARN] Supabase insert error for {app_num}: {e}")

    # 2. Store in local memory store
    SAMPLE_APPLICATIONS[app_num] = data
    return {"status": "success", "application_number": app_num, "data": data}

def update_application_status(app_number: str, new_status: str, remarks: str = "", officer_name: str = "RTO Officer") -> Optional[Dict[str, Any]]:
    """Update application status, remarks, and generate Form 3 LL number if approved."""
    clean_no = app_number.strip().upper()
    app = fetch_application_by_number(clean_no)
    if not app:
        return None

    is_approved = "Approved" in new_status
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Generate official Form 3 LL number if approved
    ll_number = app.get("llNumber")
    if is_approved and not ll_number:
        rto_code = app.get("rto_code", "DL-01")
        year = datetime.now().year
        seq = 100000 + len(SAMPLE_APPLICATIONS) * 7 + 42
        ll_number = f"{rto_code}-LL-{year}-{seq}"

    app["status"] = new_status
    app["remarks"] = remarks or app.get("remarks", "")
    if ll_number:
        app["llNumber"] = ll_number
    if is_approved:
        app["approvalDate"] = now_str
        app["stage_index"] = 3

    # Update timeline
    timeline = app.get("timeline", [])
    if len(timeline) >= 4:
        if is_approved:
            timeline[2] = {"step": f"RTO Scrutiny Approved by {officer_name}", "title": "RTO Scrutiny Approved", "date": now_str, "status": "done", "completed": True}
            timeline[3] = {"step": f"Digital LL Issued (Form 3: {ll_number})", "title": f"Digital Form 3 LL ({ll_number})", "date": now_str, "status": "done", "completed": True}
        elif "Correction" in new_status:
            timeline[2] = {"step": f"Correction Requested: {remarks}", "title": "Correction Notice Dispatched", "date": now_str, "status": "correction", "completed": False}

    app["timeline"] = timeline
    SAMPLE_APPLICATIONS[clean_no] = app

    # Also update Supabase if online
    if is_connected and supabase:
        try:
            supabase.table("applications").update({
                "status": new_status,
                "current_stage": "Learner's Licence Issued" if is_approved else "Correction Pending",
                "stage_index": 3 if is_approved else 1
            }).eq("application_number", clean_no).execute()
            print(f"[OK] Updated status for {clean_no} in Supabase")
        except Exception as e:
            print(f"[WARN] Supabase status update error: {e}")

    return app

def fetch_questions(category: Optional[str] = None, limit: int = 15) -> List[Dict[str, Any]]:
    """Fetch practice questions from Supabase or master questions dataset."""
    # 1. Try Supabase
    if is_connected and supabase:
        try:
            query = supabase.table("questions").select("*")
            if category:
                query = query.ilike("category", f"%{category}%")
            res = query.limit(limit).execute()
            if res.data and len(res.data) > 0:
                normalized = []
                for q in res.data:
                    normalized.append({
                        "id": q.get("id"),
                        "category": q.get("category", "General"),
                        "question": q.get("question"),
                        "options": q.get("options", []),
                        "correct_index": q.get("correct_option", 0),
                        "explanation": q.get("explanation", "Standard MoRTH statutory rule under Motor Vehicles Act 1988.")
                    })
                return normalized
        except Exception as e:
            print(f"[WARN] Supabase questions query error: {e}")

    # 2. Master JSON Fallback
    raw_questions = MASTER_QUESTIONS_DATA.get("questions", [])
    if category and category != "ALL":
        filtered = [q for q in raw_questions if category.lower() in q.get("category", "").lower()]
        return filtered[:limit] if filtered else raw_questions[:limit]
    return raw_questions[:limit]

def fetch_signs(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch traffic signs from master dataset."""
    raw_signs = MASTER_SIGNS_DATA.get("signs", [])
    if category and category != "ALL":
        cat_lower = category.lower()
        return [s for s in raw_signs if cat_lower in s.get("category", "").lower()]
    return raw_signs

def book_appointment_slot(data: Dict[str, Any]) -> Dict[str, Any]:
    """Book ADTT test track slot and generate appointment slip."""
    slot_id = f"SLOT-2026-{1000 + len(BOOKED_APPOINTMENTS) + 1}"
    record = {
        "slot_id": slot_id,
        "app_no": data.get("app_no", "DL-2026-98124"),
        "applicant_name": data.get("applicant_name", "Citizen"),
        "track_type": data.get("track_type", "car"),
        "ground": data.get("ground", "IDTR-DELHI"),
        "ground_name": data.get("ground_name", "IDTR Automated Track (Loni Road, Delhi)"),
        "test_date": data.get("test_date", datetime.now().strftime("%Y-%m-%d")),
        "slot_time": data.get("slot_time", "09:30 AM - 11:00 AM"),
        "status": "Confirmed",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    BOOKED_APPOINTMENTS[slot_id] = record
    return {"status": "success", "slot_id": slot_id, "data": record}

def fetch_slot(slot_id: str) -> Optional[Dict[str, Any]]:
    """Fetch appointment slot by ID."""
    return BOOKED_APPOINTMENTS.get(slot_id.strip().upper())

def authenticate_officer(identifier: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate RTO officer credentials."""
    clean_id = identifier.strip().lower()
    for o in REGISTERED_OFFICERS:
        if (o["officerId"].lower() == clean_id or o["email"].lower() == clean_id) and o["password"] == password:
            # Return officer profile without exposing password
            profile = {k: v for k, v in o.items() if k != "password"}
            profile["role"] = "RTO_OFFICER"
            profile["token"] = f"RTO-TOKEN-{o['officerId']}-{datetime.now().strftime('%Y%m%d%H%M')}"
            return profile
    return None

def list_officers() -> List[Dict[str, Any]]:
    """List registered officers with sanitized fields."""
    return [{k: v for k, v in o.items() if k != "password"} for o in REGISTERED_OFFICERS]
