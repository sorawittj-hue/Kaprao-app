import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

export function formatOrderDate(dateString: string): string {
  const date = parseISO(dateString)
  
  if (isToday(date)) {
    return `วันนี้ ${format(date, 'HH:mm', { locale: th })}`
  }
  
  if (isYesterday(date)) {
    return `เมื่อวาน ${format(date, 'HH:mm', { locale: th })}`
  }
  
  return format(date, 'd MMM yyyy HH:mm', { locale: th })
}

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString)
  return formatDistanceToNow(date, { locale: th, addSuffix: true })
}

export function formatCountdown(targetDate: Date): { days: number; hours: number; minutes: number } {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days, hours, minutes }
}

export function formatDate(dateString: string): string {
  const date = parseISO(dateString)
  
  if (isToday(date)) {
    return 'วันนี้'
  }
  
  if (isYesterday(date)) {
    return 'เมื่อวาน'
  }
  
  return format(date, 'd MMM', { locale: th })
}

export function getNextLottoDrawDate(): Date {
  const now = new Date()
  const day = now.getDate()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  let targetDay: number
  let targetMonth = month
  let targetYear = year
  
  if (day >= 16) {
    targetDay = 1
    targetMonth = month + 1
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear = year + 1
    }
  } else if (day >= 1) {
    targetDay = 16
  } else {
    targetDay = 1
  }
  
  return new Date(targetYear, targetMonth, targetDay, 16, 0, 0)
}
