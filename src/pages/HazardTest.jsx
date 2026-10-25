import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Zap, 
  Gauge, 
  Car, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Download,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useStickyState } from '@/hooks/useStickyState'

// 5 Statutory Indian Road Hazard Scenarios compliant with MoRTH & CMVR guidelines
const HAZARD_SCENARIOS = [
  {
    id: 'pedestrian',
    titleEn: 'Pedestrian on Zebra Crossing',
    titleHi: 'पैदल यात्री जेब्रा क्रॉसिंग पर',
    category: 'Urban Crossing',
    speedKmh: 50,
    safeMaxMs: 420,
    onsetDelayMs: 2200, // Appears 2.2s into the run
    descriptionEn: 'A child darts across an unsignalled zebra crossing from behind a stationary bus.',
    descriptionHi: 'एक बच्चा रुकी हुई बस के पीछे से जेब्रा क्रॉसिंग पर दौड़ता हुआ आता है।',
    statutoryTipEn: 'CMVR Rule 11: Drivers must yield right of way to pedestrians on marked crossings.',
    objectType: 'pedestrian',
  },
  {
    id: 'lead_brake',
    titleEn: 'Lead Taxi Sudden Emergency Brake',
    titleHi: 'आगे चल रही टैक्सी का अचानक आपातकालीन ब्रेक',
    category: 'Highway Tailgating',
    speedKmh: 60,
    safeMaxMs: 380,
    onsetDelayMs: 2600,
    descriptionEn: 'A lead commercial taxi slams on brakes to avoid an unannounced road crater.',
    descriptionHi: 'सड़क पर गड्ढे से बचने के लिए आगे चल रही टैक्सी ने अचानक आपातकालीन ब्रेक लगाया।',
    statutoryTipEn: '2-Second Rule: Maintain at least one car length for every 15 km/h of speed.',
    objectType: 'vehicle_brake',
  },
  {
    id: 'stray_cattle',
    titleEn: 'Stray Cattle Crossing Highway Median',
    titleHi: 'सड़क पर अचानक मवेशी का आना',
    category: 'Rural Highway',
    speedKmh: 45,
    safeMaxMs: 450,
    onsetDelayMs: 2400,
    descriptionEn: 'A stray cow emerges from behind the central divider foliage onto the active carriageway.',
    descriptionHi: 'सड़क के डिवाइडर की झाड़ियों के पीछे से अचानक एक गाय मुख्य सड़क पर आ जाती है।',
    statutoryTipEn: 'Section 112 MV Act: Always drive within stopping distance visible by headlights/daylight.',
    objectType: 'cattle',
  },
  {
    id: 'signal_amber',
    titleEn: 'Amber to Red Signal Transition',
    titleHi: 'पीली से लाल बत्ती का त्वरित बदलाव',
    category: 'Junction Control',
    speedKmh: 40,
    safeMaxMs: 400,
    onsetDelayMs: 2100,
    descriptionEn: 'Traffic signal at busy 4-way intersection flips to Amber with stop line 25m ahead.',
    descriptionHi: 'व्यस्त चौराहे पर ट्रैफिक सिग्नल 25 मीटर की दूरी पर अचानक पीला होकर लाल हो जाता है।',
    statutoryTipEn: 'Amber means STOP unless stopping cannot be done safely without hazard to rear traffic.',
    objectType: 'signal_red',
  },
  {
    id: 'blind_auto',
    titleEn: 'Blind-Spot Auto-Rickshaw Swerve',
    titleHi: 'अंधे मोड़ पर ऑटो-रिक्शा का अचानक मुड़ना',
    category: 'Lateral Merge',
    speedKmh: 48,
    safeMaxMs: 390,
    onsetDelayMs: 2500,
    descriptionEn: 'An auto-rickshaw cuts across two lanes from the left kerb without using indicators.',
    descriptionHi: 'बिना इंडिकेटर दिए बाईं लेन से एक ऑटो-रिक्शा अचानक दो लेन काटकर आगे आ जाता है।',
    statutoryTipEn: 'Section 184 MV Act: Dangerous driving includes sudden swerving without rear mirrors check.',
    objectType: 'auto_rickshaw',
  }
]

