# 📋 Phase 4 Progress Report — STALL Computer Exam Simulator, MoRTH Statutory Question Banks & Traffic Signs API — Licence Saathi | EasyDL

**Project Lead & Backend Systems Architect:** Aritro Roy  
**Team Collaborators:** Avrojit Saha (Core Frontend & Cloud Architect), Shubham Malakar (Data & UI/UX Engineer)  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Target Domain:** Indian RTO & Sarathi Parivahan (Ministry of Road Transport and Highways, CMVR 1989 & MV Act 1988)  
**Date:** October 2026  
**Status:** In Progress & Planned for Execution  

---

## 🇮🇳 Statutory Framework & Indian RTO Adherence

Phase 4 operationalizes the computer-based testing pipeline required under **CMVR 1989 Rule 11(1)** for the grant of a Learner's Licence in India:
1. **Screen Test for All Learners Licence (STALL):**
   - Mandated by MoRTH across all automated RTO centers.
   - Enforces a **60% pass threshold** (minimum 9 correct answers out of 15 questions).
   - Enforces a **30-second time limit** per question to prevent unauthorized assistance.
2. **MoRTH Statutory Rules & Penalties Matrix:**
   - Section 129 of MV Act (Compulsory ISI 4151 protective headgear for two-wheeler riders).
   - Section 194B of MV Act (Compulsory seatbelts for motor cars).
   - Section 112 of MV Act (Statutory speed limits across national highways and urban zones).
   - Schedule 1 of MV Act 1988 (Mandatory, Cautionary, and Informatory road traffic signs).

---

## 🎯 Executive Summary (Aritro Roy — Project Lead & Backend Architect)

As **Project Lead & Backend Systems Architect**, Aritro Roy engineered the assessment test evaluation microservice and traffic sign distribution API:
1. Engineered `GET /api/questions` with category filtering (`Mandatory Signs`, `Rules & Regulations`, `Road Safety`) and bilingual delivery (English and Hindi).
2. Connected `GET /api/questions` to query Supabase's live `questions` table with automatic fallback to master data in `src/data/questions.json`.
3. Built `POST /api/quiz/submit` to score applicant answers server-side, calculate exact percentage, determine statutory pass/fail status (&ge; 60%), and return comprehensive question-by-question explanations.
4. Created `GET /api/signs` to serve vector traffic signs, bilingual descriptions, and audio narration text for the citizen learning portal.

---

## 🚀 Key Backend Deliverables in Phase 4

```text
┌──────────────────────────────────────┐       ┌────────────────────────────────────────────────────────┐
│   Phase 4 Client Request             │       │   FastAPI Backend (Indian RTO Engine - Port 8000)      │
├──────────────────────────────────────┤       ├────────────────────────────────────────────────────────┤
│  GET /api/questions?category=...     │ ────► │ Queries Supabase 'questions' table / Master JSON       │
│  POST /api/quiz/submit {answers}     │ ────► │ Evaluates 60% Pass Benchmark & Rationale               │
│  GET /api/signs?type=...             │ ────► │ Returns Mandatory / Cautionary / Informatory Signs     │
└──────────────────────────────────────┘       └────────────────────────────────────────────────────────┘
```

### 1. `GET /api/questions` Endpoint
- Parameters: `category` (optional filter), `limit` (default 15, max 50), `lang` (`en` or `hi`).
- Delivers questions in bilingual schema:
  ```json
  {
    "id": 1,
    "category": "Mandatory Signs",
    "question": {
      "en": "What does a red octagonal traffic sign signify?",
      "hi": "लाल अष्टकोणीय (8 भुजाओं वाला) यातायात संकेत क्या दर्शाता है?"
    },
    "options": [
      { "en": "Yield / Give Way", "hi": "रास्ता दें" },
      { "en": "Stop", "hi": "रुकें (अनिवार्य)" },
      { "en": "No Entry", "hi": "प्रवेश निषेध" },
      { "en": "Speed Limit", "hi": "गति सीमा" }
    ],
    "correct_index": 1,
    "explanation": "An octagonal red sign is the universal STOP sign requiring a full stop before entering an intersection."
  }
  ```

### 2. `POST /api/quiz/submit` Evaluator
- Accepts map of question ID to chosen option index (`{ "1": 1, "2": 0, ... }`).
- Computes:
  - `score`: Total correct answers.
  - `total`: Total questions answered.
  - `percentage`: `(score / total) * 100`.
  - `passed`: `score >= pass_mark` (pass mark = 60%).
  - `breakdown`: Per-question analysis showing applicant selection vs correct answer and statutory explanation.

### 3. `GET /api/signs` Traffic Signs Catalog
- Serves complete dataset of traffic signs categorized by:
  - `MANDATORY`: Circular regulatory signs (Stop, Give Way, No Horn, Speed Limit).
  - `CAUTIONARY`: Triangular warning signs (Sharp Curve, Pedestrian Crossing, Steep Incline).
  - `INFORMATORY`: Rectangular guide signs (Hospital, Petrol Pump, Parking).
- Includes text scripts tailored for Web Speech API audio narration.
