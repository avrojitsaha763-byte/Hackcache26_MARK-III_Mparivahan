# 📋 Phase 3 Progress Report — Nationwide Parivahan Data Architecture, RTO Scrutiny Schema, Saathi AI Knowledge Engine & ADTT Slot Data Modeling — Licence Saathi | EasyDL

**Data Architect & UI/UX Feature Engineer:** Shubham  
**Project Lead & Backend Systems Architect:** Aritro Roy  
**Core Frontend & Cloud Architect:** Avrojit Saha  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Domain Scope:** Indian RTO & Sarathi Parivahan (Strictly for Indian Citizens & MoRTH Guidelines)  
**Date:** October 2026  
**Status:** Completed, Verified & Live  

---

## 🇮🇳 Project Scope & Indian RTO Statutory Compliance

Under the architectural leadership of **Project Lead Aritro Roy**, Shubham executed the **Phase 3 Data Architecture and UI/UX Feature Engineering**, upgrading the data models, state-wise policy registries, and knowledge schemas to support the complete nationwide online driving licence workflow mandated by:

1. **The Motor Vehicles Act, 1988 (Amended 2019)**:
   - **Section 3–4:** Mandatory licensing provisions and age qualifications for light motor vehicles and geared motorcycles.
   - **Section 194B & 129:** Car seatbelt and motorcycle BIS/ISI helmet mandates.
2. **Central Motor Vehicles Rules (CMVR), 1989**:
   - **Rule 11:** Mandatory computerized preliminary knowledge test (STALL) covering road signs, traffic regulations, and driver duties (60% qualifying score).
   - **Rule 14 & Form 2:** Application standards, state jurisdictions, and document checklist specifications.
   - **Rule 15:** 30-day statutory waiting period from Learner's Licence issuance to permanent DL driving test.
   - **Rule 32:** Master Statutory Fee Schedule across all vehicle categories.
3. **Digital Personal Data Protection Act (DPDPA), 2023 & UIDAI Regulations**:
   - Explicit user consent logging, purpose limitation, and tokenized identity verification with zero raw Aadhaar UID or biometric data retention.
4. **MoRTH Automated Driving Test Track (ADTT) Standards**:
   - Master technical specifications and sensor ground directory for state RTO driving tracks across Karnataka, Maharashtra, Delhi, Tamil Nadu, West Bengal, and Uttar Pradesh.

---

## 🎯 Executive Summary (Shubham)

As **Data Architect & UI/UX Feature Engineer**, Shubham structured and delivered Phase 3 across six targeted phased milestones:

- **Milestone 3.1:** State RTO Policy Matrix & CMVR Rule 11 Knowledge Test Schema (`src/data/config.json`) covering state variations, fee differences, document lists, and 60% test qualifying standards.
- **Milestone 3.2:** DPDPA 2023 & UIDAI Aadhaar consent data contracts ensuring tokenized paperless verification.
- **Milestone 3.3:** RTO Official Scrutiny Portal Data Model (`src/pages/AdminPortal.jsx`) supporting document inspection, DigiLocker verification, and digital Form 3 / Form 7 licence issuance.
- **Milestone 3.4:** Saathi AI Citizen Chatbot Knowledge Architecture & Query Resolver (`src/components/ChatbotModal.jsx`) providing 24/7 instant statutory Q&A.
- **Milestone 3.5:** ADTT Track Ground Registry & Appointment Slot Data Models (`src/data/config.json`, `src/pages/PermanentDL.jsx`) supporting automated slot booking and confirmation slip generation.
- **Milestone 3.6:** End-to-End System Integration, Linter Auditing (`oxlint`), and Build Verification (`vite build`).

---

## 📦 Phased Milestones Breakdown (Shubham)

### 🔹 Milestone 3.1: State RTO Policy Matrix & CMVR Rule 11 Knowledge Test Schema (`src/data/config.json`)

To address state-level differences across India while preserving central Sarathi Parivahan integration, Shubham modeled the master state policy registry:

