import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Building2, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft, 
  BadgeCheck, 
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { loginOfficer, registerOfficer, DEFAULT_OFFICERS } from '@/lib/adminAuth'
import { useStickyState } from '@/hooks/useStickyState'

export default function AdminAuth() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/admin'

  const [activeTab, setActiveTab] = useState('login') // 'login' | 'signup'
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Login form state
  const [loginId, setLoginId] = useState('RTO-OFFICER-DL01')
  const [loginPassword, setLoginPassword] = useState('AdminPassword2026!')
  const [loginRto, setLoginRto] = useState('DL-01')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regId, setRegId] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regDesignation, setRegDesignation] = useState('Senior Motor Vehicle Inspector (MVI)')
  const [regRto, setRegRto] = useState('DL-01 (Mall Road / North Delhi)')
  const [regRtoCode, setRegRtoCode] = useState('DL-01')
  const [regPassword, setRegPassword] = useState('')
  const [regBadge, setRegBadge] = useState('')

  const handleLogin = (e) => {
    e?.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    const res = loginOfficer(loginId, loginPassword)
    if (res.success) {
      setSuccessMsg(`Welcome, ${res.officer.designation} ${res.officer.name}. Entering RTO Scrutiny Desk...`)
      setTimeout(() => {
        navigate(redirectTarget)
      }, 700)
    } else {
      setErrorMsg(res.message)
    }
  }

  const handleQuickDemo = (officer) => {
    setLoginId(officer.officerId)
    setLoginPassword(officer.password)
    setLoginRto(officer.rtoCode)
    setErrorMsg('')

    const res = loginOfficer(officer.officerId, officer.password)
    if (res.success) {
      setSuccessMsg(`Demo Officer Authenticated: ${officer.name} (${officer.rto})`)
      setTimeout(() => {
        navigate(redirectTarget)
      }, 500)
    }
  }

  const handleRegister = (e) => {
    e?.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!regName || !regId || !regEmail || !regPassword) {
      setErrorMsg("All fields marked with an asterisk are mandatory for officer registration.")
      return
    }

    const res = registerOfficer({
      name: regName,
      officerId: regId,
      email: regEmail,
      designation: regDesignation,
      rto: regRto,
      rtoCode: regRtoCode,
      badgeNumber: regBadge || `MVI-${Math.floor(1000 + Math.random() * 9000)}`,
      password: regPassword
    })

    if (res.success) {
      setSuccessMsg(`Official registration complete! Entering Scrutiny Desk as ${res.officer.name}...`)
      setTimeout(() => {
        navigate(redirectTarget)
      }, 800)
    } else {
      setErrorMsg(res.message)
    }
  }

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 sm:py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'नागरिक पोर्टल पर वापस' : 'Back to Citizen Services Portal'}
        </Link>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden border-b border-blue-900/50">
            {/* National emblem watermark decorative */}
            <div className="absolute right-[-20px] top-[-20px] w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{isHindi ? 'भारत सरकार • आरटीओ आधिकारिक संवीक्षा' : 'Govt of India • RTO Scrutiny Authority'}</span>
              </div>
              <div className="text-[11px] text-blue-200/80 font-mono">
                SEC 8 & 9 CMVR • FACILITY LEVEL 3
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isHindi ? 'आरटीओ अधिकारी संवीक्षा एवं अनुमोदन पोर्टल' : 'Official RTO Scrutiny & Approval Portal'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 mt-1.5 max-w-xl">
              {isHindi 
                ? 'यह पोर्टल केवल अधिकृत परिवहन अधिकारियों के लिए है। आवेदक अपने फॉर्म को स्वयं सत्यापित नहीं कर सकते हैं।' 
                : 'Dedicated authentication gateway for designated Transport Licensing Authorities & Motor Vehicle Inspectors.'}
            </p>
          </div>

          {/* Statutory Security Disclaimer */}
          <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="leading-relaxed text-[11px] sm:text-xs">
              <strong>{isHindi ? 'सुरक्षा सूचना:' : 'Access Notice:'}</strong>{' '}
              {isHindi
                ? 'ड्राइविंग लाइसेंस आवेदकों एवं सामान्य नागरिकों के लिए यह पोर्टल प्रतिबंधित है। अनधिकृत पहुंच कानूनन दंडनीय है।'
                : 'Citizen licence applicants cannot access this portal or self-verify Form 2 submissions. Official RTO credentials required.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              {isHindi ? 'अधिकारी लॉगिन (Sign In)' : 'Officer Sign In'}
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-3.5 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center justify-center gap-2 ${
                activeTab === 'signup'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <BadgeCheck className="w-4 h-4" />
              {isHindi ? 'नया अधिकारी पंजीकरण' : 'Register New Officer'}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* Feedback Messages */}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200 mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-800 dark:text-green-200 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                <span className="font-medium">{successMsg}</span>
              </motion.div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' && (
              <div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'अधिकारी कर्मचारी आईडी अथवा शासकीय ईमेल' : 'Government Officer Employee ID or Official Email'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="e.g. RTO-OFFICER-DL01 or officer@parivahan.gov.in"
                        className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-mono"
                      />
                      <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'सुरक्षित अधिकारी पासवर्ड' : 'Secure Officer Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full p-3 pl-10 pr-10 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-mono"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'आरटीओ अधिकार क्षेत्र (Assigned Circle)' : 'Designated RTO Circle Jurisdiction'}
                    </label>
                    <div className="relative">
                      <select
                        value={loginRto}
                        onChange={(e) => setLoginRto(e.target.value)}
                        className="w-full p-3 pl-10 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="DL-01">DL-01 — Delhi (Mall Road / North Delhi Circle)</option>
                        <option value="MH-02">MH-02 — Maharashtra (Andheri / Mumbai West)</option>
                        <option value="KA-01">KA-01 — Karnataka (Koramangala / Bengaluru Central)</option>
                        <option value="WB-01">WB-01 — West Bengal (Beltala / Kolkata North)</option>
                        <option value="TN-01">TN-01 — Tamil Nadu (Chennai Central)</option>
                        <option value="UP-32">UP-32 — Uttar Pradesh (Lucknow Transport Nagar)</option>
                      </select>
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-600/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isHindi ? 'संवीक्षा पटल में प्रवेश करें' : 'Authenticate & Enter Scrutiny Desk'}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>

                {/* Instant 1-Click Demo Officer Section */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isHindi ? 'त्वरित डेमो अधिकारी चयन (1-क्लिक टेस्ट)' : '1-Click Quick Demo Officer Logins (For Reviewers):'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {DEFAULT_OFFICERS.map((officer) => (
                      <button
                        key={officer.officerId}
                        onClick={() => handleQuickDemo(officer)}
                        className="p-3 text-left border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all group"
                      >
                        <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {officer.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {officer.designation}
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                          📍 {officer.rtoCode}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REGISTER OFFICER FORM */}
            {activeTab === 'signup' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'अधिकारी का पूरा नाम *' : 'Officer Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Inspector Vikramaditya Singh"
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'शासकीय कर्मचारी आईडी *' : 'Govt Employee / Officer ID *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      placeholder="e.g. RTO-OFFICER-WB01"
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'आधिकारिक ईमेल *' : 'Official NIC / Transport Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="officer@parivahan.gov.in"
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'अधिकारी पदनाम (Designation)' : 'Department Designation'}
                    </label>
                    <select
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="Senior Motor Vehicle Inspector (MVI)">Senior Motor Vehicle Inspector (MVI)</option>
                      <option value="RTO Scrutiny Superintendent">RTO Scrutiny Superintendent</option>
                      <option value="Assistant Transport Commissioner">Assistant Transport Commissioner</option>
                      <option value="Licensing Authority Officer (Form 3/Form 7)">Licensing Authority Officer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'पदस्थापित आरटीओ क्षेत्र' : 'Assigned RTO Circle'}
                    </label>
                    <select
                      value={regRtoCode}
                      onChange={(e) => {
                        setRegRtoCode(e.target.value)
                        const map = {
                          'DL-01': 'DL-01 (Mall Road / North Delhi)',
                          'MH-02': 'MH-02 (Andheri / Mumbai West)',
                          'KA-01': 'KA-01 (Koramangala / Bengaluru Central)',
                          'WB-01': 'WB-01 (Beltala / Kolkata North)',
                          'TN-01': 'TN-01 (Chennai Central)',
                          'UP-32': 'UP-32 (Lucknow Transport Nagar)'
                        }
                        setRegRto(map[e.target.value] || e.target.value)
                      }}
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-xs sm:text-sm focus:border-blue-600 outline-none"
                    >
                      <option value="DL-01">DL-01 (Mall Road / North Delhi)</option>
                      <option value="MH-02">MH-02 (Andheri / Mumbai West)</option>
                      <option value="KA-01">KA-01 (Koramangala / Bengaluru Central)</option>
                      <option value="WB-01">WB-01 (Beltala / Kolkata North)</option>
                      <option value="TN-01">TN-01 (Chennai Central)</option>
                      <option value="UP-32">UP-32 (Lucknow Transport Nagar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'सुरक्षित पासवर्ड *' : 'Create Secure Password *'}
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full p-3 border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-xl text-sm focus:border-blue-600 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  ✓ I confirm that I am a gazetted/appointed licensing officer of the respective state transport department authorized to examine citizen Form 2 files and issue Form 3 Learner's Licences under the Central Motor Vehicles Rules 1989.
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-sm sm:text-base rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-600/20"
                >
                  <UserCheck className="w-4 h-4" />
                  {isHindi ? 'अधिकारी खाता पंजीकृत करें एवं प्रवेश करें' : 'Complete Registration & Access Scrutiny Desk'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
