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
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStickyState } from '@/hooks/useStickyState'

export default function Home() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

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
              <div className="text-amber-300 font-bold text-sm">Rule 11(3)</div>
              <div className="text-blue-200/70 text-[11px]">7-Day Test Deadline</div>
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
        <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-amber-900 dark:text-amber-200 font-bold block mb-1">
              {isHindi ? 'नियम 11(3) CMVR — 7 दिनों का ऑनलाइन टेस्ट नियम:' : 'Rule 11(3) CMVR — 7-Day Online STALL Test Rule:'}
            </strong>
            <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
              {isHindi
                ? 'सारथी पोर्टल पर नया आवेदन जमा करने के बाद 7 दिनों के भीतर ऑनलाइन परीक्षा पूर्ण करना अनिवार्य है, अन्यथा आवेदन स्वतः निरस्त हो जाता है।'
                : 'Applicants must appear for and complete the computerised learner licence test within 7 days of form submission, failing which the application lapses automatically.'}
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
