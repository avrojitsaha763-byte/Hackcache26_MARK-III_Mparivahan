# 📋 Phase 1 Progress Report — Data Architecture & Datasets — Licence Saathi | EasyDL

**Author:** Shubham  
**Collaborators:** Avrojit Saha, Aritra  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Documentation Maintainer:** Shubham  
**Date:** October 2026  
**Status:** Completed, Tested & Synced to Git  

---

## 📌 Document Overview & Purpose

This document notes down the completion of the **static data layer and core domain datasets** for **Licence Saathi (EasyDL)**, created and integrated by **Shubham** under `src/data/`.

While Avrojit developed the frontend shell and Supabase connection, and Aritra implemented the FastAPI backend microservice and routing refactoring, **Shubham architected and delivered the comprehensive domain datasets (`config.json`, `questions.json`, `signs.json`)** that directly fuel the user interface:
1. **`/can-i-apply`**: Powered by vehicle class rules, age criteria, document matrices, and statutory fee structures.
2. **`/learn`**: Powered by authentic 2026 RTO exam questions, instant scoring logic, and traffic sign flashcards.
3. **`/track`**: Powered by multi-state RTO codes, standard 4-stage application timelines, and demo test applications.

---

## 📦 Delivered Data Assets in `src/data/`

```text
src/data/
├── config.json       # App configuration, vehicle rules, RTO codes, stages & docs
├── questions.json    # 20 authentic RTO exam questions across 3 syllabus categories
└── signs.json        # 24 official Indian traffic signs (Mandatory, Cautionary, Informatory)
```

---

## 🔍 Detailed Data Architecture & Schemas

### 1. Application & Domain Configuration (`src/data/config.json`)

The central configuration file that standardizes legal requirements, stages, and RTO data across both client and mock layers.

#### Key Sections:
- **`app`**: Application branding, version, hackathon identification, and statutory disclaimer.
- **`vehicle_classes`**: Statutory classifications per the Motor Vehicles Act:
  - **`MCWOG`** (Motorcycle Without Gear): Min age 16, 50cc / moped / lightweight electric, requires parental consent, ₹150 fee.
  - **`MCWG`** (Motorcycle With Gear): Min age 18, all standard motorcycles, ₹150 fee.
  - **`LMV`** (Light Motor Vehicle): Min age 18, private cars / hatchbacks / sedans / SUVs, ₹200 fee.
  - **`TRANS`** (Commercial & Transport): Min age 20, 1 year prior LMV licence prerequisite, ₹300 fee.
- **`application_stages`**: 4 sequential stages for tracking application progress:
  - `0`: Application Submitted (Form 2 on Sarathi portal)
  - `1`: Document Scrutiny (RTO officer review)
  - `2`: LL Test Slot Booked (Appointment scheduled)
  - `3`: Learner's Licence Approval (Form 3 issued)
- **`mock_test_settings`**: Passing criteria matching official RTO standards (15 questions, 60% pass threshold, 60s per question).
- **`document_requirements`**: Official checklists for Proof of Age, Proof of Address, and Medical Fitness (Form 1 / Form 1A).
- **`rto_jurisdictions`**: RTO codes across Delhi (`DL-01`, `DL-04`), Maharashtra (`MH-01`, `MH-02`), Karnataka (`KA-01`, `KA-03`), West Bengal (`WB-01`, `WB-02`), Uttar Pradesh (`UP-32`), and Tamil Nadu (`TN-01`).
- **`sample_applications`**: Pre-seeded demo tracking records (`DL-2026-98124`, `MH-2026-11492`, `KA-2026-44019`) for zero-latency UI testing.

---

### 2. RTO Question Bank (`src/data/questions.json`)

A pool of **20 authentic RTO driving licence exam questions** formulated according to the Ministry of Road Transport and Highways (MoRTH) syllabus.

#### Schema Definition:
```json
{
  "id": 1,
  "category": "Road Signs | Traffic Rules | Safety",
  "question": "Question text...",
  "options": [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4"
  ],
  "correct_index": 1,
  "explanation": "Detailed explanation citing Motor Vehicles Act or road safety principle...",
  "sign_id": "sign-stop",
  "difficulty": "easy | medium | hard"
}
```

