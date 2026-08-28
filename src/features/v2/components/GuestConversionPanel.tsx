import { motion } from 'framer-motion'

interface GuestConversionPanelProps {
  pointsToEarn: number
  ticketsToEarn: number
  lottoNumber?: string
  onLogin: () => void
  variant?: 'checkout' | 'success' | 'detail'
}

export function GuestConversionPanel({
  pointsToEarn,
  ticketsToEarn,
  lottoNumber,
  onLogin,
  variant = 'checkout'
}: GuestConversionPanelProps) {
  if (variant === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="mb-6 relative overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C42 50%, #FFD700 100%)',
          boxShadow: '0 16px 40px -8px rgba(255, 107, 0, 0.45)',
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
          className="absolute inset-0 w-1/2"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }}
        />
        
        <div className="relative p-5">
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl"
            >
              🎁
            </motion.div>
            <div>
              <h3 className="font-black text-white text-lg leading-tight mb-1">
                อย่าทิ้ง {pointsToEarn} พอยต์!
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Login LINE ตอนนี้ — พอยต์ + ตั๋วหวยจะถูกบันทึกเข้าบัญชีทันที ✨
              </p>
            </div>
          </div>

          {/* Rewards breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-white">{pointsToEarn}</p>
              <p className="text-xs text-white/70">⭐ พอยต์</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-white">{ticketsToEarn}</p>
              <p className="text-xs text-white/70">🎟️ ตั๋วหวย</p>
            </div>
            <div className="bg-white/15 rounded-xl p-3 text-center">
              <motion.p
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-black text-yellow-300"
              >
                {lottoNumber?.slice(-2) || '??'}
              </motion.p>
              <p className="text-xs text-white/70">🔢 เลขลุ้น</p>
            </div>
          </div>

          {/* Lottery info */}
          {lottoNumber && (
            <div className="mb-4 bg-white/10 rounded-xl p-3 text-center">
              <p className="text-sm text-white/90 font-bold">
                เลขลุ้นโชค: <span className="text-yellow-300 text-lg tracking-widest">{lottoNumber}</span>
              </p>
              <p className="text-[10px] text-white/60 mt-0.5">
                ตรงหวยรัฐบาล = กินฟรี!
              </p>
            </div>
          )}

          {/* Login button */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            style={{ background: 'linear-gradient(135deg, #FF5500, #E03E00)', color: 'white', boxShadow: '0 6px 20px rgba(255,85,0,0.35)' }}
            onClick={onLogin}
          >
            📱 เข้าสู่ระบบด้วยเบอร์โทร รับ {pointsToEarn} พอยต์ทันที!
          </motion.button>

          <p className="text-center text-white/70 text-[11px] mt-2 font-medium">
            ฟรี — รับแต้มสะสมและสลากกินฟรีทันที
          </p>
        </div>
      </motion.div>
    )
  }

  if (variant === 'detail') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: '0 12px 32px -6px rgba(0,0,0,0.3)',
        }}
      >
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              🌟
            </motion.div>
            <div>
              <h3 className="font-black text-white text-base leading-tight">
                ออเดอร์นี้มีพอยต์รออยู่!
              </h3>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                เข้าสู่ระบบด้วยเบอร์โทร แล้วพอยต์จะโอนเข้ากระเป๋าทันที
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xl font-black text-yellow-400">{pointsToEarn}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">⭐ พอยต์</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xl font-black text-emerald-400">{ticketsToEarn}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">🎟️ ตั๋วหวย</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xl font-black text-green-400">+{Math.round(pointsToEarn / 10)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">💰 บาท</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogin}
            className="w-full py-3.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
            style={{ background: 'linear-gradient(135deg, #FF5500, #E03E00)', boxShadow: '0 6px 18px rgba(255,85,0,0.35)' }}
          >
            📱 เข้าสู่ระบบด้วยเบอร์โทร รับ {pointsToEarn} พอยต์!
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // Default checkout variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden border-2 mb-4"
      style={{ borderColor: '#FF6B00', background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF6B00, #FFB347)' }}
          >
            <span className="text-white text-xl">⭐</span>
          </div>
          <div>
            <p className="font-black text-gray-800 text-sm">เข้าสู่ระบบเพื่อรับพอยต์!</p>
            <p className="text-xs text-gray-500">สั่งเป็น Guest ก็ได้ — เข้าสู่ระบบทีหลังก็ยังได้แต้มคืน</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white/70 rounded-xl p-2.5 text-center">
            <p className="font-black text-brand-600 text-xl">{pointsToEarn}</p>
            <p className="text-[10px] text-gray-500">⭐ พอยต์</p>
          </div>
          <div className="bg-white/70 rounded-xl p-2.5 text-center">
            <p className="font-black text-emerald-600 text-xl">{ticketsToEarn}</p>
            <p className="text-[10px] text-gray-500">🎟️ ตั๋วหวย</p>
          </div>
          <div className="bg-white/70 rounded-xl p-2.5 text-center">
            <p className="font-black text-green-600 text-xl">+{Math.round(pointsToEarn / 10)}</p>
            <p className="text-[10px] text-gray-500">💰 บาท</p>
          </div>
        </div>
        
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onLogin}
          className="w-full py-2.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
          style={{ background: 'linear-gradient(135deg, #FF5500, #E03E00)', boxShadow: '0 4px 12px rgba(255,85,0,0.3)' }}
        >
          📱 เข้าสู่ระบบด้วยเบอร์โทร (รับแต้ม)
        </motion.button>
      </div>
    </motion.div>
  )
}
