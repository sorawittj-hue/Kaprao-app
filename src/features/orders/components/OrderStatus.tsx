import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { OrderStatus as OrderStatusType } from '@/types'

interface OrderStatusProps {
  status: OrderStatusType
}

const steps: { status: OrderStatusType; label: string; icon: string }[] = [
  { status: 'placed', label: 'สั่งซื้อ', icon: '📝' },
  { status: 'confirmed', label: 'ยืนยัน', icon: '✅' },
  { status: 'preparing', label: 'กำลังทำ', icon: '👨‍🍳' },
  { status: 'ready', label: 'พร้อม', icon: '🔔' },
]

export function OrderStatus({ status }: OrderStatusProps) {
  const currentIndex = steps.findIndex((s) => s.status === status)
  const isCompleted = status === 'delivered'
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <span className="text-4xl mb-2 block">❌</span>
        <h3 className="font-bold text-red-700">ออเดอร์ถูกยกเลิก</h3>
        <p className="text-sm text-red-600">กรุณาติดต่อร้านค้าหากมีข้อสงสัย</p>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-4xl mb-2 block"
        >
          ✨
        </motion.span>
        <h3 className="font-bold text-green-700">ออเดอร์เสร็จสิ้น</h3>
        <p className="text-sm text-green-600">ขอบคุณที่ใช้บริการ</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-gray-100 rounded-full">
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentIndex
            const isCurrent = index === currentIndex

            return (
              <div key={step.status} className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                    backgroundColor: isActive ? '#FF6B00' : '#E5E7EB',
                  }}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-xl',
                    'border-4 z-10 transition-colors duration-300',
                    isActive ? 'border-brand-100' : 'border-gray-50'
                  )}
                >
                  {step.icon}
                </motion.div>
                <span
                  className={cn(
                    'text-xs font-bold mt-2',
                    isActive ? 'text-brand-600' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
