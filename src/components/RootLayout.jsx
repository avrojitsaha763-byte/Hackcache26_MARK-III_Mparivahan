import SmoothScroll from '@/components/SmoothScroll'
import SettingsModal from '@/components/SettingsModal'
import '@/globals.css'

export default function RootLayout({ children }) {
  return (
    <div className="bg-slate-200 dark:bg-slate-950 flex justify-center min-h-screen font-sans w-full transition-colors">
      <SmoothScroll>
        {/* 
          Strict 360px mobile-first container. 
          Shadows and white background make it look like a phone screen on desktop.
        */}
        <main className="w-full max-w-[360px] bg-slate-50 dark:bg-slate-900 shadow-2xl min-h-screen relative overflow-x-hidden border-x border-slate-300 dark:border-slate-800 transition-colors">
          {children}
          <SettingsModal />
        </main>
      </SmoothScroll>
    </div>
  )
}
