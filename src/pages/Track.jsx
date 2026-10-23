import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Track() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen flex flex-col p-6 pt-8 pb-20"
    >
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Track Application</h1>
      <p className="text-sm text-slate-500 mt-1 mb-6">Check the status of your Learner's Licence submission.</p>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Clock className="w-5 h-5 text-orange-600" />
        <div>
          <h3 className="font-medium text-slate-800 text-sm">Status Tracker</h3>
          <p className="text-xs text-slate-500">Enter your application number to view live progress.</p>
        </div>
      </div>
    </motion.div>
  )
}
