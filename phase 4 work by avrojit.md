# 📋 Phase 4 Progress Report — Multi-Vehicle (Bikes & Cars) RTO Expansion, Dynamic Fee Engine & ADTT Track Simulator — Licence Saathi | EasyDL

**Core Frontend & Cloud Architect:** Avrojit Saha  
**Project Lead & Backend Systems Architect:** Aritro Roy  
**Data Architect & UI/UX Feature Engineer:** Shubham  
**Project:** Licence Saathi (EasyDL)  
**Hackathon:** Hackcache26 — MARK-III Mparivahan  
**Domain Scope:** Indian RTO & Sarathi Parivahan (Strictly for Indian Users)  
**Date:** October 2026  
**Status:** Completed, Verified & Deployed  

---

## 🇮🇳 Phase 4 Objectives & Indian RTO Statutory Compliance

Prior to Phase 4, the application focused primarily on two-wheeler learner's licences. In **Phase 4**, guided by **Project Lead Aritro Roy**, the system was overhauled to support the complete statutory spectrum of **all types of bikes and four-wheeler motor cars** as mandated by:
1. **The Motor Vehicles Act, 1988 (Amended 2019)**:
   - **Section 4(1):** Age criteria for driving motor vehicles in public places (18 years for standard motorcycles and light motor vehicles; 16 years for gearless motorcycles up to 50cc with parental consent).
   - **Section 4(2):** Minimum age of 20 years for driving commercial/transport vehicles.
   - **Section 194B:** Mandatory seatbelts for driver and all passengers in light motor vehicles.
   - **Section 129:** Mandatory BIS/ISI 4151 certified safety helmets for two-wheeler rider and pillion.
2. **Central Motor Vehicles Rules (CMVR), 1989**:
   - **Rule 14 & Form 2:** Application for Learner's Licence across single and multiple Classes of Vehicle (COV).
   - **Rule 15:** Mandatory 30-day waiting period before appearing for permanent driving licence test.
   - **Rule 32:** Master Statutory Fee Schedule for Learner's Licences and driving tests.
3. **MoRTH Automated Driving Test Track (ADTT) Standards**:
   - Complete technical requirements for Four-Wheeler (LMV) and Two-Wheeler (MCWG) sensor-monitored driving tracks.

---

## 🎯 Executive Summary (Avrojit Saha)

As **Core Frontend & Cloud Architect**, Avrojit Saha engineered and integrated:

1. **Multi-Vehicle Eligibility Engine ([`src/pages/CanIApply.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/CanIApply.jsx))**:
   - Expanded the vehicle selector from two basic two-wheeler choices to **six comprehensive statutory categories**:
     - `combo-bike-car` (MCWG + LMV: Both geared motorcycle and private car) — *Most Popular*
     - `lmv-car` (LMV: Light Motor Vehicle / Private Passenger Car, SUV, Sedan)
     - `motorcycle-gear` (MCWG: Motorcycle with Gear)
     - `gearless-scooter` (MCWOG: Gearless scooters > 50cc, e.g., Activa, Jupiter, EV scooters)
     - `gearless-50cc` (MCWOG: Mopeds and lightweight EVs up to 50cc, 16+ years)
     - `commercial-transport` (TRANS: Commercial cabs, delivery vans, taxis, 20+ years)
   - Dynamic statutory eligibility notes and age requirement explanations cited directly from Sections 4 and 7 of the Motor Vehicles Act 1988.

2. **Form 2 Citizen Application & Dynamic Fee Engine ([`src/pages/Apply.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/Apply.jsx))**:
   - Added Class of Vehicle (COV) selector dropdown pre-synchronized with sticky state.
   - Built a dynamic statutory fee calculator adhering to **CMVR Rule 32**:
     - **Single Class (Car LMV or Bike MCWG/MCWOG):** ₹150 LL Fee + ₹50 STALL Test Fee = **₹200**
     - **Combined Dual Class (Bike + Car: MCWG + LMV):** ₹150 (Bike) + ₹150 (Car) + ₹50 (Test) = **₹350**
     - **Commercial / Transport (TRANS):** ₹200 LL Fee + ₹100 Test Fee = **₹300**
   - Implemented DigiLocker & UIDAI Aadhaar paperless e-KYC verified status badge.
   - Lazy state initialization (`useState(() => ...)`) maintaining React Compiler purity.

