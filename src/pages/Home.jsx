import { motion } from 'framer-motion'
import { ChevronRight, FileText, CheckCircle, Car } from 'lucide-react'
import { Link } from 'react-router-dom'


export default function Home() {
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

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          Where are you in your <span className="text-blue-600">licence journey?</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Select your current stage to see your next steps.
        </p>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        <JourneyCard 
          href="/can-i-apply" 
          icon={<FileText className="text-blue-600" />} 
          title="Just starting" 
          subtitle="Check eligibility & apply for Learner's Licence"
          variants={itemVariants}
        />
        <JourneyCard 
          href="/learn" 
          icon={<CheckCircle className="text-green-600" />} 
          title="I have a learner's licence" 
          subtitle="Practice mock tests & book final test"
          variants={itemVariants}
        />
        <JourneyCard 
          href="/track" 
          icon={<Car className="text-orange-600" />} 
          title="I've applied and waiting" 
          subtitle="Track application status"
          variants={itemVariants}
        />
      </motion.div>

      {/* Footer warning required by Hackathon prompt */}
      <div className="absolute bottom-4 left-0 w-full text-center px-4">
        <p className="text-[10px] text-slate-400">
          Prototype with sample data. Check rules and fees with your state's RTO.
        </p>
      </div>
    </div>
  )
}

function JourneyCard({ href, icon, title, subtitle, variants }) {
  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <Link href={href} className="block">
      <motion.div 
        variants={variants || defaultVariants}
        whileTap={{ scale: 0.97 }}
        className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <ChevronRight className="text-slate-300 w-5 h-5" />
      </motion.div>
    </Link>
  )
}
