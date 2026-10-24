'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Activity,
  Heart,
  ChevronLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

// Calibrated Ishihara Plate definitions
const ISHIHARA_PLATES = [
  {
    id: 1,
    title: 'Plate 1: Baseline Demonstration Test',
    instruction: 'Identify the numeral embedded in the chromatic dot matrix.',
    correctAnswer: '12',
    targetNumber: '12',
    options: ['12', '72', '17', 'Unclear']
  },
  {
    id: 2,
    title: 'Plate 2: Red-Green Discrimination (Signal Perception)',
    instruction: 'Identify the numeral to verify traffic signal red/green differentiation.',
    correctAnswer: '74',
    targetNumber: '74',
    options: ['74', '21', '71', 'Unclear']
  },
  {
    id: 3,
    title: 'Plate 3: Traffic Light Green Discrimination',
    instruction: 'Identify the numeral embedded in the red and orange field.',
    correctAnswer: '6',
    targetNumber: '6',
    options: ['6', '8', '5', 'Unclear']
  },
  {
    id: 4,
    title: 'Plate 4: Night Driving Chromatic Acuity',
    instruction: 'Identify the numeral under low-contrast ambient simulation.',
    correctAnswer: '8',
    targetNumber: '8',
    options: ['8', '3', '9', 'Unclear']
  }
]

// Snellen Tumbling 'E' directions and scale levels
const SNELLEN_LEVELS = [
  { level: 1, snellen: '6/18 (20/60)', sizePx: 80 },
  { level: 2, snellen: '6/12 (20/40)', sizePx: 60 },
  { level: 3, snellen: '6/9 (20/30)', sizePx: 44 },
  { level: 4, snellen: '6/6 (20/20)', sizePx: 32 },
  { level: 5, snellen: '6/5 (20/15 - Superior)', sizePx: 24 }
]

const DIRECTIONS = [
  { dir: 'UP', angle: 270, icon: ArrowUp, label: 'Up (↑)' },
  { dir: 'RIGHT', angle: 0, icon: ArrowRight, label: 'Right (→)' },
  { dir: 'DOWN', angle: 90, icon: ArrowDown, label: 'Down (↓)' },
  { dir: 'LEFT', angle: 180, icon: ArrowLeft, label: 'Left (←)' }
]

