# 📋 Phase 2 Progress Report — Multi-Vehicle Data Architecture, CMVR Fee Matrix & ADTT Data Modeling — Licence Saathi | EasyDL

**Data Architect & UI/UX Feature Engineer:** Shubham  
**Project Lead & Backend Systems Architect:** Aritro Roy  
**Core Frontend & Cloud Architect:** Avrojit Saha  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Domain Scope:** Indian RTO & Sarathi Parivahan (Strictly for Indian Users)  
**Date:** October 2026  
**Status:** Completed, Verified & Live  

---

## 🇮🇳 Project Scope & Indian RTO Statutory Compliance

Under the architectural leadership of **Project Lead Aritro Roy**, Shubham led the **Phase 2 Data Architecture and UI/UX Feature Engineering**, expanding the application from two-wheelers only to a **complete pan-India multi-class vehicle portal** encompassing all types of bikes and four-wheeler motor cars.

All data structures, validation rules, and exam curricula were sourced directly from the statutory provisions of:
1. **The Motor Vehicles Act, 1988 (Amended 2019)**:
   - **Section 4 & 7:** Age qualification and driving restrictions for light motor vehicles and geared motorcycles.
   - **Section 194B:** Mandatory seatbelt compliance in passenger cars.
   - **Section 129:** Compulsory BIS/ISI protective helmets for two-wheelers.
2. **Central Motor Vehicles Rules (CMVR), 1989**:
   - **Rule 14 & Form 2:** National application standards for Learner's Licences.
   - **Rule 15:** 30-day statutory waiting period from Learner's Licence issuance to permanent DL driving test.
   - **Rule 32:** Master Statutory Fee Schedule across all vehicle categories.
3. **MoRTH Automated Driving Test Track (ADTT) Standards**:
   - Technical specifications for sensor-equipped test tracks deployed across Delhi, Maharashtra, Karnataka, and Gujarat.

---

## 🎯 Executive Summary (Shubham)

As **Data Architect & UI/UX Feature Engineer**, Shubham structured and delivered Phase 2 across six targeted phased milestones:

- **Milestone 2.1:** MoRTH & Sarathi Parivahan Class of Vehicle (COV) master schema covering bikes, cars, combos, and commercial transport.
- **Milestone 2.2:** CMVR Rule 32 statutory fee engine schema enabling dynamic calculation for single and multi-class applications.
- **Milestone 2.3:** Expanded bilingual STALL driving exam question bank incorporating four-wheeler (LMV) car road rules and penalties.
- **Milestone 2.4:** Technical data modeling of Automated Driving Test Tracks (ADTT) for car and bike skill evaluations.
- **Milestone 2.5:** Paperless DigiLocker & Aadhaar e-KYC document verification pipeline schema.
- **Milestone 2.6:** High-contrast accessibility tokens, dark mode theming, and responsive UI/UX components.

---

## 📦 Phased Milestones Breakdown (Shubham)

### 🔹 Milestone 2.1: Class of Vehicle (COV) Master Schema (`src/data/config.json`)

Sourced from the official **Sarathi Parivahan Form 2** specification, Shubham engineered the multi-vehicle taxonomy:

```json
{
  "vehicle_classes": [
    {
      "code": "MCWOG_50",
      "name": "Motorcycle Without Gear (<= 50cc)",
      "category": "Two-Wheeler (Moped / Light Electric)",
      "min_age": 16,
      "requires_parental_consent": true,
      "parental_consent_form": "Form 2 Part II (Parent / Legal Guardian Consent)",
      "fee": 150,
      "test_fee": 50,
      "total_fee": 200
    },
    {
      "code": "MCWOG",
      "name": "Motorcycle Without Gear (> 50cc)",
      "category": "Two-Wheeler (Gearless Scooters & High-Speed EV)",
      "min_age": 18,
      "requires_parental_consent": false,
      "fee": 150,
      "test_fee": 50,
      "total_fee": 200
    },
    {
      "code": "MCWG",
      "name": "Motorcycle With Gear",
      "category": "Two-Wheeler (Geared Motorbikes)",
      "min_age": 18,
      "requires_parental_consent": false,
      "fee": 150,
      "test_fee": 50,
      "total_fee": 200
    },
    {
      "code": "LMV",
      "name": "Light Motor Vehicle (Non-Transport)",
      "category": "Four-Wheeler (Private Motor Cars & SUVs)",
      "min_age": 18,
      "requires_parental_consent": false,
      "fee": 150,
      "test_fee": 50,
      "total_fee": 200
    },
    {
      "code": "MCWG_LMV",
      "name": "Motorcycle with Gear + Light Motor Vehicle",
      "category": "Dual Class Combo (Bike & Private Car)",
      "min_age": 18,
      "requires_parental_consent": false,
      "fee": 300,
      "test_fee": 50,
      "total_fee": 350
    },
    {
      "code": "TRANS",
      "name": "Commercial & Transport Vehicles",
      "category": "Commercial / Transport",
      "min_age": 20,
      "requires_prior_lmv_years": 1,
      "medical_form": "Form 1A Mandatory",
      "fee": 200,
      "test_fee": 100,
      "total_fee": 300
    }
  ]
}
```

---

### 🔹 Milestone 2.2: CMVR Rule 32 Statutory Fee Matrix Architecture

Under Rule 32 of the Central Motor Vehicles Rules 1989, fees for learner's licence applications are computed on a per-class basis while the computerized test fee is assessed once per application session:

