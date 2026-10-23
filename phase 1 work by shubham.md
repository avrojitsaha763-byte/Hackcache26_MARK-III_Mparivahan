# 📋 Phase 1 Progress Report — Data Architecture & UI/UX Feature Implementation — Licence Saathi | EasyDL

**Data Architect & UI/UX Feature Engineer:** Shubham  
**Project Lead & Backend Architect:** Aritro Roy  
**Core Frontend & Cloud Architect:** Avrojit Saha  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Domain Scope:** Indian RTO & Sarathi Parivahan (Strictly for Indian Users)  
**Date:** October 2026  
**Status:** Completed, Verified & Live  

---

## 🇮🇳 Project Scope & Indian RTO Statutory Compliance

**Licence Saathi (EasyDL)** is built exclusively for the **Indian driving licence applicant**, designed to simplify and digitize the citizen journey across state Regional Transport Offices (RTOs) under the **Ministry of Road Transport and Highways (MoRTH), Government of India**.

Under the guidance of **Project Lead Aritro Roy**, Shubham architected the domain datasets and interactive UI modules in strict adherence to:
1. **The Motor Vehicles Act, 1988 (Amended 2019)**.
2. **Central Motor Vehicles Rules (CMVR), 1989**.
3. **Sarathi Parivahan** national digital workflow for Learner's and Permanent Driving Licences.
4. **DigiLocker & Aadhaar Paperless e-KYC** protocols for instant, contactless identity and document verification.
5. **Standardized Computer-Based Test for Learner's Licence (STALL)** question curriculum.

---

## 🎯 Executive Summary (Shubham)

