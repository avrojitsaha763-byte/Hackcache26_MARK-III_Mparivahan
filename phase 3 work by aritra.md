# 📋 Phase 3 Progress Report — National Parivahan Application Tracker & CMVR Rule 11 Milestones — Licence Saathi | EasyDL

**Project Lead & Backend Systems Architect:** Aritro Roy  
**Team Collaborators:** Avrojit Saha (Core Frontend & Cloud Architect), Shubham Malakar (Data & UI/UX Engineer)  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Target Domain:** Indian RTO & Sarathi Parivahan (Ministry of Road Transport and Highways, CMVR 1989 & MV Act 1988)  
**Date:** October 2026  
**Status:** In Progress & Planned for Execution  

---

## 🇮🇳 Statutory Framework & Indian RTO Adherence

Phase 3 focuses on addressing one of the most critical pain points for Indian citizens applying for driving licences: **lack of transparent status visibility and application progression**:
1. **CMVR Rule 11 Preliminary Knowledge Test & Scrutiny Milestones:**
   - Under Rule 11 of the Central Motor Vehicles Rules 1989, an applicant must pass a computerized preliminary knowledge test covering traffic signs, driving regulations, and driver responsibilities (60% qualifying score).
   - The application tracking engine monitors the progress of document scrutiny against administrative Citizen Charter targets.
2. **National 4-Stage Chronological Milestone Standard:**
   - *Stage 0 (Submitted):* Form 2 Submission & CMVR Rule 32 Treasury Fee Clearance.
   - *Stage 1 (Scrutiny):* DigiLocker Aadhaar e-KYC or Manual Scanned Document Examination.
   - *Stage 2 (Online Test / Slot):* STALL Computer Test or RTO Counter Appointment.
   - *Stage 3 (Approved):* Digital Form 3 Learner's Licence Issuance (Valid for 180 Days nationwide).

---

## 🎯 Executive Summary (Aritro Roy — Project Lead & Backend Architect)

As **Project Lead & Backend Systems Architect**, Aritro Roy architected the status resolution engine and real-time tracking endpoints in the FastAPI backend:
1. Engineered `GET /api/track` and `GET /api/applications/{app_number}` with comprehensive chronological timelines.
2. Integrated **CMVR Rule 11** preliminary test milestones and SLA timeline tracking: computes days elapsed from application submission date against administrative targets.
3. Implemented smart case-insensitive lookup supporting national demo reference numbers (`DL-2026-98124`, `MH-2026-11492`, `KA-2026-55319`) and newly submitted citizen applications.
4. Seamlessly unified Supabase PostgreSQL queries with offline fallback data structures so tracking is 100% resilient during live demonstrations.

---

## 🚀 Key Backend Deliverables in Phase 3

```text
┌──────────────────────────────────────┐       ┌────────────────────────────────────────────────────────┐
│   Phase 3 Client Request             │       │   FastAPI Backend (Indian RTO Engine - Port 8000)      │
├──────────────────────────────────────┤       ├────────────────────────────────────────────────────────┤
│  GET /api/track?app_no=DL-2026-98124 │ ────► │ Queries Supabase / Mock Store                          │
│  Response with Timeline & Urgency    │ ◄──── │ Returns 4-Stage Milestone Steps + Rule 11 Status       │
└──────────────────────────────────────┘       └────────────────────────────────────────────────────────┘
```

### 1. `GET /api/track` Query Engine
- Accepts query parameter `app_no`.
- Normalizes and sanitizes application numbers (trims whitespace, converts to uppercase).
- Resolves application dossier from Supabase `applications` table or fallback memory.
- Returns formatted response:
  ```json
  {
    "success": true,
    "data": {
      "application_number": "DL-2026-98124",
      "applicant_name": "Avrojit Saha",
      "status": "Under Scrutiny",
      "rto_code": "DL-01",
      "submission_date": "2026-10-22",
      "rule11_days_remaining": 5
    },
    "timeline": [
      { "step": "Application Submitted & Fee Paid", "status": "done", "date": "2026-10-22" },
      { "step": "DigiLocker e-KYC Verification", "status": "done", "date": "2026-10-22" },
      { "step": "RTO Scrutiny Desk Approval", "status": "active", "date": "In Progress" },
      { "step": "Learner's Licence Issued (Form 3)", "status": "pending", "date": null }
    ]
  }
  ```

### 2. `GET /api/applications/{app_number}` Full Dossier Endpoint
- Returns full application record for deep citizen inspection and RTO officer verification.
- Includes document verification flags, fee receipt numbers, and emergency contact details.
