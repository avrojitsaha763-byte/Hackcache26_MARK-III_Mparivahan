export const mockQuestions = [
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
      { en: "Whichever vehicle reaches first", hi: "जो वाहन पहले पहुंचे" }
    ],
    correctIndex: 1,
    explanation: "Vehicles traveling uphill have priority because stopping and restarting on an incline is difficult and hazardous."
  },
  {
    id: 5,
    category: "Traffic Rules",
    question: {
      en: "From which side are you legally required to overtake a vehicle in India?",
      hi: "भारत में किसी वाहन को कानूनी रूप से किस ओर से ओवरटेक करना चाहिए?"
    },
    options: [
      { en: "Left side only", hi: "केवल बाईं ओर से" },
      { en: "Right side of the vehicle being overtaken", hi: "आगे चल रहे वाहन की दाईं ओर से" },
      { en: "Any side with clearance", hi: "जिस तरफ जगह मिले" },
      { en: "Overtaking is not allowed", hi: "ओवरटेक करना मना है" }
    ],
    correctIndex: 1,
    explanation: "According to the Rules of the Road Regulations, overtaking must be done from the right side."
  },
  {
    id: 6,
    category: "Car Rules (LMV)",
    question: {
      en: "During the Automated Driving Test Track (ADTT) gradient test for cars, maximum allowable rollback is:",
      hi: "कारों के लिए स्वचालित ड्राइविंग टेस्ट (ADTT) ढलान टेस्ट के दौरान अधिकतम कितने पीछे लुढ़कने (Rollback) की अनुमति है?"
    },
    options: [
      { en: "15 cm (6 inches)", hi: "15 सेंटीमीटर (6 इंच)" },
      { en: "1 meter", hi: "1 मीटर" },
      { en: "3 feet", hi: "3 फीट" },
      { en: "Unlimited rollback is allowed", hi: "कितना भी पीछे जा सकता है" }
    ],
    correctIndex: 0,
    explanation: "On ADTT gradient tracks, rolling back more than 15 cm triggers sensor fault and results in test failure."
  },
  {
    id: 7,
    category: "Traffic Rules",
    question: {
      en: "What is the maximum validity period of a Learner's Licence in India?",
      hi: "भारत में लर्नर्स लाइसेंस की अधिकतम वैधता अवधि कितनी होती है?"
    },
    options: [
      { en: "30 days", hi: "30 दिन" },
      { en: "3 months", hi: "3 महीने" },
      { en: "6 months (180 days)", hi: "6 महीने (180 दिन)" },
      { en: "1 year", hi: "1 वर्ष" }
    ],
    correctIndex: 2,
    explanation: "A Learner's Licence issued in India is valid for exactly 6 months (180 days) throughout the country."
  },
  {
    id: 8,
    category: "Traffic Rules",
    question: {
      en: "How many days must you hold a Learner's Licence before applying for a permanent DL test?",
      hi: "स्थायी ड्राइविंग लाइसेंस के टेस्ट के लिए आवेदन करने से पहले कितने दिन तक लर्नर्स लाइसेंस होना आवश्यक है?"
    },
    options: [
      { en: "Immediately next day", hi: "अगले ही दिन" },
      { en: "Minimum 30 days (CMVR Rule 15)", hi: "कम से कम 30 दिन (CMVR नियम 15)" },
      { en: "60 days", hi: "60 दिन" },
      { en: "6 months", hi: "6 महीने" }
    ],
    correctIndex: 1,
    explanation: "Under Central Motor Vehicles Rules, an applicant must hold a valid LL for at least 30 days before the DL driving test."
  },
  {
    id: 9,
    category: "Safety",
    question: {
      en: "What is the minimum age to obtain a Learner's Licence for a 50cc gearless two-wheeler?",
      hi: "50cc तक के बिना गियर वाले दोपहिया वाहन के लिए न्यूनतम आयु क्या है?"
    },
    options: [
      { en: "14 years", hi: "14 वर्ष" },
      { en: "16 years (with written parental/guardian consent)", hi: "16 वर्ष (अभिभावक की लिखित सहमति से)" },
      { en: "18 years", hi: "18 वर्ष" },
      { en: "20 years", hi: "20 वर्ष" }
    ],
    correctIndex: 1,
    explanation: "Under Section 4 of the Motor Vehicles Act, 16 years is the minimum age for 50cc engine capacity with parental consent."
  },
  {
    id: 10,
    category: "Two-Wheeler Safety",
    question: {
      en: "Who is legally required to wear a protective helmet on a two-wheeler in India?",
      hi: "भारत में दोपहिया वाहन पर किसे सुरक्षा हेलमेट पहनना कानूनी रूप से अनिवार्य है?"
    },
    options: [
      { en: "Only the rider", hi: "केवल चालक" },
      { en: "Both the rider and the pillion passenger (Section 129)", hi: "चालक और पीछे बैठा यात्री दोनों (धारा 129)" },
      { en: "Only on national highways", hi: "केवल राष्ट्रीय राजमार्ग पर" },
      { en: "Helmets are optional", hi: "हेलमेट वैकल्पिक है" }
    ],
    correctIndex: 1,
    explanation: "Under Section 129 of the MV Act, both rider and pillion passenger must wear certified ISI protective headgear."
  },
  {
    id: 11,
    category: "Car Driving Rules",
    question: {
      en: "When driving at night and approaching an oncoming vehicle from the opposite direction, you must:",
      hi: "रात में गाड़ी चलाते समय सामने से आ रहे वाहन को देखकर आपको क्या करना चाहिए?"
    },
    options: [
      { en: "Flash high beams continuously", hi: "लगातार हाई बीम चमकाएं" },
      { en: "Switch from high beam to low beam (dipper) to avoid blinding the oncoming driver", hi: "हाई बीम से लो बीम (डिपर) पर स्विच करें ताकि सामने वाले की आंखें न चौंधियाएं" },
      { en: "Switch off all lights completely", hi: "सभी लाइटें पूरी तरह बंद कर दें" },
      { en: "Honk horn repeatedly", hi: "लगातार हॉर्न बजाएं" }
    ],
    correctIndex: 1,
    explanation: "Switching to low beam prevents dazzling the opposing driver, avoiding head-on collisions."
  },
  {
    id: 12,
    category: "Safety & Penalties",
    question: {
      en: "What is the permissible blood alcohol content (BAC) limit for private vehicle drivers in India?",
      hi: "भारत में निजी वाहन चालकों के लिए अनुमेय रक्त अल्कोहल सामग्री (BAC) सीमा क्या है?"
    },
    options: [
      { en: "50 mg / 100 ml", hi: "50 मिग्रा / 100 मिली" },
      { en: "30 mg of alcohol per 100 ml of blood (Section 185)", hi: "100 मिली रक्त में अधिकतम 30 मिग्रा अल्कोहल (धारा 185)" },
      { en: "100 mg / 100 ml", hi: "100 मिग्रा / 100 मिली" },
      { en: "Alcohol is permitted at any level", hi: "अल्कोहल की कोई सीमा नहीं है" }
    ],
    correctIndex: 1,
    explanation: "Under Section 185 of the MV Act, BAC exceeding 30mg per 100ml blood constitutes driving under the influence."
  },
  {
    id: 13,
    category: "Car Rules (LMV)",
    question: {
      en: "When is the use of hazard warning flashers (all 4 indicators blinking) legally permitted?",
      hi: "कार की हजार्ड लाइट (चारों इंडिकेटर) का उपयोग कानूनी रूप से कब अनुमेय है?"
    },
    options: [
      { en: "When vehicle is broken down or stopped creating a stationary hazard", hi: "जब वाहन खराब हो गया हो अथवा रुका हुआ खतरा पैदा कर रहा हो" },
      { en: "While driving through rain or fog", hi: "बारिश या कोहरे में गाड़ी चलाते समय" },
      { en: "To drive at high speed to overtake traffic", hi: "ट्रैफिक को ओवरटेक करने के लिए तेज गति से चलते समय" },
      { en: "Inside road tunnels while driving", hi: "सुरंग के भीतर गाड़ी चलाते समय" }
    ],
    correctIndex: 0,
    explanation: "Hazard lights must ONLY be used when stationary due to breakdown or sudden collision hazard, not while driving in rain."
  },
  {
    id: 14,
    category: "Traffic Rules",
    question: {
      en: "At a roundabout, who has the right of way?",
      hi: "गोल चक्कर (Roundabout) पर किसे प्राथमिकता (Right of Way) प्राप्त होती है?"
    },
    options: [
      { en: "Vehicles entering from the left", hi: "बाईं ओर से प्रवेश करने वाले वाहनों को" },
      { en: "Vehicles already circulating inside the roundabout on your right", hi: "दाईं ओर पहले से गोल चक्कर में घूम रहे वाहनों को" },
      { en: "The fastest vehicle", hi: "सबसे तेज गति वाले वाहन को" },
      { en: "Heavy commercial trucks only", hi: "केवल भारी ट्रकों को" }
    ],
    correctIndex: 1,
    explanation: "Vehicles already in the rotary traffic circle on your right have right of way."
  },
  {
    id: 15,
    category: "Safety",
    question: {
      en: "What is the recommended safe following distance behind a vehicle at highway speeds?",
      hi: "राजमार्ग की गति पर आगे चल रहे वाहन से सुरक्षित दूरी बनाए रखने का अनुशंसित नियम क्या है?"
    },
    options: [
      { en: "1 car length at all speeds", hi: "हमेशा 1 कार की दूरी" },
      { en: "The 'Two-Second Rule' in normal dry weather", hi: "सामान्य मौसम में 'दो-सेकंड का नियम' (Two-Second Rule)" },
      { en: "5 feet strictly", hi: "सख्त 5 फीट" },
      { en: "Drive bumper to bumper", hi: "बिल्कुल सटकर चलाएं" }
    ],
    correctIndex: 1,
    explanation: "The two-second rule provides sufficient stopping distance in emergency braking situations."
  }
]

export default mockQuestions
