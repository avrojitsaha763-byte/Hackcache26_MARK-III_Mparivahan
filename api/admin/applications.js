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
      name: "TEST PERSONA 01: Rahul Sharma (Sample Applicant)",
      applicant_name: "TEST PERSONA 01: Rahul Sharma (Sample Applicant)",
      phone: "+91 90000 00001",
      dob: "2004-05-14",
      rto: "DL-01 (Mall Road / North Delhi)",
      rtoCode: "DL-01",
      category: "MCWG + LMV (Bike & Car Combo)",
      feePaid: "₹350 (CMVR Rule 32)",
      status: "Under Scrutiny",
      submissionDate: "2026-10-22",
      address: "Demo Plot 402, Sector 14, Mall Road Zone, North Delhi - 110001",
      bloodGroup: "B+ Positive",
      fatherOrSpouse: "Guardian Sample",
      isDemoRecord: true
    },
    {
      appNo: "MH-2026-11492",
      application_number: "MH-2026-11492",
      name: "TEST PERSONA 02: Sneha Patel (Sample Applicant)",
      applicant_name: "TEST PERSONA 02: Sneha Patel (Sample Applicant)",
      phone: "+91 90000 00002",
      dob: "2003-11-20",
      rto: "MH-02 (Andheri / Mumbai West)",
      rtoCode: "MH-02",
      category: "LMV (Private Motor Car)",
      feePaid: "₹200",
      status: "Under Scrutiny",
      submissionDate: "2026-10-23",
      address: "Demo Suite B-201, Model Sector 5, Andheri West Zone, Mumbai - 400001",
      bloodGroup: "O+ Positive",
      fatherOrSpouse: "Guardian Sample",
      isDemoRecord: true
    },
    {
      appNo: "KA-2026-55319",
      application_number: "KA-2026-55319",
      name: "TEST PERSONA 03: Vikram Singh (Sample Applicant)",
      applicant_name: "TEST PERSONA 03: Vikram Singh (Sample Applicant)",
      phone: "+91 90000 00003",
      dob: "2002-08-09",
      rto: "KA-01 (Koramangala / Bengaluru Central)",
      rtoCode: "KA-01",
      category: "MCWG (Geared Motorbike)",
      feePaid: "₹200",
      status: "Approved & LL Issued (Form 3)",
      llNumber: "KA-01-LL-2026-0099418",
      submissionDate: "2026-10-20",
      approvalDate: "2026-10-21",
      address: "Demo Flat 12, Koramangala Ring Road Sector, Bengaluru - 560001",
      bloodGroup: "A+ Positive",
      fatherOrSpouse: "Guardian Sample",
      isDemoRecord: true
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
