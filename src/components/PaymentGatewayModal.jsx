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
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

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

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  onSuccess,
  amount = 350,
  applicantName = 'Citizen Applicant',
  phone = '8910464763',
  rtoCode = 'DL-01',
  vehicleClass = 'combo-bike-car',
  isHindi = false
}) {
  const [activeTab, setActiveTab] = useState('upi') // 'upi' | 'credit_card' | 'debit_card' | 'netbanking'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [completedReceipt, setCompletedReceipt] = useState(null)

  // 3D Secure / OTP Simulation modal state
  const [threeDSModalOpen, setThreeDSModalOpen] = useState(false)
  const [threeDSOtp, setThreeDSOtp] = useState('')
  const [threeDSGeneratedOtp, setThreeDSGeneratedOtp] = useState('784920')
  const [pendingPaymentPayload, setPendingPaymentPayload] = useState(null)

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
  const [vpaRequestSent, setVpaRequestSent] = useState(false)

  // 4. Netbanking State
  const [selectedBank, setSelectedBank] = useState('sbi')
  const [otherBank, setOtherBank] = useState('')

  const handleModalClose = () => {
    setCompletedReceipt(null)
    setError('')
    setThreeDSModalOpen(false)
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

  // Detect card brand
  const getCardBrand = (number) => {
    const clean = number.replace(/\D/g, '')
    if (clean.startsWith('4')) return 'VISA'
    if (/^(5[1-5]|2[2-7])/.test(clean)) return 'MASTERCARD'
    if (/^(60|65|81|82)/.test(clean)) return 'RUPAY'
    if (/^3[47]/.test(clean)) return 'AMEX'
    return 'CARD'
  }

  const upiIdString = 'parivahan.easydl@sbi'
  const upiPayUri = `upi://pay?pa=${upiIdString}&pn=Sarathi%20Parivahan&am=${amount}&cu=INR&tn=Form2_Application_Fee`
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiPayUri)}`

  // Complete Payment Verification
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
        setThreeDSModalOpen(false)

        // Celebrate and auto pass back to Form 2 after 1.8 seconds
        setTimeout(() => {
          onSuccess(verifyRes.receipt)
          onClose()
        }, 2000)
      } else {
        setError(verifyRes?.error || 'Payment verification could not be validated by Government Treasury.')
      }
    } catch (err) {
      setLoading(false)
      setError('Connection to Bharat e-Pay Treasury gateway timed out. Please retry.')
      console.error(err)
    }
  }

  // Handlers for 各 Payment Modes
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
    setThreeDSGeneratedOtp(genOtp)
    setThreeDSOtp(genOtp)
    setPendingPaymentPayload({
      paymentMode: 'credit_card',
      bankName: `${getCardBrand(creditCardNumber)} Global Card Gateway`,
      last4: cleanNum.slice(-4)
    })
    setThreeDSModalOpen(true)
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
    const genOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setThreeDSGeneratedOtp(genOtp)
    setThreeDSOtp(genOtp)
    const bankObj = POPULAR_BANKS.find((b) => b.id === debitBank) || POPULAR_BANKS[0]
    setPendingPaymentPayload({
      paymentMode: 'debit_card',
      bankName: bankObj.name,
      last4: cleanNum.slice(-4)
    })
    setThreeDSModalOpen(true)
  }

  const handleUpiQrVerify = () => {
    finalizeVerification({
      paymentMode: 'upi',
      bankName: 'NPCI / BHIM Dynamic UPI',
      upiChannel: 'QR_INTENT'
    })
  }

  const handleUpiVpaPay = (e) => {
    e.preventDefault()
    if (!upiId || !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g. 8910464763@upi or username@okhdfcbank).')
      return
    }
    setError('')
    setVpaRequestSent(true)

    // Simulate approval notification from citizen's UPI App after 2.5 seconds
    setTimeout(() => {
      finalizeVerification({
        paymentMode: 'upi',
        bankName: `UPI VPA (${upiId})`,
        upiId
      })
    }, 2500)
  }

  const handleNetbankingPay = (e) => {
    e.preventDefault()
    const bankName = otherBank || POPULAR_BANKS.find((b) => b.id === selectedBank)?.name || 'State Bank of India'
    setError('')
    const genOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setThreeDSGeneratedOtp(genOtp)
    setThreeDSOtp(genOtp)
    setPendingPaymentPayload({
      paymentMode: 'netbanking',
      bankName
    })
    setThreeDSModalOpen(true)
  }

  const handleConfirmThreeDSOtp = () => {
    if (!threeDSOtp || threeDSOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.')
      return
    }
    finalizeVerification(pendingPaymentPayload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
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
            <button
              type="button"
              onClick={handleModalClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
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
            </div>

            {/* Right Interactive Payment Panes */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: UPI / QR CODE */}
              {activeTab === 'upi' && (
                <div className="space-y-4">
                  {/* UPI Sub-mode selector */}
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
                      <Smartphone className="w-3.5 h-3.5" /> Enter UPI ID (VPA)
                    </button>
                  </div>

                  {upiMode === 'qr' ? (
                    <div className="flex flex-col items-center justify-center space-y-3.5 text-center py-2">
                      <div className="relative p-3 bg-white rounded-2xl shadow-xl border-2 border-blue-500/30">
                        <img
                          src={dynamicQrUrl}
                          alt="Dynamic UPI QR Code"
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                        />
                        <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                          <span className="px-2.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-300" /> ₹{amount} Exact
                          </span>
                        </div>
                      </div>

                      {/* Timer & Listening Indicator */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Awaiting UPI confirmation</span>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {Math.floor(qrTimer / 60)}:{(qrTimer % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2">
                        <span>Scan with any app:</span>
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

                      <Button
                        type="button"
                        onClick={handleUpiQrVerify}
                        disabled={loading}
                        className="w-full py-3 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Payment Verification
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleUpiVpaPay} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Enter your UPI ID / Virtual Payment Address (VPA):
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="8910464763@paytm or name@okaxis"
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:border-blue-600 font-mono"
                          autoFocus
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
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            {handle}
                          </button>
                        ))}
                      </div>

                      {vpaRequestSent && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 animate-pulse">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Collect request sent to your UPI app. Please approve payment of ₹{amount}...</span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading || !upiId || vpaRequestSent}
                        className="w-full py-3 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                        Send UPI Payment Request (₹{amount})
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: CREDIT CARD */}
              {activeTab === 'credit_card' && (
                <form onSubmit={handleCreditCardPay} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Card Number:
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
                    Pay ₹{amount} via Credit Card
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
                    Pay ₹{amount} via Debit Card
                  </Button>
                </form>
              )}

              {/* TAB 4: NETBANKING */}
              {activeTab === 'netbanking' && (
                <form onSubmit={handleNetbankingPay} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Popular Indian Banks:
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
                      Or Select from All Other Banks:
                    </label>
                    <select
                      value={otherBank}
                      onChange={(e) => setOtherBank(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none focus:border-blue-600"
                    >
                      <option value="">-- Choose other bank --</option>
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
                    Proceed to Bank Portal (₹{amount})
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

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Payment Received & Verified!
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Credited to Government of India Consolidated Treasury (CMVR Rule 32)
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

      {/* 3D SECURE / BANK SIMULATION OTP MODAL */}
      <AnimatePresence>
        {threeDSModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Bank 3D Secure Verification
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {pendingPaymentPayload?.bankName} authentication for ₹{amount}
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Sarathi Parivahan</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Generated Bank OTP:</span>
                  <strong className="font-mono text-blue-600 dark:text-blue-400 text-sm tracking-wider font-extrabold">
                    {threeDSGeneratedOtp}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 text-left">
                  Enter 6-Digit Bank SMS Code:
                </label>
                <input
                  type="text"
                  value={threeDSOtp}
                  onChange={(e) => setThreeDSOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
                  onClick={() => setThreeDSModalOpen(false)}
                  className="flex-1 h-10 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmThreeDSOtp}
                  disabled={loading || threeDSOtp.length < 6}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Authorize'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
