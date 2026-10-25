// Vercel Serverless Function: /api/chat
// Powers 24/7 Saathi AI Virtual Tutor & Driving Licence Copilot
// Grounded strictly in Motor Vehicles Act 1988 & Central Motor Vehicles Rules (CMVR) 1989

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

    // 1. Vehicle category extraction
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
      vehicleLabel = isHindi ? 'निजी कार (LMV)' : 'Light Motor Vehicle / Car (LMV)';
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

    // 2. State & RTO resolution
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

    // 3. Name & Phone parsing (Strict: NO hardcoded dummy personas)
    let applicantName = null;
    const nameMatch = query.match(/(?:my name is|i am|mera naam|naam|name)\s+([a-zA-Z\s]{2,25})/i);
    if (nameMatch && nameMatch[1]) {
      const clean = nameMatch[1].trim().split(/\s+/).slice(0, 3).join(' ');
      if (clean && !clean.toLowerCase().includes('apply') && !clean.toLowerCase().includes('want')) {
        applicantName = clean;
      }
    }

    let applicantPhone = null;
    const phoneMatch = query.match(/\b[6-9]\d{9}\b/);
    if (phoneMatch) {
      applicantPhone = phoneMatch[0];
    }

    const isApplyIntent =
      (lower.includes('want to apply') ||
        lower.includes('apply for') ||
        lower.includes('want a licence') ||
        lower.includes('want a license') ||
        lower.includes('licence banwana') ||
        lower.includes('आवेदन करना') ||
        (selectedState && vehicle && (lower.includes('apply') || lower.includes('want')))) &&
      !lower.includes('how to') &&
      !lower.includes('what is') &&
      !lower.includes('can i');

    // 4. Try Google Gemini API if configured
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const systemPrompt = `You are "Saathi Copilot", the official legal and procedural driving licence copilot for Licence Saathi (EasyDL), strictly grounded in the Motor Vehicles Act 1988 and Central Motor Vehicles Rules (CMVR) 1989.
Respond concisely in 2 to 3 sentences in ${isHindi ? 'Hindi (Devanagari script)' : 'clear English'}.
Rules to strictly adhere to:
- Rule 11: Preliminary computerized knowledge test (STALL) covering road signs, regulations, and safe driving duties requires minimum 60% passing mark.
- Rule 13: Form 3 Learner's Licence is valid for 6 months (180 days) throughout India.
- Rule 14: Form 2 application requires age proof, address proof, and Form 1 self-declaration (or Form 1A medical certificate).
- Rule 15: Minimum 30-day holding period for Form 3 LL before candidate can take the permanent DL driving test.
- Rule 32: Statutory indicative fees are ₹200 for single category (₹150 LL + ₹50 test), ₹350 for dual bike+car combo.
- DO NOT invent, hallucinate, or mention any fictional 7-day cancellation rule.
- Always append legal citations (e.g. "[CMVR 1989 Rule 11]") when stating rules.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3800); // Strict 3.8s timeout

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          signal: controller.signal,
          headers: { 
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiApiKey
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nCitizen Query: ${query}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 250
            }
          })
        });
        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            return res.status(200).json({
              status: 'success',
              source: 'gemini-1.5-flash',
              is_ai_live: true,
              query,
              lang,
              reply: candidateText.trim(),
              intent: isApplyIntent ? 'apply_ll' : 'rule_query',
              action: isApplyIntent ? 'autofill_form' : 'none',
              extracted_data: isApplyIntent
                ? {
                    name: applicantName,
                    phone: applicantPhone,
                    vehicle: vehicle || 'motorcycle-gear',
                    vehicle_label: vehicleLabel || 'Motorcycle with Gear (MCWG)',
                    state: selectedState || 'West Bengal',
                    rto: selectedRto || 'WB-01',
                    rto_name: selectedRtoName || 'West Bengal (Kolkata - Beltala)'
                  }
                : null,
              fee_details: {
                total: fee,
                rule_citation: 'Central Motor Vehicles Rules 1989, Rule 32'
              },
              sources: [
                { title: 'CMVR 1989 (Official MoRTH Gazette)', url: 'https://morth.nic.in' },
                { title: 'Parivahan Sarathi Citizen Portal', url: 'https://parivahan.gov.in' }
              ]
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call timed out or failed, falling back to statutory rules:', geminiErr.message);
      }
    }

    // 5. Statutory Rule Matching Engine (Deterministic High-Precision Fallback)
    let reply = '';
    let intent = 'general';
    let action = 'none';
    const sources = [
      { title: 'Central Motor Vehicles Rules 1989', url: 'https://parivahan.gov.in' },
      { title: 'Ministry of Road Transport and Highways (MoRTH)', url: 'https://morth.nic.in' }
    ];

    if (isApplyIntent) {
      intent = 'apply_ll';
      action = 'autofill_form';
      const stateDisp = selectedState || (isHindi ? 'आपका राज्य' : 'Your State');
      const rtoDisp = selectedRtoName || (isHindi ? 'संबंधित आरटीओ' : 'Assigned RTO');
      const vehDisp = vehicleLabel || (isHindi ? 'मोटरसाइकिल (MCWG)' : 'Motorcycle (MCWG)');

      reply = isHindi
        ? `नियम 14 CMVR के अनुसार, ${stateDisp} (${rtoDisp}) में ${vehDisp} के लिए शिक्षार्थी लाइसेंस का फॉर्म 2 आवेदन तैयार है। आवश्यक दस्तावेज: आयु प्रमाण (आधार कार्ड), पता प्रमाण और फॉर्म 1 स्व-घोषणा। सांविधिक शुल्क ₹${fee} (नियम 32) है। नीचे विवरण की पुष्टि करके फॉर्म 2 स्वतः भरें:`
        : `Under CMVR 1989 Rule 14, your Form 2 Learner's Licence draft for ${vehDisp} at ${rtoDisp} is prepared. Statutory fee is ₹${fee} per Rule 32. Required documents: Age proof (Aadhaar), Address proof, and Form 1 self-declaration. Please review and confirm below to autofill Form 2:`;

      sources.push({ title: 'CMVR 1989 Rule 14 (Form 2 Application)', url: 'https://parivahan.gov.in' });
      sources.push({ title: 'CMVR 1989 Rule 32 (Statutory Fees)', url: 'https://morth.nic.in' });
    } else if (lower.includes('rule 11') || lower.includes('knowledge') || lower.includes('stall') || lower.includes('नियम 11') || lower.includes('परीक्षा')) {
      intent = 'rule_query';
      action = 'practice_test';
      reply = isHindi 
        ? 'नियम 11 CMVR के अनुसार, शिक्षार्थी लाइसेंस प्राप्त करने के लिए यातायात संकेतों और नियमों पर कंप्यूटर-आधारित ज्ञान परीक्षा (STALL) में न्यूनतम 60% अंक प्राप्त करना अनिवार्य है। राज्यवार स्लॉट शेड्यूलिंग अवधि अलग हो सकती है।' 
        : 'Under CMVR 1989 Rule 11, applicants must pass a computerized knowledge test (STALL) covering traffic signs, road regulations, and safe driving duties with a minimum 60% score before Form 3 LL issuance.';
      sources.push({ title: 'CMVR 1989 Rule 11 (Knowledge Test Syllabus)', url: 'https://parivahan.gov.in' });
    } else if (lower.includes('30') || lower.includes('wait') || lower.includes('permanent') || lower.includes('स्थायी') || lower.includes('rule 15')) {
      intent = 'rule_query';
      action = 'none';
      reply = isHindi 
        ? 'नियम 15 CMVR के तहत, स्थायी ड्राइविंग टेस्ट देने से पहले आपके पास न्यूनतम 30 दिनों तक वैध शिक्षार्थी अनुज्ञप्ति (Form 3) होना अनिवार्य है। यह पूरे भारत में 180 दिनों (6 महीने) तक वैध रहता है (नियम 13)।' 
        : 'Under Rule 15 CMVR, you must hold a valid Form 3 Learner\'s Licence for minimum 30 days before appearing for the permanent DL driving test. Valid for 180 days across India per Rule 13.';
      sources.push({ title: 'CMVR 1989 Rule 15 (Driving Test Waiting Period)', url: 'https://parivahan.gov.in' });
      sources.push({ title: 'CMVR 1989 Rule 13 (Form 3 Validity)', url: 'https://parivahan.gov.in' });
    } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('फीस') || lower.includes('रुपये') || lower.includes('paisa') || lower.includes('rule 32')) {
      intent = 'fee_query';
      action = 'fee_calculator';
      reply = isHindi 
        ? 'CMVR नियम 32 के अनुसार आधिकारिक शुल्क: सिंगल क्लास (केवल बाइक या केवल कार) = ₹200 (₹150 LL + ₹50 टेस्ट)। बाइक + कार कॉम्बो = ₹350 (₹150 + ₹150 + ₹50)। भारत ई-पे द्वारा सीधा भुगतान, कोई एजेंट शुल्क नहीं।' 
        : 'Per CMVR Rule 32: Single category (Bike or Car) = ₹200 (₹150 LL + ₹50 test). Dual Bike + Car combo = ₹350. Direct treasury payment via Bharat e-Pay with zero agent surcharge.';
      sources.push({ title: 'CMVR 1989 Rule 32 (Fee Schedule)', url: 'https://morth.nic.in' });
    } else if (lower.includes('adtt') || lower.includes('track') || lower.includes('parking') || lower.includes('gradient') || lower.includes('ढलान') || lower.includes('पार्किंग')) {
      intent = 'adtt_query';
      action = 'book_slot';
      reply = isHindi 
        ? 'स्वचालित टेस्ट ट्रैक (ADTT) पर मुख्य परीक्षण: 1) 1:6 ढलान पर कार रोकें और बिना 15 सेमी से अधिक पीछे लुढ़के आगे बढ़ें। 2) 3 मिनट में समानांतर पार्किंग करें। 3) अनिवार्य सीटबेल्ट बांधें।' 
        : 'Key Automated Driving Test Track (ADTT) requirements: 1) On a 1:6 uphill gradient, restart without rolling back >15 cm. 2) Complete parallel parking in 3 minutes without touching sensor poles.';
      sources.push({ title: 'MoRTH ADTT Sensor Standards', url: 'https://morth.nic.in' });
    } else {
      reply = isHindi 
        ? 'सटीक आरटीओ नियमों, फॉर्म 2 आवेदन अथवा टेस्ट स्लॉट बुकिंग हेतु सारथी साथी कोपायलट के त्वरित विकल्पों में से चुनें या सीधे प्रश्न पूछें।' 
        : 'For official transport regulations, Form 2 assistance, or appointment booking, select one of the quick guided actions or ask your question.';
    }

    return res.status(200).json({
      status: 'success',
      source: 'statutory-engine',
      is_ai_live: false,
      query,
      lang,
      reply,
      intent,
      action,
      extracted_data: isApplyIntent
        ? {
            name: applicantName,
            phone: applicantPhone,
            vehicle: vehicle || 'motorcycle-gear',
            vehicle_label: vehicleLabel || 'Motorcycle with Gear (MCWG)',
            state: selectedState || 'West Bengal',
            rto: selectedRto || 'WB-01',
            rto_name: selectedRtoName || 'West Bengal (Kolkata - Beltala)'
          }
        : null,
      fee_details: {
        total: fee,
        rule_citation: 'Central Motor Vehicles Rules 1989, Rule 32'
      },
      sources
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
