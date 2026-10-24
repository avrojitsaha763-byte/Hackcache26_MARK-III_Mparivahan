import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle, 
  FileText, 
  UserCheck, 
  ArrowRight,
  BellRing,
  Lock
} from 'lucide-react'
import { api } from '@/lib/api'

// Plays a pleasant 2-tone mobile SMS notification chime
function playSmsChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    // Tone 1
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.15)

    // Tone 2
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880.00, now + 0.12) // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.35)
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export default function DigiLockerAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialPhone = '',
  vehicleClass = 'combo-bike-car',
  lang = 'en'
}) {
  const isHindi = lang === 'hi'
  const [authMode, setAuthMode] = useState('otp') // 'otp' | 'password'
  const [phone, setPhone] = useState(initialPhone || '')
  const [username, setUsername] = useState('demo_user')
  const [password, setPassword] = useState('123456')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('input') // 'input' | 'otp_sent' | 'verifying' | 'success'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(30)
  const [showSmsToast, setShowSmsToast] = useState(false)
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [fetchedDocs, setFetchedDocs] = useState(null)

  const [prevInitialPhone, setPrevInitialPhone] = useState(initialPhone)
  if (initialPhone !== prevInitialPhone) {
    setPrevInitialPhone(initialPhone)
    setPhone(initialPhone || '')
  }

  useEffect(() => {
    let interval = null
    if (step === 'otp_sent' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [step, timer])

  if (!isOpen) return null

  // Handle Requesting OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault()
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError(isHindi ? 'कृपया मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    setError('')

    const cleanPhone = phone.replace(/\D/g, '').slice(-10)
    const res = await api.requestDigilockerOtp(cleanPhone)
    setLoading(false)

    if (res && res.success) {
      setStep('otp_sent')
      setTimer(30)
      setShowSmsToast(true)
      playSmsChime()
      // Auto-hide SMS toast after 10 seconds if not interacted
      setTimeout(() => setShowSmsToast(false), 12000)
    } else {
      setError(res?.error || 'Failed to send OTP. Please try again.')
    }
  }

  // Handle Submitting OTP or Password
  const handleVerifyAuth = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')

    let token = null
    if (authMode === 'otp') {
      const res = await api.verifyDigilockerOtp(otp)
      if (res && res.success && res.token) {
        token = res.token
      } else {
        setLoading(false)
        setError(res?.error || (isHindi ? 'अमान्य ओटीपी। कृपया 123456 दर्ज करें।' : 'Invalid OTP. Please enter demo OTP: 123456'))
        return
      }
    } else {
      const res = await api.loginDigilockerPassword(username, password)
      if (res && res.success && res.token) {
        token = res.token
      } else {
        setLoading(false)
        setError(res?.error || (isHindi ? 'अमान्य क्रेडेंशियल।' : 'Invalid credentials. Use demo_user / 123456.'))
        return
      }
    }

    // Step 2: Fetch documents with token
    setStep('verifying')
    const docRes = await api.fetchDigilockerDocuments(vehicleClass, token)
    setLoading(false)

    if (docRes && docRes.success) {
      setFetchedDocs(docRes)
      setStep('success')
      // Auto close and send back to form after 2.2 seconds
      setTimeout(() => {
        onSuccess({
          ...docRes,
          phone: phone.replace(/\D/g, '').slice(-10),
          token
        })
        onClose()
      }, 2200)
    } else {
      setError(docRes?.error || 'Failed to retrieve documents from API Setu.')
      setStep('otp_sent')
    }
  }

  const handleCopyOtp = () => {
    navigator.clipboard.writeText('123456')
    setCopiedOtp(true)
    setTimeout(() => setCopiedOtp(false), 2000)
  }

  const handleAutoFillOtp = () => {
    setOtp('123456')
    setShowSmsToast(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md">
      {/* Floating Incoming SMS Simulation Banner */}
      <AnimatePresence>
        {showSmsToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md p-4 bg-slate-900/95 text-white border border-emerald-500/50 rounded-2xl shadow-2xl shadow-emerald-950/50 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    📩 VM-DGLKER (Govt of India)
                  </span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  <span className="font-mono font-bold text-emerald-300 text-sm">123456</span> is your DigiLocker OTP for Form 2 Sarathi Parivahan. Valid for 10 mins. Do not share.
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> One-Tap Auto Fill (123456)
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 border border-slate-700"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedOtp ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSmsToast(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* DigiLocker Official Government Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 sm:p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-base">
                🇮🇳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    मेरी पहचान (MeriPehchan)
                  </h3>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                    SSO GOV
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80">
                  DigiLocker & UIDAI National Single Sign-On Gateway
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-100/70">
            <span>RTO Service: <strong>Sarathi Parivahan Form 2</strong></span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> 256-bit Encrypted
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Step 1: Input Mobile or Username */}
          {step === 'input' && (
            <div>
              {/* Tab Selector */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'otp'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile OTP (Instant)
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('password')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === 'password'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> Username & PIN
                </button>
              </div>

              {authMode === 'otp' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'आधार / डिजीलॉकर पंजीकृत मोबाइल नंबर:' : 'Registered Mobile Number:'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        maxLength={15}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium outline-none focus:border-blue-600"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {isHindi
                        ? 'इस नंबर पर 6-अंकों का सुरक्षा ओटीपी प्रेषित किया जाएगा।'
                        : 'A 6-digit security OTP will be dispatched to this mobile number.'}
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !phone}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    {isHindi ? 'सुरक्षा ओटीपी प्राप्त करें' : 'Get DigiLocker Security OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Username / Aadhaar:
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="demo_user"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      6-Digit Security PIN / Password:
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-blue-600"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Demo credentials: <code className="text-blue-600 font-bold">demo_user</code> / PIN: <code className="text-blue-600 font-bold">123456</code>
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Sign In with PIN
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Step 2: OTP Sent - Enter 6-digit verification code */}
          {step === 'otp_sent' && (
            <form onSubmit={handleVerifyAuth} className="space-y-4">
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-2xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                    OTP Sent to Mobile
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Dispatched to: <strong className="font-mono text-slate-800 dark:text-slate-100">+91 {phone.slice(-10)}</strong>
                </p>
                <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <BellRing className="w-3.5 h-3.5 shrink-0" />
                  <span>Use demo security code <strong>123456</strong> shown in the alert.</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isHindi ? '6-अंकों का सुरक्षा ओटीपी दर्ज करें:' : 'Enter 6-Digit Security OTP:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Auto-Fill 123456
                  </button>
                </div>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-600"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {timer > 0 ? (
                    `Resend code in ${timer}s`
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      Resend OTP Now
                    </button>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">UIDAI & API Setu compliant</span>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isHindi ? 'ओटीपी सत्यापित करें एवं दस्तावेज प्राप्त करें' : 'Verify OTP & Retrieve Documents'}
              </button>
            </form>
          )}

          {/* Step 3: Verifying & Fetching from API Setu */}
          {step === 'verifying' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Retrieving Government Vault Dossier...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Connecting to API Setu & DigiLocker to fetch verified educational marksheet and identity documents.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Verification Success & Retrieved Docs Preview */}
          {step === 'success' && fetchedDocs && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-200">
                  ✓ DigiLocker e-KYC Verified Successfully!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  {fetchedDocs.verification?.remarks}
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Verified Citizen Dossier:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Full Name:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{fetchedDocs.data?.applicant_name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Date of Birth:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{fetchedDocs.data?.dob}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Permanent Address:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{fetchedDocs.data?.address}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 block mb-1.5">Authenticated Certificates Pulled:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {fetchedDocs.data?.documents_found?.map((d, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-[11px] text-blue-600 dark:text-blue-400">
                        <FileText className="w-3 h-3" /> {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 animate-pulse">
                <span>Redirecting back to Form 2 application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-500">
          Digital India • National e-Governance Division • Ministry of Electronics & IT
        </div>
      </motion.div>
    </div>
  )
}
