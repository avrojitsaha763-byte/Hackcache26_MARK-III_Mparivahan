'use client'
import { motion } from 'framer-motion'
import { ChevronLeft, Volume2 } from 'lucide-react'
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

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Link>
        <button
          onClick={() => setLang(currentLang === 'en' ? 'hi' : 'en')}
          className="px-3 py-1 text-xs font-semibold rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          {currentLang === 'hi' ? 'English' : 'हिंदी'}
        </button>
      </div>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-900 mb-6">
        {currentLang === 'hi' ? 'यातायात संकेत सीखें' : 'Learn Traffic Signs'}
      </motion.h1>

      <div className="grid grid-cols-1 gap-4">
        {trafficSigns.map((sign, i) => (
          <motion.div 
            key={sign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border-2 border-slate-100 p-4 rounded-xl flex items-center gap-4 shadow-sm hover:border-slate-200 transition-colors"
          >
            <div 
              className="w-16 h-16 shrink-0 bg-slate-50 rounded-lg flex items-center justify-center p-2" 
              dangerouslySetInnerHTML={{ __html: sign.svg }} 
            />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{sign.name[currentLang] || sign.name.en}</h3>
              <p className="text-xs text-slate-500 mt-1">{sign.description[currentLang] || sign.description.en}</p>
            </div>
            <button 
              onClick={() => speak(`${sign.name[currentLang] || sign.name.en}. ${sign.description[currentLang] || sign.description.en}`)}
              className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 active:scale-95 transition-all"
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
