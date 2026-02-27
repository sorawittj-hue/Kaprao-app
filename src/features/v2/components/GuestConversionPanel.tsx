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
            className="w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2"
            style={{ background: '#00B900', color: 'white', boxShadow: '0 6px 20px rgba(0,185,0,0.5)' }}
            onClick={onLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
            </svg>
            Login LINE รับพอยต์ + บันทึกตั๋วหวย
          </motion.button>

          <p className="text-center text-white/60 text-[11px] mt-2">
            ฟรี — ไม่เสียค่าใช้จ่าย
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
                Login LINE แล้วพอยต์จะโอนเข้ากระเป๋าทันที
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
            className="w-full py-3.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2"
            style={{ background: '#00B900', boxShadow: '0 6px 18px rgba(0,185,0,0.45)' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
            </svg>
            Login LINE รับพอยต์ {pointsToEarn} ทันที!
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
            <p className="font-black text-gray-800 text-sm">Login LINE เพื่อรับพอยต์!</p>
            <p className="text-xs text-gray-500">สั่งเป็น Guest ก็ได้ — แล้วค่อย login ทีหลังก็ยังได้พอยต์คืน</p>
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
          className="w-full py-2.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2"
          style={{ background: '#00B900', boxShadow: '0 4px 12px rgba(0,185,0,0.4)' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
          </svg>
          Login LINE ก่อนสั่ง
        </motion.button>
      </div>
    </motion.div>
  )
}
