// Vercel Serverless Function: /api/documents
// Consolidates DigiLocker Document Retrieval, OAuth Token Exchange, and Manual Document Upload Intake

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

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
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const url = req.url || '';

    // ROUTE 1: /api/upload-document
    if (url.includes('/upload-document') || body.docType) {
      const docType = body.docType || 'general_document';
      const fileName = body.fileName || `${docType}.jpg`;
      const sizeKB = Number(body.sizeKB || 150);
      const width = Number(body.width || 800);
      const height = Number(body.height || 600);
      const mimeType = body.mimeType || (fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      return res.status(200).json({
        success: true,
        status: 'UPLOADED_PENDING_MANUAL_REVIEW',
        message: 'Document received and queued for manual RTO officer review.',
        is_demo_mode: true,
        is_simulated_demo: true,
        docType,
        fileName,
        sizeKB,
        dimensions: `${width}x${height}px`,
        mimeType,
        uploadedAt: new Date().toISOString()
      });
    }

    // ROUTE 2: /api/documents and /api/digilocker/token
    const { vehicleClass, phone: bodyPhone, name: bodyName, rto: bodyRto, code } = body;

    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    } else {
      const cleanP = ((bodyPhone || '0000000000').toString()).replace(/\D/g, '').slice(-10);
      token = `DL_LIVE_${cleanP}_${Date.now()}`;
    }

    // Extract citizen details from token or request body
    const tokenParts = token.split('_');
    const phoneFromToken = tokenParts.length > 2 && tokenParts[2].length === 10 ? tokenParts[2] : null;
    const cleanPhone = ((bodyPhone || phoneFromToken || '0000000000').toString()).replace(/\D/g, '').slice(-10);

    const applicantName = (bodyName && bodyName.trim() && !['Citizen Applicant', 'Sample Applicant'].includes(bodyName.trim()))
      ? bodyName.trim()
      : 'Demo Applicant';

    const applicantDob = "2004-05-14";
    const applicantAddress = (bodyRto && bodyRto.startsWith('DL'))
      ? "123 Mock Street, Demo City - 110001"
      : "456 Test Avenue, Sample District - 400001";

    const fetchedDocs = {
      applicant_name: applicantName,
      phone: cleanPhone,
      dob: applicantDob,
      address: applicantAddress,
      is_demo_mode: true,
      is_simulated_demo: true,
      evaluation_notice: "EVALUATION SANDBOX — Simulated DigiLocker document retrieval.",
      documents_found: [
        "Class X Passing Certificate & Marksheet (CBSE)",
        "UIDAI e-Aadhaar Digital Dossier",
        "Election Commission Voter ID (EPIC)"
      ],
      certificates: [
        {
          id: "class_x",
          title: "Class X Passing Certificate & Marksheet",
          issuer: "Central Board of Secondary Education (CBSE)",
          doc_uri: `in.gov.cbse-cskx-2020-${cleanPhone.slice(-6)}`,
          roll_no: `116${cleanPhone.slice(-5)}`,
          passing_year: 2020,
          digital_signature: "Verified by National Informatics Centre (NIC) SHA-256 e-Sign",
          status: "AUTHENTIC & VERIFIED"
        },
        {
          id: "aadhaar",
          title: "UIDAI e-Aadhaar Digital Dossier",
          issuer: "Unique Identification Authority of India (UIDAI)",
          doc_uri: `in.gov.uidai-eaadhaar-${cleanPhone.slice(-6)}`,
          masked_uid: `XXXX-XXXX-${cleanPhone.slice(-4)}`,
          registered_phone: `+91 ${cleanPhone}`,
          digital_signature: "Controller of Certifying Authorities (CCA India) Cryptographic Stamp",
          status: "AUTHENTIC & VERIFIED"
        },
        {
          id: "voter_id",
          title: "Voter Identity Card (EPIC)",
          issuer: "Election Commission of India (ECI)",
          doc_uri: `in.gov.eci-epic-${cleanPhone.slice(-6)}`,
          epic_no: `WB/02/${cleanPhone.slice(-6)}`,
          status: "AUTHENTIC & VERIFIED"
        }
      ],
      kyc_status: "VERIFIED",
      verified_at: new Date().toISOString()
    };

    const age = calculateAge(fetchedDocs.dob);
    let isEligible = false;
    let rtoMessage = "";

    const selectedClass = vehicleClass || "combo-bike-car";

    if (selectedClass === 'gearless-50cc') {
      isEligible = age >= 16;
      rtoMessage = isEligible 
        ? `Age ${age} yrs verified: Compliant with CMVR Rule 14 for MCWOG ≤50cc (16+ yrs).` 
        : `Age ${age} yrs: Citizen must be 16+ for gearless vehicles under MV Act 1988.`;
    } else if (selectedClass === 'commercial-transport') {
      isEligible = age >= 20;
      rtoMessage = isEligible
        ? `Age ${age} yrs verified: Compliant with CMVR Rule 31 for Commercial Transport Vehicles (20+ yrs).`
        : `Age ${age} yrs: Citizen must be 20+ for commercial licences under MV Act 1988.`;
    } else {
      isEligible = age >= 18;
      rtoMessage = isEligible
        ? `Age ${age} yrs verified: Compliant with CMVR Rule 14 for LMV/MCWG standard Learner's Licence (18+ yrs).`
        : `Age ${age} yrs: Citizen must be 18+ for standard motor vehicles under MV Act 1988.`;
    }

    return res.status(200).json({
      success: true,
      token,
      code_used: code || 'DL-SSO-REALTIME',
      is_demo_mode: true,
      is_simulated_demo: true,
      evaluation_notice: "EVALUATION SANDBOX — Simulated DigiLocker document retrieval.",
      data: fetchedDocs,
      verification: {
        calculated_age: age,
        is_rto_eligible: isEligible,
        remarks: rtoMessage,
        statutory_act: "Motor Vehicles Act 1988 & CMVR 1989 Rule 14"
      }
    });
  } catch (err) {
    console.error('Documents handler error:', err);
    return res.status(500).json({ error: "Failed to process documents request." });
  }
}
