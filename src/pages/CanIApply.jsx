import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight, ShieldCheck, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

export default function CanIApply() {
  const [lang] = useStickyState('en', 'app-lang')
  const [age, setAge] = useStickyState('', 'user-age')
  const [vehicle, setVehicle] = useStickyState('combo-bike-car', 'user-vehicle')
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
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6">
      <Link to="/" className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
      </Link>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>{isHindi ? 'पात्रता एवं आयु कैलकुलेटर' : 'CMVR Statutory Eligibility Calculator'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {isHindi ? 'क्या आप ड्राइविंग लाइसेंस के लिए पात्र हैं?' : 'Can I Apply for a Driving Licence?'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isHindi 
            ? 'मोटर वाहन अधिनियम 1988 (धारा 4) के अनुसार अपनी न्यूनतम आयु एवं वाहन श्रेणी जांचें।' 
            : 'Check your eligibility criteria and statutory age limits under Section 4 of the Motor Vehicles Act 1988.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form (7 Cols on Desktop) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'आपकी आयु कितनी है?' : 'Step 1: What is your current age?'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isHindi ? 'जन्म तिथि के अनुसार पूर्ण आयु वर्ष दर्ज करें:' : 'Enter completed years as per your Aadhaar or 10th marksheet:'}
                  </p>
                </div>

                <div className="space-y-3">
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full p-4 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-xl font-mono focus:border-blue-600 outline-none transition-colors"
                    placeholder={isHindi ? 'अपनी आयु दर्ज करें (उदा. 18)' : 'e.g. 18 or 21'}
                  />

                  {/* Quick Age Chips */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-slate-400 py-1">Quick Select:</span>
                    {[16, 18, 20, 22, 25].map((a) => (
                      <button
                        key={a}
                        onClick={() => setAge(String(a))}
                        className={`px-3 py-1 rounded-xl border transition-all ${
                          Number(age) === a 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {a} yrs
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => setStep(2)}
                  disabled={!age || Number(age) < 14}
                  className="w-full h-12 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-600/20"
                >
                  {isHindi ? 'आगे बढ़ें (वाहन श्रेणी चुनें)' : 'Next (Select Vehicle Class)'} 
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'वाहन श्रेणी चुनें (Class of Vehicle)' : 'Step 2: Select Vehicle Class (COV)'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {isHindi ? 'केंद्रीय मोटर वाहन नियम (CMVR 1989) के अनुसार श्रेणी चुनें:' : 'Select which vehicle class you wish to drive:'}
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { id: 'combo-bike-car', label: '🚗 + 🏍️ Bike + Car Combo (MCWG + LMV)', sub: 'Dual Licence: Geared Motorbike + Private Car (₹350 Fee)' },
                    { id: 'lmv-car', label: '🚗 Four-Wheeler Car / SUV (LMV)', sub: 'Private motor cars, hatchbacks, sedans (₹200 Fee)' },
                    { id: 'motorcycle-gear', label: '🏍️ Motorcycle with Gear (MCWG)', sub: 'Standard geared motorcycles and motorbikes (₹200 Fee)' },
                    { id: 'gearless-scooter', label: '🛵 Gearless Scooter >50cc (MCWOG)', sub: 'Automatic scooters like Activa, Jupiter, Ola EV (₹200 Fee)' },
                    { id: 'gearless-50cc', label: '⚡ Gearless up to 50cc (Min Age 16)', sub: 'Lightweight mopeds with parental consent (₹200 Fee)' },
                    { id: 'commercial-transport', label: '🚕 Commercial Transport (TRANS)', sub: 'Taxis, commercial cabs, delivery vans (Min Age 20)' },
                  ].map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setVehicle(item.id)}
                      className={`w-full p-3.5 text-left border rounded-2xl transition-all ${
                        vehicle === item.id 
                          ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-1 ring-blue-500' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.sub}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 w-16 rounded-xl">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    disabled={!vehicle}
                    className="w-full h-12 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex-1 shadow-lg shadow-blue-600/20"
                  >
                    {isHindi ? 'पात्रता परिणाम देखें' : 'Evaluate Statutory Eligibility'}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {checkEligibility() ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto text-3xl font-extrabold shadow-inner">
                      ✓
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {isHindi ? 'हाँ, आप आवेदन करने के पात्र हैं!' : 'Yes, you are eligible to apply!'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                      {getEligibilityNote()}
                    </p>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1.5">
                      <div className="font-bold text-slate-800 dark:text-white">
                        {isHindi ? 'आवश्यक दस्तावेज (आधार ई-केवाईसी):' : 'Mandatory Faceless DigiLocker Documents:'}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        • {isHindi ? 'आधार कार्ड (ओटीपी आधारित सत्यापन)' : 'Aadhaar Card (Instant OTP demographic authentication)'}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        • {isHindi ? 'आयु प्रमाण (10वीं की मार्कशीट या जन्म प्रमाण पत्र)' : 'Age Proof (10th Board Certificate or Municipal Birth Record)'}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        • {isHindi ? 'चिकित्सा प्रमाण (फॉर्म 1 स्व-घोषणा)' : 'Physical Fitness (Form 1 Online Self-Declaration)'}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl h-11 text-xs">
                        Recalculate
                      </Button>
                      <Link to="/apply" className="flex-1">
                        <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/20">
                          {isHindi ? 'आवेदन फॉर्म भरें' : 'Proceed to Apply Form (Form 2)'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto text-3xl font-extrabold shadow-inner">
                      ✗
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {isHindi ? 'अभी आप पात्र नहीं हैं' : 'Not yet eligible under MV Act'}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                      {getIneligibilityReason()}
                    </p>
                    <Button variant="outline" onClick={() => setStep(1)} className="w-full h-11 rounded-xl text-xs sm:text-sm mt-4 font-semibold">
                      {isHindi ? 'पुनः प्रयास करें' : 'Start Over with Different Details'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Statutory Reference Matrix (5 Cols on Desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Motor Vehicles Act 1988 (Section 4)</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <strong>Age 16+:</strong> Mopeds / light electric scooters up to 50cc with parental consent (Form 2 Part II).
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <strong>Age 18+:</strong> Geared motorcycles (MCWG), gearless scooters (MCWOG), and private cars (LMV).
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <strong>Age 20+:</strong> Commercial passenger & goods transport vehicles (Taxis, buses, trucks).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
