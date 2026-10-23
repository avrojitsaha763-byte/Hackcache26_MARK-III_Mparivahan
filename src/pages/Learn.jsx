'use client'
import { motion } from 'framer-motion'
import { ChevronLeft, Volume2, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { trafficSigns } from '@/data/signs'
import { useStickyState } from '@/hooks/useStickyState'

export default function Learn() {
  const [lang, setLang] = useStickyState('en', 'app-lang')

  const speak = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Stop any previous ongoing audio
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  const currentLang = lang === 'hi' ? 'hi' : 'en'
  const isHindi = currentLang === 'hi'

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <button
          onClick={() => setLang(currentLang === 'en' ? 'hi' : 'en')}
          className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {isHindi ? 'English' : 'हिंदी'}
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isHindi ? 'यातायात संकेत एवं मॉक टेस्ट' : 'Learn Traffic Signs & Mock Test'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isHindi ? 'भारतीय आरटीओ परीक्षा के लिए महत्वपूर्ण संकेत सीखें।' : 'Master Indian RTO road signs and test your knowledge.'}
        </p>
      </motion.div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/mock-test" className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl flex flex-col justify-between hover:border-blue-500 transition-all">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-xs mb-1">
            <BookOpen className="w-4 h-4" /> {isHindi ? 'मॉक टेस्ट' : 'Mock Test'}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {isHindi ? '15 प्रश्न • 30 सेकंड' : '15 Questions • 30s'}
          </span>
        </Link>
        <Link href="/permanent-dl" className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl flex flex-col justify-between hover:border-purple-500 transition-all">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs mb-1">
            <Award className="w-4 h-4" /> {isHindi ? 'स्थायी लाइसेंस' : 'Permanent DL'}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            {isHindi ? '30 दिन का नियम' : '30-Day ADTT Rule'}
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trafficSigns.map((sign, i) => (
          <motion.div 
            key={sign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <div 
              className="w-16 h-16 shrink-0 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center p-2" 
              dangerouslySetInnerHTML={{ __html: sign.svg }} 
            />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">{sign.name[currentLang] || sign.name.en}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sign.description[currentLang] || sign.description.en}</p>
            </div>
            <button 
              onClick={() => speak(`${sign.name[currentLang] || sign.name.en}. ${sign.description[currentLang] || sign.description.en}`)}
              className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 active:scale-95 transition-all"
              title="Listen pronunciation"
              aria-label="Listen audio explanation"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