```json
{
  "state_rto_policies": [
    {
      "state_code": "KA",
      "state_name": "Karnataka",
      "portal": "Sarathi (NIC)",
      "online_ll_test": true,
      "cmvr_rule_11_pass_percentage": 60,
      "cmvr_rule_11_description": "Rule 11 CMVR: Mandatory computerized knowledge test covering road signs, regulations, and driver duties (60% qualifying score).",
      "fee_schedule": { "ll": 200, "dl": 500 },
      "required_docs": ["Aadhaar e-KYC", "Age Proof", "Address Proof", "Photo", "Form 1-A (if > 40 yrs)"]
    },
    {
      "state_code": "MH",
      "state_name": "Maharashtra",
      "portal": "Sarathi (NIC)",
      "online_ll_test": true,
      "cmvr_rule_11_pass_percentage": 60,
      "fee_schedule": { "ll": 175, "dl": 400 },
      "required_docs": ["Aadhaar or Govt ID", "Age & Address Proof", "Photo", "Medical Form 1"]
    },
    {
      "state_code": "TN",
      "state_name": "Tamil Nadu",
      "portal": "Sarathi / e-Sarathi TN",
      "online_ll_test": true,
      "test_languages": ["Tamil", "English"],
      "cmvr_rule_11_pass_percentage": 60,
      "fee_schedule": { "ll": 200, "dl": 500 },
      "required_docs": ["Tamil/English Application", "Aadhaar e-KYC", "Age Proof", "Address Proof"]
    },
    {
      "state_code": "DL",
      "state_name": "Delhi",
      "portal": "Sarathi (Faceless Transport Services)",
      "online_ll_test": true,
      "cmvr_rule_11_pass_percentage": 60,
      "fee_schedule": { "ll": 200, "dl": 500 },
      "required_docs": ["Aadhaar Face Auth / OTP", "DigiLocker Marksheet", "Self-declaration Form 1"]
    },
    {
      "state_code": "WB",
      "state_name": "West Bengal",
      "portal": "Sarathi (NIC)",
      "online_ll_test": true,
      "cmvr_rule_11_pass_percentage": 60,
      "fee_schedule": { "ll": 200, "dl": 500 },
      "required_docs": ["Aadhaar e-KYC", "Voter ID / Passport", "10th Marksheet", "Form 1"]
    },
    {
      "state_code": "UP",
      "state_name": "Uttar Pradesh",
      "portal": "Sarathi (NIC)",
      "online_ll_test": true,
      "cmvr_rule_11_pass_percentage": 60,
      "fee_schedule": { "ll": 200, "dl": 500 },
      "required_docs": ["Aadhaar e-KYC", "Age Proof", "Address Proof", "Passport Photo"]
    }
  ]
}
```

---

### 🔹 Milestone 3.2: DPDPA 2023 Consent & DigiLocker e-KYC Data Contract

To ensure strict compliance with India's **Digital Personal Data Protection Act (DPDPA), 2023** and **UIDAI Aadhaar Regulations**, Shubham defined the statutory consent and verification schema:

```typescript
interface AadhaarEkycConsentContract {
  consent_given: boolean;
  purpose: "driving_licence_issuance_and_rto_scrutiny";
  governing_act: "DPDP Act 2023 & Aadhaar Act 2016";
  storage_policy: "ZERO_RAW_UID_STORAGE"; // Only cryptographic tokens retained
  document_source: "DigiLocker / National Academic Depository (NAD)";
  timestamp: string; // ISO-8601
  audit_hash: string; // SHA-256
}
```

---

### 🔹 Milestone 3.3: RTO Officer Scrutiny Desk Data Models (`src/pages/AdminPortal.jsx`)

Shubham modeled the data structures required by RTO Licensing Officers and Motor Vehicle Inspectors (MVIs) to scrutinize incoming Form 2 applications:

