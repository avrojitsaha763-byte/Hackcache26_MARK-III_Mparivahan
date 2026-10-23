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
    if (vehicle === 'gearless-50cc' && numAge >= 16) return true
    if (vehicle === 'commercial-transport' && numAge >= 20) return true
    if (['motorcycle-gear', 'gearless-scooter', 'lmv-car', 'combo-bike-car'].includes(vehicle) && numAge >= 18) return true
    return false
  }

  const getEligibilityNote = () => {
    const numAge = Number(age)
    if (vehicle === 'gearless-50cc' && numAge >= 16 && numAge < 18) {
      return isHindi 
        ? 'आयु 16-18 वर्ष: 50cc तक गियरलेस वाहन के लिए माता-पिता / अभिभावक की लिखित सहमति (फॉर्म 2 भाग II) अनिवार्य है।'
        : 'Age 16–18: Eligible for gearless vehicle up to 50cc with parental/guardian written consent (Form 2 Part II).'
    }
    if (vehicle === 'combo-bike-car') {
      return isHindi
        ? 'मोटरसाइकिल (MCWG) और निजी कार (LMV) दोनों के लिए आप पात्र हैं। एकल आवेदन शुल्क ₹350 है।'
        : 'Eligible for combined dual application for both Geared Motorcycle (MCWG) and Private Car (LMV). Statutory fee: ₹350.'
    }
    if (vehicle === 'lmv-car') {
      return isHindi
        ? 'मोटर वाहन अधिनियम धारा 4 के अनुसार आप गैर-परिवहन चार पहिया निजी कार (LMV) के लिए पात्र हैं।'
        : 'Eligible for Light Motor Vehicle (LMV) private motor cars & SUVs under Section 4 of the MV Act.'
    }
    if (vehicle === 'commercial-transport') {
      return isHindi
        ? 'वाणिज्यिक / ट्रांसपोर्ट वाहन (टैक्सी, कैब, वैन) के लिए न्यूनतम आयु 20 वर्ष एवं 1 वर्ष का LMV अनुभव अनिवार्य है।'
        : 'Commercial/Transport vehicles require minimum age 20 and at least 1 year prior experience with valid LMV licence.'
    }
    return isHindi 
      ? 'मोटर वाहन अधिनियम 1988 के अनुसार आप इस श्रेणी के लिए पूर्णतः पात्र हैं।' 
      : 'Based on your age and vehicle category, you are eligible for this licence under MV Act 1988.'
  }

  const getIneligibilityReason = () => {
    const numAge = Number(age)
    if (vehicle === 'gearless-50cc' && numAge < 16) {
      return isHindi 
        ? '50cc गियरलेस वाहन के लिए भी न्यूनतम आयु 16 वर्ष अनिवार्य है।' 
        : 'Minimum age for 50cc gearless vehicles is 16 years with parental consent.'
    }
    if (vehicle === 'commercial-transport' && numAge < 20) {
      return isHindi
        ? 'वाणिज्यिक / ट्रांसपोर्ट लाइसेंस के लिए मोटर वाहन अधिनियम धारा 4(2) के तहत न्यूनतम 20 वर्ष की आयु अनिवार्य है।'
        : 'Section 4(2) of the Motor Vehicles Act mandates minimum 20 years of age for commercial transport vehicles.'
    }
    return isHindi 
      ? 'गियर वाली बाइक (MCWG), निजी कार (LMV) अथवा गियरलेस स्कूटर हेतु मोटर वाहन अधिनियम के तहत न्यूनतम 18 वर्ष की आयु अनिवार्य है।' 
      : 'Under Section 4 of the MV Act, you must be at least 18 years old for private cars (LMV), geared motorcycles (MCWG), and standard scooters.'
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
              placeholder={isHindi ? 'अपनी आयु दर्ज करें (उदा. 18)' : 'Enter your age (e.g. 18)'}
            />
            <Button 
              onClick={() => setStep(2)}
              disabled={!age || Number(age) < 14}
              className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isHindi ? 'आगे बढ़ें' : 'Next'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isHindi ? 'वाहन श्रेणी चुनें (Class of Vehicle)' : 'Select Vehicle Class (All Bikes & Cars)'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isHindi ? 'केंद्रीय मोटर वाहन नियम (CMVR 1989) के अनुसार श्रेणी चुनें:' : 'Choose your category as per Central Motor Vehicles Rules:'}
              </p>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {/* Option 1: Combo Bike + Car (Most Popular) */}
              <button 
                onClick={() => setVehicle('combo-bike-car')}
                className={`w-full p-3.5 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'combo-bike-car' 
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900 dark:text-white text-sm">
                    🚗 + 🏍️ {isHindi ? 'बाइक + कार कॉम्बो (MCWG + LMV)' : 'Bike + Car Combo (MCWG + LMV)'}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-full">
                    {isHindi ? 'सर्वाधिक लोकप्रिय' : 'Most Popular'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'गियर वाली मोटरसाइकिल एवं निजी कार दोनों (न्यूनतम 18 वर्ष)' : 'Both geared motorbike & private passenger car (Min 18 yrs)'}
                </div>
              </button>

              {/* Option 2: Private Car (LMV) */}
              <button 
                onClick={() => setVehicle('lmv-car')}
                className={`w-full p-3.5 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'lmv-car' 
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  🚗 {isHindi ? 'चार पहिया निजी कार (LMV-NT)' : 'Light Motor Vehicle / Car (LMV)'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'निजी कार, हैचबैक, सेडान, एसयूवी (न्यूनतम 18 वर्ष)' : 'Private cars, hatchbacks, sedans, SUVs (Min 18 yrs)'}
                </div>
              </button>

              {/* Option 3: Geared Motorcycle (MCWG) */}
              <button 
                onClick={() => setVehicle('motorcycle-gear')}
                className={`w-full p-3.5 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'motorcycle-gear' 
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  🏍️ {isHindi ? 'गियर वाली मोटरसाइकिल (MCWG)' : 'Motorcycle with Gear (MCWG)'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'सभी प्रकार की गियर वाली बाइक (न्यूनतम 18 वर्ष)' : 'Standard geared motorbikes & manual bikes (Min 18 yrs)'}
                </div>
              </button>

              {/* Option 4: Gearless Scooter > 50cc (MCWOG) */}
              <button 
                onClick={() => setVehicle('gearless-scooter')}
                className={`w-full p-3.5 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'gearless-scooter' 
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  🛵 {isHindi ? 'गियरलेस स्कूटर (MCWOG >50cc)' : 'Gearless Scooter (MCWOG >50cc)'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'एक्टिवा, जुपिटर, ओला/एथर ईवी स्कूटर (न्यूनतम 18 वर्ष)' : 'Activa, Jupiter, EV scooters without gears (Min 18 yrs)'}
                </div>
              </button>

              {/* Option 5: 50cc Moped / Light EV (16+) */}
              <button 
                onClick={() => setVehicle('gearless-50cc')}
                className={`w-full p-3.5 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'gearless-50cc' 
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  ⚡ {isHindi ? '50cc तक गियरलेस मोपेड (16+ वर्ष)' : 'Gearless up to 50cc / Moped (16+ yrs)'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'हल्के मोपेड एवं धीमी गति के इलेक्ट्रिक स्कूटर (अभिभावक सहमति)' : 'Mopeds & light EVs with parental consent (Min 16 yrs)'}
                </div>
              </button>

              {/* Option 6: Commercial Transport */}
              <button 
                onClick={() => setVehicle('commercial-transport')}
                className={`w-full p-3.5 text-left border-2 rounded-xl transition-all ${
                  vehicle === 'commercial-transport' 
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60'
                }`}
              >
                <div className="font-semibold text-slate-900 dark:text-white text-sm">
                  🚕 {isHindi ? 'वाणिज्यिक / ट्रांसपोर्ट वाहन (TRANS)' : 'Commercial & Transport (TRANS)'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'टैक्सी, कमर्शियल कैब, डिलीवरी वैन (न्यूनतम 20 वर्ष)' : 'Taxis, commercial vans, transport cabs (Min 20 yrs)'}
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
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed px-2">
                  {getEligibilityNote()}
                </p>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-white">
                    {isHindi ? 'आवश्यक दस्तावेज (आधार ई-केवाईसी):' : 'Required Documents (Aadhaar e-KYC):'}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    • {isHindi ? 'आधार कार्ड (ओटीपी आधारित सत्यापन)' : 'Aadhaar Card (Paperless OTP verification)'}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    • {isHindi ? 'आयु प्रमाण पत्र (10वीं की मार्कशीट या जन्म प्रमाण पत्र)' : 'Age Proof (10th Board Certificate or Birth Certificate)'}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    • {isHindi ? 'चिकित्सा प्रमाण पत्र (फॉर्म 1 स्व-घोषणा)' : 'Medical Fitness (Form 1 Self-Declaration)'}
                  </div>
                </div>
                <Link href="/apply">
                  <Button className="w-full h-12 text-lg rounded-xl bg-green-600 hover:bg-green-700 text-white mt-4">
                    {isHindi ? 'आवेदन फॉर्म भरें' : 'Proceed to Apply Form'}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 font-bold">✗</div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'अभी आप पात्र नहीं हैं' : 'Not yet eligible'}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed px-2">
                  {getIneligibilityReason()}
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
