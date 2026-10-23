'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ShieldCheck, CheckCircle2, AlertTriangle, Eye, UserCheck, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

export default function AdminPortal() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const [applications, setApplications] = useState([
    {
      appNo: "DL-2026-98124",
      name: "Avrojit Saha",
      phone: "+91 98765 43210",
      rto: "DL-01 (Mall Road / North Delhi)",
      category: "MCWG + LMV (Bike & Car Combo)",
      feePaid: "₹350 (CMVR Rule 32)",
      ekycStatus: "Verified (Aadhaar / DigiLocker)",
      docs: ["Aadhaar e-KYC", "10th CBSE Marksheet", "Form 1 Medical Self-Declaration"],
      status: "Under Scrutiny",
      submissionDate: "2026-10-22"
    },
    {
      appNo: "MH-2026-11492",
      name: "Shubham Kumar",
      phone: "+91 98112 23344",
      rto: "MH-02 (Andheri / Mumbai West)",
      category: "LMV (Private Car)",
      feePaid: "₹200",
      ekycStatus: "Verified (DigiLocker)",
      docs: ["Aadhaar Card", "Municipal Birth Certificate", "Form 1"],
      status: "Under Scrutiny",
      submissionDate: "2026-10-23"
    },
    {
      appNo: "KA-2026-55319",
      name: "Aritro Roy",
      phone: "+91 98450 12345",
      rto: "KA-01 (Koramangala / Bengaluru Central)",
      category: "MCWG (Geared Motorbike)",
      feePaid: "₹200",
      ekycStatus: "Verified (Aadhaar OTP)",
      docs: ["Aadhaar e-KYC", "Passport", "Form 1"],
      status: "Approved",
      submissionDate: "2026-10-20"
    }
  ])

  const [selectedApp, setSelectedApp] = useState(null)
  const [actionNotice, setActionNotice] = useState('')

  const handleApprove = (appNo) => {
    setApplications(prev => prev.map(a => {
      if (a.appNo === appNo) {
        return { ...a, status: "Approved & LL Issued (Form 3)" }
      }
      return a
    }))
    setActionNotice(isHindi ? `आवेदन ${appNo} स्वीकृत! डिजिटल फॉर्म 3 एलएल जारी किया गया।` : `Application ${appNo} Approved! Digital Form 3 LL issued.`)
    setTimeout(() => setActionNotice(''), 4000)
    if (selectedApp && selectedApp.appNo === appNo) {
      setSelectedApp(prev => ({ ...prev, status: "Approved & LL Issued (Form 3)" }))
    }
  }

  const handleCorrection = (appNo) => {
    setApplications(prev => prev.map(a => {
      if (a.appNo === appNo) {
        return { ...a, status: "Correction Required" }
      }
      return a
    }))
    setActionNotice(isHindi ? `आवेदक ${appNo} को दस्तावेज सुधार सूचना भेजी गई।` : `SMS notice sent to ${appNo} requesting document re-upload.`)
    setTimeout(() => setActionNotice(''), 4000)
    if (selectedApp && selectedApp.appNo === appNo) {
      setSelectedApp(prev => ({ ...prev, status: "Correction Required" }))
    }
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white dark:bg-slate-900 transition-colors">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
      </Link>

      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-full text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> {isHindi ? 'आरटीओ अधिकारी संवीक्षा पोर्टल' : 'RTO Official Scrutiny Portal (Admin)'}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isHindi ? 'दस्तावेज संवीक्षा एवं स्वीकृति' : 'Document Scrutiny & Approval'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {isHindi 
            ? 'मोटर वाहन अधिनियम 1988 के तहत फॉर्म 2 आवेदनों एवं डिजीलॉकर प्रमाण पत्रों की संवीक्षा करें:' 
            : 'Review Form 2 citizen submissions & DigiLocker e-KYC documents under MV Act 1988:'}
        </p>
      </div>

      {actionNotice && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          <span>{actionNotice}</span>
        </motion.div>
      )}

      {/* Applications List */}
      <div className="space-y-3 mb-6">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {isHindi ? 'लंबित आवेदन सूची' : 'Pending Incoming Applications'} ({applications.length})
        </h2>

        {applications.map((app) => (
          <div 
            key={app.appNo}
            className={`p-3.5 rounded-2xl border transition-all ${
              selectedApp?.appNo === app.appNo
                ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 dark:border-blue-500'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{app.appNo}</span>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">{app.name}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.category}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                app.status.includes('Approved')
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300'
                  : app.status.includes('Correction')
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              }`}>
                {app.status}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 mb-3">
              <div>📍 {app.rto}</div>
              <div>💳 {isHindi ? 'शुल्क भुगतान:' : 'Statutory Fee:'} <span className="font-semibold text-slate-900 dark:text-white">{app.feePaid}</span></div>
              <div className="text-green-600 dark:text-green-400 font-medium">✓ {app.ekycStatus}</div>
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <button
                onClick={() => setSelectedApp(app)}
                className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> {isHindi ? 'संवीक्षा करें' : 'Inspect Docs'}
              </button>
              <Button
                onClick={() => handleApprove(app.appNo)}
                disabled={app.status.includes('Approved')}
                className="flex-1 h-8 text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                {isHindi ? 'स्वीकृत करें' : 'Approve Form 3'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Application Detailed Inspection Drawer */}
      {selectedApp && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-white dark:bg-slate-800 border-2 border-blue-600 dark:border-blue-500 rounded-2xl space-y-3 mb-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-500" />
              {isHindi ? 'दस्तावेज संवीक्षा विवरण:' : 'Document Scrutiny Dossier:'}
            </h3>
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{selectedApp.appNo}</span>
          </div>

          <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
            <div><strong>{isHindi ? 'आवेदक नाम:' : 'Applicant Name:'}</strong> {selectedApp.name} ({selectedApp.phone})</div>
            <div><strong>{isHindi ? 'वाहन श्रेणी:' : 'Vehicle COV:'}</strong> {selectedApp.category}</div>
            <div><strong>{isHindi ? 'आरटीओ केंद्र:' : 'Assigned RTO:'}</strong> {selectedApp.rto}</div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {isHindi ? 'डिजीलॉकर प्रमाणित दस्तावेज:' : 'DigiLocker Authenticated Documents:'}
            </div>
            {selectedApp.docs.map((doc, idx) => (
              <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] flex items-center justify-between">
                <span>{doc}</span>
                <span className="text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Digitally Verified
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleCorrection(selectedApp.appNo)}
              variant="outline"
              className="flex-1 h-9 text-xs rounded-xl text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-700"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {isHindi ? 'सुधार मांगें' : 'Request Correction'}
            </Button>
            <Button
              onClick={() => handleApprove(selectedApp.appNo)}
              disabled={selectedApp.status.includes('Approved')}
              className="flex-1 h-9 text-xs rounded-xl bg-green-600 hover:bg-green-700 text-white"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1" /> {isHindi ? 'स्वीकृत करें' : 'Approve & Issue LL'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
