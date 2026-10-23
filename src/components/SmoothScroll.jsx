import { useEffect } from 'react'
import Lenis from 'lenis'

export default function SmoothScroll({ children }) {
  useEffect(() => {
    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })

      let rafId
      function raf(time) {
        lenis.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)

      return () => {
        if (rafId) cancelAnimationFrame(rafId)
        lenis.destroy()
      }
    } catch (err) {
      console.warn('Smooth scroll initialization fallback:', err)
    }
  }, [])

  return <>{children}</>
}

