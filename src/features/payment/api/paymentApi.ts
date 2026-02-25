import { supabase } from '@/lib/supabase'
import type { PaymentConfig, ContactInfo } from '@/types'

export interface PaymentSlipData {
  bankName?: string
  amount?: number
  transactionTime?: string
  referenceNo?: string
}

export interface PaymentStatus {
  status: 'pending' | 'paid' | 'verified' | 'failed'
  method: 'cod' | 'transfer' | 'promptpay'
  proofUrl?: string
  verifiedAt?: string
  verifiedBy?: string
  slipData?: PaymentSlipData
  dueAt?: string
}

// Generate PromptPay QR Code payload (EMVCo format)
export function generatePromptPayQR(amount: number, phoneNumber: string): string {
  // Remove non-digits from phone
  const cleanPhone = phoneNumber.replace(/\D/g, '')

  // Format: 000201 (payload format indicator) + 010212 (dynamic QR) + ...
  let payload = '000201010212'

  // Merchant Account Information (PromptPay)
  // 0016A000000677010111 (PromptPay AID)
  if (cleanPhone.length === 10) {
    // Mobile number format
    const mobile = '0066' + cleanPhone.substring(1) // Convert 0xx to 66xx
    const mobileInfo = `011300${mobile.length}${mobile}`
    payload += `29370016A000000677010111${mobileInfo}`
  }

  // Country Code: 5802TH
  payload += '5303764'
  payload += '5802TH'
  payload += '6304'

  // Add amount if specified
  if (amount > 0) {
    const amountStr = amount.toFixed(2)
    payload += `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`
  }

  // Calculate CRC16 (simplified - in production use proper CRC16-CCITT)
  const crc = calculateCRC16(payload)
  payload += crc

  return payload
}

function calculateCRC16(str: string): string {
  // Simplified CRC16 calculation
  let crc = 0xFFFF
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}

// Get shop configuration
export async function getShopConfig<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('shop_config')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) return null
  return data.value as T
}

export async function getContactInfo(): Promise<ContactInfo> {
  const defaultContact: ContactInfo = {
    phone: '0812345678',
    line_id: '@kaprao52',
    line_oa_id: '@772ysswn'
  }

  const config = await getShopConfig<ContactInfo>('contact')
  return config || defaultContact
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const defaultConfig: PaymentConfig = {
    promptpay_number: '0812345678',
    promptpay_name: 'นายสมชาย ใจดี',
    bank_accounts: []
  }

  const config = await getShopConfig<PaymentConfig>('payment')
  return config || defaultConfig
}

// Upload payment slip
export async function uploadPaymentSlip(
  orderId: number,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `order-${orderId}-${Date.now()}.${fileExt}`
  const filePath = `payment-slips/${fileName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('payment-slips')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('payment-slips')
    .getPublicUrl(filePath)

  // Update order with proof URL
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_proof_url: publicUrl,
      payment_status: 'pending'
    })
    .eq('id', orderId)

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`)
  }

  return publicUrl
}

// Get payment status
export async function getPaymentStatus(orderId: number): Promise<PaymentStatus> {
  const { data, error } = await supabase
    .from('orders')
    .select('payment_method, payment_status, payment_proof_url, payment_verified, payment_verified_at, payment_verified_by, payment_slip_data, payment_due_at')
    .eq('id', orderId)
    .single()

  if (error || !data) {
    throw new Error('Failed to fetch payment status')
  }

  const status: PaymentStatus = {
    status: (data.payment_status || 'pending') as PaymentStatus['status'],
    method: data.payment_method as PaymentStatus['method'],
    proofUrl: data.payment_proof_url ?? undefined,
    verifiedAt: data.payment_verified_at ?? undefined,
    verifiedBy: data.payment_verified_by ?? undefined,
    slipData: data.payment_slip_data as PaymentSlipData | undefined,
    dueAt: data.payment_due_at ?? undefined
  }

  // Determine combined status
  if (data.payment_proof_url && !data.payment_verified) {
    status.status = 'paid'
  } else if (data.payment_verified) {
    status.status = 'verified'
  }

  return status
}

// Admin: Verify payment
export async function verifyPayment(
  orderId: number,
  slipData?: PaymentSlipData
): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_verified: true,
      payment_verified_at: new Date().toISOString(),
      payment_verified_by: (await supabase.auth.getUser()).data.user?.id,
      payment_slip_data: slipData || null
    })
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to verify payment: ${error.message}`)
  }
}

// Admin: Reject payment
export async function rejectPayment(orderId: number, reason: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_slip_data: { rejectionReason: reason }
    })
    .eq('id', orderId)

  if (error) {
    throw new Error(`Failed to reject payment: ${error.message}`)
  }
}

// Check if payment is overdue
export function isPaymentOverdue(dueAt?: string): boolean {
  if (!dueAt) return false
  return new Date(dueAt) < new Date()
}

// Format payment due countdown
export function formatPaymentDue(dueAt?: string): string {
  if (!dueAt) return ''

  const due = new Date(dueAt)
  const now = new Date()
  const diff = due.getTime() - now.getTime()

  if (diff <= 0) return 'หมดเวลา'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `เหลือ ${hours} ชั่วโมง ${minutes} นาที`
  }
  return `เหลือ ${minutes} นาที`
}
