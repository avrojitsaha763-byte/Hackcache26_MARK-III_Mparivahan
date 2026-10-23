import SmoothScroll from '@/components/SmoothScroll'
import '@/globals.css'

export default function RootLayout({ children }) {
  return (
    <div className="bg-slate-200 flex justify-center min-h-screen font-sans w-full">
      <SmoothScroll>
        {/* 
          Strict 360px mobile-first container. 
          Shadows and white background make it look like a phone screen on desktop.
        */}
        <main className="w-full max-w-[360px] bg-slate-50 shadow-2xl min-h-screen relative overflow-x-hidden">
          {children}
        </main>
      </SmoothScroll>
    </div>
  )
}
