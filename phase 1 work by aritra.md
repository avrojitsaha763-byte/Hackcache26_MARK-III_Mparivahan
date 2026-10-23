# 📋 Phase 1 Progress Report (Addendum) — Licence Saathi | EasyDL

**Author:** Aritra  
**Collaborators:** Avrojit Saha, Shubham  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Documentation Maintainer / Reviewer:** Shubham  
**Date:** October 2026  
**Status:** Completed & Verified  

---

## 📌 Document Overview & Purpose

This document serves as an **official addendum** to [`phase 1 work by avrojit.md`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%201%20work%20by%20avrojit.md).

While Avrojit established the initial frontend single-page application (SPA) shell, 360px mobile viewport, Tailwind CSS styling tokens, and initial Supabase client configuration, **Aritra implemented critical architectural additions, a complete Python FastAPI backend microservice, native React routing migrations, and smooth scroll engine upgrades** that were not documented in the original Phase 1 report.

This document notes down all these changes in detail so that **Shubham** can maintain complete, accurate, and unified project progress documentation for the hackathon jury and ongoing Phase 2 development.

---

## 🔍 Summary of Changes Not in Avrojit's Phase 1 Report

| Category | Component / File | What Changed / Added | Purpose & Impact |
| :--- | :--- | :--- | :--- |
| **New Service** | `Backend/main.py` | Full FastAPI REST microservice with 5 endpoints | Provides business logic, validation, scoring, and routing for all app pages |
| **New Service** | `Backend/supabase_client.py` | Python Supabase client + offline fallback mock engine | Ensures hackathon live demo resilience even if Supabase network drops |
| **New Service** | `Backend/requirements.txt` | 38 frozen Python packages (`fastapi`, `supabase`, `uvicorn`, `pydantic`) | Reproducible virtual environment setup |
| **New Service** | `Backend/README.md` & `.env.example` | Dedicated backend documentation + Swagger API docs at `/docs` | Onboarding guide and interactive API testing for the team |
| **Frontend Refactor** | `src/pages/*.jsx` (`Home`, `CanIApply`, `Learn`, `Track`) | Replaced `next/link` with native `react-router-dom` `Link` | Removed dependency on `NextLinkShim.jsx`, improving performance and bundle clarity |
| **Frontend Cleanup** | `src/pages/Home.jsx` | Removed Next.js `'use client'` directive | Cleans up non-standard directive leftover in Vite React SPA |
| **Frontend Upgrade** | `src/components/SmoothScroll.jsx` | Migrated from `@studio-freight/lenis` to modern `lenis` + continuous RAF + `try/catch` | Prevents scroll crashes, updates deprecated Lenis API options, smooth 60/120fps |
| **Git & Tooling** | `.gitignore` | Added Python ignores (`.venv/`, `venv/`, `__pycache__/`, `Backend/.env`, `*.pyc`) | Keeps the git repository clean of Python virtual environments and secrets |

---

## 🚀 Detailed Breakdown of Aritra's Contributions

### 1. Dedicated FastAPI Backend Microservice (`Backend/`)

A major architectural expansion added by Aritra is a standalone Python FastAPI backend located under [`Backend/`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/Backend/). While the frontend can talk to Supabase directly via the JS client, this backend encapsulates core business rules (such as Motor Vehicles Act legal age thresholds, automatic quiz evaluation, and application timeline construction).

#### A. Architecture & CORS Setup
- Configured FastAPI with permissive CORS middleware (`allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`) to facilitate instant communication with Vite dev server (`http://localhost:5173`), preview servers, and production Vercel builds.
- Interactive Swagger UI documentation available out-of-the-box at `http://localhost:8000/docs`.

#### B. The 5 Backend Endpoints

```text
┌─────────────────────────────────┐       ┌──────────────────────────────────────┐
│  Licence Saathi Frontend (Vite) │       │   FastAPI Backend (Port 8000)        │
├─────────────────────────────────┤       ├──────────────────────────────────────┤
│  /track        ───────────────► │ GET   │  /api/applications/{app_number}      │
│  /learn (quiz) ───────────────► │ GET   │  /api/questions                      │
│  /can-i-apply  ───────────────► │ POST  │  /api/check-eligibility              │
│  /learn (submit) ─────────────► │ POST  │  /api/quiz/submit                    │
│  System Diagnostic ───────────► │ GET   │  / (Health check & status)           │
└─────────────────────────────────┘       └──────────────────────────────────────┘
```

1. **`GET /` (Health Check & Connectivity Diagnostic)**:
   - Returns service status, connection state to Supabase, Supabase URL, and an index of all available endpoints.
2. **`GET /api/applications/{app_number}` (Application Tracker)**:
   - Resolves live or demo application numbers (e.g. `DL-2026-98124`, `MH-2026-11492`).
   - Returns applicant name, DOB, RTO jurisdiction code, vehicle classes, current stage index, status (`Slot Booked`, `Under Scrutiny`), and an array of timeline items (`Application Submitted`, `Document Scrutiny`, `LL Test Slot Booked`, `Learner's Licence Approval`).
   - Returns 404 with helpful suggestions if an invalid application number is queried.