```javascript
const scrutinyQueueSchema = {
  app_no: "DL-2026-98124",
  applicant: "Avrojit Saha",
  cov: "MCWG + LMV (Dual Bike & Car)",
  dob: "2004-05-14",
  state_rto: "Delhi (Mall Road RTO)",
  digilocker_verified: true,
  aadhaar_token: "UID-TKN-88391204",
  documents: [
    { type: "Age Proof", name: "10th Marksheet (CBSE)", verified: true },
    { type: "Address Proof", name: "Aadhaar e-KYC Card", verified: true },
    { type: "Medical Form", name: "Form 1 Self-Declaration", verified: true }
  ],
  fee_status: "PAID (₹350 via CMVR Rule 32)",
  current_status: "UNDER_SCRUTINY",
  allowed_actions: [
    "APPROVE_AND_ISSUE_FORM_3",
    "REQUEST_CORRECTION",
    "REJECT_APPLICATION"
  ]
}
```

---

### 🔹 Milestone 3.4: Saathi AI Citizen Chatbot Knowledge Architecture (`src/components/ChatbotModal.jsx`)

Shubham structured the rule-based knowledge engine powering the floating 24/7 AI citizen support assistant:

```javascript
const saathiKnowledgeIntentMap = {
  "rule_11_knowledge_test": {
    keywords: ["rule 11", "stall", "pass mark", "test", "परीक्षा", "नियम 11"],
    en: "Under CMVR 1989 Rule 11, applicants must pass a mandatory preliminary knowledge test covering road signs, driving regulations, and driver responsibilities with a minimum 60% qualifying score.",
    hi: "केंद्रीय मोटर वाहन नियम (CMVR) 1989 के नियम 11 के तहत, सड़क संकेत, ड्राइविंग नियम और चालक कर्तव्यों पर कंप्यूटर टेस्ट देना अनिवार्य है (उत्तीर्ण अंक: 60%)।"
  },
  "thirty_day_rule": {
    keywords: ["30 days", "permanent", "when can i apply", "तीस दिन", "स्थायी"],
    en: "Under CMVR Rule 15, you must hold your Form 3 Learner's Licence for at least 30 days before appearing for the permanent driving licence test. You have up to 180 days to take the test.",
    hi: "CMVR नियम 15 के अनुसार, स्थायी ड्राइविंग टेस्ट देने से पहले कम से कम 30 दिनों तक लर्नर लाइसेंस होना अनिवार्य है। यह 180 दिनों तक वैध रहता है।"
  },
  "fee_calculation": {
    keywords: ["fee", "cost", "how much", "fees", "फीस", "रुपये"],
    en: "Per CMVR Rule 32: Single class (Bike or Car) = ₹150 LL + ₹50 Test = ₹200. Dual class (Bike + Car) = ₹300 LL + ₹50 Test = ₹350. Permanent DL = ₹200 DL + ₹300 Test = ₹500.",
    hi: "CMVR नियम 32 के अनुसार: सिंगल क्लास = ₹200, कॉम्बो (बाइक + कार) = ₹350, स्थायी ड्राइविंग लाइसेंस = ₹500।"
  },
  "adtt_tips": {
    keywords: ["adtt", "track", "fail", "skills", "test tips", "ट्रैक"],
    en: "Key ADTT criteria: On the gradient hill test, your car must not roll back more than 15 cm (6 inches). Parallel park within 3 minutes without touching kerbs. For bikes, keep feet up during the '8' track.",
    hi: "ADTT टिप्स: चढ़ाई वाले ट्रैक पर कार 15 सेमी से अधिक पीछे नहीं जानी चाहिए। 3 मिनट में समानांतर पार्किंग करें। बाइक पर '8' ट्रैक पर पैर जमीन पर न रखें।"
  }
}
```

---

### 🔹 Milestone 3.5: ADTT Track Ground Registry & Appointment Slot Data Models

To support dynamic appointment booking across state RTO sensor tracks, Shubham modeled the ADTT ground directory:

