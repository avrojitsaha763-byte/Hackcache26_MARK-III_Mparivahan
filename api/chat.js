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

    const query = (body.query || body.message || body.prompt || body.text || '').trim();
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

    // Citizen intent to apply
    const wantsToApply =
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

    // ONLY trigger autoFillCard if the citizen has actually provided their name or phone + vehicle
    const hasProvidedDetails = !!(applicantName || (applicantPhone && (vehicle || selectedState)));
    const isApplyIntent = wantsToApply && hasProvidedDetails;

    // 4. Try Google Gemini 2.5 Flash API with production key fallback
    const DEFAULT_GEMINI_KEY = Buffer.from('QVEuQWI4Uk42TF9wOXQ1TmZadVlrdVRBTFZ6eUhOTUVxX1VBUHVYNDhfVWJhYUtaM211Z2c=', 'base64').toString('utf-8');
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

    if (geminiApiKey) {
      try {
        const systemPrompt = `You are "Saathi Copilot", an empathetic, highly intelligent AI Digital RTO Officer and Driving Licence Guide for India's Ministry of Road Transport and Highways (MoRTH) Parivahan Sarathi.
Respond warmly and clearly in ${isHindi ? 'Hindi (Devanagari script)' : 'natural English'} like ChatGPT.

CRITICAL INSTRUCTIONS FOR FORM 2 APPLICATION:
- If a user asks to apply for a licence, get a licence, or fill Form 2, DO NOT assume their personal details or dump a prefilled form.
- Guide them conversationally step by step:
  1. Ask for their Full Name (as on Aadhaar)
  2. Ask for their 10-digit Mobile Number
  3. Ask for their State and City / RTO Circle
  4. Ask which vehicle class they want (Bike with Gear, Scooter, Car, or Both)
- If the user has already provided some of these details in their message, acknowledge what you received and politely ask for the missing ones.
- Once they have provided their details (Name, State/RTO, Vehicle), confirm the summary clearly, mention the statutory fee (Rule 32: ₹200 for single class, ₹350 for combo), and invite them to proceed!

CORE STATUTORY RULES (CMVR 1989):
- Rule 11: Preliminary computerized test (STALL) requires minimum 60% (9/15). Free mock test available.
- Rule 13: Form 3 Learner's Licence is valid for 6 months (180 days) across India.
- Rule 14: Form 2 requires age proof (Aadhaar is 100% sufficient; no 10th marksheet required), address proof, and Form 1 self-declaration.
- Rule 15: Minimum 30-day practice holding period for Form 3 LL before permanent DL driving test.
- Rule 32: Official fee is ₹200 for single class (₹150 LL + ₹50 test), ₹350 for dual bike+car. Zero middleman/agent fees.
- NO fictional 7-day cancellation rule exists. If a candidate fails STALL, they can re-appear after 7 days by paying ₹50 retest fee.
- Always include helpful next steps and statutory citations ([CMVR Rule 14], [CMVR Rule 32], etc.).`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout for high reliability

        // Assemble recent history if supplied
        const contents = [];
        if (Array.isArray(body.history) && body.history.length > 0) {
          body.history.slice(-4).forEach(h => {
            if (h.sender === 'user' && h.text) contents.push({ role: 'user', parts: [{ text: h.text }] });
            else if (h.sender === 'bot' && h.text) contents.push({ role: 'model', parts: [{ text: h.text }] });
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nCitizen Query: ${query}` }]
        });

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          signal: controller.signal,
          headers: { 
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiApiKey
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 600
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
              source: 'gemini-2.5-flash',
              is_ai_live: true,
              query,
              lang,
              reply: candidateText.trim(),
              intent: isApplyIntent ? 'apply_ll' : (wantsToApply ? 'collect_details' : 'ai_copilot_analysis'),
              action: isApplyIntent ? 'autofill_form' : (wantsToApply ? 'request_details' : 'none'),
              extracted_data: {
                name: applicantName || '',
                phone: applicantPhone || '',
                vehicle: vehicle || 'motorcycle-gear',
                vehicle_label: vehicleLabel || 'Motorcycle with Gear (MCWG)',
                state: selectedState || 'Delhi',
                rto: selectedRto || 'DL-01',
                rto_name: selectedRtoName || 'Delhi (Mall Road - North Delhi)'
              },
              isApplyIntent: isApplyIntent,
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
      const stateDisp = selectedState || (isHindi ? 'आपका राज्य' : 'Delhi');
      const rtoDisp = selectedRtoName || (isHindi ? 'संबंधित आरटीओ' : 'Delhi (Mall Road - North Delhi)');
      const vehDisp = vehicleLabel || (isHindi ? 'मोटरसाइकिल (MCWG)' : 'Motorcycle with Gear (MCWG)');

      reply = isHindi
        ? `धन्यवाद ${applicantName || 'आवेदक'} जी! आपके दिए गए विवरण के आधार पर ${stateDisp} (${rtoDisp}) में ${vehDisp} के लिए फॉर्म 2 आवेदन तैयार है। सांविधिक सरकारी शुल्क ₹${fee} (CMVR नियम 32) है। कृपया नीचे दिए गए विवरण की पुष्टि करें और फॉर्म 2 खोलें:`
        : `Thank you ${applicantName || 'Applicant'}! Based on the details you provided, your Form 2 draft for ${vehDisp} at ${rtoDisp} is ready. Official statutory fee is ₹${fee} (CMVR Rule 32). Please review your confirmed details below to open Form 2:`;

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
4. **वाहन का प्रकार** (गियर वाली बाइक, बिना गियर स्कूटी, कार, या दोनों?)

आप ये सभी विवरण एक साथ लिख सकते हैं या एक-एक करके बता सकते हैं!`
        : `I will gladly help you apply for your Learner's Licence (Form 2) step by step!

Please share these 4 quick details with me:
1. **Your Full Name** (as printed on your Aadhaar card)
2. **Your 10-digit Mobile Number**
3. **Your State and City / RTO** (e.g., Delhi, Lucknow, Bengaluru, Kolkata, Mumbai...)
4. **Vehicle Type** (Bike with Gear, Scooter/Moped, Car, or Both?)

You can type all of them together right now, or send them one by one!`;
      sources.push({ title: 'CMVR 1989 Rule 14 (Application Procedure)', url: 'https://parivahan.gov.in' });
    } else if (lower.includes('marksheet') || lower.includes('10th') || lower.includes('aadhaar') || lower.includes('अनपढ़') || lower.includes('पढ़ा लिखा')) {
      intent = 'village_documents_education';
      reply = isHindi 
        ? 'हाँ, बिल्कुल! आपको 10वीं की मार्कशीट की कोई आवश्यकता नहीं है। केंद्र सरकार के संशोधित नियमों के अनुसार ड्राइविंग लाइसेंस के लिए न्यूनतम शैक्षणिक योग्यता की बाध्यता समाप्त कर दी गई है। आपका **आधार कार्ड (Aadhaar Card)** आयु प्रमाण और पता प्रमाण दोनों के लिए 100% मान्य है।'
        : 'Yes, absolutely! You do NOT need a 10th marksheet. Under amended MoRTH rules, the minimum educational qualification for obtaining a driving licence has been completely removed. Your **Aadhaar Card** is 100% sufficient as both Age and Address proof!';
      sources.push({ title: 'MoRTH Gazette Notification S.O. 2689(E)', url: 'https://morth.nic.in' });
    } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('फीस') || lower.includes('रुपये') || lower.includes('paisa') || lower.includes('kharch') || lower.includes('rule 32')) {
      intent = 'fee_query';
      action = 'fee_calculator';
      reply = isHindi 
        ? 'CMVR नियम 32 के अनुसार आधिकारिक सरकारी शुल्क: सिंगल क्लास (केवल बाइक या केवल कार) = मात्र ₹200 (₹150 LL + ₹50 टेस्ट)। बाइक + कार कॉम्बो = ₹350। दलालों या एजेंटों को ₹2,000-₹3,000 कभी न दें — सरकारी फीस सीधे भारत ई-पे / UPI द्वारा भरी जाती है।' 
        : 'Official government fee under CMVR Rule 32: Single category (Bike or Car) = only ₹200 (₹150 LL + ₹50 test). Dual Bike + Car combo = ₹350. Never pay ₹2,000 to ₹3,000 to local brokers — fees are paid directly to government treasury via UPI.';
      sources.push({ title: 'CMVR 1989 Rule 32 (Fee Schedule)', url: 'https://morth.nic.in' });
    } else if (lower.includes('rule 11') || lower.includes('knowledge') || lower.includes('stall') || lower.includes('fail') || lower.includes('नियम 11') || lower.includes('परीक्षा')) {
      intent = 'rule_query';
      action = 'practice_test';
      reply = isHindi 
        ? 'बिल्कुल मत डरिए! कंप्यूटर टेस्ट (STALL) में सिर्फ 15 आसान सवाल आते हैं जिनमें सड़क संकेत बने होते हैं। पास होने के लिए 15 में से 9 (60%) सही करने होते हैं। अगर फेल हो जाएं तो कोई जुर्माना नहीं है — 7 दिन बाद मात्र ₹50 फीस देकर दोबारा दे सकते हैं। अभ्यास के लिए हमारे फ्री मॉक टेस्ट का उपयोग करें।' 
        : 'Do not worry! The preliminary knowledge test (STALL) has only 15 simple multiple-choice questions with road signs. You only need 9 out of 15 (60%) to pass. If you fail, there is zero penalty — you can retake after 7 days by paying a ₹50 retest fee.';
      sources.push({ title: 'CMVR 1989 Rule 11 (Knowledge Test Syllabus)', url: 'https://parivahan.gov.in' });
    } else if (lower.includes('home') || lower.includes('delivery') || lower.includes('post') || lower.includes('ghar') || lower.includes('kitne din')) {
      intent = 'timeline_query';
      reply = isHindi
        ? 'समय-सारिणी: 1) ऑनलाइन टेस्ट पास करते ही डिजिटल लर्नर्स लाइसेंस 1 से 3 दिन में फोन पर आ जाता है। 2) 30 दिन बाद आरटीओ में प्रैक्टिकल टेस्ट देना होता है। 3) टेस्ट पास करने के 7 से 15 दिनों के अंदर भारतीय डाक (Speed Post) द्वारा ओरिजिनल स्मार्ट कार्ड लाइसेंस सीधे आपके घर पहुंचा दिया जाता है।'
        : 'Timeline: 1) Digital Learner\'s Licence is generated in 1-3 days on your phone upon passing STALL. 2) 30-day practice holding period. 3) After passing practical driving test, permanent Smart Card DL is delivered via India Post Speed Post directly to your home within 7 to 15 days.';
      sources.push({ title: 'MoRTH Citizen Charter', url: 'https://parivahan.gov.in' });
    } else {
      reply = isHindi 
        ? 'नमस्ते! मैं आपका सारथी कोपायलट हूँ। मैं ड्राइविंग लाइसेंस की पूरी प्रक्रिया में आपकी मदद करूँगा। आप मुझसे लाइसेंस के नियम, सरकारी फीस (₹200), आवश्यक दस्तावेज (आधार कार्ड), कंप्यूटर टेस्ट की तैयारी या नया आवेदन करने के बारे में कुछ भी पूछ सकते हैं!' 
        : 'Hello! I am your Saathi Copilot. I am here to help you with your driving licence journey. You can ask me about official rules, statutory fees (₹200), required documents (Aadhaar), computerized test preparation, or ask me to help you fill Form 2 step by step!';
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
      extracted_data: {
        name: applicantName || '',
        phone: applicantPhone || '',
        vehicle: vehicle || 'motorcycle-gear',
        vehicle_label: vehicleLabel || 'Motorcycle with Gear (MCWG)',
        state: selectedState || 'Delhi',
        rto: selectedRto || 'DL-01',
        rto_name: selectedRtoName || 'Delhi (Mall Road - North Delhi)'
      },
      isApplyIntent: isApplyIntent,
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
