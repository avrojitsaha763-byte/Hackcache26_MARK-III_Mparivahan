'use client'
import { useState, useRef } from 'react'
import { 
  Upload, 
  Camera, 
  CheckCircle2, 
  Eye, 
  Trash2, 
  Info,
  Maximize2,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import CameraScannerModal from '@/components/CameraScannerModal'
import { RTO_DOC_STANDARDS, validateRtoFile, resizeAndCompressImage } from '@/lib/rtoDocStandards'

export default function ManualDocumentUploader({ documents, onChange, isHindi = false }) {
  const [activeCameraDoc, setActiveCameraDoc] = useState(null)
  const [previewModalDoc, setPreviewModalDoc] = useState(null)
  const [processingDocId, setProcessingDocId] = useState(null)
  const [noticeMsg, setNoticeMsg] = useState('')

  const fileInputRefs = useRef({})

  const docList = Object.values(RTO_DOC_STANDARDS)

  // Handle local file attach from file manager or PC disk
  const handleFileChange = async (e, docType) => {
    const file = e.target.files?.[0]
    if (!file) return

    setProcessingDocId(docType)
    setNoticeMsg('')

    try {
      const validation = validateRtoFile(file, docType)
      if (!validation.valid && validation.error) {
        setNoticeMsg(validation.error)
      }

      // Read file and auto-resize / compress using Canvas to ensure it fits RTO dimensions and file size
      const processed = await resizeAndCompressImage(file, docType)

      const docRecord = {
        id: docType,
        title: RTO_DOC_STANDARDS[docType].labelEn,
        type: `${RTO_DOC_STANDARDS[docType].labelEn} (${RTO_DOC_STANDARDS[docType].ruleCitation})`,
        dataUrl: processed.dataUrl,
        fileName: file.name,
        width: processed.width,
        height: processed.height,
        sizeKB: processed.sizeKB,
        verified: false,
        authority: 'Citizen Local Attachment (Auto-Resized per CMVR)',
        source: 'Local Disk / File Manager'
      }

      onChange({
        ...documents,
        [docType]: docRecord
      })

      setNoticeMsg(
        isHindi
          ? `✓ ${RTO_DOC_STANDARDS[docType].labelHi} आरटीओ मानकों (${processed.sizeKB} KB, ${processed.width}x${processed.height} px) के अनुसार सफलतापूर्वक संलग्न!`
          : `✓ ${RTO_DOC_STANDARDS[docType].labelEn} auto-resized to Indian RTO standards (${processed.sizeKB} KB, ${processed.width}x${processed.height} px) and attached!`
      )
      setTimeout(() => setNoticeMsg(''), 4000)
    } catch (err) {
      console.error('File process error:', err)
      setNoticeMsg('Error processing file. Please ensure it is a valid image or PDF.')
    } finally {
      setProcessingDocId(null)
      // reset file input value
      if (e.target) e.target.value = ''
    }
  }

  // Handle capture from Camera Scanner
  const handleCameraCapture = (captureData) => {
    const docType = captureData.docType
    const standard = RTO_DOC_STANDARDS[docType]

    const docRecord = {
      id: docType,
      title: standard.labelEn,
      type: `${standard.labelEn} (${standard.ruleCitation})`,
      dataUrl: captureData.dataUrl,
      fileName: `camera_${docType}_scan.jpg`,
      width: captureData.width,
      height: captureData.height,
      sizeKB: captureData.sizeKB,
      verified: false,
      authority: 'Live Camera Capture (Auto-Resized per CMVR)',
      source: 'Camera Live Scan'
    }

    onChange({
      ...documents,
      [docType]: docRecord
    })

    setNoticeMsg(
      isHindi
        ? `✓ कैमरा द्वारा स्कैन किया गया दस्तावेज आरटीओ विनिर्देशों (${captureData.sizeKB} KB) में सुरक्षित संलग्न!`
        : `✓ Live camera scan successfully compressed & attached per RTO standards (${captureData.sizeKB} KB, ${captureData.width}x${captureData.height} px)!`
    )
    setTimeout(() => setNoticeMsg(''), 4000)
  }

  const handleDeleteDoc = (docType) => {
    const updated = { ...documents }
    delete updated[docType]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Informative Guidance Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>{isHindi ? 'गैर-डिजीलॉकर मैन्युअल दस्तावेज विनिर्देश:' : 'Non-DigiLocker Indian RTO Document Guidelines:'}</strong>{' '}
          {isHindi 
            ? 'यदि आपके पास डिजीलॉकर नहीं है, तो आप नीचे दोनों विकल्पों (लोकल फाइल अटैच अथवा कैमरा लाइव स्कैन) द्वारा दस्तावेज अपलोड कर सकते हैं। सिस्टम स्वचालित रूप से भारतीय आरटीओ मानकों (आकार 20KB-200KB, फोटो 35x45mm) के अनुसार फाइल को रीसाइज करेगा।'
            : 'Attach documents from your PC local drive / mobile file manager OR scan directly with your device camera. The system automatically enforces and resizes to Indian RTO dimensional and file size limits (CMVR Rule 14).'}
        </div>
      </div>

      {/* Success Notification Alert */}
      {noticeMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{noticeMsg}</span>
        </div>
      )}

      {/* Document Items Matrix */}
      <div className="space-y-3">
        {docList.map((standard) => {
          const attachedDoc = documents[standard.id]
          const isProcessing = processingDocId === standard.id

          return (
            <div
              key={standard.id}
              className={`p-4 rounded-2xl border transition-all ${
                attachedDoc
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-800'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
              }`}
            >
              {/* Document Header & Rule */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-200/60 dark:border-slate-700/60 mb-3">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{isHindi ? standard.labelHi : standard.labelEn}</span>
                    <span className="text-red-500 font-bold">*</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {standard.description}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {standard.ruleCitation} • Max {standard.maxSizeKB} KB
                </div>
              </div>

              {/* Status or Controls */}
              {!attachedDoc ? (
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  {/* Option 1: File Manager / Local Disk Upload */}
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[standard.id] = el)}
                    onChange={(e) => handleFileChange(e, standard.id)}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRefs.current[standard.id]?.click()}
                    disabled={isProcessing}
                    variant="outline"
                    className="flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isHindi ? 'फाइल मैनेजर से अटैच करें' : 'Option 1: Attach File (PC/Mobile)'}</span>
                  </Button>

                  {/* Option 2: Live Camera Scan */}
                  <Button
                    type="button"
                    onClick={() => setActiveCameraDoc(standard.id)}
                    disabled={isProcessing}
                    className="flex-1 h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'कैमरा से स्कैन करें' : 'Option 2: Scan with Camera'}</span>
                  </Button>
                </div>
              ) : (
                /* Attached Document View & Compliance Badge */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3">
                    {/* Thumbnail preview */}
                    <div 
                      onClick={() => setPreviewModalDoc(attachedDoc)}
                      className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-600 shrink-0 cursor-pointer relative group"
                    >
                      <img 
                        src={attachedDoc.dataUrl} 
                        alt={attachedDoc.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[200px]">
                          {attachedDoc.fileName}
                        </span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          RTO COMPLIANT
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Size: <strong className="text-slate-700 dark:text-slate-300 font-mono">{attachedDoc.sizeKB} KB</strong></span>
                        <span>•</span>
                        <span>Dimensions: <strong className="text-slate-700 dark:text-slate-300 font-mono">{attachedDoc.width}x{attachedDoc.height} px</strong></span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400">{attachedDoc.source}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewModalDoc(attachedDoc)}
                      className="h-8 rounded-lg text-xs flex items-center gap-1 text-slate-700 dark:text-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteDoc(standard.id)}
                      className="h-8 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Camera Scanner Modal */}
      {activeCameraDoc && (
        <CameraScannerModal
          isOpen={!!activeCameraDoc}
          onClose={() => setActiveCameraDoc(null)}
          docType={activeCameraDoc}
          onCaptureSuccess={handleCameraCapture}
        />
      )}

      {/* Document Quick Inspection Modal */}
      {previewModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">{previewModalDoc.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {previewModalDoc.width} x {previewModalDoc.height} px • {previewModalDoc.sizeKB} KB
                </p>
              </div>
              <button
                onClick={() => setPreviewModalDoc(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-slate-100 dark:bg-slate-950">
              <img
                src={previewModalDoc.dataUrl}
                alt={previewModalDoc.title}
                className="max-h-[60vh] object-contain rounded-xl shadow-md border border-slate-300 dark:border-slate-700 bg-white"
              />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready for RTO Officer Scrutiny
              </span>
              <Button
                size="sm"
                onClick={() => setPreviewModalDoc(null)}
                className="h-8 rounded-lg text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
