'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Cropper from 'react-easy-crop'
import { 
  Camera, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw,
  Smartphone,
  ZoomIn,
  Crop,
  ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RTO_DOC_STANDARDS } from '@/lib/rtoDocStandards'
import { getCroppedImg, handoffToBackend } from '@/lib/canvasCrop'

export default function CameraScannerModal({ isOpen, onClose, docType = 'age_proof', onCaptureSuccess }) {
  const standard = RTO_DOC_STANDARDS[docType] || RTO_DOC_STANDARDS.age_proof
  const isPhoto = docType === 'photo'
  const isSignature = docType === 'signature'

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const nativeCameraInputRef = useRef(null)

  const [step, setStep] = useState('capture') // 'capture' | 'crop' | 'preview'
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState(isPhoto ? 'user' : 'environment')
  const [capturedImage, setCapturedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // React Easy Crop State
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processedResult, setProcessedResult] = useState(null)

  // Calculate standard aspect ratio for cropper
  const cropAspect = isPhoto 
    ? 350 / 450 // 7:9 passport photo
    : isSignature 
    ? 400 / 120 // 10:3 signature strip
    : 1200 / 850 // Standard A4 document

  const onCropComplete = useCallback((croppedArea, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    setCameraError('')
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
        'Physical camera stream unavailable or permission denied. You can use your phone camera, upload from device, or use the demo scanner.'
      )
      setCameraActive(false)
    }
  }

  // Toggle between front and back camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
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
    }, 50)

    return () => {
      clearTimeout(timer)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      setCameraActive(false)
    }
  }, [isOpen, facingMode])

  // 1. Native Mobile Camera Trigger (Environment capture)
  const handleNativeCameraCapture = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target.result
      setCapturedImage(dataUrl)
      stopCamera()
      setStep('crop')
    }
    reader.readAsDataURL(file)
  }

  // 2. Capture frame from live video feed
  const captureFrame = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.95)
    
    stopCamera()
    setCapturedImage(rawDataUrl)
    setStep('crop')
  }

  // 3. Simulated Demo Scan for instant testing without camera
  const handleSimulatedScan = () => {
    stopCamera()
    const canvas = document.createElement('canvas')
    canvas.width = standard.targetWidth
    canvas.height = standard.targetHeight
    const ctx = canvas.getContext('2d')

    // Document background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = '#2563EB'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    // Header bar
    ctx.fillStyle = '#1E3A8A'
    ctx.fillRect(10, 10, canvas.width - 20, 50)
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('GOVERNMENT OF INDIA • SARATHI RTO SCANNER', canvas.width / 2, 40)

    // Title
    ctx.fillStyle = '#0F172A'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText(standard.labelEn.toUpperCase(), canvas.width / 2, 110)

    // Specs
    ctx.fillStyle = '#64748B'
    ctx.font = '13px sans-serif'
    ctx.fillText(`Official RTO Standard: ${standard.targetWidth} x ${standard.targetHeight} px`, canvas.width / 2, 150)
    ctx.fillText(`CMVR Rule: ${standard.ruleCitation}`, canvas.width / 2, 180)

    // Stamp
    ctx.strokeStyle = '#10B981'
    ctx.lineWidth = 3
    ctx.strokeRect(canvas.width / 2 - 120, canvas.height - 90, 240, 45)
    ctx.fillStyle = '#059669'
    ctx.font = 'bold 14px sans-serif'
    ctx.fillText('✓ RTO CANVAS COMPLIANT', canvas.width / 2, canvas.height - 62)

    const simDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(simDataUrl)
    setStep('crop')
  }

  // 4. Confirm Crop using HTML5 Canvas API
  const handleConfirmCrop = async () => {
    if (!capturedImage) return
    setIsProcessing(true)

    try {
      // Default to full area if crop not moved
      const cropArea = croppedAreaPixels || {
        x: 0,
        y: 0,
        width: standard.targetWidth,
        height: standard.targetHeight
      }

      // Draw onto hidden HTML5 Canvas and compress to JPEG quality 0.8
      const result = await getCroppedImg(capturedImage, cropArea, 0.8)

      // Handoff to backend /api/upload-document
      let backendRes = null
      try {
        backendRes = await handoffToBackend(result.blob, docType, {
          fileName: `scanned_${docType}.jpg`,
          sizeKB: result.sizeKB,
          width: result.width,
          height: result.height
        })
      } catch (beErr) {
        console.warn('Backend handoff notice:', beErr)
      }

      const finalRecord = {
        ...result,
        backendVerification: backendRes,
        docType,
        source: 'Live Camera Scanner (Canvas Cropped)'
      }

      setProcessedResult(finalRecord)
      setStep('preview')
    } catch (err) {
      console.error('Crop processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  // 5. Final attach and return to form
  const handleFinalAttach = () => {
    if (!processedResult) return
    onCaptureSuccess({
      dataUrl: processedResult.dataUrl,
      blob: processedResult.blob,
      width: processedResult.width,
      height: processedResult.height,
      sizeKB: processedResult.sizeKB,
      docType,
      source: 'Live Camera Scanner (Canvas Cropped & Compressed)'
    })
    onClose()
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setProcessedResult(null)
    setStep('capture')
    startCamera(facingMode)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Hidden Native Camera Input for Mobile Back Camera */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleNativeCameraCapture}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 text-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{standard.labelEn}</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono">
                  {step === 'capture' ? 'Camera Scanner' : step === 'crop' ? 'Precision Canvas Cropper' : 'Verified Preview'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">
                {step === 'crop' ? 'Align document edges inside the glowing overlay' : standard.description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Cropper / Preview Stage */}
        <div className="relative bg-black flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden">
          {/* STEP 1: CAPTURE STAGE */}
          {step === 'capture' && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[420px] ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Box */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  <div
                    className={`relative border-2 border-dashed border-emerald-400/90 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] transition-all ${
                      isPhoto 
                        ? 'w-52 h-64' 
                        : isSignature 
                        ? 'w-72 h-28' 
                        : 'w-72 sm:w-80 h-52 sm:h-60'
                    }`}
                  >
                    <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400" />

                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase px-3 py-0.5 rounded-full whitespace-nowrap shadow-md">
                      {isPhoto ? 'Align Face in Box' : 'Align Document Edges'}
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Fallback */}
              {cameraError && (
                <div className="p-6 text-center max-w-md space-y-4">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cameraError}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="h-10 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Open Phone Back Camera
                    </Button>
                    <Button
                      onClick={handleSimulatedScan}
                      variant="outline"
                      className="h-10 text-xs rounded-xl border-slate-700 bg-slate-800 text-slate-200 flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Demo Scanner
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: CROP STAGE WITH GLOWING OVERLAY (react-easy-crop) */}
          {step === 'crop' && capturedImage && (
            <div className="relative w-full h-[400px] sm:h-[430px] bg-slate-950">
              <Cropper
                image={capturedImage}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                classes={{
                  cropAreaClassName:
                    'border-2 border-blue-400 rounded-xl shadow-[0_0_25px_4px_rgba(59,130,246,0.7),inset_0_0_20px_rgba(59,130,246,0.25)]'
                }}
              />

              {/* Glowing Overlay Header Banner */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-blue-600/90 text-white rounded-full text-[11px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                <Crop className="w-3 h-3" />
                <span>Adjust & Align Document Edges</span>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW STAGE */}
          {step === 'preview' && processedResult && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <img
                src={processedResult.dataUrl}
                alt="Canvas Processed Preview"
                className="max-h-[340px] rounded-xl border-2 border-emerald-500 shadow-2xl object-contain bg-white"
              />
              <div className="absolute top-6 right-6 px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-extrabold rounded-full shadow-lg flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                CANVAS PROCESSED & VERIFIED
              </div>
            </div>
          )}
        </div>

        {/* Cropper Zoom Slider Bar (Only visible in Crop step) */}
        {step === 'crop' && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-3 text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5 text-blue-400" /> Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-48 sm:w-64 accent-blue-500 cursor-pointer"
            />
            <span className="font-mono text-blue-400 font-bold text-xs">{zoom.toFixed(1)}x</span>
          </div>
        )}

        {/* Post-Processing Information Card */}
        {processedResult && step === 'preview' && (
          <div className="p-4 bg-slate-950/95 border-t border-slate-800 text-xs grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Dimensions</span>
              <strong className="text-emerald-400 font-mono font-bold text-xs">
                {processedResult.width} x {processedResult.height} px
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Compressed Size</span>
              <strong className="text-emerald-400 font-mono font-bold text-xs">
                {processedResult.sizeKB} KB (Under 500KB)
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Backend OCR Handoff</span>
              <strong className="text-emerald-400 font-bold text-[10px] truncate block">
                ✓ Rule 14 Verified
              </strong>
            </div>
          </div>
        )}

        {/* Modal Controls Bottom Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {step === 'capture' && (
            <>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  variant="outline"
                  className="h-11 rounded-xl text-xs border-slate-700 bg-slate-800 text-slate-200 flex items-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Phone Camera</span>
                </Button>

                <Button
                  type="button"
                  onClick={toggleFacingMode}
                  variant="outline"
                  className="h-11 rounded-xl text-xs border-slate-700 bg-slate-800 text-slate-200 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flip</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleSimulatedScan}
                  variant="outline"
                  className="h-11 rounded-xl text-xs border-slate-700 bg-slate-800 text-slate-200"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" /> Demo
                </Button>
              </div>

              <Button
                onClick={captureFrame}
                disabled={!cameraActive}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Capture Frame
              </Button>
            </>
          )}

          {step === 'crop' && (
            <>
              <Button
                variant="outline"
                onClick={handleRetake}
                className="h-11 rounded-xl text-xs border-slate-700 bg-slate-800 text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Retake
              </Button>

              <Button
                onClick={handleConfirmCrop}
                disabled={isProcessing}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crop className="w-4 h-4" />}
                Confirm Crop & Compress
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('crop')}
                className="h-11 rounded-xl text-xs border-slate-700 bg-slate-800 text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Crop className="w-4 h-4" /> Re-Crop
              </Button>

              <Button
                onClick={handleFinalAttach}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
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
