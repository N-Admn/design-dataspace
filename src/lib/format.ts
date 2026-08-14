export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`
  }
  return `${bytes}B`
}

export function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = pad(date.getDate())
  const month = pad(date.getMonth() + 1)
  const year = date.getFullYear()
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Parses the app's "DD/MM/YYYY HH:mm:ss" timestamp string into a Date. */
export function parseAppTimestamp(value: string): Date {
  const [datePart, timePart = '00:00:00'] = value.split(' ')
  const [day, month, year] = datePart.split('/').map(Number)
  const [hours, minutes, seconds] = timePart.split(':').map(Number)
  return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0, seconds || 0)
}

/** Formats the app's "DD/MM/YYYY HH:mm:ss" timestamp string as "09 Aug 2026". */
export function formatShortDate(value: string): string {
  const date = parseAppTimestamp(value)
  const day = String(date.getDate()).padStart(2, '0')
  return `${day} ${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`
}
