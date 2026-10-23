# 📋 Phase 1 Progress Report — Backend Systems & Microservice Architecture — Licence Saathi | EasyDL

**Backend Systems Architect & Systems Engineer:** Aritra  
**Collaborators:** Avrojit Saha (Project Lead & Frontend/Cloud Architect), Shubham (Data & UI/UX Engineer)  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Date:** October 2026  
**Status:** Completed, Verified & Live  

---

## 📌 Document Overview & Purpose

This document details the **backend microservice architecture, API design, Supabase database integration, and frontend systems engineering** delivered by **Aritra** in Phase 1 of **Licence Saathi (EasyDL)**.

While Avrojit developed the frontend shell and cloud Supabase tables, and Shubham built the static domain datasets and interactive UI components, **Aritra architected and delivered the standalone Python FastAPI backend microservice (`Backend/`) and modernized the frontend smooth scrolling and routing infrastructure**.

---

## 🚀 Key Architectural Deliverables (Aritra)

### 1. Standalone Python FastAPI Backend Microservice (`Backend/`)

A dedicated REST API service located under [`Backend/`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/Backend/) built with **FastAPI** (`0.161.1`), **Uvicorn** (`0.54.0`), and **Pydantic** (`2.14.1`), running on port `8000`.

#### A. Architecture & CORS Setup
- Configured FastAPI with permissive CORS middleware (`allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`) to facilitate smooth communication between:
  - Local Vite development server (`http://localhost:5173`)
  - Local Vite preview server (`http://localhost:4173`)
  - Live production Vercel deployment
- Automated interactive Swagger UI documentation at `http://localhost:8000/docs` and OpenAPI JSON schema at `http://localhost:8000/openapi.json`.

#### B. The 5 REST Endpoints (`Backend/main.py`)

```text
┌───────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
│  Licence Saathi Client (Vite/Browser) │       │   FastAPI Backend Service (Port 8000)        │
├───────────────────────────────────────┤       ├──────────────────────────────────────────────┤
│  System Health ─────────────────────► │ GET   │  / (Health check & Supabase connection state)│
│  /track (Status Lookup) ────────────► │ GET   │  /api/applications/{app_number}              │
│  /learn (RTO Questions) ────────────► │ GET   │  /api/questions?category=...&limit=...       │
│  /can-i-apply (Eligibility Engine) ─► │ POST  │  /api/check-eligibility                      │
│  /learn/quiz (Quiz Evaluator) ──────► │ POST  │  /api/quiz/submit                            │
└───────────────────────────────────────┘       └──────────────────────────────────────────────┘
```

1. **`GET /` (Health Check & Connectivity Diagnostic)**:
   - Returns service operational status, connection state to Supabase, Supabase URL, and a list of operational endpoints.
   - Response: `{"service": "Licence Saathi Backend API", "status": "operational", "supabase_connected": false|true}`.
2. **`GET /api/applications/{app_number}` (Application Tracking)**:
   - Resolves live Supabase applications or fallback test records (e.g. `DL-2026-98124`, `MH-2026-11492`).
   - Returns applicant name, date of birth, RTO jurisdiction code, vehicle classes, stage index (0–3), status text, and a structured 4-step timeline array.
   - Returns informative `404 Not Found` with suggestions if an invalid application number is queried.
3. **`GET /api/questions` (RTO Question Bank)**:
   - Fetches practice questions with optional query parameters: `category` (`Road Signs`, `Traffic Rules`, `Safety`) and `limit`.
4. **`POST /api/check-eligibility` (Motor Vehicles Act Rules Engine)**:
   - Accepts applicant date of birth (`YYYY-MM-DD`), vehicle class (`MCWOG`, `MCWG`, `LMV`, `TRANS`), and Aadhaar flag.
   - Calculates exact applicant age to the day based on the current calendar date.
   - Enforces statutory rules:
     - **MCWOG:** Minimum age 16 (with parental consent).
     - **MCWG:** Minimum age 18.
     - **LMV:** Minimum age 18.
     - **TRANS:** Minimum age 20 (requires holding an LMV licence for &ge; 1 year).
   - Generates customized required document checklists (e-KYC paperless Aadhaar vs physical ID/address proof, proof of age, Form 1 medical fitness).
