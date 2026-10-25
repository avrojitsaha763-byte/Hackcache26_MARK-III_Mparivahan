// Official RTO Admin Scrutiny Desk Authentication & Access Control
// DEMO EVALUATION FIXTURES: These identities are isolated mock accounts provided for hackathon judging & evaluation.

const SESSION_KEY = 'rto_official_session_v1'
const OFFICERS_KEY = 'rto_registered_officers_v1'

export const DEMO_EVALUATION_OFFICERS = [
  {
    officerId: "RTO-OFFICER-DL01",
    email: "rajeshwar.sharma@parivahan.gov.in",
    name: "Rajeshwar Sharma",
    designation: "Senior Motor Vehicle Inspector (MVI)",
    rto: "DL-01 (Mall Road / North Delhi)",
    rtoCode: "DL-01",
    badgeNumber: "MVI-DL-8819",
    joinedDate: "2018-04-12",
    clearanceLevel: "Level 3 (Form 3 Issuing Authority)",
    isDemoEvaluator: true
  },
  {
    officerId: "RTO-OFFICER-MH02",
    email: "sanjay.kulkarni@parivahan.gov.in",
    name: "Sanjay Kulkarni",
    designation: "RTO Scrutiny Superintendent",
    rto: "MH-02 (Andheri / Mumbai West)",
    rtoCode: "MH-02",
    badgeNumber: "MVI-MH-4421",
    joinedDate: "2019-09-01",
    clearanceLevel: "Level 3 (Form 3 Issuing Authority)",
    isDemoEvaluator: true
  },
  {
    officerId: "RTO-OFFICER-KA01",
    email: "priya.venkatesh@parivahan.gov.in",
    name: "Priya Venkatesh",
    designation: "Assistant Transport Commissioner",
    rto: "KA-01 (Koramangala / Bengaluru Central)",
    rtoCode: "KA-01",
    badgeNumber: "ATC-KA-1109",
    joinedDate: "2016-01-15",
    clearanceLevel: "Level 4 (Supervisory & Final Appeal Authority)",
    isDemoEvaluator: true
  }
]

export const DEFAULT_OFFICERS = DEMO_EVALUATION_OFFICERS

export function getRegisteredOfficers() {
  if (typeof window === 'undefined') return DEFAULT_OFFICERS
  try {
    const raw = localStorage.getItem(OFFICERS_KEY)
    if (!raw) {
      localStorage.setItem(OFFICERS_KEY, JSON.stringify(DEFAULT_OFFICERS))
      return DEFAULT_OFFICERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_OFFICERS
  } catch (e) {
    console.error("Error reading registered officers:", e)
    return DEFAULT_OFFICERS
  }
}

export function saveRegisteredOfficers(officers) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(OFFICERS_KEY, JSON.stringify(officers))
  } catch (e) {
    console.error("Error saving registered officers:", e)
  }
}

export function getOfficerSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isOfficerAuthenticated() {
  const session = getOfficerSession()
  return !!(session && session.officerId && session.role === 'RTO_OFFICER')
}

// Server-side asynchronous officer authentication
export async function loginOfficer(identifier, password) {
  if (!identifier || !password) {
    return { success: false, message: "Please enter Officer ID/Email and Secure Password." }
  }

  try {
    const apiBase = (
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
      (typeof window !== 'undefined' && window.__API_BASE__ ? window.__API_BASE__ : '')
    ).replace(/\/+$/, '')

    const url = apiBase ? `${apiBase}/api/admin/login` : '/api/admin/login'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ identifier, password })
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      return { 
        success: false, 
        message: data.message || data.error || "Authentication failed. Invalid officer credentials." 
      }
    }

    const officerData = data.data || data.officer || {}
    const sessionData = {
      officerId: officerData.officerId || identifier,
      name: officerData.name || 'RTO Officer',
      email: officerData.email || identifier,
      designation: officerData.designation || 'Motor Vehicle Inspector',
      rto: officerData.rto || 'Transport Department',
      rtoCode: officerData.rtoCode || 'DL-01',
      badgeNumber: officerData.badgeNumber || 'MVI-OFFICIAL',
      clearanceLevel: officerData.clearanceLevel || 'Level 3 (Form 3 Issuing Authority)',
      role: 'RTO_OFFICER',
      token: data.token,
      loginTimestamp: new Date().toISOString()
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    }

    return { success: true, officer: sessionData }
  } catch (err) {
    console.error("Server-side officer authentication error:", err)
    return { 
      success: false, 
      message: "Network error connecting to official scrutiny authentication service." 
    }
  }
}

export function registerOfficer(data) {
  if (!data.name || !data.officerId || !data.email || !data.password) {
    return { success: false, message: "Please fill all required official officer details." }
  }

  const officers = getRegisteredOfficers()
  const exists = officers.find(o => 
    o.officerId.toLowerCase() === data.officerId.trim().toLowerCase() ||
    o.email.toLowerCase() === data.email.trim().toLowerCase()
  )

  if (exists) {
    return { success: false, message: "An officer with this Employee ID or Email is already registered." }
  }

  const newOfficer = {
    officerId: data.officerId.trim(),
    name: data.name.trim(),
    email: data.email.trim(),
    designation: data.designation || "Motor Vehicle Inspector (MVI)",
    rto: data.rto || "DL-01 (Mall Road / North Delhi)",
    rtoCode: data.rtoCode || "DL-01",
    badgeNumber: data.badgeNumber || `MVI-${Math.floor(1000 + Math.random() * 9000)}`,
    password: data.password,
    joinedDate: new Date().toISOString().split('T')[0],
    clearanceLevel: "Level 3 (Form 3 Issuing Authority)"
  }

  const updatedOfficers = [...officers, newOfficer]
  saveRegisteredOfficers(updatedOfficers)

  // Automatically log in newly registered officer
  const sessionData = {
    officerId: newOfficer.officerId,
    name: newOfficer.name,
    email: newOfficer.email,
    designation: newOfficer.designation,
    rto: newOfficer.rto,
    rtoCode: newOfficer.rtoCode,
    badgeNumber: newOfficer.badgeNumber,
    clearanceLevel: newOfficer.clearanceLevel,
    role: 'RTO_OFFICER',
    loginTimestamp: new Date().toISOString()
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  }

  return { success: true, officer: sessionData }
}

export function logoutOfficer() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}
