import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Clock, Upload, Download, QrCode as QrIcon } from 'lucide-react'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import { Button } from '@/components/ui/Button'
import { useContactInfo, usePaymentConfig, usePromptPayQR } from '../hooks/usePayment'
import { PaymentSlipUpload } from './PaymentSlipUpload'
import { formatPrice } from '@/utils/formatPrice'
import { hapticLight, hapticMedium } from '@/utils/haptics'

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
  const qrRef = useRef<HTMLDivElement>(null)

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

  const handleDownloadQR = () => {
    hapticMedium()
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.download = `PromptPay-Kaprao52-Order-${orderId}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <QrIcon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-black text-slate-900">ชำระเงินด้วยพร้อมเพย์ QR</h2>
            </div>
            <button
              onClick={() => {
                hapticLight()
                onClose()
              }}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Amount Display */}
            <div className="text-center bg-orange-50/60 p-3.5 rounded-2xl border border-orange-200/60">
              <p className="text-xs font-bold text-slate-500 mb-0.5">ยอดที่ต้องชำระ (ออเดอร์ #{orderId})</p>
              <p className="text-3xl font-black text-orange-600 num-display">
                {formatPrice(amount)}
              </p>
            </div>

            {/* QR Code */}
            {qrPayload && (
              <div className="flex flex-col items-center gap-2.5">
                <div ref={qrRef} className="p-4 bg-white rounded-2xl border-2 border-slate-200/80 shadow-sm">
                  <QRCode
                    value={qrPayload}
                    size={210}
                    level="M"
                    includeMargin={true}
                    imageSettings={{
                      src: '/Kaprao-app/assets/icons/icon-192x192.png',
                      height: 42,
                      width: 42,
                      excavate: true,
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>บันทึกรูป QR ลงเครื่อง</span>
                </button>
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
