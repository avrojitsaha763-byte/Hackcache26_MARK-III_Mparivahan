# 📋 Phase 1 Progress Report — Data Architecture & UI/UX Feature Implementation — Licence Saathi | EasyDL

**Data Architect & UI/UX Feature Engineer:** Shubham  
**Collaborators:** Avrojit Saha (Project Lead & Frontend/Cloud Architect), Aritra (Backend & Systems Architect)  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Date:** October 2026  
**Status:** Completed, Verified & Live  

---

## 📌 Document Overview & Purpose

This document details the **data architecture, core domain datasets, UI component library, and interactive user flows** architected and implemented by **Shubham** during Phase 1 of **Licence Saathi (EasyDL)**.

Shubham's core responsibilities span:
1. **Data Layer Engineering (`src/data/`)**: Designed and built standard JSON and JS datasets (`config.json`, `questions.json`, `signs.json`, `signs.js`) encoding statutory Indian traffic laws, vehicle rules, and RTO exam syllabi.
2. **UI Component Library**: Created the reusable Shadcn UI Button component ([`src/components/ui/button.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/components/ui/button.jsx)).
3. **Interactive Feature Development**:
   - **`/can-i-apply`**: Built the 3-step animated Eligibility Wizard with persistent state.
   - **`/learn`**: Built the bilingual audio-enabled Traffic Signs Learning Module with speech synthesis.
4. **End-to-End Verification**: Tested all features in the browser on the live Vercel production deployment.

---

## 📦 Delivered Data Layer Assets (`src/data/`)

```text
src/data/
├── config.json       # App configuration, vehicle rules, RTO jurisdictions, stages & doc checklists
├── questions.json    # 20 authentic RTO exam questions across 3 syllabus categories
├── signs.json        # 24 official Indian traffic signs (Mandatory, Cautionary, Informatory)
└── signs.js          # 12 handcrafted vector SVG traffic sign icons with bilingual English/Hindi data
```

### 1. Application & Domain Configuration (`src/data/config.json`)
- **`app`**: Application identity, hackathon metadata, and legal disclaimer.
- **`vehicle_classes`**: Statutory classifications per the Motor Vehicles Act:
  - **`MCWOG`** (Motorcycle Without Gear): Min age 16, 50cc / moped / lightweight electric, requires parental consent, ₹150 fee.
  - **`MCWG`** (Motorcycle With Gear): Min age 18, all standard motorcycles, ₹150 fee.
  - **`LMV`** (Light Motor Vehicle): Min age 18, personal passenger cars / SUVs / hatchbacks, ₹200 fee.
  - **`TRANS`** (Commercial & Transport): Min age 20, 1 year prior LMV licence prerequisite, ₹300 fee.
- **`application_stages`**: 4-stage stepper lifecycle schema:
  - `0`: Application Submitted (Form 2 on Sarathi portal)
  - `1`: Document Scrutiny (RTO officer verification)
  - `2`: LL Test Slot Booked (Appointment scheduled)
  - `3`: Learner's Licence Approval (Form 3 issued)
- **`mock_test_settings`**: Official RTO exam standard (15 questions, 60% passing mark, 60s/question).
- **`document_requirements`**: Matrix for Age Proof, Address Proof, and Medical Fitness (Form 1 / 1A).
- **`rto_jurisdictions`**: Regional Transport Offices across 6 states (`DL`, `MH`, `KA`, `WB`, `UP`, `TN`).
- **`sample_applications`**: Pre-seeded demo records (`DL-2026-98124`, `MH-2026-11492`, `KA-2026-44019`).

### 2. RTO Question Bank (`src/data/questions.json`)
- **20 authentic RTO driving licence test questions** formatted per the Ministry of Road Transport and Highways (MoRTH) curriculum:
  - **Road Signs (Q1–Q6):** Cautionary triangles, octagonal Stop, inverted triangle Give Way, silence zones, speed limits, No Parking vs No Stopping.
  - **Traffic Rules (Q7–Q15):** Pedestrian crossing priority, right-side overtaking, emergency vehicle right of way (Section 194E), roundabout rules, 6-month LL validity, 30-day mandatory wait before permanent DL test, flashing red traffic signals.
  - **Safety & Regulations (Q16–Q20):** Blood Alcohol Content legal limits (Section 185), minimum age for 50cc mopeds (Section 4), 2-second safe following distance rule, certified helmets for rider & pillion (Section 129), and mobile phone penalties (Section 184c).
- Each question includes: `id`, `category`, `question`, `options` (array of 4), `correct_index` (0-indexed), `explanation`, and `difficulty`.

### 3. Traffic Signs Databases (`src/data/signs.json` & `src/data/signs.js`)
- **`signs.json`**: Comprehensive reference database of 24 signs across **Mandatory**, **Cautionary**, and **Informatory** categories with geometric shapes, color codes, required actions, and legal penalty sections under the Motor Vehicles Act.
- **`signs.js`**: Interactive module containing **12 handcrafted SVG vector icons** (Stop, Give Way, No Entry, No Parking, No Stopping, Horn Prohibited, Speed Limit 50, Pedestrian Crossing, School Ahead, Right Hairpin Bend, Roundabout, Hospital) paired with bilingual English and Hindi metadata (`name.en`, `name.hi`, `description.en`, `description.hi`).

---

## 🎨 Frontend UI/UX Engineering & Component Architecture (Shubham)

### 1. Reusable Button Component (`src/components/ui/button.jsx`)
Built a robust shadcn UI button primitive using `React.forwardRef` and `cn()` utility:
- **Variants:**
  - `default`: High-contrast blue (`bg-blue-600 hover:bg-blue-700 text-white`)
  - `outline`: Clean bordered button (`border border-slate-200 bg-white hover:bg-slate-100`)
  - `destructive`: Red danger action (`bg-red-500 hover:bg-red-600`)
  - `secondary`, `ghost`, `link`
- **Sizes:** `default`, `sm`, `lg`, `icon`.
- **Tactile Feedback:** Built-in mobile tap micro-animations with `active:scale-[0.98]`.
- **Accessibility:** Native focus rings (`focus-visible:ring-1`) and disabled opacity states.

---

### 2. Interactive Eligibility Wizard (`src/pages/CanIApply.jsx`)

Transformed the static `/can-i-apply` placeholder into a dynamic 3-step interactive wizard:

```text
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────────────┐
│  Step 1: Age    │ ────► │ Step 2: Vehicle Class  │ ────► │ Step 3: Instant Verdict │
│  (Number Input) │       │ (Two-Wheeler Options)  │       │ (Eligible vs Ineligible)│
└─────────────────┘       └────────────────────────┘       └─────────────────────────┘
```

#### Technical Highlights:
- **Persistent State:** Uses [`useStickyState`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/hooks/useStickyState.js) to store `age` (`user-age`) and `vehicle` (`user-vehicle`) in `localStorage`. If the user leaves and returns, their progress is preserved.
- **Framer Motion Transitions:** Steps animate horizontally with smooth entrance transitions (`initial={{ opacity: 0, x: 20 }}`, `animate={{ opacity: 1, x: 0 }}`).
- **Motor Vehicles Act Validation Logic:**
  ```javascript
  const checkEligibility = () => {
    const numAge = Number(age)
    if (numAge >= 18 && vehicle === 'motorcycle-gear') return true
    if (numAge >= 16 && vehicle === 'gearless-50cc') return true
    return false
  }
  ```
- **Dynamic Result Presentation:**
  - **Eligible:** Green badge (`✓`), affirmative guidance, and a button leading to required documents.
  - **Ineligible:** Red badge (`✗`), detailed explanation of age restrictions (18 for geared bikes, 16 for gearless 50cc with parental consent), and a "Start over" reset button.

---

### 3. Bilingual Audio Traffic Signs Learning Module (`src/pages/Learn.jsx`)

Transformed the `/learn` page into an audio-guided educational flashcard module:

#### Technical Highlights:
- **Web Speech API Integration (Text-to-Speech):**
  - Native browser `window.speechSynthesis` and `SpeechSynthesisUtterance`.
  - Automatically selects `hi-IN` for Hindi or `en-IN` for English.
  - Cancels any currently speaking utterance on new click (`window.speechSynthesis.cancel()`) to prevent overlapping audio chaos.
- **Live Bilingual Switcher:**
  - Dedicated language toggle button in the header (`English` &harr; `हिंदी`).
  - Stored in persistent `localStorage` via `useStickyState('en', 'app-lang')`.
  - Instant re-rendering of all sign names, descriptions, and page headings without page reload.
- **Inline SVG Graphics:** Renders clean, scale-independent vector traffic signs using `dangerouslySetInnerHTML={{ __html: sign.svg }}` inside a responsive grid.
- **Tactile Volume Button:** Circular button with `active:scale-95` tap feedback, accessible labels, and hover states.

---

## 🧪 Verification & Production Browser Testing

All deliverables were validated through automated test pipelines and browser automation:

| Check | Tool | Result | Status |
| :--- | :--- | :--- | :--- |
| **Static Code Quality** | `oxlint` | Scanned 18 files with 104 rules | **0 warnings, 0 errors** |
| **Production Build** | `vite build` | Bundled assets in 2.05s | **Success (`dist/`)** |
| **Eligibility Wizard Flow** | Browser Automation | Age input &rarr; Vehicle select &rarr; Verdict display | **Verified Live** |
| **Audio Guide & Language** | Browser Automation | English &harr; Hindi toggle & speech synthesis test | **Verified Live** |
| **Live Vercel Deployment** | HTTPS Browser | Loaded on production URL with 0 console errors | **Verified Live** |

---

## 🚀 Phase 2 Action Plan (Shubham)

1. **Interactive Mock Test Quiz Simulator (`/learn/quiz`):**
   - Connect `src/data/questions.json` to an interactive multiple-choice quiz runner.
   - Add a 15-minute countdown timer, progress bar, instant correct/incorrect visual feedback, and final score summary.
2. **Visual Stepper for Status Tracking (`/track`):**
   - Consume `src/data/config.json` application stages and demo applications to display a vertical timeline stepper (*Applied* &rarr; *Scrutiny* &rarr; *Slot Booked* &rarr; *Approved*).
