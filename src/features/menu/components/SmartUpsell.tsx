import { motion } from 'framer-motion'
import { Plus, Sparkles } from 'lucide-react'
import { formatPrice } from '@/utils/formatPrice'
import { hapticLight } from '@/utils/haptics'

interface SmartUpsellProps {
  onAddEgg: () => void
  hasEgg: boolean
}

export function SmartUpsell({ onAddEgg, hasEgg }: SmartUpsellProps) {
  if (hasEgg) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white shadow-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold text-yellow-800 text-sm">เพิ่มไข่ดาวไหม?</p>
          <p className="text-yellow-600 text-xs">อร่อยขึ้น 100% เพียง {formatPrice(10)}</p>
        </div>
      </div>
      <button
        onClick={() => {
          hapticLight()
          onAddEgg()
        }}
        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white font-black text-sm rounded-xl shadow-lg transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        เพิ่มเลย
      </button>
    </motion.div>
  )
}
