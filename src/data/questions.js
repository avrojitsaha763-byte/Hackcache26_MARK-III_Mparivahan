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
    category: "Road Signs",
    question: {
      en: "What does a circular sign with a horn crossed by a red diagonal line mean?",
      hi: "एक लाल तिरछी रेखा से कटे हुए हॉर्न वाले गोलाकार संकेत का क्या अर्थ है?"
    },
    options: [
      { en: "Compulsory sound horn", hi: "हॉर्न बजाना अनिवार्य है" },
      { en: "Horn prohibited (Silence Zone)", hi: "हॉर्न बजाना वर्जित है (साइलेंस जोन)" },
      { en: "Accident prone area", hi: "दुर्घटना संभावित क्षेत्र" },
      { en: "Toll plaza ahead", hi: "आगे टोल प्लाजा है" }
    ],
    correctIndex: 1,
    explanation: "Horn prohibited signs are placed near hospitals, educational institutions, and courts."
  },
  {
    id: 4,
    category: "Road Signs",
    question: {
      en: "What does a triangular warning sign with a pedestrian figure indicate?",
      hi: "पैदल यात्री आकृति वाला त्रिकोणीय चेतावनी संकेत क्या दर्शाता है?"
    },
    options: [
      { en: "Pedestrians prohibited", hi: "पैदल चलना मना है" },
      { en: "Pedestrian Crossing Ahead (Zebra Crossing)", hi: "आगे पैदल यात्री पार पथ है" },
      { en: "Footpath ends", hi: "फुटपाथ समाप्त" },
      { en: "Jogging track ahead", hi: "आगे जॉगिंग ट्रैक है" }
    ],
    correctIndex: 1,
    explanation: "Warns drivers to slow down and prepare to yield to pedestrians crossing the road."
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
    category: "Traffic Rules",
    question: {
      en: "When an emergency ambulance approaches with flashing lights and siren, you must:",
      hi: "जब कोई आपातकालीन एम्बुलेंस सायरन बजाते हुए पीछे से आए, तो आपको क्या करना चाहिए?"
    },
    options: [
      { en: "Maintain current lane and speed", hi: "अपनी गति और लेन बनाए रखें" },
      { en: "Speed up to clear the road", hi: "आगे निकलकर रास्ता खाली करें" },
      { en: "Move to the left side and come to a stop to give clear passage", hi: "तुरंत बाईं ओर मुड़कर रास्ता दें और रुकें" },
      { en: "Honk repeatedly", hi: "लगातार हॉर्न बजाएं" }
    ],
    correctIndex: 2,
    explanation: "Under Section 194E of the MV Act, failure to give free passage to emergency vehicles attracts heavy penalties."
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
      { en: "6 months", hi: "6 महीने" },
      { en: "1 year", hi: "1 वर्ष" }
    ],
    correctIndex: 2,
    explanation: "A Learner's Licence issued in India is valid for exactly 6 months throughout the country."
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
      { en: "Minimum 30 days", hi: "कम से कम 30 दिन" },
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
    category: "Safety",
    question: {
      en: "Who is legally required to wear a protective helmet on a two-wheeler in India?",
      hi: "भारत में दोपहिया वाहन पर किसे सुरक्षा हेलमेट पहनना कानूनी रूप से अनिवार्य है?"
    },
    options: [
      { en: "Only the rider", hi: "केवल चालक" },
      { en: "Both the rider and the pillion passenger", hi: "चालक और पीछे बैठा यात्री दोनों" },
      { en: "Only on national highways", hi: "केवल राष्ट्रीय राजमार्ग पर" },
      { en: "Helmets are optional", hi: "हेलमेट वैकल्पिक है" }
    ],
    correctIndex: 1,
    explanation: "Under Section 129 of the MV Act, both rider and pillion passenger must wear certified protective headgear."
  },
  {
    id: 11,
    category: "Traffic Rules",
    question: {
      en: "A flashing red traffic signal light at an intersection signifies:",
      hi: "चौराहे पर चमकती लाल बत्ती (Flashing Red) का क्या अर्थ है?"
    },
    options: [
      { en: "Traffic light is defective; proceed without looking", hi: "सिग्नल खराब है, बिना देखे आगे बढ़ें" },
      { en: "Stop completely, check for traffic, and proceed only when safe", hi: "पूरी तरह रुकें, दोनों तरफ देखें और सुरक्षित होने पर ही आगे बढ़ें" },
      { en: "Slow down to 20 km/h", hi: "गति 20 किमी/घंटा करें" },
      { en: "Road closed ahead", hi: "आगे रास्ता बंद है" }
    ],
    correctIndex: 1,
    explanation: "A flashing red light functions as a STOP sign: stop completely and proceed only when clear."
  },
  {
    id: 12,
    category: "Safety",
    question: {
      en: "What is the permissible blood alcohol content (BAC) limit for driving in India?",
      hi: "भारत में वाहन चलाने के लिए अनुमेय रक्त अल्कोहल सामग्री (BAC) सीमा क्या है?"
    },
    options: [
      { en: "50 mg / 100 ml", hi: "50 मिग्रा / 100 मिली" },
      { en: "30 mg of alcohol per 100 ml of blood", hi: "100 मिली रक्त में अधिकतम 30 मिग्रा अल्कोहल" },
      { en: "100 mg / 100 ml", hi: "100 मिग्रा / 100 मिली" },
      { en: "Alcohol is permitted at any level", hi: "अल्कोहल की कोई सीमा नहीं है" }
    ],
    correctIndex: 1,
    explanation: "Under Section 185 of the MV Act, BAC exceeding 30mg per 100ml blood constitutes driving under the influence."
  },
  {
    id: 13,
    category: "Road Signs",
    question: {
      en: "A circular sign with a blue background and a red cross (X) indicates:",
      hi: "नीले रंग की पृष्ठभूमि पर लाल क्रॉस (X) वाला गोलाकार संकेत क्या दर्शाता है?"
    },
    options: [
      { en: "No Entry", hi: "प्रवेश निषेध" },
      { en: "No Stopping or Standing", hi: "रुकना या खड़ा होना सख्त मना है" },
      { en: "First Aid Station", hi: "प्राथमिक चिकित्सा केंद्र" },
      { en: "Intersection Ahead", hi: "आगे चौराहा है" }
    ],
    correctIndex: 1,
    explanation: "Red X on blue background signifies No Stopping or Standing under any circumstance."
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
