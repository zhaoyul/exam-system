import { format, parseISO, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/** 预设日期格式模板 */
export const DateFormats = {
  /** 2026年5月24日 */
  full: 'yyyy年M月d日',
  /** 2026-05-24 */
  iso: 'yyyy-MM-dd',
  /** 2026/05/24 */
  slash: 'yyyy/M/d',
  /** 2026年5月 */
  yearMonth: 'yyyy年M月',
  /** 5月24日 */
  monthDay: 'M月d日',
  /** 2026年5月24日 10:28:00 */
  dateTime: 'yyyy年M月d日 HH:mm:ss',
  /** 2026-05-24 10:28:00 */
  isoDateTime: 'yyyy-MM-dd HH:mm:ss',
  /** 10:28 */
  time: 'HH:mm',
} as const

export type DateFormatKey = keyof typeof DateFormats

/**
 * 格式化日期为中文格式
 *
 * @param date 日期值，支持 Date | string | number | null | undefined
 * @param formatStr 格式字符串或预设模板 key
 * @param fallback 无效日期时的回退文案（默认 '-'）
 * @returns 格式化后的日期字符串
 *
 * @example
 * formatChineseDate(new Date(), 'full')         // "2026年5月24日"
 * formatChineseDate('2026-05-24', 'yyyy-MM-dd') // "2026-05-24"
 * formatChineseDate(undefined)                   // "-"
 */
export function formatChineseDate(
  date: Date | string | number | null | undefined,
  formatStr: string = DateFormats.full,
  fallback: string = '-',
): string {
  if (date === null || date === undefined) return fallback

  let d: Date
  if (typeof date === 'string') {
    d = parseISO(date)
  } else if (typeof date === 'number') {
    d = new Date(date)
  } else {
    d = date
  }

  if (!isValid(d)) return fallback

  return format(d, formatStr, { locale: zhCN })
}

/**
 * 格式化日期为短格式 (yyyy-MM-dd)
 *
 * @example formatDate('2026-05-24') // "2026-05-24"
 */
export function formatDate(
  date: Date | string | number | null | undefined,
  fallback: string = '-',
): string {
  return formatChineseDate(date, DateFormats.iso, fallback)
}

/**
 * 格式化日期为完整中文格式 (yyyy年M月d日)
 *
 * @example formatDateFull('2026-05-24') // "2026年5月24日"
 */
export function formatDateFull(
  date: Date | string | number | null | undefined,
  fallback: string = '-',
): string {
  return formatChineseDate(date, DateFormats.full, fallback)
}

/**
 * 格式化日期为日期+时间字符串
 *
 * @example formatDateTime('2026-05-24T10:28:00') // "2026年5月24日 10:28:00"
 */
export function formatDateTime(
  date: Date | string | number | null | undefined,
  fallback: string = '-',
): string {
  return formatChineseDate(date, DateFormats.dateTime, fallback)
}

/**
 * 格式化日期为年月 (yyyy年M月)
 *
 * @example formatYearMonth('2026-05-24') // "2026年5月"
 */
export function formatYearMonth(
  date: Date | string | number | null | undefined,
  fallback: string = '-',
): string {
  return formatChineseDate(date, DateFormats.yearMonth, fallback)
}

/**
 * 格式化日期为月日 (M月d日)
 *
 * @example formatMonthDay('2026-05-24') // "5月24日"
 */
export function formatMonthDay(
  date: Date | string | number | null | undefined,
  fallback: string = '-',
): string {
  return formatChineseDate(date, DateFormats.monthDay, fallback)
}
