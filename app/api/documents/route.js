import { NextResponse } from 'next/server';

// RTO Helper Function to calculate age
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

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const { vehicleClass } = await request.json(); // e.g., 'motorcycle-gear' or 'gearless-50cc'

    if (authHeader !== "Bearer mock_oauth_token_8892") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simulate API Setu document retrieval delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // MOCK DATA: Simulating fetched documents (e.g., Class 10 Certificate & Voter ID)
    // NOTE: For privacy & compliance, never generate mock Aadhaar numbers.
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

    return NextResponse.json({
      success: true,
      data: fetchedDocs,
      verification: {
        calculated_age: age,
        is_rto_eligible: isEligible,
        remarks: rtoMessage
      }
    }, { status: 200 });

  } catch {
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