3. **Dual-Track ADTT Practical Test Simulator ([`src/pages/PermanentDL.jsx`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/pages/PermanentDL.jsx))**:
   - Interactive segmented switcher between **Car Track (LMV)** and **Bike Track (MCWG)**.
   - Four-Wheeler skills: Up-hill gradient test (maximum allowable rollback &le; 15 cm / 6 inches), parallel parking within 3 minutes, reverse 'S' & 'H' navigation, compulsory seatbelts.
   - Two-Wheeler skills: Figure '8' serpentine track, 15m emergency braking, slow-speed balance, and ISI 4151 certified helmet mandate.
   - Statutory 30-day waiting period alert under CMVR Rule 15 and 180-day validity window.

4. **Multi-Category RTO Mock Test Expansion ([`src/data/questions.js`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/src/data/questions.js))**:
   - Integrated LMV car-specific statutory questions: Section 194B seatbelt penalties (₹1,000 fine), hill driving right-of-way (uphill vehicles have priority), dipper / low-beam night driving, and hazard flasher rules.

5. **Backend Model & API Synchronization ([`Backend/main.py`](file:///c:/Users/AVROJIT/OneDrive/Desktop/updated%20by%20Aritra/Hackcache26_MARK-III_Mparivahan/Backend/main.py))**:
   - Updated `/api/check-eligibility` endpoint to accept `MCWG_LMV`, `LMV-CAR`, and `COMBO-BIKE-CAR`, providing statutory fee and document breakdowns.

---

## 🚀 Detailed Technical Architecture

### 1. Multi-Vehicle Class Hierarchy & Statutory Age Engine

```text
┌────────────────────────────────────────────────────────────────────────┐
│             Ministry of Road Transport & Highways (MoRTH)              │
│               Central Motor Vehicles Rules 1989 (Form 2)               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     Two-Wheelers (Bikes)        │         │   Four-Wheelers (Cars & LMV)    │
├─────────────────────────────────┤         ├─────────────────────────────────┤
│ • MCWOG (<= 50cc): Min Age 16   │         │ • LMV-NT (Private Cars/SUVs)    │
│   Requires Form 2 Part II       │         │   Min Age 18 (Section 4 MV Act) │
│ • MCWOG (> 50cc Scooters): 18+  │         │ • TRANS (Commercial Transport)  │
│ • MCWG (Geared Bikes): 18+      │         │   Min Age 20 + 1 yr LMV Badge   │
└─────────────────────────────────┘         └─────────────────────────────────┘
                                   │
                                   ▼
         ┌───────────────────────────────────────────────────┐
         │     Combined Dual Application (MCWG + LMV)        │
         │     Both Geared Motorbike & Private Motor Car     │
         │     Min Age 18 | Statutory Form 2 Fee: ₹350       │
         └───────────────────────────────────────────────────┘
```

#### Validation Logic (`src/pages/CanIApply.jsx`):
```javascript
const checkEligibility = () => {
  const numAge = Number(age)
  if (vehicle === 'gearless-50cc' && numAge >= 16) return true
  if (vehicle === 'commercial-transport' && numAge >= 20) return true
  if (['motorcycle-gear', 'gearless-scooter', 'lmv-car', 'combo-bike-car'].includes(vehicle) && numAge >= 18) return true
  return false
}
```

---

### 2. CMVR Rule 32 Dynamic Fee Engine (`src/pages/Apply.jsx`)

The statutory fee structure prescribed by MoRTH is computed in real time based on citizen selections:

$$\text{Total Fee} = \sum (\text{Class LL Fee}) + \text{STALL Test Fee}$$

| Vehicle Category | Class Code | LL Fee | Test Fee | Total Statutory Fee |
| :--- | :---: | :---: | :---: | :---: |
| **Gearless Moped (&le; 50cc)** | `MCWOG_50` | ₹150 | ₹50 | **₹200** |
| **Gearless Scooter (> 50cc)** | `MCWOG` | ₹150 | ₹50 | **₹200** |
| **Motorcycle with Gear** | `MCWG` | ₹150 | ₹50 | **₹200** |
| **Light Motor Vehicle (Private Car)** | `LMV` | ₹150 | ₹50 | **₹200** |
| **Dual Combo (Bike + Private Car)** | `MCWG_LMV`| ₹300 | ₹50 | **₹350** |
| **Commercial Transport (Cabs/Vans)** | `TRANS` | ₹200 | ₹100 | **₹300** |

#### Implementation Snippet:
```javascript
const getFeeDetails = () => {
  if (vehicle === 'combo-bike-car') {
    return {
      breakdown: [
        { label: isHindi ? "मोटरसाइकिल लर्नर्स शुल्क (MCWG)" : "Motorcycle LL Fee (MCWG)", amount: 150 },
        { label: isHindi ? "निजी कार लर्नर्स शुल्क (LMV)" : "Private Car LL Fee (LMV)", amount: 150 },
        { label: isHindi ? "कंप्यूटर टेस्ट शुल्क (STALL)" : "Online STALL Test Fee", amount: 50 },
      ],
      total: 350
    }
  }
  if (vehicle === 'commercial-transport') {
    return {
      breakdown: [
        { label: isHindi ? "वाणिज्यिक वाहन लर्नर्स शुल्क (TRANS)" : "Commercial Vehicle LL Fee (TRANS)", amount: 200 },
        { label: isHindi ? "ड्राइविंग टेस्ट स्लॉट शुल्क" : "Commercial Test Slot Fee", amount: 100 },
      ],
      total: 300
    }
  }
  return {
    breakdown: [
      { label: vehicle === 'lmv-car' ? "Car LL Fee (LMV)" : "Learner's Licence Fee", amount: 150 },
      { label: "Online STALL Test Fee", amount: 50 },
    ],
    total: 200
  }
}
```

---

### 3. Automated Driving Test Track (ADTT) Simulator (`src/pages/PermanentDL.jsx`)

The permanent licence preparation guide was overhauled to feature segmented tabs for both Four-Wheelers and Two-Wheelers:

```text
┌────────────────────────────────────────────────────────┐
│ [ 🚗 Car Track (LMV) ]     [ 🏍️ Bike Track (MCWG) ]     │
├────────────────────────────────────────────────────────┤
│ 1. Up-Hill Gradient Test (Incline Restart <= 15cm)     │
│ 2. Parallel Parking Test (3-minute boundary box)       │
│ 3. Reverse 'S' & 'H' Track Navigation                  │
│ 4. Compulsory 3-Point Seatbelt Inspection              │
└────────────────────────────────────────────────────────┘
```

---

## 🧪 Verification & Production Quality Assurance

1. **Static Analysis (`oxlint`)**:
   ```text
   oxlint
   Found 0 warnings and 0 errors.
   Finished in 34ms on 23 files with 104 rules using 12 threads.
   ```
2. **Production Bundle Compilation (`vite build`)**:
   ```text
   vite build
   ✓ 2422 modules transformed.
   dist/index.html                   0.95 kB │ gzip:   0.52 kB
   dist/assets/index--ZK7Q8WR.css   27.95 kB │ gzip:   5.45 kB
   dist/assets/index-CVmCP362.js   743.77 kB │ gzip: 221.00 kB
   ✓ built in 2.19s
   ```
3. **Repository Status**:
   - Local working tree clean and committed.
   - Synchronized with `origin/main`.

---

## 👥 Unified Team Structure

- **Project Lead & Backend Systems Architect:** Aritro Roy
- **Core Frontend & Cloud Architect:** Avrojit Saha
- **Data Architect & UI/UX Feature Engineer:** Shubham
