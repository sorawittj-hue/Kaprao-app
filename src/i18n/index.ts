/**
 * ============================================================================
 * Kaprao52 - i18n Configuration
 * ============================================================================
 * Multi-language support with Thai and English
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpApi from 'i18next-http-backend'

import { STORAGE_KEYS } from '@/utils/constants'

// ============================================
// i18n Configuration
// ============================================
i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'th',
    debug: import.meta.env.DEV,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEYS.LANGUAGE,
    },
    
    // Backend configuration
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    // Namespace configuration
    ns: ['common', 'menu', 'cart', 'checkout', 'orders', 'profile', 'admin'],
    defaultNS: 'common',
    
    // Interpolation
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    // React configuration
    react: {
      useSuspense: true,
    },
  })

export default i18n

// ============================================
// Language Utilities
// ============================================
export const SUPPORTED_LANGUAGES = [
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
] as const

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

export function changeLanguage(lng: LanguageCode) {
  return i18n.changeLanguage(lng)
}

export function getCurrentLanguage(): LanguageCode {
  return (i18n.language as LanguageCode) || 'th'
}

export function isThai(): boolean {
  return getCurrentLanguage() === 'th'
}

export function isEnglish(): boolean {
  return getCurrentLanguage() === 'en'
}

// ============================================
// RTL Support (for future languages)
// ============================================
export function isRTL(): boolean {
  // Currently no RTL languages supported
  return false
}

// ============================================
// Number/Date Formatting
// ============================================
export function formatNumber(num: number, lng?: LanguageCode): string {
  const language = lng || getCurrentLanguage()
  return new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US').format(num)
}

export function formatCurrency(amount: number, lng?: LanguageCode): string {
  const language = lng || getCurrentLanguage()
  return new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string, lng?: LanguageCode): string {
  const language = lng || getCurrentLanguage()
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatTime(date: Date | string, lng?: LanguageCode): string {
  const language = lng || getCurrentLanguage()
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelativeTime(date: Date | string, lng?: LanguageCode): string {
  const language = lng || getCurrentLanguage()
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat(language === 'th' ? 'th' : 'en', { numeric: 'auto' })
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  }
}
