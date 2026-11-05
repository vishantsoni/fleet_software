import { randomUUID } from 'crypto'
import { mkdir, rm, writeFile } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/server/auth/options'
import { createVehicleDocument } from '@/server/actions/compliance'
import { CreateDocumentSchema } from '@/server/utils/validators'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const uploadDirectory = path.join(process.env.DOCUMENT_UPLOAD_DIR || path.join(process.cwd(), 'uploads'), 'vehicle-documents')

function getFileExtension(file: File, bytes: Buffer) {
  const extension = path.extname(file.name).toLowerCase()
  const signatures: Record<string, { mimeType: string; valid: boolean }> = {
    '.pdf': {
      mimeType: 'application/pdf',
      valid: bytes.subarray(0, 5).toString('ascii') === '%PDF-',
    },
    '.jpg': {
      mimeType: 'image/jpeg',
      valid: bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    },
    '.jpeg': {
      mimeType: 'image/jpeg',
      valid: bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
    },
    '.png': {
      mimeType: 'image/png',
      valid: bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    },
    '.webp': {
      mimeType: 'image/webp',
      valid:
        bytes.length >= 12 &&
        bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
        bytes.subarray(8, 12).toString('ascii') === 'WEBP',
    },
  }

  const signature = signatures[extension]
  if (!signature || !signature.valid || (file.type && file.type !== signature.mimeType)) {
    return null
  }

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

  const vehicleId = formData.get('vehicleId')
  const documentValue = formData.get('document')
  const uploadedFiles = formData.getAll('file')
  if (uploadedFiles.length > 1) {
    return NextResponse.json({ error: 'Upload one document file at a time.' }, { status: 400 })
  }
  const fileValue = uploadedFiles[0] ?? null
  if (typeof vehicleId !== 'string' || typeof documentValue !== 'string') {
    return NextResponse.json({ error: 'Vehicle and document details are required.' }, { status: 400 })
  }

  let documentInput: unknown
  try {
    documentInput = JSON.parse(documentValue)
  } catch {
    return NextResponse.json({ error: 'Invalid document details.' }, { status: 400 })
  }

  const validation = CreateDocumentSchema.safeParse(documentInput)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.issues[0]?.message || 'Invalid document details.' }, { status: 400 })
  }

  let savedFilePath: string | null = null
  let fileUrl: string | null = null

  if (fileValue !== null) {
    if (!(fileValue instanceof File) || fileValue.size === 0) {
      return NextResponse.json({ error: 'Choose a valid document file.' }, { status: 400 })
    }
    if (fileValue.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be 10 MB or less.' }, { status: 400 })
    }

    const bytes = Buffer.from(await fileValue.arrayBuffer())
    const extension = getFileExtension(fileValue, bytes)
    if (!extension) {
      return NextResponse.json({ error: 'Only valid PDF, JPEG, JPG, PNG, or WEBP files are allowed.' }, { status: 400 })
    }

    const filename = `${randomUUID()}${extension}`
    savedFilePath = path.join(uploadDirectory, filename)
    fileUrl = `/api/vehicle-documents/${filename}`

    try {
      await mkdir(uploadDirectory, { recursive: true })
      await writeFile(savedFilePath, bytes, { flag: 'wx' })
      await createVehicleDocument(vehicleId, { ...validation.data, fileUrl })
    } catch (error) {
      try {
        await rm(savedFilePath, { force: true })
      } catch (cleanupError) {
        console.error('Failed to remove an incomplete vehicle document upload', cleanupError)
      }
      console.error('Failed to save vehicle document', error)
      return NextResponse.json({ error: 'Could not save the vehicle document.' }, { status: 500 })
    }
  } else {
    try {
      await createVehicleDocument(vehicleId, { ...validation.data, fileUrl: null })
    } catch (error) {
      console.error('Failed to save vehicle document', error)
      return NextResponse.json({ error: 'Could not save the vehicle document.' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
