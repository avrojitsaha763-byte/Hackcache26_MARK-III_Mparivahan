# 📋 Phase 1 Progress Report — Core Frontend & Cloud Architecture — Licence Saathi | EasyDL

**Core Frontend & Cloud Architect:** Avrojit Saha  
**Project Lead & Backend Architect:** Aritro Roy  
**Data Architect & UI/UX Feature Engineer:** Shubham  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Domain Scope:** Indian RTO & Sarathi Parivahan (Strictly for Indian Users)  
**Date:** October 2026  
**Status:** Completed, Verified & Live  

---

## 🇮🇳 Project Scope: Strict Adherence to Indian RTO Regulations

**Licence Saathi (EasyDL)** is tailored exclusively for the **Indian transport ecosystem**, conforming strictly to the statutory requirements established by the **Ministry of Road Transport and Highways (MoRTH)**:

- **Motor Vehicles Act, 1988** & **Motor Vehicles Amendment Act, 2019**.
- **Central Motor Vehicles Rules (CMVR), 1989**.
- **Sarathi Parivahan** national portal workflows.
- **DigiLocker & UIDAI Aadhaar Paperless e-KYC** standards for contactless document submission.
- **Full Licence Lifecycle:** Form 2 Application &rarr; Aadhaar e-KYC &rarr; Online LL Computer Test (STALL) &rarr; Form 3 Learner's Licence &rarr; 30-Day Mandatory Wait &rarr; Form 4 Practical Test at Automated Driving Test Tracks (ADTT) &rarr; Form 7 Permanent Smart Card Driving Licence.

---

## 🎯 Executive Summary (Avrojit Saha)

As **Core Frontend & Cloud Architect**, Avrojit Saha designed and deployed the modern client application, the responsive 360px mobile viewport mockup, the Tailwind CSS design token architecture, the client-side state persistence layer, and the cloud PostgreSQL database on Supabase.

Working under the project leadership of **Aritro Roy** and in collaboration with **Shubham**, Avrojit ensured that the frontend reflects authentic Indian transport guidelines while maintaining high visual appeal, responsive layout, and seamless Vercel deployment.

---

## 🚀 Key Architectural Deliverables (Avrojit Saha)

### 1. Modern Frontend Architecture & Mobile-First Viewport
- **Framework:** React 19 (`^19.3.1`) + Vite 8 (`^8.3.4`) Single Page Application.
- **Strict 360px Mobile Container (`src/components/RootLayout.jsx`):** Designed to meet hackathon guidelines. On desktop displays, it renders as a sleek, centered smartphone mockup with rounded corners and drop shadows on a neutral `bg-slate-200` background.
- **Tailwind CSS Design System (`tailwind.config.js`):** Configured with shadcn HSL color variables (`primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `ring`) and custom 360px screen breakpoints (`mobile: '360px'`).
- **Global Typography & Resets (`src/index.css`):** Antialiased typography, hidden scrollbar utilities, and responsive CSS variables.

### 2. Client-Side State Persistence Engine (`useStickyState`)
- Built [`src/hooks/useStickyState.js`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/hooks/useStickyState.js), providing seamless synchronization between React state and browser `localStorage`.
- Includes defensive `try/catch` error boundaries to prevent app crashes in restricted environments (incognito browsing, embedded WebViews).
- Powers user state persistence across sessions for:
  - `user-age`: Applicant age input
  - `user-vehicle`: Selected Indian vehicle category (`motorcycle-gear`, `gearless-50cc`)
  - `app-lang`: User language selection (`en` for English, `hi` for Hindi)

### 3. Cloud Database Architecture (Supabase PostgreSQL)
- Initialized Supabase client in [`src/lib/supabase.js`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/lib/supabase.js) with support for both `VITE_` and `NEXT_PUBLIC_` environment variables.
- **PostgreSQL Database Schema:**
  - **`applications` Table:** Tracks Indian DL/LL application numbers, applicant names, date of birth, RTO codes (e.g. `DL-01`, `MH-02`, `WB-01`), vehicle classes, current stage index, and status.
  - **`questions` Table:** Stores multiple-choice RTO exam questions with options, correct answer indices, categories, and explanations.
- **Row Level Security (RLS):** Configured with public read policies for the hackathon demonstration.

### 4. Client Routing & Navigation
- Configured React Router DOM (`v7.18.4`) in [`src/App.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/App.jsx).
- Established the 4 core routes aligned with the Indian RTO user journey:
  1. **`/` (Home):** Stage selector card menu (*"Just starting"*, *"I have a learner's licence"*, *"I've applied and waiting"*) and prototype disclaimer.
  2. **`/can-i-apply`:** Indian RTO eligibility checker & DigiLocker document requirements.
  3. **`/learn`:** Bilingual traffic signs audio learner & RTO exam preparation.
  4. **`/track`:** Parivahan application status tracker.

### 5. DevOps, Cloud Deployment & Git Pipeline
- **Continuous Deployment (CI/CD):** Connected to Vercel with instant deployments triggered on every commit to `origin/main`.
- **SPA Routing Fix ([`vercel.json`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/vercel.json)):** Added rewrites (`/(.*)` &rarr; `/index.html`) to ensure hard browser refreshes and direct links never throw 404 errors.
- **Clean Git Tree:** Maintained clean repository with secrets and build outputs safely excluded.

---

## 👥 Team Roles & Responsibilities

| Contributor | Project Role | Primary Focus Areas |
| :--- | :--- | :--- |
| **Aritro Roy** | **Project Lead & Backend Systems Architect** | Indian RTO regulatory compliance, FastAPI microservice (`Backend/`), dual-mode Supabase engine, endpoint testing, and project coordination |
| **Avrojit Saha** | **Core Frontend & Cloud Architect** | React 19 SPA foundation, 360px mobile shell, Supabase cloud schema, `useStickyState`, design tokens, and Vercel CI/CD pipeline |
| **Shubham** | **Data Architect & UI/UX Feature Engineer** | Core domain datasets (`config.json`, `questions.json`, `signs.json`, `signs.js`), shadcn `Button` component, 3-step Eligibility Wizard, and bilingual audio learning module |

---

## 🛠️ Phase 2 Roadmap & Next Steps

1. **Parivahan Status Visual Stepper (`/track`):** Connect search input to query `/api/applications/{app_number}` or Supabase and render a vertical progress stepper (*Applied (Form 2)* &rarr; *DigiLocker Scrutiny* &rarr; *LL Test Slot* &rarr; *Form 3 Approved*).
2. **Interactive Mock Test Simulator (`/learn/quiz`):** Wire `questions.json` to an interactive quiz with a 60-second timer per question and instant scoring against the 60% RTO passing mark.
3. **Permanent Licence Guide (`/permanent-dl`):** Add guidance module for the 30-day mandatory waiting period and automated driving test tracks (ADTT).
