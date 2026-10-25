import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

// State Transport Department mappings
const STATE_MAPPINGS = {
  DL: { name: 'Government of NCT of Delhi', dept: 'Transport Department, Govt. of NCT of Delhi' },
  KA: { name: 'Government of Karnataka', dept: 'Transport Department, Government of Karnataka' },
  MH: { name: 'Government of Maharashtra', dept: 'Motor Vehicles Department, Government of Maharashtra' },
  WB: { name: 'Government of West Bengal', dept: 'Transport Department, Government of West Bengal' },
  UP: { name: 'Government of Uttar Pradesh', dept: 'Transport Department, Government of Uttar Pradesh' },
  TN: { name: 'Government of Tamil Nadu', dept: 'Transport Department, Government of Tamil Nadu' },
  GJ: { name: 'Government of Gujarat', dept: 'Ports and Transport Department, Govt. of Gujarat' },
  RJ: { name: 'Government of Rajasthan', dept: 'Transport Department, Government of Rajasthan' },
  TS: { name: 'Government of Telangana', dept: 'Transport Department, Government of Telangana' },
  AP: { name: 'Government of Andhra Pradesh', dept: 'Transport Department, Govt. of Andhra Pradesh' },
  KL: { name: 'Government of Kerala', dept: 'Motor Vehicles Department, Government of Kerala' },
  MP: { name: 'Government of Madhya Pradesh', dept: 'Transport Department, Government of Madhya Pradesh' },
  HR: { name: 'Government of Haryana', dept: 'Transport Department, Government of Haryana' },
  PB: { name: 'Government of Punjab', dept: 'Transport Department, Government of Punjab' },
  BR: { name: 'Government of Bihar', dept: 'Transport Department, Government of Bihar' },
  OD: { name: 'Government of Odisha', dept: 'Commerce & Transport Department, Govt. of Odisha' },
}

const VEHICLE_DESCRIPTIONS = {
  MCWG: 'Motor Cycle with Gear (Capacity > 50cc)',
  LMV: 'Light Motor Vehicle (Private Motor Car / Van)',
  MCWOG: 'Motor Cycle without Gear (Scooter / EV)',
  TRANS: 'Medium / Heavy Commercial Transport Vehicle',
  '3W-NT': 'Three Wheeler (Non-Transport Auto)',
  'E-RICK': 'E-Rickshaw / E-Cart (CMVR Rule 2(u))'
}

/**
 * Helper to format date into DD-MMM-YYYY
 */
function formatDate(dateInput) {
  if (!dateInput) return '21-OCT-2026'
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return String(dateInput).toUpperCase()
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const day = String(d.getDate()).padStart(2, '0')
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return String(dateInput).toUpperCase()
  }
}

/**
 * Compute 6-month expiry date per MV Act 1988 Section 14
 */
function calculateExpiry(issueDateInput) {
  try {
    const d = new Date(issueDateInput || '2026-10-21')
    if (isNaN(d.getTime())) return '20-APR-2027'
    d.setMonth(d.getMonth() + 6)
    d.setDate(d.getDate() - 1)
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const day = String(d.getDate()).padStart(2, '0')
    const month = months[d.getMonth()]
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return '20-APR-2027'
  }
}

/**
 * Generate citizen avatar/photo data URL for PDF
 */
