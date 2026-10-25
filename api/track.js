// Vercel Serverless Function: /api/track
// Real-time Form 2 citizen application tracking and scrutiny timeline

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const appNo = (req.query.app_no || req.query.appNo || '').trim().toUpperCase();
  if (!appNo) {
    return res.status(400).json({ success: false, message: 'Application number query parameter "app_no" is required.' });
  }

  // Lookup in global serverless memory store or fall back to default records
  const globalApps = globalThis._serverlessApplications || [];
  let found = globalApps.find(a => (a.appNo || '').toUpperCase() === appNo || (a.application_number || '').toUpperCase() === appNo);

  if (!found) {
    const DEFAULT_TRACK_RECORDS = {
      'DL-2026-98124': {
        appNo: "DL-2026-98124",
        application_number: "DL-2026-98124",
        name: "Demo Applicant",
        applicant_name: "Demo Applicant",
        phone: "0000000000",
        dob: "2004-05-14",
        rto: "DL-01 (Mall Road / North Delhi)",
        rtoCode: "DL-01",
        category: "MCWG + LMV (Bike & Car Combo)",
        feePaid: "₹350 (CMVR Rule 32)",
        status: "Under Scrutiny",
        isDemoRecord: true,
        timeline: [
          { step: "Application Submitted & Fee Recorded (₹350)", date: "2026-10-22 11:30 AM", status: "done" },
          { step: "DigiLocker e-KYC & Document Verification", date: "2026-10-22 02:15 PM", status: "done" },
          { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
          { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
        ]
      },
      'MH-2026-11492': {
        appNo: "MH-2026-11492",
        application_number: "MH-2026-11492",
        name: "Test User",
        applicant_name: "Test User",
        phone: "0000000000",
        dob: "2003-11-20",
        rto: "MH-02 (Andheri / Mumbai West)",
        rtoCode: "MH-02",
        category: "LMV (Private Motor Car)",
        feePaid: "₹200",
        status: "Under Scrutiny",
        isDemoRecord: true,
        timeline: [
          { step: "Application Submitted & Fee Recorded (₹200)", date: "2026-10-23 09:40 AM", status: "done" },
          { step: "DigiLocker e-KYC Verification", date: "2026-10-23 10:05 AM", status: "done" },
          { step: "RTO Scrutiny Desk Approval", date: "In Progress", status: "active" },
          { step: "Learner's Licence Issued (Form 3)", date: null, status: "pending" }
        ]
      },
      'KA-2026-55319': {
        appNo: "KA-2026-55319",
        application_number: "KA-2026-55319",
        name: "Sample Citizen",
        applicant_name: "Sample Citizen",
        phone: "0000000000",
        dob: "2002-08-09",
        rto: "KA-01 (Koramangala / Bengaluru Central)",
        rtoCode: "KA-01",
        category: "MCWG (Geared Motorbike)",
        feePaid: "₹200",
        status: "Approved & LL Issued (Form 3)",
        llNumber: "KA-01-LL-2026-0099418",
        isDemoRecord: true,
        timeline: [
          { step: "Application Submitted & Fee Paid (₹200)", date: "2026-10-20 10:15 AM", status: "done" },
          { step: "DigiLocker e-KYC Scrutiny", date: "2026-10-20 11:30 AM", status: "done" },
          { step: "RTO Scrutiny Approved by Officer R. Sharma", date: "2026-10-21 04:20 PM", status: "done" },
          { step: "Learner's Licence Issued (Form 3: KA-01-LL-2026-0099418)", date: "2026-10-21 04:25 PM", status: "done" }
        ]
      }
    };

    found = DEFAULT_TRACK_RECORDS[appNo];
  }

  if (found) {
    return res.status(200).json({
      success: true,
      data: {
        ...found,
        rule11_requirement: 'CMVR Rule 11 Knowledge Test (60% passing mark)',
        rule15_earliest_dl_test_date: '30 days from Form 3 LL issuance',
        isDemoRecord: true
      },
      timeline: found.timeline || []
    });
  }

  return res.status(404).json({
    success: false,
    message: `Application number ${appNo} was not found in the national registry.`
  });
}
