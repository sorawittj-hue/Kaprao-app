/**
 * ============================================================================
 * Kaprao52 - Production Logger
 * ============================================================================
 * Environment-aware logging with privacy protection
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  userAgent?: string
  url?: string
}

// ============================================
// Configuration
// ============================================
const isDev = import.meta.env.DEV
const isTest = import.meta.env.MODE === 'test'

// Sensitive keys that should be redacted
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'phone',
  'email',
  'line_user_id',
  'user_id',
]

// ============================================
// Data Sanitization
// ============================================
function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData)
  }

  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    
    // Check if key is sensitive
    if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

// ============================================
// Log Storage (for debugging)
// ============================================
const MAX_LOG_ENTRIES = 100
const logHistory: LogEntry[] = []

function addToHistory(entry: LogEntry) {
  logHistory.push(entry)
  if (logHistory.length > MAX_LOG_ENTRIES) {
    logHistory.shift()
  }
}

// ============================================
// Console Output with Styling
// ============================================
const LOG_STYLES: Record<LogLevel, string> = {
  debug: 'color: #6B7280; font-weight: bold;',
  info: 'color: #3B82F6; font-weight: bold;',
  warn: 'color: #F59E0B; font-weight: bold;',
  error: 'color: #EF4444; font-weight: bold;',
}

const LOG_EMOJIS: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
}

function formatTimestamp(): string {
  return new Date().toISOString()
}

function outputToConsole(entry: LogEntry) {
  if (isTest) return // Silence in tests

  const { level, message, data } = entry
  const emoji = LOG_EMOJIS[level]
  const style = LOG_STYLES[level]
  const timestamp = new Date(entry.timestamp).toLocaleTimeString()

  if (isDev) {
    // Rich formatting in development
    console.log(
      `%c${emoji} [${timestamp}] ${message}`,
      style,
      data ? '\n' : '',
      data || ''
    )
  } else {
    // Minimal formatting in production
    console.log(`[${level.toUpperCase()}] ${message}`)
  }
}

// ============================================
// Logger Functions
// ============================================
function createLogEntry(
  level: LogLevel,
  message: string,
  data?: unknown
): LogEntry {
  return {
    level,
    message,
    timestamp: formatTimestamp(),
    data: sanitizeData(data),
    userAgent: isDev ? navigator.userAgent : undefined,
    url: isDev ? window.location.href : undefined,
  }
}

export const logger = {
  debug(message: string, data?: unknown) {
    if (!isDev) return // Only log debug in development
    
    const entry = createLogEntry('debug', message, data)
    addToHistory(entry)
    outputToConsole(entry)
  },

  info(message: string, data?: unknown) {
    const entry = createLogEntry('info', message, data)
    addToHistory(entry)
    outputToConsole(entry)
  },

  warn(message: string, data?: unknown) {
    const entry = createLogEntry('warn', message, data)
    addToHistory(entry)
    outputToConsole(entry)
  },

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorData = error instanceof Error 
      ? { 
          message: error.message, 
          stack: isDev ? error.stack : undefined,
          name: error.name,
        }
      : error

    const entry = createLogEntry('error', message, {
      error: errorData,
      context: sanitizeData(context),
    })
    
    addToHistory(entry)
    outputToConsole(entry)

    // Send to error tracking service if in production
    if (!isDev && window.Sentry) {
      const err = error instanceof Error ? error : new Error(message)
      window.Sentry.captureException(err, {
        extra: context,
      })
    }
  },

  // Group related logs
  group(label: string, fn: () => void) {
    if (!isDev) {
      fn()
      return
    }
    
    console.group(`📦 ${label}`)
    fn()
    console.groupEnd()
  },

  // Time a function
  time<T>(label: string, fn: () => T): T {
    if (!isDev) return fn()
    
    console.time(label)
    const result = fn()
    console.timeEnd(label)
    return result
  },

  // Async time
  async timeAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!isDev) return fn()
    
    console.time(label)
    const result = await fn()
    console.timeEnd(label)
    return result
  },

  // Get log history (for debugging)
  getHistory(): readonly LogEntry[] {
    return Object.freeze([...logHistory])
  },

  // Clear history
  clearHistory() {
    logHistory.length = 0
  },

  // Log API call
  api(method: string, endpoint: string, data?: unknown) {
    this.info(`API ${method}`, { endpoint, data })
  },

  // Log user action
  action(action: string, details?: Record<string, unknown>) {
    this.info(`User Action: ${action}`, details)
  },

  // Log performance metric
  perf(metric: string, value: number, unit: string = 'ms') {
    this.debug(`Perf: ${metric}`, { value, unit })
  },
}

// ============================================
// No-op logger for tests
// ============================================
export const noopLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  group: (_: string, fn: () => void) => fn(),
  time: <T>(_: string, fn: () => T) => fn(),
  timeAsync: <T>(_: string, fn: () => Promise<T>) => fn(),
  getHistory: () => [],
  clearHistory: () => {},
  api: () => {},
  action: () => {},
  perf: () => {},
}

// Export default logger instance
export default logger