3. **`GET /api/questions` (RTO Question Bank)**:
   - Fetches RTO driving licence test questions.
   - Supports optional query parameter filtering by category (`Road Signs`, `Traffic Rules`, `Safety`) and a `limit` parameter.
4. **`POST /api/check-eligibility` (Motor Vehicles Act Rules Engine)**:
   - Accepts applicant date of birth (`YYYY-MM-DD`), vehicle class (`MCWOG`, `MCWG`, `LMV`, `TRANS`), and Aadhaar availability flag.
   - Calculates exact applicant age to the day.
   - Enforces statutory rules:
     - **MCWOG (Motorcycle Without Gear, 50cc):** Minimum age 16 with parental/guardian consent.
     - **MCWG (Motorcycle With Gear):** Minimum age 18.
     - **LMV (Light Motor Vehicle / Car):** Minimum age 18.
     - **TRANS (Transport / Commercial Vehicle):** Minimum age 20 with prerequisite of holding an LMV licence for at least 1 year.
   - Generates customized document checklist (paperless Aadhaar e-KYC vs physical ID/address proof, proof of age, self-declaration Form 1).
5. **`POST /api/quiz/submit` (Automated Mock Test Evaluator)**:
   - Accepts map of question IDs to chosen answer indices.
   - Automatically compares against the question answer key.
   - Implements official RTO passing criterion (60% threshold).
   - Returns overall score, total questions, pass/fail status, percentage, and a question-by-question breakdown with educational explanations for incorrect answers.

---

### 2. Dual-Mode Supabase Client with Offline Fallback (`Backend/supabase_client.py`)

A critical hackathon problem is network unreliability or missing API keys during live presentations. Aritra engineered a **resilient dual-mode architecture**:

1. **Online Mode (Supabase Connected):**
   - Automatically connects to `https://hhsisahbdmriugkyigrk.supabase.co` using `supabase-py` SDK when `SUPABASE_KEY` is provided in `Backend/.env`.
   - Directly queries and inserts into PostgreSQL tables: `applications` and `questions`.
2. **Offline Fallback Mode (Demo / Zero-Setup Mode):**
   - If `SUPABASE_KEY` is not configured or network requests fail, the backend logs an informational message and **transparently falls back to in-memory seed records**.
   - Seed applications accurately match Phase 1 test records:
     - `DL-2026-98124`: Avrojit Saha (MCWG, LMV - Slot Booked)
     - `MH-2026-11492`: Shubham Kumar (LMV - Under Scrutiny)
   - Seed question bank covers real RTO questions across Road Signs, Traffic Rules, and Safety with correct answer indices and explanations.
   - Application submissions dynamically save to the in-memory store so subsequent queries within the session succeed without error.

---

### 3. Frontend Routing Clean-Up: Direct `react-router-dom` Navigation

In Avrojit's Phase 1 report, Section 1.32 documented the use of a Next.js compatibility adapter:
> *"Framework Portability: Added a `next/link` Vite alias shim (`src/components/ui/NextLinkShim.jsx`) allowing Next.js components and React Router to work together seamlessly."*

Aritra refactored all core page components to use standard, native `react-router-dom` routing:

- **[`src/pages/Home.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/Home.jsx):**
  - Removed redundant `'use client'` directive.
  - Replaced `import Link from 'next/link'` with `import { Link } from 'react-router-dom'`.
- **[`src/pages/CanIApply.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/CanIApply.jsx):**
  - Replaced `import Link from 'next/link'` with `import { Link } from 'react-router-dom'`.
- **[`src/pages/Learn.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/Learn.jsx):**
  - Replaced `import Link from 'next/link'` with `import { Link } from 'react-router-dom'`.
- **[`src/pages/Track.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/Track.jsx):**
  - Replaced `import Link from 'next/link'` with `import { Link } from 'react-router-dom'`.

**Why this was done:**
- Eliminates alias indirection through `NextLinkShim.jsx`.
- Provides full TypeScript and IDE autocompletion for React Router v7.
- Eliminates any risk of Next.js hydration or router mismatches in a pure Vite Single Page Application.

---

### 4. Smooth Scroll Modernization (`src/components/SmoothScroll.jsx`)

Avrojit's report listed `@studio-freight/lenis`. However, Studio Freight deprecated that package namespace in favor of the official unified package `lenis`.

Aritra upgraded and hardened the smooth scrolling implementation:
1. **Modern Package Import:**
   - Changed `import Lenis from '@studio-freight/lenis'` &rarr; `import Lenis from 'lenis'`.
2. **Updated Configuration:**
   - Replaced deprecated config keys (`direction`, `gestureDirection`, `smooth`) with current standard `smoothWheel: true`.
3. **Resilient Animation Frame Loop:**
   - Restructured the `requestAnimationFrame` loop so `rafId = requestAnimationFrame(raf)` correctly triggers recursively and reliably cancels on component unmount via `cancelAnimationFrame(rafId)`.
4. **Defensive Error Handling:**
   - Wrapped initialization in a `try...catch` block with fallback warning (`console.warn('Smooth scroll initialization fallback:', err)`). This prevents the entire application from failing to mount in headless browsers, embedded WebViews, or non-scroll environments.

