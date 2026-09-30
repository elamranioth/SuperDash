import { useEffect, useRef, useState } from 'react'

interface HourglassCanvasProps {
  progress: number // 1.0 (full at top) to 0.0 (all at bottom)
  isRunning: boolean
  isPaused: boolean
  isFinished: boolean
  isRestarting?: boolean
  width?: number
  height?: number
  className?: string
}

interface SandParticle {
  x: number
  y: number
  vy: number
  vx: number
  size: number
  alpha: number
}

export default function HourglassCanvas({
  progress,
  isRunning,
  isPaused,
  isFinished,
  isRestarting = false,
  width = 240,
  height = 300,
  className = ''
}: HourglassCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<SandParticle[]>([])
  const [rotationAngle, setRotationAngle] = useState(0)
  const targetRotationRef = useRef(0)

  // Trigger 180° rotation on restart
  useEffect(() => {
    if (isRestarting) {
      targetRotationRef.current += 180
    }
  }, [isRestarting])

  useEffect(() => {
    let animId: number
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High DPI Retina scaling
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const w = width
    const h = height
    const cx = w / 2
    const cy = h / 2

    // Bulb geometry coordinates
    const bulbMargin = 22
    const bulbTop = bulbMargin
    const bulbBottom = h - bulbMargin
    const bulbHalfHeight = (bulbBottom - bulbTop) / 2
    const neckY = cy
    const neckRadius = 6
    const maxBulbWidth = w * 0.72

    const render = () => {
      // Smooth rotation interpolation
      if (rotationAngle !== targetRotationRef.current) {
        setRotationAngle(prev => {
          const diff = targetRotationRef.current - prev
          if (Math.abs(diff) < 1) return targetRotationRef.current
          return prev + diff * 0.12
        })
      }

      ctx.clearRect(0, 0, w, h)
      ctx.save()

      // Center rotation transform
      ctx.translate(cx, cy)
      ctx.rotate((rotationAngle * Math.PI) / 180)
      ctx.translate(-cx, -cy)

      // 1. Draw Hourglass Ambient Glow
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.45)
      glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.12)')
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, w, h)

      // 2. Sand Rendering: Clip to Glass Bulbs
      // Top Bulb Path
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx - maxBulbWidth / 2, bulbTop)
      ctx.quadraticCurveTo(cx - maxBulbWidth * 0.45, neckY - 14, cx - neckRadius, neckY)
      ctx.lineTo(cx + neckRadius, neckY)
      ctx.quadraticCurveTo(cx + maxBulbWidth * 0.45, neckY - 14, cx + maxBulbWidth / 2, bulbTop)
      ctx.closePath()
      ctx.clip()

      // Top Sand Volume (height proportional to progress)
      const clampedProg = Math.max(0, Math.min(1, progress))
      const topSandHeight = (bulbHalfHeight - 8) * clampedProg
      const topSandY = neckY - topSandHeight

      if (topSandHeight > 2) {
        const topSandGrad = ctx.createLinearGradient(0, topSandY, 0, neckY)
        topSandGrad.addColorStop(0, '#f59e0b')
        topSandGrad.addColorStop(0.5, '#d97706')
        topSandGrad.addColorStop(1, '#b45309')
        ctx.fillStyle = topSandGrad

        ctx.beginPath()
        ctx.moveTo(cx - maxBulbWidth / 2, neckY)
        ctx.lineTo(cx - maxBulbWidth / 2, topSandY)
        // Funnel dip in the center when sand is draining
        const dip = isRunning && !isPaused && clampedProg > 0.05 ? 6 : 0
        ctx.quadraticCurveTo(cx, topSandY + dip, cx + maxBulbWidth / 2, topSandY)
        ctx.lineTo(cx + maxBulbWidth / 2, neckY)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()

      // Bottom Bulb Path for Bottom Sand Accumulation
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx - neckRadius, neckY)
      ctx.quadraticCurveTo(cx - maxBulbWidth * 0.45, neckY + 14, cx - maxBulbWidth / 2, bulbBottom)
      ctx.lineTo(cx + maxBulbWidth / 2, bulbBottom)
      ctx.quadraticCurveTo(cx + maxBulbWidth * 0.45, neckY + 14, cx + neckRadius, neckY)
      ctx.closePath()
      ctx.clip()

      // Bottom Sand Pile (height proportional to 1 - progress)
      const bottomSandFraction = 1 - clampedProg
      const bottomPileHeight = (bulbHalfHeight - 10) * bottomSandFraction

      if (bottomPileHeight > 1) {
        const botSandGrad = ctx.createLinearGradient(0, bulbBottom - bottomPileHeight, 0, bulbBottom)
        botSandGrad.addColorStop(0, '#fbbf24')
        botSandGrad.addColorStop(0.3, '#f59e0b')
        botSandGrad.addColorStop(1, '#b45309')
        ctx.fillStyle = botSandGrad

        ctx.beginPath()
        ctx.moveTo(cx - maxBulbWidth / 2, bulbBottom)
        // Sand pile peak in middle
        const peakY = bulbBottom - bottomPileHeight
        ctx.quadraticCurveTo(cx, peakY - 8, cx + maxBulbWidth / 2, bulbBottom)
        ctx.closePath()
        ctx.fill()
      }

      // 3. Falling Stream of Sand through the neck
      if (isRunning && !isPaused && clampedProg > 0.005) {
        // Streamline
        const streamGrad = ctx.createLinearGradient(0, neckY - 2, 0, bulbBottom - bottomPileHeight)
        streamGrad.addColorStop(0, 'rgba(251, 191, 36, 0.95)')
        streamGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.85)')
        streamGrad.addColorStop(1, 'rgba(217, 119, 6, 0.4)')
        ctx.strokeStyle = streamGrad
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(cx, neckY)
        ctx.lineTo(cx, bulbBottom - bottomPileHeight + 4)
        ctx.stroke()

        // Spawn falling granular particles
        if (Math.random() < 0.6) {
          particlesRef.current.push({
            x: cx + (Math.random() - 0.5) * 4,
            y: neckY + 2,
            vy: 2.2 + Math.random() * 2.5,
            vx: (Math.random() - 0.5) * 0.8,
            size: 1.0 + Math.random() * 1.5,
            alpha: 0.8 + Math.random() * 0.2
          })
        }
      }

      // Update & render falling particles
      const liveParticles: SandParticle[] = []
      particlesRef.current.forEach(p => {
        if (!isPaused && isRunning) {
          p.y += p.vy
          p.x += p.vx
          p.vy += 0.15 // gravity
        }

        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Remove particle when it hits bottom sand pile
        if (p.y < bulbBottom - bottomPileHeight + 6) {
          liveParticles.push(p)
        }
      })
      particlesRef.current = liveParticles

      ctx.restore() // unclip bottom bulb

      // 4. Liquid Glass Hourglass Outer Hull & Refraction Rim
      ctx.save()
      ctx.beginPath()
      // Outer glass contour
      ctx.moveTo(cx - maxBulbWidth / 2, bulbTop)
      ctx.quadraticCurveTo(cx - maxBulbWidth * 0.45, neckY - 14, cx - neckRadius, neckY)
      ctx.quadraticCurveTo(cx - maxBulbWidth * 0.45, neckY + 14, cx - maxBulbWidth / 2, bulbBottom)
      ctx.lineTo(cx + maxBulbWidth / 2, bulbBottom)
      ctx.quadraticCurveTo(cx + maxBulbWidth * 0.45, neckY + 14, cx + neckRadius, neckY)
      ctx.quadraticCurveTo(cx + maxBulbWidth * 0.45, neckY - 14, cx + maxBulbWidth / 2, bulbTop)
      ctx.closePath()

      // Glass rim stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 3
      ctx.stroke()

      // Inner refraction highlight (curved specular glare)
      ctx.beginPath()
      ctx.arc(cx - maxBulbWidth * 0.3, bulbTop + bulbHalfHeight * 0.5, 8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.fill()

      // Top Glass Cap
      const capWidth = maxBulbWidth + 16
      const capGrad = ctx.createLinearGradient(cx - capWidth / 2, 0, cx + capWidth / 2, 0)
      capGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)')
      capGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)')
      capGrad.addColorStop(1, 'rgba(255, 255, 255, 0.35)')

      ctx.fillStyle = capGrad
      ctx.beginPath()
      ctx.roundRect(cx - capWidth / 2, bulbTop - 8, capWidth, 8, 4)
      ctx.fill()

      // Bottom Glass Cap
      ctx.beginPath()
      ctx.roundRect(cx - capWidth / 2, bulbBottom, capWidth, 8, 4)
      ctx.fill()

      ctx.restore()

      // 5. Completion Ripple effect when timer finishes
      if (isFinished) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cy, 70, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.stroke()
        ctx.restore()
      }

      ctx.restore()
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animId)
  }, [progress, isRunning, isPaused, isFinished, width, height, rotationAngle])

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="pointer-events-none drop-shadow-2xl"
      />
    </div>
  )
}
