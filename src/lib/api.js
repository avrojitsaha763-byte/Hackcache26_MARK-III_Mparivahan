// Centralized API Client for Licence Saathi (EasyDL)
// Connects React 19 Frontend with FastAPI Backend (port 8000) & Dual-Mode Fallback

import { 
  getApplications, 
  getApplication, 
  addApplication as localAddApp, 
  updateApplicationStatus as localUpdateStatus 
} from './applicationsStore'
import { 
  loginOfficer as localLoginOfficer, 
  getRegisteredOfficers 
} from './adminAuth'
import { mockQuestions } from '../data/questions'
import { trafficSigns } from '../data/signs'

const API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:8000')

async function safeFetch(endpoint, options = {}) {
  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 4500)
    const url = API_BASE ? `${API_BASE}${endpoint}` : endpoint
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    })
    clearTimeout(id)
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`)
    }
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error('Non-JSON response')
    }
    return await res.json()
  } catch {
    // Graceful fallback to local store/memory if backend is offline or static
    return null
  }
}

export const api = {
  // Check statutory eligibility & CMVR Rule 32 dynamic fees
  async checkEligibility({ age, dob, vehicle_class, has_aadhaar = true }) {
    const res = await safeFetch('/api/check-eligibility', {
      method: 'POST',
      body: JSON.stringify({ age: Number(age), dob, vehicle_class, has_aadhaar })
    })
    if (res && res.status === 'success') {
      return res
    }
    // Client-side statutory fallback
    const numAge = Number(age)
    let eligible = false
    let minAge = 18
    let feeTotal = 200
    if (vehicle_class === 'gearless-50cc') {
      minAge = 16
      eligible = numAge >= 16
      feeTotal = 200
    } else if (vehicle_class === 'commercial-transport') {
      minAge = 20
      eligible = numAge >= 20
      feeTotal = 300
    } else if (vehicle_class === 'combo-bike-car') {
      minAge = 18
      eligible = numAge >= 18
      feeTotal = 350
    } else {
      eligible = numAge >= 18
      feeTotal = 200
    }
    return {
      status: 'success',
      age: numAge,
      vehicle_class,
      eligible,
      minimum_age_required: minAge,
      fee_details: {
        total: feeTotal,
        rule_citation: 'Central Motor Vehicles Rules 1989, Rule 32'
      }
    }
  },

  // Submit Form 2 application
  async submitApplication(appData) {
    // 1. Always record in local store for immediate client UI update
    const localCreated = localAddApp(appData)

    // 2. Dispatch to FastAPI backend & Supabase
    const backendRes = await safeFetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        applicant_name: appData.name,
        dob: appData.dob || '2004-06-15',
        rto_code: appData.rtoCode || 'DL-01',
        vehicle_classes: Array.isArray(appData.vehicle_classes) ? appData.vehicle_classes : [appData.category || 'LMV'],
        mobile: appData.phone,
        phone: appData.phone,
        verification_mode: appData.uploadMode || 'digilocker',
        fee_amount: appData.feePaid,
        documents: appData.documents
      })
    })

    if (backendRes && backendRes.data) {
      return backendRes.data
    }
    return localCreated
  },

  // Track application status & Rule 11(3) urgency
  async trackApplication(appNo) {
    const cleanNo = (appNo || '').trim().toUpperCase()
    const backendRes = await safeFetch(`/api/track?app_no=${encodeURIComponent(cleanNo)}`)
    if (backendRes && backendRes.success) {
      return backendRes
    }

    // Fallback to local store
    const local = getApplication(cleanNo)
    if (local) {
      return {
        success: true,
        data: {
          ...local,
          application_number: local.appNo,
          applicant_name: local.name,
          rule11_days_remaining: 5,
          rule11_status: 'normal'
        },
        timeline: local.timeline || []
      }
    }
    return { success: false, message: 'Application not found' }
  },

  // Fetch STALL questions
  async getQuestions(category = null, limit = 15) {
    const url = `/api/questions?limit=${limit}${category ? `&category=${encodeURIComponent(category)}` : ''}`
    const backendRes = await safeFetch(url)
    if (backendRes && backendRes.data && backendRes.data.length > 0) {
      return backendRes.data
    }
    // Fallback to local questions
    return mockQuestions.slice(0, limit)
  },

  // Submit and grade STALL quiz
  async submitQuiz(answers) {
    const backendRes = await safeFetch('/api/quiz/submit', {
      method: 'POST',
      body: JSON.stringify({ answers })
    })
    if (backendRes && backendRes.status === 'success') {
      return backendRes
    }
    // Fallback scoring
    let score = 0
    const total = Object.keys(answers).length
    Object.entries(answers).forEach(([qId, chosenIdx]) => {
      const q = mockQuestions.find(mq => String(mq.id) === String(qId))
      if (q && q.correctIndex === chosenIdx) {
        score += 1
      }
    })
    const passMark = Math.max(1, Math.floor(total * 0.6))
    return {
      status: 'success',
      score,
      total,
      percentage: total > 0 ? Math.round((score / total) * 100) : 0,
      passed: score >= passMark,
      pass_mark: passMark
    }
  },

  // Fetch traffic signs
  async getSigns(category = null) {
    const url = `/api/signs${category ? `?category=${encodeURIComponent(category)}` : ''}`
    const backendRes = await safeFetch(url)
    if (backendRes && backendRes.data && backendRes.data.length > 0) {
      return backendRes.data
    }
    return trafficSigns
  },

  // Officer Scrutiny: List applications
  async getAdminApplications(rtoCode = null, status = null) {
    const params = new URLSearchParams()
    if (rtoCode && rtoCode !== 'ALL') params.set('rto_code', rtoCode)
    if (status && status !== 'ALL') params.set('status', status)
    
    const backendRes = await safeFetch(`/api/admin/applications?${params.toString()}`)
    if (backendRes && backendRes.data && backendRes.data.length > 0) {
      return backendRes.data
    }
    // Fallback to local store
    return getApplications()
  },

  // Officer Scrutiny: Approve / request correction
  async updateApplicationStatus(appNo, newStatus, remarks = '', officerName = 'RTO Officer') {
    // 1. Update local store
    const localUpdated = localUpdateStatus(appNo, newStatus, remarks, officerName)

    // 2. Sync to backend
    await safeFetch(`/api/applications/${encodeURIComponent(appNo)}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: newStatus,
        remarks: remarks || '',
        officer_name: officerName
      })
    })

    return localUpdated
  },

  // ADTT Test Track: Book slot
  async bookSlot(slotData) {
    const backendRes = await safeFetch('/api/slots/book', {
      method: 'POST',
      body: JSON.stringify(slotData)
    })
    if (backendRes && backendRes.data) {
      return backendRes.data
    }
    // Fallback slip
    return {
      slot_id: `SLOT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      ...slotData,
      status: 'Confirmed'
    }
  },

  // Officer Authentication
  async loginOfficer(identifier, password) {
    const backendRes = await safeFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    })
    if (backendRes && backendRes.data) {
      return { success: true, officer: backendRes.data }
    }
    // Fallback to registered officers store
    return localLoginOfficer(identifier, password)
  },

  async getOfficers() {
    const backendRes = await safeFetch('/api/admin/officers')
    if (backendRes && backendRes.data) {
      return backendRes.data
    }
    return getRegisteredOfficers()
  },

  // Saathi AI Citizen Chat
  async sendChatMessage(query, lang = 'en') {
    const backendRes = await safeFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ query, lang })
    })
    if (backendRes && backendRes.reply) {
      return backendRes.reply
    }
    return null
  },

  // DigiLocker / API Setu Authentication & Verification
  async requestDigilockerOtp(phone) {
    const res = await safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ loginType: 'request_otp', phone })
    })
    if (res && res.success) return res
    if (phone && phone.length >= 10) {
      return { success: true, message: "OTP sent to registered mobile.", txnId: `TXN-${Date.now()}` }
    }
    return { error: "Invalid phone" }
  },

  async verifyDigilockerOtp(otp) {
    const res = await safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ loginType: 'verify_otp', otp })
    })
    if (res && res.success) return res
    if (otp === "123456") {
      return { success: true, token: "mock_oauth_token_8892" }
    }
    return { error: "Invalid OTP" }
  },

  async loginDigilockerPassword(username, password) {
    const res = await safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ loginType: 'password', username, password })
    })
    if (res && res.success) return res
    if (username === "demo_user" && password === "123456") {
      return { success: true, token: "mock_oauth_token_8892" }
    }
    return { error: "Invalid credentials" }
  },

  async fetchDigilockerDocuments(vehicleClass = 'motorcycle-gear', token = 'mock_oauth_token_8892') {
    const res = await safeFetch('/api/documents', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ vehicleClass })
    })
    if (res && res.success) return res

    // Client fallback replicating the same verification logic
    if (token !== "mock_oauth_token_8892") {
      return { error: "Unauthorized" }
    }
    const fetchedDocs = {
      applicant_name: "Ramesh Kumar",
      dob: "2005-04-14",
      address: "123, Vasant Vihar, New Delhi, 110057",
      documents_found: ["Class X Marksheet", "Voter ID Card"],
      kyc_status: "VERIFIED"
    }
    const today = new Date()
    const birthDate = new Date(fetchedDocs.dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    const isEligible = vehicleClass === 'gearless-50cc' ? age >= 16 : age >= 18
    const rtoMessage = vehicleClass === 'gearless-50cc'
      ? (isEligible ? "Eligible for MC50CC." : "Must be 16+ for gearless vehicles.")
      : (isEligible ? "Eligible for standard Learner's Licence." : "Must be 18+ for standard vehicles.")

    return {
      success: true,
      data: fetchedDocs,
      verification: {
        calculated_age: age,
        is_rto_eligible: isEligible,
        remarks: rtoMessage
      }
    }
  }
}
