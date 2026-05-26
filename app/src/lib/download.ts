import { apiRequest } from '@/lib/api'

export async function downloadTextEndpoint(path: string, filename: string, contentType = 'text/csv;charset=utf-8') {
  const content = await apiRequest<string>(path, { headers: { Accept: contentType } })
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
