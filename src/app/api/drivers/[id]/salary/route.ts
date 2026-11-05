import { NextRequest, NextResponse } from 'next/server'
import {
  addDriverAdvance,
  getDriverSalarySummary,
  settleDriverSalary,
} from '@/server/actions/drivers/salary'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

interface RouteParams {
  params: Promise<{ id: string }>
}

function getErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues[0]?.message || 'Invalid salary details.' }, { status: 400 })
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'This salary month has already been settled.' }, { status: 409 })
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Driver not found.' }, { status: 404 })
    }
    console.error('Driver salary database request failed:', error)
    return NextResponse.json({ error: 'Could not process driver salary request.' }, { status: 500 })
  }
  if (error instanceof Error) {
    const status = error.message === 'Driver not found.' ? 404 : 400
    return NextResponse.json({ error: error.message }, { status })
  }
  console.error('Driver salary request failed:', error)
  return NextResponse.json({ error: 'Could not process driver salary request.' }, { status: 500 })
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const month = request.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
    return NextResponse.json(await getDriverSalarySummary(id, month))
  } catch (error) {
    return getErrorResponse(error)
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    if (typeof body.month !== 'string') {
      return NextResponse.json({ error: 'Choose a salary month.' }, { status: 400 })
    }

    if (body.action === 'add-advance') {
      await addDriverAdvance(id, body, body.month)
      return NextResponse.json({ success: true })
    }
    if (body.action === 'settle-salary') {
      await settleDriverSalary(id, body.month)
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Choose a valid salary action.' }, { status: 400 })
  } catch (error) {
    return getErrorResponse(error)
  }
}
