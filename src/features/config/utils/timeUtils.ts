/**
 * Time utility functions for shop hours management
 */

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
const THAI_SHORT_DAYS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

/**
 * Check if current time is within business hours
 * Handles the case where close time is after midnight (e.g., 22:00 - 02:00)
 */
export function isWithinBusinessHours(open: string, close: string): boolean {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const [openHours, openMinutes] = open.split(':').map(Number)
  const [closeHours, closeMinutes] = close.split(':').map(Number)

  const openTime = openHours * 60 + openMinutes
  const closeTime = closeHours * 60 + closeMinutes

  // If close time is after midnight (e.g., 22:00 - 02:00)
  if (closeTime < openTime) {
    return currentMinutes >= openTime || currentMinutes <= closeTime
  }

  return currentMinutes >= openTime && currentMinutes <= closeTime
}

/**
 * Get the current day of week in Thailand timezone (0 = Sunday, 6 = Saturday)
 */
export function getCurrentDayIndex(): number {
  return new Date().getDay()
}

/**
 * Get the next open day from the list of days the shop is open
 * Returns the Thai day name or a formatted string
 */
export function getNextOpenDay(daysOpen: number[]): string {
  if (daysOpen.length === 0) return 'ไม่มีวันเปิดทำการ'

  const today = getCurrentDayIndex()

  // Sort days to ensure proper order
  const sortedDays = [...daysOpen].sort((a, b) => a - b)

  // Find next open day
  for (let i = 1; i <= 7; i++) {
    const checkDay = (today + i) % 7
    if (sortedDays.includes(checkDay)) {
      if (i === 1) return 'พรุ่งนี้'
      if (i === 2) return 'มะรืนนี้'
      return `วัน${THAI_DAYS[checkDay]}หน้า`
    }
  }

  return 'ไม่มีวันเปิดทำการ'
}

/**
 * Format time in Thai format (e.g., "09:00 น.")
 */
export function formatThaiTime(time: string): string {
  if (!time || !time.includes(':')) return '-'

  const [hours] = time.split(':')
  const hour = parseInt(hours, 10)

  // Convert to Thai time format description
  let period = ''
  if (hour < 6) period = 'ตี'
  else if (hour < 12) period = 'เช้า'
  else if (hour < 13) period = 'เที่ยง'
  else if (hour < 16) period = 'บ่าย'
  else if (hour < 18) period = 'เย็น'
  else period = 'ค่ำ'

  return `${time} น. (${period})`
}

/**
 * Format time range in Thai format
 */
export function formatThaiTimeRange(open: string, close: string): string {
  return `${formatThaiTime(open)} - ${formatThaiTime(close)}`
}

/**
 * Get formatted list of open days in Thai
 */
export function formatOpenDays(daysOpen: number[]): string {
  if (daysOpen.length === 0) return 'ปิดทุกวัน'
  if (daysOpen.length === 7) return 'เปิดทุกวัน'

  const sortedDays = [...daysOpen].sort((a, b) => a - b)
  return sortedDays.map(d => THAI_SHORT_DAYS[d]).join(', ')
}

/**
 * Check if shop is open today based on days array
 */
export function isOpenToday(daysOpen: number[]): boolean {
  const today = getCurrentDayIndex()
  return daysOpen.includes(today)
}

/**
 * Get time until shop opens or closes
 */
export function getTimeUntil(time: string): string {
  const now = new Date()
  const [hours, minutes] = time.split(':').map(Number)

  const targetTime = new Date(now)
  targetTime.setHours(hours, minutes, 0, 0)

  // If target time has passed today, it's for tomorrow
  if (targetTime <= now) {
    targetTime.setDate(targetTime.getDate() + 1)
  }

  const diffMs = targetTime.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHours > 0) {
    return `อีก ${diffHours} ชม. ${diffMinutes} นาที`
  }
  return `อีก ${diffMinutes} นาที`
}

/**
 * Parse timezone offset for Thailand (UTC+7)
 */
export function getThailandTime(date: Date = new Date()): Date {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  return new Date(utc + (7 * 3600000)) // UTC+7
}
