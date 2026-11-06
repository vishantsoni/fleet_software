import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/server/auth/options'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const uploadDirectory = path.join(process.env.DOCUMENT_UPLOAD_DIR || path.join(process.cwd(), 'uploads'), 'parts-bills')

function getFileExtension(file: File, bytes: Buffer) {
  const extension = path.extname(file.name).toLowerCase()
  const signatures: Record<string, { mimeType: string; valid: boolean }> = {
    '.pdf': { mimeType: 'application/pdf', valid: bytes.subarray(0, 1024).includes(Buffer.from('%PDF-')) },
    '.jpg': { mimeType: 'image/jpeg', valid: bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
    '.jpeg': { mimeType: 'image/jpeg', valid: bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
    '.png': {
      mimeType: 'image/png',
      valid: bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    },
    '.webp': {
      mimeType: 'image/webp',
      valid: bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP',
    },
  }

  const signature = signatures[extension]
  if (!signature || !signature.valid) return null

  return extension === '.jpeg' ? '.jpg' : extension
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 64 * 1024) {
    return NextResponse.json({ error: 'File size must be 10 MB or less.' }, { status: 413 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const files = formData.getAll('file')
  if (files.length !== 1 || !(files[0] instanceof File) || files[0].size === 0) {
    return NextResponse.json({ error: 'Choose one valid bill file.' }, { status: 400 })
  }
  const file = files[0]
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File size must be 10 MB or less.' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const extension = getFileExtension(file, bytes)
  if (!extension) {
    return NextResponse.json({ error: 'Only valid PDF, JPEG, JPG, PNG, or WEBP files are allowed.' }, { status: 400 })
  }

  const filename = `${randomUUID()}${extension}`
  try {
    await mkdir(uploadDirectory, { recursive: true })
    await writeFile(path.join(uploadDirectory, filename), bytes, { flag: 'wx' })
  } catch (error) {
    console.error('Failed to save parts bill upload', error)
    return NextResponse.json({ error: 'Could not save the bill file.' }, { status: 500 })
  }

  return NextResponse.json({ fileUrl: `/api/parts-bills/${filename}` })
}
