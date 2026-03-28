import { useState } from 'react'
import { Share2, Copy, Check, X } from 'lucide-react'
import { useUIStore } from '@/store'

interface LotteryShareButtonProps {
  ticketNumber: string
  prize?: string
  className?: string
}

export function LotteryShareButton({
  ticketNumber,
  prize,
  className = ''
}: LotteryShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const { addToast } = useUIStore()

  const shareText = prize
    ? `🎉 ฉันถูกรางวัลหวยเลข ${ticketNumber} ได้ ${prize}! #Kaprao52 #เลขท้ายพารวย`
    : `🎫 ตั๋วหวยเลข ${ticketNumber} - กะเพรา 52 #Kaprao52`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      addToast({
        type: 'success',
        title: 'คัดลอกแล้ว',
        message: 'คัดลอกข้อความเรียบร้อย'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'คัดลอกไม่สำเร็จ',
        message: 'กรุณาลองใหม่อีกครั้ง'
      })
    }
  }

  const handleShareLINE = () => {
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
    setShowMenu(false)
  }

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
    setShowMenu(false)
  }

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors ${className}`}
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-bold">แชร์</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
              คัดลอกข้อความ
            </button>
            
            <button
              onClick={handleShareLINE}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-[#00B900] rounded-full flex items-center justify-center text-white text-[8px] font-bold">L</span>
              แชร์ผ่าน LINE
            </button>
            
            <button
              onClick={handleShareFacebook}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-[#1877F2] rounded-full flex items-center justify-center text-white text-[8px] font-bold">f</span>
              แชร์ผ่าน Facebook
            </button>
            
            <button
              onClick={handleShareTwitter}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <span className="w-4 h-4 bg-black rounded-full flex items-center justify-center text-white text-[8px] font-bold">X</span>
              แชร์ผ่าน X (Twitter)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