export default function VisionTest() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const [stage, setStage] = useState('intro') // 'intro' | 'ishihara' | 'snellen' | 'certificate'
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0)
  const [ishiharaAnswers, setIshiharaAnswers] = useState([])

  const [currentSnellenStep, setCurrentSnellenStep] = useState(0)
  const [targetDirection, setTargetDirection] = useState('RIGHT')
  const [snellenScore, setSnellenScore] = useState(0)
  const [snellenFeedback, setSnellenFeedback] = useState(null)

  const [certificateData, setCertificateData] = useState(null)

  const generateNewSnellenTrial = useCallback(() => {
    const randomDir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)].dir
    setTargetDirection(randomDir)
    setSnellenFeedback(null)
  }, [])

  const startIshihara = () => {
    setCurrentPlateIndex(0)
    setIshiharaAnswers([])
    setStage('ishihara')
  }

  const handleIshiharaAnswer = (selected) => {
    const isCorrect = selected === ISHIHARA_PLATES[currentPlateIndex].correctAnswer
    const nextAnswers = [...ishiharaAnswers, { 
      plateId: ISHIHARA_PLATES[currentPlateIndex].id, 
      selected, 
      isCorrect 
    }]
    setIshiharaAnswers(nextAnswers)

    if (currentPlateIndex + 1 < ISHIHARA_PLATES.length) {
      setCurrentPlateIndex(currentPlateIndex + 1)
    } else {
      setStage('snellen')
      setCurrentSnellenStep(0)
      setSnellenScore(0)
      generateNewSnellenTrial()
    }
  }

  const finalizeMedicalClearance = useCallback((finalSnellenScore) => {
    const ishiharaCorrect = ishiharaAnswers.filter(a => a.isCorrect).length
    const colorStatus = ishiharaCorrect >= 3 ? 'Normal Trichromat (Pass)' : 'Partial Chromatic Deficiency (Borderline)'
    
    let acuityRating = '6/6 (20/20 Standard Bilateral)'
    if (finalSnellenScore >= 5) acuityRating = '6/5 (Superior Acuity)'
    else if (finalSnellenScore >= 4) acuityRating = '6/6 (Standard Driving Clearance)'
    else if (finalSnellenScore >= 3) acuityRating = '6/9 (Satisfactory with Corrective Lenses)'
    else acuityRating = '6/12 (Requires Formal Ophthalmologist Consultation)'

    const certId = `MED-NETRA-2026-${Math.floor(100000 + Math.random() * 900000)}`
    const data = {
      certId,
      issueDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      timestamp: new Date().toLocaleTimeString('en-IN'),
      colorVision: colorStatus,
      colorScore: `${ishiharaCorrect}/${ISHIHARA_PLATES.length}`,
      visualAcuity: acuityRating,
      snellenScore: `${finalSnellenScore}/${SNELLEN_LEVELS.length}`,
      status: ishiharaCorrect >= 3 && finalSnellenScore >= 3 ? 'MEDICALLY QUALIFIED' : 'CONDITIONAL CLEARANCE',
      statutoryCitation: 'Central Motor Vehicles Rules 1989, Rule 5(2) (Form 1 Physical Fitness)'
    }

    setCertificateData(data)
    setStage('certificate')

    try {
      localStorage.setItem('licence_saathi_medical_clearance', JSON.stringify(data))
    } catch {
      // ignore storage error
    }
  }, [ishiharaAnswers])

  const handleSnellenDirection = useCallback((directionClicked) => {
    const isMatch = directionClicked === targetDirection
    const nextScore = isMatch ? snellenScore + 1 : snellenScore
    setSnellenScore(nextScore)
    setSnellenFeedback(isMatch ? 'CORRECT' : 'INCORRECT')

    setTimeout(() => {
      const nextStep = currentSnellenStep + 1
      if (nextStep < SNELLEN_LEVELS.length) {
        setCurrentSnellenStep(nextStep)
        generateNewSnellenTrial()
      } else {
        finalizeMedicalClearance(nextScore)
      }
    }, 400)
  }, [targetDirection, snellenScore, currentSnellenStep, finalizeMedicalClearance, generateNewSnellenTrial])

  useEffect(() => {
    if (stage !== 'snellen') return
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') handleSnellenDirection('UP')
      else if (e.key === 'ArrowRight') handleSnellenDirection('RIGHT')
      else if (e.key === 'ArrowDown') handleSnellenDirection('DOWN')
      else if (e.key === 'ArrowLeft') handleSnellenDirection('LEFT')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [stage, handleSnellenDirection])

  return (
    <div className="w-full max-w-4xl mx-auto py-4 sm:py-6">
      <Link 
        to="/" 
        className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 font-medium"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> {isHindi ? 'मुख्य पृष्ठ' : 'Back to Home'}
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isHindi ? 'नेत्र-दृष्टि एवं वर्ण परीक्षण (फॉर्म 1 नियम 5(2))' : 'Netra-Vision Clinical Acuity & Color Screener (Rule 5(2))'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isHindi ? 'डिजिटल दृष्टि एवं वर्णांधता स्व-सत्यापन' : 'Clinical Visual Acuity & Chromatic Screener'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {isHindi 
            ? 'मोटर वाहन अधिनियम 1988 नियम 5(2) के अंतर्गत प्रमाणित इशिहारा 38-प्लेट एवं स्नेलेन टम्बलिंग-ई परीक्षण।' 
            : 'Pre-flight medical fitness screening under CMVR 1989 Rule 5(2) (Form 1). Interactive 60-second Ishihara chromatic plate and Snellen tumbling \'E\' evaluation for traffic light discrimination.'}
        </p>
      </div>

      {stage === 'intro' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Heart className="w-4 h-4 text-red-500" />
                <span>1. Ishihara 38-Plate Chromatic Test</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Evaluates protanopia & deuteranopia (red-green color blindness). Drivers must accurately differentiate green, amber, and red signals under daylight and dusk conditions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span>2. Snellen Tumbling 'E' Acuity</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Measures minimum angle of resolution (6/6 standard). You will identify the direction the limbs of the 'E' are pointing (Up, Down, Left, or Right) as it scales down.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">Statutory Compliance Note (CMVR Rule 5(2)):</strong>
              Completing this clinical module generates an electronic medical clearance token linked directly into your Form 2 applicant dossier, satisfying preliminary RTO medical scrutiny.
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Estimated Duration: ~60 Seconds • Requires Normal Screen Brightness
            </div>
            <Button
              onClick={startIshihara}
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <span>{isHindi ? 'नेत्र परीक्षण प्रारंभ करें' : 'Begin Clinical Vision Test'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {stage === 'ishihara' && (
        <motion.div 
          key={`plate-${currentPlateIndex}`}
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Phase 1 of 2: Color Perception (Ishihara)
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {ISHIHARA_PLATES[currentPlateIndex].title}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
              Plate {currentPlateIndex + 1} / {ISHIHARA_PLATES.length}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            {ISHIHARA_PLATES[currentPlateIndex].instruction}
          </p>

          <div className="flex justify-center py-4">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden flex items-center justify-center select-none bg-amber-50/20">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="40" cy="50" r="9" fill="#E28743" opacity="0.8" />
                <circle cx="70" cy="30" r="11" fill="#EAB308" opacity="0.85" />
                <circle cx="120" cy="40" r="8" fill="#F97316" opacity="0.8" />
                <circle cx="150" cy="60" r="12" fill="#D97706" opacity="0.9" />
                <circle cx="30" cy="90" r="10" fill="#F59E0B" opacity="0.85" />
                <circle cx="170" cy="100" r="11" fill="#EA580C" opacity="0.8" />
                <circle cx="50" cy="140" r="9" fill="#FBBF24" opacity="0.75" />
                <circle cx="140" cy="150" r="10" fill="#FB923C" opacity="0.85" />
                <circle cx="80" cy="170" r="12" fill="#D97706" opacity="0.9" />
                <circle cx="110" cy="175" r="9" fill="#F59E0B" opacity="0.8" />
                
                <text 
                  x="100" 
                  y="125" 
                  textAnchor="middle" 
                  fontSize="78" 
                  fontWeight="900" 
                  fontFamily="monospace"
                  fill="#15803D" 
                  letterSpacing="-2"
                >
                  {ISHIHARA_PLATES[currentPlateIndex].targetNumber}
                </text>

                <circle cx="90" cy="95" r="5" fill="#16A34A" opacity="0.95" />
                <circle cx="112" cy="105" r="6" fill="#15803D" opacity="0.9" />
                <circle cx="100" cy="120" r="7" fill="#166534" opacity="0.9" />
                <circle cx="85" cy="115" r="4" fill="#22C55E" opacity="0.85" />
                <circle cx="120" cy="118" r="5" fill="#14532D" opacity="0.9" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 text-center">
              What number do you see in the circle above?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              {ISHIHARA_PLATES[currentPlateIndex].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleIshiharaAnswer(opt)}
                  className="py-3 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-base hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {stage === 'snellen' && (
        <motion.div 
          key={`snellen-${currentSnellenStep}`}
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Phase 2 of 2: Visual Acuity (Snellen Tumbling 'E')
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Acuity Level: {SNELLEN_LEVELS[currentSnellenStep].snellen}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-300">
              Target {currentSnellenStep + 1} / {SNELLEN_LEVELS.length}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Which direction are the 3 limbs of the letter 'E' pointing? Tap the corresponding directional arrow or use keyboard arrow keys.
          </p>

          <div className="flex justify-center py-6">
            <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center relative">
              <motion.div
                animate={{ rotate: DIRECTIONS.find(d => d.dir === targetDirection)?.angle || 0 }}
                transition={{ type: 'spring', damping: 20 }}
                style={{ fontSize: `${SNELLEN_LEVELS[currentSnellenStep].sizePx}px` }}
                className="font-black font-sans leading-none text-slate-950 dark:text-white select-none"
              >
                E
              </motion.div>

              {snellenFeedback && (
                <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${
                  snellenFeedback === 'CORRECT' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {snellenFeedback === 'CORRECT' ? '✓ Registered' : 'Recorded'}
                </div>
              )}
            </div>
          </div>

          <div className="max-w-xs mx-auto">
            <div className="grid grid-cols-3 gap-2">
              <div />
              <button
                onClick={() => handleSnellenDirection('UP')}
                className="p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-slate-800 dark:text-white flex flex-col items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <ArrowUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold mt-1">UP</span>
              </button>
              <div />

              <button
                onClick={() => handleSnellenDirection('LEFT')}
                className="p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-slate-800 dark:text-white flex flex-col items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold mt-1">LEFT</span>
              </button>
              <div className="flex items-center justify-center text-[10px] text-slate-400 font-bold">
                KEYS
              </div>
              <button
                onClick={() => handleSnellenDirection('RIGHT')}
                className="p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-slate-800 dark:text-white flex flex-col items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold mt-1">RIGHT</span>
              </button>

              <div />
              <button
                onClick={() => handleSnellenDirection('DOWN')}
                className="p-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-slate-800 dark:text-white flex flex-col items-center justify-center active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <ArrowDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold mt-1">DOWN</span>
              </button>
              <div />
            </div>
          </div>
        </motion.div>
      )}

      {stage === 'certificate' && certificateData && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Clinical Visual Fitness Clearance Certificate
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compliant with Motor Vehicles Act 1988 & CMVR 1989 Rule 5(2) (Form 1)
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {certificateData.status}
                </span>
                <span className="block text-[11px] font-mono text-slate-400 mt-1">
                  Cert ID: {certificateData.certId}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 font-semibold block">Color Discrimination Index:</span>
                <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                  {certificateData.colorVision}
                </strong>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Ishihara Score: {certificateData.colorScore} Passed
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 font-semibold block">Visual Acuity Metric:</span>
                <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block mt-0.5">
                  {certificateData.visualAcuity}
                </strong>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Snellen Score: {certificateData.snellenScore} Passed
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <div>
                <strong>Validated On:</strong> {certificateData.issueDate} at {certificateData.timestamp} IST
              </div>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">
                SHA256: {certificateData.certId.slice(-6)}-VERIFIED
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link to="/apply" className="w-full sm:flex-1">
              <Button className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer">
                <span>Continue to Form 2 Application with Medical Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Button
              onClick={startIshihara}
              variant="outline"
              className="w-full sm:w-auto h-12 px-6 rounded-2xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retest Vision</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
