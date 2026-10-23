'use client'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useStickyState } from '@/hooks/useStickyState'

export default function PermanentDL() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const checklist = [
    {
      en: "Valid Learner's Licence (Form 3)",
      hi: "वैध लर्नर्स लाइसेंस (फॉर्म 3)"
    },
    {
      en: "Vehicle with valid RC, PUC & Insurance",
      hi: "वैध आरसी, प्रदूषण (PUC) एवं बीमा युक्त वाहन"
    },
    {
      en: "ISI Certified Helmet (for two-wheelers)",
      hi: "आईएसआई प्रमाणित हेलमेट (दोपहिया हेतु)"
    },
    {
      en: "Properly functioning Seatbelt (for LMV cars)",
      hi: "कार्यशील सीटबेल्ट (चार पहिया/कार हेतु)"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'वापस' : 'Back'}
      </Link>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {isHindi ? 'स्थायी ड्राइविंग लाइसेंस (DL)' : 'Permanent Driving Licence'}
      </motion.h1>

      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6 dark:bg-orange-950/30 dark:border-orange-800/50">
        <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-semibold mb-2">
          <Calendar className="w-5 h-5" /> {isHindi ? '30 दिन की अनिवार्य प्रतीक्षा (नियम 15)' : '30-Day Mandatory Rule (CMVR)'}
        </div>
        <p className="text-sm text-orange-700 dark:text-orange-200">
          {isHindi 
            ? 'लर्नर्स लाइसेंस जारी होने के 30 दिन बाद ही आप स्थायी ड्राइविंग टेस्ट (ADTT) के लिए स्लॉट बुक कर सकते हैं। यह 6 महीने तक वैध रहता है।' 
            : "You must wait 30 days after your Learner's Licence is issued before taking the permanent driving test. It is valid for 6 months."}
        </p>
      </div>

      <h2 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">
        {isHindi ? 'ड्राइविंग टेस्ट (ADTT) चेकलिस्ट' : 'Driving Test (ADTT) Checklist'}
      </h2>
      <ul className="space-y-3">
        {checklist.map((item, i) => (
          <li key={i} className="flex items-center gap-3 p-3 border rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 dark:text-slate-200">
            <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0" />
            <span className="text-sm font-medium">{isHindi ? item.hi : item.en}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