function generateCitizenPhotoDataUrl(_name) {
  if (typeof document === 'undefined') return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 140
    canvas.height = 175
    const ctx = canvas.getContext('2d')

    // Background gradient (official pale blue-grey photo studio backdrop)
    const grad = ctx.createLinearGradient(0, 0, 0, 175)
    grad.addColorStop(0, '#CBD5E1')
    grad.addColorStop(1, '#94A3B8')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 140, 175)

    // Draw citizen head silhouette
    ctx.fillStyle = '#334155'
    ctx.beginPath()
    ctx.arc(70, 60, 32, 0, Math.PI * 2)
    ctx.fill()

    // Draw citizen shoulders
    ctx.beginPath()
    ctx.ellipse(70, 150, 52, 45, 0, 0, Math.PI, true)
    ctx.fill()

    // Collar / shirt
    ctx.fillStyle = '#1E293B'
    ctx.beginPath()
    ctx.moveTo(50, 150)
    ctx.lineTo(70, 130)
    ctx.lineTo(90, 150)
    ctx.fill()

    // Official RTO DigiLocker Stamp across bottom of photo
    ctx.fillStyle = 'rgba(16, 185, 129, 0.92)' // emerald-500
    ctx.fillRect(0, 142, 140, 33)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('VERIFIED RTO', 70, 154)
    ctx.font = '7px sans-serif'
    ctx.fillText('DigiLocker e-KYC', 70, 166)

    // Outer border
    ctx.strokeStyle = '#0F172A'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, 140, 175)

    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

/**
 * Generate official RTO Licensing Authority digital signature seal
 */
