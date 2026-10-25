// Vercel Serverless Function: /api/admin/login
// Server-Side RTO Officer Scrutiny Desk Authentication

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

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
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
      loginTimestamp: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: `Welcome, ${matched.name}. Scrutiny credentials authenticated.`,
      token: `OFFICER_TOKEN_${matched.officerId}_${Date.now()}`,
      data: officerData
    });
  } catch (err) {
    console.error('Officer login error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}
