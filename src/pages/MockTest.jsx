'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Award, Clock, RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { mockQuestions } from '@/data/questions'
import { useStickyState } from '@/hooks/useStickyState'

export default function MockTest() {
  const [lang] = useStickyState('en', 'app-lang')
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isFinished, setIsFinished] = useState(false)

  const handleAnswer = useCallback((index) => {
    if (mockQuestions[currentQ] && index === mockQuestions[currentQ].correctIndex) {
      setScore((prev) => prev + 1)
    }
    
    if (currentQ + 1 < mockQuestions.length) {
      setCurrentQ((prev) => prev + 1)
      setTimeLeft(30)
    } else {
      setIsFinished(true)
    }
  }, [currentQ])

  useEffect(() => {
    if (isFinished) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(-1)
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isFinished, handleAnswer])

  const isHindi = lang === 'hi'

  if (isFinished) {
    const passed = score >= 9
    return (
      <div className="w-full max-w-2xl mx-auto py-8 sm:py-16 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner ${
            passed 
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
              : 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
          }`}>
            {passed ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {isHindi ? 'आरटीओ ऑनलाइन परीक्षा परिणाम' : 'Sarathi STALL Online Exam Result'}
          </h1>

          <div className={`text-5xl sm:text-6xl font-extrabold my-4 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {score} / {mockQuestions.length}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
            {isHindi ? 'उत्तीर्ण मानक: न्यूनतम 9 / 15 अंक (60%)' : 'Official Passing Benchmark: 9 / 15 (60% minimum)'}
          </p>

          <h2 className="text-base sm:text-lg font-bold mb-8 text-slate-800 dark:text-slate-200">
            {passed 
              ? (isHindi ? '🎉 बधाई! आप आरटीओ लर्नर्स लाइसेंस ऑनलाइन परीक्षा हेतु पूर्णतः तैयार हैं।' : '🎉 Passed! You have mastered the rules and are ready for the official RTO online test.') 
              : (isHindi ? '❌ अनुत्तीर्ण। कृपया यातायात संकेत एवं नियमों का पुनः अभ्यास करें।' : '❌ Did not pass. Review the traffic signs guide and try again.')}
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => {
                setCurrentQ(0)
                setScore(0)
                setTimeLeft(30)
                setIsFinished(false)
              }}
              variant="outline"
              className="flex-1 h-12 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> {isHindi ? 'पुनः टेस्ट दें' : 'Retake Test'}
            </Button>
            <Link to="/" className="flex-1">
              <Button className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> {isHindi ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const question = mockQuestions[currentQ]
  const currentLang = isHindi ? 'hi' : 'en'

  return (
    <div className="w-full max-w-3xl mx-auto py-4 sm:py-6">
      <Link to="/" className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'वापस' : 'Back to Home'}
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg">
        {/* Exam Console Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
              SARATHI STALL SIMULATOR
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {isHindi ? `प्रश्न संख्या: ${currentQ + 1} / ${mockQuestions.length}` : `Question ${currentQ + 1} of ${mockQuestions.length}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
            <span className={`text-2xl font-mono font-extrabold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-slate-100'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Question Counter Progress Line */}
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / mockQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Content */}
        <motion.div key={currentQ} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg sm:text-2xl font-bold mb-6 leading-relaxed text-slate-900 dark:text-white">
            {question?.question?.[currentLang] || question?.question?.en || 'Question'}
          </h2>

          <div className="space-y-3">
            {question?.options?.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => handleAnswer(i)}
                className="w-full p-4 text-left border rounded-2xl border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 bg-slate-50/60 dark:bg-slate-800/40 transition-all text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between group"
              >
                <span>{opt?.[currentLang] || opt?.en || (typeof opt === 'string' ? opt : `Option ${i + 1}`)}</span>
                <span className="w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-blue-600 group-hover:text-blue-600 flex items-center justify-center text-xs font-mono">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
