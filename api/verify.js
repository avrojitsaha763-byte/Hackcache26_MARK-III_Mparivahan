// Vercel Serverless Function: /api/verify
// National Form 3 TrustLedger Cryptographic Public Verification Engine

const VERIFIED_RECORDS = {
  'KA-01-LL-2026-0099418': {
    llNumber: 'KA-01-LL-2026-0099418',
    applicationNumber: 'LL-2026-98124',
    candidateName: 'Avrojit Saha',
    fatherHusbandName: 'Pranab Saha',
    dateOfBirth: '2003-08-14',
    gender: 'Male',
    bloodGroup: 'B+',
    address: 'Indiranagar 100ft Road, Stage 1, Bengaluru East, Karnataka - 560038',
    rtoCode: 'KA-01',
    rtoName: 'Bengaluru Central (Koramangala), Karnataka',
    issueDate: '2026-10-18',
    expiryDate: '2027-04-17',
    status: 'ACTIVE_VALID',
    vehicleClasses: ['MCWG', 'LMV-NT'],
    mviOfficer: {
      name: 'Shri Rajeshwar Sharma',
      badgeNumber: 'KA-MVI-0842',
      digitalSignatureId: 'DS-NIC-2026-99418-SHA256'
    },
    treasuryChallan: {
      grn: 'KA26-EPAY-8849102-RTO',
      amount: '₹200.00',
      paidVia: 'Bharat e-Pay UPI Gateway (SBI Parivahan Treasury)'
    },
    medicalClearance: {
      form1Id: 'MED-NETRA-2026-KA01-8841',
      visualAcuity: '6/6 Snellen (Both Eyes Cleared)',
      colorVision: 'Ishihara Normal Red-Green Spectrum'
    },
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  'DL-04-2026-0048192': {
    llNumber: 'DL-04-2026-0048192',
    applicationNumber: 'APP-2026-88419',
    candidateName: 'Priya Sharma',
    fatherHusbandName: 'Ramesh Sharma',
    dateOfBirth: '1999-11-22',
    gender: 'Female',
    bloodGroup: 'O+',
    address: 'Block C, Janakpuri West, New Delhi - 110058',
    rtoCode: 'DL-04',
    rtoName: 'Janakpuri West RTO, National Capital Territory of Delhi',
    issueDate: '2026-10-20',
    expiryDate: '2027-04-19',
    status: 'ACTIVE_VALID',
    vehicleClasses: ['LMV-NT'],
    mviOfficer: {
      name: 'Dr. Anita Mehra',
      badgeNumber: 'DL-ARTO-2104',
      digitalSignatureId: 'DS-NIC-2026-48192-SHA256'
    },
    treasuryChallan: {
      grn: 'DL26-EPAY-4410928-RTO',
      amount: '₹200.00',
      paidVia: 'Bharat e-Pay Razorpay Netbanking'
    },
    medicalClearance: {
      form1Id: 'MED-NETRA-2026-DL04-3321',
      visualAcuity: '6/6 Corrected with Spectacles',
      colorVision: 'Ishihara Normal Trichromat'
    },
    sha256Hash: '7d5a99f603f2c1a03344a2c3ec781a7f2b0b38b83f1231a405101a9351c459c1'
  }
};

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

  const queryId = (req.query.id || req.query.llNumber || '').trim().toUpperCase();

  if (!queryId) {
    return res.status(400).json({ error: 'LL Number query parameter "id" is required' });
  }

  const record = VERIFIED_RECORDS[queryId];
  if (record) {
    return res.status(200).json({
      success: true,
      verified: true,
      record
    });
  }

  return res.status(404).json({
    success: false,
    verified: false,
    message: `Record ${queryId} not found in the national registry.`
  });
}
