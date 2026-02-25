/**
 * ============================================================================
 * Kaprao52 - Application Constants
 * ============================================================================
 * Single source of truth for all app constants
 */

// ============================================
// App Metadata
// ============================================
export const APP_NAME = 'Kaprao52'
export const APP_VERSION = '3.0.0'
export const APP_TAGLINE = 'กะเพราอร่อยที่สุดในซอย'
export const APP_DESCRIPTION = 'สั่งอาหารออนไลน์ สะสมแต้ม ลุ้นหวยกินฟรี'

// ============================================
// Points System
// ============================================
export const POINTS = {
  /** Points earned per 1 THB spent */
  EARN_RATE: 0.1, // 10 THB = 1 point
  
  /** Points value: 10 points = 1 THB discount */
  REDEEM_RATE: 0.1, // 1 point = 0.1 THB
  
  /** Maximum discount percentage allowed */
  MAX_DISCOUNT_PERCENT: 50,
  
  /** Points must be in multiples of this number */
  REDEEM_STEP: 10,
  
  /** Tier thresholds */
  TIERS: {
    MEMBER: { min: 0, discount: 0, label: 'สมาชิก' },
    SILVER: { min: 500, discount: 5, label: 'Silver' },
    GOLD: { min: 1000, discount: 10, label: 'Gold' },
    VIP: { min: 2000, discount: 15, label: 'VIP' },
  } as const,
} as const

// ============================================
// Lottery System
// ============================================
export const LOTTERY = {
  /** Ticket earned per 100 THB spent */
  TICKET_THRESHOLD: 100,
  
  /** Draw dates (1st and 16th of each month) */
  DRAW_DATES: [1, 16] as const,
  
  /** Prize amounts in THB */
  PRIZES: {
    LAST2_MATCH: 2000,
    FIRST3_MATCH: 4000,
    JACKPOT: 100000,
  } as const,
} as const

// ============================================
// Cart Limits
// ============================================
export const CART_LIMITS = {
  /** Maximum items per order */
  MAX_ITEMS: 50,
  
  /** Maximum quantity per item */
  MAX_QUANTITY_PER_ITEM: 99,
  
  /** Maximum order total in THB */
  MAX_TOTAL: 100000,
  
  /** Minimum order total for delivery */
  MIN_DELIVERY_TOTAL: 0, // Free delivery
} as const

// ============================================
// Order Configuration
// ============================================
export const ORDER_CONFIG = {
  /** Cancellation window in minutes */
  CANCELLATION_WINDOW_MINUTES: 15,
  
  /** Estimated preparation time in minutes */
  ESTIMATED_PREP_TIME_MINUTES: 20,
  
  /** Order statuses flow */
  STATUSES: [
    'pending',
    'placed',
    'confirmed',
    'preparing',
    'ready',
    'delivered',
    'cancelled',
  ] as const,
  
  /** Delivery methods */
  DELIVERY_METHODS: {
    WORKPLACE: 'workplace' as const,
    VILLAGE: 'village' as const,
  },
  
  /** Payment methods */
  PAYMENT_METHODS: {
    COD: 'cod' as const,
    TRANSFER: 'transfer' as const,
    PROMPTPAY: 'promptpay' as const,
  },
} as const

// ============================================
// Validation Limits
// ============================================
export const VALIDATION_LIMITS = {
  NAME: {
    MIN: 2,
    MAX: 50,
  },
  PHONE: {
    MIN: 10,
    MAX: 10,
  },
  ADDRESS: {
    MIN: 10,
    MAX: 200,
  },
  INSTRUCTIONS: {
    MIN: 0,
    MAX: 500,
  },
  COUPON: {
    MIN: 4,
    MAX: 20,
  },
} as const

// ============================================
// Rate Limits
// ============================================
export const RATE_LIMITS = {
  /** Orders per minute */
  ORDERS: {
    MAX: 5,
    WINDOW_MS: 60000, // 1 minute
  },
  
  /** Login attempts per window */
  LOGIN: {
    MAX: 3,
    WINDOW_MS: 300000, // 5 minutes
  },
  
  /** Coupon validation attempts */
  COUPON_CHECK: {
    MAX: 10,
    WINDOW_MS: 60000, // 1 minute
  },
  
  /** API calls per minute */
  API: {
    MAX: 60,
    WINDOW_MS: 60000, // 1 minute
  },
} as const

