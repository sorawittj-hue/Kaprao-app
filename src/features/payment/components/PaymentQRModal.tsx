import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Clock, Upload } from 'lucide-react'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { Button } from '@/components/ui/Button'
import { useContactInfo, usePaymentConfig, usePromptPayQR } from '../hooks/usePayment'
import { PaymentSlipUpload } from './PaymentSlipUpload'
import { formatPrice } from '@/utils/formatPrice'
import { hapticLight } from '@/utils/haptics'

interface PaymentQRModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number
  amount: number
  onUploadSuccess?: () => void
}

export function PaymentQRModal({
  isOpen,
  onClose,
  orderId,
  amount,
  onUploadSuccess
}: PaymentQRModalProps) {
  const [copied, setCopied] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  const { data: contact } = useContactInfo()
  const { data: paymentConfig } = usePaymentConfig()
  const qrPayload = usePromptPayQR(amount)

  const handleCopy = () => {
    hapticLight()
    if (paymentConfig?.promptpay_number) {
      navigator.clipboard.writeText(paymentConfig.promptpay_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUploadSuccess = () => {
    setShowUpload(false)
    onUploadSuccess?.()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">ชำระเงินด้วยพร้อมเพย์</h2>
            <button
              onClick={() => {
                hapticLight()
                onClose()
              }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Amount Display */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">ยอดที่ต้องชำระ</p>
              <p className="text-3xl font-black text-brand-600">
                {formatPrice(amount)}
              </p>
            </div>

            {/* QR Code */}
            {qrPayload && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl border-2 border-gray-100">
                  <QRCode
                    value={qrPayload}
                    size={200}
                    level="M"
                    includeMargin={true}
                    imageSettings={{
                      src: '/assets/icons/icon-192x192.png',
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Bank Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">พร้อมเพย์</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-sm text-brand-600 font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      คัดลอกแล้ว
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      คัดลอก
                    </>
                  )}
                </button>
              </div>
              <p className="text-2xl font-mono font-bold text-gray-800">
                {paymentConfig?.promptpay_number || contact?.phone || '0812345678'}
              </p>
              {paymentConfig?.promptpay_name && (
                <p className="text-sm text-gray-500">
                  {paymentConfig.promptpay_name}
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <span>เปิดแอพธนาคารและสแกน QR Code</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <span>ตรวจสอบยอดให้ถูกต้อง</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <span>อัพโหลดสลิปยืนยันการโอน</span>
              </div>
            </div>

            {/* Upload Section */}
            {showUpload ? (
              <PaymentSlipUpload
                orderId={orderId}
                onSuccess={handleUploadSuccess}
                onCancel={() => setShowUpload(false)}
              />
            ) : (
              <Button
                fullWidth
                onClick={() => {
                  hapticLight()
                  setShowUpload(true)
                }}
                className="flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                อัพโหลดสลิปการโอน
              </Button>
            )}

            {/* Timer Warning */}
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>กรุณาชำระเงินภายใน 30 นาที มิฉะนั้นออเดอร์จะถูกยกเลิก</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
