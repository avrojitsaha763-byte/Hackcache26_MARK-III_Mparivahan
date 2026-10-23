'use client'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useStickyState } from '@/hooks/useStickyState'

export default function PermanentDL() {
  const [lang] = useStickyState('en', 'app-lang')

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {lang === 'hi' ? 'स्थायी लाइसेंस' : 'Permanent Licence'}
      </motion.h1>

      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-6 dark:bg-orange-950/30 dark:border-orange-800/50">
        <div className="flex items-center gap-2 text-orange-800 dark:text-orange-300 font-semibold mb-2">
          <Calendar className="w-5 h-5" /> 30-Day Rule
        </div>
        <p className="text-sm text-orange-700 dark:text-orange-200">
          You must wait 30 days after your Learner's Licence is issued before applying for the permanent driving test. It expires in 6 months.
        </p>
      </div>

      <h2 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">Driving Test (ADTT) Checklist</h2>
      <ul className="space-y-3">
        {[
          "Valid Learner's Licence",
          "Vehicle with valid registration & insurance",
          "Helmet (for two-wheelers)",
          "Seatbelt properly functioning (for cars)"
        ].map((item, i) => (
          <li key={i} className="flex items-center gap-3 p-3 border rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-300">
            <ShieldAlert className="w-5 h-5 text-blue-500 shrink-0" />
            <span className="text-sm font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
