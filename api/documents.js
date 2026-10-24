// Vercel Serverless Function: /api/documents

function calculateAge(dobString) {
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { vehicleClass } = body;

    if (authHeader !== "Bearer mock_oauth_token_8892") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Simulate API Setu document retrieval delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // MOCK DATA: Simulating fetched documents
    const fetchedDocs = {
      applicant_name: "Ramesh Kumar",
      dob: "2005-04-14",
      address: "123, Vasant Vihar, New Delhi, 110057",
      documents_found: ["Class X Marksheet", "Voter ID Card"],
      kyc_status: "VERIFIED"
    };

    // RTO GUIDELINES VERIFICATION ENGINE
    const age = calculateAge(fetchedDocs.dob);
    let isEligible = false;
    let rtoMessage = "";

    if (vehicleClass === 'gearless-50cc') {
      isEligible = age >= 16;
      rtoMessage = isEligible ? "Eligible for MC50CC." : "Must be 16+ for gearless vehicles.";
    } else {
      isEligible = age >= 18;
      rtoMessage = isEligible ? "Eligible for standard Learner's Licence." : "Must be 18+ for standard vehicles.";
    }

    return res.status(200).json({
      success: true,
      data: fetchedDocs,
      verification: {
        calculated_age: age,
        is_rto_eligible: isEligible,
        remarks: rtoMessage
      }
    });
  } catch {
    return res.status(500).json({ error: "Failed to fetch documents" });
  }
}
