// Official Indian RTO (Sarathi / Parivahan / CMVR 1989) Document Upload Standards
// Standardizes file formats, file size limits (KB), and pixel dimensions for non-DigiLocker manual uploads

export const RTO_DOC_STANDARDS = {
  photo: {
    id: 'photo',
    labelEn: 'Passport Size Photograph',
    labelHi: 'पासपोर्ट आकार की तस्वीर',
    formats: ['JPEG', 'JPG', 'PNG'],
    minSizeKB: 10,
    maxSizeKB: 50,
    targetWidth: 350,
    targetHeight: 450,
    aspectRatio: '7:9',
    description: '35mm x 45mm frontal photo with plain light background, ears visible, neutral expression.',
    ruleCitation: 'CMVR 1989 Rule 14(1) & Form 2 Specification'
  },
  signature: {
    id: 'signature',
    labelEn: 'Applicant Signature',
    labelHi: 'आवेदक के हस्ताक्षर',
    formats: ['JPEG', 'JPG', 'PNG'],
    minSizeKB: 10,
    maxSizeKB: 20,
    targetWidth: 400,
    targetHeight: 120,
    aspectRatio: '10:3',
    description: 'Black/blue ink signature on clear white unruled paper without overlapping text.',
    ruleCitation: 'CMVR 1989 Rule 14(1)'
  },
  age_proof: {
    id: 'age_proof',
    labelEn: 'Proof of Age (DOB)',
    labelHi: 'आयु प्रमाण पत्र',
    formats: ['JPEG', 'JPG', 'PNG', 'PDF'],
    minSizeKB: 20,
    maxSizeKB: 200,
    targetWidth: 1200,
    targetHeight: 850,
    aspectRatio: 'A4 / Standard',
    description: 'Class 10 CBSE/State Board Certificate, Municipal Birth Certificate, or Passport.',
    ruleCitation: 'Section 4 MV Act & Rule 4 CMVR'
  },
  address_proof: {
    id: 'address_proof',
    labelEn: 'Proof of Current Address',
    labelHi: 'वर्तमान निवास का प्रमाण',
    formats: ['JPEG', 'JPG', 'PNG', 'PDF'],
    minSizeKB: 20,
    maxSizeKB: 200,
    targetWidth: 1200,
    targetHeight: 850,
    aspectRatio: 'A4 / Standard',
    description: 'Voter ID Card, Electricity Bill (<2 months old), Registered Rent Agreement, or LIC Policy.',
    ruleCitation: 'Rule 4 Central Motor Vehicles Rules 1989'
  },
  medical_form1: {
    id: 'medical_form1',
    labelEn: 'Form 1 Medical Self-Declaration',
    labelHi: 'फॉर्म 1 चिकित्सा स्व-घोषणा',
    formats: ['JPEG', 'JPG', 'PNG', 'PDF'],
    minSizeKB: 20,
    maxSizeKB: 200,
    targetWidth: 1200,
    targetHeight: 850,
    aspectRatio: 'A4 / Standard',
    description: 'Form 1 physical fitness declaration signed by applicant or Form 1-A medical doctor certificate.',
    ruleCitation: 'CMVR Rule 5(2) Physical Fitness Mandate'
  }
}

/**
 * Automatically resizes and compresses an image or photo to meet Indian RTO specifications
 * @param {File|Blob|string} imageSource - File object, Blob, or Data URL
 * @param {string} docType - Key from RTO_DOC_STANDARDS ('photo', 'signature', 'age_proof', etc.)
 * @returns {Promise<{ dataUrl: string, width: number, height: number, sizeKB: number, isAutoResized: boolean }>}
 */
export function resizeAndCompressImage(imageSource, docType = 'age_proof') {
  return new Promise((resolve, reject) => {
    const standard = RTO_DOC_STANDARDS[docType] || RTO_DOC_STANDARDS.age_proof
    const maxWidth = standard.targetWidth
    const maxHeight = standard.targetHeight
    const maxSizeBytes = standard.maxSizeKB * 1024

    const img = new Image()

    // Handle string (dataURL), File, or Blob
    if (typeof imageSource === 'string') {
      img.src = imageSource
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource)
    } else {
      return reject(new Error('Invalid image source'))
    }

    img.onload = () => {
      let width = img.width
      let height = img.height
      let needResize = false

      // Calculate constrained dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
        needResize = true
      }

      // If passport photo, enforce standard 350x450 ratio
      if (docType === 'photo') {
        width = 350
        height = 450
        needResize = true
      } else if (docType === 'signature') {
        width = 400
        height = 120
        needResize = true
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      // Fill white background for transparent PNGs
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Iteratively adjust JPEG compression quality to fit within RTO max size
      let quality = 0.88
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      let approxBytes = Math.round((dataUrl.length * 3) / 4)

      while (approxBytes > maxSizeBytes && quality > 0.15) {
        quality -= 0.08
        dataUrl = canvas.toDataURL('image/jpeg', quality)
        approxBytes = Math.round((dataUrl.length * 3) / 4)
        needResize = true
      }

      const sizeKB = Math.round(approxBytes / 1024)

      resolve({
        dataUrl,
        width,
        height,
        sizeKB,
        isAutoResized: needResize || sizeKB <= standard.maxSizeKB,
        standard
      })
    }

    img.onerror = (err) => {
      reject(new Error('Failed to load and process image: ' + err))
    }
  })
}

/**
 * Validates a file against RTO guidelines
 * @param {File} file
 * @param {string} docType
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateRtoFile(file, docType = 'age_proof') {
  const standard = RTO_DOC_STANDARDS[docType] || RTO_DOC_STANDARDS.age_proof
  const errors = []
  const warnings = []

  const fileSizeKB = Math.round(file.size / 1024)
  const ext = file.name.split('.').pop().toUpperCase()

  if (!standard.formats.includes(ext) && !file.type.includes('image') && !file.type.includes('pdf')) {
    errors.push(`Invalid file format .${ext}. Only ${standard.formats.join(', ')} permitted by Sarathi RTO guidelines.`)
  }

  if (fileSizeKB > standard.maxSizeKB) {
    warnings.push(`File size (${fileSizeKB} KB) exceeds official RTO limit of ${standard.maxSizeKB} KB. System will automatically resize and compress this file.`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fileSizeKB,
    standard
  }
}
