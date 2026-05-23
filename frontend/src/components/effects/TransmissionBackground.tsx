'use client'

import { useEffect, useRef } from 'react'

export default function TransmissionBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      time += 0.003
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      // Warm pool of light from below — like a lamp on a desk
      const glowY = h * 0.7
      const ambient = ctx.createRadialGradient(w / 2, h + 50, 0, w / 2, h + 50, h * 0.8)
      ambient.addColorStop(0, 'rgba(217, 119, 6, 0.025)')
      ambient.addColorStop(0.5, 'rgba(217, 119, 6, 0.015)')
      ambient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = ambient
      ctx.fillRect(0, 0, w, h)

      // Very faint warm glow from top — like a display glow
      const topGlow = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, h * 0.6)
      topGlow.addColorStop(0, 'rgba(217, 119, 6, 0.015)')
      topGlow.addColorStop(0.3, 'rgba(217, 119, 6, 0.008)')
      topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = topGlow
      ctx.fillRect(0, 0, w, h)

      // Subtle cathode warmth — very faint pulsing amber
      const pulse = Math.sin(time * 0.5) * 0.005 + 0.01
      ctx.fillStyle = `rgba(217, 119, 6, ${pulse})`
      ctx.fillRect(0, 0, w, h)

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}
