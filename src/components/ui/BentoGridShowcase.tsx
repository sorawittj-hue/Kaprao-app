import { motion } from 'framer-motion'
import { Gift, Shuffle, Mic, History, ChevronRight, Sparkles, Zap } from 'lucide-react'
import { hapticLight, hapticMedium } from '@/utils/haptics'

interface BentoGridShowcaseProps {
  spinsLeft: number
  onOpenWheel: () => void
  onOpenRandomizer: () => void
  onOpenVoice: () => void
  onOpenQuickOrder: () => void
}

export function BentoGridShowcase({
  spinsLeft, onOpenWheel, onOpenRandomizer, onOpenVoice, onOpenQuickOrder
}: BentoGridShowcaseProps) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-[10px] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF5E00, #FF3A00)', boxShadow: '0 4px 12px rgba(255,58,0,0.4)' }}
          >
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <h3 className="text-sm font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>ฟีเจอร์พิเศษ</h3>
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{ background: 'var(--brand-bg)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}
        >
          Interactive
        </span>
      </div>

      <div className="grid grid-cols-12 gap-2.5">

        {/* HERO: Wheel of Fortune */}
        <motion.div
          whileHover={{ scale: 1.022, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { hapticMedium(); onOpenWheel() }}
          className="col-span-7 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 132 }}
        >
          {/* Deep layered gradient */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #FF7A00 0%, #FF4000 50%, #B82E00 100%)' }} />
          {/* Radial highlight */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,210,100,0.35) 0%, transparent 60%)' }} />
          {/* Glow orbs */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-2xl" style={{ background: 'rgba(255,200,0,0.3)' }} />
          <div className="absolute -left-4 -bottom-6 w-20 h-20 rounded-full blur-xl" style={{ background: 'rgba(255,50,0,0.4)' }} />
          {/* Shine sweep */}
          <motion.div
            animate={{ x: ['-120%', '220%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
            className="absolute inset-0 -skew-x-12 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', width: '50%' }}
          />

          <div className="relative z-10 p-4 flex flex-col justify-between h-full" style={{ minHeight: 132 }}>
            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 rounded-[14px] flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
              >
                <Gift className="w-5 h-5 text-white" />
              </div>
              {spinsLeft > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="text-amber-100 text-[10px] font-black px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  🎁 {spinsLeft} สิทธิ์
                </motion.span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,220,150,0.8)' }}>หมุนวงล้อ</p>
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[16px] text-white">ลุ้นกินฟรี!</h4>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Randomizer */}
        <motion.div
          whileHover={{ scale: 1.025, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { hapticLight(); onOpenRandomizer() }}
          className="col-span-5 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 132 }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #E11D48 0%, #9F1239 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(251,113,133,0.3) 0%, transparent 60%)' }} />
          <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-xl" style={{ background: 'rgba(251,113,133,0.3)' }} />

          <div className="relative z-10 p-3.5 flex flex-col justify-between h-full" style={{ minHeight: 132 }}>
            <div
              className="w-9 h-9 rounded-[13px] flex items-center justify-center self-start"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Shuffle className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(253,164,175,0.8)' }}>คิดไม่ออก?</p>
              <div className="flex items-center justify-between">
                <h4 className="font-black text-[14px] text-white">สุ่มเมนู</h4>
                <ChevronRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Voice */}
        <motion.div
          whileHover={{ scale: 1.025, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { hapticLight(); onOpenVoice() }}
          className="col-span-6 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 112 }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #7C3AED 0%, #4C1D95 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(167,139,250,0.3) 0%, transparent 60%)' }} />
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl" style={{ background: 'rgba(167,139,250,0.4)' }} />

          <div className="relative z-10 p-3.5 flex flex-col justify-between h-full" style={{ minHeight: 112 }}>
            <div className="flex items-center justify-between">
              <div
                className="w-8 h-8 rounded-[11px] flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.25)', color: '#C4B5FD' }}
              >
                AI
              </span>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(196,181,253,0.8)' }}>พูดแล้วสั่ง</p>
              <h4 className="font-black text-[13px] text-white">สั่งด้วยเสียง</h4>
            </div>
          </div>
        </motion.div>

        {/* Quick Reorder */}
        <motion.div
          whileHover={{ scale: 1.025, y: -4 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { hapticLight(); onOpenQuickOrder() }}
          className="col-span-6 relative overflow-hidden rounded-[24px] cursor-pointer group"
          style={{ minHeight: 112 }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #065F46 0%, #022C22 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 20%, rgba(52,211,153,0.25) 0%, transparent 60%)' }} />
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl" style={{ background: 'rgba(52,211,153,0.3)' }} />

          <div className="relative z-10 p-3.5 flex flex-col justify-between h-full" style={{ minHeight: 112 }}>
            <div className="flex items-center justify-between">
              <div
                className="w-8 h-8 rounded-[11px] flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(52,211,153,0.3)' }}
              >
                <History className="w-3.5 h-3.5 text-white" />
              </div>
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#6EE7B7' }} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(110,231,183,0.8)' }}>สั่งซ้ำ</p>
              <h4 className="font-black text-[13px] text-white">เมนูโปรด</h4>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
