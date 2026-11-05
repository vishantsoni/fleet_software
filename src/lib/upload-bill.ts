const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function uploadBill(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Bill file size must be 10 MB or less.')
  }

  const formData = new FormData()
  formData.set('file', file)

  const response = await fetch('/api/parts-bills', { method: 'POST', body: formData })
  const result = await response.json()
  if (!response.ok) {
    throw new Error(result.error || 'Could not upload the bill.')
  }
  if (typeof result.fileUrl !== 'string') {
    throw new Error('Bill upload did not return a file URL.')
  }

  return result.fileUrl
}
