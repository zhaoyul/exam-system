/**
 * Chinese 18-digit ID card parsing utilities
 */

export interface IdCardInfo {
  gender: '男' | '女'
  birthDate: string // YYYY-MM-DD
}

/**
 * Parse a Chinese 18-digit ID card number.
 * Returns gender and birth date, or null if invalid.
 */
export function parseIdCard(idCard: string): IdCardInfo | null {
  if (!idCard || !/^\d{17}[\dXx]$/.test(idCard)) {
    return null
  }

  const birthStr = idCard.substring(6, 14)
  const birthDate = `${birthStr.substring(0, 4)}-${birthStr.substring(4, 6)}-${birthStr.substring(6, 8)}`
  const genderCode = parseInt(idCard.charAt(16), 10)
  const gender: '男' | '女' = genderCode % 2 === 0 ? '女' : '男'

  return { gender, birthDate }
}

/**
 * Get the last 6 digits of an ID card as default password.
 */
export function getDefaultPassword(idCard: string): string {
  if (!idCard || idCard.length < 6) return '123456'
  return idCard.slice(-6)
}

/**
 * Validate ID card format (basic check).
 */
export function isValidIdCard(idCard: string): boolean {
  return /^\d{17}[\dXx]$/.test(idCard)
}
