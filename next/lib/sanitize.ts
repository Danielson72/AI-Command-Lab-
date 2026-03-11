/**
 * Input sanitization utility
 * Prevents XSS and injection attempts in user-submitted data
 * before it touches the DB or an LLM.
 */

export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return ''
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export function sanitizeEmail(input: unknown): string {
  const raw = sanitizeString(input, 254)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(raw) ? raw : ''
}

export function sanitizePhone(input: unknown): string {
  const raw = sanitizeString(input, 20)
  return raw.replace(/[^0-9+\-\s().]/g, '')
}

export function sanitizeLeadInput(body: Record<string, unknown>) {
  return {
    name: sanitizeString(body.name, 100),
    email: sanitizeEmail(body.email),
    phone: sanitizePhone(body.phone),
    service_interest: sanitizeString(body.service_interest, 100),
    source: sanitizeString(body.source, 50),
    message: sanitizeString(body.message, 1000),
  }
}