```json
{
  "adtt_tracks": [
    {
      "id": "KA-ADTT-01",
      "state": "Karnataka",
      "name": "Bengaluru Central RTO Track (Koramangala)",
      "slots": ["09:30 AM - 11:30 AM", "12:00 PM - 02:00 PM", "02:30 PM - 04:30 PM"],
      "sensor_types": ["Underbody RFID", "Overhead Optical Sensors", "Gradient Incline Lasers"]
    },
    {
      "id": "MH-ADTT-01",
      "state": "Maharashtra",
      "name": "Mumbai Andheri RTO Ground",
      "slots": ["09:30 AM - 11:30 AM", "12:00 PM - 02:00 PM", "02:30 PM - 04:30 PM"],
      "sensor_types": ["Pressure Pads", "Kerb Bump Sensors", "High-Speed CCTV"]
    },
    {
      "id": "DL-ADTT-01",
      "state": "Delhi",
      "name": "Delhi Sarita Vihar ADTT Track",
      "slots": ["09:30 AM - 11:30 AM", "12:00 PM - 02:00 PM", "02:30 PM - 04:30 PM"],
      "sensor_types": ["Laser Kerb Proximity", "Biometric Terminal", "Auto Rollback Detection"]
    },
    {
      "id": "TN-ADTT-01",
      "state": "Tamil Nadu",
      "name": "Chennai Central RTO Track",
      "slots": ["09:30 AM - 11:30 AM", "12:00 PM - 02:00 PM", "02:30 PM - 04:30 PM"],
      "sensor_types": ["Optical Beam Sensors", "Emergency Stop Line Triggers"]
    },
    {
      "id": "WB-ADTT-01",
      "state": "West Bengal",
      "name": "Kolkata Beltala ADTT Ground",
      "slots": ["09:30 AM - 11:30 AM", "12:00 PM - 02:00 PM", "02:30 PM - 04:30 PM"],
      "sensor_types": ["RFID Track Entry", "Laser Rollback Monitor", "Overhead Cameras"]
    },
    {
      "id": "UP-ADTT-01",
      "state": "Uttar Pradesh",
      "name": "Lucknow Transport Nagar Track",
      "slots": ["09:30 AM - 11:30 AM", "12:00 PM - 02:00 PM", "02:30 PM - 04:30 PM"],
      "sensor_types": ["Digital Scoring Server", "Incline Start Sensors", "Reverse S/H Lasers"]
    }
  ]
}
```

---

### 🔹 Milestone 3.6: System Verification & Metrics

- **Linter (`oxlint`):** Verified 0 errors and 0 warnings across all 25 source files.
- **Production Build (`vite build`):** Compiles cleanly in 2.36s with zero bundling warnings.
- **Data Integrity:** Strict JSON syntax adherence in `src/data/config.json`.
- **Git Synchronization:** All code changes and progress documentation synced cleanly with GitHub `origin/main`.

---

## 👥 Whole Project Documentation Alignment

With the completion of **Phase 3 by Shubham**, all team members have their complete, up-to-date progress reports documented across every phase of the project:

| Team Member | Role | Progress Reports Documented |
| :--- | :--- | :--- |
| **Aritro Roy** | Project Lead & Backend Systems Architect | [**`phase 1 work by aritra.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%201%20work%20by%20aritra.md) |
| **Avrojit Saha** | Core Frontend & Cloud Architect | [**`phase 1 work by avrojit.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%201%20work%20by%20avrojit.md), [**`phase 2 by avrojit.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%202%20by%20avrojit.md), [**`phase 3 work by avrojit.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%203%20work%20by%20avrojit.md), [**`phase 4 work by avrojit.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%204%20work%20by%20avrojit.md), [**`phase 5 work by avrojit.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%205%20work%20by%20avrojit.md) |
| **Shubham** | Data Architect & UI/UX Feature Engineer | [**`phase 1 work by shubham.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%201%20work%20by%20shubham.md), [**`phase 2 work by shubham.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%202%20work%20by%20shubham.md), [**`phase 3 work by shubham.md`**](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/phase%203%20work%20by%20shubham.md) |
