'use client'
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RTO_DOC_STANDARDS, resizeAndCompressImage } from '@/lib/rtoDocStandards'

export default function CameraScannerModal({ isOpen, onClose, docType = 'age_proof', onCaptureSuccess }) {
  const standard = RTO_DOC_STANDARDS[docType] || RTO_DOC_STANDARDS.age_proof
  const isPhoto = docType === 'photo'
  const isSignature = docType === 'signature'

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState(isPhoto ? 'user' : 'environment')
  const [capturedImage, setCapturedImage] = useState(null)
  const [processedResult, setProcessedResult] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    setCameraError('')
    setCapturedImage(null)
    setProcessedResult(null)

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
      }
    } catch (err) {
      console.warn('Camera stream error:', err)
      setCameraError(
        'Unable to access physical camera or permission denied. You can use the Simulated Test Scanner or upload from local disk.'
      )
      setCameraActive(false)
    }
  }

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      startCamera(facingMode)
    }, 0)

    return () => {
      clearTimeout(timer)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      setCameraActive(false)
    }
  }, [isOpen, facingMode])

  // Capture frame from video feed
  const captureFrame = async () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')

    // If front camera, flip horizontally for natural mirror image
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95)
    setCapturedImage(rawDataUrl)

    // Stop live stream to freeze
    stopCamera()

    // Automatically optimize and resize according to Indian RTO standards
    await processCapturedImage(rawDataUrl)
  }

  // Process and resize using RTO parameters
  const processCapturedImage = async (imageSource) => {
    setIsProcessing(true)
    try {
      const result = await resizeAndCompressImage(imageSource, docType)
      setProcessedResult(result)
    } catch (err) {
      console.error('Resize error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulated Test Scanner for testing without a physical webcam
  const handleSimulatedScan = async () => {
    setIsProcessing(true)
    setCameraError('')
    const canvas = document.createElement('canvas')
    canvas.width = standard.targetWidth
    canvas.height = standard.targetHeight
    const ctx = canvas.getContext('2d')

    // Generate realistic official-looking scanned document graphic
    ctx.fillStyle = '#F8FAFC'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Decorative document border
    ctx.strokeStyle = '#2563EB'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    // Header badge
    ctx.fillStyle = '#1E3A8A'
    ctx.fillRect(10, 10, canvas.width - 20, 50)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('GOVERNMENT OF INDIA • SARATHI RTO SCAN', canvas.width / 2, 40)

    // Body content
    ctx.fillStyle = '#334155'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText(standard.labelEn.toUpperCase(), canvas.width / 2, 120)

    ctx.font = '14px sans-serif'
    ctx.fillStyle = '#64748B'
    ctx.fillText(`Camera Live Captured & Auto-Resized per ${standard.ruleCitation}`, canvas.width / 2, 160)
    ctx.fillText(`Dimensions: ${standard.targetWidth} x ${standard.targetHeight} px • Max Cap: ${standard.maxSizeKB} KB`, canvas.width / 2, 190)

    // Stamp / Watermark
    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 3
    ctx.strokeRect(canvas.width / 2 - 120, canvas.height - 110, 240, 50)
    ctx.fillStyle = '#059669'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText('✓ RTO AUTO-COMPLIANT', canvas.width / 2, canvas.height - 80)

    const simDataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(simDataUrl)
    await processCapturedImage(simDataUrl)
  }

  const handleConfirm = () => {
    if (!processedResult) return
    onCaptureSuccess({
      dataUrl: processedResult.dataUrl,
      width: processedResult.width,
      height: processedResult.height,
      sizeKB: processedResult.sizeKB,
      docType: docType,
      source: 'Camera Live Scan (Auto-Resized)'
    })
    onClose()
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setProcessedResult(null)
    startCamera(facingMode)
  }

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(nextMode)
    startCamera(nextMode)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 text-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{standard.labelEn}</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono">
                  Live Scanner
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {standard.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder or Preview Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[320px] sm:min-h-[400px] overflow-hidden">
          {!capturedImage ? (
            <>
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[420px] ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Scanning Overlay Viewfinder */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  {/* Aspect Ratio Guide Box */}
                  <div 
                    className={`relative border-2 border-dashed border-emerald-400/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all ${
                      isPhoto 
                        ? 'w-52 h-64' 
                        : isSignature 
                        ? 'w-72 h-28' 
                        : 'w-72 sm:w-80 h-52 sm:h-60'
                    }`}
                  >
                    {/* Viewfinder Corner Accents */}
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400" />

                    {/* Instruction Tag */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500/90 text-slate-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-full whitespace-nowrap shadow-md">
                      {isPhoto ? 'Align Face in Box (35mm x 45mm)' : 'Align Document Edges in Frame'}
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Error / Fallback State */}
              {cameraError && (
                <div className="p-6 text-center max-w-md space-y-4">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cameraError}
                  </p>
                  <Button
                    onClick={handleSimulatedScan}
                    className="h-10 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2 mx-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Use Simulated Official Scanner
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Captured Frame Preview & Auto-Resize Results */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <img
                src={processedResult?.dataUrl || capturedImage}
                alt="Captured document"
                className={`max-h-[340px] rounded-xl border-2 border-emerald-500/80 shadow-2xl object-contain bg-white`}
              />

              {/* Real-time RTO Compliance Seal */}
              {processedResult && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-extrabold rounded-full shadow-lg flex items-center gap-1.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                  AUTO-RESIZED (RTO COMPLIANT)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post-Capture Information Card */}
        {processedResult && (
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Dimensions</span>
              <strong className="text-emerald-400 font-mono font-bold text-xs">
                {processedResult.width} x {processedResult.height} px
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">File Size</span>
              <strong className="text-emerald-400 font-mono font-bold text-xs">
                {processedResult.sizeKB} KB (Max {standard.maxSizeKB} KB)
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Statutory Rule</span>
              <strong className="text-blue-300 font-bold text-[10px] truncate block">
                {standard.ruleCitation}
              </strong>
            </div>
          </div>
        )}

        {/* Modal Controls Bottom Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {!capturedImage ? (
            <>
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Flip Camera</span>
              </button>

              <div className="flex gap-2">
                <Button
                  onClick={handleSimulatedScan}
                  variant="outline"
                  className="h-11 rounded-xl text-xs border-slate-700 bg-slate-800 text-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Demo Scan
                </Button>

                <Button
                  onClick={captureFrame}
                  disabled={!cameraActive}
                  className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                >
                  <Camera className="w-4 h-4" />
                  Capture & Auto-Resize
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleRetake}
                className="h-11 rounded-xl text-xs border-slate-700 bg-slate-800 text-slate-200 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Retake
              </Button>

              <Button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Check className="w-4 h-4" /> Confirm & Attach Document
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
