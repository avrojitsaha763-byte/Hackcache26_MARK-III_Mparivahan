'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  QrCode, 
  Copy, 
  Check, 
  Clock, 
  Sparkles,
  Zap,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

// Web Audio Chime Synthesis for Authentic Bank SMS Notification
function playBankSmsChime() {
  if (typeof window === 'undefined') return
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.3)
  } catch {}
}

// Load Official Razorpay Standard Checkout SDK
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBIN', short: 'SBI', color: 'from-blue-600 to-indigo-700' },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC', short: 'HDFC', color: 'from-blue-800 to-slate-900' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICIC', short: 'ICICI', color: 'from-amber-600 to-orange-700' },
  { id: 'axis', name: 'Axis Bank', code: 'UTIB', short: 'AXIS', color: 'from-rose-700 to-pink-800' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PUNB', short: 'PNB', color: 'from-yellow-600 to-amber-700' },
  { id: 'bob', name: 'Bank of Baroda', code: 'BARB', short: 'BOB', color: 'from-orange-600 to-amber-600' }
]

const ALL_OTHER_BANKS = [
  'Canara Bank',
  'Union Bank of India',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'IDBI Bank',
  'Yes Bank',
  'Federal Bank',
  'Indian Bank',
  'Central Bank of India',
  'Bank of India',
  'UCO Bank',
  'Indian Overseas Bank',
  'RBL Bank',
  'Bandhan Bank'
]

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '⚡', color: 'bg-blue-600' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', color: 'bg-purple-600' },
  { id: 'paytm', name: 'Paytm', icon: '🔷', color: 'bg-sky-500' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', color: 'bg-emerald-600' },
  { id: 'cred', name: 'CRED UPI', icon: '💳', color: 'bg-slate-900' }
]

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  onSuccess,
  amount = 350,
  applicantName = 'Citizen Applicant',
  phone = '9000000001',
  rtoCode = 'DL-01',
  vehicleClass = 'combo-bike-car',
  isHindi = false
}) {
  const [activeTab, setActiveTab] = useState('upi') // 'upi' | 'credit_card' | 'debit_card' | 'netbanking'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [completedReceipt, setCompletedReceipt] = useState(null)

  // 1. Credit Card Form State
  const [creditCardNumber, setCreditCardNumber] = useState('')
  const [creditCardName, setCreditCardName] = useState(applicantName || '')
  const [creditCardExpiry, setCreditCardExpiry] = useState('')
  const [creditCardCvv, setCreditCardCvv] = useState('')

  // 2. Debit Card Form State
  const [debitBank, setDebitBank] = useState('sbi')
  const [debitCardNumber, setDebitCardNumber] = useState('')
  const [debitCardExpiry, setDebitCardExpiry] = useState('')
  const [debitCardCvv, setDebitCardCvv] = useState('')

  // 3. UPI State
  const [upiMode, setUpiMode] = useState('qr') // 'qr' | 'vpa'
  const [upiId, setUpiId] = useState('')
  const [qrTimer, setQrTimer] = useState(300) // 5 minutes
  const [copiedUpi, setCopiedUpi] = useState(false)
  const [phoneScanModalOpen, setPhoneScanModalOpen] = useState(false)
  const [upiAppOverlay, setUpiAppOverlay] = useState(null) // { appName, appColor, step: 'review'|'pin', pin: '' }

  // 4. Netbanking State (Multi-step)
  const [selectedBank, setSelectedBank] = useState('sbi')
  const [otherBank, setOtherBank] = useState('')
  const [netbankingOverlay, setNetbankingOverlay] = useState(null) // { bankName, step: 'login'|'review'|'otp', userId: '', password: '', otp: '', generatedOtp: '' }
  const [showPassword, setShowPassword] = useState(false)

  // 5. 3D Secure / ACS Bank OTP Overlay State (for Cards)
  const [threeDSOverlay, setThreeDSOverlay] = useState(null) // { bankName, last4, amount, generatedOtp, otp: '', timer: 300 }

  const handleModalClose = () => {
    setCompletedReceipt(null)
    setError('')
    setThreeDSOverlay(null)
    setNetbankingOverlay(null)
    setUpiAppOverlay(null)
    setPhoneScanModalOpen(false)
    onClose()
  }

  // Initialize order from backend/serverless on open
  useEffect(() => {
    if (!isOpen) return

    let active = true
    const initOrder = async () => {
      try {
        const res = await api.createPaymentOrder({
          amount,
          applicantName,
          rtoCode,
          vehicleClass
        })
        if (active && res) setOrder(res)
      } catch (err) {
        console.warn('Order create notice:', err)
      }
    }
    initOrder()
    return () => { active = false }
  }, [isOpen, amount, applicantName, rtoCode, vehicleClass])

  // QR Timer Countdown
  useEffect(() => {
    let interval = null
    if (isOpen && activeTab === 'upi' && upiMode === 'qr' && qrTimer > 0 && !completedReceipt) {
      interval = setInterval(() => {
        setQrTimer((t) => Math.max(0, t - 1))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOpen, activeTab, upiMode, qrTimer, completedReceipt])

  if (!isOpen) return null

  // Card Formatters
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    return parts.length ? parts.join(' ') : v
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`
    }
    return v
  }

  const getCardBrand = (number) => {
    const clean = number.replace(/\D/g, '')
    if (clean.startsWith('4')) return 'VISA'
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD'
    if (/^(60|65|81|82)/.test(clean)) return 'RUPAY'
    if (/^3[47]/.test(clean)) return 'AMEX'
    return 'CARD'
  }

  const upiIdString = 'parivahan.easydl@sbi'
  const upiPayUri = `upi://pay?pa=${upiIdString}&pn=Sarathi%20Parivahan&am=${amount}&cu=INR&tn=Form2_Application_Fee_CMVR32`
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiPayUri)}`

  // Complete Payment Verification and mint Treasury Challan
  const finalizeVerification = async (payload) => {
    setLoading(true)
    setError('')

    try {
      const verifyRes = await api.verifyPayment({
        ...payload,
        orderId: order?.orderId,
        challanNo: order?.challanNo,
        amount,
        rtoCode,
        payerDetails: {
          name: applicantName,
          phone,
          bankName: payload.bankName || 'State Bank of India'
        }
      })

      setLoading(false)

      if (verifyRes && verifyRes.success && verifyRes.receipt) {
        setCompletedReceipt(verifyRes.receipt)
        setThreeDSOverlay(null)
        setNetbankingOverlay(null)
        setUpiAppOverlay(null)
        setPhoneScanModalOpen(false)

        // Pass back to Form 2 after 1.8 seconds celebration
        setTimeout(() => {
          onSuccess(verifyRes.receipt)
          onClose()
        }, 1800)
      } else {
        setError(verifyRes?.error || 'Payment verification could not be validated by Government Treasury.')
      }
    } catch (err) {
      setLoading(false)
      setError('Connection to Bharat e-Pay Treasury gateway timed out. Please retry.')
      console.error(err)
    }
  }

  // ----------------------------------------------------
  // RAZORPAY OFFICIAL STANDARD CHECKOUT LAUNCHER
  // ----------------------------------------------------
  const openRazorpayCheckout = async (preferredInstrument = null) => {
    setLoading(true)
    setError('')
    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded || !window.Razorpay) {
        setError('Could not load Razorpay SDK. You can use the direct Bank 3DS / Netbanking / UPI gateway below.')
        setLoading(false)
        return
      }

      const keyId = order?.razorpayKeyId || 'rzp_test_51GovTreasuryLL'
      const options = {
        key: keyId,
        amount: Math.round(Number(amount) * 100), // in paise
        currency: 'INR',
        name: 'Ministry of Road Transport and Highways',
        description: `Form 2 Statutory LL Fee (CMVR Rule 32) - ${rtoCode}`,
        image: 'https://cdn-icons-png.flaticon.com/512/330/330439.png',
        prefill: {
          name: applicantName,
          contact: phone || '9000000001',
          email: `${(phone || 'citizen').replace(/\D/g, '')}@parivahan.gov.in`
        },
        notes: {
          statutory_rule: 'Central Motor Vehicles Rules 1989, Rule 32',
          head_of_account: '0041-Taxes on Vehicles',
          rto_code: rtoCode,
          challan_no: order?.challanNo || 'GRN-PENDING'
        },
        theme: {
          color: '#1E3A8A'
        },
        handler: function (response) {
          finalizeVerification({
            paymentMode: preferredInstrument || activeTab,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            bankName: 'Razorpay Authorized Bank Gateway'
          })
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
          }
        }
      }

      if (preferredInstrument) {
        options.config = {
          display: {
            blocks: {
              preferred: {
                name: 'Pay using ' + preferredInstrument,
                instruments: [{ method: preferredInstrument }]
              }
            },
            sequence: ['block.preferred']
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (res) {
        setError(res.error?.description || 'Razorpay transaction could not be completed.')
        setLoading(false)
      })
      rzp.open()
      setLoading(false)
    } catch (err) {
      console.error(err)
      setError('Could not open Razorpay window. Please use the simulated 3DS / Netbanking / UPI flow below.')
      setLoading(false)
    }
  }

  // ----------------------------------------------------
  // FLOW 1: CREDIT & DEBIT CARD -> BANK 3D-SECURE ACS
  // ----------------------------------------------------
  const handleCreditCardPay = (e) => {
    e.preventDefault()
    const cleanNum = creditCardNumber.replace(/\s+/g, '')
    if (cleanNum.length < 15) {
      setError('Please enter a valid 16-digit credit card number.')
      return
    }
    if (creditCardExpiry.length < 5) {
      setError('Please enter a valid MM/YY expiry date.')
      return
    }
    if (creditCardCvv.length < 3) {
      setError('Please enter a valid 3-digit CVV.')
      return
    }

    setError('')
    const genOtp = Math.floor(100000 + Math.random() * 900000).toString()
    playBankSmsChime()
    setThreeDSOverlay({
      paymentMode: 'credit_card',
      bankName: `${getCardBrand(creditCardNumber)} Global Card Gateway`,
      last4: cleanNum.slice(-4),
      amount,
      generatedOtp: genOtp,
      otp: genOtp
    })
  }

  const handleDebitCardPay = (e) => {
    e.preventDefault()
    const cleanNum = debitCardNumber.replace(/\s+/g, '')
    if (cleanNum.length < 15) {
      setError('Please enter a valid 16-digit debit card number.')
      return
    }
    if (debitCardExpiry.length < 5) {
      setError('Please enter a valid MM/YY expiry date.')
      return
    }
    if (debitCardCvv.length < 3) {
      setError('Please enter a valid 3-digit CVV.')
      return
    }

    setError('')
    const bankObj = POPULAR_BANKS.find((b) => b.id === debitBank) || POPULAR_BANKS[0]
    const genOtp = Math.floor(100000 + Math.random() * 900000).toString()
    playBankSmsChime()
    setThreeDSOverlay({
      paymentMode: 'debit_card',
      bankName: bankObj.name,
      last4: cleanNum.slice(-4),
      amount,
      generatedOtp: genOtp,
      otp: genOtp
    })
  }

  const handleConfirmThreeDSOtp = () => {
    if (!threeDSOverlay?.otp || threeDSOverlay.otp.length < 6) {
      setError('Please enter a valid 6-digit OTP code.')
      return
    }
    finalizeVerification({
      paymentMode: threeDSOverlay.paymentMode,
      bankName: threeDSOverlay.bankName,
      last4: threeDSOverlay.last4
    })
  }

  // ----------------------------------------------------
  // FLOW 2: NETBANKING (Bank Select -> Login -> Review Debit -> Bank OTP)
  // ----------------------------------------------------
  const handleStartNetbanking = (e) => {
    e.preventDefault()
    const bankName = otherBank || POPULAR_BANKS.find((b) => b.id === selectedBank)?.name || 'State Bank of India'
    setError('')
    setNetbankingOverlay({
      bankName,
      step: 'login', // 'login' -> 'review' -> 'otp'
      userId: `CITIZEN_${phone.slice(-4) || '1001'}`,
      password: '',
      otp: '',
      generatedOtp: ''
    })
  }

  const handleNetbankingLoginSubmit = (e) => {
    e.preventDefault()
    if (!netbankingOverlay.userId || !netbankingOverlay.password) {
      setError('Please enter both Netbanking User ID and Password.')
      return
    }
    setError('')
    setNetbankingOverlay({
      ...netbankingOverlay,
      step: 'review'
    })
  }

  const handleNetbankingConfirmDebit = () => {
    const genOtp = Math.floor(100000 + Math.random() * 900000).toString()
    playBankSmsChime()
    setNetbankingOverlay({
      ...netbankingOverlay,
      step: 'otp',
      generatedOtp: genOtp,
      otp: genOtp
    })
  }

  const handleNetbankingOtpSubmit = () => {
    if (!netbankingOverlay.otp || netbankingOverlay.otp.length < 6) {
      setError('Please enter the 6-digit high-security OTP sent by your bank.')
      return
    }
    finalizeVerification({
      paymentMode: 'netbanking',
      bankName: `${netbankingOverlay.bankName} (Internet Banking)`
    })
  }

  // ----------------------------------------------------
  // FLOW 3: UPI APPS / INTENT & VPA
  // ----------------------------------------------------
  const handleLaunchUpiApp = (app) => {
    setError('')
    setUpiAppOverlay({
      appName: app.name,
      appColor: app.color,
      appIcon: app.icon,
      step: 'review', // 'review' -> 'pin'
      pin: '240981'
    })
  }

  const handleUpiVpaPay = (e) => {
    e.preventDefault()
    if (!upiId || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. 9000000001@paytm or name@okhdfcbank).')
      return
    }
    setError('')
    const matchedApp = UPI_APPS.find((a) => upiId.toLowerCase().includes(a.id)) || UPI_APPS[0]
    setUpiAppOverlay({
      appName: matchedApp.name,
      appColor: matchedApp.color,
      appIcon: matchedApp.icon,
      vpa: upiId,
      step: 'review',
      pin: '240981'
    })
  }

  const handleUpiPinSubmit = () => {
    if (!upiAppOverlay?.pin || upiAppOverlay.pin.length < 4) {
      setError('Please enter your 4 or 6-digit UPI PIN.')
      return
    }
    finalizeVerification({
      paymentMode: 'upi',
      bankName: `${upiAppOverlay.appName} (NPCI UPI)`,
      upiId: upiAppOverlay.vpa || `${phone}@upi`
    })
  }

  // ----------------------------------------------------
  // FLOW 4: VALID DYNAMIC QR CODE & MOBILE SCAN SIMULATOR
  // ----------------------------------------------------
  const handleUpiQrVerify = () => {
    finalizeVerification({
      paymentMode: 'upi',
      bankName: 'NPCI / BHIM Dynamic QR',
      upiChannel: 'BHARAT_QR'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Gateway Official Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-4 sm:p-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white text-base">
                🇮🇳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    Bharat e-Pay Treasury Gateway
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    LIVE GATEWAY
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80">
                  National Non-Tax Receipt Portal (NTRP) & Sarathi Parivahan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openRazorpayCheckout()}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/30 cursor-pointer transition-all"
                title="Launch official Razorpay Standard Checkout popup"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Razorpay Modal</span>
              </button>

              <button
                type="button"
                onClick={handleModalClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Amount Badge Banner */}
          <div className="mt-3.5 pt-3.5 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-200/70 block">Statutory Fee (CMVR Rule 32):</span>
              <strong className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                ₹{amount}
              </strong>
            </div>
            <div className="text-right text-[11px] text-blue-200/80">
              <span className="block font-mono text-[10px] text-slate-300">
                Order: {order?.orderId || 'ORD-PARIVAHAN-2026'}
              </span>
              <span className="flex items-center gap-1 justify-end text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
              </span>
            </div>
          </div>
        </div>

        {/* Hackathon Evaluation Sandbox Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold text-xs">
              {isHindi ? 'सैंडबॉक्स परीक्षण गेटवे:' : 'Hackathon Evaluation Sandbox:'}
            </span>
            <span className="text-[11px] text-amber-800/90 dark:text-amber-300/80">
              {isHindi ? 'CMVR नियम 32 सांकेतिक चालान सिमुलेशन। कोई वास्तविक शुल्क नहीं कटेगा।' : 'Simulated CMVR Rule 32 Treasury Challan workflow. No real financial debit occurs.'}
            </span>
          </div>
          <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-md text-[10px] font-mono font-bold tracking-wider">
            ⚠️ SIMULATED TRANSACTION
          </span>
        </div>

        {/* Modal Main Body */}
        {!completedReceipt ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Mode Selector Tabs */}
            <div className="w-full md:w-52 bg-slate-50 dark:bg-slate-950 p-2 sm:p-3 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex md:flex-col gap-1.5 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => { setActiveTab('upi'); setError('') }}
                className={`flex-1 md:flex-none py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'upi'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="whitespace-nowrap">{isHindi ? 'यूपीआई (UPI / QR)' : 'Pay with UPI / QR'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('credit_card'); setError('') }}
                className={`flex-1 md:flex-none py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'credit_card'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="whitespace-nowrap">{isHindi ? 'क्रेडिट कार्ड' : 'Pay with Credit Card'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('debit_card'); setError('') }}
                className={`flex-1 md:flex-none py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'debit_card'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="whitespace-nowrap">{isHindi ? 'डेबिट कार्ड' : 'Pay with Debit Card'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('netbanking'); setError('') }}
                className={`flex-1 md:flex-none py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'netbanking'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="whitespace-nowrap">{isHindi ? 'नेट बैंकिंग' : 'Pay with Netbanking'}</span>
              </button>

              {/* Mobile Razorpay Quick Button */}
              <div className="pt-2 sm:hidden">
                <Button
                  type="button"
                  onClick={() => openRazorpayCheckout()}
                  className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  Razorpay Modal
                </Button>
              </div>
            </div>

            {/* Right Interactive Payment Panes */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: UPI (DYNAMIC QR & APP ROUTING) */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  {/* Mode Selector: Dynamic QR vs UPI App / VPA */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setUpiMode('qr')}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        upiMode === 'qr'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" /> Scan Dynamic QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode('vpa')}
                      className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                        upiMode === 'vpa'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> UPI Apps & VPA
                    </button>
                  </div>

                  {upiMode === 'qr' ? (
                    <div className="flex flex-col items-center justify-center space-y-3.5 text-center py-2">
                      <div className="relative p-3 bg-white rounded-2xl shadow-xl border-2 border-blue-500/30">
                        <img
                          src={dynamicQrUrl}
                          alt="Dynamic UPI QR Code"
                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                        />
                        <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                          <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-300" /> ₹{amount} Exact
                          </span>
                        </div>
                      </div>

                      {/* Timer & Listening Indicator */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Awaiting UPI confirmation</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
                        <span>Scan with:</span>
                        <strong className="text-slate-700 dark:text-slate-300">GPay • PhonePe • Paytm • BHIM</strong>
                      </div>

                      {/* Copy UPI VPA Option */}
                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700/60">
                        <span className="text-slate-500 text-[11px]">UPI VPA:</span>
                        <code className="font-mono font-bold text-blue-600 dark:text-blue-400">{upiIdString}</code>
                        <button
                          type="button"
                          onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                              navigator.clipboard.writeText(upiIdString)
                              setCopiedUpi(true)
                              setTimeout(() => setCopiedUpi(false), 2000)
                            }
                          }}
                          className="ml-1 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Copy UPI ID"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Action Buttons: Simulate Mobile Scan OR Confirm Payment */}
                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <Button
                          type="button"
                          onClick={() => setPhoneScanModalOpen(true)}
                          className="w-full py-2.5 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4" />
                          <span>Simulate Phone Scan & PIN</span>
                        </Button>

                        <Button
                          type="button"
                          onClick={handleUpiQrVerify}
                          disabled={loading}
                          className="w-full py-2.5 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                          <span>Confirm QR Payment</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Mode B: UPI Apps / VPA Collect Request */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Choose UPI Payment App:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {UPI_APPS.map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => handleLaunchUpiApp(app)}
                              className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl flex items-center gap-2.5 transition-all text-left cursor-pointer group"
                            >
                              <span className="text-xl group-hover:scale-110 transition-transform">{app.icon}</span>
                              <div>
                                <strong className="text-xs text-slate-800 dark:text-slate-200 block">{app.name}</strong>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400">Launch App</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        <span className="flex-shrink mx-4 text-xs font-bold text-slate-400">OR ENTER VPA</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                      </div>

                      <form onSubmit={handleUpiVpaPay} className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Enter your UPI ID / Virtual Payment Address:
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. 9000000001@paytm or yourname@okaxis"
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-blue-600 font-mono"
                          />
                        </div>

                        {/* Quick handle pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {['@okaxis', '@okhdfcbank', '@paytm', '@ybl', '@ibl'].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                const base = upiId.split('@')[0] || phone
                                setUpiId(`${base}${handle}`)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                              {handle}
                            </button>
                          ))}
                        </div>

                        <Button
                          type="submit"
                          disabled={loading || !upiId}
                          className="w-full py-3 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4" />
                          Proceed to UPI App (₹{amount})
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT CARD */}
              {activeTab === 'credit_card' && (
                <form onSubmit={handleCreditCardPay} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Credit Card Number:
                      </label>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {getCardBrand(creditCardNumber)}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={creditCardNumber}
                        onChange={(e) => setCreditCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4532 8920 1204 8820"
                        maxLength={19}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono outline-none focus:border-blue-600"
                        autoFocus
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cardholder Name:
                    </label>
                    <input
                      type="text"
                      value={creditCardName}
                      onChange={(e) => setCreditCardName(e.target.value)}
                      placeholder="Name on Credit Card"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Expiry Date:
                      </label>
                      <input
                        type="text"
                        value={creditCardExpiry}
                        onChange={(e) => setCreditCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono text-center outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        CVV / CVC:
                      </label>
                      <input
                        type="password"
                        value={creditCardCvv}
                        onChange={(e) => setCreditCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono text-center outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Lock className="w-4 h-4" />
                    Proceed to Bank 3D Secure (₹{amount})
                  </Button>
                </form>
              )}

              {/* TAB 3: DEBIT CARD */}
              {activeTab === 'debit_card' && (
                <form onSubmit={handleDebitCardPay} className="space-y-4">
                  {/* Bank quick selection pills */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Select Issuing Debit Bank:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setDebitBank(b.id)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            debitBank === b.id
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {b.short}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Debit Card Number:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={debitCardNumber}
                        onChange={(e) => setDebitCardNumber(formatCardNumber(e.target.value))}
                        placeholder="6074 8201 9283 1092"
                        maxLength={19}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono outline-none focus:border-blue-600"
                        autoFocus
                      />
                      <CreditCard className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Expiry Date:
                      </label>
                      <input
                        type="text"
                        value={debitCardExpiry}
                        onChange={(e) => setDebitCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono text-center outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        CVV:
                      </label>
                      <input
                        type="password"
                        value={debitCardCvv}
                        onChange={(e) => setDebitCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="•••"
                        maxLength={3}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono text-center outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Lock className="w-4 h-4" />
                    Proceed to Bank 3D Secure (₹{amount})
                  </Button>
                </form>
              )}

              {/* TAB 4: NETBANKING */}
              {activeTab === 'netbanking' && (
                <form onSubmit={handleStartNetbanking} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Choose Your Internet Banking Institution:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setSelectedBank(b.id)
                            setOtherBank('')
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            selectedBank === b.id && !otherBank
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 shadow-sm'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {b.name}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {b.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Or Select from All Scheduled Indian Banks:
                    </label>
                    <select
                      value={otherBank}
                      onChange={(e) => setOtherBank(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-blue-600"
                    >
                      <option value="">-- Choose scheduled bank --</option>
                      {ALL_OTHER_BANKS.map((bankName) => (
                        <option key={bankName} value={bankName}>
                          {bankName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Proceed to Netbanking Login (₹{amount})</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS & OFFICIAL TREASURY E-RECEIPT */
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 rounded-full text-[11px] font-bold text-amber-800 dark:text-amber-300">
              ⚠️ SIMULATED TRANSACTION (EVALUATION DEMO)
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {completedReceipt.is_simulated_demo ? 'Simulated Payment Challan Verified!' : 'Payment Received & Verified!'}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1">
                {completedReceipt.is_simulated_demo 
                  ? 'Simulated Treasury Challan generated for hackathon evaluation. No real money was debited.' 
                  : 'Official Treasury receipt verified via gateway cryptographic signature.'}
              </p>
            </div>

            {/* Statutory Treasury e-Challan */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5 font-mono">
              <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Government Challan No (GRN):</span>
                <strong className="text-blue-600 dark:text-blue-400 font-bold">{completedReceipt.challanNo}</strong>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Bank Reference No (BRN):</span>
                <strong className="text-slate-800 dark:text-slate-200">{completedReceipt.bankRef}</strong>
              </div>
              {completedReceipt.npciUtr && (
                <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">NPCI UPI UTR:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{completedReceipt.npciUtr}</strong>
                </div>
              )}
              <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Payment Mode:</span>
                <strong className="text-slate-800 dark:text-slate-200 uppercase">{completedReceipt.paymentMode}</strong>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1">
                <span className="text-slate-700 dark:text-slate-300">Amount Paid:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">₹{completedReceipt.amount}.00</strong>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-center gap-1.5 animate-pulse">
              <span>Attaching Treasury e-Challan & Submitting Form 2</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Gateway Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between px-6">
          <span>Digital India • Bharat e-Pay</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Lock className="w-3 h-3" /> PCI-DSS & RBI Certified
          </span>
        </div>
      </motion.div>

      {/* ==================================================== */}
      {/* 1. BANK 3D-SECURE ACS OVERLAY (CREDIT & DEBIT CARDS)  */}
      {/* ==================================================== */}
      <AnimatePresence>
        {threeDSOverlay && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Bank 3D Secure Authentication
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {threeDSOverlay.bankName} verification for ₹{threeDSOverlay.amount}
                </p>
              </div>

              {/* Bank SMS Alert Banner */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-left space-y-1">
                <div className="flex items-center justify-between text-amber-800 dark:text-amber-200 font-bold">
                  <span>📩 Bank SMS Dispatched</span>
                  <span className="text-[10px]">Just Now</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300">
                  OTP for ₹{threeDSOverlay.amount} to Sarathi on card ending {threeDSOverlay.last4} sent to linked number ending in {phone.slice(-4) || '4763'}.
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] text-slate-500">Security Code:</span>
                  <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-xs">
                    {threeDSOverlay.generatedOtp}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-left">
                  Enter 6-Digit Bank SMS Code:
                </label>
                <input
                  type="text"
                  value={threeDSOverlay.otp}
                  onChange={(e) => setThreeDSOverlay({ ...threeDSOverlay, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="------"
                  maxLength={6}
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-600"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setThreeDSOverlay(null)}
                  className="flex-1 h-10 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmThreeDSOtp}
                  disabled={loading || threeDSOverlay.otp.length < 6}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Authorize & Pay'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* 2. NETBANKING MULTI-STEP MODAL (LOGIN -> REVIEW -> OTP) */}
      {/* ==================================================== */}
      <AnimatePresence>
        {netbankingOverlay && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    🏦
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {netbankingOverlay.bankName}
                    </h4>
                    <span className="text-[10px] text-slate-400">Official Internet Banking Gateway</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNetbankingOverlay(null)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* STEP 1: Bank Netbanking Login */}
              {netbankingOverlay.step === 'login' && (
                <form onSubmit={handleNetbankingLoginSubmit} className="space-y-3.5">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                    Sign in to your {netbankingOverlay.bankName} account to authorize statutory debit of <strong>₹{amount}.00</strong>.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      User ID / Customer ID:
                    </label>
                    <input
                      type="text"
                      value={netbankingOverlay.userId}
                      onChange={(e) => setNetbankingOverlay({ ...netbankingOverlay, userId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-600"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Netbanking Password / IPIN:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={netbankingOverlay.password}
                        onChange={(e) => setNetbankingOverlay({ ...netbankingOverlay, password: e.target.value })}
                        placeholder="Enter your bank password"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Login & Review Payment Details
                  </Button>
                </form>
              )}

              {/* STEP 2: Review & Debit Confirmation */}
              {netbankingOverlay.step === 'review' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Beneficiary:</span>
                      <strong className="text-slate-900 dark:text-white">Ministry of Road Transport & Highways</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Portal / Merchant:</span>
                      <strong className="text-slate-900 dark:text-white">Sarathi Parivahan (Head 0041)</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Debiting Account:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">Savings A/c •••• 8492</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500">Applicant:</span>
                      <strong className="text-slate-900 dark:text-white">{applicantName}</strong>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold pt-1">
                      <span className="text-slate-800 dark:text-slate-200">Total Debit Sum:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">₹{amount}.00</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                    Please review payment particulars carefully. On confirmation, an SMS OTP will be dispatched to your registered phone number to finalize debit.
                  </p>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNetbankingOverlay({ ...netbankingOverlay, step: 'login' })}
                      className="flex-1 h-10 rounded-xl text-xs cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNetbankingConfirmDebit}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      Confirm Debit & Request OTP
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Bank High-Security OTP */}
              {netbankingOverlay.step === 'otp' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200">
                      <span>📩 High-Security OTP Dispatched</span>
                      <span className="text-[10px]">Just Now</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      {netbankingOverlay.bankName} sent OTP to +91 ******{phone.slice(-4) || '4763'}.
                    </p>
                    <div className="flex justify-between items-center pt-1 border-t border-amber-200 dark:border-amber-800">
                      <span className="text-[10px] text-slate-500">Generated Code:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{netbankingOverlay.generatedOtp}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Enter 6-Digit Bank SMS Code:
                    </label>
                    <input
                      type="text"
                      value={netbankingOverlay.otp}
                      onChange={(e) => setNetbankingOverlay({ ...netbankingOverlay, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="------"
                      maxLength={6}
                      className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-600"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setNetbankingOverlay(null)}
                      className="flex-1 h-10 rounded-xl text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNetbankingOtpSubmit}
                      disabled={loading || netbankingOverlay.otp.length < 6}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Authorize Transaction'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* 3. UPI APP REROUTING OVERLAY (GPay/PhonePe/Paytm/PIN) */}
      {/* ==================================================== */}
      <AnimatePresence>
        {upiAppOverlay && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              {/* App Branded Header */}
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{upiAppOverlay.appIcon || '⚡'}</span>
                  <div className="text-left">
                    <strong className="text-sm text-slate-900 dark:text-white block">{upiAppOverlay.appName}</strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">UPI Linked & Active</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUpiAppOverlay(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1: Review & Pay */}
              {upiAppOverlay.step === 'review' && (
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto text-2xl font-bold">
                    🏛️
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full mb-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified Merchant
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Sarathi Parivahan
                    </h4>
                    <p className="text-xs font-mono text-slate-500">
                      {upiIdString}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paying from:</span>
                      <strong className="text-slate-800 dark:text-slate-200">State Bank of India •••• 8492</strong>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm pt-1">
                      <span className="text-slate-800 dark:text-slate-200">Amount:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{amount}.00</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setUpiAppOverlay({ ...upiAppOverlay, step: 'pin' })}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    Pay ₹{amount}.00
                  </Button>
                </div>
              )}

              {/* Step 2: UPI PIN Pad Screen */}
              {upiAppOverlay.step === 'pin' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>ENTER 6-DIGIT UPI PIN</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Paying ₹{amount} to Sarathi Parivahan
                    </p>
                  </div>

                  <div>
                    <input
                      type="password"
                      value={upiAppOverlay.pin}
                      onChange={(e) => setUpiAppOverlay({ ...upiAppOverlay, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      placeholder="••••••"
                      maxLength={6}
                      className="w-full text-center tracking-[0.5em] font-mono text-2xl py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-600"
                      autoFocus
                    />
                  </div>

                  <p className="text-[10px] text-slate-400">
                    UPI PINs are confidential. Never share your PIN with anyone.
                  </p>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUpiAppOverlay({ ...upiAppOverlay, step: 'review' })}
                      className="flex-1 h-10 rounded-xl text-xs cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpiPinSubmit}
                      disabled={loading || upiAppOverlay.pin.length < 4}
                      className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit PIN'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* 4. SIMULATED PHONE SCAN MODAL (QR CODE FLOW)         */}
      {/* ==================================================== */}
      <AnimatePresence>
        {phoneScanModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-800">
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Camera Scanned QR
                </span>
                <button
                  type="button"
                  onClick={() => setPhoneScanModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-500/30">
                🇮🇳
              </div>

              <div>
                <h4 className="font-extrabold text-base text-white">
                  Sarathi Parivahan
                </h4>
                <p className="text-xs font-mono text-slate-400">
                  {upiIdString}
                </p>
                <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                  ₹{amount}.00
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Debit Account:</span>
                  <span className="font-mono text-slate-200">SBI A/c •••• 8492</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Statutory Purpose:</span>
                  <span className="text-slate-300">CMVR 1989 Rule 32</span>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs text-slate-400 block font-mono">Enter 4-Digit UPI PIN:</label>
                <input
                  type="password"
                  defaultValue="2409"
                  maxLength={4}
                  className="w-full text-center tracking-[0.6em] font-mono text-xl py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <Button
                type="button"
                onClick={() => {
                  setPhoneScanModalOpen(false)
                  handleUpiQrVerify()
                }}
                disabled={loading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm & Authorize Debit'}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
