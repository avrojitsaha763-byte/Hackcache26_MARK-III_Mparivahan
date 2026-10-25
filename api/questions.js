// Vercel Serverless Function: /api/questions
// Delivers official STALL (Screen Test for All Learners Licence) question bank

const STALL_QUESTIONS = [
  {
    id: 1,
    category: "Road Signs",
    question: {
      en: "What does an octagonal red traffic sign with white border mean?",
      hi: "सफेद बॉर्डर वाले अष्टकोणीय लाल यातायात संकेत का क्या अर्थ है?"
    },
    options: [
      { en: "Give Way", hi: "रास्ता दीजिए" },
      { en: "No Parking", hi: "गाड़ी खड़ी न करें" },
      { en: "Stop", hi: "वाहन रोकिए (Stop)" },
      { en: "Overtaking Prohibited", hi: "ओवरटेक करना मना है" }
    ],
    correctIndex: 2,
    explanation: "An octagonal sign is uniquely reserved for STOP to be recognized from any angle."
  },
  {
    id: 2,
    category: "Road Signs",
    question: {
      en: "An inverted triangular sign indicates:",
      hi: "उल्टा त्रिकोणीय संकेत क्या दर्शाता है?"
    },
    options: [
      { en: "Give Way to traffic on major road", hi: "मुख्य सड़क के यातायात को रास्ता दें" },
      { en: "Dead End Ahead", hi: "आगे रास्ता बंद है" },
      { en: "Compulsory Ahead", hi: "आगे बढ़ना अनिवार्य है" },
      { en: "Speed Limit 50", hi: "गति सीमा 50" }
    ],
    correctIndex: 0,
    explanation: "Inverted triangle is the universal sign for Give Way / Yield."
  },
  {
    id: 3,
    category: "Car Rules (LMV)",
    question: {
      en: "Under Section 194B of the Motor Vehicles Act, wearing a seatbelt in a motor car is mandatory for:",
      hi: "मोटर वाहन अधिनियम की धारा 194B के तहत कार में सीटबेल्ट पहनना किसके लिए अनिवार्य है?"
    },
    options: [
      { en: "Driver only", hi: "केवल चालक के लिए" },
      { en: "Driver and all passengers occupying front and rear seats", hi: "चालक और आगे तथा पीछे की सभी सीटों पर बैठे यात्रियों के लिए" },
      { en: "Only on expressways above 80 km/h", hi: "केवल 80 किमी/घंटा से अधिक गति वाले एक्सप्रेसवे पर" },
      { en: "Seatbelt is optional inside city limits", hi: "शहर के भीतर सीटबेल्ट वैकल्पिक है" }
    ],
    correctIndex: 1,
    explanation: "Section 194B mandates 3-point seatbelts for all occupants (driver and passengers), punishable with a ₹1,000 fine."
  },
  {
    id: 4,
    category: "Car Rules (LMV)",
    question: {
      en: "On narrow hill roads or gradients, which vehicle legally has the right of way?",
      hi: "पहाड़ी सड़कों या संकरी ढलान पर किस वाहन को पहले निकलने का कानूनी अधिकार (Right of Way) है?"
    },
    options: [
      { en: "The heavier truck or bus", hi: "भारी ट्रक या बस को" },
      { en: "The vehicle moving uphill (ascending the slope)", hi: "चढ़ाई पर ऊपर की ओर जा रहे वाहन को" },
      { en: "The vehicle coming downhill (descending the slope)", hi: "ढलान से नीचे उतर रहे वाहन को" },
      { en: "Whichever vehicle honks first", hi: "जो वाहन पहले हॉर्न बजाए" }
    ],
    correctIndex: 1,
    explanation: "CMVR Rule 11 mandates that descending vehicles must yield to ascending vehicles on slopes."
  },
  {
    id: 5,
    category: "Bike Rules (MCWG)",
    question: {
      en: "Under Section 129 of the MV Act, which specification of helmet is legally mandatory for two-wheeler riders?",
      hi: "एमवी एक्ट की धारा 129 के तहत दोपहिया सवारों के लिए किस प्रकार का हेलमेट अनिवार्य है?"
    },
    options: [
      { en: "Any industrial safety hardhat", hi: "कोई भी औद्योगिक सुरक्षा टोपी" },
      { en: "BIS (Bureau of Indian Standards) ISI certified helmet with locked chinstrap", hi: "बीआईएस (ISI) प्रमाणित हेलमेट जिसमें चिन-स्ट्रैप लॉक हो" },
      { en: "Cricket sports helmet", hi: "क्रिकेट स्पोर्ट्स हेलमेट" },
      { en: "Half-cap helmet without strap", hi: "बिना स्ट्रैप वाला हाफ कैप हेलमेट" }
    ],
    correctIndex: 1,
    explanation: "MoRTH mandates ISI (IS 4151:2015) certified helmets with fastened chinstraps."
  },
  {
    id: 6,
    category: "Traffic Rules",
    question: {
      en: "When entering a traffic roundabout (circle), who has the right of way?",
      hi: "ट्रैफिक राउंडअबाउट (गोल चक्कर) में प्रवेश करते समय, पहले निकलने का अधिकार किसका है?"
    },
    options: [
      { en: "Traffic entering from the left approach", hi: "बाईं ओर से प्रवेश कर रहे ट्रैफिक को" },
      { en: "Traffic already circulating inside the roundabout on your right", hi: "गोल चक्कर के भीतर पहले से घूम रहे ट्रैफिक को (जो आपके दाईं ओर है)" },
      { en: "Traffic with emergency blinkers on", hi: "इमरजेंसी ब्लिंकर चालू रखने वाले वाहनों को" },
      { en: "The faster accelerating vehicle", hi: "तेजी से गति बढ़ाने वाले वाहन को" }
    ],
    correctIndex: 1,
    explanation: "Circulating traffic already inside the roundabout has right of way; entering drivers must yield."
  },
  {
    id: 7,
    category: "General Safety",
    question: {
      en: "Under Section 185 of the Motor Vehicles Act, what is the legal blood alcohol concentration (BAC) limit?",
      hi: "मोटर वाहन अधिनियम की धारा 185 के तहत रक्त में अल्कोहल की कानूनी सीमा क्या है?"
    },
    options: [
      { en: "Zero (no detectable alcohol allowed for learner licence holders)", hi: "शून्य (लर्नर्स लाइसेंस धारकों के लिए शून्य सहनशीलता)" },
      { en: "30 mg per 100 ml of blood detected by breath analyser", hi: "ब्रेथ एनालाइज़र में 30 मिलीग्राम प्रति 100 मिलीलीटर रक्त" },
      { en: "100 mg per 100 ml of blood", hi: "100 मिलीग्राम प्रति 100 मिली रक्त" },
      { en: "Permitted up to 50 ml of liquor", hi: "50 मिली शराब तक अनुमत" }
    ],
    correctIndex: 1,
    explanation: "Section 185 sets a statutory limit of 30 mg alcohol per 100 ml blood."
  },
  {
    id: 8,
    category: "Road Signs",
    question: {
      en: "A circular blue sign with a white arrow pointing forward means:",
      hi: "सफेद तीर वाले नीले गोलाकार संकेत का क्या अर्थ है?"
    },
    options: [
      { en: "Compulsory ahead only", hi: "केवल सीधे आगे बढ़ना अनिवार्य है" },
      { en: "One way street", hi: "एक तरफा रास्ता" },
      { en: "No entry", hi: "प्रवेश निषेध" },
      { en: "Overtaking allowed", hi: "ओवरटेक की अनुमति है" }
    ],
    correctIndex: 0,
    explanation: "Blue circular signs are mandatory regulatory directions."
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

  const { category, limit = 15 } = req.query;
  let questions = [...STALL_QUESTIONS];

  if (category && category !== 'ALL') {
    questions = questions.filter(q => q.category.toLowerCase().includes(category.toLowerCase()));
  }

  const numLimit = Math.min(50, Math.max(1, Number(limit) || 15));
  const sliced = questions.slice(0, numLimit);

  return res.status(200).json({
    status: 'success',
    count: sliced.length,
    total_available: questions.length,
    statutory_syllabus: 'CMVR 1989 Rule 11 Preliminary Knowledge Test',
    pass_mark_threshold: '60%',
    data: sliced
  });
}
