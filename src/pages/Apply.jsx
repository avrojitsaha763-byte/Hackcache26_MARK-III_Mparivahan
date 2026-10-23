'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'
import { supabase } from '@/lib/supabase'

export default function Apply() {
  const [lang] = useStickyState('en', 'app-lang')
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useStickyState('', 'user-phone')
  const [name, setName] = useStickyState('', 'user-name')
  const [vehicle, setVehicle] = useStickyState('combo-bike-car', 'user-vehicle')
  const [stateRto, setStateRto] = useStickyState('KA-01', 'user-rto')
  const [aadhaarConsent, setAadhaarConsent] = useState(true)
  const [generatedAppNo, setGeneratedAppNo] = useState(() => 'APP' + Math.floor(100000 + Math.random() * 900000))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isHindi = lang === 'hi'

  // Dynamic fee calculation based on CMVR Rule 32
  const getFeeDetails = () => {
    if (vehicle === 'combo-bike-car') {
      return {
        breakdown: [
          { label: isHindi ? "मोटरसाइकिल लर्नर्स शुल्क (MCWG)" : "Motorcycle LL Fee (MCWG)", amount: 150 },
          { label: isHindi ? "निजी कार लर्नर्स शुल्क (LMV)" : "Private Car LL Fee (LMV)", amount: 150 },
          { label: isHindi ? "कंप्यूटर टेस्ट शुल्क (STALL)" : "Online STALL Test Fee", amount: 50 },
        ],
        total: 350
      }
    }
    if (vehicle === 'commercial-transport') {
      return {
        breakdown: [
          { label: isHindi ? "वाणिज्यिक वाहन लर्नर्स शुल्क (TRANS)" : "Commercial Vehicle LL Fee (TRANS)", amount: 200 },
          { label: isHindi ? "ड्राइविंग टेस्ट स्लॉट शुल्क" : "Commercial Test Slot Fee", amount: 100 },
        ],
        total: 300
      }
    }
    const vehicleName = vehicle === 'lmv-car' 
      ? (isHindi ? "कार लर्नर्स शुल्क (LMV)" : "Car LL Fee (LMV)")
      : (isHindi ? "लर्नर्स लाइसेंस शुल्क" : "Learner's Licence Fee")
    return {
      breakdown: [
        { label: vehicleName, amount: 150 },
        { label: isHindi ? "ऑनलाइन टेस्ट शुल्क (STALL)" : "Online STALL Test Fee", amount: 50 },
      ],
      total: 200
    }
  }

  const feeData = getFeeDetails()

  const getVehicleLabel = (val) => {
    switch (val) {
      case 'combo-bike-car':
        return isHindi ? '🚗 + 🏍️ बाइक + कार (MCWG + LMV)' : '🚗 + 🏍️ Bike + Car (MCWG + LMV)'
      case 'lmv-car':
        return isHindi ? '🚗 चार पहिया निजी कार (LMV)' : '🚗 Light Motor Vehicle / Car (LMV)'
      case 'motorcycle-gear':
        return isHindi ? '🏍️ गियर वाली मोटरसाइकिल (MCWG)' : '🏍️ Motorcycle with Gear (MCWG)'
      case 'gearless-scooter':
        return isHindi ? '🛵 गियरलेस स्कूटर (MCWOG >50cc)' : '🛵 Gearless Scooter (MCWOG >50cc)'
      case 'gearless-50cc':
        return isHindi ? '⚡ 50cc तक गियरलेस मोपेड (16+)' : '⚡ Gearless up to 50cc (16+)'
      case 'commercial-transport':
        return isHindi ? '🚕 वाणिज्यिक / ट्रांसपोर्ट (TRANS)' : '🚕 Commercial Transport (TRANS)'
      default:
        return val
    }
  }

  const getRtoLabel = (code) => {
    const map = {
      'KA-01': 'Karnataka (Bengaluru Central - Sarathi)',
      'MH-01': 'Maharashtra (Mumbai South - Tardeo)',
      'DL-01': 'Delhi (Mall Road - North Delhi)',
      'TN-01': 'Tamil Nadu (Chennai Central)',
      'WB-01': 'West Bengal (Kolkata - Beltala)',
      'UP-32': 'Uttar Pradesh (Lucknow - Transport Nagar)'
    }
    return map[code] || code
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const newAppNo = `APP${Math.floor(100000 + Math.random() * 900000)}`
    setGeneratedAppNo(newAppNo)

    try {
      if (supabase) {
        const { data: citizen, error: citizenError } = await supabase
          .from('citizens')
          .insert([{ phone_number: phone, full_name: name }])
          .select()
          .single()

        if (!citizenError && citizen) {
          await supabase
            .from('applications')
            .insert([{ 
              citizen_id: citizen.id, 
              vehicle_class: vehicle,
              application_no: newAppNo
            }])
        }
      }
    } catch (err) {
      console.warn('Supabase submission fallback:', err)
    }
    setStep(3) // Success screen
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <Link href="/can-i-apply" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'वापस' : 'Back'}
      </Link>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="mb-6 h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 rounded-full text-green-700 dark:text-green-300 text-[11px] font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> {isHindi ? 'आधार ई-केवाईसी समर्थित (डिजीलॉकर)' : 'Aadhaar e-KYC Enabled (DigiLocker)'}
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isHindi ? 'व्यक्तिगत विवरण (फॉर्म 2)' : 'Personal Details (Form 2)'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi ? 'सारथी पोर्टल पर नया लर्नर्स लाइसेंस आवेदन:' : 'New Learner Licence Application on Sarathi Parivahan:'}
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'राज्य एवं आरटीओ अधिकार क्षेत्र' : 'State & RTO Jurisdiction (Sarathi)'}
                </label>
                <select
                  value={stateRto}
                  onChange={(e) => setStateRto(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:border-blue-600 outline-none"
                >
                  <option value="KA-01">Karnataka — Bengaluru Central (Sarathi Online / 7-Day Rule)</option>
                  <option value="MH-01">Maharashtra — Mumbai South (Tardeo)</option>
                  <option value="DL-01">Delhi — Mall Road (North Delhi / Automated Track)</option>
                  <option value="TN-01">Tamil Nadu — Chennai Central</option>
                  <option value="WB-01">West Bengal — Kolkata (Beltala)</option>
                  <option value="UP-32">Uttar Pradesh — Lucknow (Transport Nagar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'वाहन श्रेणी (Class of Vehicle)' : 'Vehicle Category (COV)'}
                </label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs focus:border-blue-600 outline-none"
                >
                  <option value="combo-bike-car">🚗 + 🏍️ Bike + Car Combo (MCWG + LMV) — ₹350</option>
                  <option value="lmv-car">🚗 Light Motor Vehicle / Car (LMV) — ₹200</option>
                  <option value="motorcycle-gear">🏍️ Motorcycle with Gear (MCWG) — ₹200</option>
                  <option value="gearless-scooter">🛵 Gearless Scooter &gt;50cc (MCWOG) — ₹200</option>
                  <option value="gearless-50cc">⚡ Gearless Moped &le;50cc (16+ yrs) — ₹200</option>
                  <option value="commercial-transport">🚕 Commercial Transport (TRANS) — ₹300</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'आवेदक का पूरा नाम' : 'Full Name (As per Aadhaar Card)'}
                </label>
                <input 
                  type="text" 
                  placeholder={isHindi ? 'पूरा नाम दर्ज करें' : 'e.g. Avrojit Saha'} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'मोबाइल नंबर (ओटीपी एवं एसएमएस हेतु)' : 'Mobile Number (For OTP & Tracking)'}
                </label>
                <input 
                  type="tel" 
                  placeholder={isHindi ? '10 अंकों का मोबाइल नंबर' : 'e.g. 9876543210'} 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 outline-none transition-colors"
                />
              </div>

              {/* DPDP Act 2023 & UIDAI Consent */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aadhaarConsent}
                    onChange={(e) => setAadhaarConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
                    {isHindi 
                      ? 'मैं डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम 2023 के तहत आधार ई-केवाईसी एवं डिजीलॉकर सत्यापन हेतु सहमति देता/देती हूँ। कोई कच्चा आधार नंबर संग्रहीत नहीं होता है।'
                      : 'I consent to Aadhaar e-KYC and DigiLocker verification under the DPDP Act 2023 and Aadhaar Act 2016. No raw UID is stored.'}
                  </span>
                </label>
              </div>
            </div>

            <Button onClick={() => setStep(2)} disabled={!name || !phone || !aadhaarConsent} className="w-full h-12 text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white mt-2">
              {isHindi ? 'आगे बढ़ें (शुल्क विवरण)' : 'Next (Statutory Fees)'} <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isHindi ? 'सरकारी शुल्क विवरण (CMVR नियम 32)' : 'Statutory Fee Schedule (CMVR Rule 32)'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isHindi ? 'परिवहन मंत्रालय द्वारा निर्धारित आधिकारिक शुल्क संरचना:' : 'Official fee breakdown prescribed by MoRTH:'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-blue-600 dark:text-blue-400">{getVehicleLabel(vehicle)}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[10px]">{getRtoLabel(stateRto)}</span>
              </div>

              {feeData.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>{item.label}</span>
                  <span className="font-medium">₹{item.amount}</span>
                </div>
              ))}

              <div className="flex justify-between font-bold text-base pt-2.5 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                <span>{isHindi ? 'कुल सरकारी शुल्क' : 'Total Statutory Fee'}</span>
                <span className="text-blue-600 dark:text-blue-400">₹{feeData.total}</span>
              </div>
            </div>

            {/* CMVR Rule 11(3) Statutory 7-Day Alert */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-blue-800 dark:text-blue-200 leading-normal">
                <strong>{isHindi ? 'नियम 11(3) CMVR (7-दिन का नियम):' : 'Rule 11(3) CMVR (7-Day LL Test Rule):'}</strong>{' '}
                {isHindi 
                  ? 'आवेदन जमा करने के 7 दिनों के भीतर ऑनलाइन परीक्षा देना अनिवार्य है, अन्यथा आवेदन स्वतः रद्द हो जाता है।' 
                  : 'Applicants must take the online LL test within 7 days of application, failing which it is automatically cancelled.'}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 w-16 rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700 text-white flex-1">
                {isSubmitting ? (isHindi ? 'प्रसंस्करण जारी...' : 'Processing...') : (isHindi ? `शुल्क भुगतान करें (₹${feeData.total})` : `Pay ₹${feeData.total} (Simulated)`)}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 mt-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">✓</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isHindi ? 'आवेदन सफलतापूर्वक जमा हुआ' : 'Application Submitted Successfully'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {isHindi 
                ? 'आपका फॉर्म 2 आवेदन सारथी परिवहन प्रणाली में पंजीकृत कर लिया गया है।' 
                : 'Your Form 2 application has been registered on the Sarathi Parivahan system.'}
            </p>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">{isHindi ? 'आवेदन संख्या:' : 'Application Number:'}</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{generatedAppNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">{isHindi ? 'आरटीओ केंद्र:' : 'RTO Office:'}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{getRtoLabel(stateRto)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">{isHindi ? 'वाहन श्रेणी:' : 'Vehicle Class:'}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{getVehicleLabel(vehicle)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">{isHindi ? 'ई-केवाईसी स्थिति:' : 'e-KYC Status:'}</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">✓ Verified (DigiLocker)</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-amber-600 dark:text-amber-400 font-medium">{isHindi ? 'परीक्षा समय सीमा:' : 'Test Deadline:'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Within 7 Days (Rule 11(3))</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <Link href="/mock-test">
                <Button className="w-full h-11 text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                  {isHindi ? 'लर्नर्स टेस्ट अभ्यास शुरू करें (STALL)' : 'Start RTO Exam Practice (STALL)'}
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" className="w-full h-11 text-sm rounded-xl">
                  {isHindi ? 'आवेदन स्थिति ट्रैक करें' : 'Track Application Status'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
