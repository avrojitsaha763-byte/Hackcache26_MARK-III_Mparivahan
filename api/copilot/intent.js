// Vercel Serverless Function: /api/copilot/intent
// Powers Saathi Copilot Structured Intent Extraction & Action Engine

const OFFICIAL_RTO_MAP = {
  wb: { state: 'West Bengal', code: 'WB-01', name: 'West Bengal (Kolkata - Beltala)' },
  kolkata: { state: 'West Bengal', code: 'WB-01', name: 'West Bengal (Kolkata - Beltala)' },
  beltala: { state: 'West Bengal', code: 'WB-01', name: 'West Bengal (Kolkata - Beltala)' },
  dl: { state: 'Delhi', code: 'DL-01', name: 'Delhi (Mall Road - North Delhi)' },
  delhi: { state: 'Delhi', code: 'DL-01', name: 'Delhi (Mall Road - North Delhi)' },
  ka: { state: 'Karnataka', code: 'KA-01', name: 'Karnataka (Bengaluru Central - Sarathi)' },
  bangalore: { state: 'Karnataka', code: 'KA-01', name: 'Karnataka (Bengaluru Central - Sarathi)' },
  bengaluru: { state: 'Karnataka', code: 'KA-01', name: 'Karnataka (Bengaluru Central - Sarathi)' },
  mh: { state: 'Maharashtra', code: 'MH-01', name: 'Maharashtra (Mumbai South - Tardeo)' },
  mumbai: { state: 'Maharashtra', code: 'MH-01', name: 'Maharashtra (Mumbai South - Tardeo)' },
  pune: { state: 'Maharashtra', code: 'MH-12', name: 'Maharashtra (Pune - Shivajinagar)' },
  up: { state: 'Uttar Pradesh', code: 'UP-32', name: 'Uttar Pradesh (Lucknow - Transport Nagar)' },
  lucknow: { state: 'Uttar Pradesh', code: 'UP-32', name: 'Uttar Pradesh (Lucknow - Transport Nagar)' },
  tn: { state: 'Tamil Nadu', code: 'TN-01', name: 'Tamil Nadu (Chennai Central)' },
  chennai: { state: 'Tamil Nadu', code: 'TN-01', name: 'Tamil Nadu (Chennai Central)' }
};

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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const query = (body.query || '').trim();
    const lang = body.lang === 'hi' ? 'hi' : 'en';
    const isHindi = lang === 'hi';

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const lower = query.toLowerCase();

    // 1. Structured Vehicle Detection
    let vehicle = null;
    let vehicleLabel = null;
    let fee = 200;

    if (
      lower.includes('combo') ||
      lower.includes('both') ||
      (lower.includes('bike') && lower.includes('car')) ||
      (lower.includes('motorcycle') && lower.includes('car')) ||
      (lower.includes('बाइक') && lower.includes('कार'))
    ) {
      vehicle = 'combo-bike-car';
      vehicleLabel = isHindi ? 'बाइक + कार (MCWG + LMV)' : 'Dual Motorcycle + Car (MCWG + LMV)';
      fee = 350;
    } else if (
      lower.includes('motorcycle') ||
      lower.includes('bike') ||
      lower.includes('mcwg') ||
      lower.includes('two wheeler') ||
      lower.includes('two-wheeler') ||
      lower.includes('बाइक') ||
      lower.includes('दोपहिया')
    ) {
      vehicle = 'motorcycle-gear';
      vehicleLabel = isHindi ? 'गियर वाली मोटरसाइकिल (MCWG)' : 'Motorcycle with Gear (MCWG)';
      fee = 200;
    } else if (
      lower.includes('car') ||
      lower.includes('lmv') ||
      lower.includes('four wheeler') ||
      lower.includes('four-wheeler') ||
      lower.includes('कार') ||
      lower.includes('चारपहिया')
    ) {
      vehicle = 'lmv-car';
      vehicleLabel = isHindi ? 'निजी चार पहिया कार (LMV)' : 'Light Motor Vehicle / Car (LMV)';
      fee = 200;
    } else if (lower.includes('50cc') || lower.includes('moped') || lower.includes('मोपेड')) {
      vehicle = 'gearless-50cc';
      vehicleLabel = isHindi ? '50cc तक गियरलेस मोपेड (16+)' : 'Gearless Moped up to 50cc (16+)';
      fee = 200;
    } else if (lower.includes('transport') || lower.includes('commercial') || lower.includes('ट्रांसपोर्ट')) {
      vehicle = 'commercial-transport';
      vehicleLabel = isHindi ? 'वाणिज्यिक ट्रांसपोर्ट (TRANS)' : 'Commercial Transport (TRANS)';
      fee = 300;
    }

    // 2. State & RTO Detection (No guessing; explicit mapping)
    let selectedState = null;
    let selectedRto = null;
    let selectedRtoName = null;

    for (const [key, val] of Object.entries(OFFICIAL_RTO_MAP)) {
      if (lower.includes(key)) {
        selectedState = val.state;
        selectedRto = val.code;
        selectedRtoName = val.name;
        break;
      }
    }

    // 3. Candidate Name Parsing (Strict: Never inject dummy names if not supplied)
    let applicantName = null;
    const nameMatch = query.match(/(?:my name is|i am|mera naam|naam|name)\s+([a-zA-Z\s]{2,25})/i);
    if (nameMatch && nameMatch[1]) {
      const clean = nameMatch[1].trim().split(/\s+/).slice(0, 3).join(' ');
      if (clean && !clean.toLowerCase().includes('apply') && !clean.toLowerCase().includes('want')) {
        applicantName = clean;
      }
    }

    // 4. Candidate Phone Parsing (Strict: Never inject dummy phone numbers)
    let applicantPhone = null;
    const phoneMatch = query.match(/\b[6-9]\d{9}\b/);
    if (phoneMatch) {
      applicantPhone = phoneMatch[0];
    }

    // 5. Intent Classification
    let intent = 'general';
    let action = 'none';
    let reply = '';
    const sources = [
      { title: 'Central Motor Vehicles Rules 1989', url: 'https://parivahan.gov.in' },
      { title: 'Ministry of Road Transport and Highways (MoRTH)', url: 'https://morth.nic.in' }
    ];

    const wantsToApply =
      (lower.includes('want to apply') ||
        lower.includes('apply for') ||
        lower.includes('want a licence') ||
        lower.includes('want a license') ||
        lower.includes('need a licence') ||
        lower.includes('need a license') ||
        lower.includes('licence banwana') ||
        lower.includes('आवेदन करना') ||
        (selectedState && vehicle && (lower.includes('apply') || lower.includes('want')))) &&
      !lower.includes('how to') &&
      !lower.includes('what is') &&
      !lower.includes('can i');

    const hasApplicantDetails = !!(applicantName || (applicantPhone && (vehicle || selectedState)));

    if (wantsToApply && hasApplicantDetails) {
      intent = 'apply_ll';
      action = 'autofill_form';

      const stateDisplay = selectedState || (isHindi ? 'आपका राज्य' : 'Your State');
      const rtoDisplay = selectedRtoName || (isHindi ? 'संबंधित आरटीओ' : 'Assigned RTO');
      const vehDisplay = vehicleLabel || (isHindi ? 'मोटरसाइकिल (MCWG)' : 'Motorcycle (MCWG)');

      reply = isHindi
        ? `धन्यवाद ${applicantName || 'आवेदक'} जी! आपके दिए गए विवरण के आधार पर ${stateDisplay} (${rtoDisplay}) में ${vehDisplay} के लिए फॉर्म 2 आवेदन तैयार है। सांविधिक शुल्क ₹${fee} (CMVR नियम 32) है। कृपया विवरण की पुष्टि करें:`
        : `Thank you ${applicantName || 'Applicant'}! Based on your details, your Form 2 Learner's Licence application for ${vehDisplay} at ${rtoDisplay} is prepared. Statutory fee is ₹${fee} per Rule 32. Please review your details below to open Form 2:`;

      sources.push({ title: 'CMVR 1989 Rule 14 (Form 2 Application)', url: 'https://parivahan.gov.in' });
      sources.push({ title: 'CMVR 1989 Rule 32 (Statutory Fees)', url: 'https://morth.nic.in' });
    } else if (wantsToApply) {
      intent = 'collect_details';
      action = 'request_details';
      reply = isHindi
        ? `मैं आपका ड्राइविंग लाइसेंस (फॉर्म 2) आवेदन भरने में पूरी मदद करूँगा! 

कृपया मुझे अपने ये 4 विवरण बताएं:
1. **आपका पूरा नाम** (जैसा आधार कार्ड पर है)
2. **10 अंकों का मोबाइल नंबर**
3. **आपका राज्य और शहर / आरटीओ** (उदा. दिल्ली, लखनऊ, बेंगलुरु, कोलकाता, मुंबई...)
4. **वाहन का प्रकार** (बाइक, स्कूटी, कार, या दोनों?)

आप ये सभी विवरण एक साथ लिख सकते हैं या एक-एक करके बता सकते हैं!`
        : `I will gladly help you apply for your Learner's Licence (Form 2) step by step!

Please share these 4 quick details with me:
1. **Your Full Name** (as printed on your Aadhaar card)
2. **Your 10-digit Mobile Number**
3. **Your State and City / RTO** (e.g., Delhi, Lucknow, Bengaluru, Kolkata, Mumbai...)
4. **Vehicle Type** (Bike with Gear, Scooter/Moped, Car, or Both?)

You can type all of them together right now, or send them one by one!`;
      sources.push({ title: 'CMVR 1989 Rule 14 (Application Procedure)', url: 'https://parivahan.gov.in' });
    } else if (lower.includes('rule 11') || lower.includes('knowledge') || lower.includes('stall') || lower.includes('pass') || lower.includes('नियम 11')) {
      intent = 'rule_query';
      action = 'practice_test';
      reply = isHindi
        ? 'केंद्रीय मोटर वाहन नियम (CMVR) 1989 के नियम 11 के अनुसार, लर्नर्स लाइसेंस जारी करने से पहले आवेदक को सड़क संकेत, ट्रैफिक सिग्नल और सुरक्षित ड्राइविंग के नियमों पर आधारित कंप्यूटर परीक्षा (STALL) में न्यूनतम 60% अंक प्राप्त करना अनिवार्य है।'
        : 'Under CMVR 1989 Rule 11, candidates must pass a computerized preliminary knowledge test covering traffic signs, road regulations, and safe driving principles with a minimum 60% passing score before Form 3 LL issuance.';
      sources.push({ title: 'CMVR 1989 Rule 11 (Knowledge Test Syllabus)', url: 'https://parivahan.gov.in' });
    } else if (lower.includes('30') || lower.includes('wait') || lower.includes('permanent') || lower.includes('rule 15') || lower.includes('स्थायी')) {
      intent = 'rule_query';
      action = 'none';
      reply = isHindi
        ? 'नियम 15 CMVR के तहत, स्थायी ड्राइविंग टेस्ट (ADTT) देने से पहले आपके पास न्यूनतम 30 दिनों तक वैध लर्नर्स लाइसेंस (Form 3) होना अनिवार्य है। फॉर्म 3 पूरे भारत में 180 दिनों (6 महीने) के लिए वैध रहता है (नियम 13)।'
        : 'Under Rule 15 CMVR, you must hold a valid Form 3 Learner\'s Licence for at least 30 days before appearing for the permanent DL driving test. Under Rule 13, Form 3 is valid for 180 days (6 months) nationwide.';
      sources.push({ title: 'CMVR 1989 Rule 15 (Driving Test Waiting Period)', url: 'https://parivahan.gov.in' });
      sources.push({ title: 'CMVR 1989 Rule 13 (Form 3 Validity)', url: 'https://parivahan.gov.in' });
    } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('फीस') || lower.includes('rule 32')) {
      intent = 'fee_query';
      action = 'fee_calculator';
      reply = isHindi
        ? 'CMVR 1989 नियम 32 के अनुसार आधिकारिक शुल्क: सिंगल क्लास (केवल बाइक या केवल कार) = ₹200 (₹150 LL + ₹50 टेस्ट शुल्क)। बाइक + कार कॉम्बो = ₹350 (₹150 + ₹150 + ₹50)। भारत ई-पे चालान से भुगतान होता है, कोई दलाल शुल्क नहीं।'
        : 'Per CMVR 1989 Rule 32, official government fees are: Single class (Bike or Car) = ₹200 (₹150 LL + ₹50 online test fee). Dual Bike + Car combo = ₹350. Payable directly via Bharat e-Pay with zero intermediary surcharge.';
      sources.push({ title: 'CMVR 1989 Rule 32 (Fee Schedule)', url: 'https://morth.nic.in' });
    } else if (lower.includes('track') || lower.includes('status') || lower.includes('स्थिति')) {
      intent = 'status_track';
      action = 'track_app';
      reply = isHindi
        ? 'आप अपना आवेदन क्रमांक (उदा. DL-2026-98124) दर्ज करके सीधे रियल-टाइम स्क्रूटनी, STALL परीक्षा स्थिति और डिजिटल फॉर्म 3 की स्थिति देख सकते हैं।'
        : 'You can track real-time scrutiny desk progress, STALL exam results, and Form 3 digital issuance by entering your application number (e.g. DL-2026-98124).';
      sources.push({ title: 'Parivahan Sarathi Citizen Tracking', url: 'https://sarathi.parivahan.gov.in' });
    } else {
      intent = 'general';
      action = 'none';
      reply = isHindi
        ? 'नमस्ते! मैं सारथी साथी ड्राइविंग लाइसेंस कोपायलट हूँ। आप मुझसे आरटीओ नियम (नियम 11, 15, 32) पूछ सकते हैं, या सीधे कहें "मुझे पश्चिम बंगाल में बाइक लाइसेंस चाहिए" और मैं आपका फॉर्म 2 तैयार करूँगा।'
        : 'Namaste! I am Saathi — Your Driving Licence Copilot. Ask me about RTO rules (CMVR 11, 15, 32), or say "I want a motorcycle learner\'s licence in West Bengal" to prepare your Form 2 draft.';
    }

    return res.status(200).json({
      status: 'success',
      reply,
      intent,
      action,
      extracted_data: {
        name: applicantName,
        phone: applicantPhone,
        vehicle: vehicle || 'motorcycle-gear',
        vehicle_label: vehicleLabel || 'Motorcycle with Gear (MCWG)',
        state: selectedState || 'West Bengal',
        rto: selectedRto || 'WB-01',
        rto_name: selectedRtoName || 'West Bengal (Kolkata - Beltala)'
      },
      fee_details: {
        total: fee,
        rule_citation: 'Central Motor Vehicles Rules 1989, Rule 32'
      },
      sources,
      is_ai_live: false,
      source: 'statutory-copilot-engine'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
