import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, History, Plus, Clock, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuthStore, useUIStore } from '@/store'
import { useQuickReorder } from '../hooks/useGames'
import { formatPrice } from '@/utils/formatPrice'
import { formatDate } from '@/utils/formatDate'
import type { Order } from '@/types'

interface QuickOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onReorder: (order: Order) => void
}

export function QuickOrderModal({ isOpen, onClose, onReorder }: QuickOrderModalProps) {
  const { user, isGuest } = useAuthStore()
  const { addToast } = useUIStore()
  const { recentOrders, isLoading } = useQuickReorder()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleReorder = (order: Order) => {
    onReorder(order)
    addToast({
      type: 'success',
      title: 'เพิ่มรายการแล้ว',
      message: `เพิ่ม ${order.items.length} รายการจากประวัติ`,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl p-6 max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center z-10 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-3">
              <History className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">สั่งซ้ำรวดเร็ว</h2>
            <p className="text-sm text-gray-500 mt-1">
              เลือกจากประวัติการสั่งซื้อล่าสุด
            </p>
          </div>

          {/* Content */}
          {isGuest || !user ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">เข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ</p>
              <Button onClick={onClose} variant="outline" className="mt-4">
                เข้าใจแล้ว
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">ยังไม่มีประวัติการสั่งซื้อ</p>
              <p className="text-sm text-gray-400 mt-1">
                สั่งซื้อครั้งแรกเพื่อใช้งานฟีเจอร์นี้
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    isHoverable 
                    className="cursor-pointer"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Items summary */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {order.items[0]?.name.slice(0, 2) || '🍱'}
                            </span>
                            <p className="font-bold text-gray-800 truncate">
                              {order.items.slice(0, 2).map(i => i.name).join(', ')}
                              {order.items.length > 2 && ` +${order.items.length - 2}`}
                            </p>
                          </div>
                          
                          {/* Meta */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(order.createdAt)}
                            </span>
                            <span>{formatPrice(order.totalPrice)}</span>
                          </div>
                        </div>

                        {/* Expand icon */}
                        <ChevronRight 
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedOrder?.id === order.id ? 'rotate-90' : ''
                          }`} 
                        />
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {selectedOrder?.id === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 mt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-2">รายการทั้งหมด:</p>
                              <ul className="space-y-1 mb-3">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                    <span>• {item.name} x{item.quantity}</span>
                                    <span className="text-gray-500">{formatPrice(item.subtotal)}</span>
                                  </li>
                                ))}
                              </ul>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleReorder(order)
                                }}
                                size="sm"
                                fullWidth
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                สั่งซ้ำรายการนี้
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuickOrderModal
