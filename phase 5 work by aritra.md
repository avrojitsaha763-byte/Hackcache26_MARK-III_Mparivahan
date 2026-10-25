# 📋 Phase 5 Progress Report — Official RTO Scrutiny Desk API, ADTT Slot Booking Engine & Saathi AI Backend — Licence Saathi | EasyDL

**Project Lead & Backend Systems Architect:** Aritro Roy  
**Team Collaborators:** Avrojit Saha (Core Frontend & Cloud Architect), Shubham Malakar (Data & UI/UX Engineer)  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Target Domain:** Indian RTO & Sarathi Parivahan (Ministry of Road Transport and Highways, CMVR 1989 & MV Act 1988)  
**Date:** October 2026  
**Status:** In Progress & Planned for Execution  

---

## 🇮🇳 Statutory Framework & Indian RTO Adherence

Phase 5 achieves nationwide e-governance closure by implementing both sides of the Indian transport administrative equation:
1. **The Official Licensing Authority Side (Sections 8 & 9 of MV Act 1988):**
   - Provides designated Motor Vehicle Inspectors (MVIs) with digital scrutiny desks to inspect Form 2 applications and issue digital **Form 3 Learner's Licences**.
   - Supports statutory correction notices under CMVR Rule 14 (e.g. asking for clearer document copies or corrected residential address).
2. **The Permanent Driving Licence Pipeline (CMVR 1989 Rule 15):**
   - Strictly enforces the statutory **30-day learning period**: An applicant can only take the permanent driving test after 30 days from their Learner's Licence issuance date.
   - Schedules automated driving test track (ADTT) sensor appointments across regional RTO test grounds.
3. **Citizen AI Support (DPDPA 2023 Compliant):**
   - Floating assistant delivering authoritative statutory answers on fees, cancellation deadlines, and driving track maneuvers without storing biometric data.

---

## 🎯 Executive Summary (Aritro Roy — Project Lead & Backend Architect)

As **Project Lead & Backend Systems Architect**, Aritro Roy engineered three core microservices in `Backend/main.py` and `Backend/supabase_client.py`:
1. **RTO Scrutiny Desk Endpoints:**
   - `GET /api/admin/applications`: Returns incoming applicant dossiers with filtering by jurisdiction (e.g. `DL-01`, `MH-02`, `KA-01`) and scrutiny status (`Under Scrutiny`, `Approved`, `Correction Required`).
   - `PUT /api/admin/applications/{app_no}/status`: Enables officers to approve submissions, automatically mint verifiable digital Form 3 LL numbers (e.g., `DL-01-LL-2026-981240`), or dispatch correction SMS notices with officer remarks.
2. **Interactive ADTT Appointment Slot Engine:**
   - `POST /api/slots/book`: Validates the 30-day prerequisite date constraint, books test track grounds (e.g. *IDTR Loni Road Delhi*, *ADTT Andheri Mumbai*, *Sarathi Track Koramangala*), and generates verifiable appointment confirmation slips (`SLOT-2026-XXXX`).
   - `GET /api/slots/{slot_id}`: Retrieves appointment credentials for gate security validation.
3. **Saathi AI Multilingual Assistant Service:**
   - `POST /api/chat`: Implements a context-aware conversational agent responding to queries regarding CMVR Rule 11 preliminary knowledge test syllabus, Rule 15, Rule 32 fees, and ADTT test track maneuvers in both English and Hindi.

---

## 🚀 Key Backend Deliverables in Phase 5

```text
┌──────────────────────────────────────┐       ┌────────────────────────────────────────────────────────┐
│   Phase 5 Client Request             │       │   FastAPI Backend (Indian RTO Engine - Port 8000)      │
├──────────────────────────────────────┤       ├────────────────────────────────────────────────────────┤
│  GET /api/admin/applications         │ ────► │ Returns Official Officer Scrutiny Queue                │
│  PUT /api/admin/applications/...     │ ────► │ Issues Form 3 LL Number / Dispatches Correction Notice │
│  POST /api/slots/book                │ ────► │ Validates Rule 15 30-Day Wait & Books ADTT Ground Slot │
│  POST /api/chat                      │ ────► │ Multilingual Saathi AI Statutory Assistant             │
└──────────────────────────────────────┘       └────────────────────────────────────────────────────────┘
```

### 1. Officer Scrutiny Desk Endpoints
- **`GET /api/admin/applications`**:
  - Filter by `rto_code` and `status`.
  - Delivers complete applicant dossiers including uploaded document metadata (resolutions, file sizes, RTO compliance flags).
- **`PUT /api/admin/applications/{app_no}/status`**:
  - Payload: `{ "status": "Approved & LL Issued (Form 3)", "remarks": "Documents verified", "officer_name": "Rajeshwar Sharma" }`.
  - Generates official LL format: `<RTO_CODE>-LL-<YEAR>-<6_DIGIT_SEQ>`.
  - Updates application timeline in Supabase and local memory.

### 2. ADTT Slot Booking Service
- **`POST /api/slots/book`**:
  - Validates `test_date` &ge; `today + 30 days` if LL issuance date is provided.
  - Persists appointment record and generates confirmation code `SLOT-2026-XXXX`.
  - Returns ground location, gate reporting time, and mandatory candidate checklist (RC, PUC, insurance, ISI 4151 helmet / seatbelt).

### 3. Saathi AI Chat Endpoint
- **`POST /api/chat`**:
  - Accepts `{ "query": "What is the 7 day rule?", "lang": "en" }`.
  - Analyzes intent across 6 statutory categories: cancellation windows, fees, eligibility, ADTT tracks, medical declarations, and dispute appeals.
  - Returns clear, authoritative guidance in English or Hindi with parivahan.gov.in citations.