#### Syllabus Coverage:
- **Road Signs (Questions 1–6):** Triangular warning signs, octagonal Stop sign, inverted triangle Give Way sign, silence zones, speed limit signs, and the distinction between No Parking vs No Stopping.
- **Traffic Rules (Questions 7–15):** Pedestrian crossing priority, right-side overtaking regulations, mandatory clearance for emergency vehicles (Section 194E), roundabout right-of-way, prohibition of overtaking on bridges/curves, 6-month LL validity, 30-day mandatory wait before final DL test, flashing red traffic signals, and continuous solid lane lines.
- **Safety & Regulations (Questions 16–20):** Blood Alcohol Content legal limit (Section 185), minimum age for 50cc mopeds (Section 4), the 2-second safe following distance rule, certified helmet requirements for rider and pillion (Section 129), and penalties for mobile phone usage while driving (Section 184c).

---

### 3. Road Signs Database (`src/data/signs.json`)

An exhaustive catalog of **24 standard Indian traffic signs** classified into the three legal categories under Schedule 1 of the Motor Vehicles Act:

| Category | Geometric Shape | Standard Colors | Legal Implications | Examples Included |
| :--- | :--- | :--- | :--- | :--- |
| **Mandatory / Regulatory** | Circular, Octagonal, Inverted Triangle | Red border, White/Blue background | Mandatory compliance under MV Act Section 119. Violation leads to immediate fines. | Stop, Give Way, No Entry, One Way, U-Turn Prohibited, Overtaking Prohibited, Silence Zone, No Parking, No Stopping, Speed Limit 50, Compulsory Sound Horn, Compulsory Ahead/Right |
| **Cautionary / Warning** | Upright Equilateral Triangle | Red border, White background, Black icon | Informs drivers of upcoming road conditions and hazards. | Right Hairpin Bend, Left Hairpin Bend, Pedestrian Crossing, School Ahead, Roundabout, Narrow Road Ahead, Narrow Bridge Ahead, Slippery Road Ahead |
| **Informatory / Guide** | Rectangular | Blue / Green background, White icon | Directions, facilities, and public services. | Hospital Ahead, First Aid Post, Petrol Pump, Car Parking Area |

Each sign record includes `id`, `name`, `category`, `shape`, `background_color`, `border_color`, `symbol_color`, `description`, `action_required`, and `fine_section`.

---

## 💻 Frontend UI Integration Guide (For Avrojit & Shubham)

All three JSON files can be imported directly into React components without any extra bundle setup or backend dependency:

### 1. In `src/pages/CanIApply.jsx` (Eligibility Checker)
```jsx
import config from '../data/config.json'

export function checkEligibility(dob, selectedVehicleCode) {
  const vehicle = config.vehicle_classes.find(v => v.code === selectedVehicleCode)
  // Compute age from dob and compare with vehicle.min_age
  const documents = [
    ...config.document_requirements.age_proof,
    ...config.document_requirements.address_proof,
    ...config.document_requirements.medical_fitness
  ]
  return { eligible: true, vehicle, documents }
}
```

### 2. In `src/pages/Learn.jsx` (Mock Test & Signs Practice)
```jsx
import questionsData from '../data/questions.json'
import signsData from '../data/signs.json'

// For the mock test:
const questions = questionsData.questions // Array of 20 questions
const passThreshold = 9 // 60% of 15 questions

// For traffic signs visual flashcards:
const mandatorySigns = signsData.signs.filter(s => s.category === 'Mandatory')
const cautionarySigns = signsData.signs.filter(s => s.category === 'Cautionary')
```

### 3. In `src/pages/Track.jsx` (Application Stepper)
```jsx
import config from '../data/config.json'

export function getApplicationTimeline(appNumber) {
  const found = config.sample_applications.find(
    a => a.application_number.toUpperCase() === appNumber.trim().toUpperCase()
  )
  return found || null
}
```

---

## 🛠️ Validation & Verification

1. **JSON Syntax Validation:**
   - Ran `node -e "JSON.parse(fs.readFileSync(...))"` on all three files &rarr; **All JSON files valid with zero syntax or character encoding errors.**
2. **Linter Status:**
   - Ran `npm run lint` (`oxlint`) &rarr; **0 warnings and 0 errors across 16 files.**
3. **Build Status:**
   - Ran `npm run build` (`vite build`) &rarr; **Built client production bundle cleanly.**

---

## 🚀 Git Sync & Next Steps for Phase 2

- **Delivered by:** Shubham
- **Assets Created:**
  - [`src/data/config.json`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/data/config.json)
  - [`src/data/questions.json`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/data/questions.json)
  - [`src/data/signs.json`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/data/signs.json)
  - [`phase 1 work by shubham.md`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%201%20work%20by%20shubham.md)
- **Ready for Immediate UI Plugging:** Avrojit and Shubham can now replace placeholder text in `/can-i-apply`, `/learn`, and `/track` with rich interactive cards and quizzes using these datasets!
