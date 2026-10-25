// Vercel Serverless Function: /api/check-eligibility
// Validates applicant statutory age & CMVR Rule 32 indicative fee calculation

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    body = body || req.query || {};

    const rawAge = body.age;
    const dob = body.dob;
    const vehicleClass = (body.vehicle_class || body.vehicleClass || 'LMV').toLowerCase();
    const hasAadhaar = body.has_aadhaar !== false;

    let calculatedAge = Number(rawAge);
    if ((!calculatedAge || isNaN(calculatedAge)) && dob) {
      const birth = new Date(dob);
      const today = new Date();
      calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
    }

    if (!calculatedAge || isNaN(calculatedAge)) {
      calculatedAge = 18;
    }

    let minAge = 18;
    let feeTotal = 200;
    let breakdown = [];
    let statutoryRule = "CMVR 1989 Rule 14 (Standard Age Threshold: 18+ yrs)";

    if (vehicleClass.includes('50cc') || vehicleClass.includes('mcwog_50')) {
      minAge = 16;
      feeTotal = 200;
      breakdown = [
        { component: "MCWOG ≤50cc Learner Licence", amount: 150 },
        { component: "Preliminary STALL Test Fee", amount: 50 }
      ];
      statutoryRule = "Motor Vehicles Act 1988, Sec 4(1) (Special Category: 16+ yrs with parental consent)";
    } else if (vehicleClass.includes('commercial') || vehicleClass.includes('trans')) {
      minAge = 20;
      feeTotal = 300;
      breakdown = [
        { component: "Transport Vehicle LL Issue", amount: 200 },
        { component: "Commercial Competence Test", amount: 100 }
      ];
      statutoryRule = "Motor Vehicles Act 1988, Sec 4(2) & CMVR Rule 31 (Commercial Transport: 20+ yrs)";
    } else if (vehicleClass.includes('combo') || vehicleClass.includes('combo-bike-car')) {
      minAge = 18;
      feeTotal = 350;
      breakdown = [
        { component: "MCWG (Bike) Learner Licence", amount: 150 },
        { component: "LMV (Car) Learner Licence", amount: 150 },
        { component: "Online STALL Test Fee", amount: 50 }
      ];
      statutoryRule = "CMVR 1989 Rule 14 & Rule 32 (Dual Class Combination)";
    } else {
      minAge = 18;
      feeTotal = 200;
      breakdown = [
        { component: "Learner Licence Issue (Rule 10/13)", amount: 150 },
        { component: "STALL Computer Test Fee (Rule 11)", amount: 50 }
      ];
      statutoryRule = "CMVR 1989 Rule 14 (Private Non-Transport Vehicle)";
    }

    const eligible = calculatedAge >= minAge;

    return res.status(200).json({
      status: 'success',
      age: calculatedAge,
      vehicle_class: vehicleClass,
      eligible,
      minimum_age_required: minAge,
      statutory_citation: statutoryRule,
      fee_details: {
        total: feeTotal,
        currency: 'INR',
        breakdown,
        rule_citation: 'Central Motor Vehicles Rules 1989, Rule 32 Indicative Fee Schedule',
        note: 'Indicative national fee schedule. State-specific road safety cess or smart card fees may vary.',
        official_fee_calculator_url: 'https://parivahan.gov.in/parivahan//en/content/fees-user-charges'
      },
      aadhaar_faceless_eligible: hasAadhaar,
      remarks: eligible 
        ? `Age ${calculatedAge} meets statutory eligibility under ${statutoryRule}.`
        : `Applicant age (${calculatedAge}) is below the statutory requirement (${minAge} years) for this vehicle category.`
    });
  } catch (err) {
    console.error('Eligibility error:', err);
    return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
}
