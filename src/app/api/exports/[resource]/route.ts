import ExcelJS from 'exceljs'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/server/auth/options'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

type ExportValue = string | number | Date | null
type ExportRow = Record<string, ExportValue>
type ExportColumn = { header: string; key: string; width: number }

async function createWorkbook(
  filename: string,
  sheetName: string,
  columns: ExportColumn[],
  rows: ExportRow[]
) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)
  worksheet.columns = columns
  worksheet.addRows(rows)
  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' },
  }
  worksheet.autoFilter = {
    from: 'A1',
    to: `${String.fromCharCode(64 + columns.length)}1`,
  }

  const file = Buffer.from(await workbook.xlsx.writeBuffer())
  return new NextResponse(file, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}

export async function GET(request: NextRequest, { params }: { params: { resource: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams

    if (params.resource === 'vehicles') {
      const search = searchParams.get('search')
      const ownerType = searchParams.get('ownerType')
      const status = searchParams.get('status')
      const where: Record<string, unknown> = {}

      if (search) {
        where.OR = [
          { vehicleNo: { contains: search, mode: 'insensitive' } },
          { makeModel: { contains: search, mode: 'insensitive' } },
        ]
      }
      if (ownerType === 'OWNED' || ownerType === 'MARKET') where.ownerType = ownerType
      if (status) where.status = status

      const vehicles = await prisma.vehicle.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      return createWorkbook('vehicles.xlsx', 'Vehicles', [
        { header: 'Vehicle No', key: 'vehicleNo', width: 18 },
        { header: 'Make/Model', key: 'makeModel', width: 24 },
        { header: 'Year', key: 'year', width: 10 },
        { header: 'Registration Date', key: 'registrationDate', width: 18 },
        { header: 'Capacity (T)', key: 'capacityTonnage', width: 14 },
        { header: 'Owner Type', key: 'ownerType', width: 14 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Odometer (km)', key: 'currentOdometer', width: 16 },
        { header: 'Engine Ref', key: 'engineRef', width: 20 },
        { header: 'Chassis Ref', key: 'chassisRef', width: 20 },
      ], vehicles.map((vehicle) => ({
        vehicleNo: vehicle.vehicleNo,
        makeModel: vehicle.makeModel,
        year: vehicle.year,
        registrationDate: vehicle.registrationDate,
        capacityTonnage: Number(vehicle.capacityTonnage),
        ownerType: vehicle.ownerType,
        status: vehicle.status,
        currentOdometer: vehicle.currentOdometer,
        engineRef: vehicle.engineRef,
        chassisRef: vehicle.chassisRef,
      })))
    }

    if (params.resource === 'drivers') {
      const search = searchParams.get('search')
      const status = searchParams.get('status')
      const where: Record<string, unknown> = {}

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: 'insensitive' } },
          { licenseNumber: { contains: search, mode: 'insensitive' } },
        ]
      }
      if (status) where.status = status

      const drivers = await prisma.driver.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      })

      return createWorkbook('drivers.xlsx', 'Drivers', [
        { header: 'Name', key: 'fullName', width: 24 },
        { header: 'License Number', key: 'licenseNumber', width: 22 },
        { header: 'License Expiry', key: 'licenseExpiry', width: 18 },
        { header: 'Phone', key: 'phone', width: 18 },
        { header: 'Status', key: 'status', width: 14 },
      ], drivers.map((driver) => ({
        fullName: driver.fullName,
        licenseNumber: driver.licenseNumber,
        licenseExpiry: driver.licenseExpiry,
        phone: driver.phone,
        status: driver.status,
      })))
    }

    if (params.resource === 'trips') {
      const trips = await prisma.trip.findMany({
        orderBy: { tripDate: 'desc' },
        include: {
          vehicle: { select: { vehicleNo: true, makeModel: true } },
          driver: { select: { fullName: true } },
          customer: { select: { name: true } },
        },
      })

      return createWorkbook('trips.xlsx', 'Trips', [
        { header: 'Date', key: 'tripDate', width: 18 },
        { header: 'Vehicle No', key: 'vehicleNo', width: 18 },
        { header: 'Vehicle Model', key: 'vehicleModel', width: 24 },
        { header: 'Driver', key: 'driver', width: 24 },
        { header: 'Party Name', key: 'partyName', width: 24 },
        { header: 'Docket No', key: 'socketNo', width: 18 },
        { header: 'POD Status', key: 'podStatus', width: 16 },
        { header: 'Origin', key: 'origin', width: 22 },
        { header: 'Destination', key: 'destination', width: 22 },
        { header: 'KM', key: 'totalKm', width: 12 },
        { header: 'Freight Amount', key: 'freightAmount', width: 18 },
        { header: 'Revenue', key: 'revenue', width: 18 },
        { header: 'Advance', key: 'advance', width: 16 },
        { header: 'Commission Deduct', key: 'commissionDeduct', width: 20 },
        { header: 'Balance', key: 'balance', width: 16 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Trip Type', key: 'tripType', width: 20 },
      ], trips.map((trip) => ({
        tripDate: trip.tripDate,
        vehicleNo: trip.vehicle.vehicleNo,
        vehicleModel: trip.vehicle.makeModel,
        driver: trip.driver.fullName,
        partyName: trip.partyName || trip.customer?.name || '',
        socketNo: trip.socketNo,
        podStatus: trip.podStatus,
        origin: trip.origin,
        destination: trip.destination,
        totalKm: Number(trip.totalKm),
        freightAmount: Number(trip.freightAmount),
        revenue: Number(trip.revenue),
        advance: Number(trip.advance),
        commissionDeduct: Number(trip.commissionDeduct),
        balance: Number(trip.revenue) - Number(trip.advance) - Number(trip.commissionDeduct),
        status: trip.status,
        tripType: trip.tripType,
      })))
    }

    return NextResponse.json({ error: 'Export type not found.' }, { status: 404 })
  } catch (error) {
    console.error(`Failed to export ${params.resource}`, error)
    return NextResponse.json({ error: 'Could not create the Excel file.' }, { status: 500 })
  }
}