// ============================================
// UI Constants
// ============================================
export const UI = {
  /** Animation durations in seconds */
  ANIMATION: {
    FAST: 0.15,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  
  /** Toast display duration in ms */
  TOAST_DURATION: {
    SHORT: 2000,
    NORMAL: 4000,
    LONG: 6000,
  },
  
  /** Debounce delays in ms */
  DEBOUNCE: {
    SEARCH: 300,
    VALIDATION: 300,
    SCROLL: 100,
  },
  
  /** Skeleton counts */
  SKELETON: {
    MENU_ITEMS: 6,
    ORDERS: 3,
    NOTIFICATIONS: 5,
  },
} as const

// ============================================
// Storage Keys
// ============================================
export const STORAGE_KEYS = {
  AUTH: 'kaprao52-auth-storage',
  CART: 'kaprao52-cart-storage',
  USER_DATA: 'kaprao_user_data',
  GUEST_MODE: 'kaprao_guest_mode',
  PENDING_ORDER: 'pending_guest_order_id',
  PENDING_TOKEN: 'pending_guest_tracking_token',
  WHEEL_SPINS: 'kaprao52-wheel-spins',
  LANGUAGE: 'kaprao52-language',
  THEME: 'kaprao52-theme',
} as const

// ============================================
// API Configuration
// ============================================
export const API_CONFIG = {
  /** Request timeout in ms */
  TIMEOUT: 30000,
  
  /** Number of retries for failed requests */
  RETRY_COUNT: 3,
  
  /** Retry delay in ms */
  RETRY_DELAY: 1000,
  
  /** Cache duration in ms */
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const

// ============================================
// Feature Flags
// ============================================
export const FEATURES = {
  /** Enable voice order feature */
  VOICE_ORDER: true,
  
  /** Enable wheel of fortune */
  WHEEL_OF_FORTUNE: true,
  
  /** Enable food randomizer */
  FOOD_RANDOMIZER: true,
  
  /** Enable quick reorder */
  QUICK_REORDER: true,
  
  /** Enable AI recommendations */
  AI_RECOMMENDATIONS: true,
  
  /** Enable push notifications */
  PUSH_NOTIFICATIONS: false, // Coming soon
  
  /** Enable dark mode */
  DARK_MODE: false, // Coming soon
} as const

// ============================================
// Business Hours (Default)
// ============================================
export const BUSINESS_HOURS = {
  OPEN: '08:00',
  CLOSE: '17:00',
  DAYS_OPEN: [1, 2, 3, 4, 5], // Monday to Friday
  TIMEZONE: 'Asia/Bangkok',
} as const

// ============================================
// Contact Information (Default)
// ============================================
export const CONTACT = {
  PHONE: '0XX-XXX-XXXX',
  LINE_ID: '@kaprao52',
  LINE_OA_ID: '@kaprao52',
  EMAIL: 'contact@kaprao52.com',
  FACEBOOK: 'https://facebook.com/kaprao52',
} as const

// ============================================
// Error Messages
// ============================================
export const ERROR_MESSAGES = {
  GENERIC: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  NETWORK: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาตรวจสอบอินเทอร์เน็ต',
  TIMEOUT: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบใหม่',
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  VALIDATION: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  RATE_LIMITED: 'คุณส่งคำขอมากเกินไป กรุณารอสักครู่',
  OFFLINE: 'คุณอยู่ในโหมดออฟไลน์ ข้อมูลบางส่วนอาจไม่เป็นปัจจุบัน',
} as const

// ============================================
// Success Messages
// ============================================
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'สั่งซื้อสำเร็จ!',
  ORDER_CANCELLED: 'ยกเลิกออเดอร์สำเร็จ',
  POINTS_EARNED: (points: number) => `ได้รับ ${points} พอยต์!`,
  COUPON_APPLIED: 'ใช้คูปองสำเร็จ',
  PROFILE_UPDATED: 'อัปเดตข้อมูลสำเร็จ',
  SETTINGS_SAVED: 'บันทึกการตั้งค่าสำเร็จ',
} as const