function generateRtoSealDataUrl(rtoCode) {
  if (typeof document === 'undefined') return null
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 180
    canvas.height = 180
    const ctx = canvas.getContext('2d')
    const center = 90

    // Outer circle
    ctx.strokeStyle = '#1E3A8A' // deep blue
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(center, center, 82, 0, Math.PI * 2)
    ctx.stroke()

    // Inner circle
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(center, center, 74, 0, Math.PI * 2)
    ctx.stroke()

    // Circular text
    ctx.font = 'bold 8.5px sans-serif'
    ctx.fillStyle = '#1E3A8A'
    ctx.textAlign = 'center'
    ctx.fillText('• GOVERNMENT OF INDIA •', center, 32)
    ctx.fillText(`LICENSING AUTHORITY ${rtoCode || 'RTO'}`, center, 158)

    // Center badge
    ctx.beginPath()
    ctx.arc(center, center, 44, 0, Math.PI * 2)
    ctx.strokeStyle = '#D97706' // amber/gold
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = '#1E3A8A'
    ctx.font = 'bold 11px sans-serif'
    ctx.fillText('DIGITALLY', center, 82)
    ctx.fillText('SIGNED', center, 96)
    ctx.font = '7.5px sans-serif'
    ctx.fillStyle = '#059669' // emerald
    ctx.fillText('★ APPROVED ★', center, 110)

    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

/**
 * Main function: generate and download authentic Form 3 Learner's Licence PDF
 * Compliant with CMVR 1989 Rules 3(a) & 13 and Motor Vehicles Act 1988 Section 14
 */
export async function generateForm3Pdf(appData) {
  if (!appData) {
    throw new Error('Application data is required to generate Form 3.')
  }

  // Parse fields with reliable defaults
  const appNo = (appData.appNo || appData.application_number || 'KA-2026-55319').toUpperCase()
  const applicantName = (appData.name || appData.applicant_name || 'RAHUL SHARMA (SAMPLE APPLICANT)').toUpperCase()
  const fatherOrSpouse = (appData.fatherOrSpouse || appData.father_or_spouse || 'GUARDIAN SAMPLE').toUpperCase()
  const dobRaw = appData.dob || '2004-05-14'
  const dobFormatted = formatDate(dobRaw)
  
  // Calculate age
  let age = '22'
  try {
    const birthYear = new Date(dobRaw).getFullYear()
    if (!isNaN(birthYear)) {
      age = String(new Date().getFullYear() - birthYear)
    }
  } catch {
    age = '22'
  }

  const bloodGroup = appData.bloodGroup || appData.blood_group || 'A+ Positive'
  const address = appData.address || 'Demo Plot 402, Sector 14, Mall Road Zone, North Delhi - 110001'
  const phone = appData.phone || appData.mobile || '+91 90000 00001'
  
  // Extract state & RTO code
  const rtoStr = appData.rto || appData.rtoCode || appData.rto_code || 'KA-01'
  const stateCode = (appNo.split('-')[0] || rtoStr.split('-')[0] || 'KA').toUpperCase()
  const stateInfo = STATE_MAPPINGS[stateCode] || { 
    name: 'State Transport Department', 
    dept: 'Motor Vehicles Department' 
  }
  const rtoCode = appData.rtoCode || appData.rto_code || (rtoStr.includes('(') ? rtoStr.split('(')[0].trim() : rtoStr)

  // LL Number
  const llNumber = (appData.llNumber || appData.ll_number || `${stateCode}-01-LL-2026-0099418`).toUpperCase()

  // Dates
  const issueDateRaw = appData.approvalDate || appData.approval_date || appData.submissionDate || appData.submission_date || '2026-10-21'
  const issueDateFormatted = formatDate(issueDateRaw)
  const expiryDateFormatted = calculateExpiry(issueDateRaw)

  // Vehicle classes
  let rawClasses = appData.vehicle_classes || appData.category || ['MCWG']
  if (typeof rawClasses === 'string') {
    if (rawClasses.includes('MCWG') && rawClasses.includes('LMV')) {
      rawClasses = ['MCWG', 'LMV']
    } else if (rawClasses.includes('MCWG')) {
      rawClasses = ['MCWG']
    } else if (rawClasses.includes('LMV')) {
      rawClasses = ['LMV']
    } else if (rawClasses.includes('TRANS')) {
      rawClasses = ['TRANS']
    } else {
      rawClasses = [rawClasses.split(' ')[0]]
    }
  }

  // Create jsPDF Document: A4 Portrait (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const pageWidth = 210
  const pageHeight = 297

  // 1. Dual Outer Borders (Navy & Gold)
  doc.setDrawColor(15, 37, 55) // Deep Navy (#0F2537)
  doc.setLineWidth(0.9)
  doc.rect(7, 7, pageWidth - 14, pageHeight - 14)

  doc.setDrawColor(217, 119, 6) // Amber/Gold (#D97706)
  doc.setLineWidth(0.4)
  doc.rect(8.5, 8.5, pageWidth - 17, pageHeight - 17)

  // Subtle Watermark in background
  doc.setTextColor(241, 245, 249) // Slate-100 (subtle)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, 130, { align: 'center', angle: 45 })
  doc.text('FORM 3 • SARATHI PARIVAHAN', pageWidth / 2, 155, { align: 'center', angle: 45 })

  // 2. Tricolor Decorative Band at Top
  doc.setFillColor(255, 153, 51) // Saffron
  doc.rect(8.5, 8.5, (pageWidth - 17) / 3, 2.5, 'F')
  doc.setFillColor(255, 255, 255) // White
  doc.rect(8.5 + (pageWidth - 17) / 3, 8.5, (pageWidth - 17) / 3, 2.5, 'F')
  doc.setFillColor(19, 136, 8) // India Green
  doc.rect(8.5 + ((pageWidth - 17) / 3) * 2, 8.5, (pageWidth - 17) / 3, 2.5, 'F')

  // 3. Header Section (Government of India & State)
  let y = 17
  doc.setTextColor(15, 37, 55) // Navy
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, y, { align: 'center' })

  y += 5
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85) // Slate-700
  doc.text('MINISTRY OF ROAD TRANSPORT & HIGHWAYS', pageWidth / 2, y, { align: 'center' })

  y += 4.5
  doc.setFontSize(9)
  doc.setTextColor(30, 58, 138) // Blue-900
  doc.text(stateInfo.dept.toUpperCase(), pageWidth / 2, y, { align: 'center' })

  // Header separator line
  y += 3.5
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.line(14, y, pageWidth - 14, y)

  // FORM 3 Banner
  y += 5
  doc.setFillColor(15, 37, 55)
  doc.roundedRect(pageWidth / 2 - 45, y - 4, 90, 8, 1.5, 1.5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('FORM 3', pageWidth / 2, y + 1.8, { align: 'center' })

  y += 8
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'italic')
  doc.text('[See Rules 3(a) and 13 of the Central Motor Vehicles Rules, 1989]', pageWidth / 2, y, { align: 'center' })

  y += 4.5
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text("LEARNER'S LICENCE", pageWidth / 2, y, { align: 'center' })

  y += 3.8
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('(Valid throughout India per Section 14 of the Motor Vehicles Act, 1988)', pageWidth / 2, y, { align: 'center' })

  // 4. Primary Licence Credentials Box (Monospace & High Visibility)
  y += 5
  doc.setFillColor(248, 250, 252) // Slate-50
  doc.setDrawColor(30, 58, 138) // Blue-800
  doc.setLineWidth(0.5)
  doc.roundedRect(12, y, pageWidth - 24, 21, 2, 2, 'FD')

  // Left col: LL Number & App Number
  doc.setTextColor(71, 85, 105)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text("Learner's Licence No:", 16, y + 5)
  doc.setFont('courier', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(15, 37, 55)
  doc.text(llNumber, 16, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text(`Application No: ${appNo}`, 16, y + 15)
  doc.text(`Issuing RTO: ${rtoStr}`, 16, y + 18.5)

  // Right col: Validity Dates (6 Months Validity)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text('Date of Issue:', 110, y + 5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(15, 37, 55)
  doc.text(issueDateFormatted, 110, y + 9.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text('Valid Until (Expiry):', 155, y + 5)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(185, 28, 28) // Red-700
  doc.text(expiryDateFormatted, 155, y + 9.5)

  // Status & Verification Pill
  doc.setFillColor(220, 252, 231) // Emerald-100
  doc.setDrawColor(16, 185, 129) // Emerald-500
  doc.setLineWidth(0.3)
  doc.roundedRect(110, y + 12.5, 84, 6, 1, 1, 'FD')
  doc.setTextColor(4, 120, 87) // Emerald-700
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text('STATUS: ACTIVE / ISSUED • VERIFICATION: PAPERLESS e-KYC (DIGILOCKER)', 152, y + 16.5, { align: 'center' })

  // 5. Applicant Particulars & Bio-data
  y += 24
  doc.setDrawColor(226, 232, 240)
  doc.setFillColor(255, 255, 255)
  doc.setLineWidth(0.4)
  doc.roundedRect(12, y, 136, 68, 2, 2, 'FD')

  // Particulars Header
  doc.setFillColor(241, 245, 249)
  doc.rect(12, y, 136, 6, 'F')
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('APPLICANT PARTICULARS (CMVR RULE 13 & FORM 3)', 15, y + 4.2)

  let py = y + 11
  const labelX = 16
  const valueX = 64

  const renderField = (label, value) => {
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(label, labelX, py)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.text(`:  ${value}`, valueX, py)
    py += 5.6
  }

  renderField('1. Full Name of Holder', applicantName)
  renderField("2. Son / Daughter / Wife of", fatherOrSpouse)
  renderField('3. Date of Birth', `${dobFormatted}  (Age: ${age} Years)`)
  renderField('4. Gender / Sex', 'MALE')
  renderField('5. Blood Group & Rh Factor', bloodGroup)
  renderField('6. Aadhaar / Mobile Ref', `${phone} (UIDAI Verified)`)

  // Address (wrapped)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('7. Permanent Address', labelX, py)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  const addressLines = doc.splitTextToSize(`:  ${address}`, 84)
  doc.text(addressLines, valueX, py)

  // 6. Citizen Photo Box & Signature Box (Right Side)
  const photoX = 153
  const photoY = y
  const photoW = 43
  const photoH = 50

  // Draw Photo Frame
  doc.setDrawColor(15, 23, 42)
  doc.setLineWidth(0.5)
  doc.rect(photoX, photoY, photoW, photoH)

  // Generate and insert Photo
  const photoDataUrl = generateCitizenPhotoDataUrl(applicantName)
  if (photoDataUrl) {
    try {
      doc.addImage(photoDataUrl, 'PNG', photoX + 1, photoY + 1, photoW - 2, photoH - 2)
    } catch {
      doc.setFontSize(7)
      doc.text('Verified Citizen Photo', photoX + 5, photoY + 25)
    }
  }

  // Signature Box directly below Photo
  const sigY = photoY + photoH + 2
  const sigH = 16
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.4)
  doc.rect(photoX, sigY, photoW, sigH, 'FD')

  doc.setTextColor(30, 41, 59)
  doc.setFont('courier', 'bold')
  doc.setFontSize(7)
  doc.text(applicantName, photoX + photoW / 2, sigY + 6, { align: 'center' })
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(5.5)
  doc.text('Digitally e-Signed via Aadhaar OTP', photoX + photoW / 2, sigY + 10, { align: 'center' })
  doc.text('Specimen Signature of Holder', photoX + photoW / 2, sigY + 13.5, { align: 'center' })

  // 7. Class of Vehicles (COV) Authorized to Drive Matrix
  y = y + 72
  doc.setFillColor(15, 37, 55)
  doc.roundedRect(12, y, pageWidth - 24, 6.5, 1, 1, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('CLASS OF VEHICLES AUTHORISED TO DRIVE AS LEARNER (RULE 3 CMVR 1989)', 16, y + 4.5)

  y += 6.5
  // Table Header
  doc.setFillColor(241, 245, 249)
  doc.rect(12, y, pageWidth - 24, 6, 'F')
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.rect(12, y, pageWidth - 24, 6, 'S')

  doc.setTextColor(51, 65, 85)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.text('S.No.', 15, y + 4)
  doc.text('Vehicle Class (COV)', 28, y + 4)
  doc.text('Description of Vehicle Class', 68, y + 4)
  doc.text('Effective From', 145, y + 4)
  doc.text('Authorising RTO', 172, y + 4)

  // Render Rows
  y += 6
  rawClasses.forEach((cov, idx) => {
    const cleanCov = String(cov).trim().toUpperCase()
    const desc = VEHICLE_DESCRIPTIONS[cleanCov] || `Motor Vehicle (${cleanCov})`

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252)
    doc.rect(12, y, pageWidth - 24, 7, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(12, y, pageWidth - 24, 7, 'S')

    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.text(String(idx + 1), 17, y + 4.8)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 58, 138)
    doc.text(cleanCov, 28, y + 4.8)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)
    doc.text(desc, 68, y + 4.8)

    doc.text(issueDateFormatted, 145, y + 4.8)
    doc.setFont('helvetica', 'bold')
    doc.text(rtoCode, 172, y + 4.8)

    y += 7
  })

  // 8. Official Security Verification & QR Code + RTO Seal Section
  y += 4
  const sealBoxY = y
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.4)
  doc.roundedRect(12, sealBoxY, pageWidth - 24, 38, 2, 2, 'FD')

  // Generate QR Code containing digital verification payload
  const qrPayload = JSON.stringify({
    reg: 'MoRTH/SARATHI/FORM3',
    ll_no: llNumber,
    app_no: appNo,
    holder: applicantName,
    cov: rawClasses.join(','),
    issued: issueDateFormatted,
    valid_till: expiryDateFormatted,
    rto: rtoCode,
    authority: 'Officer R. Sharma, Licensing Authority',
    security_hash: `SHA256-${llNumber.replace(/[^A-Z0-9]/g, '')}-7F89`,
    verify_url: `https://hackcache26-mark-iii-mparivahan.vercel.app/track?app=${encodeURIComponent(appNo)}`
  })

  try {
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 200,
      color: {
        dark: '#0F2537',
        light: '#FFFFFF'
      }
    })
    doc.addImage(qrDataUrl, 'PNG', 16, sealBoxY + 3.5, 31, 31)
  } catch (qrErr) {
    console.error('Failed to generate QR code:', qrErr)
  }

  // QR explanation
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('NATIONAL DIGITAL VERIFICATION QR', 51, sealBoxY + 7)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.text('Scan using mParivahan or camera to verify authenticity', 51, sealBoxY + 11)
  doc.text('Direct Registry URL: https://parivahan.gov.in/sarathi', 51, sealBoxY + 14.5)
  doc.text(`Digital Token Hash: SHA256-${llNumber.slice(0, 12)}-CERT`, 51, sealBoxY + 18)

  // Official RTO Seal in center
  const rtoSealDataUrl = generateRtoSealDataUrl(rtoCode)
  if (rtoSealDataUrl) {
    try {
      doc.addImage(rtoSealDataUrl, 'PNG', 106, sealBoxY + 3.5, 31, 31)
    } catch {
      // fallback
    }
  }

  // Licensing Authority Digital Signature Box (Right)
  doc.setTextColor(15, 37, 55)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('DIGITALLY SIGNED BY:', 143, sealBoxY + 7)

  doc.setFontSize(8)
  doc.setTextColor(30, 58, 138)
  doc.text('RAJESHWAR SHARMA, KAS', 143, sealBoxY + 11.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(71, 85, 105)
  doc.text('Licensing Authority (Level 3 Clearance)', 143, sealBoxY + 15.5)
  doc.text(`${rtoStr}`, 143, sealBoxY + 19)
  doc.text(`Signed: ${issueDateFormatted} 16:25:00 IST`, 143, sealBoxY + 22.5)

  doc.setTextColor(5, 150, 105) // emerald-600
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text('✓ NIC TRUST CHAIN CERTIFIED', 143, sealBoxY + 27)

  // 9. Statutory Conditions Box (CMVR 1989 Rule 3)
  y = sealBoxY + 41
  doc.setFillColor(254, 242, 242) // Red-50 (Statutory warning background)
  doc.setDrawColor(248, 113, 113) // Red-400
  doc.setLineWidth(0.4)
  doc.roundedRect(12, y, pageWidth - 24, 27, 2, 2, 'FD')

  doc.setTextColor(153, 27, 27) // Red-800
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('MANDATORY STATUTORY CONDITIONS FOR HOLDER (RULE 3 CMVR 1989):', 16, y + 4.5)

  doc.setTextColor(69, 10, 10)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  const conditions = [
    '1. The holder shall not drive unless accompanied by an instructor holding an effective permanent driving licence to drive the vehicle and who is sitting in such a position to control or stop the vehicle (Rule 3(b)).',
    "2. The holder shall display on the front and rear of the vehicle the letter 'L' in RED on a WHITE background with dimensions not less than 18cm x 18cm (Rule 3(c)).",
    '3. No person other than the licensed instructor shall be carried as a pillion passenger on a two-wheeler (Rule 3(d)).',
    '4. This licence is valid throughout India for 6 MONTHS from issue date. The holder is eligible to apply for a Permanent Driving Licence (Form 4) after 30 days from the date of issue (Rule 15 CMVR 1989).'
  ]

  let condY = y + 8.5
  conditions.forEach((cond) => {
    const wrapped = doc.splitTextToSize(cond, pageWidth - 32)
    doc.text(wrapped, 16, condY)
    condY += (wrapped.length * 3.3)
  })

  // 10. Official Footer Note
  const footerY = pageHeight - 11
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.text(
    'This is a digitally issued statutory document authenticated via Sarathi National Portal (CMVR 1989 Rule 13). Physical signature not required under Section 5 IT Act 2000.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  )
  doc.text(
    `National Portal Reference: MoRTH-SARATHI-${appNo}-${Date.now().toString().slice(-6)} • Page 1 of 1`,
    pageWidth / 2,
    footerY + 3.2,
    { align: 'center' }
  )

  // Save the document with clean filename
  const sanitizedFilename = `Form_3_Learners_Licence_${llNumber.replace(/[^A-Za-z0-9_-]/g, '_')}.pdf`
  doc.save(sanitizedFilename)

  return {
    success: true,
    filename: sanitizedFilename,
    llNumber,
    appNo
  }
}
