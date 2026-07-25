import { motion } from 'framer-motion'
import { Gift, Shuffle, Mic, History, ChevronRight, Zap, Sparkles } from 'lucide-react'
import { hapticLight, hapticMedium } from '@/utils/haptics'

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
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF5E00, #FF9500)' }}
          >
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <h3 className="text-sm font-black text-gray-800 tracking-tight">ฟีเจอร์พิเศษ</h3>
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,94,0,0.08)', color: '#FF5E00', border: '1px solid rgba(255,94,0,0.12)' }}
        >
          Interactive
        </span>
      </div>

      <div className="grid grid-cols-12 gap-2.5">

        {/* Card 1: Wheel of Fortune – hero card */}
        <motion.div
          whileHover={{ scale: 1.025, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { hapticMedium(); onOpenWheel() }}
          className="col-span-7 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 128 }}
        >
          {/* Multi-layer background */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(145deg, #FF7A00 0%, #FF4500 55%, #C43600 100%)' }}
          />
          {/* Glow orbs */}
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full opacity-30 blur-xl"
            style={{ background: '#FFD000' }}
          />
          <div className="absolute -left-4 bottom-0 w-20 h-20 rounded-full opacity-20 blur-xl"
            style={{ background: '#FF0050' }}
          />
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)'
            }}
          />

          <div className="relative z-10 p-4 flex flex-col justify-between h-full" style={{ minHeight: 128 }}>
            <div className="flex items-center justify-between">
              <div
                className="w-9 h-9 rounded-[14px] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
              >
                <Gift className="w-[18px] h-[18px] text-white" />
              </div>

              {spinsLeft > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-white text-[10px] font-black px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  🎁 {spinsLeft} สิทธิ์
                </motion.span>
              )}
            </div>

            <div>
              <p className="text-amber-200 text-[10px] font-bold uppercase tracking-widest mb-0.5">หมุนวงล้อ</p>
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[15px] text-white leading-tight">ลุ้นกินฟรี!</h4>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center group-hover:translate-x-0.5 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Food Randomizer */}
        <motion.div
          whileHover={{ scale: 1.025, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { hapticLight(); onOpenRandomizer() }}
          className="col-span-5 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 128 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(145deg, #F43F5E 0%, #BE123C 100%)' }}
          />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-25 blur-xl"
            style={{ background: '#FF80A5' }}
          />

          <div className="relative z-10 p-3.5 flex flex-col justify-between h-full" style={{ minHeight: 128 }}>
            <div
              className="w-8 h-8 rounded-[12px] flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Shuffle className="w-4 h-4 text-white" />
            </div>

            <div>
              <p className="text-rose-200 text-[9px] font-bold uppercase tracking-widest mb-0.5">คิดไม่ออก?</p>
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[13px] text-white leading-tight">สุ่มเมนู</h4>
                <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Voice Order */}
        <motion.div
          whileHover={{ scale: 1.025, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { hapticLight(); onOpenVoice() }}
          className="col-span-6 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 108 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(145deg, #7C3AED 0%, #5B21B6 100%)' }}
          />
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 blur-lg"
            style={{ background: '#C084FC' }}
          />

          <div className="relative z-10 p-3.5 flex flex-col justify-between h-full" style={{ minHeight: 108 }}>
            <div className="flex items-center justify-between">
              <div
                className="w-7.5 h-7.5 rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#E9D5FF' }}
              >
                AI
              </span>
            </div>

            <div>
              <p className="text-purple-200 text-[9px] font-bold uppercase tracking-widest mb-0.5">พูดแล้วสั่ง</p>
              <h4 className="font-black text-[13px] text-white">สั่งด้วยเสียง</h4>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Quick Reorder */}
        <motion.div
          whileHover={{ scale: 1.025, y: -3 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { hapticLight(); onOpenQuickOrder() }}
          className="col-span-6 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 108 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(145deg, #059669 0%, #065F46 100%)' }}
          />
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 blur-lg"
            style={{ background: '#34D399' }}
          />

          <div className="relative z-10 p-3.5 flex flex-col justify-between h-full" style={{ minHeight: 108 }}>
            <div className="flex items-center justify-between">
              <div
                className="w-7.5 h-7.5 rounded-[10px] flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <History className="w-3.5 h-3.5 text-white" />
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            </div>

            <div>
              <p className="text-emerald-200 text-[9px] font-bold uppercase tracking-widest mb-0.5">สั่งซ้ำ</p>
              <h4 className="font-black text-[13px] text-white">เมนูโปรด</h4>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
