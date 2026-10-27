import { NextRequest, NextResponse } from 'next/server'
import { removeTyre, scrapTyre, getTyre } from '@/server/actions/tyres'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const tyre = await getTyre(id)
    return NextResponse.json(tyre)
  } catch (error) {
    console.error('Failed to fetch tyre:', error)
    if (error instanceof Error && error.message === 'Tyre not found') {
      return NextResponse.json({ error: 'Tyre not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to fetch tyre' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await getTyre(id)
    if (!existing) {
      return NextResponse.json({ error: 'Tyre not found' }, { status: 404 })
    }

    const { removeTyre: _, scrapTyre: __, getTyre: ___, fitTyre, listTyres: ____ } = await import('@/server/actions/tyres')
    
    const updated = await fitTyre({ ...body, id })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update tyre:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update tyre' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { scrapTyre } = await import('@/server/actions/tyres')
    
    await scrapTyre(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tyre:', error)
    if (error instanceof Error && error.message === 'Tyre not found') {
      return NextResponse.json({ error: 'Tyre not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete tyre' }, { status: 500 })
  }
}