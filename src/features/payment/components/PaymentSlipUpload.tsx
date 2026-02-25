import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUploadSlip } from '../hooks/usePayment'
import { cn } from '@/utils/cn'

interface PaymentSlipUploadProps {
  orderId: number
  onSuccess?: () => void
  onCancel?: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function PaymentSlipUpload({ orderId, onSuccess, onCancel }: PaymentSlipUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const uploadMutation = useUploadSlip()

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('รองรับเฉพาะไฟล์ JPG, PNG, WebP')
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('ขนาดไฟล์ต้องไม่เกิน 5MB')
      return false
    }
    return true
  }

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (!validateFile(file)) return

    setFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      await uploadMutation.mutateAsync({ orderId, file })
      onSuccess?.()
    } catch (err) {
      setError('อัพโหลดไม่สำเร็จ กรุณาลองใหม่')
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </motion.div>
      )}

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Payment slip preview"
            className="w-full h-48 object-contain bg-gray-100 rounded-xl"
          />
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />
          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            <span className="text-brand-600 font-medium">คลิกเพื่อเลือกไฟล์</span> หรือลากไฟล์มาวาง
          </p>
          <p className="text-xs text-gray-400 mt-1">
            รองรับ JPG, PNG, WebP (สูงสุด 5MB)
          </p>
        </label>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          ยกเลิก
        </Button>
        <Button
          onClick={handleUpload}
          isLoading={uploadMutation.isPending}
          disabled={!file}
          className="flex-1 flex items-center justify-center gap-2"
        >
          {uploadMutation.isSuccess ? (
            <>
              <Check className="w-4 h-4" />
              สำเร็จ
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              อัพโหลด
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
