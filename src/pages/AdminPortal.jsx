'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  UserCheck, 
  FileText, 
  LogOut, 
  Search, 
  Filter, 
  Building2, 
  BadgeCheck, 
  FileCheck, 
  QrCode, 
  Download, 
  Printer, 
  X,
  ExternalLink,
  ChevronRight,
  Clock,
  Car,
  User,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'
import { getOfficerSession, logoutOfficer } from '@/lib/adminAuth'
import { getApplications, updateApplicationStatus } from '@/lib/applicationsStore'

export default function AdminPortal() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'
  const navigate = useNavigate()

  const [officer, setOfficer] = useState(() => getOfficerSession())
  const [applications, setApplications] = useState(() => getApplications())
  const [selectedApp, setSelectedApp] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [actionNotice, setActionNotice] = useState('')
  
  // Correction dialog state
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionRemarks, setCorrectionRemarks] = useState('')
  const [targetCorrectionApp, setTargetCorrectionApp] = useState(null)

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState(null)

  // Sync latest applications on mount
  useEffect(() => {
    const apps = getApplications()
    setApplications(apps)
    if (apps.length > 0 && !selectedApp) {
      setSelectedApp(apps[0])
    }
  }, [])

  const handleLogout = () => {
    logoutOfficer()
    navigate('/admin/login')
  }

  const handleApprove = (appNo) => {
    const updated = updateApplicationStatus(
      appNo, 
      "Approved & LL Issued (Form 3)", 
      "", 
      officer?.name || "RTO Scrutiny Officer"
    )
    setApplications(getApplications())
    if (selectedApp && selectedApp.appNo === appNo) {
      setSelectedApp(updated)
    }
    setActionNotice(
      isHindi 
        ? `आवेदन ${appNo} स्वीकृत! डिजिटल फॉर्म 3 एलएल (${updated.llNumber}) जारी किया गया।` 
        : `Application ${appNo} Approved! Digital Form 3 LL (${updated.llNumber}) generated & signed.`
    )
    setTimeout(() => setActionNotice(''), 5000)
  }

  const handleOpenCorrection = (app) => {
    setTargetCorrectionApp(app)
    setCorrectionRemarks(isHindi ? 'दस्तावेज अस्पष्ट है, कृपया पुनः अपलोड करें।' : 'Document image unclear or mismatch with application. Please re-upload verified copy via DigiLocker.')
    setShowCorrectionModal(true)
  }

  const handleSubmitCorrection = () => {
    if (!targetCorrectionApp) return
    const updated = updateApplicationStatus(
      targetCorrectionApp.appNo,
      "Correction Required",
      correctionRemarks,
      officer?.name || "RTO Scrutiny Officer"
    )
    setApplications(getApplications())
    if (selectedApp && selectedApp.appNo === targetCorrectionApp.appNo) {
      setSelectedApp(updated)
    }
    setShowCorrectionModal(false)
    setActionNotice(
      isHindi 
        ? `आवेदक ${targetCorrectionApp.name} (${targetCorrectionApp.appNo}) को एसएमएस सुधार सूचना प्रेषित।` 
        : `Correction notice & SMS request dispatched to applicant ${targetCorrectionApp.name} (${targetCorrectionApp.appNo}).`
    )
    setTimeout(() => setActionNotice(''), 5000)
  }

  // Filter logic
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase())

    if (statusFilter === 'ALL') return matchesSearch
    if (statusFilter === 'UNDER_SCRUTINY') return matchesSearch && app.status.includes('Scrutiny')
    if (statusFilter === 'APPROVED') return matchesSearch && app.status.includes('Approved')
    if (statusFilter === 'CORRECTION') return matchesSearch && app.status.includes('Correction')
    return matchesSearch
  })

  // Statistics counts
  const totalCount = applications.length
  const pendingCount = applications.filter(a => a.status.includes('Scrutiny')).length
  const approvedCount = applications.filter(a => a.status.includes('Approved')).length
  const correctionCount = applications.filter(a => a.status.includes('Correction')).length

  return (
    <div className="w-full min-h-screen flex flex-col pb-16">
      {/* Top Official Officer Identification Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{officer?.name || "Official Transport Officer"}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                ACTIVE SESSION
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>{officer?.designation || "Senior Motor Vehicle Inspector"}</span>
              <span>•</span>
              <span className="text-blue-300 font-medium">📍 {officer?.rto || "DL-01"}</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-slate-400">Badge: {officer?.badgeNumber || "MVI-2026"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right text-[11px] text-slate-400 font-mono pr-2 border-r border-slate-700">
            <div>CENTRAL MOTOR VEHICLES RULES</div>
            <div className="text-slate-300 font-semibold">FORM 2 SCRUTINY AUTHORITY</div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            size="sm"
            className="h-9 rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800 text-xs flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            {isHindi ? 'लॉगआउट' : 'Sign Out'}
          </Button>
        </div>
      </div>

      {/* Action Notification Alert Banner */}
      {actionNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 mb-6 flex items-center gap-3 shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">{actionNotice}</span>
        </motion.div>
      )}

      {/* Portal Header Title & Metric Cards */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isHindi ? 'आरटीओ दस्तावेज संवीक्षा एवं अनुमोदन पटल' : 'RTO Document Scrutiny & Approval Desk'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isHindi 
                ? 'मोटर वाहन अधिनियम 1988 के अंतर्गत डिजीलॉकर प्रमाणित फॉर्म 2 आवेदनों की आधिकारिक संवीक्षा एवं फॉर्म 3 एलएल जारी करने का अधिकार।' 
                : 'Scrutinize citizen Form 2 submissions, inspect DigiLocker authenticated certificates, and grant Form 3 LL issuance under MV Act 1988.'}
            </p>
          </div>
        </div>

        {/* Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Applications</div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalCount}</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 font-medium">All Jurisdiction Queue</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-sm">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Pending Scrutiny</div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Requires Officer Review</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Approved & LL Issued</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{approvedCount}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Form 3 Digitally Signed</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-sm">
            <div className="text-xs font-semibold text-red-700 dark:text-red-400">Correction Notices</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{correctionCount}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pending Citizen Re-upload</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-6 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHindi ? 'आवेदन संख्या, नाम अथवा वाहन श्रेणी खोजें...' : 'Search applicant name, DL application number, COV...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('UNDER_SCRUTINY')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'UNDER_SCRUTINY'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'APPROVED'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('CORRECTION')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'CORRECTION'
                ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Correction ({correctionCount})
          </button>
        </div>
      </div>

      {/* Main Split Screen Workdesk (Desktop Grid / Mobile Stack) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Applications Queue (5 Cols on Desktop) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {isHindi ? 'संवीक्षा कतार' : 'Scrutiny Queue'} ({filteredApps.length})
            </span>
            <span className="text-[11px] text-slate-400">Click to load dossier</span>
          </div>

          {filteredApps.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No applications match current filters.
            </div>
          ) : (
            filteredApps.map((app) => {
              const isSelected = selectedApp?.appNo === app.appNo
              const isApproved = app.status.includes('Approved')
              const isCorrection = app.status.includes('Correction')

              return (
                <div
                  key={app.appNo}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500 shadow-md ring-1 ring-blue-600/30'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        {app.appNo}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {app.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {app.category}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isApproved
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : isCorrection
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>📍 {app.rtoCode || app.rto}</div>
                    <div className="text-right">💳 {app.feePaid}</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> DigiLocker e-KYC
                    </div>
                    <div className="text-right text-slate-400">📅 {app.submissionDate}</div>
                  </div>

                  {isSelected && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:block">
                      <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Right Column: Comprehensive Applicant Dossier & Document Inspection (7 Cols on Desktop) */}
        <div className="lg:col-span-7">
          {selectedApp ? (
            <motion.div
              key={selectedApp.appNo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg space-y-6"
            >
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
                    <FileCheck className="w-3.5 h-3.5" /> Form 2 Citizen Dossier
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {selectedApp.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Application ID: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedApp.appNo}</span>
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                    selectedApp.status.includes('Approved')
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : selectedApp.status.includes('Correction')
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                  }`}>
                    {selectedApp.status}
                  </span>
                  {selectedApp.llNumber && (
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      LL No: {selectedApp.llNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Applicant Personal & Demographic Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Contact Phone & OTP:</span>
                  <strong className="text-slate-900 dark:text-white font-medium">{selectedApp.phone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Date of Birth & Age:</span>
                  <strong className="text-slate-900 dark:text-white font-medium">{selectedApp.dob || "2004-05-14 (22 Yrs)"}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Assigned RTO Jurisdiction:</span>
                  <strong className="text-slate-900 dark:text-white font-medium">{selectedApp.rto}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Class of Vehicle (COV):</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-medium">{selectedApp.category}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Statutory Fee Status:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedApp.feePaid}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">UIDAI e-KYC Verification:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Verified (DigiLocker)</strong>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-slate-500 dark:text-slate-400 block mb-0.5">Residential Address (as per Aadhaar):</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedApp.address || "Verified Indian Resident Address"}</span>
                </div>
              </div>

              {/* Uploaded Documents Scrutiny Shelf */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {isHindi ? 'डिजीलॉकर प्रमाणित दस्तावेज संवीक्षा' : 'Authenticated Documents & Uploads'}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click any document to inspect full preview
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(selectedApp.documents || [
                    { id: 'form1', title: 'Form 1 Medical Self-Declaration', type: 'Medical Rule 5(2)', verified: true, authority: 'Citizen Self-Sign' },
                    { id: 'aadhaar', title: 'Aadhaar e-KYC DigiLocker Certificate', type: 'UIDAI', verified: true, authority: 'DigiLocker' },
                    { id: 'marksheet', title: '10th Class CBSE Marksheet', type: 'Age Proof', verified: true, authority: 'CBSE' },
                    { id: 'fee', title: 'Statutory Fee e-Challan Receipt', type: 'Treasury Challan', verified: true, authority: 'Parivahan e-Pay' },
                  ]).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setPreviewDoc({ ...doc, applicant: selectedApp })}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {doc.title}
                          </h4>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Digitally Verified</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-medium group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Timeline Audit */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                  Official Processing Audit Trail
                </h4>
                <div className="space-y-2 text-xs">
                  {(selectedApp.timeline || []).map((step, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          step.status === 'done' ? 'bg-emerald-500' : step.status === 'correction' ? 'bg-amber-500' : 'bg-slate-300'
                        }`} />
                        <span>{step.step}</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">{step.date || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Action Controls */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleOpenCorrection(selectedApp)}
                  variant="outline"
                  className="h-11 rounded-xl text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-950/40 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 flex-1"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {isHindi ? 'दस्तावेज सुधार मांगें' : 'Request Correction (SMS Citizen)'}
                </Button>

                <Button
                  onClick={() => handleApprove(selectedApp.appNo)}
                  disabled={selectedApp.status.includes('Approved')}
                  className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 flex-1 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {selectedApp.status.includes('Approved') 
                    ? (isHindi ? 'स्वीकृत एवं फॉर्म 3 जारी' : 'Form 3 LL Already Issued') 
                    : (isHindi ? 'स्वीकृत करें एवं डिजिटल LL जारी करें' : 'Approve & Issue Form 3 LL')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              Select an applicant from the scrutiny queue to inspect documents and issue approval.
            </div>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              {/* Modal Top Bar */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">{previewDoc.title}</h3>
                    <p className="text-[11px] text-slate-400">DigiLocker Authenticated Government Dossier</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Document Visual Preview Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                <div className="p-6 bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl relative font-sans">
                  {/* Official Watermark / Badge */}
                  <div className="absolute right-4 top-4">
                    {previewDoc.dataUrl ? (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950/80 border border-blue-400 text-blue-800 dark:text-blue-300 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        RTO RESIZED & COMPLIANT
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-400 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        DIGITALLY VERIFIED
                      </span>
                    )}
                  </div>

                  <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                      GOVERNMENT OF INDIA • SARATHI PARIVAHAN
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                      {previewDoc.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Source / Gateway: <span className="font-semibold text-slate-700 dark:text-slate-300">{previewDoc.authority || "DigiLocker / Manual Scan"}</span>
                    </p>
                  </div>

                  {/* Render Scanned / Uploaded Image Preview if present */}
                  {previewDoc.dataUrl && (
                    <div className="mb-4 flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <img 
                        src={previewDoc.dataUrl} 
                        alt={previewDoc.title}
                        className="max-h-[260px] object-contain rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                      <div className="mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span>Dimensions: <strong className="text-emerald-600 dark:text-emerald-400">{previewDoc.dimensions || 'RTO Standard'}</strong></span>
                        <span>•</span>
                        <span>Size: <strong className="text-emerald-600 dark:text-emerald-400">{previewDoc.sizeKB ? `${previewDoc.sizeKB} KB` : 'Within Limit'}</strong></span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400">CMVR Rule 14 Validated</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500">Applicant Name:</span>
                      <strong className="text-slate-900 dark:text-white">{previewDoc.applicant?.name}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500">Application Number:</span>
                      <strong className="font-mono text-blue-600 dark:text-blue-400">{previewDoc.applicant?.appNo}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500">Document Type / Reference:</span>
                      <strong>{previewDoc.type}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-500">Document Identifier:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{previewDoc.docNumber || "CERT-VALID-2026-OK"}</span>
                    </div>
                    <div className="py-2">
                      <span className="text-slate-500 block mb-1">Verification Dossier Findings:</span>
                      <p className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-mono text-[11px]">
                        {previewDoc.details || "Official record matches demographics registered in the licensing database without any discrepancy. Verified by state transport server."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-4 h-4" /> Cryptographically Valid Signature
                    </div>
                    <div className="font-mono">
                      TIMESTAMP: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="text-[11px] text-slate-500">
                  Officer Inspection Audit ID: <span className="font-mono">{officer?.badgeNumber || 'MVI-2026'}</span>
                </div>
                <Button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-xl h-9 text-xs bg-slate-900 dark:bg-slate-700 text-white"
                >
                  Close Inspection
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CORRECTION REQUEST MODAL */}
      <AnimatePresence>
        {showCorrectionModal && targetCorrectionApp && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Document Correction Notice</span>
                </div>
                <button onClick={() => setShowCorrectionModal(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Send Correction Request to {targetCorrectionApp.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Application: <span className="font-mono font-bold text-blue-600">{targetCorrectionApp.appNo}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Specific Officer Remarks & Document to Re-upload:
                </label>
                <textarea
                  rows={4}
                  value={correctionRemarks}
                  onChange={(e) => setCorrectionRemarks(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCorrectionModal(false)}
                  className="flex-1 rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitCorrection}
                  className="flex-1 rounded-xl h-10 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Send Notice via SMS
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
