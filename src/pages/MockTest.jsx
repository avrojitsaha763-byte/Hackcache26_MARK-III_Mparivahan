'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
      <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 text-center bg-white dark:bg-slate-900 justify-center transition-colors">
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          {isHindi ? 'आरटीओ परीक्षा परिणाम' : 'RTO Test Result'}
        </h1>
        <div className={`text-5xl font-extrabold mb-4 ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {score} / {mockQuestions.length}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          {isHindi ? 'उत्तीर्ण अंक: 9 / 15 (60%)' : 'Passing mark: 9 / 15 (60%)'}
        </p>
        <h2 className="text-xl font-semibold mb-8 text-slate-800 dark:text-slate-200">
          {passed 
            ? (isHindi ? '🎉 उत्तीर्ण! आप आरटीओ परीक्षा के लिए तैयार हैं।' : '🎉 Passed! You are ready for the RTO exam.') 
            : (isHindi ? '❌ अनुत्तीर्ण। कृपया अभ्यास करें और पुनः प्रयास करें।' : '❌ Failed. Please practice more and try again.')}
        </h2>
        <div className="space-y-3">
          <Button 
            onClick={() => {
              setCurrentQ(0)
              setScore(0)
              setTimeLeft(30)
              setIsFinished(false)
            }}
            variant="outline"
            className="w-full h-12 text-lg rounded-xl"
          >
            {isHindi ? 'पुनः टेस्ट दें' : 'Retake Test'}
          </Button>
          <Link href="/">
            <Button className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
              {isHindi ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const question = mockQuestions[currentQ]
  const currentLang = isHindi ? 'hi' : 'en'

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {isHindi ? `प्रश्न: ${currentQ + 1}/${mockQuestions.length}` : `Q: ${currentQ + 1}/${mockQuestions.length}`}
        </span>
        <span className={`text-xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
          00:{timeLeft.toString().padStart(2, '0')}
        </span>
      </div>

      <motion.div key={currentQ} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
        <h2 className="text-xl font-bold mb-6 leading-relaxed text-slate-900 dark:text-white">
          {question?.question?.[currentLang] || question?.question?.en || 'Question'}
        </h2>
        <div className="space-y-3">
          {question?.options?.map((opt, i) => (
            <button 
              key={i} 
              onClick={() => handleAnswer(i)}
              className="w-full p-4 text-left border-2 rounded-xl border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 bg-white dark:bg-slate-800/60 transition-all font-medium text-slate-700 dark:text-slate-200"
            >
              {opt?.[currentLang] || opt?.en || (typeof opt === 'string' ? opt : `Option ${i + 1}`)}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
