import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatCountdown } from '@/utils/formatDate'

interface CountdownTimerProps {
  targetDate: Date
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = formatCountdown(targetDate)
      setTimeLeft(remaining)
      
      if (remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0) {
        clearInterval(timer)
      }
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [targetDate])

  const timeUnits = [
    { value: timeLeft.days, label: 'วัน' },
    { value: timeLeft.hours, label: 'ชม.' },
    { value: timeLeft.minutes, label: 'นาที' },
  ]

  return (
    <div className="flex items-center gap-2">
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="flex items-center">
          <motion.div
            key={`${unit.label}-${unit.value}`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/20 rounded-lg px-2 py-1 min-w-[40px] text-center"
          >
            <span className="text-xl font-bold">
              {String(unit.value).padStart(2, '0')}
            </span>
          </motion.div>
          <span className="text-xs ml-1">{unit.label}</span>
          {index < timeUnits.length - 1 && (
            <span className="mx-1 text-white/50">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
