// Centralized Application Store for Sarathi Parivahan
// Shared between Citizen Apply, Track, and Official RTO Admin Scrutiny Desk

const STORAGE_KEY = 'parivahan_applications_v2'

export const INITIAL_APPLICATIONS = [
  {
    appNo: "DL-2026-98124",
    name: "Avrojit Saha",
    phone: "+91 98765 43210",
    dob: "2004-05-14",
    rto: "DL-01 (Mall Road / North Delhi)",
    rtoCode: "DL-01",
    category: "MCWG + LMV (Bike & Car Combo)",
    feePaid: "₹350 (CMVR Rule 32)",
    ekycStatus: "Verified (Aadhaar / DigiLocker)",
    status: "Under Scrutiny",
    submissionDate: "2026-10-22",
    address: "Flat 402, Shivalik Enclave, Model Town, Delhi - 110009",
    bloodGroup: "B+ Positive",
    fatherOrSpouse: "Debabrata Saha",
    documents: [
      {
        id: "form-1",
        title: "Form 1 Medical Self-Declaration",
        type: "Medical Declaration (Rule 5(2))",
        verified: true,
        authority: "Citizen e-Sign Self-Certification",
        docNumber: "MED-DECL-2026-DL-98124",
        details: "Vision acuity 6/6 bilateral, normal color perception, no history of epilepsy or sudden fainting."
      },
      {
        id: "aadhaar-ekyc",
        title: "Aadhaar e-KYC DigiLocker Certificate",
        type: "UIDAI e-KYC (DPDP 2023 Compliant)",
        verified: true,
        authority: "UIDAI National DigiLocker Gateway",
        docNumber: "XXXXXXXX4921",
        details: "Demographic match 100%. Address verified with postal index 110009. Biometric facial token confirmed."
      },
      {
        id: "marksheet-10",
        title: "Class 10 CBSE Marksheet & Certificate",
        type: "Age & Educational Proof (Rule 4 CMVR)",
        verified: true,
        authority: "CBSE DigiLocker Board Archive",
        docNumber: "CBSE/2020/ROLL-6129841",
        details: "Date of birth recorded: 14-May-2004. Citizen age: 22 years (Eligible for LMV & MCWG)."
      },
      {
        id: "fee-challan",
        title: "Statutory Fee e-Challan Receipt",
        type: "Treasury Payment Receipt (Rule 32)",
        verified: true,
        authority: "BharatKosh / Parivahan e-Pay",
        docNumber: "CHALLAN-DL-2026-881230",
        details: "₹150 (MCWG LL) + ₹150 (LMV LL) + ₹50 (Online STALL Test) = ₹350 Paid via UPI."
      }
    ],
    timeline: [
      { step: "Application Submitted & Fee Paid (₹350)", date: "2026-10-22 11:30 AM", status: "done" },
      { step: "DigiLocker e-KYC & Document Verification", date: "2026-10-22 02:15 PM", status: "done" },
      { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
      { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
    ]
  },
  {
    appNo: "MH-2026-11492",
    name: "Shubham Kumar",
    phone: "+91 98112 23344",
    dob: "2003-11-20",
    rto: "MH-02 (Andheri / Mumbai West)",
    rtoCode: "MH-02",
    category: "LMV (Private Motor Car)",
    feePaid: "₹200",
    ekycStatus: "Verified (DigiLocker)",
    status: "Under Scrutiny",
    submissionDate: "2026-10-23",
    address: "B-201, Palm Beach Heights, Lokhandwala, Andheri West, Mumbai - 400053",
    bloodGroup: "O+ Positive",
    fatherOrSpouse: "R. K. Kumar",
    documents: [
      {
        id: "form-1",
        title: "Form 1 Medical Self-Declaration",
        type: "Medical Declaration (Rule 5(2))",
        verified: true,
        authority: "Citizen e-Sign Self-Certification",
        docNumber: "MED-DECL-2026-MH-11492",
        details: "Clear vision without glasses, no cardiac ailments, certified fit to steer motor car."
      },
      {
        id: "aadhaar-ekyc",
        title: "Aadhaar Card (DigiLocker Verified)",
        type: "UIDAI e-KYC",
        verified: true,
        authority: "DigiLocker Repository",
        docNumber: "XXXXXXXX7819",
        details: "Address verified with Mumbai Suburban Jurisdiction. Mobile OTP authenticated."
      },
      {
        id: "birth-cert",
        title: "Municipal Corporation Birth Certificate",
        type: "Proof of Age (Section 4 MV Act)",
        verified: true,
        authority: "Brihanmumbai Municipal Corporation (BMC)",
        docNumber: "BMC/B-CERT/2003/99120",
        details: "Date of Birth: 20-Nov-2003. Verified age 22+ years."
      },
      {
        id: "fee-challan",
        title: "Treasury Challan Receipt",
        type: "CMVR Rule 32 Statutory Fee",
        verified: true,
        authority: "MahaKosh Maharashtra Treasury",
        docNumber: "CHALLAN-MH-2026-449102",
        details: "₹150 (LMV LL Fee) + ₹50 (Computer Test Fee) = ₹200 Paid."
      }
    ],
    timeline: [
      { step: "Application Submitted & Fee Paid (₹200)", date: "2026-10-23 09:40 AM", status: "done" },
      { step: "DigiLocker e-KYC Verification", date: "2026-10-23 10:05 AM", status: "done" },
      { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
      { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
    ]
  },
  {
    appNo: "KA-2026-55319",
    name: "Aritro Roy",
    phone: "+91 98450 12345",
    dob: "2002-08-09",
    rto: "KA-01 (Koramangala / Bengaluru Central)",
    rtoCode: "KA-01",
    category: "MCWG (Geared Motorbike)",
    feePaid: "₹200",
    ekycStatus: "Verified (Aadhaar OTP)",
    status: "Approved & LL Issued (Form 3)",
    llNumber: "KA-01-LL-2026-0099418",
    submissionDate: "2026-10-20",
    approvalDate: "2026-10-21",
    address: "12th Main, 4th Block, Koramangala, Bengaluru - 560034",
    bloodGroup: "A+ Positive",
    fatherOrSpouse: "Siddhartha Roy",
    documents: [
      {
        id: "form-1",
        title: "Form 1 Medical Self-Declaration",
        type: "Medical Declaration (Rule 5(2))",
        verified: true,
        authority: "Citizen e-Sign Self-Certification",
        docNumber: "MED-DECL-2026-KA-55319",
        details: "All physical fitness parameters satisfied."
      },
      {
        id: "aadhaar-ekyc",
        title: "Aadhaar e-KYC (DigiLocker)",
        type: "UIDAI e-KYC",
        verified: true,
        authority: "UIDAI National Gateway",
        docNumber: "XXXXXXXX2190",
        details: "Koramangala address verified. Linked to Mobile +91 98450 12345."
      },
      {
        id: "passport",
        title: "Republic of India Passport",
        type: "Identity & Age Proof",
        verified: true,
        authority: "Ministry of External Affairs (RPO Bengaluru)",
        docNumber: "Z5190412",
        details: "Passport valid till 2031. High-confidence official verification."
      },
      {
        id: "fee-challan",
        title: "Khajane-II Karnataka State Treasury",
        type: "Statutory Fee Receipt",
        verified: true,
        authority: "Khajane-II State Portal",
        docNumber: "CHALLAN-KA-2026-77192",
        details: "₹200 Paid."
      }
    ],
    timeline: [
      { step: "Application Submitted & Fee Paid (₹200)", date: "2026-10-20 10:15 AM", status: "done" },
      { step: "DigiLocker e-KYC Scrutiny", date: "2026-10-20 11:30 AM", status: "done" },
      { step: "RTO Scrutiny Approved by Officer R. Sharma", date: "2026-10-21 04:20 PM", status: "done" },
      { step: "Learner's Licence Issued (Form 3: KA-01-LL-2026-0099418)", date: "2026-10-21 04:25 PM", status: "done" }
    ]
  }
]

export function getApplications() {
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_APPLICATIONS))
      return INITIAL_APPLICATIONS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_APPLICATIONS
  } catch (err) {
    console.error("Error reading applications from localStorage:", err)
    return INITIAL_APPLICATIONS
  }
}

export function saveApplications(apps) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
  } catch (err) {
    console.error("Error saving applications to localStorage:", err)
  }
}

