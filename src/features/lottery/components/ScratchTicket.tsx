import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface ScratchTicketProps {
  children: React.ReactNode
  onComplete?: () => void
  width?: number
  height?: number
  brushSize?: number
}

export function ScratchTicket({
  children,
  onComplete,
  width = 300,
  height = 160,
  brushSize = 30
}: ScratchTicketProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDone, setIsDone] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Fill with scratchable silver texture
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#D1D5DB')
    gradient.addColorStop(0.5, '#9CA3AF')
    gradient.addColorStop(1, '#D1D5DB')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Add some "texture" dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
    for (let i = 0; i < 500; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1)
    }

    // Add Logo or Pattern
    ctx.font = 'bold 24px Sarabun'
    ctx.fillStyle = '#4B5563'
    ctx.textAlign = 'center'
    ctx.fillText('KAPRAO52', width / 2, height / 2)
  }, [width, height])

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || isDone) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, Math.PI * 2)
    ctx.fill()

    checkCompletion()
  }

  const checkCompletion = () => {
    const canvas = canvasRef.current
    if (!canvas || isDone) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, width, height)
    const pixels = imageData.data
    let clearedCount = 0

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) clearedCount++
    }

    const percentage = (clearedCount / (width * height)) * 100
    if (percentage > 50) {
      setIsDone(true)
      if (onComplete) onComplete()
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden group touch-none rounded-2xl"
      style={{ width, height }}
    >
      {/* Underlying Content */}
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        {children}
      </div>

      {/* Scratch Layer */}
      <AnimatePresence>
        {!isDone && (
          <motion.canvas
            ref={canvasRef}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            width={width}
            height={height}
            className="absolute inset-0 z-10 cursor-crosshair touch-none"
            onMouseDown={() => setIsDrawing(true)}
            onMouseUp={() => setIsDrawing(false)}
            onMouseMove={(e) => {
              if (isDrawing) scratch(e.clientX, e.clientY)
            }}
            onTouchStart={() => setIsDrawing(true)}
            onTouchEnd={() => setIsDrawing(false)}
            onTouchMove={(e) => {
              if (isDrawing) scratch(e.touches[0].clientX, e.touches[0].clientY)
            }}
          />
        )}
      </AnimatePresence>

      {/* Reward Glow */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
        >
          <Sparkles className="w-12 h-12 text-yellow-400" />
        </motion.div>
      )}
    </div>
  )
}
