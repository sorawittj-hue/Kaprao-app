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
  glow: string
  bg: string
  description: string
}> = {
  pending: {
    label: 'รอการยืนยัน',
    icon: Clock,
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.35)',
    bg: 'rgba(245,158,11,0.12)',
    description: 'ร้านกำลังตรวจสอบออเดอร์ของคุณ',
  },
  placed: {
    label: 'รับออเดอร์แล้ว',
    icon: CheckCircle2,
    color: '#38BDF8',
    glow: 'rgba(56,189,248,0.35)',
    bg: 'rgba(56,189,248,0.12)',
    description: 'ออเดอร์ของคุณได้รับการยืนยันแล้ว',
  },
  confirmed: {
    label: 'กำลังจัดเตรียม',
    icon: ChefHat,
    color: '#FB923C',
    glow: 'rgba(251,146,60,0.35)',
    bg: 'rgba(251,146,60,0.12)',
    description: 'เชฟกำลังจัดเตรียมวัตถุดิบ',
  },
  preparing: {
    label: 'กำลังปรุงอาหาร',
    icon: ChefHat,
    color: '#FF5E00',
    glow: 'rgba(255,94,0,0.4)',
    bg: 'rgba(255,94,0,0.14)',
    description: 'เชฟกำลังผัดกะเพราอย่างพิถีพิถัน',
  },
  ready: {
    label: 'พร้อมรับ / จัดส่ง',
    icon: Package,
    color: '#22C55E',
    glow: 'rgba(34,197,94,0.35)',
    bg: 'rgba(34,197,94,0.12)',
    description: 'อาหารปรุงเสร็จแล้ว พร้อมส่งให้คุณ!',
  },
  delivered: {
    label: 'จัดส่งสำเร็จ',
    icon: CheckCircle2,
    color: '#9CA3AF',
    glow: 'rgba(156,163,175,0.2)',
    bg: 'rgba(156,163,175,0.10)',
    description: 'ขอบคุณที่อุดหนุนกะเพรา 52 ครับ',
  },
  cancelled: {
    label: 'ยกเลิกออเดอร์',
    icon: AlertCircle,
    color: '#EF4444',
    glow: 'rgba(239,68,68,0.35)',
    bg: 'rgba(239,68,68,0.12)',
    description: 'ออเดอร์นี้ถูกยกเลิกแล้ว',
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
          const newStatus = (payload.new as { status: OrderStatus }).status
          setStatus(newStatus)
          setLastUpdated(new Date())
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  const currentConfig = statusConfig[status]
  const currentStep = Math.max(0, statusOrder.indexOf(status))
  const progress = Math.max(0, Math.min(100, (currentStep / (statusOrder.length - 1)) * 100))

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

  if (status === 'cancelled') {
    return (
      <div
        className="rounded-[28px] p-5 relative overflow-hidden border shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
          borderColor: 'rgba(239, 68, 68, 0.25)',
        }}
      >
        <div className="flex items-center gap-3.5 mb-3">
          <div
            className="w-12 h-12 rounded-[18px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)' }}
          >
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base leading-tight">ออเดอร์นี้ถูกยกเลิกแล้ว</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              หากมีข้อสงสัย สามารถติดต่อร้านค้าได้ตลอดเวลา
            </p>
          </div>
        </div>
        <div
          className="rounded-[18px] p-3 flex items-center justify-between text-xs font-bold text-red-700 mt-2"
          style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
        >
          <span>สถานะ: ยกเลิกคำสั่งซื้อ</span>
          <span className="text-[10px] font-bold text-slate-400">
            {lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-[28px] p-5 relative overflow-hidden border shadow-sm"
      style={{
        background: '#FFFFFF',
        borderColor: 'var(--border-soft)',
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none opacity-15"
        style={{ background: currentConfig.color, filter: 'blur(40px)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div
            key={status}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 rounded-[18px] flex items-center justify-center border flex-shrink-0"
            style={{
              background: currentConfig.bg,
              borderColor: `${currentConfig.color}40`,
              boxShadow: `0 4px 16px ${currentConfig.glow}`,
            }}
          >
            <currentConfig.icon className="w-6 h-6" style={{ color: currentConfig.color }} />
          </motion.div>
          <div>
            <h3 className="font-black text-slate-900 text-base leading-tight">{currentConfig.label}</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {currentConfig.description}
            </p>
          </div>
        </div>

        {timeRemaining && (
          <div className="text-right">
            <p className="text-xs font-black text-orange-600 num-display">{timeRemaining}</p>
            <p className="text-[10px] font-bold text-slate-400">
              อัปเดต {lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative mb-7 px-1">
        <div
          className="h-2 rounded-full overflow-hidden bg-slate-100"
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #FF5E00, #FF3A00, #22C55E)',
              boxShadow: '0 0 12px rgba(255,94,0,0.4)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          />
        </div>

        {/* Step Indicators */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-1 pointer-events-none">
          {statusOrder.slice(0, -1).map((stepStatus, index) => {
            const isCompleted = index <= currentStep
            const isCurrent = index === currentStep

            return (
              <motion.div
                key={stepStatus}
                className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-white"
                style={{
                  background: isCompleted ? '#FF5E00' : '#F1F5F9',
                  borderColor: isCompleted ? '#FF5E00' : '#CBD5E1',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(255,94,0,0.25)' : 'none',
                }}
                animate={isCurrent ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )
          })}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {statusOrder.slice(0, currentStep + 1).reverse().map((stepStatus, index) => {
            const config = statusConfig[stepStatus]
            const isLatest = index === 0

            return (
              <motion.div
                key={stepStatus}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-[18px] transition-all border',
                  isLatest ? 'opacity-100 shadow-xs' : 'opacity-60'
                )}
                style={{
                  background: isLatest ? '#FFF7ED' : '#F8FAFC',
                  borderColor: isLatest ? 'rgba(255, 94, 0, 0.25)' : 'rgba(226, 232, 240, 0.8)',
                }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: config.bg }}
                >
                  <config.icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold text-xs"
                    style={{ color: isLatest ? '#C2410C' : '#64748B' }}
                  >
                    {config.label}
                  </p>
                </div>
                {isLatest && (
                  <motion.span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,94,0,0.15)', color: '#FF5E00' }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ปัจจุบัน
                  </motion.span>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Live Indicator */}
      {status !== 'delivered' && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>ระบบติดตามสถานะสดแบบเรียลไทม์</span>
        </div>
      )}
    </div>
  )
}
