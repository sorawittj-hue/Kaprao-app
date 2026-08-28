import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, History, Plus, Zap, ShoppingBag, Flame } from 'lucide-react'
import { useUIStore, useCartStore } from '@/store'
import { useQuickReorder } from '../hooks/useGames'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { formatPrice } from '@/utils/formatPrice'
import { formatDate } from '@/utils/formatDate'
import { hapticLight, hapticHeavy } from '@/utils/haptics'
import type { Order } from '@/types'

interface QuickOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onReorder: (order: Order) => void
}

const POPULAR_QUICK_MEALS = [
  {
    name: 'ข้าวกะเพราหมูกรอบ + ไข่ดาว',
    menuName: 'ข้าวกะเพรา',
    price: 85,
    options: [
      { optionId: 'meat-crispy-pork', name: 'หมูกรอบ', price: 15 },
      { optionId: 'egg-fried', name: 'ไข่ดาว', price: 10 },
      { optionId: 'spicy-medium', name: 'ความเผ็ด: เผ็ดกลาง (🔥2)', price: 0 }
    ]
  },
  {
    name: 'ข้าวกะเพราหมูสับ + ไข่ดาว',
    menuName: 'ข้าวกะเพรา',
    price: 70,
    options: [
      { optionId: 'meat-minced-pork', name: 'หมูสับ', price: 0 },
      { optionId: 'egg-fried', name: 'ไข่ดาว', price: 10 },
      { optionId: 'spicy-medium', name: 'ความเผ็ด: เผ็ดกลาง (🔥2)', price: 0 }
    ]
  },
  {
    name: 'ข้าวหมูกรอบผัดกระเทียม',
    menuName: 'ข้าวผัดกระเทียม',
    price: 75,
    options: [
      { optionId: 'meat-crispy-pork', name: 'หมูกรอบ', price: 15 }
    ]
  },
  {
    name: 'มาม่าผัดกะเพราหมูสับ',
    menuName: 'มาม่าผัดกะเพรา',
    price: 60,
    options: [
      { optionId: 'meat-minced-pork', name: 'หมูสับ', price: 0 },
      { optionId: 'spicy-medium', name: 'ความเผ็ด: เผ็ดกลาง (🔥2)', price: 0 }
    ]
  }
]

export function QuickOrderModal({ isOpen, onClose, onReorder }: QuickOrderModalProps) {
  const { addToast } = useUIStore()
  const { addItem } = useCartStore()
  const { data: menuItems } = useMenuItems()
  const { recentOrders, isLoading } = useQuickReorder()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleReorder = (order: Order) => {
    hapticHeavy()
    onReorder(order)
    addToast({
      type: 'success',
      title: 'เพิ่มรายการเรียบร้อย',
      message: `เพิ่ม ${order.items?.length || 1} รายการลงตะกร้าแล้ว`,
    })
    onClose()
  }

  const handleQuickMealAdd = (meal: typeof POPULAR_QUICK_MEALS[0]) => {
    hapticHeavy()
    const foundMenu = menuItems?.find(m => m.name === meal.menuName) || menuItems?.[0]
    if (foundMenu) {
      addItem(foundMenu, 1, meal.options, 'สั่งด่วน 1-Tap')
      addToast({
        type: 'success',
        title: 'เพิ่มลงตะกร้าแล้ว!',
        message: `${meal.name} (฿${meal.price})`,
      })
      onClose()
    }
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
          className="bg-white rounded-3xl p-6 max-w-md w-full relative overflow-hidden max-h-[88vh] flex flex-col shadow-2xl border"
        >
          {/* Close button */}
          <button
            onClick={() => { hapticLight(); onClose() }}
            className="absolute top-4 right-4 w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center z-10 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5 text-slate-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-5 flex-shrink-0">
            <div className="inline-flex items-center justify-center w-13 h-13 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-2.5 shadow-sm text-white">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">สั่งซ้ำด่วน 1-Tap</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              สั่งเมนูเดิม หรือกด 1-Tap เมนูยอดนิยมลงตะกร้าทันที
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-0.5">

            {/* Section 1: Recent Orders (If any) */}
            {isLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin w-7 h-7 border-3 border-orange-500 border-t-transparent rounded-full" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-2.5">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-orange-500" />
                  ประวัติออเดอร์ล่าสุดของคุณ
                </p>
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl border bg-slate-50/80 hover:bg-orange-50/40 transition-all cursor-pointer border-slate-200/80 shadow-xs"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-xs text-slate-800 truncate">
                          {order.items?.slice(0, 2).map(i => i.name).join(' + ') || 'ออเดอร์กะเพรา 52'}
                          {(order.items?.length || 0) > 2 && ` +${(order.items?.length || 0) - 2}`}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                          {formatDate(order.createdAt)} • {formatPrice(order.totalPrice)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReorder(order)
                        }}
                        className="px-3 py-1.5 rounded-full font-black text-xs bg-orange-500 text-white hover:bg-orange-600 cursor-pointer shadow-xs flex items-center gap-1 flex-shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>สั่งซ้ำ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Section 2: Popular 1-Tap Quick Meals (Always Available!) */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                เมนูฮิตยอดนิยม สั่งด่วน 1-Tap
              </p>
              <div className="grid grid-cols-1 gap-2">
                {POPULAR_QUICK_MEALS.map((meal, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border bg-white hover:border-orange-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                    style={{ borderColor: 'rgba(226, 232, 240, 0.9)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-xs text-slate-900 truncate">{meal.name}</p>
                      <p className="text-[11px] font-bold text-orange-600 num-display mt-0.5">฿{meal.price}</p>
                    </div>
                    <button
                      onClick={() => handleQuickMealAdd(meal)}
                      className="px-3 py-1.5 rounded-full font-black text-xs bg-slate-900 hover:bg-orange-500 text-white cursor-pointer shadow-xs transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>ใส่ตะกร้า</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default QuickOrderModal
