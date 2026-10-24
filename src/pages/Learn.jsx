import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Volume2, BookOpen, Award, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { trafficSigns } from '@/data/signs'
import { useStickyState } from '@/hooks/useStickyState'

export default function Learn() {
  const [lang, setLang] = useStickyState('en', 'app-lang')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')

  const speak = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  const currentLang = lang === 'hi' ? 'hi' : 'en'
  const isHindi = currentLang === 'hi'

  // Filter signs
  const filteredSigns = trafficSigns.filter((sign) => {
    const name = (sign.name[currentLang] || sign.name.en || '').toLowerCase()
    const desc = (sign.description[currentLang] || sign.description.en || '').toLowerCase()
    const query = searchQuery.toLowerCase()
    const matchesSearch = name.includes(query) || desc.includes(query)

    if (activeCategory === 'ALL') return matchesSearch
    if (activeCategory === 'MANDATORY') return matchesSearch && (sign.type?.toLowerCase().includes('mandat') || sign.id.includes('stop') || sign.id.includes('give') || sign.id.includes('no-entry'))
    if (activeCategory === 'CAUTIONARY') return matchesSearch && (sign.type?.toLowerCase().includes('caut') || sign.id.includes('curve') || sign.id.includes('pedestrian'))
    return matchesSearch
  })

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium">
          <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'मुख्य पृष्ठ' : 'Back to Home'}
        </Link>
        <button
          onClick={() => setLang(currentLang === 'en' ? 'hi' : 'en')}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {isHindi ? 'Switch to English' : 'हिंदी में देखें'}
        </button>
      </div>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isHindi ? 'भारतीय आरटीओ सड़क संकेत निर्देशिका' : 'Indian RTO Mandatory Road Signs Repository'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isHindi ? 'यातायात संकेत एवं ऑडियो अभ्यास' : 'Master Traffic Signs & Audio Pronunciation'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {isHindi 
            ? 'भारतीय मोटर वाहन अधिनियम के तहत निर्धारित अनिवार्य, चेतावनी एवं सूचनात्मक सड़क संकेत सीखें। किसी भी संकेत की व्याख्या सुनने हेतु स्पीकर आइकन दबाएं।' 
            : 'Explore mandatory regulatory, cautionary warning, and informatory road signs with bilingual audio narration for your STALL computer test.'}
        </p>
      </div>

      {/* Quick Action Cards on Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/mock-test" className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800/80 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {isHindi ? 'ऑनलाइन मॉक टेस्ट (STALL)' : 'Take RTO STALL Mock Exam'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isHindi ? '15 प्रश्न • 30 सेकंड टाइमर • तत्काल परिणाम' : '15 official questions with real-time 30s countdown'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">Start →</span>
        </Link>

        <Link to="/permanent-dl" className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800/80 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                {isHindi ? 'स्थायी लाइसेंस एवं ADTT ट्रैक गाइड' : 'Permanent DL & ADTT Track Guide'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isHindi ? '30 दिन का नियम एवं ऑटोमेटेड टेस्ट ट्रैक' : 'Rule 15 (30-day wait) & incline parking guide'}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">Explore →</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi ? 'सड़क संकेत नाम या प्रकार खोजें...' : 'Search signs by name, e.g. Stop, Speed, Turn...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            All Signs ({trafficSigns.length})
          </button>
          <button
            onClick={() => setActiveCategory('MANDATORY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'MANDATORY' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            Mandatory
          </button>
          <button
            onClick={() => setActiveCategory('CAUTIONARY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeCategory === 'CAUTIONARY' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            Cautionary
          </button>
        </div>
      </div>

      {/* Responsive Grid for Traffic Signs (3 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredSigns.map((sign, i) => (
          <motion.div 
            key={sign.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
          >
            <div 
              className="w-16 h-16 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700/60 group-hover:scale-105 transition-transform" 
              dangerouslySetInnerHTML={{ __html: sign.svg }} 
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                {sign.name[currentLang] || sign.name.en}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {sign.description[currentLang] || sign.description.en}
              </p>
            </div>
            <button 
              onClick={() => speak(`${sign.name[currentLang] || sign.name.en}. ${sign.description[currentLang] || sign.description.en}`)}
              className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white active:scale-95 transition-all shrink-0"
              title="Listen pronunciation"
              aria-label="Listen audio explanation"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
