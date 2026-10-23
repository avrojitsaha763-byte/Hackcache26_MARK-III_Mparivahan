'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, ShieldAlert, Car, Bike, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useStickyState } from '@/hooks/useStickyState'

export default function PermanentDL() {
  const [lang] = useStickyState('en', 'app-lang')
  const [selectedTrack, setSelectedTrack] = useState('car')
  const isHindi = lang === 'hi'

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
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'वापस' : 'Back'}
      </Link>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {isHindi ? 'स्थायी ड्राइविंग लाइसेंस (DL) गाइड' : 'Permanent Driving Licence Guide'}
      </motion.h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        {isHindi ? 'केंद्रीय मोटर वाहन नियम (CMVR) एवं स्वचालित ड्राइविंग टेस्ट ट्रैक (ADTT) नियम:' : 'Official guidelines under Central Motor Vehicles Rules & Automated Test Tracks:'}
      </p>

      {/* Statutory 30-Day Rule Alert */}
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-6 dark:bg-orange-950/30 dark:border-orange-800/50">
        <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-semibold mb-2 text-sm">
          <Calendar className="w-5 h-5" /> {isHindi ? '30 दिन की अनिवार्य प्रतीक्षा (नियम 15)' : '30-Day Mandatory Rule (CMVR)'}
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-200 leading-relaxed">
          {isHindi 
            ? 'लर्नर्स लाइसेंस (फॉर्म 3) जारी होने के 30 दिन बाद ही आप स्थायी ड्राइविंग टेस्ट के लिए स्लॉट बुक कर सकते हैं। यह 180 दिन (6 महीने) तक वैध रहता है।' 
            : "Under Rule 15 of CMVR, you must hold a valid Form 3 Learner's Licence for minimum 30 days before taking the practical test. Valid for 180 days."}
        </p>
      </div>

      {/* Vehicle Track Selector */}
      <div className="mb-6">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSelectedTrack('car')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedTrack === 'car'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4" /> {isHindi ? 'कार टेस्ट ट्रैक (LMV)' : 'Car Track (LMV)'}
          </button>
          <button
            onClick={() => setSelectedTrack('bike')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedTrack === 'bike'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <Bike className="w-4 h-4" /> {isHindi ? 'बाइक टेस्ट ट्रैक (MCWG)' : 'Bike Track (MCWG)'}
          </button>
        </div>
      </div>

      {/* Specific ADTT Track Skills */}
      <div className="mb-6 space-y-3">
        <h2 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          {selectedTrack === 'car' ? <Car className="w-4 h-4 text-blue-500" /> : <Bike className="w-4 h-4 text-blue-500" />}
          {selectedTrack === 'car' 
            ? (isHindi ? 'कार (LMV) स्वचालित ट्रैक टेस्ट कौशल:' : 'Car (LMV) Automated Test Track Skills:')
            : (isHindi ? 'बाइक (MCWG) स्वचालित ट्रैक टेस्ट कौशल:' : 'Bike (MCWG) Automated Test Track Skills:')}
        </h2>

        {(selectedTrack === 'car' ? carTrackSkills : bikeTrackSkills).map((skill, idx) => (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="font-semibold text-xs text-slate-900 dark:text-white mb-1">
              {skill.title}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              {skill.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Mandatory Document Checklist */}
      <div>
        <h2 className="font-semibold text-sm mb-3 text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-blue-500" />
          {isHindi ? 'आरटीओ टेस्ट दिन आवश्यक दस्तावेज' : 'RTO Test Day Required Documents'}
        </h2>
        <ul className="space-y-2">
          {generalChecklist.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 p-3 border rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>{isHindi ? item.hi : item.en}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
