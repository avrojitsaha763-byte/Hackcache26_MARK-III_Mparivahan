import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'


export default function CanIApply() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen flex flex-col p-6 pt-8 pb-20"
    >
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Check Eligibility & Apply</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Find out if you can apply for a Learner's Licence today.</p>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-slate-800 text-sm">Age Requirement</h3>
              <p className="text-xs text-slate-500">16+ for gearless 2-wheeler, 18+ for light motor vehicle.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-slate-800 text-sm">Aadhaar Verification</h3>
              <p className="text-xs text-slate-500">Instant paperless verification with mobile linked Aadhaar.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
