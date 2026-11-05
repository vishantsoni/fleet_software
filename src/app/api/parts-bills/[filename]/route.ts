import { readFile } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/server/auth/options'

export const runtime = 'nodejs'

const uploadDirectory = path.join(process.env.DOCUMENT_UPLOAD_DIR || path.join(process.cwd(), 'uploads'), 'parts-bills')
const fileTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

interface PartsBillFileRouteProps {
  params: Promise<{ filename: string }>
}

export async function GET(_request: Request, { params }: PartsBillFileRouteProps) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  const { filename } = await params
  if (!/^[a-f0-9-]{36}\.(pdf|jpg|png|webp)$/i.test(filename)) {
    return NextResponse.json({ error: 'Bill not found.' }, { status: 404 })
  }

  try {
    const bytes = await readFile(path.join(uploadDirectory, filename))
    const extension = path.extname(filename).toLowerCase()
    return new NextResponse(bytes, {
      headers: {
        'Content-Type': fileTypes[extension],
        'Content-Length': String(bytes.length),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Bill not found.' }, { status: 404 })
    }
    console.error('Failed to read parts bill', error)
    return NextResponse.json({ error: 'Could not open the bill file.' }, { status: 500 })
  }
}
