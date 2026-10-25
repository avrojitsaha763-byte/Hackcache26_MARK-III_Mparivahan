'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  Search, 
  CheckCircle, 
  CheckCircle2,
  Clock, 
  AlertTriangle, 
  Download, 
  Sparkles,
  ShieldCheck,
  Loader2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'
import { api } from '@/lib/api'
import { generateForm3Pdf } from '@/lib/generateForm3Pdf'
import config from '@/data/config.json'

export default function Track() {
  const [lang] = useStickyState('en', 'app-lang')
  const [appNo, setAppNo] = useState('')
  const [currentApp, setCurrentApp] = useState(null)
  const [timeline, setTimeline] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState('')

  const isHindi = lang === 'hi'

  const handleTrackNumber = async (numberToSearch) => {
    const cleanNo = (numberToSearch || appNo).trim().toUpperCase()
    if (!cleanNo) return

    setLoading(true)
    setErrorMsg('')

    // Try unified API client first
    const apiResult = await api.trackApplication(cleanNo)
    if (apiResult && apiResult.success && apiResult.data) {
      setCurrentApp(apiResult.data)
      setTimeline(apiResult.timeline)
      setLoading(false)
      return
    }

    // Fallback to sample config
    const sample = config.sample_applications?.find(
      (a) => a.application_number.toUpperCase() === cleanNo
    )
    if (sample) {
      setCurrentApp({
        appNo: sample.application_number,
        name: sample.applicant_name,
        rto: sample.rto_code,
        category: sample.vehicle_classes?.join(', '),
        status: sample.status,
        feePaid: "₹200 Paid"
      })
      setTimeline(sample.timeline.map((item) => ({
        step: item.title,
        status: item.completed ? 'done' : item.active ? 'active' : 'pending',
        date: item.date && item.date !== 'Pending' && item.date !== 'In Progress' ? item.date : null
      })))
      setLoading(false)
      return
    }

    // Not found
    setErrorMsg(
      isHindi 
        ? `आवेदन संख्या "${cleanNo}" नहीं मिली। कृपया नमूना आवेदन संख्या में से चुनें या सही नंबर दर्ज करें।` 
        : `No application found for "${cleanNo}". Please verify the number or select one of the sample applications below.`
    )
    setCurrentApp(null)
    setTimeline(null)
    setLoading(false)
  }

  const handleQuickSelect = (no) => {
    setAppNo(no)
    handleTrackNumber(no)
  }

  const handleDownloadForm3 = async () => {
    if (!currentApp) return
    setDownloadingPdf(true)
    setDownloadSuccess('')
    setErrorMsg('')
    try {
      const result = await generateForm3Pdf(currentApp)
      setDownloadSuccess(
        isHindi 
          ? `फॉर्म 3 डिजिटल शिक्षार्थी अनुज्ञप्ति (${result.filename}) सफलतापूर्वक डाउनलोड की गई।`
          : `Form 3 Digital Learner's Licence (${result.filename}) downloaded successfully!`
      )
      setTimeout(() => setDownloadSuccess(''), 6000)
    } catch (err) {
      console.error('Error downloading Form 3 PDF:', err)
      setErrorMsg(
        isHindi 
          ? 'फॉर्म 3 पीडीएफ डाउनलोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' 
          : 'Failed to generate official Form 3 PDF. Please try again.'
      )
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6">
      <Link to="/" className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-medium">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'मुख्य पृष्ठ' : 'Back to Home'}
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{isHindi ? 'सारथी राष्ट्रीय ट्रैकर' : 'Sarathi National Application Tracker'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isHindi ? 'आवेदन स्थिति एवं टाइमलाइन' : 'Track Application Status & Scrutiny'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          {isHindi 
            ? 'अपनी फॉर्म 2 आवेदन संख्या दर्ज करें और डिजीलॉकर संवीक्षा, आरटीओ अनुमोदन एवं फॉर्म 3 एलएल स्थिति देखें।' 
            : 'Enter your Form 2 application number to check live DigiLocker scrutiny, official RTO approval, and digital LL issuance.'}
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder={isHindi ? 'उदा. DL-2026-98124 या MH-2026-11492' : 'e.g. DL-2026-98124 or MH-2026-11492'} 
              value={appNo} 
              onChange={(e) => setAppNo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleTrackNumber()}
              className="w-full p-3.5 pl-11 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-sm font-mono uppercase focus:border-blue-600 outline-none transition-colors"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
          </div>

          <Button 
            onClick={() => handleTrackNumber()} 
            disabled={loading || !appNo}
            className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20"
          >
            {loading ? (isHindi ? 'खोज जारी...' : 'Searching...') : (isHindi ? 'स्थिति जांचें' : 'Track Status')}
          </Button>
        </div>

        {/* 1-Click Sample Application Chips */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isHindi ? 'त्वरित नमूना आवेदन ट्रैक करें:' : '1-Click Sample Applications to Test:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickSelect('DL-2026-98124')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <span>DL-2026-98124</span>
              <span className="text-[10px] text-blue-600 font-sans font-bold">(Demo 01: Demo Applicant)</span>
            </button>
            <button
              onClick={() => handleQuickSelect('MH-2026-11492')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <span>MH-2026-11492</span>
              <span className="text-[10px] text-amber-600 font-sans font-bold">(Demo 02: Test User)</span>
            </button>
            <button
              onClick={() => handleQuickSelect('KA-2026-55319')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500 text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <span>KA-2026-55319</span>
              <span className="text-[10px] text-emerald-600 font-sans font-bold">(Demo 03: Sample Citizen - Approved)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{errorMsg}</span>
        </motion.div>
      )}

      {/* Search Result Overview & Timeline */}
      {currentApp && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            {/* Demo Record Notice Badge */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                DEMO DATA — NOT AN OFFICIAL LICENCE RECORD
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {currentApp.appNo}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentApp.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  COV: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentApp.category}</span>
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                  currentApp.status.includes('Approved')
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300'
                    : currentApp.status.includes('Correction')
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300'
                }`}>
                  {currentApp.status}
                </span>
                {currentApp.llNumber && (
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    LL No: {currentApp.llNumber}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Details Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">RTO Office:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentApp.rto}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Statutory Fee:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{currentApp.feePaid}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">e-KYC Status:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Verified (DigiLocker)</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{isHindi ? 'ज्ञान परीक्षा (STALL):' : 'Knowledge Test (STALL):'}</span>
                <strong className="text-blue-600 dark:text-blue-400 font-semibold">{isHindi ? 'CMVR नियम 11 (60% पासिंग)' : 'CMVR Rule 11 (60% Pass Mark)'}</strong>
              </div>
            </div>

            {/* Form 3 LL Issued Banner */}
            {currentApp.status.includes('Approved') && (
              <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <strong className="text-emerald-900 dark:text-emerald-200 font-bold block">
                      Form 3 Learner's Licence Generated & Digitally Signed
                    </strong>
                    <span className="text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                      LL Number: {currentApp.llNumber || 'KA-01-LL-2026-0099418'}
                    </span>
                  </div>
                </div>
                <Button 
                  id="download-form3-btn"
                  size="sm" 
                  onClick={handleDownloadForm3}
                  disabled={downloadingPdf}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 shadow-sm shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {downloadingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isHindi ? 'डाउनलोड हो रहा है...' : 'Generating PDF...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'डिजिटल फॉर्म 3 डाउनलोड करें' : 'Download Digital Form 3'}</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Download Success Notice */}
            {downloadSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -6 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-400 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-200 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">{downloadSuccess}</span>
              </motion.div>
            )}

            {/* Correction Remark Banner */}
            {currentApp.remarks && currentApp.status.includes('Correction') && (
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Official RTO Scrutiny Remark:</strong> {currentApp.remarks}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Timeline Tracker */}
          {timeline && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-6">
                Official Stage-by-Stage Processing Audit
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {timeline.map((item, idx) => {
                  const isDone = item.status === 'done'
                  const isActive = item.status === 'active'
                  const isCorrection = item.status === 'correction'

                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                        isDone 
                          ? 'bg-emerald-500 text-white' 
                          : isCorrection
                          ? 'bg-amber-500 text-white'
                          : isActive 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950' 
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>

                      <div className="flex-1 pt-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <h4 className={`text-sm font-semibold ${
                            isDone 
                              ? 'text-slate-900 dark:text-white' 
                              : isActive 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {item.step}
                          </h4>
                          {item.date && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {item.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
