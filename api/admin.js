// Vercel Serverless Function: /api/admin
// Consolidates Admin Login, Officers Directory, and Application Queue

const REGISTERED_OFFICERS = [
  {
    officerId: "RTO-OFFICER-DL01",
    email: "rajeshwar.sharma@parivahan.gov.in",
    name: "Rajeshwar Sharma",
    designation: "Senior Motor Vehicle Inspector (MVI)",
    rto: "DL-01 (Mall Road / North Delhi)",
    rtoCode: "DL-01",
    badgeNumber: "MVI-DL-8819",
    password: "AdminPassword2026!",
    clearanceLevel: "Level 3 (Form 3 Issuing Authority)",
    role: "RTO_OFFICER"
  },
  {
    officerId: "RTO-OFFICER-MH02",
    email: "sanjay.kulkarni@parivahan.gov.in",
    name: "Sanjay Kulkarni",
    designation: "RTO Scrutiny Superintendent",
    rto: "MH-02 (Andheri / Mumbai West)",
    rtoCode: "MH-02",
    badgeNumber: "MVI-MH-4421",
    password: "AdminPassword2026!",
    clearanceLevel: "Level 3 (Form 3 Issuing Authority)",
    role: "RTO_OFFICER"
  },
  {
    officerId: "RTO-OFFICER-KA01",
    email: "priya.venkatesh@parivahan.gov.in",
    name: "Priya Venkatesh",
    designation: "Assistant Transport Commissioner",
    rto: "KA-01 (Koramangala / Bengaluru Central)",
    rtoCode: "KA-01",
    badgeNumber: "ATC-KA-1109",
    password: "AdminPassword2026!",
    clearanceLevel: "Level 4 (Supervisory & Final Appeal Authority)",
    role: "RTO_OFFICER"
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';
  const subpath = (req.query.subpath || '').toLowerCase();
  const isLogin = url.includes('/login') || subpath === 'login';
  const isOfficers = url.includes('/officers') || subpath === 'officers';
  const isApplications = url.includes('/applications') || subpath === 'applications' || (!isLogin && !isOfficers);

  // ROUTE 1: /api/admin/login
  if (isLogin) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    try {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      body = body || {};

      const { identifier, password } = body;
      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: "Please provide Officer Employee ID and Password." });
      }

      const cleanId = identifier.trim().toLowerCase();
      const matched = REGISTERED_OFFICERS.find(
        o => o.officerId.toLowerCase() === cleanId || o.email.toLowerCase() === cleanId
      );

      if (!matched) {
        return res.status(401).json({ 
          success: false, 
          message: "Officer ID not recognized in Transport Department directory." 
        });
      }

      if (matched.password !== password) {
        return res.status(401).json({ 
          success: false, 
          message: "Incorrect password for officer credentials." 
        });
      }

      const officerData = {
        officerId: matched.officerId,
        name: matched.name,
        email: matched.email,
        designation: matched.designation,
        rto: matched.rto,
        rtoCode: matched.rtoCode,
        badgeNumber: matched.badgeNumber,
        clearanceLevel: matched.clearanceLevel,
        role: 'RTO_OFFICER',
        is_demo_mode: true,
        loginTimestamp: new Date().toISOString()
      };

      return res.status(200).json({
        success: true,
        message: `Welcome, ${matched.name}. Scrutiny credentials authenticated.`,
        token: `OFFICER_TOKEN_${matched.officerId}_${Date.now()}`,
        is_demo_mode: true,
        is_simulated_demo: true,
        auth_boundary: "EVALUATION_SANDBOX",
        evaluation_notice: "EVALUATION SANDBOX — Isolated demonstration credential boundary for hackathon evaluation.",
        data: officerData
      });
    } catch (err) {
      console.error('Officer login error:', err);
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  // ROUTE 2: /api/admin/officers
  if (isOfficers) {
    const sanitized = REGISTERED_OFFICERS.map(({ password: _password, ...rest }) => rest);
    return res.status(200).json({
      status: 'success',
      count: sanitized.length,
      data: sanitized
    });
  }

  // ROUTE 3: /api/admin/applications
  if (isApplications) {
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

  return res.status(404).json({ error: 'Admin endpoint not found' });
}
