/**
 * ============================================================================
 * Kaprao52 - Input Validation Utilities
 * ============================================================================
 * World-class validation with TypeScript strict types
 */

import type { CartItem } from '@/types'

// ============================================
// Validation Result Types
// ============================================
export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitized?: string
}

// ============================================
// UUID Validation
// ============================================
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isValidUUID = (uuid: unknown): uuid is string => {
  if (typeof uuid !== 'string') return false
  return UUID_REGEX.test(uuid)
}

export interface FormValidationResult<T> {
  isValid: boolean
  errors: Partial<Record<keyof T, string>>
  data?: T
}

// ============================================
// Phone Number Validation (Thai)
// ============================================
const THAI_PHONE_REGEX = /^0\d{9}$/
const PHONE_CLEAN_REGEX = /[^0-9]/g

export const validatePhone = (phone: string): ValidationResult => {
  const cleaned = phone.replace(PHONE_CLEAN_REGEX, '')

  if (!cleaned) {
    return { isValid: false, error: 'กรุณากรอกเบอร์โทรศัพท์' }
  }

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'เบอร์โทรศัพท์ต้องมี 10 หลัก' }
  }

  if (!cleaned.startsWith('0')) {
    return { isValid: false, error: 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0' }
  }

  if (!THAI_PHONE_REGEX.test(cleaned)) {
    return { isValid: false, error: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง' }
  }

  return { isValid: true, sanitized: cleaned }
}

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(PHONE_CLEAN_REGEX, '')
  if (cleaned.length !== 10) return phone
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}

