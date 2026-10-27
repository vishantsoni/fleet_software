import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const where: any = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count({ where }),
    ])

    return NextResponse.json({
      drivers: drivers.map((d) => ({
        ...d,
        baseSalary: Number(d.baseSalary),
      })),
      total,
      page,
      limit,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const driver = await prisma.driver.create({
      data: {
        fullName: body.fullName,
        licenseNumber: body.licenseNumber,
        licenseExpiry: new Date(body.licenseExpiry),
        phone: body.phone || null,
        address: body.address || null,
        baseSalary: body.baseSalary || 0,
        aadharNumber: body.aadharNumber || null,
      },
    })

    return NextResponse.json({
      ...driver,
      baseSalary: Number(driver.baseSalary),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  }
}
