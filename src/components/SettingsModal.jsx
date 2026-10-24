'use client'
import { useState, useEffect } from 'react'
import { Settings, Globe, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'

export default function SettingsModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useStickyState('en', 'app-lang')
  const [isDarkMode, setIsDarkMode] = useStickyState(false, 'app-theme')

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode])

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="Accessibility Settings"
        className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 p-3.5 bg-slate-900 text-white rounded-full shadow-2xl z-50 hover:bg-slate-800 active:scale-95 transition-all dark:bg-blue-600 dark:hover:bg-blue-700 border-2 border-white/20"
      >
        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm sm:max-w-md rounded-3xl p-6 relative border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Accessibility Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Language</span>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => setLang('en')} 
                    className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${lang === 'en' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLang('hi')} 
                    className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${lang === 'hi' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    HI
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800 dark:text-white">
                  <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">High Contrast</span>
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label="Toggle High Contrast Dark Theme"
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <Button onClick={() => setIsOpen(false)} className="w-full mt-8 rounded-xl h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
              Save & Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
