'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Search, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'
import config from '@/data/config.json'

export default function Track() {
  const [lang] = useStickyState('en', 'app-lang')
  const [appNo, setAppNo] = useState('')
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleTrack = async () => {
    setLoading(true)
    try {
      let data = null
      try {
        const res = await fetch(`/api/track?app_no=${encodeURIComponent(appNo)}`)
        if (res.ok) {
          data = await res.json()
        }
      } catch (e) {
        console.warn("Live API fetch fallback to local dataset", e)
      }

      if (data && data.success && data.timeline) {
        setTimeline(data.timeline)
      } else {
        const cleanNo = appNo.trim().toUpperCase()
        const found = config.sample_applications.find(
          (a) => a.application_number.toUpperCase() === cleanNo
        )
        if (found) {
          setTimeline(found.timeline.map((item) => ({
            step: item.title,
            status: item.completed ? 'done' : 'pending',
            date: item.date && item.date !== 'Pending' && item.date !== 'In Progress' ? item.date : null
          })))
        } else if (cleanNo.startsWith('APP')) {
          setTimeline([
            { 
              step: lang === 'hi' ? "आवेदन जमा एवं शुल्क भुगतान पूर्ण (₹200)" : "Application Submitted & Fee Paid (₹200)", 
              status: "done", 
              date: new Date().toISOString() 
            },
            { 
              step: lang === 'hi' ? "डिजीलॉकर ई-केवाईसी एवं दस्तावेज संवीक्षा" : "DigiLocker e-KYC & Document Scrutiny", 
              status: "pending", 
              date: null 
            },
            { 
              step: lang === 'hi' ? "एलएल ऑनलाइन टेस्ट स्लॉट बुकिंग" : "LL Online Test Slot Booking", 
              status: "pending", 
              date: null 
            },
            { 
              step: lang === 'hi' ? "लर्नर्स लाइसेंस अनुमोदन (फॉर्म 3)" : "Learner's Licence Approval (Form 3)", 
              status: "pending", 
              date: null 
            }
          ])
        } else {
          alert(lang === 'hi' ? "आवेदन नहीं मिला। डेमो नंबर आज़माएँ: DL-2026-98124 या MH-2026-11492" : "Application not found. Try demo numbers: DL-2026-98124 or MH-2026-11492")
        }
      }
    } catch (error) {
      console.error("Tracking failed", error)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ChevronLeft className="w-4 h-4 mr-1" /> {lang === 'hi' ? 'वापस' : 'Back'}
      </Link>
      
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        {lang === 'hi' ? 'आवेदन ट्रैक करें' : 'Track Application'}
      </h1>
      
      <div className="flex gap-2 mb-8">
        <input 
          type="text" 
          placeholder="App No (e.g. APP123456)" 
          value={appNo}
          onChange={(e) => setAppNo(e.target.value.toUpperCase())}
          className="flex-1 p-3 border-2 rounded-xl focus:border-blue-600 outline-none dark:bg-slate-800 dark:text-white dark:border-slate-700"
        />
        <Button className="h-auto px-4 rounded-xl bg-blue-600 hover:bg-blue-700" disabled={!appNo || loading} onClick={handleTrack}>
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {timeline && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative ml-2">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" />
          {timeline.map((item, i) => (
            <div key={i} className="flex gap-4 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                ${item.status === 'done' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                {item.status === 'done' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
              </div>
              <div className="pt-1">
                <p className={`font-semibold ${item.status === 'done' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {item.step}
                </p>
                {item.date && <p className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}

          {/* Transparent Next Action & Rule 11(3) Guidance */}
          <div className="mt-8 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2 text-xs">
            <div className="font-semibold text-blue-800 dark:text-blue-300">
              📌 {lang === 'hi' ? 'अगला कदम (Next Steps):' : 'Next Recommended Step:'}
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-200">
              {lang === 'hi'
                ? 'नियम 11(3) CMVR के तहत 7 दिनों के भीतर ऑनलाइन STALL टेस्ट पूरा करें। टेस्ट पास करने के 30 दिन बाद स्थायी DL टेस्ट स्लॉट बुक किया जा सकता है।'
                : 'Take your STALL online test within 7 days (Rule 11(3) CMVR). Once passed, you can book your practical DL driving test 30 days after LL issue.'}
            </p>
            <div className="flex gap-2 pt-1">
              <Link href="/mock-test" className="flex-1">
                <Button className="w-full h-8 text-[11px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                  {lang === 'hi' ? 'मॉक टेस्ट दें' : 'Practice Mock Test'}
                </Button>
              </Link>
              <Link href="/permanent-dl" className="flex-1">
                <Button variant="outline" className="w-full h-8 text-[11px] rounded-lg">
                  {lang === 'hi' ? 'स्लॉट बुक करें' : 'Book DL Slot'}
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