export function getApplication(appNo) {
  if (!appNo) return null
  const clean = appNo.trim().toUpperCase()
  const apps = getApplications()
  return apps.find(a => a.appNo.toUpperCase() === clean) || null
}

export function addApplication(appData) {
  const apps = getApplications()
  const newAppNo = appData.appNo || `DL-2026-${Math.floor(10000 + Math.random() * 90000)}`
  
  const createdApp = {
    appNo: newAppNo,
    name: appData.name || "Citizen Applicant",
    phone: appData.phone || "+91 99999 00000",
    dob: appData.dob || "2005-01-01",
    rto: appData.rto || "DL-01 (Mall Road / North Delhi)",
    rtoCode: appData.rtoCode || "DL-01",
    category: appData.category || "MCWG + LMV (Bike & Car Combo)",
    feePaid: appData.feePaid || "₹350 (CMVR Rule 32)",
    ekycStatus: appData.uploadMode === 'manual'
      ? "Manual Upload (Auto-Resized & Attached per CMVR)"
      : "Verified (Aadhaar / DigiLocker)",
    uploadMode: appData.uploadMode || 'digilocker',
    status: "Under Scrutiny",
    submissionDate: new Date().toISOString().split('T')[0],
    address: appData.address || "Verified Indian Resident Address",
    bloodGroup: appData.bloodGroup || "Not Specified",
    fatherOrSpouse: appData.fatherOrSpouse || "Guardian",
    documents: appData.documents && appData.documents.length > 0 ? appData.documents : [
      {
        id: "form-1",
        title: "Form 1 Medical Self-Declaration",
        type: "Medical Fitness (Rule 5(2))",
        verified: true,
        authority: "Citizen e-Sign Self-Declaration",
        docNumber: `MED-DECL-${newAppNo}`,
        details: "Applicant declared zero disabilities, eyesight 6/6, fit to drive."
      },
      {
        id: "aadhaar-ekyc",
        title: "Aadhaar DigiLocker Token",
        type: "UIDAI e-KYC Certificate",
        verified: true,
        authority: "DigiLocker Gov of India",
        docNumber: `UID-DIGI-${newAppNo.slice(-5)}`,
        details: "Instant identity verification completed via Aadhaar OTP."
      },
      {
        id: "marksheet-10",
        title: "10th Marksheet / Age Certificate",
        type: "Age Proof (CMVR Rule 4)",
        verified: true,
        authority: "School Education Board",
        docNumber: `BOARD-DOC-${newAppNo.slice(-5)}`,
        details: "Verified age above statutory limit."
      },
      {
        id: "fee-challan",
        title: "Payment e-Receipt (Rule 32)",
        type: "Statutory Fee Challan",
        verified: true,
        authority: "Sarathi e-Pay Gate",
        docNumber: `PAY-REC-${newAppNo}`,
        details: `${appData.feePaid || 'Statutory Fee'} paid successfully.`
      }
    ],
    timeline: [
      { step: `Application Submitted & Fee Paid (${appData.feePaid || 'Paid'})`, date: new Date().toLocaleString(), status: "done" },
      { 
        step: appData.uploadMode === 'manual' 
          ? "Manual Scanned Documents Scrutiny" 
          : "DigiLocker e-KYC Authentication", 
        date: new Date().toLocaleString(), 
        status: "done" 
      },
      { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
      { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
    ]
  }

  // Prepend so newest is on top
  const updated = [createdApp, ...apps]
  saveApplications(updated)
  return createdApp
}

export function updateApplicationStatus(appNo, newStatus, remarks = '', officerName = 'RTO Officer') {
  const apps = getApplications()
  let updatedApp = null

  const updatedApps = apps.map(app => {
    if (app.appNo.toUpperCase() === appNo.toUpperCase()) {
      const isApproved = newStatus.includes('Approved')
      const isCorrection = newStatus.includes('Correction')
      const llNumber = isApproved ? (app.llNumber || `${app.rtoCode || 'DL-01'}-LL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`) : app.llNumber

      const now = new Date().toLocaleString()
      const newTimeline = [...(app.timeline || [])]

      if (isApproved) {
        // Complete scrutiny and LL issuance steps
        newTimeline[2] = { step: `RTO Scrutiny Approved by ${officerName}`, date: now, status: "done" }
        newTimeline[3] = { step: `Digital LL Issued (Form 3: ${llNumber})`, date: now, status: "done" }
      } else if (isCorrection) {
        newTimeline[2] = { step: `Correction Requested: ${remarks || 'Document re-upload needed'}`, date: now, status: "correction" }
      }

      updatedApp = {
        ...app,
        status: newStatus,
        remarks: remarks || app.remarks,
        llNumber: llNumber,
        approvalDate: isApproved ? now : app.approvalDate,
        timeline: newTimeline
      }
      return updatedApp
    }
    return app
  })

  saveApplications(updatedApps)
  return updatedApp
}
