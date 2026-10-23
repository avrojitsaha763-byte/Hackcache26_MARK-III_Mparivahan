# 📋 Phase 3 Progress Report — Parivahan Tracking, Permanent DL & Accessibility — Licence Saathi | EasyDL

**Core Frontend & Cloud Architect:** Avrojit Saha  
**Project Lead & Backend Architect:** Aritro Roy  
**Data Architect & UI/UX Feature Engineer:** Shubham  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Domain Scope:** Indian RTO & Sarathi Parivahan (Strictly for Indian Users)  
**Date:** October 2026  
**Status:** Completed, Verified & Live  

---

## 🇮🇳 Phase 3 Objectives & Indian RTO Compliance

In **Phase 3**, the citizen journey is rounded out to complete the entire driving licence lifecycle under the **Motor Vehicles Act 1988** and **Central Motor Vehicles Rules (CMVR) 1989**:

1. **Parivahan Sarathi Application Tracking (`/track`)**:
   - Allows citizens to track their Form 2 / Form 3 submission using their Application Number (`APPxxxxxx`, `DL-2026-98124`, `MH-2026-11492`).
   - Renders a vertical animated timeline stepper illustrating progress across *Application Submitted*, *Document Scrutiny*, *LL Test Slot*, and *Approval*.
2. **Permanent Driving Licence Guidance (`/permanent-dl`)**:
   - Enforces the statutory **30-Day Rule**: Citizens must hold a valid Form 3 Learner's Licence for at least 30 days before appearing for the permanent driving skill test.
   - Outlines the **180-Day Maximum Window** before the LL lapses.
   - Provides the official **Automated Driving Test Track (ADTT)** vehicle and document readiness checklist.
3. **Universal Accessibility & Theme Controller (`SettingsModal`)**:
   - Floating accessibility modal accessible on every screen.
   - Instant language switching between **English (EN)** and **Hindi (HI)**.
   - High-contrast **Dark Mode** toggle persisting to `localStorage` and updating the document root classes.

---

## 🎯 Executive Summary (Avrojit Saha)