As **Data Architect & UI/UX Feature Engineer**, Shubham delivered:
1. The master static data layer under `src/data/` (`config.json`, `questions.json`, `signs.json`, `signs.js`) encoding statutory Indian RTO regulations, fees, RTO codes, vehicle categories, and syllabus questions.
2. The custom Shadcn UI Button component ([`src/components/ui/button.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/components/ui/button.jsx)).
3. The interactive 3-step Eligibility Wizard on [`src/pages/CanIApply.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/CanIApply.jsx) with state persistence and MV Act statutory age validation.
4. The bilingual audio-guided Traffic Signs Learning Module on [`src/pages/Learn.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/Learn.jsx) with Web Speech API text-to-speech in English and Hindi.
5. End-to-end browser automation validation confirming 100% interactive responsiveness on production Vercel deployment.

---

## 📦 Delivered Indian RTO Data Layer (`src/data/`)

```text
src/data/
├── config.json       # Indian RTO config, vehicle classes, DigiLocker e-KYC, stages & permanent DL rules
├── questions.json    # 20 authentic MoRTH RTO exam questions across 3 statutory syllabus categories
├── signs.json        # 24 official Indian traffic signs with geometric shapes, colors & MV Act penalties
└── signs.js          # 12 handcrafted vector SVG traffic sign icons with bilingual English/Hindi data
```

### 1. Application & Domain Configuration (`src/data/config.json`)
- **`app`**: Project identity led by **Aritro Roy**, statutory authority (MoRTH), governing acts (MV Act 1988, CMVR 1989).
- **`vehicle_classes`**: Standard Indian vehicle categories per CMVR:
  - **`MCWOG`** (Motorcycle Without Gear): Min age 16, 50cc / lightweight electric, requires Form 2 Part II guardian consent, statutory fee ₹150 + ₹50 test = ₹200.
  - **`MCWG`** (Motorcycle With Gear): Min age 18, all standard motorcycles, fee ₹200.
  - **`LMV`** (Light Motor Vehicle): Min age 18, personal passenger cars / SUVs / hatchbacks, fee ₹200.
  - **`TRANS`** (Commercial / Transport): Min age 20, 1 year prior LMV licence prerequisite, mandatory Form 1A medical certificate, fee ₹300.
- **`digilocker_and_ekyc`**: Specifications for paperless Aadhaar e-KYC and DigiLocker document verification (age proof via 10th marksheet, address proof, and Form 1 / 1A medical fitness).
- **`application_stages`**: Standard 4-stage Sarathi Parivahan application tracker:
  - `0`: Application Submitted & Fee Paid (Form 2)
  - `1`: Aadhaar e-KYC & Document Scrutiny
  - `2`: LL Online Test Slot / Proctoring (STALL)
  - `3`: Learner's Licence Issued (Form 3, valid 6 months nationwide)
- **`permanent_license_guidelines`**: Complete roadmap for obtaining Form 7 Smart Card DL (minimum 30-day wait from LL issuance date, Form 4 application, and practical track tests at Automated Driving Test Tracks - ADTT).
- **`mock_test_settings`**: Official RTO exam standard (15 questions, 60% passing mark, 60s/question).
- **`rto_jurisdictions`**: Regional Transport Offices across 6 Indian states (`DL-01`, `DL-04`, `MH-01`, `MH-02`, `KA-01`, `KA-03`, `WB-01`, `WB-02`, `UP-32`, `TN-01`).
- **`sample_applications`**: Pre-seeded demo records (`DL-2026-98124`, `MH-2026-11492`, `WB-2026-78210`).

### 2. RTO Question Bank (`src/data/questions.json`)
- **20 authentic RTO driving licence test questions** formulated per the MoRTH syllabus:
  - **Road Signs (Q1–Q6):** Triangular warning signs, octagonal Stop, inverted triangle Give Way, silence zones, speed limits, No Parking vs No Stopping.
  - **Traffic Rules (Q7–Q15):** Pedestrian crossing priority, right-side overtaking, emergency vehicle right-of-way (Section 194E), roundabout rules, 6-month LL validity, 30-day mandatory wait before permanent DL test, flashing red signals, continuous solid road lines.
  - **Safety & Regulations (Q16–Q20):** Blood Alcohol Content legal limits (Section 185), minimum age for 50cc mopeds (Section 4), 2-second safe following distance rule, certified helmets for rider & pillion (Section 129), and mobile phone penalties (Section 184c).

### 3. Traffic Signs Databases (`src/data/signs.json` & `src/data/signs.js`)
- **`signs.json`**: 24 signs across **Mandatory**, **Cautionary**, and **Informatory** categories with geometric shapes, color schemes, required actions, and legal penalty sections under the Motor Vehicles Act.
- **`signs.js`**: Interactive module containing **12 handcrafted SVG vector icons** paired with bilingual English and Hindi metadata (`name.en`, `name.hi`, `description.en`, `description.hi`).

---

## 🎨 UI/UX Component & Feature Implementations (Shubham)

### 1. Shadcn UI Button Component (`src/components/ui/button.jsx`)
- Built using `React.forwardRef` and Tailwind `cn()` utility.
- Supports variants (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`), sizes (`default`, `sm`, `lg`, `icon`), and mobile tactile scaling (`active:scale-[0.98]`).

### 2. Interactive Eligibility Wizard (`src/pages/CanIApply.jsx`)
- **3-step state machine** with Framer Motion slide-in animations.
- **Persistent storage** with `useStickyState` (`user-age`, `user-vehicle`).
- **Motor Vehicles Act Validation:**
  - Motorcycle with gear requires age &ge; 18.
  - Gearless up to 50cc requires age &ge; 16 (with parental consent).
- **Visual Feedback:** Instant green (`✓`) eligibility confirmation with document guidelines or red (`✗`) age guidance explaining legal requirements.

### 3. Bilingual Audio Traffic Signs Learning Module (`src/pages/Learn.jsx`)
- **Web Speech API Integration:** Speaks traffic sign names and rules aloud using `SpeechSynthesisUtterance` with accurate Indian accent (`en-IN` / `hi-IN`).
- **Audio Cancellation:** Cancels ongoing speech when a new sign is clicked, preventing audio overlap.
- **Bilingual Switcher:** Instant live toggle between **English** and **हिंदी** (`English` &harr; `हिंदी`) with state persisted via `useStickyState('en', 'app-lang')`.
- **Inline SVG Vector Rendering:** Renders scale-independent vector signs without blurry bitmap artifacts.

---

## 🧪 Verification & Production Testing

- **`oxlint`**: Scanned 18 files &rarr; **0 warnings, 0 errors**.
- **`vite build`**: Production bundle created in **2.05s**.
- **Live Browser Automation Testing**: Tested navigation, eligibility wizard (age 19 &rarr; motorcycle with gear &rarr; eligible), and audio guide (English &harr; Hindi language switch & speech synthesis) on [https://hackcache26-mark-iii-mparivahan.vercel.app/](https://hackcache26-mark-iii-mparivahan.vercel.app/) with zero console errors.

---

## 👥 Unified Team Structure

- **Project Lead & Backend Systems Architect:** Aritro Roy
- **Core Frontend & Cloud Architect:** Avrojit Saha
- **Data Architect & UI/UX Feature Engineer:** Shubham
