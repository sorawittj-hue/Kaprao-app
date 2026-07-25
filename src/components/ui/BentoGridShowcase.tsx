import { motion } from 'framer-motion'
import { Gift, Shuffle, Mic, History, Sparkles, ChevronRight, Zap } from 'lucide-react'
import { hapticLight } from '@/utils/haptics'

interface BentoGridShowcaseProps {
  spinsLeft: number
  onOpenWheel: () => void
  onOpenRandomizer: () => void
  onOpenVoice: () => void
  onOpenQuickOrder: () => void
}

export function BentoGridShowcase({
  spinsLeft,
  onOpenWheel,
  onOpenRandomizer,
  onOpenVoice,
  onOpenQuickOrder,
}: BentoGridShowcaseProps) {
  return (
    <div className="space-y-2.5 my-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          ฟีเจอร์พิเศษ & กิจกรรม
        </h3>
        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          INTERACTIVE
        </span>
      </div>

      <div className="grid grid-cols-12 gap-2.5">
        {/* Card 1: Wheel of Fortune (Large - 7 cols) */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            hapticLight()
            onOpenWheel()
          }}
          className="col-span-7 relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white cursor-pointer shadow-lg shadow-orange-500/20 border border-white/20 group min-h-[120px] flex flex-col justify-between"
        >
          {/* Background Decorative Circles */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="absolute right-2 top-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <Gift className="w-16 h-16 text-white" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Gift className="w-5 h-5 text-white" />
            </div>

            {spinsLeft > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse border border-white/40">
                เหลือ {spinsLeft} สิทธิ์!
              </span>
            )}
          </div>

          <div className="relative z-10 mt-3">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wide">
                หมุนวงล้อส่วนลด
              </span>
              <Sparkles className="w-3 h-3 text-amber-200" />
            </div>
            <h4 className="font-black text-base leading-tight tracking-tight text-white flex items-center justify-between">
              ลุ้นกินฟรี 0 บาท
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
            </h4>
          </div>
        </motion.div>

        {/* Card 2: Food Randomizer (5 cols) */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            hapticLight()
            onOpenRandomizer()
          }}
          className="col-span-5 relative overflow-hidden rounded-3xl p-3.5 bg-gradient-to-br from-rose-500 to-red-600 text-white cursor-pointer shadow-lg shadow-rose-500/20 border border-white/20 group min-h-[120px] flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <Shuffle className="w-4.5 h-4.5 text-white" />
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-bold text-rose-100 uppercase tracking-wide block">
              คิดไม่ออก?
            </span>
            <h4 className="font-black text-sm leading-tight text-white flex items-center justify-between">
              สุ่มเมนูด่วน
              <ChevronRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </h4>
          </div>
        </motion.div>

        {/* Card 3: Voice Order (6 cols) */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            hapticLight()
            onOpenVoice()
          }}
          className="col-span-6 relative overflow-hidden rounded-3xl p-3.5 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white cursor-pointer shadow-lg shadow-indigo-500/20 border border-white/20 group min-h-[100px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Mic className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[9px] font-black bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/30">
              AI Voice
            </span>
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide block">
              สั่งอาหารอัตโนมัติ
            </span>
            <h4 className="font-black text-sm leading-tight text-white flex items-center justify-between">
              สั่งด้วยเสียงพูด
              <ChevronRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </h4>
          </div>
        </motion.div>

        {/* Card 4: Quick Reorder (6 cols) */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            hapticLight()
            onOpenQuickOrder()
          }}
          className="col-span-6 relative overflow-hidden rounded-3xl p-3.5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white cursor-pointer shadow-lg shadow-emerald-500/20 border border-white/20 group min-h-[100px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <History className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[9px] font-black bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/30">
              Fast
            </span>
          </div>

          <div className="relative z-10">
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wide block">
              สั่งเมนูโปรดซ้ำ
            </span>
            <h4 className="font-black text-sm leading-tight text-white flex items-center justify-between">
              สั่งซ้ำทันที
              <ChevronRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-transform" />
            </h4>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
