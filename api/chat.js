// Vercel Serverless Function: /api/chat
// Powers 24/7 Saathi AI Virtual Tutor with Dual-Mode (Google Gemini 1.5 Flash + CMVR Statutory Fallback)

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

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (geminiApiKey) {
      try {
        const systemPrompt = `You are "Saathi AI", an official Indian e-Governance legal and driving assistant for Licence Saathi (EasyDL), compliant with the Motor Vehicles Act 1988 and Central Motor Vehicles Rules (CMVR) 1989.
Respond concisely in 2 to 3 sentences in ${isHindi ? 'Hindi (Devanagari script)' : 'clear English'}.
Key rules:
- Rule 11(3): Applicants must take the online STALL Learner's Licence test within 7 days of application submission.
- Rule 15: Learners must hold a Form 3 LL for minimum 30 days before appearing for the permanent DL test (valid 180 days).
- Rule 32: Fees are ₹200 for single class, ₹350 for dual bike+car combo.
- Always maintain a helpful, respectful, and authoritative e-governance tone.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
              temperature: 0.3,
              maxOutputTokens: 250
            }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            return res.status(200).json({
              status: 'success',
              source: 'gemini-1.5-flash',
              query,
              lang,
              reply: candidateText.trim()
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to statutory rules:', geminiErr.message);
      }
    }

    // Statutory Rule Matching Engine (Deterministic fallback)
    const lower = query.toLowerCase();
    let reply = '';

    if (lower.includes('7') || lower.includes('day') || lower.includes('दिन') || lower.includes('cancel') || lower.includes('रद्द') || lower.includes('rule 11')) {
      reply = isHindi 
        ? 'नियम 11(3) CMVR के अनुसार, आवेदन जमा करने के 7 दिनों के भीतर ऑनलाइन परीक्षा देना अनिवार्य है। यदि 7 दिनों में परीक्षा नहीं दी गई, तो आवेदन स्वतः रद्द हो जाता है।' 
        : 'Under Rule 11(3) of CMVR, applicants must take the online STALL test within 7 days of application submission, failing which it automatically lapses.';
    } else if (lower.includes('30') || lower.includes('wait') || lower.includes('permanent') || lower.includes('स्थायी') || lower.includes('rule 15')) {
      reply = isHindi 
        ? 'नियम 15 CMVR के तहत, स्थायी ड्राइविंग टेस्ट देने से पहले आपके पास न्यूनतम 30 दिनों तक वैध शिक्षार्थी अनुज्ञप्ति (Form 3) होना अनिवार्य है। यह 180 दिनों (6 महीने) तक वैध रहता है।' 
        : 'Under Rule 15 CMVR, you must hold a valid Form 3 Learner\'s Licence for minimum 30 days before appearing for the permanent DL driving test. Valid for 180 days across India.';
    } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('फीस') || lower.includes('रुपये') || lower.includes('paisa') || lower.includes('rule 32')) {
      reply = isHindi 
        ? 'CMVR नियम 32 के अनुसार: सिंगल क्लास (केवल बाइक या केवल कार) = ₹200 (₹150 LL + ₹50 टेस्ट)। बाइक + कार कॉम्बो = ₹350 (₹150 + ₹150 + ₹50)। कोई अतिरिक्त दलाल शुल्क नहीं।' 
        : 'Per CMVR Rule 32: Single category (Bike or Car) = ₹200 (₹150 LL + ₹50 test). Dual Bike + Car combo = ₹350. Direct treasury challan via Bharat e-Pay with zero agent surcharge.';
    } else if (lower.includes('adtt') || lower.includes('track') || lower.includes('parking') || lower.includes('gradient') || lower.includes('ढलान') || lower.includes('पार्किंग')) {
      reply = isHindi 
        ? 'स्वचालित टेस्ट ट्रैक (ADTT) पर मुख्य परीक्षण: 1) 1:6 ढलान पर कार रोकें और बिना 15 सेमी से अधिक पीछे लुढ़के आगे बढ़ें। 2) 3 मिनट में समानांतर पार्किंग करें। 3) अनिवार्य सीटबेल्ट बांधें।' 
        : 'Key Automated Driving Test Track (ADTT) requirements: 1) On a 1:6 uphill gradient, restart without rolling back >15 cm. 2) Complete parallel parking in 3 minutes without touching sensor poles.';
    } else {
      reply = isHindi 
        ? 'सटीक आरटीओ नियमों, फॉर्म 2 आवेदन अथवा टेस्ट स्लॉट बुकिंग हेतु सारथी साथी पोर्टल के मेन्यू विकल्पों का उपयोग करें।' 
        : 'For official transport regulations, Form 2 assistance, or appointment booking, explore the guided features on Licence Saathi or visit parivahan.gov.in.';
    }

    return res.status(200).json({
      status: 'success',
      source: 'statutory-engine',
      query,
      lang,
      reply
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error: ' + err.message });
  }
}
