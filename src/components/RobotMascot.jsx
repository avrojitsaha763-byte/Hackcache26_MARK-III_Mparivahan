import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { soundFx } from '@/lib/soundFx'

export default function RobotMascot({ onClick, isHindi = false, isModalOpen = false }) {
  const [isWaving, setIsWaving] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [speechText, setSpeechText] = useState(
    isHindi
      ? 'नमस्ते! ड्राइविंग लाइसेंस में मदद चाहिए? मुझे क्लिक करें! 👋'
      : 'Namaste! Need Driving Licence guidance? Click me! 👋'
  )

  // Rotating tips / prompts in speech bubble
  useEffect(() => {
    const prompts = isHindi
      ? [
          'नमस्ते! ड्राइविंग लाइसेंस में मदद चाहिए? मुझे क्लिक करें! 👋',
          'बाइक या कार का नया लाइसेंस बनवाना है? पूछें! 🚗',
          'बिना दलाल, सरकारी फीस (Rule 32) जानें! 💰',
          'दृष्टि और हैज़र्ड मॉक टेस्ट की तैयारी करें! 🎯'
        ]
      : [
          'Namaste! Need Driving Licence guidance? Click me! 👋',
          'Applying for Bike or Car LL? Ask me anything! 🚗',
          'Zero touts, 100% transparent govt fee (Rule 32)! 💰',
          'Try our Netra-Vision & STALL Mock Tests! 🎯'
        ]

    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % prompts.length
      setSpeechText(prompts[idx])
    }, 4500)

    return () => clearInterval(interval)
  }, [isHindi])

  // Handle user click on the walking robot
  const handleClick = () => {
    setIsWaving(true)
    setSpeechText(isHindi ? 'सारथी एआई कॉपायलट खुल रहा है... 🚀' : 'Opening Saathi Copilot... 🚀')
    soundFx.robotGreeting()

    // Trigger waving animation, then launch modal
    setTimeout(() => {
      onClick?.()
      setIsWaving(false)
    }, 450)
  }

  // If the chatbot modal is already open, hide the floating walking robot
  if (isModalOpen) return null

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-3 sm:left-6 z-40 select-none pointer-events-auto">
      {/* Interactive Floating Speech Callout Bubble */}
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            onClick={handleClick}
            className="absolute -top-14 left-0 sm:left-2 whitespace-nowrap bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl border border-blue-400/40 text-slate-800 dark:text-blue-100 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all group"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="max-w-[240px] truncate">{speechText}</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:rotate-12 transition-transform" />
            {/* Bubble arrow pointer pointing down to the robot */}
            <div className="absolute -bottom-1.5 left-8 w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-blue-400/40 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Walking & Waving Interactive Robot Mascot */}
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        animate={
          isWaving
            ? { scale: [1, 1.12, 1], rotate: [0, -3, 3, 0] }
            : {
                // Natural walking/bobbing motion towards the user
                x: [0, 8, 0],
                y: [0, -6, 0]
              }
        }
        transition={
          isWaving
            ? { duration: 0.45, ease: 'easeInOut' }
            : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
        }
        title={isHindi ? 'सारथी एआई रोबोट — क्लिक करें' : 'Saathi AI Robot — Click to chat'}
        className="relative cursor-pointer group p-1"
      >
        {/* Soft Ambient Cyber Aura */}
        <div className="absolute inset-0 bg-blue-500/25 dark:bg-cyan-500/25 rounded-full blur-xl group-hover:bg-blue-500/40 transition-colors pointer-events-none" />

        {/* 3D-Styled SVG Rigged Robot */}
        <svg
          viewBox="0 0 120 130"
          className="w-18 h-20 sm:w-20 sm:h-22 drop-shadow-2xl overflow-visible"
        >
          <defs>
            {/* Metallic Head & Body Gradients */}
            <linearGradient id="robotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="robotVisorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>

            {/* Glowing Antenna Orb */}
            <radialGradient id="antennaOrb" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </radialGradient>
          </defs>

          {/* Ground Contact Shadow with Breathing Scale */}
          <ellipse
            cx="60"
            cy="124"
            rx={isHovered ? '24' : '20'}
            ry="4.5"
            className="fill-slate-900/40 dark:fill-black/60 transition-all duration-300"
          />

          {/* 1. Left Leg (Cycles in walking motion) */}
          <g
            className="origin-[48px_96px]"
            style={{
              animation: !isWaving ? 'robotLegLeft 1.2s ease-in-out infinite alternate' : 'none'
            }}
          >
            <rect x="44" y="94" width="8" height="18" rx="4" fill="#1e293b" />
            {/* Left Foot */}
            <rect x="40" y="110" width="14" height="6" rx="3" fill="#0f172a" />
            <line x1="42" y1="113" x2="52" y2="113" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* 2. Right Leg (Alternates in walking motion) */}
          <g
            className="origin-[72px_96px]"
            style={{
              animation: !isWaving ? 'robotLegRight 1.2s ease-in-out infinite alternate' : 'none'
            }}
          >
            <rect x="68" y="94" width="8" height="18" rx="4" fill="#1e293b" />
            {/* Right Foot */}
            <rect x="66" y="110" width="14" height="6" rx="3" fill="#0f172a" />
            <line x1="68" y1="113" x2="78" y2="113" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* 3. Left Arm (Gently swings while walking) */}
          <g
            className="origin-[30px_68px]"
            style={{
              animation: !isWaving ? 'robotArmLeft 1.2s ease-in-out infinite alternate' : 'none'
            }}
          >
            <rect x="24" y="66" width="7" height="22" rx="3.5" fill="#334155" />
            {/* Glove hand */}
            <circle cx="27.5" cy="90" r="4.5" fill="#1e293b" />
          </g>

          {/* 4. Robot Torso / Chassis */}
          <rect
            x="36"
            y="60"
            width="48"
            height="38"
            rx="12"
            fill="url(#robotBodyGrad)"
            stroke="#60a5fa"
            strokeWidth="1.5"
          />

          {/* Torso Center Glowing Core Reactor (Arc Reactor / Ashok Chakra tribute) */}
          <circle cx="60" cy="78" r="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="60" cy="78" r="5" fill="#38bdf8" className="animate-pulse" />
          <circle cx="60" cy="78" r="2" fill="#ffffff" />

          {/* Tri-color Accent Badges on Chest */}
          <line x1="44" y1="67" x2="52" y2="67" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
          <line x1="44" y1="71" x2="52" y2="71" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="44" y1="75" x2="52" y2="75" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />

          {/* 5. Antenna with Pulsing Glowing Beacon */}
          <line x1="60" y1="24" x2="60" y2="12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="10" r="5.5" fill="url(#antennaOrb)" stroke="#ffffff" strokeWidth="1" className="animate-pulse" />
          <circle cx="60" cy="10" r="9" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" className="animate-spin" />

          {/* 6. Robot Head */}
          <g className="origin-[60px_42px]">
            {/* Ear Bolts */}
            <rect x="23" y="36" width="6" height="12" rx="2" fill="#475569" />
            <rect x="91" y="36" width="6" height="12" rx="2" fill="#475569" />

            {/* Main Head Unit */}
            <rect
              x="27"
              y="22"
              width="66"
              height="40"
              rx="14"
              fill="url(#robotBodyGrad)"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />

            {/* Glossy Curved Visor Screen */}
            <rect
              x="33"
              y="28"
              width="54"
              height="28"
              rx="9"
              fill="#030712"
              stroke="#38bdf8"
              strokeWidth="1.2"
            />

            {/* Glowing Interactive Cyber Eyes */}
            {isWaving ? (
              // Joyful Happy Smiling Arcs (^ ‿ ^) when waving
              <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 43 43 Q 48 37 53 43" />
                <path d="M 67 43 Q 72 37 77 43" />
              </g>
            ) : (
              // Friendly Glowing Eyes with Glint
              <g>
                {/* Left Eye */}
                <circle cx="48" cy="41" r="5" fill="url(#eyeGlow)" />
                <circle cx="46.5" cy="39.5" r="1.5" fill="#ffffff" />

                {/* Right Eye */}
                <circle cx="72" cy="41" r="5" fill="url(#eyeGlow)" />
                <circle cx="70.5" cy="39.5" r="1.5" fill="#ffffff" />
              </g>
            )}

            {/* Subtle Friendly Smile on Visor */}
            <path
              d={isWaving ? "M 53 49 Q 60 55 67 49" : "M 55 49 Q 60 53 65 49"}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.9"
            />
          </g>

          {/* 7. Right Arm Rigged with Waving Animation (Waving Hi Upon Click!) */}
          <g
            className="origin-[89px_68px]"
            style={{
              transformOrigin: '89px 68px',
              animation: isWaving
                ? 'robotWaveHi 0.3s ease-in-out infinite alternate'
                : !isHovered
                ? 'robotArmRightWalk 1.2s ease-in-out infinite alternate'
                : 'robotArmRightHover 0.8s ease-in-out infinite alternate'
            }}
          >
            {/* Upper & Lower Arm */}
            <rect x="89" y="66" width="7" height="22" rx="3.5" fill="#334155" />
            {/* Waving Open Hand */}
            <g transform="translate(86, 88)">
              <circle cx="6.5" cy="4" r="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
              {/* Little wave gesture lines when actively waving */}
              {isWaving && (
                <path
                  d="M 13 -2 C 16 2, 16 6, 13 10"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </g>
          </g>
        </svg>

        {/* Floating Quick Action Badge */}
        <div className="flex items-center justify-center -mt-2">
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[9px] shadow-md border border-white/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span>Saathi Bot</span>
          </span>
        </div>
      </motion.div>

      {/* Embedded Custom CSS Keyframes for Natural Walking & Waving */}
      <style>{`
        @keyframes robotLegLeft {
          0% { transform: rotate(-14deg); }
          100% { transform: rotate(14deg); }
        }
        @keyframes robotLegRight {
          0% { transform: rotate(14deg); }
          100% { transform: rotate(-14deg); }
        }
        @keyframes robotArmLeft {
          0% { transform: rotate(16deg); }
          100% { transform: rotate(-16deg); }
        }
        @keyframes robotArmRightWalk {
          0% { transform: rotate(-16deg); }
          100% { transform: rotate(16deg); }
        }
        @keyframes robotArmRightHover {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(-35deg); }
        }
        @keyframes robotWaveHi {
          0% { transform: rotate(-75deg) translateY(-8px); }
          100% { transform: rotate(-110deg) translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