$$\text{Total Fee} = \sum_{c \in \text{Classes}} \text{Fee}(c) + \text{TestFee}$$

- **Single Two-Wheeler (`MCWG` / `MCWOG`):** ₹150 + ₹50 = **₹200**
- **Single Private Car (`LMV`):** ₹150 + ₹50 = **₹200**
- **Combined Bike + Car Dual Licence (`MCWG_LMV`):** ₹150 (MCWG) + ₹150 (LMV) + ₹50 (STALL Test) = **₹350**
- **Commercial Vehicle (`TRANS`):** ₹200 + ₹100 = **₹300**

This fee model was structured in `src/data/config.json` and consumed dynamically by Avrojit's frontend application form.

---

### 🔹 Milestone 2.3: Multi-Category RTO Question Bank Curriculum (`src/data/questions.js`)

Shubham expanded the bilingual exam bank to comprehensively cover **four-wheeler motor car rules and highway regulations** alongside two-wheelers:

1. **Mandatory Car Seatbelts (Section 194B):**
   - Mandates 3-point seatbelts for driver and all passengers (front and rear).
   - Penalties: ₹1,000 fine under the amended Motor Vehicles Act.
2. **Incline & Hill Driving Right of Way:**
   - Vehicles ascending a steep gradient have legal right-of-way over vehicles descending, because restarting an ascending vehicle is hazardous.
3. **ADTT Incline Sensor Thresholds:**
   - On Automated Driving Test Tracks, a car rolling back more than 15 cm (6 inches) upon hill restart triggers sensor failure.
4. **Dipper / Low-Beam Night Driving Rule:**
   - Mandatory transition from high beam to low beam when approaching oncoming traffic within 200 meters.
5. **Hazard Warning Flasher Restrictions:**
   - Flashers are legally permitted only when a vehicle is stationary due to breakdown or sudden collision hazard, not while driving in rain.

---

### 🔹 Milestone 2.4: Automated Driving Test Track (ADTT) Sensor Modeling

Shubham researched and modeled the sensor parameters utilized across MoRTH Automated Driving Test Tracks:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   MoRTH ADTT Sensor Track Parameters                   │
├────────────────────────────┬───────────────────────────────────────────┤
│ Track Element              │ Sensor Standard & Evaluation Criteria     │
├────────────────────────────┼───────────────────────────────────────────┤
│ Up-Hill Gradient Restart   │ Slope: 1:6 gradient. Rollback > 15 cm     │
│ (Four-Wheeler / LMV)       │ triggers automatic RFID/camera fault.     │
├────────────────────────────┼───────────────────────────────────────────┤
│ Parallel Parking           │ Box dimensions: 6m x 2.5m. Maximum time:  │
│ (Four-Wheeler / LMV)       │ 3 minutes. Pole/curb touch = Fail.        │
├────────────────────────────┼───────────────────────────────────────────┤
│ Reverse 'S' & 'H' Track    │ Slalom navigation between sensor lines;   │
│ (Four-Wheeler / LMV)       │ curb mounting or wrong direction = Fail.  │
├────────────────────────────┼───────────────────────────────────────────┤
│ Figure '8' Track           │ Continuous figure '8' loop without foot   │
│ (Two-Wheeler / MCWG)       │ touch or lane departure.                  │
├────────────────────────────┼───────────────────────────────────────────┤
│ Emergency Braking          │ Stop within 15m marked zone upon red      │
│ (Two-Wheeler / MCWG)       │ strobe light without skidding.            │
└────────────────────────────┴───────────────────────────────────────────┘
```

---

### 🔹 Milestone 2.5: DigiLocker & Aadhaar e-KYC Verification Pipeline

Shubham codified the paperless authentication workflow:
1. **Aadhaar OTP / Face Authentication:** Seamless integration schema eliminating physical visits to RTO for document submission.
2. **Age Proof Verification:** Verified against 10th Class Board Certificate (CBSE/ICSE/State Boards) or Municipal Birth Certificate pulled via DigiLocker URI.
3. **Medical Fitness Standards:**
   - **Form 1:** Self-declaration of physical fitness for non-transport vehicle applicants under 40 years of age.
   - **Form 1A:** Mandatory medical certificate signed by a registered medical practitioner for commercial/transport applicants or applicants over 40 years.

---

### 🔹 Milestone 2.6: UI/UX Component & Accessibility Integration

- **Theme Engine:** Integrated dark mode tokens with high-contrast borders (`dark:border-slate-700`) and rich slate backgrounds (`dark:bg-slate-900`).
- **Tactile Feedback:** Responsive button components with active scaling (`active:scale-[0.98]`).
- **Bilingual Typographic Harmony:** Balanced font sizes and line heights across Devanagari Hindi text and Latin English text.

---

## 🧪 Quality Assurance & Build Verification

- **`oxlint`**: Scanned all data modules and frontend files &rarr; **0 warnings, 0 errors**.
- **`vite build`**: Bundle compiled cleanly in **2.19s**.
- **Data Integrity**: JSON syntax and key schemas validated against MoRTH Sarathi portal specifications.

---

## 👥 Unified Team Structure

- **Project Lead & Backend Systems Architect:** Aritro Roy
- **Core Frontend & Cloud Architect:** Avrojit Saha
- **Data Architect & UI/UX Feature Engineer:** Shubham