export default function HazardTest() {
  const [lang] = useStickyState('en', 'app-lang')
  const isHindi = lang === 'hi'

  const [gameState, setGameState] = useState('IDLE') // IDLE, RUNNING, HAZARD_ACTIVE, BRAKED, SUMMARY
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [results, setResults] = useState([]) // Array of trial outcomes
  const [reactionTimeMs, setReactionTimeMs] = useState(null)
  const [stoppingDistanceMeters, setStoppingDistanceMeters] = useState(null)
  const [isCollision, setIsCollision] = useState(false)
  const [citizenName, setCitizenName] = useState('Citizen Candidate')

  const canvasRef = useRef(null)
  const animFrameIdRef = useRef(null)
  const runStartTimeRef = useRef(0)
  const hazardTriggerTimeRef = useRef(0)
  const hazardActiveRef = useRef(false)
  const brakePressedRef = useRef(false)
  const roadOffsetRef = useRef(0)
  const audioContextRef = useRef(null)

  const currentScenario = HAZARD_SCENARIOS[currentScenarioIndex] || HAZARD_SCENARIOS[0]

  // Play synthesized audio tones for immersion
  const playAudioCue = useCallback((type) => {
    if (!soundEnabled) return
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        audioContextRef.current = new AudioCtx()
      }
      const ctx = audioContextRef.current
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'brake') {
        // High-pitch screech sound
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.35)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
      } else if (type === 'hazard') {
        // Double warning beep
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      } else if (type === 'pass') {
        // Harmonic positive chime
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1) // E5
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      } else if (type === 'fail') {
        // Low crash/thud tone
        osc.type = 'square'
        osc.frequency.setValueAtTime(140, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
        osc.start()
        osc.stop(ctx.currentTime + 0.4)
      }
    } catch {
      // AudioContext not available in testing environments
    }
  }, [soundEnabled])

  // Handle Brake Trigger (Spacebar or Button Tap)
  const triggerBrake = useCallback(() => {
    if (gameState !== 'RUNNING' && gameState !== 'HAZARD_ACTIVE') return
    if (brakePressedRef.current) return

    brakePressedRef.current = true
    playAudioCue('brake')

    const now = performance.now()

    if (!hazardActiveRef.current) {
      // False alarm: Braked before hazard appeared!
      setGameState('BRAKED')
      setReactionTimeMs(-1)
      setStoppingDistanceMeters(0)
      setIsCollision(false)

      setResults((prev) => [
        ...prev,
        {
          scenario: currentScenario,
          reactionMs: -1,
          stoppingDistanceM: 0,
          status: 'FALSE_ALARM',
          note: isHindi ? 'खतरे से पहले ब्रेक लगा दिया (गलत चेतावनी)' : 'Premature brake triggered before hazard onset'
        }
      ])
      return
    }

    // Legitimate reaction to hazard
    const rt = Math.round(now - hazardTriggerTimeRef.current)
    const speedMs = (currentScenario.speedKmh * 1000) / 3600 // m/s
    const friction = 0.7 // Dry asphalt friction coefficient
    const gravity = 9.81
    // Total Stopping Distance = Reaction Distance + Braking Distance
    const reactionDist = speedMs * (rt / 1000)
    const brakingDist = (speedMs * speedMs) / (2 * friction * gravity)
    const totalDist = parseFloat((reactionDist + brakingDist).toFixed(1))

    const collision = rt > currentScenario.safeMaxMs
    if (collision) {
      playAudioCue('fail')
    } else {
      playAudioCue('pass')
    }

    setReactionTimeMs(rt)
    setStoppingDistanceMeters(totalDist)
    setIsCollision(collision)
    setGameState('BRAKED')

    setResults((prev) => [
      ...prev,
      {
        scenario: currentScenario,
        reactionMs: rt,
        stoppingDistanceM: totalDist,
        status: collision ? 'COLLISION' : 'SAFE_STOP',
        note: collision 
          ? (isHindi ? `विलंबित प्रतिक्रिया (+${rt - currentScenario.safeMaxMs}ms देरी)` : `Delayed reflex (+${rt - currentScenario.safeMaxMs}ms over threshold)`)
          : (isHindi ? 'सुरक्षित एवं त्वरित ब्रेक' : 'Optimal defensive brake reflex')
      }
    ])
  }, [gameState, currentScenario, isHindi, playAudioCue])

  // Keyboard Spacebar Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowDown') {
        e.preventDefault()
        triggerBrake()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [triggerBrake])

  // Start a scenario run
  const startScenario = useCallback((scenarioIdx) => {
    setCurrentScenarioIndex(scenarioIdx)
    setReactionTimeMs(null)
    setStoppingDistanceMeters(null)
    setIsCollision(false)
    brakePressedRef.current = false
    hazardActiveRef.current = false
    hazardTriggerTimeRef.current = 0
    setGameState('RUNNING')

    const now = performance.now()
    runStartTimeRef.current = now

    // Schedule hazard appearance
    const scenario = HAZARD_SCENARIOS[scenarioIdx]
    const timer = setTimeout(() => {
      if (!brakePressedRef.current) {
        hazardActiveRef.current = true
        hazardTriggerTimeRef.current = performance.now()
        setGameState('HAZARD_ACTIVE')
        playAudioCue('hazard')
      }
    }, scenario.onsetDelayMs)

    return () => clearTimeout(timer)
  }, [playAudioCue])

  // Canvas 60fps Renderer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTimestamp = performance.now()

    const render = (timestamp) => {
      const dt = timestamp - lastTimestamp
      lastTimestamp = timestamp

      const width = canvas.width
      const height = canvas.height

      // 1. Sky & Horizon Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45)
      skyGrad.addColorStop(0, '#0f172a') // Dark night/twilight or blue slate
      skyGrad.addColorStop(1, '#334155')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, width, height * 0.45)

      // Distant city skyline / trees
      ctx.fillStyle = '#1e293b'
      for (let i = 0; i < 15; i++) {
        const treeX = i * (width / 14)
        const treeH = 30 + ((i * 13) % 25)
        ctx.fillRect(treeX, height * 0.45 - treeH, width / 18, treeH)
      }

      // 2. Road Perspective (Trapezoid)
      const horizonY = height * 0.42
      const roadTopWidth = width * 0.18
      const roadBottomWidth = width * 0.85

      const roadGrad = ctx.createLinearGradient(0, horizonY, 0, height)
      roadGrad.addColorStop(0, '#334155')
      roadGrad.addColorStop(1, '#0f172a')
      ctx.fillStyle = roadGrad

      ctx.beginPath()
      ctx.moveTo(width / 2 - roadTopWidth / 2, horizonY)
      ctx.lineTo(width / 2 + roadTopWidth / 2, horizonY)
      ctx.lineTo(width / 2 + roadBottomWidth / 2, height)
      ctx.lineTo(width / 2 - roadBottomWidth / 2, height)
      ctx.closePath()
      ctx.fill()

      // Side Curbs / Kerb Stripes (Indian Yellow & White)
      ctx.strokeStyle = '#eab308'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(width / 2 - roadTopWidth / 2, horizonY)
      ctx.lineTo(width / 2 - roadBottomWidth / 2, height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(width / 2 + roadTopWidth / 2, horizonY)
      ctx.lineTo(width / 2 + roadBottomWidth / 2, height)
      ctx.stroke()

      // 3. Moving Centre Dashed Line
      if (gameState === 'RUNNING' || gameState === 'HAZARD_ACTIVE') {
        roadOffsetRef.current = (roadOffsetRef.current + (dt * 0.35)) % 40
      }

      ctx.strokeStyle = '#f8fafc'
      ctx.lineWidth = 5
      ctx.setLineDash([20, 20])
      ctx.lineDashOffset = -roadOffsetRef.current

      ctx.beginPath()
      ctx.moveTo(width / 2, horizonY)
      ctx.lineTo(width / 2, height - 70)
      ctx.stroke()
      ctx.setLineDash([]) // Reset dash

      // 4. Render Hazard Object if active
      if (hazardActiveRef.current || gameState === 'BRAKED') {
        const scenario = HAZARD_SCENARIOS[currentScenarioIndex] || HAZARD_SCENARIOS[0]
        const progress = Math.min(1, (timestamp - hazardTriggerTimeRef.current) / 800)
        
        // Hazard grows closer with perspective
        const hazY = horizonY + (height * 0.32 * (progress * 0.9 + 0.1))
        const hazScale = 0.5 + progress * 0.9

        ctx.save()
        ctx.translate(width / 2, hazY)
        ctx.scale(hazScale, hazScale)

        if (scenario.objectType === 'pedestrian') {
          // Pedestrian with school bag
          ctx.fillStyle = '#f97316' // Orange shirt
          ctx.beginPath()
          ctx.arc(0, -45, 12, 0, Math.PI * 2) // Head
          ctx.fill()
          ctx.fillRect(-10, -32, 20, 32) // Torso
          ctx.fillStyle = '#1e293b'
          ctx.fillRect(-8, 0, 6, 26) // Left leg
          ctx.fillRect(2, 0, 6, 26) // Right leg

          // Warning Aura
          ctx.strokeStyle = '#ef4444'
          ctx.lineWidth = 3
          ctx.strokeRect(-18, -60, 36, 90)
        } else if (scenario.objectType === 'vehicle_brake') {
          // Yellow-black commercial taxi rear with bright flashing red brake lamps
          ctx.fillStyle = '#eab308'
          ctx.fillRect(-45, -35, 90, 50)
          ctx.fillStyle = '#0f172a'
          ctx.fillRect(-40, -55, 80, 22) // Rear window

          // Glowing Red Brake Lamps
          ctx.fillStyle = '#ef4444'
          ctx.shadowColor = '#ef4444'
          ctx.shadowBlur = 20
          ctx.fillRect(-42, -20, 18, 14)
          ctx.fillRect(24, -20, 18, 14)
          ctx.shadowBlur = 0
        } else if (scenario.objectType === 'cattle') {
          // Stray cow profile
          ctx.fillStyle = '#f8fafc' // White cow
          ctx.beginPath()
          ctx.ellipse(0, -15, 38, 22, 0, 0, Math.PI * 2) // Body
          ctx.fill()
          ctx.beginPath()
          ctx.arc(28, -28, 14, 0, Math.PI * 2) // Head
          ctx.fill()
          // Horns
          ctx.strokeStyle = '#64748b'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(32, -40)
          ctx.lineTo(38, -50)
          ctx.moveTo(24, -40)
          ctx.lineTo(26, -50)
          ctx.stroke()
          // Legs
          ctx.fillStyle = '#94a3b8'
          ctx.fillRect(-25, 4, 8, 26)
          ctx.fillRect(-8, 4, 8, 26)
          ctx.fillRect(10, 4, 8, 26)
          ctx.fillRect(24, 4, 8, 26)
        } else if (scenario.objectType === 'signal_red') {
          // Traffic Signal Head with Red lamp lit
          ctx.fillStyle = '#1e293b'
          ctx.fillRect(-15, -60, 30, 70)
          ctx.fillStyle = '#ef4444'
          ctx.shadowColor = '#ef4444'
          ctx.shadowBlur = 25
          ctx.beginPath()
          ctx.arc(0, -42, 10, 0, Math.PI * 2) // Red bulb
          ctx.fill()
          ctx.shadowBlur = 0
          // Yellow & Green bulbs dark
          ctx.fillStyle = '#451a03'
          ctx.beginPath()
          ctx.arc(0, -22, 8, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#064e3b'
          ctx.beginPath()
          ctx.arc(0, -2, 8, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Auto Rickshaw
          ctx.fillStyle = '#16a34a' // Green auto
          ctx.fillRect(-35, -30, 70, 45)
          ctx.fillStyle = '#facc15' // Yellow hood
          ctx.fillRect(-35, -45, 70, 16)
          ctx.fillStyle = '#0f172a'
          ctx.fillRect(-12, 15, 24, 12) // Single front wheel
        }

        ctx.restore()
      }

      // 5. Cockpit Dashboard & Steering Wheel HUD
      ctx.fillStyle = '#090d16'
      ctx.beginPath()
      ctx.moveTo(0, height)
      ctx.lineTo(0, height - 75)
      ctx.bezierCurveTo(width * 0.25, height - 95, width * 0.75, height - 95, width, height - 75)
      ctx.lineTo(width, height)
      ctx.closePath()
      ctx.fill()

      // Steering wheel rim top curve
      ctx.strokeStyle = '#1e293b'
      ctx.lineWidth = 14
      ctx.beginPath()
      ctx.arc(width / 2, height + 90, 150, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()

      // Hazard Visual Flasher if Hazard is Active
      if (gameState === 'HAZARD_ACTIVE') {
        const pulse = Math.floor(timestamp / 100) % 2 === 0
        if (pulse) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.18)'
          ctx.fillRect(0, 0, width, height)
        }
      }

      if (gameState === 'RUNNING' || gameState === 'HAZARD_ACTIVE') {
        animFrameIdRef.current = requestAnimationFrame(render)
      }
    }

    animFrameIdRef.current = requestAnimationFrame(render)

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
    }
  }, [gameState, currentScenarioIndex])

  // Progress to next scenario or summary
  const handleNextScenario = () => {
    if (currentScenarioIndex < HAZARD_SCENARIOS.length - 1) {
      startScenario(currentScenarioIndex + 1)
    } else {
      setGameState('SUMMARY')
    }
  }

  // Restart all trials
  const handleRestart = () => {
    setResults([])
    startScenario(0)
  }

  // Calculate summary metrics
  const validTrials = results.filter((r) => r.reactionMs > 0)
  const avgReactionMs = validTrials.length > 0 
    ? Math.round(validTrials.reduce((acc, cur) => acc + cur.reactionMs, 0) / validTrials.length) 
    : 0
  const totalCollisions = results.filter((r) => r.status === 'COLLISION').length
  const totalPassed = results.filter((r) => r.status === 'SAFE_STOP').length

  // Overall MoRTH Reflex Grade
  let gradeLetter = 'A+'
  let gradeBadgeColor = 'emerald'
  let gradeTitle = 'Elite RTO Grade'
  if (totalCollisions > 2 || avgReactionMs > 450) {
    gradeLetter = 'F'
    gradeBadgeColor = 'rose'
    gradeTitle = 'High Hazard Collision Risk (Retest Recommended)'
  } else if (totalCollisions === 1 || avgReactionMs > 390) {
    gradeLetter = 'B'
    gradeBadgeColor = 'amber'
    gradeTitle = 'Defensive Driver (CMVR Compliant)'
  } else {
    gradeLetter = 'A+'
    gradeBadgeColor = 'emerald'
    gradeTitle = 'Master Reflex Precision (ADTT Ready)'
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-400/30 rounded-full text-red-300 text-xs font-semibold mb-3">
              <Zap className="w-4 h-4 text-red-400" />
              <span>{isHindi ? 'STALL प्रो — 60-सेकंड हैज़र्ड परसेप्शन एरेना' : 'STALL Pro — Hazard Perception & Reflex Arena'}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">CMVR Rule 11 Knowledge Benchmark</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isHindi ? 'सड़क खतरा पहचान एवं त्वरित ब्रेक परीक्षण' : '60-Second Hazard Perception & Stopping Reflex Screener'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {isHindi
                ? '50 किमी/घंटा पर वास्तविक भारतीय सड़क स्थितियों (पैदल यात्री, अप्रत्याशित मवेशी, तेज ब्रेक) में अपनी प्रतिक्रिया समय (मिलीसेकंड) और कुल रुकने की दूरी मापें।'
                : 'Experience 5 statutory Indian road situations at 50 km/h. Measure exact millisecond driver reaction latency (tr) and physical stopping distance before appearing for your official test.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label="Toggle Sound"
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Arena Viewport */}
      {gameState !== 'SUMMARY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Simulation Canvas & Cockpit */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-2xl">
              {/* Canvas Viewport */}
              <canvas
                ref={canvasRef}
                width={800}
                height={460}
                className="w-full h-auto block select-none"
              />

              {/* HUD Speedometer Overlay Top Left */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-mono shadow-lg">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-base text-cyan-300">{currentScenario.speedKmh}</span>
                <span className="text-[10px] text-slate-400">KM/H</span>
              </div>

              {/* Scenario Stage Counter Top Right */}
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                <span className="text-slate-400">{isHindi ? 'परिदृश्य' : 'Scenario'}</span>
                <span className="text-amber-400 font-bold">{currentScenarioIndex + 1} / {HAZARD_SCENARIOS.length}</span>
              </div>

              {/* In-Game State Overlay Banners */}
              <AnimatePresence>
                {gameState === 'IDLE' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white"
                  >
                    <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4">
                      <Car className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      {isHindi ? 'परीक्षण शुरू करने के लिए तैयार हैं?' : 'Ready to Test Your Road Reflexes?'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                      {isHindi
                        ? 'सड़क पर अप्रत्याशित खतरा दिखाई देते ही तुरंत नीचे दिए गए लाल ब्रेक बटन या कीबोर्ड पर "SPACEBAR" दबाएं।'
                        : 'Watch the road ahead. The moment you perceive an unavoidable hazard, hit SPACEBAR or tap the red Emergency Brake button immediately.'}
                    </p>
                    <button
                      onClick={() => startScenario(0)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{isHindi ? 'एरेना शुरू करें' : 'Launch Reflex Arena'}</span>
                    </button>
                  </motion.div>
                )}

                {gameState === 'HAZARD_ACTIVE' && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-red-600 text-white font-extrabold text-sm sm:text-base shadow-2xl flex items-center gap-2 animate-bounce uppercase tracking-wider"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>{isHindi ? 'ब्रेक दबाएं! (SPACEBAR)' : 'BRAKE NOW! (SPACEBAR)'}</span>
                  </motion.div>
                )}

                {gameState === 'BRAKED' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white"
                  >
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-3 ${
                      isCollision 
                        ? 'bg-red-500/20 border border-red-500/40 text-red-400' 
                        : reactionTimeMs === -1 
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' 
                          : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    }`}>
                      {isCollision ? (
                        <XCircle className="w-8 h-8" />
                      ) : reactionTimeMs === -1 ? (
                        <AlertTriangle className="w-8 h-8" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8" />
                      )}
                    </div>

                    <h4 className="text-xl sm:text-2xl font-bold">
                      {reactionTimeMs === -1 
                        ? (isHindi ? 'गलत चेतावनी (जल्दबाजी में ब्रेक)' : 'False Alarm (Premature Brake)')
                        : isCollision 
                          ? (isHindi ? 'टक्कर! बहुत धीमी प्रतिक्रिया' : 'COLLISION! Excessive Reaction Latency')
                          : (isHindi ? 'उत्कृष्ट! सुरक्षित दूरी पर गाड़ी रुकी' : 'SAFE STOP! Optimum Reflex Distance')}
                    </h4>

                    {reactionTimeMs > 0 && (
                      <div className="grid grid-cols-2 gap-4 my-4 max-w-sm w-full">
                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                          <div className="text-[11px] text-slate-400 uppercase font-medium">Reaction Time</div>
                          <div className={`text-xl font-mono font-bold ${reactionTimeMs <= currentScenario.safeMaxMs ? 'text-emerald-400' : 'text-red-400'}`}>
                            {reactionTimeMs} <span className="text-xs font-normal">ms</span>
                          </div>
                          <div className="text-[10px] text-slate-500">Benchmark: &lt;{currentScenario.safeMaxMs}ms</div>
                        </div>

                        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                          <div className="text-[11px] text-slate-400 uppercase font-medium">Total Stop Dist</div>
                          <div className="text-xl font-mono font-bold text-cyan-300">
                            {stoppingDistanceMeters} <span className="text-xs font-normal">m</span>
                          </div>
                          <div className="text-[10px] text-slate-500">at {currentScenario.speedKmh} km/h</div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 max-w-md mb-6 italic">
                      &quot;{isHindi ? currentScenario.statutoryTipEn : currentScenario.statutoryTipEn}&quot;
                    </p>

                    <button
                      onClick={handleNextScenario}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <span>{currentScenarioIndex < HAZARD_SCENARIOS.length - 1 ? (isHindi ? 'अगला परिदृश्य देखें' : 'Next Scenario') : (isHindi ? 'परिणाम विश्लेषण देखें' : 'View Full Evaluation Report')}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Giant Emergency Brake Button for Touch / Mobile */}
            <div className="w-full">
              <button
                onClick={triggerBrake}
                disabled={gameState !== 'RUNNING' && gameState !== 'HAZARD_ACTIVE'}
                className={`w-full py-5 rounded-2xl font-black text-lg tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 ${
                  gameState === 'HAZARD_ACTIVE'
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white animate-pulse shadow-red-600/50 scale-[1.02]'
                    : gameState === 'RUNNING'
                      ? 'bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white shadow-red-900/40'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
                <span>{isHindi ? 'आपातकालीन ब्रेक (SPACEBAR)' : 'EMERGENCY BRAKE (SPACEBAR)'}</span>
              </button>
            </div>
          </div>

          {/* Right Col: Scenario Details & Statutory Physics Guide */}
          <div className="flex flex-col space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[11px] uppercase tracking-wider">
                {currentScenario.category}
              </span>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                {isHindi ? currentScenario.titleHi : currentScenario.titleEn}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                {isHindi ? currentScenario.descriptionHi : currentScenario.descriptionEn}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Cruising Velocity:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currentScenario.speedKmh} km/h ({(currentScenario.speedKmh / 3.6).toFixed(1)} m/s)</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Safe Reaction Threshold:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; {currentScenario.safeMaxMs} ms</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Statutory Compliance:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">CMVR Rule 11 Syllabus</span>
                </div>
              </div>
            </div>

            {/* Stopping Distance Formula Box (Academic Wow Factor) */}
            <div className="p-5 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                <Info className="w-4 h-4" />
                <span>{isHindi ? 'भौतिकी रुकने की दूरी सूत्र:' : 'Classical Stopping Dynamics Formula:'}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl font-mono text-[11px] text-center border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300">
                d_total = (v · t_r) + [v² / (2 · μ · g)]
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-[11px] leading-relaxed">
                {isHindi
                  ? 'जहां v = गति, t_r = मानव प्रतिक्रिया समय, μ = डामर घर्षण (0.7), और g = गुरुत्वाकर्षण त्वरण (9.81 m/s²)।'
                  : 'Reaction distance scales linearly with reflex delay; braking distance scales quadratically with speed.'}
              </p>
            </div>

            {/* Quick Test Progress */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Completed Scenarios:</span>
                <span className="font-bold text-blue-600">{results.length} of {HAZARD_SCENARIOS.length}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(results.length / HAZARD_SCENARIOS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Final Summary & MoRTH Certificate Card */}
      {gameState === 'SUMMARY' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col space-y-6"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            {/* Top Certificate Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>MoRTH / CMVR Rule 11 Driver Assessment</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Driver Hazard Perception & Reflex Evaluation Report
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate: <span className="font-bold text-slate-900 dark:text-white">{citizenName}</span> • Evaluated on 5 Statutory Road Scenarios
                </p>
              </div>

              {/* Huge Grade Badge */}
              <div className="flex items-center gap-3">
                <div className={`w-20 h-20 rounded-3xl bg-${gradeBadgeColor}-500/10 border-2 border-${gradeBadgeColor}-500 flex flex-col items-center justify-center`}>
                  <span className={`text-3xl font-black text-${gradeBadgeColor}-600 dark:text-${gradeBadgeColor}-400`}>{gradeLetter}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">GRADE</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{gradeTitle}</div>
                  <div className="text-xs text-slate-500">
                    Avg Reaction: <span className="font-bold text-blue-600">{avgReactionMs} ms</span> • Safe Stops: <span className="font-bold text-emerald-600">{totalPassed}/{HAZARD_SCENARIOS.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trial Breakdown Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Scenario</th>
                    <th className="py-3 px-4">Speed</th>
                    <th className="py-3 px-4">Reaction Time (ms)</th>
                    <th className="py-3 px-4">Stopping Distance</th>
                    <th className="py-3 px-4">Outcome</th>
                    <th className="py-3 px-4 rounded-r-xl">Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((res, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {isHindi ? res.scenario.titleHi : res.scenario.titleEn}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {res.scenario.speedKmh} km/h
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {res.reactionMs > 0 ? `${res.reactionMs} ms` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
                        {res.stoppingDistanceM > 0 ? `${res.stoppingDistanceM} m` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        {res.status === 'SAFE_STOP' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Safe Stop
                          </span>
                        ) : res.status === 'COLLISION' ? (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Collision
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> Premature
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 italic">
                        {res.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Enter candidate name for certificate"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium w-full sm:w-64"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isHindi ? 'पुनः प्रयास करें' : 'Retake Arena'}</span>
                </button>

                <button
                  onClick={() => alert(`Certificate generated for ${citizenName} with Grade ${gradeLetter}! Avg reflex latency: ${avgReactionMs}ms.`)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>{isHindi ? 'रिफ्लेक्स प्रमाणपत्र डाउनलोड करें' : 'Export Reflex Certificate'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
