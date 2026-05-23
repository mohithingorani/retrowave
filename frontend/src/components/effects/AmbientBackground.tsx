'use client'

import { useEffect, useRef } from 'react'

export default function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const div = ref.current
    if (!div) return

    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      div.style.setProperty('--mouse-x', `${x}%`)
      div.style.setProperty('--mouse-y', `${y}%`)
    }

    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#0b0a0c]" />

      {/* Mouse-following warm glow */}
      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background:
            'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(221,107,79,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Fixed warm ambient gradients */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-[rgba(221,107,79,0.03)] blur-[120px]" />
      <div className="absolute bottom-1/3 -right-32 w-[400px] h-[400px] rounded-full bg-[rgba(74,158,142,0.03)] blur-[120px]" />
      <div className="absolute top-2/3 left-1/3 w-[300px] h-[300px] rounded-full bg-[rgba(201,169,110,0.02)] blur-[100px]" />
    </div>
  )
}
