// Firebase Client SDK for Licence Saathi (EasyDL)
// Real-Time Cellular Phone Authentication via Google Firebase & API Setu

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDryeToqp3VKgQ1BQ8oSzy35yipdbdgr-U",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "licence-saathi-easydl.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "licence-saathi-easydl",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "licence-saathi-easydl.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "627487805949",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:627487805949:web:5e0099f4e4d92e405d4994"
}

// Check if Firebase keys are populated
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 5 &&
    !firebaseConfig.apiKey.includes('YOUR_') &&
    firebaseConfig.projectId
  )
}

// Defensive Firebase App and Auth Initialization
let appInstance = null
let authInstance = null

export function getFirebaseAuth() {
  if (authInstance) return authInstance
  if (!isFirebaseConfigured()) return null

  try {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    authInstance = getAuth(appInstance)
    return authInstance
  } catch (err) {
    console.warn("Firebase Auth initialization error:", err)
    return null
  }
}

export const auth = getFirebaseAuth()
export { RecaptchaVerifier, signInWithPhoneNumber }

/**
 * Format Firebase Auth Error messages to friendly user text
 */
export function formatFirebaseError(err, isHindi = false) {
  if (!err) return isHindi ? 'ओटीपी प्रेषण में त्रुटि।' : 'An unknown authentication error occurred.'
  const code = err.code || ''
  const message = err.message || ''

  switch (code) {
    case 'auth/invalid-phone-number':
      return isHindi 
        ? 'अमान्य मोबाइल नंबर। कृपया 10 अंकों का मान्य भारतीय नंबर दर्ज करें।' 
        : 'Invalid mobile number format. Please enter a valid 10-digit number.'
    case 'auth/missing-phone-number':
      return isHindi ? 'मोबाइल नंबर आवश्यक है।' : 'Mobile number is required.'
    case 'auth/quota-exceeded':
      return isHindi 
        ? 'आज का एसएमएस कोटा समाप्त हो गया है। कृपया बाद में प्रयास करें।' 
        : 'Daily SMS quota exceeded on Firebase. Please try again later or use testing numbers.'
    case 'auth/too-many-requests':
      return isHindi 
        ? 'अत्यधिक प्रयास। कुछ मिनट बाद पुनः प्रयास करें।' 
        : 'Too many requests. Please wait a few moments before trying again.'
    case 'auth/invalid-verification-code':
      return isHindi 
        ? 'गलत ओटीपी कोड। कृपया अपने मोबाइल पर प्राप्त 6-अंकों का कोड सही दर्ज करें।' 
        : 'Incorrect 6-digit OTP code entered. Please check your SMS inbox.'
    case 'auth/code-expired':
      return isHindi 
        ? 'ओटीपी कोड समाप्त हो गया है। कृपया नया ओटीपी प्राप्त करें।' 
        : 'The SMS verification code has expired. Please request a new code.'
    case 'auth/captcha-check-failed':
      return isHindi 
        ? 'reCAPTCHA सत्यापन विफल। कृपया पुनः प्रयास करें।' 
        : 'reCAPTCHA verification failed. Please try again.'
    case 'auth/unauthorized-domain':
      return `Domain (${window.location.hostname}) is not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.`
    default:
      return message || (isHindi ? 'सत्यापन विफल हुआ।' : 'Authentication failed. Please try again.')
  }
}

/**
 * Trigger Real-Time Cellular SMS OTP via Firebase
 * @param {string} phoneNumber 10-digit Indian phone number
 * @param {string} containerId DOM ID for reCAPTCHA widget
 */
export async function sendFirebaseOtp(phoneNumber, containerId = 'recaptcha-container') {
  const currentAuth = getFirebaseAuth()
  if (!currentAuth) {
    throw new Error('Firebase Auth is not configured. Please provide Firebase API credentials.')
  }

  const cleanPhone = (phoneNumber || '').replace(/\D/g, '').slice(-10)
  if (cleanPhone.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.')
  }

  const formattedNumber = `+91${cleanPhone}`

  // Clean up any stale reCAPTCHA verifier instance
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear()
    } catch {
      // Ignore cleanup error
    }
    window.recaptchaVerifier = null
  }

  // Create new reCAPTCHA verifier
  window.recaptchaVerifier = new RecaptchaVerifier(currentAuth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
        } catch {}
        window.recaptchaVerifier = null
      }
    }
  })

  // Dispatch real cellular SMS via Firebase
  const confirmationResult = await signInWithPhoneNumber(currentAuth, formattedNumber, window.recaptchaVerifier)
  return confirmationResult
}

/**
 * Verify Citizen-Entered OTP code against Firebase confirmation result
 * @param {object} confirmationResult Firebase confirmation result
 * @param {string} otpCode 6-digit OTP code
 */
export async function verifyFirebaseOtp(confirmationResult, otpCode) {
  if (!confirmationResult || typeof confirmationResult.confirm !== 'function') {
    throw new Error('No active verification session found. Please request a new OTP.')
  }

  const cleanOtp = (otpCode || '').replace(/\D/g, '').slice(0, 6)
  if (cleanOtp.length !== 6) {
    throw new Error('Please enter a valid 6-digit OTP.')
  }

  const userCredential = await confirmationResult.confirm(cleanOtp)
  return userCredential
}
