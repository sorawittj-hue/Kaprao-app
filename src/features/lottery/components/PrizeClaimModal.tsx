import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Check, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'

interface PrizeClaimModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: {
    id: number
    number: string
    drawDate: string
    prize: string
    prizeValue: number
  }
  onClaim: (ticketId: number) => Promise<void>
}

export function PrizeClaimModal({
  isOpen,
  onClose,
  ticket,
  onClaim
}: PrizeClaimModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm')

  if (!isOpen) return null

  const handleClaim = async () => {
    setStep('processing')
    
    try {
      await onClaim(ticket.id)
      setStep('success')
    } catch (error) {
      console.error('Failed to claim prize:', error)
      setStep('confirm')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-gray-800">
            {step === 'success' ? 'รับรางวัลสำเร็จ!' : 'ยืนยันการรับรางวัล'}
          </h3>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Gift className="w-10 h-10 text-white" />
                </div>
                
                <h4 className="text-2xl font-black text-gray-800 mb-2">
                  ยินดีด้วย! 🎉
                </h4>
                <p className="text-gray-500 mb-6">
                  คุณถูกรางวัล {ticket.prize}
                </p>

                {/* Ticket Details */}
                <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-500 text-sm">เลขตั๋ว</span>
                    <div className="flex items-center gap-2">
                      {ticket.number.split('').map((digit, idx) => (
                        <span
                          key={idx}
                          className="w-8 h-10 bg-white rounded-lg flex items-center justify-center font-black text-xl text-gray-800 border border-gray-200"
                        >
                          {digit}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">มูลค่ารางวัล</span>
                    <span className="font-black text-green-600">
                      {formatPrice(ticket.prizeValue)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={onClose}
                  >
                    ไว้ทีหลัง
                  </Button>
                  <Button
                    fullWidth
                    onClick={handleClaim}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500"
                  >
                    รับรางวัลเลย
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium">กำลังดำเนินการ...</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-green-600" />
                </motion.div>
                
                <h4 className="text-2xl font-black text-gray-800 mb-2">
                  รับรางวัลสำเร็จ!
                </h4>
                <p className="text-gray-500 mb-6">
                  รางวัลจะถูกเพิ่มในบัญชีของคุณแล้ว
                </p>

                {/* Contact Info */}
                <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-bold text-blue-700 text-sm">
                        รับรางวัลทาง LINE
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        ส่งข้อความมาที่ LINE Official Account เพื่อรับรางวัล
                      </p>
                      <a
                        href="https://line.me/R/ti/p/@kaprao52"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 mt-2 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        เปิด LINE
                      </a>
                    </div>
                  </div>
                </div>

                <Button
                  fullWidth
                  onClick={onClose}
                >
                  เสร็จสิ้น
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
