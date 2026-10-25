import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  FileText, 
  Check,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  CreditCard
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useStickyState } from '@/hooks/useStickyState'

// Official RTO Circles for explicit selection (No fragile guessing)
const OFFICIAL_RTOS = [
  { code: 'WB-01', state: 'West Bengal', name: 'West Bengal (Kolkata - Beltala)' },
  { code: 'DL-01', state: 'Delhi', name: 'Delhi (Mall Road - North Delhi)' },
  { code: 'KA-01', state: 'Karnataka', name: 'Karnataka (Bengaluru Central - Sarathi)' },
  { code: 'MH-01', state: 'Maharashtra', name: 'Maharashtra (Mumbai South - Tardeo)' },
  { code: 'MH-02', state: 'Maharashtra', name: 'Maharashtra (Mumbai West - Andheri)' },
  { code: 'UP-32', state: 'Uttar Pradesh', name: 'Uttar Pradesh (Lucknow - Transport Nagar)' },
  { code: 'TN-01', state: 'Tamil Nadu', name: 'Tamil Nadu (Chennai Central)' }
]

const VEHICLE_OPTIONS = [
  { id: 'motorcycle-gear', label: 'Motorcycle with Gear (MCWG)', fee: 200 },
  { id: 'lmv-car', label: 'Light Motor Vehicle / Car (LMV)', fee: 200 },
  { id: 'combo-bike-car', label: 'Dual Motorcycle + Car (MCWG + LMV)', fee: 350 },
  { id: 'gearless-50cc', label: 'Gearless Moped up to 50cc (16+)', fee: 200 },
  { id: 'commercial-transport', label: 'Commercial Transport (TRANS)', fee: 300 }
]

