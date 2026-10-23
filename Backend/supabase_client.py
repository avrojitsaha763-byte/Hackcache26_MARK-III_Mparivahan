import os
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


# Fallback Seed Data (aligns with Phase 1 sample database records)
SAMPLE_APPLICATIONS: Dict[str, Dict[str, Any]] = {
    "DL-2026-98124": {
        "application_number": "DL-2026-98124",
        "applicant_name": "Avrojit Saha",
        "dob": "2004-05-14",
        "rto_code": "DL-01 (Mall Road)",
        "vehicle_classes": ["MCWG", "LMV"],
        "stage_index": 2,
        "status": "Slot Booked",
        "timeline": [
            {"title": "Application Submitted", "date": "2026-10-10", "completed": True},
            {"title": "Document Scrutiny", "date": "2026-10-12", "completed": True},
            {"title": "LL Test Slot Booked", "date": "2026-10-25", "completed": False, "active": True},
            {"title": "Learner's Licence Approval", "date": "Pending", "completed": False}
        ]
    },
    "MH-2026-11492": {
        "application_number": "MH-2026-11492",
        "applicant_name": "Shubham Kumar",
        "dob": "2003-11-20",
        "rto_code": "MH-02 (Andheri)",
        "vehicle_classes": ["LMV"],
        "stage_index": 1,
        "status": "Under Scrutiny",
        "timeline": [
            {"title": "Application Submitted", "date": "2026-10-18", "completed": True},
            {"title": "Document Scrutiny", "date": "In Progress", "completed": False, "active": True},
            {"title": "LL Test Slot Booking", "date": "Pending", "completed": False},
            {"title": "Learner's Licence Approval", "date": "Pending", "completed": False}
        ]
    }
}

SAMPLE_QUESTIONS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "category": "Road Signs",
        "question": "What does a triangular traffic sign with a red border signify?",
        "options": ["Mandatory Sign", "Cautionary / Warning Sign", "Informative Sign", "Speed Limit"],
        "correct_index": 1,
        "explanation": "Triangular signs with red borders are cautionary signs warning the driver of potential hazards ahead."
    },
    {
        "id": 2,
        "category": "Traffic Rules",
        "question": "Near a pedestrian crossing, when pedestrians are waiting to cross the road, you should:",
        "options": [
            "Sound horn and proceed",
            "Slow down and proceed with caution",
            "Stop the vehicle and wait until pedestrians cross",
            "Speed up to cross before them"
        ],
        "correct_index": 2,
        "explanation": "Drivers must give precedence to pedestrians at un-controlled pedestrian crossings."
    },
    {
        "id": 3,
        "category": "Safety",
        "question": "What is the minimum valid validity period of a Learner's Licence in India?",
        "options": ["30 days", "6 months", "1 year", "3 months"],
        "correct_index": 1,
        "explanation": "A Learner's Licence issued in India remains valid for 6 months across the country."
    },
    {
        "id": 4,
        "category": "Road Signs",
        "question": "What does a circular sign with a red ring and a horn with a diagonal red line mean?",
        "options": ["Compulsory sound horn", "Horn prohibited (Silence zone)", "No parking", "One way traffic"],
        "correct_index": 1,
        "explanation": "A horn with a red slash indicates a silence zone near hospitals or schools where horn usage is banned."
    }
]

def fetch_application_by_number(app_number: str) -> Optional[Dict[str, Any]]:
    """Fetch application by number from Supabase or fallback sample data."""
    if is_connected and supabase:
        try:
            response = supabase.table("applications").select("*").eq("application_number", app_number).single().execute()
            if response.data:
                return response.data
        except Exception as e:
            print(f"Supabase query error: {e}")
    
    # Fallback to sample data
    return SAMPLE_APPLICATIONS.get(app_number.strip().upper())

def fetch_questions(category: Optional[str] = None, limit: int = 15) -> List[Dict[str, Any]]:
    """Fetch practice questions from Supabase or fallback sample data."""
    if is_connected and supabase:
        try:
            query = supabase.table("questions").select("*")
            if category:
                query = query.eq("category", category)
            response = query.limit(limit).execute()
            if response.data:
                return response.data
        except Exception as e:
            print(f"Supabase questions query error: {e}")

    # Fallback filtering
    if category:
        filtered = [q for q in SAMPLE_QUESTIONS if q["category"].lower() == category.lower()]
        return filtered[:limit]
    return SAMPLE_QUESTIONS[:limit]

def insert_application(data: Dict[str, Any]) -> Dict[str, Any]:
    """Store application in Supabase or local memory."""
    if is_connected and supabase:
        try:
            response = supabase.table("applications").insert(data).execute()
            return {"status": "success", "data": response.data}
        except Exception as e:
            print(f"Supabase insert error: {e}")
    
    # Fallback local save
    app_num = data.get("application_number", f"DL-2026-{len(SAMPLE_APPLICATIONS)+10000}")
    data["application_number"] = app_num
    SAMPLE_APPLICATIONS[app_num] = data
    return {"status": "success", "data": data, "note": "Saved to local state (Supabase offline)"}
