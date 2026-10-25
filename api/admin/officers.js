// Vercel Serverless Function: /api/admin/officers
// List verified RTO officers for scrutiny desk (sanitized, zero passwords exposed)

const OFFICERS_DIRECTORY = [
  {
    officerId: "RTO-OFFICER-DL01",
    email: "rajeshwar.sharma@parivahan.gov.in",
    name: "Rajeshwar Sharma",
    designation: "Senior Motor Vehicle Inspector (MVI)",
    rto: "DL-01 (Mall Road / North Delhi)",
    rtoCode: "DL-01",
    badgeNumber: "MVI-DL-8819",
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
    clearanceLevel: "Level 4 (Supervisory & Final Appeal Authority)",
    role: "RTO_OFFICER"
  }
];

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

  // Passwords explicitly stripped for security
  return res.status(200).json({
    status: 'success',
    count: OFFICERS_DIRECTORY.length,
    data: OFFICERS_DIRECTORY
  });
}