5. **`POST /api/quiz/submit` (Automated Mock Test Evaluator)**:
   - Accepts map of question IDs to chosen answer indices.
   - Compares answers against the master answer key.
   - Enforces the official RTO passing threshold (60%).
   - Returns score, total, percentage, pass/fail boolean, and a detailed question-by-question breakdown with educational explanations.

---

### 2. Dual-Mode Supabase Client (`Backend/supabase_client.py`)

To eliminate the single point of failure during live hackathon demos (e.g. network drops, missing API keys, or database outages), Aritra engineered a **resilient dual-mode architecture**:

1. **Online Mode (Supabase Connected):**
   - Automatically initializes `supabase-py` SDK (`2.33.0`) when `SUPABASE_KEY` is provided in `Backend/.env`.
   - Directly queries and updates PostgreSQL tables (`applications`, `questions`).
2. **Offline Fallback Mode (Demo / Zero-Setup Mode):**
   - If `SUPABASE_KEY` is empty or connection fails, the backend logs an informational message and **transparently falls back to high-fidelity in-memory seed records**.
   - Seed applications match Phase 1 records:
     - `DL-2026-98124`: Avrojit Saha (MCWG, LMV - Slot Booked)
     - `MH-2026-11492`: Shubham Kumar (LMV - Under Scrutiny)
   - Seed questions pool covers authentic RTO questions with categories and explanations.
   - Application submissions dynamically save to the in-memory dictionary so subsequent lookups within the session succeed instantly.

---

### 3. Frontend Systems Modernization & Refactoring

#### A. Lenis Smooth Scroll Engine Upgrade (`src/components/SmoothScroll.jsx`)
- Upgraded smooth scrolling from the legacy, deprecated `@studio-freight/lenis` package to the modern official package `lenis` (`^1.3.27`).
- Replaced outdated configuration properties (`direction`, `gestureDirection`, `smooth`) with current standard `smoothWheel: true`.
- Fixed the animation frame loop: restructured `rafId = requestAnimationFrame(raf)` inside the RAF handler with proper cleanup `cancelAnimationFrame(rafId)` and `lenis.destroy()` on component unmount.
- Wrapped initialization in a defensive `try...catch` block (`console.warn('Smooth scroll initialization fallback:', err)`), preventing crashes in non-standard browser environments (embedded WebViews, headless browsers).

#### B. Native React Router DOM Migration
- Removed legacy Next.js `'use client'` directive from `src/pages/Home.jsx`.
- Cleaned up imports across all routes (`Home.jsx`, `CanIApply.jsx`, `Learn.jsx`, `Track.jsx`) to import `Link` directly from `react-router-dom`, bypassing shim indirection and maximizing bundler performance.

---

### 4. Verification Test Results (All 5 Endpoints Verified)

Executed live verification against `Backend/main.py` using `fastapi.testclient`:

```text
[INFO] SUPABASE_KEY not set. Running with fallback sample data for Hackathon demo.
GET /: 200 operational
GET /api/applications/DL-2026-98124: 200 Avrojit Saha | Status: Slot Booked
GET /api/questions: 200 | count = 3
POST /api/check-eligibility: 200 | eligible = True | age = 21
POST /api/quiz/submit: 200 | score = 3 | passed = True
>>> ALL 5 FASTAPI BACKEND ENDPOINTS ARE FULLY OPERATIONAL!
```

---

### 5. Repository & Tooling Configuration

- **[`.gitignore`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/.gitignore):**
  - Added exclusion rules for Python virtual environments and cache files:
    ```gitignore
    # Python
    .venv/
    venv/
    __pycache__/
    *.py[cod]
    *$py.class
    Backend/.env
    ```
- **Windows Python Environment:**
  - Configured `Backend/.venv/pyvenv.cfg` for Python 3.14 on Windows.
  - Provided `Backend/requirements.txt` with all 38 pinned dependencies.
  - Setup instructions documented in [`Backend/README.md`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/Backend/README.md).

---

## 🛠️ Instructions to Run the Backend (For Team)

```powershell
# 1. Open a new terminal in the Backend directory
cd Backend

# 2. Activate virtual environment
.venv\Scripts\Activate.ps1

# 3. Start the FastAPI development server with hot-reload
.venv\Scripts\uvicorn.exe main:app --reload --port 8000
```
- Interactive API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/](http://localhost:8000/)
