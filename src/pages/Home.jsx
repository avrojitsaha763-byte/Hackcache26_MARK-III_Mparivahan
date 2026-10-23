import { motion } from 'framer-motion'
import { ChevronRight, FileText, CheckCircle, Car, Award, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useStickyState } from '@/hooks/useStickyState'

export default function Home() {
  const [lang] = useStickyState('en', 'app-lang')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const isHindi = lang === 'hi'

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3">
          🇮🇳 {isHindi ? 'सारथी परिवहन सहायक' : 'Sarathi Parivahan Assistant'}
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {isHindi ? (
            <>अपनी ड्राइविंग <span className="text-blue-600">लाइसेंस यात्रा</span> शुरू करें</>
          ) : (
            <>Where are you in your <span className="text-blue-600">licence journey?</span></>
          )}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
          {isHindi ? 'अपने वर्तमान चरण का चयन करें और आगे के चरण देखें।' : 'Select your current stage to see your next steps.'}
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        <JourneyCard 
          to="/can-i-apply" 
          icon={<FileText className="text-blue-600 dark:text-blue-400 w-5 h-5" />} 
          title={isHindi ? 'शुरुआत कर रहे हैं' : 'Just starting'} 
          subtitle={isHindi ? 'पात्रता जांचें एवं आवेदन करें' : "Check eligibility & apply for Learner's Licence"}
          variants={itemVariants}
        />
        <JourneyCard 
          to="/learn" 
          icon={<CheckCircle className="text-green-600 dark:text-green-400 w-5 h-5" />} 
          title={isHindi ? 'लर्नर्स लाइसेंस है मेरे पास' : "I have a learner's licence"} 
          subtitle={isHindi ? 'ट्रैफिक संकेत सीखें एवं मॉक टेस्ट दें' : 'Practice traffic signs & take mock test'}
          variants={itemVariants}
        />
        <JourneyCard 
          to="/track" 
          icon={<Car className="text-orange-600 dark:text-orange-400 w-5 h-5" />} 
          title={isHindi ? 'आवेदन कर चुके हैं और प्रतीक्षा कर रहे हैं' : "I've applied and waiting"} 
          subtitle={isHindi ? 'आवेदन स्थिति एवं टाइमलाइन ट्रैक करें' : 'Track application status & timeline'}
          variants={itemVariants}
        />
        <JourneyCard 
          to="/permanent-dl" 
          icon={<Award className="text-purple-600 dark:text-purple-400 w-5 h-5" />} 
          title={isHindi ? 'स्थायी लाइसेंस की तैयारी' : 'Ready for Permanent Licence?'} 
          subtitle={isHindi ? '30 दिन का नियम एवं ड्राइविंग टेस्ट चेकलिस्ट' : '30-day rule & ADTT track test guide'}
          variants={itemVariants}
        />
        <JourneyCard 
          to="/admin" 
          icon={<ShieldCheck className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />} 
          title={isHindi ? 'आरटीओ अधिकारी पोर्टल' : 'RTO Official Scrutiny Desk'} 
          subtitle={isHindi ? 'दस्तावेज़ सत्यापन एवं लाइसेंस स्वीकृति' : 'Document verification, scrutiny & approvals'}
          variants={itemVariants}
        />
      </motion.div>

      {/* Official disclaimer required by Hackathon prompt */}
      <div className="mt-auto pt-8 text-center px-4">
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          Prototype with sample data. Check rules and fees with your state's RTO.
        </p>
      </div>
    </div>
  )
}

function JourneyCard({ to, icon, title, subtitle, variants }) {
  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <Link to={to} className="block group">
      <motion.div 
        variants={variants || defaultVariants}
        whileTap={{ scale: 0.97 }}
        className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-4 rounded-2xl shadow-sm hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600/50">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="text-slate-300 dark:text-slate-500 w-5 h-5 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
      </motion.div>
    </Link>
  )
}
