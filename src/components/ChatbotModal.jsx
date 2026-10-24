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
  Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useStickyState } from '@/hooks/useStickyState'

// RTO City keyword to official code mapping
const RTO_MAPPINGS = {
  bangalore: { code: 'KA-01', name: 'Bengaluru Central, KA' },
  bengaluru: { code: 'KA-01', name: 'Bengaluru Central, KA' },
  delhi: { code: 'DL-01', name: 'Mall Road, New Delhi' },
  mumbai: { code: 'MH-01', name: 'Tardeo, Mumbai, MH' },
  pune: { code: 'MH-12', name: 'Shivajinagar, Pune, MH' },
  kolkata: { code: 'WB-01', name: 'Beltala, Kolkata, WB' },
  hyderabad: { code: 'TS-09', name: 'Khairatabad, Hyderabad, TS' },
  chennai: { code: 'TN-01', name: 'Chennai Central, TN' },
  jaipur: { code: 'RJ-14', name: 'Jaipur RTO, RJ' },
  lucknow: { code: 'UP-32', name: 'Lucknow Transport Nagar, UP' }
}

export default function ChatbotModal() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(true)
  const [appliedPreFill, setAppliedPreFill] = useState(false)

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  const quickPrompts = [
    {
      q: isHindi ? '🎙️ बैंगलोर में बाइक और कार लाइसेंस आवेदन' : '🎙️ Apply for Bike & Car in Bangalore',
      a: isHindi 
        ? 'मैंने आपका फॉर्म 2 आवेदन बैंगलोर RTO (KA-01) में बाइक + कार कॉम्बो के लिए तैयार कर दिया है!' 
        : 'I have prepared your Form 2 application for Dual Class (MCWG + LMV) at Bengaluru Central RTO (KA-01)!',
      autoFill: {
        name: 'Avrojit Saha',
        phone: '9876543210',
        vehicle: 'combo-bike-car',
        rto: 'KA-01',
        rtoName: 'Bengaluru Central (Koramangala), KA'
      }
    },
    {
      q: isHindi ? '7-दिन का ऑनलाइन टेस्ट नियम क्या है?' : 'What is the 7-day rule for online LL test?',
      a: isHindi 
        ? 'नियम 11(3) CMVR के अनुसार, आवेदन जमा करने के 7 दिनों के भीतर ऑनलाइन परीक्षा देना अनिवार्य है। यदि 7 दिनों में परीक्षा नहीं दी गई, तो आवेदन स्वतः रद्द हो जाता है।' 
        : 'Under Rule 11(3) CMVR, applicants must take the online STALL test within 7 days of application submission, failing which it automatically lapses.'
    },
    {
      q: isHindi ? 'स्थायी लाइसेंस के लिए 30-दिन का नियम क्या है?' : 'What is the 30-day rule for permanent DL?',
      a: isHindi 
        ? 'नियम 15 CMVR के तहत, स्थायी ड्राइविंग टेस्ट देने से पहले आपके पास न्यूनतम 30 दिनों तक वैध लर्नर्स लाइसेंस होना अनिवार्य है। यह 180 दिनों (6 महीने) तक वैध रहता है।' 
        : 'Under Rule 15 CMVR, you must hold a valid Form 3 Learner\'s Licence for minimum 30 days before appearing for the permanent DL driving test. Valid for 180 days.'
    },
    {
      q: isHindi ? 'बाइक और कार लाइसेंस की फीस कितनी है?' : 'What are the fees for Bike and Car licences?',
      a: isHindi 
        ? 'CMVR नियम 32 के अनुसार: सिंगल क्लास = ₹200 (₹150 LL + ₹50 टेस्ट)। बाइक + कार कॉम्बो = ₹350 (₹150 + ₹150 + ₹50)। कोई अतिरिक्त दलाल शुल्क नहीं।' 
        : 'Per CMVR Rule 32: Single category (Bike or Car) = ₹200. Dual Bike + Car combo = ₹350. Direct treasury challan via Bharat e-Pay with zero agent surcharge.'
    }
  ]

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: isHindi 
        ? 'नमस्ते! मैं सारथी साथी वॉइस AI हूँ। मुझसे बोलकर या लिखकर आरटीओ नियम पूछें, या सीधे बोलें "Mera naam Avrojit hai, Bangalore me bike licence chahiye" और मैं आपका फॉर्म 2 स्वतः भर दूँगा!' 
        : 'Namaste! I am Saathi Voice AI. Speak or type your query, or simply say "My name is Avrojit, apply for bike and car in Bangalore" and I will auto-fill your Form 2 instantly!'
    }
  ])

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Speak bot replies via browser Web Speech Synthesis
  const speakText = useCallback((text) => {
    if (!speechSynthesisActive || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel() // Stop any previous speech
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    } catch {
      // Speech synthesis unsupported or blocked
    }
  }, [speechSynthesisActive, isHindi])

  // Parse candidate spoken/typed text for Form 2 entities
  const extractFormEntities = (text) => {
    const lower = text.toLowerCase()
    let extracted = null

    // 1. Vehicle category
    let vehicle = null
    if (lower.includes('both') || lower.includes('combo') || (lower.includes('bike') && lower.includes('car')) || (lower.includes('मोटर') && lower.includes('कार'))) {
      vehicle = 'combo-bike-car'
    } else if (lower.includes('bike') || lower.includes('motorcycle') || lower.includes('mcwg') || lower.includes('दोपहिया') || lower.includes('बाइक')) {
      vehicle = 'two-wheeler'
    } else if (lower.includes('car') || lower.includes('lmv') || lower.includes('चारपहिया') || lower.includes('कार')) {
      vehicle = 'four-wheeler'
    }

    // 2. City / RTO
    let rto = null
    let rtoName = null
    for (const [city, data] of Object.entries(RTO_MAPPINGS)) {
      if (lower.includes(city)) {
        rto = data.code
        rtoName = data.name
        break
      }
    }

    // 3. Phone number (10-digit)
    const phoneMatch = text.match(/\b[6-9]\d{9}\b/)
    const phone = phoneMatch ? phoneMatch[0] : null

    // 4. Candidate name
    let name = null
    const namePatterns = [
      /(?:mera naam|my name is|i am|naam|name)\s+([a-zA-Z\s]{3,24})/i,
      /(?:shri|mr|ms|mrs)\s+([a-zA-Z\s]{3,24})/i
    ]
    for (const pat of namePatterns) {
      const match = text.match(pat)
      if (match && match[1]) {
        name = match[1].trim().split(' ').slice(0, 3).join(' ')
        break
      }
    }

    // If candidate requested application or supplied name/city/vehicle
    if (vehicle || rto || name || phone || lower.includes('apply') || lower.includes('आवेदन')) {
      extracted = {
        name: name || 'Avrojit Saha',
        phone: phone || '9876543210',
        vehicle: vehicle || 'combo-bike-car',
        rto: rto || 'KA-01',
        rtoName: rtoName || 'Bengaluru Central, KA'
      }
    }

    return extracted
  }

  // Handle message dispatch
  const handleSend = async (textToSend, customAutoFill = null) => {
    const query = textToSend || inputText
    if (!query.trim()) return

    const newMsgs = [...messages, { sender: 'user', text: query }]
    setMessages(newMsgs)
    setInputText('')

    // Check for Form 2 conversational entity intent
    const extractedData = customAutoFill || extractFormEntities(query)

    if (extractedData && (query.toLowerCase().includes('apply') || query.toLowerCase().includes('आवेदन') || customAutoFill || query.toLowerCase().includes('bangalore') || query.toLowerCase().includes('delhi'))) {
      const confirmationText = isHindi
        ? `बहुत बढ़िया! मैंने आपकी जानकारी के आधार पर ${extractedData.rtoName} में ${extractedData.vehicle === 'combo-bike-car' ? 'बाइक + कार' : 'लाइसेंस'} के लिए फॉर्म 2 तैयार कर लिया है। नीचे क्लिक करके सीधे आवेदन पूर्ण करें:`
        : `Splendid! I have parsed your profile and prepared Form 2 for ${extractedData.rtoName} (${extractedData.vehicle === 'combo-bike-car' ? 'Dual MCWG + LMV' : 'Single Class'}). Review and click below to proceed:`

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: confirmationText,
          autoFill: extractedData
        }
      ])
      speakText(confirmationText)
      return
    }

    // 1. Try FastAPI backend Saathi AI endpoint
    const backendReply = await api.sendChatMessage(query, lang)
    if (backendReply) {
      setMessages((prev) => [...prev, { sender: 'bot', text: backendReply }])
      speakText(backendReply)
      return
    }

    // 2. Keyword matching fallback
    let reply = isHindi 
      ? 'सटीक आरटीओ नियमों के लिए सारथी पोर्टल देखें अथवा त्वरित विषयों में से चुनें।' 
      : 'For official state notifications, check parivahan.gov.in or click one of the quick topics below.'

    const lower = query.toLowerCase()
    if (lower.includes('7') || lower.includes('day') || lower.includes('दिन') || lower.includes('cancel')) {
      reply = quickPrompts[1].a
    } else if (lower.includes('30') || lower.includes('wait') || lower.includes('permanent') || lower.includes('स्थायी')) {
      reply = quickPrompts[2].a
    } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('फीस') || lower.includes('रुपये')) {
      reply = quickPrompts[3].a
    }

    setMessages((prev) => [...prev, { sender: 'bot', text: reply }])
    speakText(reply)
  }

  // Web Speech API Voice Recognition Toggle
  const toggleListening = () => {
    if (typeof window === 'undefined') return
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Edge.')
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

  // Transfer pre-filled conversational data to Form 2 (/apply)
  const applyAutoFillAndNavigate = (autoFillData) => {
    try {
      localStorage.setItem('user-name', JSON.stringify(autoFillData.name))
      localStorage.setItem('user-phone', JSON.stringify(autoFillData.phone))
      localStorage.setItem('user-vehicle', JSON.stringify(autoFillData.vehicle))
      localStorage.setItem('user-rto', JSON.stringify(autoFillData.rto))
      setAppliedPreFill(true)
      setTimeout(() => {
        setIsOpen(false)
        navigate('/apply')
      }, 700)
    } catch {
      navigate('/apply')
    }
  }

  return (
    <>
      {/* Floating Chat Trigger Button with Voice Wave Accent */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Saathi Voice AI Assistant"
        className="fixed bottom-16 sm:bottom-6 left-4 sm:left-6 p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl z-50 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20 group"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-600 animate-pulse" />
        </div>
        <span className="text-xs font-bold hidden sm:inline">Saathi Voice AI</span>
        <Mic className="w-3.5 h-3.5 text-blue-200 hidden sm:inline" />
      </button>

      {/* Voice Assistant Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-3 sm:p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm sm:max-w-md h-[550px] sm:h-[620px] rounded-3xl flex flex-col relative border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Header with Multilingual Voice Controls */}
              <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs flex items-center gap-1.5">
                      <span>Saathi Voice AI</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">CMVR 1989</span>
                    </h3>
                    <p className="text-[10px] text-blue-100">
                      {isHindi ? 'सारथी आवाज सहायक एवं स्वतः फॉर्म 2 पूरक' : 'Voice Concierge & Form 2 Auto-Filler'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Voice Output Speaker Toggle */}
                  <button
                    onClick={() => setSpeechSynthesisActive(!speechSynthesisActive)}
                    title={speechSynthesisActive ? 'Mute Speech' : 'Enable Voice Responses'}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-[11px]"
                  >
                    {speechSynthesisActive ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-300" />}
                  </button>

                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>

                    {/* Interactive Form 2 Auto-Fill Card */}
                    {m.autoFill && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-2.5 w-full max-w-[92%] p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 space-y-2 shadow-md"
                      >
                        <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Form 2 Pre-Filled Application Card</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 font-mono">
                            READY
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 dark:text-slate-300 pt-1 border-t border-blue-100 dark:border-blue-900/40">
                          <div>
                            <span className="text-slate-400 block">Applicant:</span>
                            <strong className="text-slate-900 dark:text-white">{m.autoFill.name}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Mobile:</span>
                            <strong className="text-slate-900 dark:text-white font-mono">{m.autoFill.phone}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Licence Class:</span>
                            <strong className="text-slate-900 dark:text-white">
                              {m.autoFill.vehicle === 'combo-bike-car' ? 'MCWG + LMV (Dual)' : m.autoFill.vehicle}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Target RTO:</span>
                            <strong className="text-slate-900 dark:text-white">{m.autoFill.rtoName}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => applyAutoFillAndNavigate(m.autoFill)}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          {appliedPreFill ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Redirecting to Form 2...</span>
                            </>
                          ) : (
                            <>
                              <span>Proceed with Pre-Filled Form 2</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Listening Active Pulse Bar */}
              {isListening && (
                <div className="px-3.5 py-2 bg-red-50 dark:bg-red-950/40 border-t border-red-200 dark:border-red-900 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold">{isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now'}</span>
                  </div>
                  <button 
                    onClick={toggleListening}
                    className="text-[10px] font-semibold text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* 1-Click Prompt Chips for Live Pitch Reliability */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-x-auto flex gap-1.5 whitespace-nowrap no-scrollbar">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.q, p.autoFill || null)}
                    className="px-2.5 py-1 text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 hover:border-blue-500 shrink-0 font-medium transition-all"
                  >
                    {p.q}
                  </button>
                ))}
              </div>

              {/* Voice & Text Input Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
                className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
              >
                {/* Microphone Voice Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title="Speak via Microphone"
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening 
                      ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isHindi ? 'बोलें या लिखें (उदा. Bangalore में बाइक DL)...' : 'Speak or type (e.g. Bike DL in Bangalore)...'}
                  className="flex-1 p-2 text-xs border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />

                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!inputText.trim()}
                  className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0 disabled:opacity-40"
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
