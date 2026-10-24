'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

export default function ChatbotModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const quickPrompts = [
    {
      q: isHindi ? '7-दिन का ऑनलाइन टेस्ट नियम क्या है?' : 'What is the 7-day rule for online LL test?',
      a: isHindi 
        ? 'नियम 11(3) CMVR (कर्नाटक एवं सारथी पोर्टल) के अनुसार, आवेदन जमा करने के 7 दिनों के भीतर ऑनलाइन परीक्षा देना अनिवार्य है। यदि आप 7 दिनों में परीक्षा नहीं देते, तो आवेदन स्वतः रद्द हो जाता है।' 
        : 'Under Rule 11(3) of CMVR (enforced on Sarathi Parivahan in Karnataka and other states), applicants must take the online LL test within 7 days of application, failing which it is automatically cancelled.'
    },
    {
      q: isHindi ? 'स्थायी लाइसेंस के लिए 30-दिन का नियम क्या है?' : 'What is the 30-day rule for permanent DL?',
      a: isHindi 
        ? 'नियम 15 CMVR के तहत, स्थायी ड्राइविंग टेस्ट देने से पहले आपके पास कम से कम 30 दिनों तक वैध लर्नर्स लाइसेंस होना अनिवार्य है। यह 180 दिनों (6 महीने) तक वैध रहता है।' 
        : 'Under Rule 15 of CMVR, you must hold a valid Form 3 Learner\'s Licence for minimum 30 days before appearing for the permanent DL driving test. Valid for 180 days.'
    },
    {
      q: isHindi ? 'बाइक और कार लाइसेंस की फीस कितनी है?' : 'What are the fees for Bike, Car, and Combo licences?',
      a: isHindi 
        ? 'CMVR नियम 32 के अनुसार: सिंगल क्लास (केवल बाइक या केवल कार) = ₹200 (₹150 LL + ₹50 टेस्ट)। बाइक + कार कॉम्बो = ₹350 (₹150 + ₹150 + ₹50)। कमर्शियल ट्रांसपोर्ट = ₹300।' 
        : 'Per CMVR Rule 32: Single category (Bike or Car) = ₹200 (₹150 LL + ₹50 test). Dual Bike + Car combo = ₹350 (₹150 MCWG + ₹150 LMV + ₹50 test). Commercial Transport = ₹300.'
    },
    {
      q: isHindi ? 'कार ADTT टेस्ट में पास होने के नियम क्या हैं?' : 'How to pass the Car ADTT driving track test?',
      a: isHindi 
        ? 'स्वचालित टेस्ट ट्रैक (ADTT) पर: 1) 1:6 ढलान पर कार रोकें और बिना 15 सेमी से अधिक पीछे लुढ़के आगे बढ़ें। 2) 3 मिनट में समानांतर पार्किंग करें। 3) सीटबेल्ट अवश्य पहनें।' 
        : 'On Automated Driving Test Tracks (ADTT): 1) On 1:6 incline, restart without rolling back more than 15 cm (6 inches). 2) Complete parallel parking in 3 minutes without touching curb poles. 3) Fasten seatbelt before moving.'
    }
  ]

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: isHindi 
        ? 'नमस्ते! मैं सारथी साथी AI हूँ। ड्राइविंग लाइसेंस, आरटीओ नियम, फीस या टेस्ट ट्रैक से संबंधित कोई भी प्रश्न पूछें।' 
        : 'Namaste! I am Saathi AI, your Parivahan assistant. Ask me anything about Indian RTO rules, fees, 7-day deadlines, or ADTT test tracks.'
    }
  ])

  const [inputText, setInputText] = useState('')

  const handleSend = (textToSend) => {
    const query = textToSend || inputText
    if (!query.trim()) return

    const newMsgs = [...messages, { sender: 'user', text: query }]
    setMessages(newMsgs)
    setInputText('')

    // Match keywords or fallback
    setTimeout(() => {
      let reply = isHindi 
        ? 'सटीक आरटीओ नियमों के लिए सारथी पोर्टल (parivahan.gov.in) देखें अथवा त्वरित प्रश्नों में से चुनें।' 
        : 'For official state notifications, check parivahan.gov.in or click one of the quick topics below.'

      const lower = query.toLowerCase()
      if (lower.includes('7') || lower.includes('day') || lower.includes('दिन') || lower.includes('cancel')) {
        reply = quickPrompts[0].a
      } else if (lower.includes('30') || lower.includes('wait') || lower.includes('permanent') || lower.includes('स्थायी')) {
        reply = quickPrompts[1].a
      } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('फीस') || lower.includes('रुपये') || lower.includes('rupee')) {
        reply = quickPrompts[2].a
      } else if (lower.includes('adtt') || lower.includes('track') || lower.includes('parking') || lower.includes('test') || lower.includes('कार') || lower.includes('ढलान')) {
        reply = quickPrompts[3].a
      }

      setMessages(prev => [...prev, { sender: 'bot', text: reply }])
    }, 400)
  }

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Saathi AI Assistant"
        className="fixed bottom-16 sm:bottom-6 left-4 sm:left-6 p-3.5 bg-blue-600 text-white rounded-full shadow-2xl z-50 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 border-2 border-white/20"
      >
        <Bot className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">Saathi AI</span>
      </button>

      {/* Chat Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-3 sm:p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white dark:bg-slate-900 w-full max-w-sm sm:max-w-md h-[520px] sm:h-[580px] rounded-3xl flex flex-col relative border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-3.5 bg-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs flex items-center gap-1">
                      Saathi AI <Sparkles className="w-3 h-3 text-amber-300" />
                    </h3>
                    <p className="text-[10px] text-blue-100">
                      {isHindi ? '24/7 आरटीओ एवं परिवहन सहायक' : '24/7 Parivahan & RTO Assistant'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 rounded-2xl leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompt Chips */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 overflow-x-auto flex gap-1.5 whitespace-nowrap no-scrollbar">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.q)}
                    className="px-2.5 py-1 text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 hover:border-blue-500 shrink-0"
                  >
                    {p.q}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }}
                className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-1.5"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isHindi ? 'प्रश्न पूछें (उदा. 7-दिन का नियम)...' : 'Ask about RTO rules, fees, ADTT...'}
                  className="flex-1 p-2 text-xs border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
                <Button type="submit" size="sm" className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
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
