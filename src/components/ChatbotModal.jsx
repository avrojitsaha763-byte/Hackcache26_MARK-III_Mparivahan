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
  CreditCard,
  Calendar,
  Search,
  Compass,
  Eye,
  Radio
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useStickyState } from '@/hooks/useStickyState'
import { 
  OFFICIAL_RTOS, 
  VEHICLE_OPTIONS, 
  parseCitizenQuery, 
  getStatutoryResponse 
} from '@/lib/aiChatService'

// Custom Markdown & Step Formatter for Rich Guidance
function FormattedBotContent({ text }) {
  if (!text) return null

  const lines = text.split('\n')

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />
        }

        // Section Headers (starting with emoji icons or uppercase titles)
        if (
          trimmed.startsWith('📍') ||
          trimmed.startsWith('📋') ||
          trimmed.startsWith('📖') ||
          trimmed.startsWith('⏳') ||
          trimmed.startsWith('🚗') ||
          trimmed.startsWith('🛵') ||
          trimmed.startsWith('💰') ||
          trimmed.startsWith('📑') ||
          trimmed.startsWith('📄') ||
          trimmed.startsWith('🔍') ||
          trimmed.startsWith('💡') ||
          trimmed.startsWith('🔄') ||
          trimmed.startsWith('🌍') ||
          trimmed.startsWith('📱') ||
          trimmed.startsWith('🎯') ||
          trimmed.startsWith('🛡️') ||
          trimmed.startsWith('⚠️')
        ) {
          return (
            <div 
              key={idx} 
              className="font-bold text-slate-900 dark:text-blue-200 mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 first:border-t-0 first:pt-0 text-[11.5px] flex items-start gap-1.5"
            >
              <span>{trimmed}</span>
            </div>
          )
        }

        // Step numbers: e.g. "1.", "2.", "3.", "Stage 1:", "चरण 1:"
        const stepMatch = trimmed.match(/^(\d+\.|\bStep\s+\d+:|\bStage\s+\d+:|चरण\s+\d+:)\s*(.*)/i)
        if (stepMatch) {
          const stepBadge = stepMatch[1]
          const stepContent = stepMatch[2]
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5 text-[11.5px]">
              <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] font-mono">
                {stepBadge}
              </span>
              <span className="flex-1">{renderInlineStyles(stepContent)}</span>
            </div>
          )
        }

        // Bullet points: • or -
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const bulletContent = trimmed.replace(/^[•\-*]\s*/, '')
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-2 text-[11px] text-slate-700 dark:text-slate-300">
              <span className="text-blue-500 font-bold select-none">•</span>
              <span className="flex-1">{renderInlineStyles(bulletContent)}</span>
            </div>
          )
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-[11.5px] text-slate-800 dark:text-slate-200">
            {renderInlineStyles(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

// Inline formatting: bold **text**, citations [CMVR ...]
function renderInlineStyles(text) {
  if (!text) return ''

  // Split by bold patterns **...** or citations [ ... ]
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\])/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <span 
          key={index} 
          className="inline-block mx-0.5 px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 text-[10px] font-mono border border-amber-300 dark:border-amber-800"
        >
          {part}
        </span>
      )
    }
    return part
  })
}