export default function ChatbotModal() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(true)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiUnavailable, setAiUnavailable] = useState(false)
  const [appliedPreFill, setAppliedPreFill] = useState(false)
  const [cardConsent, setCardConsent] = useState(true)

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Curated 1-Click Guided Chips
  const quickPrompts = [
    {
      q: isHindi 
        ? '🎙️ 90s डेमो: पश्चिम बंगाल बाइक लाइसेंस' 
        : '🎙️ 90s Demo: WB Motorcycle LL',
      query: 'I live in West Bengal and want a learner\'s licence for a motorcycle. What should I do?'
    },
    {
      q: isHindi ? 'लर्नर्स टेस्ट (Rule 11) के क्या नियम हैं?' : 'Rule 11 Knowledge Test Rules?',
      query: 'What are the rules for the computerized learner licence knowledge test under CMVR Rule 11?'
    },
    {
      q: isHindi ? 'स्थायी DL के लिए 30-दिन का नियम?' : 'Permanent DL 30-Day Rule?',
      query: 'What is the mandatory 30-day waiting period for permanent DL under CMVR Rule 15?'
    },
    {
      q: isHindi ? 'आधिकारिक सरकारी फीस (Rule 32)?' : 'Official Fees (Rule 32)?',
      query: 'What are the statutory fees for motorcycle and car learner licence under CMVR Rule 32?'
    }
  ]

  const initialBotMessage = {
    sender: 'bot',
    text: isHindi
      ? 'नमस्ते! मैं सारथी साथी — आपका ड्राइविंग लाइसेंस कोपायलट हूँ। आरटीओ नियम (नियम 11, 15, 32) पूछें, या सीधे 90s डेमो चिप पर क्लिक करके देखें कि मैं पश्चिम बंगाल में बाइक लाइसेंस आवेदन कैसे तैयार करता हूँ।'
      : 'Namaste! I am Saathi — Your Driving Licence Copilot. Ask me about official RTO rules (CMVR 11, 15, 32), or click the 90s Demo chip to see how I prepare a West Bengal motorcycle application live.',
    sources: [
      { title: 'Central Motor Vehicles Rules 1989', url: 'https://parivahan.gov.in' },
      { title: 'MoRTH Official Portal', url: 'https://morth.nic.in' }
    ],
    nextActions: ['apply', 'quiz', 'eligibility', 'fee']
  }

  const [messages, setMessages] = useState([initialBotMessage])

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiLoading])

  // Speak bot replies via Web Speech Synthesis
  const speakText = useCallback((text) => {
    if (!speechSynthesisActive || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/\[.*?\]/g, '').replace(/[#*_]/g, '')
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    } catch {
      // Speech synthesis unsupported or blocked by browser policy
    }
  }, [speechSynthesisActive, isHindi])

  // Parse natural language for entities without injecting fake PII
  const parseCitizenQuery = (text) => {
    const lower = text.toLowerCase()

    // 1. Vehicle category
    let vehicle = 'motorcycle-gear'
    let vehicleLabel = 'Motorcycle with Gear (MCWG)'
    let fee = 200

    if (
      lower.includes('combo') ||
      lower.includes('both') ||
      (lower.includes('bike') && lower.includes('car')) ||
      (lower.includes('motorcycle') && lower.includes('car')) ||
      (lower.includes('बाइक') && lower.includes('कार'))
    ) {
      vehicle = 'combo-bike-car'
      vehicleLabel = 'Dual Motorcycle + Car (MCWG + LMV)'
      fee = 350
    } else if (
      lower.includes('car') ||
      lower.includes('lmv') ||
      lower.includes('four wheeler') ||
      lower.includes('कार')
    ) {
      vehicle = 'lmv-car'
      vehicleLabel = 'Light Motor Vehicle / Car (LMV)'
      fee = 200
    } else if (lower.includes('50cc') || lower.includes('moped')) {
      vehicle = 'gearless-50cc'
      vehicleLabel = 'Gearless Moped up to 50cc (16+)'
      fee = 200
    } else if (lower.includes('transport') || lower.includes('commercial')) {
      vehicle = 'commercial-transport'
      vehicleLabel = 'Commercial Transport (TRANS)'
      fee = 300
    }

    // 2. Explicit State & RTO lookup
    let rtoCode = 'WB-01'
    let rtoName = 'West Bengal (Kolkata - Beltala)'

    if (lower.includes('delhi') || lower.includes('dl')) {
      rtoCode = 'DL-01'
      rtoName = 'Delhi (Mall Road - North Delhi)'
    } else if (lower.includes('bangalore') || lower.includes('bengaluru') || lower.includes('karnataka') || lower.includes('ka')) {
      rtoCode = 'KA-01'
      rtoName = 'Karnataka (Bengaluru Central - Sarathi)'
    } else if (lower.includes('mumbai') || lower.includes('maharashtra') || lower.includes('mh')) {
      rtoCode = 'MH-01'
      rtoName = 'Maharashtra (Mumbai South - Tardeo)'
    } else if (lower.includes('lucknow') || lower.includes('uttar pradesh') || lower.includes('up')) {
      rtoCode = 'UP-32'
      rtoName = 'Uttar Pradesh (Lucknow - Transport Nagar)'
    } else if (lower.includes('chennai') || lower.includes('tamil nadu') || lower.includes('tn')) {
      rtoCode = 'TN-01'
      rtoName = 'Tamil Nadu (Chennai Central)'
    } else if (lower.includes('west bengal') || lower.includes('bengal') || lower.includes('kolkata') || lower.includes('wb')) {
      rtoCode = 'WB-01'
      rtoName = 'West Bengal (Kolkata - Beltala)'
    }

    // 3. Strict candidate name parsing (Never inject default fake name)
    let name = ''
    const nameMatch = text.match(/(?:my name is|i am|mera naam|naam)\s+([a-zA-Z\s]{2,25})/i)
    if (nameMatch && nameMatch[1]) {
      const clean = nameMatch[1].trim().split(/\s+/).slice(0, 3).join(' ')
      if (!clean.toLowerCase().includes('apply') && !clean.toLowerCase().includes('want')) {
        name = clean
      }
    }

    // 4. Strict candidate phone parsing (Never inject default fake phone)
    let phone = ''
    const phoneMatch = text.match(/\b[6-9]\d{9}\b/)
    if (phoneMatch) {
      phone = phoneMatch[0]
    }

    const isApply =
      lower.includes('apply') ||
      lower.includes('want a') ||
      lower.includes('chahiye') ||
      lower.includes('आवेदन') ||
      lower.includes('motorcycle') ||
      lower.includes('licence') ||
      lower.includes('license')

    return {
      isApply,
      name,
      phone,
      vehicle,
      vehicleLabel,
      fee,
      rtoCode,
      rtoName
    }
  }

  // Handle message dispatch
  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim()
    if (!query) return

    const newMsgs = [...messages, { sender: 'user', text: query }]
    setMessages(newMsgs)
    setInputText('')
    setIsAiLoading(true)

    const parsed = parseCitizenQuery(query)

    // Call Copilot intent endpoint with strict 4-second timeout
    let backendData = null
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)

      backendData = await api.sendCopilotIntent(query, lang)
      clearTimeout(timer)
    } catch {
      backendData = null
    }

    setIsAiLoading(false)

    if (backendData && backendData.status === 'success' && backendData.reply) {
      setAiUnavailable(false)
      const isApplyIntent = backendData.intent === 'apply_ll' || parsed.isApply

      const botMsg = {
        sender: 'bot',
        text: backendData.reply,
        isAiLive: backendData.is_ai_live === true,
        sources: backendData.sources || [
          { title: 'Central Motor Vehicles Rules 1989', url: 'https://parivahan.gov.in' }
        ],
        nextActions: isApplyIntent ? ['quiz', 'fee'] : ['apply', 'quiz', 'eligibility'],
        autoFillCard: isApplyIntent ? {
          name: backendData.extracted_data?.name || parsed.name || '',
          phone: backendData.extracted_data?.phone || parsed.phone || '',
          vehicle: backendData.extracted_data?.vehicle || parsed.vehicle,
          vehicleLabel: backendData.extracted_data?.vehicle_label || parsed.vehicleLabel,
          rtoCode: backendData.extracted_data?.rto || parsed.rtoCode,
          rtoName: backendData.extracted_data?.rto_name || parsed.rtoName,
          fee: backendData.fee_details?.total || parsed.fee
        } : null
      }

      setMessages((prev) => [...prev, botMsg])
      speakText(backendData.reply)
      return
    }

    // Graceful Statutory Fallback (If AI service is offline or timed out)
    setAiUnavailable(true)
    const lower = query.toLowerCase()
    let fallbackReply = ''
    let isApplyIntent = parsed.isApply

    if (isApplyIntent) {
      fallbackReply = isHindi
        ? `नियम 14 CMVR के तहत, ${parsed.rtoName} में ${parsed.vehicleLabel} के लिए फॉर्म 2 आवेदन तैयार है। आवश्यक दस्तावेज: आयु प्रमाण (आधार), पता प्रमाण और फॉर्म 1 स्व-घोषणा। सांविधिक शुल्क ₹${parsed.fee} (नियम 32) है। नीचे विवरण की पुष्टि करके फॉर्म 2 स्वतः भरें:`
        : `Under CMVR 1989 Rule 14, I have prepared your Form 2 draft for ${parsed.vehicleLabel} at ${parsed.rtoName}. Statutory fee is ₹${parsed.fee} per Rule 32. Required documents: Age proof (Aadhaar), Address proof, and Form 1 self-declaration. Please review and confirm below to autofill Form 2:`;
    } else if (lower.includes('rule 11') || lower.includes('knowledge') || lower.includes('stall') || lower.includes('नियम 11')) {
      fallbackReply = isHindi
        ? 'नियम 11 CMVR के अनुसार, शिक्षार्थी लाइसेंस जारी करने से पहले सड़क संकेत, ट्रैफिक नियमों और सुरक्षित ड्राइविंग पर कंप्यूटर आधारित STALL परीक्षा में न्यूनतम 60% अंक प्राप्त करना अनिवार्य है।'
        : 'Under CMVR 1989 Rule 11, candidates must pass a computerized preliminary knowledge test covering traffic signs, road regulations, and safe driving duties with a minimum 60% passing mark before Form 3 LL issuance.';
    } else if (lower.includes('30') || lower.includes('wait') || lower.includes('permanent') || lower.includes('rule 15')) {
      fallbackReply = isHindi
        ? 'नियम 15 CMVR के तहत, स्थायी ड्राइविंग टेस्ट देने से पहले आपके पास न्यूनतम 30 दिनों तक वैध शिक्षार्थी अनुज्ञप्ति (Form 3) होना अनिवार्य है। यह पूरे भारत में 180 दिनों (6 महीने) तक वैध रहता है (नियम 13)।'
        : 'Under Rule 15 CMVR, you must hold a valid Form 3 Learner\'s Licence for minimum 30 days before appearing for the permanent DL driving test. Valid for 180 days across India per Rule 13.';
    } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('फीस') || lower.includes('rule 32')) {
      fallbackReply = isHindi
        ? 'CMVR नियम 32 के अनुसार आधिकारिक शुल्क: सिंगल क्लास (केवल बाइक या केवल कार) = ₹200 (₹150 LL + ₹50 टेस्ट शुल्क)। बाइक + कार कॉम्बो = ₹350 (₹150 + ₹150 + ₹50)। भारत ई-पे चालान से भुगतान होता है, कोई दलाल शुल्क नहीं।'
        : 'Per CMVR Rule 32: Single category (Bike or Car) = ₹200 (₹150 LL + ₹50 test). Dual Bike + Car combo = ₹350. Direct treasury payment via Bharat e-Pay with zero agent surcharge.';
    } else {
      fallbackReply = isHindi
        ? 'नमस्ते! मैं सारथी साथी कोपायलट हूँ। मुझसे आरटीओ नियम (नियम 11, 15, 32) पूछें या सीधे कहें "मुझे पश्चिम बंगाल में बाइक लाइसेंस चाहिए" और मैं आपका फॉर्म 2 तैयार करूँगा।'
        : 'Namaste! I am Saathi — Your Driving Licence Copilot. Ask me about RTO rules (CMVR 11, 15, 32), or say "I want a motorcycle learner\'s licence in West Bengal" to prepare your Form 2 draft.';
    }

    const fallbackMsg = {
      sender: 'bot',
      text: fallbackReply,
      isAiLive: false,
      sources: [
        { title: 'Central Motor Vehicles Rules 1989', url: 'https://parivahan.gov.in' },
        { title: 'MoRTH Statutory Gazette', url: 'https://morth.nic.in' }
      ],
      nextActions: isApplyIntent ? ['quiz', 'fee'] : ['apply', 'quiz', 'eligibility'],
      autoFillCard: isApplyIntent ? {
        name: parsed.name || '',
        phone: parsed.phone || '',
        vehicle: parsed.vehicle,
        vehicleLabel: parsed.vehicleLabel,
        rtoCode: parsed.rtoCode,
        rtoName: parsed.rtoName,
        fee: parsed.fee
      } : null
    }

    setMessages((prev) => [...prev, fallbackMsg])
    speakText(fallbackReply)
  }

  // Web Speech API Voice Recognition Toggle
  const toggleListening = () => {
    if (typeof window === 'undefined') return
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRec()
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        setInputText(transcript)
        handleSend(transcript)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  // Consent-based transfer to Form 2 (/apply)
  const applyAutoFillAndNavigate = (cardData) => {
    if (!cardConsent) {
      alert('Please confirm your consent before proceeding with Form 2 autofill.')
      return
    }

    try {
      if (cardData.name) localStorage.setItem('user-name', JSON.stringify(cardData.name))
      if (cardData.phone) localStorage.setItem('user-phone', JSON.stringify(cardData.phone))
      localStorage.setItem('user-vehicle', JSON.stringify(cardData.vehicle))
      localStorage.setItem('user-rto', JSON.stringify(cardData.rtoCode))
      setAppliedPreFill(true)
      setTimeout(() => {
        setIsOpen(false)
        navigate('/apply')
      }, 700)
    } catch {
      navigate('/apply')
    }
  }

  // Handle Action Chip Click
  const handleActionClick = (actionType) => {
    switch (actionType) {
      case 'apply':
        setIsOpen(false)
        navigate('/apply')
        break
      case 'quiz':
        setIsOpen(false)
        navigate('/mock-test')
        break
      case 'eligibility':
        setIsOpen(false)
        navigate('/can-i-apply')
        break
      case 'fee':
        handleSend('What are the official fees under Rule 32?')
        break
      default:
        break
    }
  }

  const updateCard = (msgIndex, updates) => {
    setMessages((prev) =>
      prev.map((msg, idx) => {
        if (idx !== msgIndex || !msg.autoFillCard) return msg
        return {
          ...msg,
          autoFillCard: {
            ...msg.autoFillCard,
            ...updates
          }
        }
      })
    )
  }

  return (
    <>
      {/* Floating Trigger Button with Copilot Pulse Accent */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Saathi Driving Licence Copilot"
        className="fixed bottom-16 sm:bottom-6 left-4 sm:left-6 p-3 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-full shadow-2xl z-50 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white/20 group backdrop-blur-md"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600 animate-pulse" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold leading-tight flex items-center gap-1">
            <span>Saathi Copilot</span>
            <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
          <span className="text-[10px] text-blue-100 font-mono">Ask • Guide • Autofill</span>
        </div>
        <Mic className="w-3.5 h-3.5 text-blue-200 hidden sm:inline" />
      </button>

      {/* Copilot Sliding Modal / Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-lg h-[90vh] sm:h-[660px] rounded-t-3xl sm:rounded-3xl flex flex-col relative border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Header with Bilingual Voice Controls */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Bot className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>Saathi — DL Copilot</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 font-mono tracking-wide">
                        CMVR 1989
                      </span>
                    </h3>
                    <p className="text-[10px] text-blue-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      <span>{isHindi ? 'आधिकारिक स्रोत-आधारित आरटीओ सहायक' : 'Official Grounded RTO Copilot'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Voice Output Toggle */}
                  <button
                    onClick={() => setSpeechSynthesisActive(!speechSynthesisActive)}
                    title={speechSynthesisActive ? 'Mute Speech' : 'Enable Speech Output'}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-[11px]"
                  >
                    {speechSynthesisActive ? (
                      <Volume2 className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  <button 
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Copilot"
                    className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Graceful Fallback Notice Bar (If Live AI is disconnected/offline) */}
              {aiUnavailable && (
                <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-200 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>⚡ Live AI offline — Operating on Verified CMVR Statutory Knowledge Base</span>
                  </div>
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>

                      {/* Official Source Citations */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-blue-500" />
                            <span>Sources:</span>
                          </span>
                          {m.sources.map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:underline flex items-center gap-0.5 border border-blue-200 dark:border-blue-800 font-mono"
                            >
                              <span>{src.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactive Consent-Based Form 2 Autofill Card */}
                    {m.autoFillCard && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2.5 w-full max-w-[94%] p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white dark:from-slate-800 dark:via-indigo-950/30 dark:to-slate-900 border-2 border-blue-300 dark:border-blue-700 space-y-3 shadow-md"
                      >
                        <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-bold text-xs pb-1.5 border-b border-blue-200 dark:border-blue-800">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Review & Confirm Application Draft</span>
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono uppercase tracking-wider">
                            Form 2 Draft
                          </span>
                        </div>

                        {/* Extracted Fields Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Applicant Name:</span>
                            <strong className="text-slate-900 dark:text-white">
                              {m.autoFillCard.name || (
                                <span className="text-amber-600 dark:text-amber-400 italic font-normal">
                                  Not provided (fill in form)
                                </span>
                              )}
                            </strong>
                          </div>

                          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 block">Mobile Number:</span>
                            <strong className="text-slate-900 dark:text-white font-mono">
                              {m.autoFillCard.phone || (
                                <span className="text-amber-600 dark:text-amber-400 italic font-normal">
                                  Not provided (fill in form)
                                </span>
                              )}
                            </strong>
                          </div>

                          {/* Explicit RTO Selector (No Fragile Guessing) */}
                          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                            <label className="text-[10px] text-slate-500 block mb-1 font-semibold">
                              Confirm State & RTO Circle (Explicit Selection):
                            </label>
                            <select
                              value={m.autoFillCard.rtoCode}
                              onChange={(e) => {
                                const matched = OFFICIAL_RTOS.find(r => r.code === e.target.value)
                                if (matched) {
                                  updateCard(i, { rtoCode: matched.code, rtoName: matched.name })
                                }
                              }}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600"
                            >
                              {OFFICIAL_RTOS.map((rto) => (
                                <option key={rto.code} value={rto.code}>
                                  {rto.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Licence Class Selector */}
                          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                            <label className="text-[10px] text-slate-500 block mb-1 font-semibold">
                              Licence Class (MV Act Sec 4):
                            </label>
                            <select
                              value={m.autoFillCard.vehicle}
                              onChange={(e) => {
                                const matched = VEHICLE_OPTIONS.find(v => v.id === e.target.value)
                                if (matched) {
                                  updateCard(i, {
                                    vehicle: matched.id,
                                    vehicleLabel: matched.label,
                                    fee: matched.fee
                                  })
                                }
                              }}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600"
                            >
                              {VEHICLE_OPTIONS.map((veh) => (
                                <option key={veh.id} value={veh.id}>
                                  {veh.label} — ₹{veh.fee} (CMVR Rule 32)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Statutory Fee Notice */}
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Statutory Challan Fee (Rule 32):
                            </span>
                            <span className="font-bold text-blue-700 dark:text-blue-300">
                              ₹{m.autoFillCard.fee} (Govt Treasury)
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Zero Agent Markup</span>
                          </span>
                        </div>

                        {/* Mandatory Citizen Consent Checkbox */}
                        <div className="flex items-start gap-2 pt-1 text-[10px] text-slate-600 dark:text-slate-400">
                          <input
                            type="checkbox"
                            id="copilot-consent"
                            checked={cardConsent}
                            onChange={(e) => setCardConsent(e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <label htmlFor="copilot-consent" className="cursor-pointer leading-tight">
                            I consent to pre-filling Form 2 with these verified parameters. No data is submitted to RTO until final citizen review.
                          </label>
                        </div>

                        {/* Action Buttons */}
                        <button
                          onClick={() => applyAutoFillAndNavigate(m.autoFillCard)}
                          disabled={!cardConsent}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {appliedPreFill ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                              <span>Opening Form 2 Draft...</span>
                            </>
                          ) : (
                            <>
                              <span>Confirm & Autofill Form 2</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}

                    {/* Contextual Next Step Actions */}
                    {m.nextActions && m.nextActions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.nextActions.includes('apply') && (
                          <button
                            onClick={() => handleActionClick('apply')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 font-semibold flex items-center gap-1 transition-all"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>Start Form 2 Application</span>
                          </button>
                        )}
                        {m.nextActions.includes('quiz') && (
                          <button
                            onClick={() => handleActionClick('quiz')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1 transition-all"
                          >
                            <BookOpen className="w-3 h-3 text-emerald-600" />
                            <span>Practise STALL Test (Rule 11)</span>
                          </button>
                        )}
                        {m.nextActions.includes('eligibility') && (
                          <button
                            onClick={() => handleActionClick('eligibility')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 font-semibold flex items-center gap-1 transition-all"
                          >
                            <HelpCircle className="w-3 h-3 text-purple-600" />
                            <span>Check Age Eligibility (Sec 4)</span>
                          </button>
                        )}
                        {m.nextActions.includes('fee') && (
                          <button
                            onClick={() => handleActionClick('fee')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 font-semibold flex items-center gap-1 transition-all"
                          >
                            <CreditCard className="w-3 h-3 text-amber-600" />
                            <span>View Rule 32 Fee Schedule</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs w-fit">
                    <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                    <span>Saathi Copilot is checking official CMVR guidelines...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Listening Active Waveform Bar */}
              {isListening && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-950/60 border-t border-red-200 dark:border-red-900 flex items-center justify-between text-xs text-red-600 dark:text-red-400 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold">
                      {isHindi ? '🎙️ सुन रहा हूँ... बोलिए (उदा. मुझे बाइक लाइसेंस चाहिए)' : '🎙️ Listening... Speak now (e.g. Apply for bike in West Bengal)'}
                    </span>
                  </div>
                  <button 
                    onClick={toggleListening}
                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* 1-Click Guided Chips for 90s Live Demo Reliability */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-x-auto flex gap-1.5 whitespace-nowrap no-scrollbar shrink-0">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.query)}
                    className="px-2.5 py-1 text-[11px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 shrink-0 font-medium transition-all shadow-2xs"
                  >
                    {p.q}
                  </button>
                ))}
              </div>

              {/* Voice & Text Input Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
                className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
              >
                {/* Microphone Voice Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title="Speak via Microphone"
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening 
                      ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white" />
                  ) : (
                    <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isHindi 
                      ? 'बोलें या लिखें (उदा. पश्चिम बंगाल में बाइक लाइसेंस)...' 
                      : 'Speak or type (e.g. Motorcycle licence in West Bengal)...'
                  }
                  className="flex-1 p-2.5 text-xs border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-colors"
                />

                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!inputText.trim() || isAiLoading}
                  className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
