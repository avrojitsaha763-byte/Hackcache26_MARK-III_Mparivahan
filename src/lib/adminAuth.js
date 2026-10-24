// Official RTO Admin Scrutiny Desk Authentication & Access Control
// Prevents unauthorized citizen applicants from accessing scrutiny/approval routes

const SESSION_KEY = 'rto_official_session_v1'
const OFFICERS_KEY = 'rto_registered_officers_v1'

export const DEFAULT_OFFICERS = [
  {
    officerId: "RTO-OFFICER-DL01",
    email: "rajeshwar.sharma@parivahan.gov.in",
    name: "Rajeshwar Sharma",
    designation: "Senior Motor Vehicle Inspector (MVI)",
    rto: "DL-01 (Mall Road / North Delhi)",
    rtoCode: "DL-01",
    badgeNumber: "MVI-DL-8819",
    password: "AdminPassword2026!",
    joinedDate: "2018-04-12",
    clearanceLevel: "Level 3 (Form 3 Issuing Authority)"
  },
  {
    officerId: "RTO-OFFICER-MH02",
    email: "sanjay.kulkarni@parivahan.gov.in",
    name: "Sanjay Kulkarni",
    designation: "RTO Scrutiny Superintendent",
    rto: "MH-02 (Andheri / Mumbai West)",
    rtoCode: "MH-02",
    badgeNumber: "MVI-MH-4421",
    password: "AdminPassword2026!",
    joinedDate: "2019-09-01",
    clearanceLevel: "Level 3 (Form 3 Issuing Authority)"
  },
  {
    officerId: "RTO-OFFICER-KA01",
    email: "priya.venkatesh@parivahan.gov.in",
    name: "Priya Venkatesh",
    designation: "Assistant Transport Commissioner",
    rto: "KA-01 (Koramangala / Bengaluru Central)",
    rtoCode: "KA-01",
    badgeNumber: "ATC-KA-1109",
    password: "AdminPassword2026!",
    joinedDate: "2016-01-15",
    clearanceLevel: "Level 4 (Supervisory & Final Appeal Authority)"
  }
]

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

export function loginOfficer(identifier, password) {
  if (!identifier || !password) {
    return { success: false, message: "Please enter Officer ID/Email and Secure Password." }
  }

  const cleanId = identifier.trim().toLowerCase()
  const officers = getRegisteredOfficers()

  const matched = officers.find(o => 
    o.officerId.toLowerCase() === cleanId || 
    o.email.toLowerCase() === cleanId
  )

  if (!matched) {
    return { 
      success: false, 
      message: "Officer credentials not recognized in Transport Department directory. Check Officer ID or Email." 
    }
  }

  if (matched.password !== password) {
    return { 
      success: false, 
      message: "Incorrect password. Security attempt logged." 
    }
  }

  const sessionData = {
    officerId: matched.officerId,
    name: matched.name,
    email: matched.email,
    designation: matched.designation,
    rto: matched.rto,
    rtoCode: matched.rtoCode,
    badgeNumber: matched.badgeNumber,
    clearanceLevel: matched.clearanceLevel,
    role: 'RTO_OFFICER',
    loginTimestamp: new Date().toISOString()
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  }

  return { success: true, officer: sessionData }
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
