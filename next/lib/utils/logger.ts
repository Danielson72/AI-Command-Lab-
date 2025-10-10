type LogLevel = 'info' | 'warn' | 'error'

interface LogMeta {
  [key: string]: any
}

export function log(level: LogLevel, message: string, meta?: LogMeta) {
  const timestamp = new Date().toISOString()
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
  console[level](`[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`)
}

export const logger = {
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
}

