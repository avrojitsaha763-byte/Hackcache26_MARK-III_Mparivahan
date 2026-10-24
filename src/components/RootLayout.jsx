'use client'
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  FileText, 
  CheckCircle, 
  Car, 
  Award, 
  ShieldCheck, 
  Search, 
  BookOpen, 
  Globe, 
  Moon, 
  Sun,
  Menu,
  X,
  Lock,
  Compass,
  ArrowRight
} from 'lucide-react'
import SmoothScroll from '@/components/SmoothScroll'
import SettingsModal from '@/components/SettingsModal'
import ChatbotModal from '@/components/ChatbotModal'
import { useStickyState } from '@/hooks/useStickyState'
import { getOfficerSession } from '@/lib/adminAuth'
import '@/globals.css'

export default function RootLayout({ children }) {
  const location = useLocation()
  const [lang, setLang] = useStickyState('en', 'app-lang')
  const [isDarkMode, setIsDarkMode] = useStickyState(false, 'app-theme')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [officerSession, setOfficerSession] = useState(null)

  const isHindi = lang === 'hi'

  useEffect(() => {
    setOfficerSession(getOfficerSession())
  }, [location])

  // Sync dark mode class with html
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  // Navigation Links
  const navLinks = [
    { to: '/', labelEn: 'Home', labelHi: 'मुख्य पृष्ठ', icon: Home },
    { to: '/can-i-apply', labelEn: 'Eligibility', labelHi: 'पात्रता जांचें', icon: FileText },
    { to: '/apply', labelEn: 'Apply LL', labelHi: 'आवेदन करें', icon: CheckCircle },
    { to: '/mock-test', labelEn: 'Mock Test', labelHi: 'मॉक टेस्ट', icon: Award },
    { to: '/learn', labelEn: 'Traffic Signs', labelHi: 'यातायात संकेत', icon: BookOpen },
    { to: '/track', labelEn: 'Track Status', labelHi: 'स्थिति ट्रैक करें', icon: Search },
    { to: '/permanent-dl', labelEn: 'Permanent DL', labelHi: 'स्थायी लाइसेंस', icon: Car },
  ]

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* 1. Indian Tricolor Top Accent Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 shrink-0" />

      {/* 2. Official Government of India Header Strip */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">भारत सरकार</span>
            <span className="text-slate-500">•</span>
            <span className="hidden sm:inline">सड़क परिवहन एवं राजमार्ग मंत्रालय</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span>Government of India (MoRTH)</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span className="hidden md:inline">Toll-Free Helpline: 1800-1800-151</span>
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sarathi Faceless Online Services Active
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Desktop & Mobile Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand Identity */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                    {isHindi ? 'सारथी साथी' : 'Licence Saathi'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    MARK-III
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isHindi ? 'भारतीय आरटीओ एवं ड्राइविंग लाइसेंस सहायक' : 'Indian RTO & Parivahan Digital Assistant'}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1 2xl:gap-2">
              {navLinks.map((item) => {
                const active = isActive(item.to)
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{isHindi ? item.labelHi : item.labelEn}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Action Tools: Language, Theme, & RTO Official Access */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                aria-label="Switch Language"
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle Theme"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Official RTO Portal Link (Desk Badge) */}
              {officerSession ? (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="max-w-[120px] truncate">{officerSession.name?.split(' ')[0]}</span>
                  <span className="text-[10px] bg-emerald-700 px-1.5 py-0.5 rounded">RTO</span>
                </Link>
              ) : (
                <Link
                  to="/admin/login"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-xs font-bold transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>{isHindi ? 'अधिकारी पोर्टल' : 'RTO Officer Portal'}</span>
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                className="xl:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 shadow-xl">
            {navLinks.map((item) => {
              const active = isActive(item.to)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{isHindi ? item.labelHi : item.labelEn}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </Link>
              )
            })}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Link
                to={officerSession ? "/admin" : "/admin/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-3 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {officerSession 
                    ? `Enter Scrutiny Desk (${officerSession.name})` 
                    : (isHindi ? 'आरटीओ अधिकारी संवीक्षा लॉगिन' : 'RTO Official Scrutiny Portal Login')}
                </span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 4. Main Body Content (Full Width Responsive Wrapper) */}
      <SmoothScroll>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 transition-all">
          {children}
        </main>
      </SmoothScroll>

      {/* 5. Mobile App Fixed Bottom Navigation Bar (Operating like a normal mobile app on phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-2xl flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            isActive('/') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isHindi ? 'होम' : 'Home'}</span>
        </Link>
        <Link
          to="/apply"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            isActive('/apply') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CheckCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isHindi ? 'आवेदन' : 'Apply'}</span>
        </Link>
        <Link
          to="/mock-test"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            isActive('/mock-test') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isHindi ? 'टेस्ट' : 'Mock Test'}</span>
        </Link>
        <Link
          to="/track"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            isActive('/track') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isHindi ? 'ट्रैक' : 'Track'}</span>
        </Link>
        <Link
          to="/learn"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            isActive('/learn') ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isHindi ? 'संकेत' : 'Signs'}</span>
        </Link>
      </nav>

      {/* 6. Professional Government Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 sm:px-8 mb-14 md:mb-0 text-slate-500 dark:text-slate-400 text-xs transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Licence Saathi</span>
            <span>•</span>
            <span>Indian RTO Sarathi Parivahan Citizen Digital Companion</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <a href="https://parivahan.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
              parivahan.gov.in
            </a>
            <a href="https://digilocker.gov.in" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
              digilocker.gov.in
            </a>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link to="/admin/login" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official RTO Scrutiny Portal Login</span>
            </Link>
          </div>

          <p className="text-[11px] text-center md:text-right text-slate-400 dark:text-slate-500">
            Compliant with Motor Vehicles Act 1988 & CMVR 1989. For test purposes only.
          </p>
        </div>
      </footer>

      {/* Floating Saathi AI Assistant & Accessibility Modals */}
      <ChatbotModal />
      <SettingsModal />
    </div>
  )
}
