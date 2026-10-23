export const trafficSigns = [
  {
    id: "sign-stop",
    name: {
      en: "Stop",
      hi: "रुकिए (Stop)"
    },
    description: {
      en: "Bring your vehicle to a complete halt before the stop line.",
      hi: "स्टॉप लाइन से पहले अपने वाहन को पूरी तरह रोकें।"
    },
    category: "Mandatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" fill="#DC2626" stroke="#FFFFFF" stroke-width="4"/><text x="50" y="58" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">STOP</text></svg>`
  },
  {
    id: "sign-give-way",
    name: {
      en: "Give Way",
      hi: "रास्ता दीजिए (Give Way)"
    },
    description: {
      en: "Yield right of way to traffic on the main intersecting road.",
      hi: "मुख्य सड़क पर आ रहे वाहनों को पहले निकलने का रास्ता दें।"
    },
    category: "Mandatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><polygon points="50,90 10,15 90,15" fill="#FFFFFF" stroke="#DC2626" stroke-width="8"/><text x="50" y="42" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#DC2626" text-anchor="middle">GIVE</text><text x="50" y="58" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#DC2626" text-anchor="middle">WAY</text></svg>`
  },
  {
    id: "sign-no-entry",
    name: {
      en: "No Entry / Straight Prohibited",
      hi: "प्रवेश निषेध (No Entry)"
    },
    description: {
      en: "Entry of all motor vehicles is strictly prohibited.",
      hi: "इस सड़क पर सभी प्रकार के वाहनों का प्रवेश पूर्णतः वर्जित है।"
    },
    category: "Mandatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="44" fill="#DC2626" stroke="#FFFFFF" stroke-width="3"/><rect x="18" y="42" width="64" height="16" rx="3" fill="#FFFFFF"/></svg>`
  },
  {
    id: "sign-no-parking",
    name: {
      en: "No Parking",
      hi: "गाड़ी खड़ी करना मना है (No Parking)"
    },
    description: {
      en: "Vehicles must not be parked on this road stretch.",
      hi: "इस मार्ग पर वाहन पार्क करना पूर्णतः मना है।"
    },
    category: "Mandatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="44" fill="#2563EB" stroke="#DC2626" stroke-width="8"/><line x1="20" y1="20" x2="80" y2="80" stroke="#DC2626" stroke-width="8"/></svg>`
  },
  {
    id: "sign-no-stopping",
    name: {
      en: "No Stopping or Standing",
      hi: "रुकना या खड़ा होना मना है"
    },
    description: {
      en: "Neither parking nor momentary stopping is permitted.",
      hi: "यहाँ वाहन को क्षण भर के लिए भी रोकना या खड़ा करना वर्जित है।"
    },
    category: "Mandatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="44" fill="#2563EB" stroke="#DC2626" stroke-width="8"/><line x1="20" y1="20" x2="80" y2="80" stroke="#DC2626" stroke-width="8"/><line x1="80" y1="20" x2="20" y2="80" stroke="#DC2626" stroke-width="8"/></svg>`
  },
  {
    id: "sign-horn-prohibited",
    name: {
      en: "Horn Prohibited (Silence Zone)",
      hi: "हॉर्न बजाना मना है (Silence Zone)"
    },
    description: {
      en: "Do not sound the horn near hospitals, courts, or schools.",
      hi: "अस्पताल, कोर्ट या स्कूल के पास हॉर्न बजाना कानूनी रूप से प्रतिबंधित है।"
    },
    category: "Mandatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" stroke-width="8"/><path d="M28,45 L42,45 L58,32 L58,68 L42,55 L28,55 Z" fill="#1E293B"/><line x1="20" y1="20" x2="80" y2="80" stroke="#DC2626" stroke-width="7"/></svg>`
  },
  {
    id: "sign-speed-limit-50",
    name: {
      en: "Speed Limit 50 km/h",
      hi: "गति सीमा 50 किमी/घंटा"
    },
    description: {
      en: "Maximum permissible vehicle speed is 50 km/h.",
      hi: "इस मार्ग पर अधिकतम गति सीमा 50 किलोमीटर प्रति घंटा है।"
    },
    category: "Mandatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" stroke-width="8"/><text x="50" y="60" font-family="Arial, sans-serif" font-size="34" font-weight="900" fill="#1E293B" text-anchor="middle">50</text></svg>`
  },
  {
    id: "sign-pedestrian-crossing",
    name: {
      en: "Pedestrian Crossing Ahead",
      hi: "पैदल यात्री पार पथ (Zebra Crossing)"
    },
    description: {
      en: "Zebra crossing ahead; give way to pedestrians.",
      hi: "आगे पैदल पार पथ है; पैदल चलने वालों को पहले निकलने दें।"
    },
    category: "Cautionary",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><polygon points="50,10 92,85 8,85" fill="#FFFFFF" stroke="#DC2626" stroke-width="7"/><circle cx="50" cy="38" r="5" fill="#1E293B"/><path d="M48,46 L54,58 L46,74 M46,54 L36,66 M52,52 L62,60" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/><line x1="32" y1="78" x2="68" y2="78" stroke="#1E293B" stroke-width="2.5"/></svg>`
  },
  {
    id: "sign-school-ahead",
    name: {
      en: "School Ahead",
      hi: "आगे स्कूल है (School Ahead)"
    },
    description: {
      en: "Drive with extreme caution; school children nearby.",
      hi: "सावधानी से चलाएं; आगे विद्यालय है और बच्चे सड़क पार कर सकते हैं।"
    },
    category: "Cautionary",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><polygon points="50,10 92,85 8,85" fill="#FFFFFF" stroke="#DC2626" stroke-width="7"/><circle cx="43" cy="38" r="4.5" fill="#1E293B"/><circle cx="58" cy="44" r="4" fill="#1E293B"/><path d="M43,45 L43,62 M40,62 L37,76 M46,62 L49,76" stroke="#1E293B" stroke-width="2.5"/><path d="M58,50 L58,64 M56,64 L53,75 M60,64 L63,75" stroke="#1E293B" stroke-width="2"/></svg>`
  },
  {
    id: "sign-right-hairpin-bend",
    name: {
      en: "Right Hairpin Bend",
      hi: "तीव्र दायां मोड़ (Hairpin Bend)"
    },
    description: {
      en: "Sharp acute curve to the right ahead on the road.",
      hi: "आगे सड़क पर अत्यंत तीव्र दायां मोड़ है; गति धीमी करें।"
    },
    category: "Cautionary",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><polygon points="50,10 92,85 8,85" fill="#FFFFFF" stroke="#DC2626" stroke-width="7"/><path d="M42,75 L42,42 C42,32 58,32 58,42 L58,55" fill="none" stroke="#1E293B" stroke-width="5" stroke-linecap="round"/><polygon points="58,64 51,52 65,52" fill="#1E293B"/></svg>`
  },
  {
    id: "sign-roundabout",
    name: {
      en: "Roundabout Ahead",
      hi: "गोल चक्कर (Roundabout Ahead)"
    },
    description: {
      en: "Rotary intersection ahead; yield to traffic from right.",
      hi: "आगे गोल चक्कर है; दाईं ओर से आ रहे वाहनों को रास्ता दें।"
    },
    category: "Cautionary",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><polygon points="50,10 92,85 8,85" fill="#FFFFFF" stroke="#DC2626" stroke-width="7"/><circle cx="50" cy="54" r="16" fill="none" stroke="#1E293B" stroke-width="4" stroke-dasharray="25 8"/><polygon points="40,38 34,45 42,48" fill="#1E293B"/><polygon points="68,50 64,58 72,58" fill="#1E293B"/></svg>`
  },
  {
    id: "sign-hospital",
    name: {
      en: "Hospital Ahead",
      hi: "अस्पताल (Hospital)"
    },
    description: {
      en: "Emergency hospital nearby; give way to ambulances.",
      hi: "आगे अस्पताल है; एम्बुलेंस को तुरंत रास्ता दें और हॉर्न न बजाएं।"
    },
    category: "Informatory",
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full"><rect x="12" y="12" width="76" height="76" rx="10" fill="#2563EB" stroke="#FFFFFF" stroke-width="3"/><rect x="22" y="22" width="56" height="56" rx="6" fill="#FFFFFF"/><text x="50" y="62" font-family="Arial, sans-serif" font-size="40" font-weight="900" fill="#2563EB" text-anchor="middle">H</text></svg>`
  }
]

export default trafficSigns
