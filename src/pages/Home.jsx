import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronRight, 
  FileText, 
  CheckCircle, 
  Car, 
  Award, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Lock,
  AlertCircle,
  Eye,
  Zap,
  QrCode,
  Sparkles,
  Calculator,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Coins,
  Cpu
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStickyState } from '@/hooks/useStickyState'
import { soundFx } from '@/lib/soundFx'

export default function Home() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'
  const [selectedVehicle, setSelectedVehicle] = useState('MCWG')
  const [applicantAge, setApplicantAge] = useState(19)

  const VEHICLE_CONFIGS = {
    MCWOG: {
      nameEn: 'Motor Cycle Without Gear (≤50cc)',
      nameHi: 'बिना गियर वाला दोपहिया (≤50cc)',
      minAge: 16,
      ruleText: 'Section 4(1) MV Act (Requires Parental Consent Form)',
      appFee: 150,
      testFee: 50,
      toutCost: 1500
    },
    MCWG: {
      nameEn: 'Motor Cycle With Gear (2-Wheeler)',
      nameHi: 'गियर वाला दोपहिया (MCWG)',
      minAge: 18,
      ruleText: 'Section 4(1) MV Act (Adult General Licence)',
      appFee: 150,
      testFee: 50,
      toutCost: 1600
    },
    LMV: {
      nameEn: 'Light Motor Vehicle (Car / Jeep)',
      nameHi: 'हल्का मोटर वाहन - कार/जीप (LMV)',
      minAge: 18,
      ruleText: 'Section 4(1) MV Act (Private Passenger Car)',
      appFee: 150,
      testFee: 50,
      toutCost: 2200
    },
    TRANS: {
      nameEn: 'Transport / Commercial Vehicle',
      nameHi: 'वाणिज्यिक / भारी वाहन (Transport)',
      minAge: 20,
      ruleText: 'Section 4(2) & 7(1) MV Act (Min 1 Year LMV Licence Required)',
      appFee: 200,
      testFee: 100,
      toutCost: 3500
    }
  }

  const currentVeh = VEHICLE_CONFIGS[selectedVehicle] || VEHICLE_CONFIGS.MCWG
  const isEligible = applicantAge >= currentVeh.minAge
  const needsForm1A = applicantAge >= 40 || selectedVehicle === 'TRANS'
  const officialFee = currentVeh.appFee + currentVeh.testFee
  const toutSavings = currentVeh.toutCost - officialFee

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="w-full flex flex-col space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-blue-800/40"
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-blue-200 text-xs font-semibold mb-4">
            <span>🇮🇳</span>
            <span>{isHindi ? 'सारथी परिवहन डिजिटल सहायक' : 'Sarathi Parivahan Citizen Digital Assistant'}</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">MARK-III</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            {isHindi ? (
              <>अपनी ड्राइविंग <span className="text-blue-400">लाइसेंस यात्रा</span> बिना किसी बाधा के पूरी करें</>
            ) : (
              <>Where are you in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">licence journey?</span></>
            )}
          </h1>

          <p className="text-blue-100/80 mt-3 text-sm sm:text-base leading-relaxed max-w-2xl">
            {isHindi 
              ? 'मोटर वाहन अधिनियम 1988 एवं CMVR नियमों के अनुसार पात्रता जांचें, फॉर्म 2 आवेदन जमा करें, मॉक टेस्ट दें और आवेदन स्थिति ट्रैक करें।' 
              : 'End-to-end assistance compliant with CMVR 1989: Check eligibility, submit Form 2 with DigiLocker e-KYC, practice STALL test questions, and track approval status.'}
          </p>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 sm:mt-8 pt-6 border-t border-white/10 text-xs">
            <div>
              <div className="text-blue-300 font-bold text-sm">100% Faceless</div>
              <div className="text-blue-200/70 text-[11px]">DigiLocker e-KYC</div>
            </div>
            <div>
              <div className="text-amber-300 font-bold text-sm">Rule 11 CMVR</div>
              <div className="text-blue-200/70 text-[11px]">Knowledge Test (60%)</div>
            </div>
            <div>
              <div className="text-emerald-300 font-bold text-sm">Rule 32 CMVR</div>
              <div className="text-blue-200/70 text-[11px]">Zero Agent Overcharging</div>
            </div>
            <div>
              <div className="text-cyan-300 font-bold text-sm">ADTT Guide</div>
              <div className="text-blue-200/70 text-[11px]">Automated Track Skills</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Citizen Journey Stages Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isHindi ? 'नागरिक सेवा यात्रा चरण' : 'Citizen Licence Journey Steps'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isHindi ? 'अपने वर्तमान चरण का चयन करें और आगे के कदम जानें:' : 'Select your current stage to proceed with next steps:'}
            </p>
          </div>
        </div>

        {/* Responsive Grid for Journey Cards (4 Columns on Desktop, 2 on Tablet, 1 on Mobile) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          <JourneyCard 
            to="/can-i-apply" 
            icon={<FileText className="text-blue-600 dark:text-blue-400 w-6 h-6" />} 
            stepNum="01"
            title={isHindi ? 'शुरुआत कर रहे हैं' : 'Just Starting'} 
            subtitle={isHindi ? 'पात्रता जांचें एवं आवेदन करें' : "Check eligibility & apply for Learner's Licence (Form 2)"}
            badge={isHindi ? 'पात्रता कैलकुलेटर' : 'Eligibility Check'}
            variants={itemVariants}
          />
          <JourneyCard 
            to="/learn" 
            icon={<CheckCircle className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />} 
            stepNum="02"
            title={isHindi ? 'लर्नर्स लाइसेंस की तैयारी' : "I have a Learner's"} 
            subtitle={isHindi ? 'यातायात संकेत सीखें एवं मॉक टेस्ट दें' : 'Practice mandatory signs & take mock STALL test'}
            badge={isHindi ? 'संकेत एवं टेस्ट' : 'Audio Flashcards'}
            variants={itemVariants}
          />
          <JourneyCard 
            to="/track" 
            icon={<Clock className="text-orange-600 dark:text-orange-400 w-6 h-6" />} 
            stepNum="03"
            title={isHindi ? 'आवेदन स्थिति ट्रैक करें' : "I've Applied & Waiting"} 
            subtitle={isHindi ? 'आवेदन स्थिति एवं समयरेखा ट्रैक करें' : 'Track application status & RTO scrutiny timeline'}
            badge={isHindi ? 'लाइव टाइमलाइन' : 'Live Status'}
            variants={itemVariants}
          />
          <JourneyCard 
            to="/permanent-dl" 
            icon={<Car className="text-purple-600 dark:text-purple-400 w-6 h-6" />} 
            stepNum="04"
            title={isHindi ? 'स्थायी लाइसेंस की तैयारी' : 'Ready for Permanent DL?'} 
            subtitle={isHindi ? '30 दिन का नियम एवं ड्राइविंग टेस्ट चेकलिस्ट' : 'Rule 15 (30-day wait) & ADTT automated track guide'}
            badge={isHindi ? 'टेस्ट स्लॉट बुकिंग' : 'ADTT Track Skills'}
            variants={itemVariants}
          />
        </motion.div>
      </div>

      {/* 4 NATIONAL INNOVATION PILLARS (HackCache26 MARK-III Winning Suite) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isHindi ? 'हैककैश26 मार्क-III राष्ट्रीय नवाचार स्तंभ' : 'HackCache26 Mark-III Strategic Innovations'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {isHindi ? 'एआई-संचालित चिकित्सीय एवं सड़क सुरक्षा सूट' : 'AI-Powered Clinical & Road Safety Suite'}
            </h2>
          </div>
          <span className="text-xs text-slate-500">CMVR 1989 & MoRTH Compliant</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pillar 2: Netra-Vision */}
          <Link to="/vision-test" className="group">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/60 dark:from-slate-900 dark:to-purple-950/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg hover:border-purple-400 transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    Rule 5(2) Form 1
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {isHindi ? 'नेत्र-विज़न चिकित्सीय दृष्टि जांच' : 'Netra-Vision Clinical Screener'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isHindi 
                    ? 'इशिहारा रंग अंधता एवं स्नेलन दृष्टि तीक्ष्णता जांच। स्वचालित फॉर्म 1 टोकन।' 
                    : 'Ishihara chromatic plates & Snellen tumbling E acuity screener. Generates verifiable Form 1 medical fitness tokens.'}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>{isHindi ? 'दृष्टि जांच शुरू करें' : 'Launch Vision Test'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Pillar 3: STALL Pro Hazard Arena */}
          <Link to="/hazard-test" className="group">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50/60 dark:from-slate-900 dark:to-red-950/30 border border-red-200 dark:border-red-800 hover:shadow-lg hover:border-red-400 transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300">
                    60fps Cockpit
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {isHindi ? 'STALL प्रो हैज़र्ड परसेप्शन एरेना' : 'STALL Pro Hazard Arena'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isHindi 
                    ? '50 किमी/घंटा पर वास्तविक 5 सड़क खतरों में मिलीसेकंड प्रतिक्रिया समय एवं रुकने की दूरी मापें।' 
                    : 'Measure exact ms driver reaction latency (tr) and physical stopping distance across 5 statutory Indian road situations.'}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-red-100 dark:border-red-900/40 flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform">
                <span>{isHindi ? 'रिफ्लेक्स एरेना खेलें' : 'Enter Reflex Arena'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* Pillar 4: Form 3 TrustLedger */}
          <Link to="/verify" className="group">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-slate-900 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800 hover:shadow-lg hover:border-emerald-400 transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Rule 16 CMVR
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {isHindi ? 'फॉर्म 3 ट्रस्टलेजर सार्वजनिक सत्यापन' : 'Form 3 TrustLedger Portal'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {isHindi 
                    ? 'क्यूआर कोड, SHA-256 ब्लॉक, एमवीआई डिजिटल हस्ताक्षर एवं ई-पे चालान से लाइसेंस की सत्यता जांचें।' 
                    : 'Public cryptographic validation for Form 3 LLs. Inspect MVI digital signature certificates and Bharat e-Pay treasury GRN.'}
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                <span>{isHindi ? 'लाइसेंस सत्यापित करें' : 'Verify LL Number'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Statutory Guidance Advisory Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-indigo-900 dark:text-indigo-200 font-bold block mb-1">
              {isHindi ? 'नियम 11 CMVR — प्रारंभिक लर्नर्स लाइसेंस टेस्ट:' : 'Rule 11 CMVR — Preliminary Knowledge Test Syllabus:'}
            </strong>
            <p className="text-indigo-800/90 dark:text-indigo-300/80 leading-relaxed">
              {isHindi
                ? 'केंद्रीय मोटर वाहन नियम (CMVR) 1989 के नियम 11 के तहत सड़क संकेत, यातायात नियम एवं दुर्घटना कर्तव्यों पर 60% उत्तीर्ण अंक प्राप्त करना अनिवार्य है। राज्यवार स्लॉट शेड्यूलिंग अवधि अलग हो सकती है।'
                : 'Under CMVR 1989 Rule 11, applicants must satisfy the licensing authority with adequate knowledge of road signs, traffic rules, and driver duties (min 60% score). State slot booking deadlines vary.'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3.5">
          <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-blue-900 dark:text-blue-200 font-bold block mb-1">
              {isHindi ? 'नियम 15 CMVR — स्थायी लाइसेंस हेतु 30-दिन की अवधि:' : 'Rule 15 CMVR — Mandatory 30-Day Waiting Period:'}
            </strong>
            <p className="text-blue-800/90 dark:text-blue-300/80 leading-relaxed">
              {isHindi
                ? 'फॉर्म 3 लर्नर्स लाइसेंस जारी होने की तिथि से न्यूनतम 30 दिन पूर्ण होने के उपरांत ही स्थायी ड्राइविंग लाइसेंस (फॉर्म 4) परीक्षा हेतु स्लॉट बुक किया जा सकता है।'
                : 'Permanent driving test (Form 4) can only be taken after holding a valid Form 3 Learner Licence for at least 30 continuous days.'}
            </p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE STATUTORY RULE 32 CMVR FEE & ELIGIBILITY CALCULATOR */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-800 mb-0.5">
                <Coins className="w-3 h-3 text-amber-500" />
                <span>{isHindi ? 'नियम 32 CMVR सरकारी शुल्क कैलकुलेटर' : 'Rule 32 CMVR Real-Time Statutory Fee & Age Engine'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {isHindi ? 'त्वरित पात्रता एवं आधिकारिक शुल्क कैलकुलेटर' : 'Instant Eligibility & Official Fee Calculator'}
              </h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
            {isHindi ? 'शून्य दलाल कमीशन' : '100% Anti-Tout Compliant'}
          </span>
        </div>

        {/* Vehicle Category Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
            {isHindi ? 'वाहन श्रेणी चुनें (Select Vehicle Class):' : 'Select Vehicle Category:'}
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Object.entries(VEHICLE_CONFIGS).map(([key, cfg]) => {
              const active = selectedVehicle === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    soundFx.tap()
                    setSelectedVehicle(key)
                  }}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    active
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 shadow-sm font-bold ring-2 ring-blue-500/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs mb-0.5">{isHindi ? cfg.nameHi : cfg.nameEn}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Min Age: {cfg.minAge} Yrs</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Age Slider Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {isHindi ? 'आवेदक की आयु (Applicant Age):' : 'Applicant Age:'}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-blue-600 text-white font-mono font-bold text-sm shadow">
              {applicantAge} {isHindi ? 'वर्ष' : 'Years'}
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="70"
            value={applicantAge}
            onChange={(e) => {
              setApplicantAge(parseInt(e.target.value, 10))
            }}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>15 yrs (Minor)</span>
            <span>18 yrs (Adult)</span>
            <span>40 yrs (Form 1A Threshold)</span>
            <span>70 yrs</span>
          </div>
        </div>

        {/* Dynamic Calculation Result Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Legal Eligibility Status */}
          <div className={`p-4 rounded-2xl border text-xs flex flex-col justify-between ${
            isEligible 
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
              : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-100'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                {isEligible ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isHindi ? 'आवेदन हेतु पात्र' : 'Statutorily Eligible to Apply'}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{isHindi ? 'वर्तमान आयु में अपात्र' : 'Underage / Ineligible for Class'}</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90 mb-3">
                {isEligible
                  ? `Qualified under ${currentVeh.ruleText}. You meet statutory age requirements to apply for Form 2 Learner Licence.`
                  : `Section 4 of Motor Vehicles Act 1988 mandates a minimum age of ${currentVeh.minAge} years for ${currentVeh.nameEn}. You cannot legally submit Form 2 yet.`}
              </p>

              {/* Form 1A Medical Notice */}
              {needsForm1A && isEligible && (
                <div className="p-2.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-[11px] leading-tight flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>
                    <strong>Rule 5(3) CMVR:</strong> Age is 40+ or commercial class. Medical Certificate (Form 1A) with registered doctor signoff and eye test token is required.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-current/10 flex items-center justify-between">
              <span className="text-[11px] font-semibold opacity-75">Statutory Standard: CMVR 1989</span>
              {isEligible && (
                <Link to="/apply" className="font-bold underline text-xs flex items-center gap-1">
                  <span>Start Form 2</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Official Rule 32 Fee Breakdown & Anti-Tout Savings */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-slate-800 dark:text-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-blue-950 dark:text-blue-100">
                  {isHindi ? 'सरकारी शुल्क विवरण (Rule 32):' : 'Official CMVR Rule 32 Treasury Fees:'}
                </span>
                <span className="font-mono text-base font-extrabold text-blue-700 dark:text-blue-300">
                  ₹{officialFee}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between py-1 border-b border-blue-100 dark:border-blue-900/40">
                  <span>Form 2 Learner Licence Issue (Rule 32 item 1):</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">₹{currentVeh.appFee}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100 dark:border-blue-900/40">
                  <span>STALL Preliminary Knowledge Test Fee:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">₹{currentVeh.testFee}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-500">
                  <span>RTO Agent / Tout Demand (Extortion):</span>
                  <span className="font-mono line-through text-rose-500">₹{currentVeh.toutCost}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
              <div className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                🎉 Direct Citizen Savings: ₹{toutSavings}
              </div>
              <Link to="/can-i-apply">
                <button 
                  type="button" 
                  onClick={() => soundFx.tap()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Full Eligibility Check
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-MODEL AI COPILOT INTERACTIVE SHOWCASE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border border-indigo-800/50 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-300 text-xs font-semibold">
              <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{isHindi ? 'सार्थी एआई मल्टी-मॉडल सहायक' : 'Saathi AI Multi-Model Legal Assistant'}</span>
              <span>•</span>
              <span className="text-amber-300">6 AI Engines</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {isHindi ? (
                <>स्क्रीन पर घूमते रोबोट मैस्कॉट पर <span className="text-cyan-400">क्लिक करें और नमस्ते कहें!</span></>
              ) : (
                <>Meet Your Walking Mascot & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Multi-Model Assistant</span></>
              )}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isHindi
                ? 'हमारा इंटरैक्टिव रोबोट स्क्रीन के निचले हिस्से में टहलता है। उस पर क्लिक या होवर करने पर वह हाथ हिलाकर अभिवादन करता है और मिथुन, डीपसीक आर1 (तार्किक रीज़निंग), क्लॉड एवं चैटजीपीटी मॉडलों द्वारा कानूनी सलाह प्रदान करता है।'
                : 'Watch our rigged robotic companion patrol the bottom of your screen! Click or hover over the mascot to make it wave "Hi", play synthesizer chimes, and switch between Gemini 2.5 Flash, DeepSeek R1 (Chain of Thought), Claude 3.5, and GPT-4o for CMVR legal advisory.'}
            </p>

            {/* AI Engine Model Badges */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/40 text-blue-200 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                Gemini 2.5 Flash
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                DeepSeek R1 (CoT Trace)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 font-semibold flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-300" />
                Claude 3.5 Sonnet
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                GPT-4o & Offline Base
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                soundFx.waveChime()
                window.dispatchEvent(new CustomEvent('open-saathi-chat', {
                  detail: { prompt: 'Namaste Saathi! Explain the step-by-step Form 2 Learner Licence application process under CMVR 1989.' }
                }))
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/25 transition-all group"
            >
              <Bot className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
              <span>{isHindi ? 'रोबोट सहायक से बात करें' : 'Talk with Saathi Robot'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="text-[11px] text-cyan-200/80 text-center flex items-center justify-center gap-1">
              <span>👉</span>
              <span>{isHindi ? 'या नीचे टहलते रोबोट पर क्लिक करें' : 'Or tap the walking mascot at bottom right!'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED OFFICIAL RTO AUTHORITY BANNER */}
      {/* Clearly separated from normal citizen journey so applicants cannot self-verify */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>{isHindi ? 'आरटीओ अधिकारी संवीक्षा अधिकार क्षेत्र' : 'Restricted Official RTO Scrutiny Desk'}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isHindi ? 'अधिकृत परिवहन अधिकारी संवीक्षा एवं अनुमोदन पटल' : 'Authorized Licensing Authority Scrutiny & Approval Desk'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {isHindi 
                ? 'यह पटल केवल अधिकृत मोटर वाहन निरीक्षकों (MVI) एवं आरटीओ अधिकारियों के लिए सुरक्षित है। नागरिक एवं आवेदक अपने आवेदन को स्वयं अनुमोदित नहीं कर सकते हैं।' 
                : 'Designated Transport Department Officers can sign in to inspect citizen Form 2 uploads, verify DigiLocker documents, and grant official Form 3 LL approvals.'}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link to="/admin/login">
              <button className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all group">
                <Lock className="w-4 h-4 text-purple-200" />
                <span>{isHindi ? 'अधिकारी लॉगिन / संवीक्षा प्रवेश' : 'RTO Officer Sign In'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function JourneyCard({ to, icon, title, subtitle, badge, stepNum, variants }) {
  return (
    <Link to={to} className="block group h-full">
      <motion.div 
        variants={variants}
        whileTap={{ scale: 0.98 }}
        className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
              {stepNum}
            </span>
          </div>

          <div className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-2">
            {badge}
          </div>

          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
            {title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
          <span>Explore Step</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>
    </Link>
  )
}
