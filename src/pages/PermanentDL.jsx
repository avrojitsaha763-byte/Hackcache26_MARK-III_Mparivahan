'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  Calendar, 
  ShieldAlert, 
  Car, 
  Bike, 
  CheckCircle2, 
  Clock, 
  Ticket, 
  Download,
  AlertCircle,
  FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

export default function PermanentDL() {
  const [lang] = useStickyState('en', 'app-lang')
  const [selectedTrack, setSelectedTrack] = useState('car')
  const [rtoGround, setRtoGround] = useState('IDTR-DELHI')
  const [slotTime, setSlotTime] = useState('09:30 AM - 11:00 AM')
  const [appointmentBooked, setAppointmentBooked] = useState(false)
  const isHindi = lang === 'hi'

  // Calculate earliest eligible DL test date (Today + 30 days per CMVR Rule 15)
  const getEarliestDate = () => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  }

  const [testDate, setTestDate] = useState(getEarliestDate)

  const generalChecklist = [
    {
      en: "Valid Form 3 Learner's Licence (held for minimum 30 days)",
      hi: "वैध फॉर्म 3 लर्नर्स लाइसेंस (न्यूनतम 30 दिन पुराना)"
    },
    {
      en: "Vehicle Registration Certificate (RC), valid Insurance & PUC",
      hi: "मूल आरसी, वैध बीमा पॉलिसी एवं प्रदूषण प्रमाण पत्र (PUC)"
    },
    {
      en: "Form 4 Application receipt & Test Slot Appointment slip",
      hi: "फॉर्म 4 आवेदन रसीद एवं स्लॉट बुकिंग पुष्टि पर्ची"
    }
  ]

  const carTrackSkills = [
    {
      title: isHindi ? "1. अप-हिल ग्रेडिएंट टेस्ट (ढलान पर रुकना एवं चलना)" : "1. Up-Hill Gradient Test (Incline Restart)",
      desc: isHindi 
        ? "1:6 ढलान पर वाहन रोकें, हैंडब्रेक लगाएं और क्लच नियंत्रित कर बिना 15 सेमी से अधिक पीछे लुढ़के आगे बढ़ें।" 
        : "Halt on a 1:6 slope, engage parking brake, and resume climb without rolling back more than 15 cm (6 inches)."
    },
    {
      title: isHindi ? "2. समानांतर पार्किंग (Parallel Parking)" : "2. Parallel Parking Test",
      desc: isHindi 
        ? "बिना खंभों या सेंसर को छुए 3 मिनट के भीतर रिवर्स गियर में सटीक पार्किंग स्लॉट में कार खड़ी करें।" 
        : "Reverse park into a designated bay within 3 minutes without striking side curbs or sensor boundary poles."
    },
    {
      title: isHindi ? "3. रिवर्स 'एस' एवं 'एच' ट्रैक नेविगेशन" : "3. Reverse 'S' & 'H' Track Navigation",
      desc: isHindi 
        ? "सेंसर से सुसज्जित ट्रैक पर आगे और पीछे की दिशा में बिना कर्ब छुए वाहन को नियंत्रित करें।" 
        : "Maneuver forward and reverse along curved sensor-monitored paths without touching track boundaries."
    },
    {
      title: isHindi ? "4. अनिवार्य सीटबेल्ट एवं मिरर एडजस्टमेंट" : "4. Compulsory Seatbelt & Mirror Check",
      desc: isHindi 
        ? "टेस्ट शुरू होने से पूर्व सीटबेल्ट बांधना एवं रियर-व्यू मिरर एडजस्ट करना अनिवार्य है।" 
        : "Fastening the 3-point seatbelt and checking rear-view mirrors before moving is legally mandatory."
    }
  ]

  const bikeTrackSkills = [
    {
      title: isHindi ? "1. '8' आकृति ट्रैक टेस्ट (Figure 8)" : "1. Figure '8' Serpentine Track",
      desc: isHindi 
        ? "बिना पैर जमीन पर रखे और बिना सफेद सेंसर रेखाओं को पार किए '8' आकृति का चक्कर पूर्ण करें।" 
        : "Complete the continuous figure '8' loop without putting feet down or touching boundary sensor lines."
    },
    {
      title: isHindi ? "2. आपातकालीन ब्रेकिंग टेस्ट (Emergency Stop)" : "2. Emergency Braking Test",
      desc: isHindi 
        ? "लाल सिग्नल दिखते ही 15 मीटर के बॉक्स के भीतर वाहन को बिना स्किड किए सुरक्षित रोकें।" 
        : "Bring motorcycle to a smooth stop inside the designated 15m box upon red signal without skidding."
    },
    {
      title: isHindi ? "3. धीमी गति संतुलन एवं लेन नियंत्रण" : "3. Slow Speed Balance & Lane Discipline",
      desc: isHindi 
        ? "संकीर्ण ट्रैक पर धीमी गति में क्लच और थ्रॉटल का उचित संतुलन बनाए रखें।" 
        : "Demonstrate steady low-speed balance and throttle control along narrow straight obstacle tracks."
    },
    {
      title: isHindi ? "4. आईएसआई प्रमाणित हेलमेट (ISI 4151)" : "4. ISI Certified Helmet Compulsory",
      desc: isHindi 
        ? "चिन-स्ट्रैप लॉक सहित आईएसआई मार्क वाला हेलमेट पहनना अनिवार्य है।" 
        : "Wearing a Bureau of Indian Standards (ISI 4151) helmet with chinstrap fastened is mandatory."
    }
  ]

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6">
      <Link to="/" className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-full text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
          <Car className="w-3.5 h-3.5" />
          <span>{isHindi ? 'स्थायी ड्राइविंग लाइसेंस (फॉर्म 4) गाइड' : 'Permanent Driving Licence (Form 4) & ADTT Portal'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isHindi ? 'स्थायी DL गाइड एवं ADTT स्लॉट बुकिंग' : 'Permanent DL Guide & Automated Track Booking'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {isHindi 
            ? 'केंद्रीय मोटर वाहन नियम (CMVR) नियम 15 के अनुसार 30-दिन की अनिवार्य प्रतीक्षा अवधि पूर्ण कर स्वचालित टेस्ट ट्रैक (ADTT) पर प्रैक्टिकल ड्राइविंग टेस्ट स्लॉट बुक करें।' 
            : 'Comply with the statutory 30-day holding period under CMVR Rule 15 and prepare for Automated Driving Test Tracks (ADTT).'}
        </p>
      </div>

      {/* Main Grid: Slot Booking on Left, Track Skills on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Slot Booking & Rule 15 Advisory (7 Cols on Desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Statutory 30-Day Rule Alert */}
          <div className="p-5 bg-amber-50/80 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/60 rounded-3xl">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold mb-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isHindi ? '30 दिन की अनिवार्य प्रतीक्षा (नियम 15 CMVR)' : 'Mandatory 30-Day Waiting Rule (CMVR Rule 15)'}</span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              {isHindi 
                ? 'लर्नर्स लाइसेंस (फॉर्म 3) जारी होने के 30 दिन बाद ही आप स्थायी ड्राइविंग टेस्ट के लिए स्लॉट बुक कर सकते हैं। यह 180 दिन (6 महीने) तक वैध रहता है।' 
                : "Under Rule 15 of CMVR, you must hold a valid Form 3 Learner's Licence for minimum 30 days before taking the practical driving test. Valid for 180 days."}
            </p>
          </div>

          {/* Interactive Driving Test Slot Booking Card */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm sm:text-base pb-3 border-b border-slate-100 dark:border-slate-800">
              <Clock className="w-4 h-4" /> 
              <span>{isHindi ? 'ड्राइविंग टेस्ट स्लॉट बुक करें (ADTT)' : 'Book Driving Test Slot (ADTT / RTO Ground)'}</span>
            </div>

            {!appointmentBooked ? (
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'स्वचालित टेस्ट ट्रैक केंद्र (ADTT Center)' : 'Select ADTT Ground Center'}
                  </label>
                  <select
                    value={rtoGround}
                    onChange={(e) => setRtoGround(e.target.value)}
                    className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none focus:border-blue-600"
                  >
                    <option value="IDTR-DELHI">Delhi — IDTR Automated Track (Mayur Vihar)</option>
                    <option value="ADTT-BLR">Karnataka — Koramangala Automated Track (Bengaluru)</option>
                    <option value="ADTT-MUM">Maharashtra — Tardeo Automated Track (Mumbai)</option>
                    <option value="ADTT-KOL">West Bengal — Kasba / Beltala Automated Ground</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'टेस्ट तिथि (30 दिन बाद)' : 'Earliest Eligible Date (30d+)'}
                    </label>
                    <input
                      type="date"
                      value={testDate}
                      min={getEarliestDate()}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none font-mono text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'समय स्लॉट' : 'Time Slot'}
                    </label>
                    <select
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-800 dark:text-white outline-none text-xs sm:text-sm"
                    >
                      <option value="09:30 AM - 11:00 AM">09:30 AM - 11:00 AM</option>
                      <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
                      <option value="02:00 PM - 03:30 PM">02:00 PM - 03:30 PM</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={() => setAppointmentBooked(true)}
                  className="w-full h-12 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-2 shadow-lg shadow-blue-600/20"
                >
                  {isHindi ? 'स्लॉट बुक करें एवं पर्ची देखें' : 'Confirm Slot & Generate Appointment Slip'}
                </Button>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-2 border-emerald-500 rounded-2xl space-y-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-sm">
                      <Ticket className="w-4 h-4" /> {isHindi ? 'स्लॉट बुकिंग पुष्टि (Form 4)' : 'Confirmed Slot (Form 4 Slip)'}
                    </span>
                    <span className="font-mono text-xs bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full text-emerald-800 dark:text-emerald-300 font-bold">
                      SLOT-2026-9812
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">{isHindi ? 'परीक्षण केंद्र:' : 'Track Center:'}</span>
                    <strong className="text-slate-900 dark:text-white">{rtoGround}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400">{isHindi ? 'निर्धारित तिथि व समय:' : 'Scheduled Date & Time:'}</span>
                    <strong className="text-slate-900 dark:text-white">{testDate} ({slotTime})</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">{isHindi ? 'स्थिति:' : 'Status:'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Ready for Practical ADTT</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setAppointmentBooked(false)}
                  className="w-full h-10 text-xs rounded-xl font-semibold"
                >
                  {isHindi ? 'स्लॉट तिथि या समय बदलें' : 'Reschedule Slot'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: ADTT Track Skills & Document Checklist (5 Cols on Desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vehicle Track Selector */}
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex">
            <button
              onClick={() => setSelectedTrack('car')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                selectedTrack === 'car'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" /> {isHindi ? 'कार ADTT ट्रैक (LMV)' : 'Car ADTT Track (LMV)'}
            </button>
            <button
              onClick={() => setSelectedTrack('bike')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                selectedTrack === 'bike'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" /> {isHindi ? 'बाइक ट्रैक (MCWG)' : 'Bike Figure 8 (MCWG)'}
            </button>
          </div>

          {/* Specific ADTT Track Skills */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              {selectedTrack === 'car' ? <Car className="w-4 h-4 text-blue-500" /> : <Bike className="w-4 h-4 text-blue-500" />}
              {selectedTrack === 'car' 
                ? (isHindi ? 'कार (LMV) स्वचालित ट्रैक टेस्ट कौशल:' : 'Car (LMV) Automated Test Track Skills:')
                : (isHindi ? 'बाइक (MCWG) स्वचालित ट्रैक टेस्ट कौशल:' : 'Bike (MCWG) Automated Test Track Skills:')}
            </h3>

            {(selectedTrack === 'car' ? carTrackSkills : bikeTrackSkills).map((skill, idx) => (
              <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">
                  {skill.title}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {skill.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Mandatory Test Day Document Checklist */}
          <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{isHindi ? 'टेस्ट दिन अनिवार्य दस्तावेज चेकलिस्ट' : 'RTO Test Day Mandatory Documents'}</span>
            </h3>
            <ul className="space-y-2">
              {generalChecklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{isHindi ? item.hi : item.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
