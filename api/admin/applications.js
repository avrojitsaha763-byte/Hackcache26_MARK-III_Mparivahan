// Vercel Serverless Function: /api/admin/applications
// RTO Scrutiny Desk application queue

export default function handler(req, res) {
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

  const { rto_code, status } = req.query;
  const globalApps = globalThis._serverlessApplications || [
    {
      appNo: "DL-2026-98124",
      application_number: "DL-2026-98124",
      name: "Demo Applicant (Sample Record)",
      applicant_name: "Demo Applicant (Sample Record)",
      phone: "+91 00000 00001",
      dob: "2004-05-14",
      rto: "DL-01 (Mall Road / North Delhi)",
      rtoCode: "DL-01",
      category: "MCWG + LMV (Bike & Car Combo)",
      feePaid: "₹350 (CMVR Rule 32)",
      status: "Under Scrutiny",
      submissionDate: "2026-10-22",
      address: "123 Mock Street, Demo City - 110001",
      bloodGroup: "B+ Positive",
      fatherOrSpouse: "Demo Guardian",
      isDemoRecord: true,
      is_demo_mode: true
    },
    {
      appNo: "MH-2026-11492",
      application_number: "MH-2026-11492",
      name: "Test User (Sample Record)",
      applicant_name: "Test User (Sample Record)",
      phone: "+91 00000 00002",
      dob: "2003-11-20",
      rto: "MH-02 (Andheri / Mumbai West)",
      rtoCode: "MH-02",
      category: "LMV (Private Motor Car)",
      feePaid: "₹200",
      status: "Under Scrutiny",
      submissionDate: "2026-10-23",
      address: "456 Test Avenue, Sample District - 400001",
      bloodGroup: "O+ Positive",
      fatherOrSpouse: "Demo Guardian",
      isDemoRecord: true,
      is_demo_mode: true
    },
    {
      appNo: "KA-2026-55319",
      application_number: "KA-2026-55319",
      name: "Sample Citizen (Sample Record)",
      applicant_name: "Sample Citizen (Sample Record)",
      phone: "+91 00000 00003",
      dob: "2002-08-09",
      rto: "KA-01 (Koramangala / Bengaluru Central)",
      rtoCode: "KA-01",
      category: "MCWG (Geared Motorbike)",
      feePaid: "₹200",
      status: "Approved & LL Issued (Form 3)",
      llNumber: "KA-01-LL-2026-0099418",
      submissionDate: "2026-10-20",
      approvalDate: "2026-10-21",
      address: "789 Dummy Blvd, Mock Zone - 560001",
      bloodGroup: "A+ Positive",
      fatherOrSpouse: "Demo Guardian",
      isDemoRecord: true,
      is_demo_mode: true
    }
  ];

  let filtered = [...globalApps];
  if (rto_code && rto_code !== 'ALL') {
    filtered = filtered.filter(a => (a.rtoCode || a.rto_code || '').toUpperCase().includes(rto_code.toUpperCase()));
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter(a => (a.status || '').toUpperCase().includes(status.toUpperCase()));
  }

  return res.status(200).json({
    status: 'success',
    count: filtered.length,
    data: filtered
  });
}
