// Vercel Serverless Function: /api/signs
// Traffic signs repository for STALL learner guidance

const TRAFFIC_SIGNS = [
  {
    id: "sign-stop",
    name: { en: "Stop", hi: "रुकिए (Stop)" },
    description: { en: "Bring your vehicle to a complete halt before the stop line.", hi: "स्टॉप लाइन से पहले अपने वाहन को पूरी तरह रोकें।" },
    category: "Mandatory"
  },
  {
    id: "sign-give-way",
    name: { en: "Give Way", hi: "रास्ता दीजिए (Give Way)" },
    description: { en: "Yield right of way to traffic on the main intersecting road.", hi: "मुख्य सड़क पर आ रहे वाहनों को पहले निकलने का रास्ता दें।" },
    category: "Mandatory"
  },
  {
    id: "sign-no-entry",
    name: { en: "No Entry", hi: "प्रवेश निषेध (No Entry)" },
    description: { en: "Vehicles are strictly prohibited from entering this road.", hi: "इस सड़क पर वाहनों का प्रवेश पूर्णतः वर्जित है।" },
    category: "Mandatory"
  },
  {
    id: "sign-speed-50",
    name: { en: "Speed Limit 50 km/h", hi: "अधिकतम गति 50 किमी/घंटा" },
    description: { en: "Maximum legal speed allowed under Section 112 is 50 km/h.", hi: "धारा 112 के तहत अधिकतम कानूनी गति सीमा 50 किमी/घंटा है।" },
    category: "Mandatory"
  },
  {
    id: "sign-pedestrian-crossing",
    name: { en: "Pedestrian Crossing Ahead", hi: "आगे पैदल पार पथ है" },
    description: { en: "Slow down and yield to pedestrians crossing at the zebra crossing.", hi: "गति धीमी करें और ज़ेबरा क्रॉसिंग पर पैदल यात्रियों को रास्ता दें।" },
    category: "Cautionary"
  },
  {
    id: "sign-roundabout",
    name: { en: "Roundabout Ahead", hi: "आगे गोल चक्कर है" },
    description: { en: "Prepare to merge with circulating traffic on your right.", hi: "अपने दाईं ओर घूम रहे यातायात को रास्ता देने के लिए तैयार रहें।" },
    category: "Cautionary"
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

  const { category } = req.query;
  let signs = [...TRAFFIC_SIGNS];

  if (category && category !== 'ALL') {
    signs = signs.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  return res.status(200).json({
    status: 'success',
    count: signs.length,
    data: signs
  });
}