export default function ChatbotModal() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const [inputText, setInputText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [micErrorMessage, setMicErrorMessage] = useState('')
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(true)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiUnavailable, setAiUnavailable] = useState(false)
  const [appliedPreFill, setAppliedPreFill] = useState(false)
  const [cardConsent, setCardConsent] = useState(true)

  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const accumulatedTranscriptRef = useRef('')
  const messagesEndRef = useRef(null)

  // FIX: Body Scroll Lock to prevent background webpage from scrolling when Chatbot modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      const originalPaddingRight = document.body.style.paddingRight
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
      return () => {
        document.body.style.overflow = originalOverflow
        document.body.style.paddingRight = originalPaddingRight
      }
    }
  }, [isOpen])

  // Curated 1-Click Guided Quick Prompts — Specifically tailored for village & common citizen questions
  const quickPrompts = [
    {
      q: isHindi ? '🛵 मुझे बाइक चलानी है' : '🛵 I want to ride a bike',
      query: isHindi 
        ? 'मुझे बाइक चलानी है, लाइसेंस कैसे बनेगा?' 
        : 'I want to ride a motorcycle. How do I get a licence?'
    },
    {
      q: isHindi ? '📄 10वीं मार्कशीट नहीं है, आधार चलेगा?' : '📄 No 10th marksheet, Aadhaar ok?',
      query: isHindi 
        ? 'मेरे पास 10वीं की मार्कशीट नहीं है, क्या केवल आधार कार्ड से लाइसेंस बन जाएगा?' 
        : 'I don\'t have a 10th pass marksheet. Will my Aadhaar card work?'
    },
    {
      q: isHindi ? '💰 कुल कितना खर्चा आएगा?' : '💰 How much money in total?',
      query: isHindi 
        ? 'ड्राइविंग लाइसेंस में कुल कितना पैसा और सरकारी फीस लगेगी?' 
        : 'How much money will it take in total?'
    },
    {
      q: isHindi ? '📱 फोन से होगा या RTO जाना पड़ेगा?' : '📱 Phone or visit RTO?',
      query: isHindi 
        ? 'क्या सारा काम मोबाइल फोन से हो जाएगा या आरटीओ ऑफिस जाना पड़ेगा?' 
        : 'Do I have to go to the RTO office, or can I do it on my phone?'
    },
    {
      q: isHindi ? '🎯 कंप्यूटर टेस्ट में फेल हो गया तो?' : '🎯 What if I fail computer test?',
      query: isHindi 
        ? 'कंप्यूटर टेस्ट में क्या पूछा जाता है और अगर मैं फेल हो गया तो क्या होगा?' 
        : 'What happens in the computer test? What if I fail?'
    },
    {
      q: isHindi ? '📬 घर पर कार्ड कितने दिन में आएगा?' : '📬 When will card reach my house?',
      query: isHindi 
        ? 'स्थायी स्मार्ट कार्ड लाइसेंस डाक से घर पर कितने दिन में आ जाता है?' 
        : 'How many days will it take for the card to come to my house?'
    }
  ]

  const initialBotMessage = {
    sender: 'bot',
    text: isHindi
      ? 'नमस्ते! मैं सारथी साथी — आपका डिजिटल आरटीओ मित्र हूँ।\n\nआपको किसी दलाल या एजेंट के पास जाने की जरूरत नहीं है। चाहे आपके पास 10वीं की मार्कशीट न हो, या आप पहली बार बाइक/कार का लाइसेंस बनवा रहे हों, आप मुझसे अपनी आम बोलचाल में कुछ भी पूछ सकते हैं!\n\nमैं आपको एक-एक करके समझाऊँगा और आपका आवेदन तैयार करूँगा।'
      : 'Namaste! I am Saathi Copilot — your friendly Digital RTO Officer.\n\nYou do NOT need any brokers or middlemen. Even if you don\'t have a 10th marksheet or know nothing about government forms, you can ask me anything in simple everyday words!\n\nI will answer your questions, dispel your fears, and guide you through your licence application step by step.',
    sources: [
      { title: 'Central Motor Vehicles Rules 1989', url: 'https://parivahan.gov.in' },
      { title: 'MoRTH Official Portal', url: 'https://morth.nic.in' }
    ],
    isAiLive: true,
    nextActions: ['apply', 'quiz', 'eligibility', 'fee'],
    followUpChips: [
      isHindi ? 'मुझे बाइक चलानी है, लाइसेंस कैसे बनेगा?' : 'I want to ride a motorcycle. How do I get a licence?',
      isHindi ? '10वीं की मार्कशीट नहीं है, आधार चलेगा?' : 'I don\'t have a 10th pass marksheet. Will my Aadhaar card work?',
      isHindi ? 'कुल कितना खर्चा आएगा?' : 'How much money will it take in total?',
      isHindi ? 'फोन से होगा या RTO जाना पड़ेगा?' : 'Do I have to go to the RTO office, or can I do it on my phone?',
      isHindi ? 'कंप्यूटर टेस्ट में क्या होता है? फेल हो गया तो?' : 'What happens in the computer test? What if I fail?'
    ]
  }

  const [messages, setMessages] = useState([initialBotMessage])

  // Persistent applicant draft state gathered conversationally across chat turns
  const [applicantDraft, setApplicantDraft] = useState({
    name: '',
    phone: '',
    vehicle: 'motorcycle-gear',
    vehicleLabel: 'Motorcycle with Gear (MCWG)',
    rtoCode: 'DL-01',
    rtoName: 'Delhi (Mall Road - North Delhi)',
    fee: 200
  })

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAiLoading])

  // Speak bot replies via Web Speech Synthesis
  const speakText = useCallback((text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    try {
      window.speechSynthesis.cancel()
      const cleanText = text
        .replace(/\[.*?\]/g, '')
        .replace(/[#*_•\p{Extended_Pictographic}\uFE0F]/gu, '')
        .slice(0, 320)
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = isHindi ? 'hi-IN' : 'en-IN'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    } catch {
      // Speech synthesis unsupported or blocked by browser policy
    }
  }, [isHindi])

  // Handle message dispatch: Reads, Analyzes, Answers & Guides
  const handleSend = async (textToSend) => {
    const query = (textToSend || inputText).trim()
    if (!query) return

    const newMsgs = [...messages, { sender: 'user', text: query }]
    setMessages(newMsgs)
    setInputText('')
    setLiveTranscript('')
    setIsAiLoading(true)

    // Extract citizen details from the latest query and accumulate in draft state
    const parsed = parseCitizenQuery(query, isHindi)
    const lowerQ = query.toLowerCase()

    let updatedDraft = { ...applicantDraft }
    if (parsed.name) updatedDraft.name = parsed.name
    if (parsed.phone) updatedDraft.phone = parsed.phone
    if (
      lowerQ.includes('bike') || 
      lowerQ.includes('motorcycle') || 
      lowerQ.includes('car') || 
      lowerQ.includes('scooter') || 
      lowerQ.includes('moped') || 
      lowerQ.includes('combo') || 
      lowerQ.includes('दोनों')
    ) {
      updatedDraft.vehicle = parsed.vehicle
      updatedDraft.vehicleLabel = parsed.vehicleLabel
      updatedDraft.fee = parsed.fee
    }
    if (
      lowerQ.includes('delhi') || 
      lowerQ.includes('kolkata') || 
      lowerQ.includes('mumbai') || 
      lowerQ.includes('bengaluru') || 
      lowerQ.includes('bangalore') || 
      lowerQ.includes('lucknow') || 
      lowerQ.includes('chennai') || 
      lowerQ.includes('pune') || 
      lowerQ.includes('west bengal') || 
      lowerQ.includes('uttar pradesh') || 
      lowerQ.includes('maharashtra') || 
      lowerQ.includes('karnataka')
    ) {
      updatedDraft.rtoCode = parsed.rtoCode
      updatedDraft.rtoName = parsed.rtoName
    }
    setApplicantDraft(updatedDraft)

    try {
      // Invoke Centralized API with Gemini 2.5 Flash + CMVR Statutory Engine
      const res = await api.sendChatMessage(query, lang, newMsgs)

      setIsAiLoading(false)

      if (res && res.status === 'success' && res.reply) {
        setAiUnavailable(!res.isAiLive)
        // ONLY show autoFillCard if the citizen has provided their name!
        const hasProvidedName = !!(updatedDraft.name || res.extractedData?.name)
        const isApplyIntent = (res.isApplyIntent === true || res.action === 'autofill_form') && hasProvidedName

        const botMsg = {
          sender: 'bot',
          text: res.reply,
          isAiLive: res.isAiLive,
          sourceTag: res.source,
          sources: res.sources || [
            { title: 'Central Motor Vehicles Rules 1989', url: 'https://parivahan.gov.in' },
            { title: 'MoRTH Statutory Gazette', url: 'https://morth.nic.in' }
          ],
          nextActions: res.nextActions || (isApplyIntent ? ['apply', 'quiz', 'fee'] : ['apply', 'quiz', 'eligibility', 'track']),
          followUpChips: res.followUpChips || [],
          autoFillCard: isApplyIntent ? {
            name: updatedDraft.name || res.extractedData?.name || '',
            phone: updatedDraft.phone || res.extractedData?.phone || '',
            vehicle: updatedDraft.vehicle || res.extractedData?.vehicle || 'motorcycle-gear',
            vehicleLabel: updatedDraft.vehicleLabel || res.extractedData?.vehicleLabel || 'Motorcycle with Gear (MCWG)',
            rtoCode: updatedDraft.rtoCode || res.extractedData?.rtoCode || 'DL-01',
            rtoName: updatedDraft.rtoName || res.extractedData?.rtoName || 'Delhi (Mall Road - North Delhi)',
            fee: updatedDraft.fee || res.extractedData?.fee || 200
          } : null
        }

        setMessages((prev) => [...prev, botMsg])
        if (speechSynthesisActive) {
          speakText(res.reply)
        }
      } else {
        // High-Precision Statutory Offline Engine Fallback
        const fallback = getStatutoryResponse(query, lang)
        const hasProvidedName = !!(updatedDraft.name || parsed.name)
        const isApplyIntent = (fallback.isApplyIntent || parsed.isApply) && hasProvidedName

        const botMsg = {
          sender: 'bot',
          text: fallback.text,
          isAiLive: false,
          sources: fallback.sources,
          nextActions: fallback.nextActions,
          followUpChips: fallback.followUpChips,
          autoFillCard: isApplyIntent ? {
            name: updatedDraft.name || parsed.name || '',
            phone: updatedDraft.phone || parsed.phone || '',
            vehicle: updatedDraft.vehicle || parsed.vehicle,
            vehicleLabel: updatedDraft.vehicleLabel || parsed.vehicleLabel,
            rtoCode: updatedDraft.rtoCode || parsed.rtoCode,
            rtoName: updatedDraft.rtoName || parsed.rtoName,
            fee: updatedDraft.fee || parsed.fee
          } : null
        }
        setMessages((prev) => [...prev, botMsg])
        if (speechSynthesisActive) {
          speakText(fallback.text)
        }
      }
    } catch {
      setIsAiLoading(false)
      const fallback = getStatutoryResponse(query, lang)
      const hasProvidedName = !!(updatedDraft.name || parsed.name)
      const isApplyIntent = (fallback.isApplyIntent || parsed.isApply) && hasProvidedName

      const botMsg = {
        sender: 'bot',
        text: fallback.text,
        isAiLive: false,
        sources: fallback.sources,
        nextActions: fallback.nextActions,
        followUpChips: fallback.followUpChips,
        autoFillCard: isApplyIntent ? {
          name: updatedDraft.name || parsed.name || '',
          phone: updatedDraft.phone || parsed.phone || '',
          vehicle: updatedDraft.vehicle || parsed.vehicle,
          vehicleLabel: updatedDraft.vehicleLabel || parsed.vehicleLabel,
          rtoCode: updatedDraft.rtoCode || parsed.rtoCode,
          rtoName: updatedDraft.rtoName || parsed.rtoName,
          fee: updatedDraft.fee || parsed.fee
        } : null
      }
      setMessages((prev) => [...prev, botMsg])
      if (speechSynthesisActive) {
        speakText(fallback.text)
      }
    }
  }

  // Enhanced Resilient Web Speech API Voice Recognition Toggle
  const toggleListening = async () => {
    if (typeof window === 'undefined') return

    // If currently listening, stop and send captured audio text
    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      try {
        recognitionRef.current?.stop()
      } catch {}
      setIsListening(false)
      const captured = (accumulatedTranscriptRef.current || liveTranscript || inputText).trim()
      if (captured) {
        handleSend(captured)
      }
      return
    }

    setMicErrorMessage('')
    setLiveTranscript('')
    accumulatedTranscriptRef.current = ''

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) {
      setMicErrorMessage(
        isHindi
          ? 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है। कृपया गूगल क्रोम (Chrome) या एज (Edge) का उपयोग करें, या नीचे दिए गए वॉयस बटनों पर क्लिक करें।'
          : 'Speech Recognition is not available in this browser. Please use Chrome/Edge or tap the voice query chips below.'
      )
      return
    }

    // Explicitly check/request microphone permission via getUserMedia
    if (navigator?.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Stop audio tracks immediately so SpeechRecognition can take over the mic hardware
        stream.getTracks().forEach((track) => track.stop())
      } catch (err) {
        console.warn('Microphone permission check warning:', err?.message)
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setMicErrorMessage(
            isHindi
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत है। कृपया ब्राउज़र के एड्रेस बार में लॉक (🔒) आइकन पर क्लिक करके माइक की अनुमति दें।'
              : 'Microphone permission was denied. Please click the lock (🔒) icon in your browser address bar to allow microphone access.'
          )
          return
        }
      }
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }

      const recognition = new SpeechRec()
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setMicErrorMessage('')
        setLiveTranscript('')
        accumulatedTranscriptRef.current = ''
      }

      recognition.onresult = (event) => {
        let interim = ''
        let final = ''

        for (let i = 0; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += trans + ' '
          } else {
            interim += trans
          }
        }

        const combined = (final + interim).trim()
        accumulatedTranscriptRef.current = final.trim()
        setLiveTranscript(combined)
        setInputText(combined)

        // Reset silence timer: auto-submit after 2.4s of quiet after speech
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = setTimeout(() => {
          const textToSubmit = (accumulatedTranscriptRef.current || combined).trim()
          if (textToSubmit) {
            try { recognition.stop() } catch {}
            setIsListening(false)
            handleSend(textToSubmit)
          }
        }, 2400)
      }

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error)
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicErrorMessage(
            isHindi
              ? 'माइक्रोफ़ोन अनुमति ब्लॉक है। कृपया ब्राउज़र एड्रेस बार में लॉक आइकन दबाकर माइक ऑन करें।'
              : 'Microphone permission blocked. Please allow mic in browser address bar (lock icon).'
          )
          setIsListening(false)
        } else if (event.error === 'audio-capture') {
          setMicErrorMessage(
            isHindi
              ? 'कोई माइक्रोफ़ोन नहीं मिला। कृपया माइक जोड़ें या नीचे दिए गए वॉयस बटन दबाएं।'
              : 'No microphone found. Please connect a mic or tap the voice query chips below.'
          )
          setIsListening(false)
        } else if (event.error === 'network') {
          setMicErrorMessage(
            isHindi
              ? 'गूगल स्पीच नेटवर्क कनेक्ट नहीं हुआ। आप नीचे दिए गए वॉयस चिप्स से पूछ सकते हैं।'
              : 'Speech recognition network issue. You can tap any voice query below.'
          )
          setIsListening(false)
        } else if (event.error === 'no-speech') {
          // Keep listening in continuous mode
        }
      }

      recognition.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        const textToSubmit = (accumulatedTranscriptRef.current || liveTranscript || inputText).trim()
        setIsListening(false)
        if (textToSubmit && !isAiLoading) {
          handleSend(textToSubmit)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Speech recognition start failed:', err)
      setMicErrorMessage(
        isHindi
          ? 'माइक शुरू नहीं हो सका। कृपया नीचे दिए गए वॉयस बटनों पर क्लिक करें।'
          : 'Could not start microphone. Please tap any of the voice queries below.'
      )
      setIsListening(false)
    }
  }

  // Instant Voice Query Dispatcher (Guaranteed voice test even if mic hardware is absent)
  const handleVoiceQuery = (voicePrompt) => {
    if (isListening) {
      try { recognitionRef.current?.stop() } catch {}
      setIsListening(false)
    }
    setLiveTranscript(voicePrompt)
    setInputText(voicePrompt)
    handleSend(voicePrompt)
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
      }, 600)
    } catch {
      navigate('/apply')
    }
  }

  // Handle Action Button Navigation & Guidance Flow
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
      case 'slot':
        setIsOpen(false)
        navigate('/permanent-dl')
        break
      case 'track':
        setIsOpen(false)
        navigate('/track')
        break
      case 'learn':
        setIsOpen(false)
        navigate('/learn')
        break
      case 'vision':
        setIsOpen(false)
        navigate('/vision-test')
        break
      case 'fee':
        handleSend(isHindi ? 'ड्राइविंग लाइसेंस में कुल कितना सरकारी खर्च आएगा?' : 'How much money will it take in total?')
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
        className="fixed bottom-16 sm:bottom-6 left-4 sm:left-6 p-3 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-full shadow-2xl z-50 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white/20 group backdrop-blur-md cursor-pointer"
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
          <span className="text-[10px] text-blue-100 font-mono">Ask • Voice • Guide</span>
        </div>
        <Mic className="w-3.5 h-3.5 text-blue-200 hidden sm:inline" />
      </button>

      {/* Copilot Sliding Modal / Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false)
            }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 backdrop-blur-sm overscroll-contain"
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              style={{ overscrollBehavior: 'contain' }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-xl h-[92vh] sm:h-[720px] rounded-t-3xl sm:rounded-3xl flex flex-col relative border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden overscroll-contain"
            >
              {/* Header with Bilingual Voice Controls & Live AI status */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Bot className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>Saathi — AI Digital RTO Copilot</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-mono tracking-wide flex items-center gap-1 border border-emerald-400/30">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-300" />
                        <span>Gemini 2.5 Flash</span>
                      </span>
                    </h3>
                    <p className="text-[10px] text-blue-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" />
                      <span>{isHindi ? 'सरल भाषा में आरटीओ मित्र • दलाल मुक्त' : 'Plain Language RTO Guide • Zero Agent Fee'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Voice Output Toggle */}
                  <button
                    onClick={() => setSpeechSynthesisActive(!speechSynthesisActive)}
                    title={speechSynthesisActive ? 'Mute Speech Output' : 'Enable Speech Output'}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-[11px] cursor-pointer"
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
                    className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
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
                    <span>⚡ Operating on Verified CMVR Statutory Knowledge Base</span>
                  </div>
                </div>
              )}

              {/* Messages Body — Fixed background scroll bleed with overscroll-contain & touch pan-y */}
              <div 
                style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
                className="flex-1 p-3 sm:p-4 overflow-y-auto overscroll-contain space-y-4 text-xs select-text touch-pan-y"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[92%] p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80'
                      }`}
                    >
                      {/* Bot Message Header: AI Live indicator + Listen Speaker Button */}
                      {m.sender === 'bot' && (
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-300 flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Saathi Assistant</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Individual Message Speaker Button */}
                            <button
                              type="button"
                              onClick={() => speakText(m.text)}
                              title={isHindi ? 'यह उत्तर सुनें' : 'Listen to this answer'}
                              className="px-1.5 py-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center gap-1 text-[10px] font-medium cursor-pointer"
                            >
                              <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="hidden sm:inline">{isHindi ? 'सुनें' : 'Listen'}</span>
                            </button>

                            {m.isAiLive ? (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                                <span>Live AI</span>
                              </span>
                            ) : (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono flex items-center gap-1">
                                <ShieldCheck className="w-2.5 h-2.5 text-blue-500" />
                                <span>CMVR Engine</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message Content: Formatted with Steps, Bullets, and Highlights */}
                      {m.sender === 'bot' ? (
                        <FormattedBotContent text={m.text} />
                      ) : (
                        <p className="whitespace-pre-line text-[12px] font-medium">{m.text}</p>
                      )}

                      {/* Official Source Citations */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-blue-500" />
                            <span>Statutory Sources:</span>
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

                          {/* Explicit RTO Selector */}
                          <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 sm:col-span-2">
                            <label className="text-[10px] text-slate-500 block mb-1 font-semibold">
                              Confirm State & RTO Circle:
                            </label>
                            <select
                              value={m.autoFillCard.rtoCode}
                              onChange={(e) => {
                                const matched = OFFICIAL_RTOS.find(r => r.code === e.target.value)
                                if (matched) {
                                  updateCard(i, { rtoCode: matched.code, rtoName: matched.name })
                                }
                              }}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600 cursor-pointer"
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
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-600 cursor-pointer"
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
                              Statutory Treasury Challan (Rule 32):
                            </span>
                            <span className="font-bold text-blue-700 dark:text-blue-300">
                              ₹{m.autoFillCard.fee} (Bharat e-Pay Direct)
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
                            I consent to pre-filling Form 2 with these parameters. You will review documents before final submission.
                          </label>
                        </div>

                        {/* Action Buttons */}
                        <button
                          onClick={() => applyAutoFillAndNavigate(m.autoFillCard)}
                          disabled={!cardConsent}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {appliedPreFill ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-300 animate-bounce" />
                              <span>Opening Form 2 Application...</span>
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

                    {/* Contextual Action & Guided Navigation Buttons */}
                    {m.nextActions && m.nextActions.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {m.nextActions.includes('apply') && (
                          <button
                            onClick={() => handleActionClick('apply')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <FileText className="w-3 h-3 text-blue-600" />
                            <span>Start Form 2 Application</span>
                          </button>
                        )}
                        {m.nextActions.includes('quiz') && (
                          <button
                            onClick={() => handleActionClick('quiz')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3 text-emerald-600" />
                            <span>Practise STALL Test (Rule 11)</span>
                          </button>
                        )}
                        {m.nextActions.includes('eligibility') && (
                          <button
                            onClick={() => handleActionClick('eligibility')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <HelpCircle className="w-3 h-3 text-purple-600" />
                            <span>Check Age Eligibility (Sec 4)</span>
                          </button>
                        )}
                        {m.nextActions.includes('slot') && (
                          <button
                            onClick={() => handleActionClick('slot')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Calendar className="w-3 h-3 text-indigo-600" />
                            <span>Book Driving Test Slot (Rule 15)</span>
                          </button>
                        )}
                        {m.nextActions.includes('track') && (
                          <button
                            onClick={() => handleActionClick('track')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Search className="w-3 h-3 text-cyan-600" />
                            <span>Track Application Status</span>
                          </button>
                        )}
                        {m.nextActions.includes('learn') && (
                          <button
                            onClick={() => handleActionClick('learn')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Compass className="w-3 h-3 text-teal-600" />
                            <span>Study Traffic Signs Catalog</span>
                          </button>
                        )}
                        {m.nextActions.includes('vision') && (
                          <button
                            onClick={() => handleActionClick('vision')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-rose-600" />
                            <span>Form 1A Vision Screening</span>
                          </button>
                        )}
                        {m.nextActions.includes('fee') && (
                          <button
                            onClick={() => handleActionClick('fee')}
                            className="px-2.5 py-1 text-[10px] rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3 text-amber-600" />
                            <span>View Rule 32 Fee Schedule</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Dynamic Follow-up Suggestions Chips */}
                    {m.followUpChips && m.followUpChips.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-slate-400 font-medium">Click to ask:</span>
                        {m.followUpChips.map((chip, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleSend(chip)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs font-medium cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs w-fit shadow-xs">
                    <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                    <span>Analyzing your question with Gemini Generative AI...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Error Notice Bar if Mic access is denied or unavailable */}
              {micErrorMessage && (
                <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/80 border-t border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
                  <div className="flex items-center gap-1.5 flex-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{micErrorMessage}</span>
                  </div>
                  <button 
                    onClick={() => setMicErrorMessage('')}
                    className="text-[10px] text-amber-700 dark:text-amber-300 font-bold hover:underline shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Listening Active Waveform Bar with Live Interim Transcript Feedback */}
              {isListening && (
                <div className="px-3.5 py-2.5 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 dark:from-red-950/70 dark:via-rose-950/60 dark:to-red-950/70 border-t border-red-200 dark:border-red-900/80 flex flex-col gap-2 shrink-0 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="font-bold text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                        <span>{isHindi ? 'माइक्रोफ़ोन सुन रहा है... बोलिए' : 'Microphone listening... Speak now'}</span>
                      </span>

                      {/* Animated Sound Wave Bars */}
                      <div className="flex items-center gap-0.5 ml-2">
                        <span className="w-1 bg-red-500 rounded-full h-3 animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <span className="w-1 bg-red-500 rounded-full h-5 animate-pulse" style={{ animationDelay: '0.3s' }} />
                        <span className="w-1 bg-red-500 rounded-full h-2 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 bg-red-500 rounded-full h-4 animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleListening()}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3 h-3" />
                        <span>Done & Send</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                          try { recognitionRef.current?.abort() } catch {}
                          setIsListening(false)
                          setLiveTranscript('')
                        }}
                        className="text-[11px] text-slate-600 dark:text-slate-300 hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {/* Real-time transcription feedback */}
                  <div className="text-[11px] p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-red-200 dark:border-red-900/60 text-slate-800 dark:text-slate-200 font-medium italic min-h-[26px]">
                    {liveTranscript ? (
                      <span>"{liveTranscript}"</span>
                    ) : (
                      <span className="text-slate-400 not-italic">
                        {isHindi 
                          ? 'उदा. "मुझे बाइक का लाइसेंस बनवाना है, क्या फीस लगेगी?"' 
                          : 'Try saying: "I want to apply for a bike licence" or "What is the fee?"'}
                      </span>
                    )}
                  </div>

                  {/* 1-Click Instant Voice Test Queries right inside the active mic bar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold shrink-0">Or tap voice prompt:</span>
                    <button
                      type="button"
                      onClick={() => handleVoiceQuery('मुझे बाइक चलानी है, लाइसेंस कैसे बनेगा?')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 shrink-0 cursor-pointer"
                    >
                      🎙️ मुझे बाइक चलानी है
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVoiceQuery('मेरे पास 10वीं की मार्कशीट नहीं है, क्या आधार कार्ड चलेगा?')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 shrink-0 cursor-pointer"
                    >
                      🎙️ 10वीं मार्कशीट नहीं है
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVoiceQuery('ड्राइविंग लाइसेंस में कुल कितना सरकारी खर्च आएगा?')}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 shrink-0 cursor-pointer"
                    >
                      🎙️ कुल कितना खर्चा?
                    </button>
                  </div>
                </div>
              )}

              {/* 1-Click Guided Chips for Instant Common Village Questions */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-x-auto flex gap-1.5 whitespace-nowrap no-scrollbar shrink-0">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.query)}
                    className="px-2.5 py-1 text-[11px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 shrink-0 font-medium transition-all shadow-2xs cursor-pointer"
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
                {/* Microphone Voice Button with clear active/idle visual indicator */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Stop Listening & Send' : 'Speak via Microphone'}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                    isListening 
                      ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-400/50' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-white animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening
                      ? (isHindi ? 'बोल रहे हैं... आवाज आ रही है...' : 'Listening... Speak now...')
                      : (isHindi 
                          ? 'बोलें या लिखें (उदा. मुझे बाइक चलानी है, लाइसेंस कैसे बनेगा?)...' 
                          : 'Speak or type (e.g. How to get a bike licence, no 10th marksheet)...')
                  }
                  className="flex-1 p-2.5 text-xs border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-colors"
                />

                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={!inputText.trim() || isAiLoading}
                  className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shrink-0 disabled:opacity-40 cursor-pointer shadow-xs"
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
