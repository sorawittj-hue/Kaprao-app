import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCancelOrder, useCanCancelOrder } from '../hooks/useCancelOrder'
import type { Order } from '@/types'

interface CancelOrderButtonProps {
  order: Order
  onCancelSuccess?: () => void
  variant?: 'button' | 'link'
}

export function CancelOrderButton({
  order,
  onCancelSuccess,
  variant = 'button'
}: CancelOrderButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [reason, setReason] = useState('')

  const { data: canCancelData } = useCanCancelOrder(order)
  const cancelMutation = useCancelOrder()

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ orderId: order.id, reason })
      setShowConfirm(false)
      onCancelSuccess?.()
    } catch (err) {
      console.error('Failed to cancel:', err)
    }
  }

  // Don't show if can't cancel
  if (!canCancelData?.canCancel) {
    if (variant === 'link') return null
    return (
      <Button
        variant="outline"
        disabled
        className="w-full opacity-50 cursor-not-allowed"
      >
        {canCancelData?.message || 'ไม่สามารถยกเลิกได้'}
      </Button>
    )
  }

  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="outline"
          onClick={() => setShowConfirm(true)}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <X className="w-4 h-4 mr-2" />
          ยกเลิกออเดอร์
        </Button>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="text-red-500 text-sm hover:underline"
        >
          ยกเลิกออเดอร์
        </button>
      )}

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  ยกเลิกออเดอร์ #{order.id}?
                </h3>

                <p className="text-sm text-gray-500 mb-4">
                  การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>

                <div className="text-left mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เหตุผล (ไม่บังคับ)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="เช่น สั่งผิด เปลี่ยนใจ"
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-red-500 outline-none resize-none text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1"
                  >
                    กลับ
                  </Button>
                  <Button
                    onClick={handleCancel}
                    isLoading={cancelMutation.isPending}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    ยืนยันยกเลิก
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
