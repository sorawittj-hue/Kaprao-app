import { z } from 'zod'

// Phone number validation for Thailand
const phoneRegex = /^0[0-9]{9}$/

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร')
    .max(100, 'ชื่อต้องไม่เกิน 100 ตัวอักษร'),
  phoneNumber: z
    .string()
    .regex(phoneRegex, 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 10 หลัก')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .min(10, 'ที่อยู่ต้องมีความยาวอย่างน้อย 10 ตัวอักษร')
    .max(500, 'ที่อยู่ต้องไม่เกิน 500 ตัวอักษร')
    .optional()
    .or(z.literal('')),
  paymentMethod: z.enum(['cod', 'transfer', 'promptpay']),
  deliveryMethod: z.enum(['workplace', 'village']),
  specialInstructions: z
    .string()
    .max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร')
    .optional()
    .or(z.literal('')),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// Validation helper for checkout
export function validateCheckoutForm(
  data: Partial<CheckoutFormData>,
  deliveryMethod: 'workplace' | 'village'
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Customer name is always required
  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.customerName = 'กรุณากรอกชื่อ-นามสกุล'
  }

  // Phone and address required for village delivery
  if (deliveryMethod === 'village') {
    if (!data.phoneNumber || !phoneRegex.test(data.phoneNumber)) {
      errors.phoneNumber = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (0XXXXXXXXX)'
    }
    if (!data.address || data.address.trim().length < 10) {
      errors.address = 'กรุณากรอกที่อยู่ให้ถูกต้อง (บ้านเลขที่, ซอย, ถนน)'
    }
  }

  // Payment method is always required
  if (!data.paymentMethod || !['cod', 'transfer', 'promptpay'].includes(data.paymentMethod)) {
    errors.paymentMethod = 'กรุณาเลือกวิธีชำระเงิน'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

// Order notes validation
export const orderNotesSchema = z
  .string()
  .max(500, 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร')

// Menu item customization validation
export const menuItemOptionsSchema = z.object({
  meatType: z.string().optional(),
  eggOption: z.string().optional(),
  spicyLevel: z.number().min(0).max(3).optional(),
  extraToppings: z.array(z.string()).optional(),
  note: z.string().max(200).optional(),
})

// Guest identity validation
export const guestIdentitySchema = z.object({
  id: z.string().uuid('Guest ID ไม่ถูกต้อง'),
  displayName: z.string().min(1),
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
})

// Lottery ticket validation
export const lottoTicketSchema = z.object({
  number: z.string().regex(/^[0-9]{2,6}$/, 'เลขหวยต้องเป็นตัวเลข 2-6 หลัก'),
  numberType: z.enum(['auto', 'manual', 'vip']),
  source: z.enum(['order_free', 'points_purchase', 'bonus']),
})

// Export validation utilities
export const ValidationMessages = {
  required: 'กรุณากรอกข้อมูลนี้',
  invalidPhone: 'เบอร์โทรศัพท์ไม่ถูกต้อง',
  invalidEmail: 'อีเมลไม่ถูกต้อง',
  tooShort: 'ข้อมูลสั้นเกินไป',
  tooLong: 'ข้อมูลยาวเกินไป',
  invalidFormat: 'รูปแบบข้อมูลไม่ถูกต้อง',
}