// ============================================
// Name Validation
// ============================================
const NAME_MIN_LENGTH = 2
const NAME_MAX_LENGTH = 50
const NAME_REGEX = /^[\u0E00-\u0E7Fa-zA-Z\s'-]+$/
const CONSECUTIVE_SPACE_REGEX = /\s{2,}/

export const validateName = (name: string): ValidationResult => {
  const trimmed = name.trim()

  if (!trimmed) {
    return { isValid: false, error: 'กรุณากรอกชื่อ' }
  }

  if (trimmed.length < NAME_MIN_LENGTH) {
    return { isValid: false, error: `ชื่อต้องมีอย่างน้อย ${NAME_MIN_LENGTH} ตัวอักษร` }
  }

  if (trimmed.length > NAME_MAX_LENGTH) {
    return { isValid: false, error: `ชื่อต้องไม่เกิน ${NAME_MAX_LENGTH} ตัวอักษร` }
  }

  if (CONSECUTIVE_SPACE_REGEX.test(trimmed)) {
    return { isValid: false, error: 'ชื่อไม่ควรมีช่องว่างติดกันหลายช่อง' }
  }

  if (!NAME_REGEX.test(trimmed)) {
    return { isValid: false, error: 'ชื่อต้องประกอบด้วยตัวอักษรเท่านั้น' }
  }

  // Normalize: capitalize first letter of each word
  const normalized = trimmed
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return { isValid: true, sanitized: normalized }
}

// ============================================
// Address Validation
// ============================================
const ADDRESS_MIN_LENGTH = 10
const ADDRESS_MAX_LENGTH = 200
const ADDRESS_REGEX = /^[\u0E00-\u0E7F0-9a-zA-Z\s/.,'-]+$/

export const validateAddress = (address: string): ValidationResult => {
  const trimmed = address.trim()

  if (!trimmed) {
    return { isValid: false, error: 'กรุณากรอกที่อยู่' }
  }

  if (trimmed.length < ADDRESS_MIN_LENGTH) {
    return { isValid: false, error: 'ที่อยู่ต้องมีอย่างน้อย 10 ตัวอักษร' }
  }

  if (trimmed.length > ADDRESS_MAX_LENGTH) {
    return { isValid: false, error: 'ที่อยู่ยาวเกินไป' }
  }

  if (!ADDRESS_REGEX.test(trimmed)) {
    return { isValid: false, error: 'ที่อยู่มีตัวอักษรที่ไม่ได้รับอนุญาต' }
  }

  return { isValid: true, sanitized: trimmed }
}

// ============================================
// Special Instructions Validation
// ============================================
const INSTRUCTIONS_MAX_LENGTH = 500
const INSTRUCTIONS_REGEX = /^[\u0E00-\u0E7F0-9a-zA-Z\s.,'!?()-]+$/

export const validateInstructions = (instructions: string): ValidationResult => {
  if (!instructions) {
    return { isValid: true, sanitized: '' }
  }

  const trimmed = instructions.trim()

  if (trimmed.length > INSTRUCTIONS_MAX_LENGTH) {
    return { isValid: false, error: 'หมายเหตุยาวเกินไป (สูงสุด 500 ตัวอักษร)' }
  }

  if (!INSTRUCTIONS_REGEX.test(trimmed)) {
    return { isValid: false, error: 'หมายเหตุมีตัวอักษรที่ไม่ได้รับอนุญาต' }
  }

  return { isValid: true, sanitized: trimmed }
}

// ============================================
// Email Validation (for future use)
// ============================================
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim().toLowerCase()

  if (!trimmed) {
    return { isValid: false, error: 'กรุณากรอกอีเมล' }
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' }
  }

  return { isValid: true, sanitized: trimmed }
}

// ============================================
// Cart Item Validation
// ============================================
export interface CartValidationResult {
  isValid: boolean
  errors: string[]
  validItems: CartItem[]
}

export const validateCartItem = (item: CartItem): ValidationResult => {
  if (!item.menuItem || !item.menuItem.id) {
    return { isValid: false, error: 'ข้อมูลเมนูไม่ถูกต้อง' }
  }

  if (item.quantity < 1 || item.quantity > 99) {
    return { isValid: false, error: 'จำนวนต้องอยู่ระหว่าง 1-99' }
  }

  if (item.subtotal < 0 || item.subtotal > 100000) {
    return { isValid: false, error: 'ราคาไม่ถูกต้อง' }
  }

  return { isValid: true }
}

export const validateCart = (items: CartItem[]): CartValidationResult => {
  const errors: string[] = []
  const validItems: CartItem[] = []

  if (items.length === 0) {
    errors.push('ตะกร้าว่างเปล่า')
    return { isValid: false, errors, validItems }
  }

  if (items.length > 50) {
    errors.push('จำนวนรายการในตะกร้ามากเกินไป (สูงสุด 50 รายการ)')
  }

  items.forEach((item, index) => {
    const result = validateCartItem(item)
    if (result.isValid) {
      validItems.push(item)
    } else {
      errors.push(`รายการที่ ${index + 1}: ${result.error}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    validItems
  }
}

// ============================================
// Order Validation
// ============================================
export interface OrderFormData {
  customerName: string
  phoneNumber: string
  address?: string
  deliveryMethod: 'workplace' | 'village'
  specialInstructions?: string
}

export const validateOrderForm = (data: OrderFormData): FormValidationResult<OrderFormData> => {
  const errors: Partial<Record<keyof OrderFormData, string>> = {}

  // Validate name
  const nameResult = validateName(data.customerName)
  if (!nameResult.isValid) {
    errors.customerName = nameResult.error
  }

  // Validate phone (required for village delivery)
  if (data.deliveryMethod === 'village' || data.phoneNumber) {
    const phoneResult = validatePhone(data.phoneNumber)
    if (!phoneResult.isValid) {
      errors.phoneNumber = phoneResult.error
    }
  }

  // Validate address (required for village)
  if (data.deliveryMethod === 'village') {
    const addressResult = validateAddress(data.address || '')
    if (!addressResult.isValid) {
      errors.address = addressResult.error
    }
  }

  // Validate instructions (optional)
  if (data.specialInstructions) {
    const instructionsResult = validateInstructions(data.specialInstructions)
    if (!instructionsResult.isValid) {
      errors.specialInstructions = instructionsResult.error
    }
  }

  const isValid = Object.keys(errors).length === 0

  return {
    isValid,
    errors,
    data: isValid ? {
      ...data,
      customerName: nameResult.sanitized || data.customerName,
      phoneNumber: validatePhone(data.phoneNumber).sanitized || data.phoneNumber,
      address: data.deliveryMethod === 'village'
        ? validateAddress(data.address || '').sanitized
        : data.address,
      specialInstructions: validateInstructions(data.specialInstructions || '').sanitized
    } : undefined
  }
}

// ============================================
// Coupon Code Validation
// ============================================
const COUPON_REGEX = /^[A-Z0-9]{4,20}$/i

export const validateCouponCode = (code: string): ValidationResult => {
  const trimmed = code.trim().toUpperCase()

  if (!trimmed) {
    return { isValid: false, error: 'กรุณากรอกรหัสคูปอง' }
  }

  if (trimmed.length < 4) {
    return { isValid: false, error: 'รหัสคูปองสั้นเกินไป' }
  }

  if (trimmed.length > 20) {
    return { isValid: false, error: 'รหัสคูปองยาวเกินไป' }
  }

  if (!COUPON_REGEX.test(trimmed)) {
    return { isValid: false, error: 'รหัสคูปองมีตัวอักษรที่ไม่ได้รับอนุญาต' }
  }

  return { isValid: true, sanitized: trimmed }
}

// ============================================
// Points Validation
// ============================================
export const validatePointsUsage = (
  pointsToUse: number,
  availablePoints: number,
  orderTotal: number
): ValidationResult => {
  if (pointsToUse < 0) {
    return { isValid: false, error: 'จำนวนพอยต์ต้องเป็นจำนวนบวก' }
  }

  if (pointsToUse > availablePoints) {
    return { isValid: false, error: 'พอยต์ไม่เพียงพอ' }
  }

  // Maximum discount is 50% of order total
  const maxDiscount = Math.floor(orderTotal * 10 * 0.5) // 50% of total in points
  if (pointsToUse > maxDiscount) {
    return { isValid: false, error: 'สามารถใช้พอยต์ได้สูงสุด 50% ของยอดสั่งซื้อ' }
  }

  // Points must be in multiples of 10
  if (pointsToUse % 10 !== 0) {
    return { isValid: false, error: 'พอยต์ต้องเป็นจำนวนเต็ม 10' }
  }

  return { isValid: true }
}

// ============================================
// Real-time Validation Hooks
// ============================================
export const createRealtimeValidator = (
  validator: (value: string) => ValidationResult,
  delay: number = 300
) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return (value: string, onResult: (result: ValidationResult) => void) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      onResult(validator(value))
    }, delay)
  }
}

export const debouncedValidatePhone = createRealtimeValidator(validatePhone)
export const debouncedValidateName = createRealtimeValidator(validateName)

// ============================================
// Sanitization Utilities
// ============================================
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 1000) // Hard limit
}

export const sanitizeNumber = (value: unknown, defaultValue: number = 0): number => {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

export const sanitizeId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.length > 0 && value.length <= 100) {
    return value.replace(/[^a-zA-Z0-9-_]/g, '')
  }
  return null
}
