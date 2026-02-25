import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  AlertCircle
} from 'lucide-react'
import type { OrderStatus } from '@/types'
import { cn } from '@/utils/cn'
import { supabase } from '@/lib/supabase'

interface LiveOrderTrackerProps {
  orderId: number
  initialStatus?: OrderStatus
  estimatedReadyTime?: string
}

const statusConfig: Record<OrderStatus, {
  label: string
  icon: React.ElementType
  color: string
  bgColor: string
  description: string
}> = {
  pending: {
    label: 'รอการยืนยัน',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    description: 'ร้านกำลังตรวจสอบออเดอร์ของคุณ',
  },
  placed: {
    label: 'ยืนยันแล้ว',
    icon: CheckCircle2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว',
  },
  confirmed: {
    label: 'กำลังเตรียม',
    icon: ChefHat,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    description: 'กำลังปรุงอาหารให้คุณ',
  },
  preparing: {
    label: 'กำลังทำ',
    icon: ChefHat,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    description: 'เชฟกำลังปรุงอาหารอย่างพิถีพิถัน',
  },
  ready: {
    label: 'พร้อมรับ',
    icon: Package,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    description: 'อาหารพร้อมรับแล้ว!',
  },
  delivered: {
    label: 'เสร็จสิ้น',
    icon: CheckCircle2,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    description: 'ขอบคุณที่ใช้บริการ',
  },
  cancelled: {
    label: 'ยกเลิก',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    description: 'ออเดอร์ถูกยกเลิก',
  },
}

const statusOrder: OrderStatus[] = ['pending', 'placed', 'confirmed', 'preparing', 'ready', 'delivered']

export function LiveOrderTracker({
  orderId,
  initialStatus = 'pending',
  estimatedReadyTime
}: LiveOrderTrackerProps) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Subscribe to real-time order updates
  useEffect(() => {
    console.log('🔴 Subscribing to order:', orderId)

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log('📦 Order update received:', payload)
          const newStatus = (payload.new as { status: OrderStatus }).status
          setStatus(newStatus)
          setLastUpdated(new Date())
        }
      )
      .subscribe()

    return () => {
      console.log('🔴 Unsubscribing from order:', orderId)
      supabase.removeChannel(channel)
    }
  }, [orderId])

  const currentConfig = statusConfig[status]
  const currentStep = statusOrder.indexOf(status)
  const progress = Math.max(0, (currentStep / (statusOrder.length - 1)) * 100)

  // Calculate estimated time remaining
  const getTimeRemaining = () => {
    if (!estimatedReadyTime || status === 'delivered' || status === 'cancelled') return null

    const estimated = new Date(estimatedReadyTime)
    const now = new Date()
    const diff = estimated.getTime() - now.getTime()

    if (diff <= 0) return 'ใกล้เสร็จแล้ว'

    const minutes = Math.ceil(diff / (1000 * 60))
    return `เหลืออีก ~${minutes} นาที`
  }

  const timeRemaining = getTimeRemaining()

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            key={status}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={cn('w-12 h-12 rounded-full flex items-center justify-center', currentConfig.bgColor)}
          >
            <currentConfig.icon className={cn('w-6 h-6', currentConfig.color)} />
          </motion.div>
          <div>
            <h3 className="font-bold text-gray-800">{currentConfig.label}</h3>
            <p className="text-xs text-gray-500">{currentConfig.description}</p>
          </div>
        </div>

        {timeRemaining && (
          <div className="text-right">
            <p className="text-sm font-bold text-brand-600">{timeRemaining}</p>
            <p className="text-[10px] text-gray-400">
              อัพเดท {lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full transition-colors duration-500',
              status === 'cancelled' ? 'bg-red-500' : 'bg-brand-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          />
        </div>

        {/* Step Indicators */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between">
          {statusOrder.slice(0, -1).map((stepStatus, index) => {
            const isCompleted = index <= currentStep
            const isCurrent = index === currentStep

            return (
              <motion.div
                key={stepStatus}
                className={cn(
                  'w-4 h-4 rounded-full border-2 transition-colors duration-300',
                  isCompleted ? 'bg-brand-500 border-brand-500' : 'bg-white border-gray-300',
                  isCurrent && 'ring-4 ring-brand-500/20'
                )}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )
          })}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {statusOrder.slice(0, currentStep + 1).reverse().map((stepStatus, index) => {
            const config = statusConfig[stepStatus]
            const isLatest = index === 0

            return (
              <motion.div
                key={stepStatus}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-colors',
                  isLatest ? 'bg-gray-50' : 'opacity-60'
                )}
              >
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.bgColor)}>
                  <config.icon className={cn('w-4 h-4', config.color)} />
                </div>
                <div className="flex-1">
                  <p className={cn('font-bold text-sm', isLatest ? 'text-gray-800' : 'text-gray-600')}>
                    {config.label}
                  </p>
                </div>
                {isLatest && (
                  <motion.span
                    className="text-xs text-brand-600 font-medium"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ล่าสุด
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Live Indicator */}
      {status !== 'delivered' && status !== 'cancelled' && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span>อัพเดทแบบเรียลไทม์</span>
        </div>
      )}
    </div>
  )
}