---

### 5. Repository & Tooling Configuration

- **[`.gitignore`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/.gitignore):**
  - Added exclusion rules for Python development:
    ```gitignore
    # Python
    .venv/
    venv/
    __pycache__/
    *.py[cod]
    *$py.class
    Backend/.env
    ```
- **Lockfile & Clean Build Verification:**
  - Pruned non-Windows libc bindings in `package-lock.json`.
  - Verified full production build: `npm run build` builds cleanly in ~9s with zero errors.
  - Verified linter: `npm run lint` (`oxlint`) passes 16 files with **0 warnings and 0 errors**.

---

## 📂 Updated Project Directory Structure

```text
Hackcache26_MARK-III_Mparivahan/
├── Backend/                            # 🚀 [ADDED BY ARITRA] FastAPI Microservice
│   ├── .env.example                    # Backend environment template (Supabase key & port)
│   ├── .venv/                          # Python virtual environment (ignored in git)
│   ├── main.py                         # FastAPI routes (/applications, /questions, /check-eligibility, /quiz/submit)
│   ├── README.md                       # Backend start guide & API documentation
│   ├── requirements.txt                # Frozen Python dependencies (fastapi, supabase, uvicorn, pydantic)
│   └── supabase_client.py              # Supabase SDK client + in-memory fallback mock engine
├── public/                             # Favicons and SVG asset icons
├── src/
│   ├── components/
│   │   ├── RootLayout.jsx              # 360px mobile shell + desktop backdrop
│   │   ├── SmoothScroll.jsx            # 🔄 [UPDATED BY ARITRA] Modern lenis + resilient RAF + try/catch
│   │   └── ui/
│   │       └── NextLinkShim.jsx        # Legacy Next.js compatibility adapter (now bypassed)
│   ├── hooks/
│   │   ├── useStickyState.js           # Persistent localStorage state hook
│   │   └── index.js
│   ├── lib/
│   │   ├── supabase.js                 # Frontend Supabase client initialization
│   │   └── utils.js                    # cn() classnames utility
│   ├── pages/
│   │   ├── Home.jsx                    # 🔄 [UPDATED BY ARITRA] Native react-router-dom Link, removed 'use client'
│   │   ├── CanIApply.jsx               # 🔄 [UPDATED BY ARITRA] Native react-router-dom Link
│   │   ├── Learn.jsx                   # 🔄 [UPDATED BY ARITRA] Native react-router-dom Link
│   │   └── Track.jsx                   # 🔄 [UPDATED BY ARITRA] Native react-router-dom Link
│   ├── App.jsx                         # React Router route registry
│   ├── index.css                       # Tailwind directives + shadcn CSS tokens
│   └── main.jsx                        # Application entry mount
├── .env.example                        # Frontend environment variables template
├── .gitignore                          # 🔄 [UPDATED BY ARITRA] Added Python venv & bytecode ignores
├── package.json                        # Dependencies (lenis, react-router-dom, etc.)
├── package-lock.json                   # Verified dependency tree
├── phase 1 work by avrojit.md          # Avrojit's original Phase 1 report
├── phase 1 work by aritra.md           # 📋 [THIS DOCUMENT] Aritra's additions & architecture report
├── tailwind.config.js                  # 360px mobile screen definition & color themes
├── vercel.json                         # Vercel SPA routing rewrite rules
└── vite.config.js                      # Vite bundler configuration
```

---

## 🛠️ Phase 2 Action Guide for Shubham

With Aritra's additions in place, Shubham has two viable paths for completing Phase 2 features:

### Option A: Connect Frontend Directly to FastAPI Backend (Recommended for Hackathon)
- **Why:** The FastAPI service already contains the exact business logic required for Phase 2:
  1. `/api/applications/{app_number}` &rarr; Powers the visual vertical progress stepper on `/track`.
  2. `/api/check-eligibility` &rarr; Powers the interactive eligibility checker on `/can-i-apply`.
  3. `/api/questions` and `/api/quiz/submit` &rarr; Powers the interactive mock quiz with instant scoring on `/learn`.
- **How to start Backend:**
  ```powershell
  cd Backend
  .venv\Scripts\uvicorn.exe main:app --reload --port 8000
  ```
- **Interactive API Docs:** Visit [http://localhost:8000/docs](http://localhost:8000/docs) to test any endpoint in the browser.

### Option B: Use Direct Frontend Supabase Client
- If the team prefers purely client-side database calls without running a separate Python server during Vercel deployment, the existing `src/lib/supabase.js` client can be called directly using the schema and queries already modeled in `Backend/supabase_client.py`.

---

## ✅ Sign-Off & Verification

- **Frontend Linter:** `oxlint` &rarr; Passed with 0 errors.
- **Frontend Production Build:** `vite build` &rarr; Passed in 9.06s (`dist/index.html`, `dist/assets/`).
- **Backend Service:** Verified operational with fallback data and full endpoints.
- **Ready for Review:** Shubham can now combine `phase 1 work by avrojit.md` and `phase 1 work by aritra.md` into the master project tracker.
