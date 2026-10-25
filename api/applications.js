// Vercel Serverless Function: /api/applications
// Handles Form 2 citizen application intake, listing, and status updates

const GLOBAL_APPS = globalThis._serverlessApplications || (globalThis._serverlessApplications = [
  {
    appNo: "DL-2026-98124",
    application_number: "DL-2026-98124",
    name: "Demo Applicant (Sample Record)",
    applicant_name: "Demo Applicant (Sample Record)",
    phone: "+91 00000 00001",
    mobile: "+91 00000 00001",
    dob: "2004-05-14",
    rto: "DL-01 (Mall Road / North Delhi)",
    rto_code: "DL-01",
    rtoCode: "DL-01",
    category: "MCWG + LMV (Bike & Car Combo)",
    vehicle_classes: ["MCWG", "LMV"],
    feePaid: "₹350 (CMVR Rule 32)",
    status: "Under Scrutiny",
    submissionDate: "2026-10-22",
    submission_date: "2026-10-22",
    address: "123 Mock Street, Demo City - 110001",
    bloodGroup: "B+ Positive",
    fatherOrSpouse: "Demo Guardian",
    isDemoRecord: true,
    is_demo_mode: true,
    timeline: [
      { step: "Application Submitted & Fee Paid (₹350)", date: "2026-10-22 11:30 AM", status: "done" },
      { step: "DigiLocker e-KYC & Document Verification", date: "2026-10-22 02:15 PM", status: "done" },
      { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
      { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
    ]
  },
  {
    appNo: "MH-2026-11492",
    application_number: "MH-2026-11492",
    name: "Test User (Sample Record)",
    applicant_name: "Test User (Sample Record)",
    phone: "+91 00000 00002",
    mobile: "+91 00000 00002",
    dob: "2003-11-20",
    rto: "MH-02 (Andheri / Mumbai West)",
    rto_code: "MH-02",
    rtoCode: "MH-02",
    category: "LMV (Private Motor Car)",
    vehicle_classes: ["LMV"],
    feePaid: "₹200",
    status: "Under Scrutiny",
    submissionDate: "2026-10-23",
    submission_date: "2026-10-23",
    address: "456 Test Avenue, Sample District - 400001",
    bloodGroup: "O+ Positive",
    fatherOrSpouse: "Demo Guardian",
    isDemoRecord: true,
    is_demo_mode: true,
    timeline: [
      { step: "Application Submitted & Fee Paid (₹200)", date: "2026-10-23 09:40 AM", status: "done" },
      { step: "DigiLocker e-KYC Verification", date: "2026-10-23 10:05 AM", status: "done" },
      { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
      { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
    ]
  },
  {
    appNo: "KA-2026-55319",
    application_number: "KA-2026-55319",
    name: "Sample Citizen (Sample Record)",
    applicant_name: "Sample Citizen (Sample Record)",
    phone: "+91 00000 00003",
    mobile: "+91 00000 00003",
    dob: "2002-08-09",
    rto: "KA-01 (Koramangala / Bengaluru Central)",
    rto_code: "KA-01",
    rtoCode: "KA-01",
    category: "MCWG (Geared Motorbike)",
    vehicle_classes: ["MCWG"],
    feePaid: "₹200",
    status: "Approved & LL Issued (Form 3)",
    llNumber: "KA-01-LL-2026-0099418",
    submissionDate: "2026-10-20",
    submission_date: "2026-10-20",
    approvalDate: "2026-10-21",
    approval_date: "2026-10-21",
    address: "789 Dummy Blvd, Mock Zone - 560001",
    bloodGroup: "A+ Positive",
    fatherOrSpouse: "Demo Guardian",
    isDemoRecord: true,
    is_demo_mode: true,
    timeline: [
      { step: "Application Submitted & Fee Paid (₹200)", date: "2026-10-20 10:15 AM", status: "done" },
      { step: "DigiLocker e-KYC Scrutiny", date: "2026-10-20 11:30 AM", status: "done" },
      { step: "RTO Scrutiny Approved by Officer R. Sharma", date: "2026-10-21 04:20 PM", status: "done" },
      { step: "Learner's Licence Issued (Form 3: KA-01-LL-2026-0099418)", date: "2026-10-21 04:25 PM", status: "done" }
    ]
  }
]);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,PATCH');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: List or find applications
  if (req.method === 'GET') {
    const { rto_code, status, app_no } = req.query;
    if (app_no) {
      const cleanNo = app_no.trim().toUpperCase();
      const app = GLOBAL_APPS.find(a => (a.appNo || '').toUpperCase() === cleanNo || (a.application_number || '').toUpperCase() === cleanNo);
      if (app) {
        return res.status(200).json({ status: 'success', data: app });
      }
      return res.status(404).json({ status: 'error', message: 'Application not found' });
    }

    let filtered = [...GLOBAL_APPS];
    if (rto_code && rto_code !== 'ALL') {
      filtered = filtered.filter(a => (a.rtoCode || a.rto_code || '').toUpperCase().includes(rto_code.toUpperCase()));
    }
    if (status && status !== 'ALL') {
      filtered = filtered.filter(a => (a.status || '').toUpperCase().includes(status.toUpperCase()));
    }

    return res.status(200).json({ status: 'success', data: filtered, count: filtered.length });
  }

  // POST: Submit new Form 2 application
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const appNo = body.appNo || body.application_number || `DL-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApp = {
      appNo,
      application_number: appNo,
      name: body.applicant_name || body.name || "Citizen Applicant",
      applicant_name: body.applicant_name || body.name || "Citizen Applicant",
      phone: body.mobile || body.phone || "+91 90000 00001",
      mobile: body.mobile || body.phone || "+91 90000 00001",
      dob: body.dob || "2004-06-15",
      rto: body.rto || body.rto_code || "DL-01 (Mall Road / North Delhi)",
      rtoCode: body.rto_code || body.rtoCode || "DL-01",
      rto_code: body.rto_code || body.rtoCode || "DL-01",
      category: Array.isArray(body.vehicle_classes) ? body.vehicle_classes.join(' + ') : (body.category || 'LMV'),
      vehicle_classes: Array.isArray(body.vehicle_classes) ? body.vehicle_classes : [body.category || 'LMV'],
      feePaid: body.fee_amount || body.feePaid || "₹350 (CMVR Rule 32)",
      status: "Under Scrutiny",
      submissionDate: new Date().toISOString().split('T')[0],
      submission_date: new Date().toISOString().split('T')[0],
      address: body.address || "Demo Resident Address, Sector 14, Delhi - 110001",
      bloodGroup: body.bloodGroup || "Not Specified",
      fatherOrSpouse: body.fatherOrSpouse || "Guardian Sample",
      isDemoRecord: true,
      timeline: [
        { step: "Application Submitted & Indicative Fee Recorded", date: new Date().toLocaleString(), status: "done" },
        { step: "DigiLocker e-KYC Verification Completed", date: new Date().toLocaleString(), status: "done" },
        { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
        { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
      ]
    };

    GLOBAL_APPS.unshift(newApp);

    return res.status(201).json({
      status: 'success',
      message: 'Form 2 Application successfully lodged with RTO circle.',
      data: newApp
    });
  }

  // PUT: Update application status (Officer Scrutiny)
  if (req.method === 'PUT' || req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const { appNo, application_number, status, remarks, officer_name } = body;
    const targetNo = (appNo || application_number || req.query.app_no || '').trim().toUpperCase();

    const appIndex = GLOBAL_APPS.findIndex(a => (a.appNo || '').toUpperCase() === targetNo || (a.application_number || '').toUpperCase() === targetNo);
    if (appIndex === -1) {
      return res.status(404).json({ status: 'error', message: `Application ${targetNo} not found.` });
    }

    const app = GLOBAL_APPS[appIndex];
    const isApproved = (status || '').includes('Approved');
    const isCorrection = (status || '').includes('Correction');
    const now = new Date().toLocaleString();

    if (isApproved) {
      app.status = status;
      app.llNumber = app.llNumber || `${app.rtoCode || 'DL-01'}-LL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      app.approvalDate = now;
      app.approval_date = now;
      if (app.timeline && app.timeline.length >= 4) {
        app.timeline[2] = { step: `RTO Scrutiny Approved by ${officer_name || 'MVI Officer'}`, date: now, status: "done" };
        app.timeline[3] = { step: `Form 3 Digital LL Issued (${app.llNumber})`, date: now, status: "done" };
      }
    } else if (isCorrection) {
      app.status = status;
      app.remarks = remarks || 'Document re-upload needed';
      if (app.timeline && app.timeline.length >= 3) {
        app.timeline[2] = { step: `Correction Requested: ${remarks || 'Review documents'}`, date: now, status: "correction" };
      }
    } else if (status) {
      app.status = status;
    }

    return res.status(200).json({ status: 'success', message: 'Application updated.', data: app });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
