'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button' // shadcn button
import { useStickyState } from '@/hooks/useStickyState'

export default function CanIApply() {
  const [lang] = useStickyState('en', 'app-lang')
  const [age, setAge] = useStickyState('', 'user-age')
  const [vehicle, setVehicle] = useStickyState('', 'user-vehicle')
  const [step, setStep] = useState(1)

  const isHindi = lang === 'hi'

  const checkEligibility = () => {
    const numAge = Number(age)
    if (numAge >= 18 && vehicle === 'motorcycle-gear') return true
    if (numAge >= 16 && vehicle === 'gearless-50cc') return true
    return false
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
      </Link>

      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1"
      >
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isHindi ? 'आपकी आयु कितनी है?' : 'How old are you?'}
            </h1>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-lg focus:border-blue-600 outline-none transition-colors"
              placeholder={isHindi ? 'अपनी आयु दर्ज करें' : 'Enter your age'}
            />
            <Button 
              onClick={() => setStep(2)}
              disabled={!age}
              className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isHindi ? 'आगे बढ़ें' : 'Next'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isHindi ? 'आप कौन सा वाहन चलाना चाहते हैं?' : 'Which vehicle do you want to drive?'}
            </h1>
            <div className="space-y-3">
              <button 
                onClick={() => setVehicle('motorcycle-gear')}
                className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'motorcycle-gear' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white">
                  {isHindi ? 'गियर वाली मोटरसाइकिल (MCWG)' : 'Motorcycle with gear'}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {isHindi ? 'मानक बाइक और स्कूटर (न्यूनतम 18 वर्ष)' : 'Standard bikes & scooters (Min 18 yrs)'}
                </div>
              </button>
              <button 
                onClick={() => setVehicle('gearless-50cc')}
                className={`w-full p-4 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'gearless-50cc' 
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white">
                  {isHindi ? '50cc तक गियरलेस (MCWOG)' : 'Gearless up to 50cc'}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {isHindi ? 'इलेक्ट्रिक स्कूटर, मोपेड (न्यूनतम 16 वर्ष)' : 'Electric scooters, mopeds (Min 16 yrs)'}
                </div>
              </button>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 w-16 rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!vehicle}
                className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                {isHindi ? 'पात्रता जांचें' : 'Check Eligibility'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 mt-10">
            {checkEligibility() ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 font-bold">✓</div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'हाँ, आप आवेदन कर सकते हैं!' : 'Yes, you can apply!'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  {isHindi 
                    ? 'मोटर वाहन अधिनियम 1988 के अनुसार आप इस श्रेणी के लिए पात्र हैं।' 
                    : 'Based on your age and vehicle category, you are eligible for this licence under MV Act.'}
                </p>
                <Link href="/apply">
                  <Button className="w-full h-12 text-lg rounded-xl bg-green-600 hover:bg-green-700 text-white mt-6">
                    {isHindi ? 'आवेदन फॉर्म भरें' : 'Proceed to Apply Form'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 font-bold">✗</div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'अभी आप पात्र नहीं हैं' : 'Not just yet'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  {isHindi 
                    ? 'गियर वाली मोटरसाइकिल के लिए न्यूनतम आयु 18 वर्ष और गियरलेस 50cc के लिए अभिभावक की सहमति के साथ 16 वर्ष आवश्यक है।' 
                    : 'You must be 18 to apply for a motorcycle with gears, or 16 for a gearless 50cc vehicle with parental consent.'}
                </p>
                <Button variant="outline" onClick={() => setStep(1)} className="w-full h-12 text-lg rounded-xl mt-6">
                  {isHindi ? 'पुनः प्रयास करें' : 'Start over'}
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