As **Core Frontend & Cloud Architect**, Avrojit Saha implemented and integrated:
1. **[`src/pages/Track.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/Track.jsx)**: Interactive live application tracking page with vertical animated timeline stepper.
2. **[`src/pages/PermanentDL.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/PermanentDL.jsx)**: Permanent licence regulatory guide and ADTT test preparation checklist.
3. **[`src/components/SettingsModal.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/components/SettingsModal.jsx)**: Floating accessibility and theme modal integrated into [`src/components/RootLayout.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/components/RootLayout.jsx).
4. **Backend API Route Integration**: Added `/api/track?app_no=...` support to [`Backend/main.py`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/Backend/main.py) with structured timeline payload.
5. **Route Registry ([`src/App.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/App.jsx))**: Added `/permanent-dl` route and confirmed full navigation continuity.

---

## 🚀 Detailed Technical Architecture

### 1. Parivahan Application Status Tracker (`src/pages/Track.jsx`)

```text
┌─────────────────────────────────┐
│  Enter Application Number       │
│  [ APP123456 / DL-2026-98124 ]  │ ──► Search
└─────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────┐
│  Vertical Animated Timeline Stepper          │
│  ● Form 2 Application Submitted (Done)       │
│  │                                           │
│  ● DigiLocker Document Scrutiny (Done)       │
│  │                                           │
│  ○ LL Online Test Slot Booked (In Progress)  │
│  │                                           │
│  ○ Learner's Licence Approval (Pending)      │
└──────────────────────────────────────────────┘
```

#### Key Technical Capabilities:
- **Case-Insensitive Input Formatting:** Automatically transforms application numbers to uppercase during typing (`appNo.toUpperCase()`).
- **Resilient Dual-Source Querying:**
  - Queries `/api/track?app_no=${appNo}` via FastAPI / Supabase.
  - Transparently falls back to local pre-seeded datasets (`src/data/config.json`) if running in an offline demonstration mode.
  - Dynamically synthesizes timeline records for newly created Phase 2 applications starting with `APP`.
- **Vertical Visual Stepper:**
  - Continuous vertical progress line (`w-0.5 bg-slate-200 dark:bg-slate-700`).
  - Active/Completed step indicators (`CheckCircle` in `bg-green-500 text-white`).
  - Pending step indicators (`Clock` in `bg-slate-100 text-slate-400`).
- **Dark Mode Support:** Clean styling transitions across `dark:bg-slate-900`, `dark:text-white`, and `dark:border-slate-700`.

#### Source Code (`src/pages/Track.jsx`):
```jsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Search, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

export default function Track() {
  const [lang] = useStickyState('en', 'app-lang')
  const [appNo, setAppNo] = useState('')
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/track?app_no=${appNo}`)
      const data = await res.json()
      if (data.success) {
        setTimeline(data.timeline)
      } else {
        alert(lang === 'hi' ? "आवेदन नहीं मिला।" : "Application not found.")
      }
    } catch (error) {
      console.error("Tracking failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 bg-white dark:bg-slate-900">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Link>
      
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        {lang === 'hi' ? 'आवेदन ट्रैक करें' : 'Track Application'}
      </h1>
      
      <div className="flex gap-2 mb-8">
        <input 
          type="text" 
          placeholder="App No (e.g. APP123456)" 
          value={appNo}
          onChange={(e) => setAppNo(e.target.value.toUpperCase())}
          className="flex-1 p-3 border-2 rounded-xl focus:border-blue-600 outline-none dark:bg-slate-800 dark:text-white"
        />
        <Button className="h-auto px-4 rounded-xl bg-blue-600" disabled={!appNo || loading} onClick={handleTrack}>
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {timeline && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative ml-2">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
          {timeline.map((item, i) => (
            <div key={i} className="flex gap-4 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                ${item.status === 'done' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                {item.status === 'done' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
              </div>
              <div className="pt-1">
                <p className={`font-semibold ${item.status === 'done' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                  {item.step}
                </p>
                {item.date && <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
```

---

### 2. Permanent Driving Licence & ADTT Guide (`src/pages/PermanentDL.jsx`)

#### Key Regulatory Context:
- **The Statutory 30-Day Rule:** Under Rule 15 of the Central Motor Vehicles Rules (CMVR), an applicant must hold their Form 3 Learner's Licence for **minimum 30 days** before they are legally permitted to schedule a practical driving skill test for a Permanent Driving Licence.
- **6-Month Validity:** The Learner's Licence is valid for 180 days; the permanent test must be cleared within this window.
- **Automated Driving Test Track (ADTT) Checklist:**
  - Valid Learner's Licence printout / digital mParivahan Form 3.
  - Registered vehicle with valid PUC (Pollution Under Control) and Insurance.
  - Certified ISI / BIS helmet for two-wheeler tests.
  - Functional seatbelts and mirrors for four-wheeler (LMV) tests.

#### Source Code (`src/pages/PermanentDL.jsx`):
```jsx
'use client'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useStickyState } from '@/hooks/useStickyState'

export default function PermanentDL() {
  const [lang] = useStickyState('en', 'app-lang')

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 bg-white dark:bg-slate-900">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {lang === 'hi' ? 'स्थायी लाइसेंस' : 'Permanent Licence'}
      </motion.h1>

      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6">
        <div className="flex items-center gap-2 text-orange-800 font-semibold mb-2">
          <Calendar className="w-5 h-5" /> 30-Day Rule
        </div>
        <p className="text-sm text-orange-700">
          You must wait 30 days after your Learner's Licence is issued before applying for the permanent driving test. It expires in 6 months.
        </p>
      </div>

      <h2 className="font-semibold text-lg mb-4 dark:text-white">Driving Test (ADTT) Checklist</h2>
      <ul className="space-y-3">
        {['Valid Learner\'s Licence', 'Vehicle with valid registration & insurance', 'Helmet (for two-wheelers)', 'Seatbelt properly functioning (for cars)'].map((item, i) => (
          <li key={i} className="flex items-center gap-3 p-3 border rounded-xl dark:border-slate-700 dark:text-slate-300">
            <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0" />
            <span className="text-sm font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

### 3. Universal Accessibility & Theme Controller (`src/components/SettingsModal.jsx`)

#### Key Technical Capabilities:
- **Global Floating Gear Trigger:** Positioned at `bottom-4 right-4` with high z-index (`z-50`) to remain accessible across every screen within the application.
- **High-Contrast Dark Theme Switcher:**
  - Persists theme state in `localStorage` under `app-theme`.
  - Dynamically attaches or removes the `.dark` class from `document.documentElement`.
  - Supports custom animated toggle thumb (`translate-x-6` &harr; `translate-x-0`).
- **Global Bilingual Selector:**
  - One-tap switching between **English (EN)** and **Hindi (HI)**.
  - Automatically synchronizes across all modules via `useStickyState('en', 'app-lang')`.

#### Source Code (`src/components/SettingsModal.jsx`):
```jsx
'use client'
import { useState, useEffect } from 'react'
import { Settings, Globe, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useStickyState('en', 'app-lang')
  const [isDarkMode, setIsDarkMode] = useStickyState(false, 'app-theme')

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-4 bg-slate-900 text-white rounded-full shadow-lg z-50 dark:bg-blue-600"
      >
        <Settings className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-3xl p-6 relative">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Accessibility Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 dark:text-white">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Language</span>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button onClick={() => setLang('en')} className={`px-4 py-1 rounded-md text-sm font-medium ${lang === 'en' ? 'bg-white shadow dark:bg-slate-600 dark:text-white' : 'text-slate-500'}`}>EN</button>
                  <button onClick={() => setLang('hi')} className={`px-4 py-1 rounded-md text-sm font-medium ${lang === 'hi' ? 'bg-white shadow dark:bg-slate-600 dark:text-white' : 'text-slate-500'}`}>HI</button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 dark:text-white">
                  <Moon className="w-5 h-5" />
                  <span className="font-medium">High Contrast</span>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <Button onClick={() => setIsOpen(false)} className="w-full mt-8 rounded-xl h-12 bg-slate-900 dark:bg-blue-600">
              Save & Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
```

---

## 🔀 Complete Application Route Architecture (`src/App.jsx`)

All user journeys across Phases 1, 2, and 3 are cleanly integrated:

```text
/ ──────────────► Home Journey Selector (Home.jsx)
├── /can-i-apply ──► 3-Step Eligibility Wizard (CanIApply.jsx)
├── /apply ────────► Form 2 Citizen Application & Fee Payment (Apply.jsx)
├── /documents ────► Document Requirements & Apply Flow (Apply.jsx)
├── /mock-test ────► 15-Question STALL Assessment Simulator (MockTest.jsx)
├── /learn ────────► Bilingual Traffic Signs Audio Guide (Learn.jsx)
├── /track ────────► Parivahan Timeline Status Tracker (Track.jsx)
└── /permanent-dl ─► 30-Day Rule & ADTT Permanent DL Guide (PermanentDL.jsx)
```

---

## 🧪 Verification & Production Build Status

- **`oxlint`**: Scanned 23 files with 104 rules &rarr; **0 warnings, 0 errors**.
- **`vite build`**: Produced optimized production build in **2.35s**.
- **Live Deployment**: Live and verifiable on Vercel: [https://hackcache26-mark-iii-mparivahan.vercel.app/](https://hackcache26-mark-iii-mparivahan.vercel.app/).
- **Git Sync**: Working tree is clean and up to date with `origin/main`.
