'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteFuelEntryAction } from '@/server/actions/fuel'
import { formatCurrency, formatNumber, formatDate } from '@/server/utils/formatters'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableContainer,
} from '@/components/ui/table'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Trash2, Edit3 } from 'lucide-react'

type FuelEntry = {
  id: string
  entryDate: string | Date
  vehicle: { id: string; vehicleNo: string; makeModel: string } | null
  station: string
  fuelType: string
  litres: number
  ratePerLitre: number
  totalAmount: number
  odometerReading: number
  kmSinceLastFill: number
  fuelEconomy?: number
}

interface FuelTableProps {
  data: FuelEntry[]
}

export function FuelTable({ data }: FuelTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const columns: ColumnDef<FuelEntry>[] = [
    {
      accessorKey: 'entryDate',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.getValue('entryDate')),
    },
    {
      accessorKey: 'vehicle',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Vehicle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const vehicle = row.getValue('vehicle') as FuelEntry['vehicle']
        return vehicle ? `${vehicle.vehicleNo} - ${vehicle.makeModel}` : '-'
      },
    },
    {
      accessorKey: 'station',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Station
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'fuelType',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Fuel Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const type = row.getValue('fuelType') as string
        const colors: Record<string, string> = {
          DIESEL: 'bg-blue-100 text-blue-800',
          PETROL: 'bg-green-100 text-green-800',
          CNG: 'bg-yellow-100 text-yellow-800',
          ELECTRIC: 'bg-purple-100 text-purple-800',
        }
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
            {type}
          </span>
        )
      },
    },
    {
      accessorKey: 'litres',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Litres
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatNumber(row.getValue('litres'), 2),
    },
    {
      accessorKey: 'ratePerLitre',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Rate/L
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue('ratePerLitre')),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatCurrency(row.getValue('totalAmount')),
    },
    {
      accessorKey: 'odometerReading',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Odometer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => `${formatNumber(row.getValue('odometerReading'), 0)} km`,
    },
    {
      accessorKey: 'kmSinceLastFill',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          KM Since Fill
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatNumber(row.getValue('kmSinceLastFill'), 2),
    },
    {
      accessorKey: 'fuelEconomy',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Economy (km/L)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const economy = row.getValue('fuelEconomy') as number | undefined
        return economy !== undefined ? formatNumber(economy, 2) : '-'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const entry = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/fuel/${entry.id}/edit`)}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this fuel entry?')) {
                  setDeletingId(entry.id)
                  await deleteFuelEntryAction(entry.id)
                  setDeletingId(null)
                  router.refresh()
                }
              }}
              disabled={deletingId === entry.id}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    initialState: { pagination: { pageSize: 10 } },
  })

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <TableContainer>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No fuel entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            No fuel entries found.
          </div>
        ) : (
          data.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{entry.vehicle ? `${entry.vehicle.vehicleNo}` : '-'}</p>
                  <p className="text-sm text-muted-foreground">{entry.vehicle?.makeModel}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(entry.entryDate)}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  entry.fuelType === 'DIESEL' ? 'bg-blue-100 text-blue-800' :
                  entry.fuelType === 'PETROL' ? 'bg-green-100 text-green-800' :
                  entry.fuelType === 'CNG' ? 'bg-yellow-100 text-yellow-800' :
                  entry.fuelType === 'ELECTRIC' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {entry.fuelType}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Station:</span> {entry.station}
                </div>
                <div>
                  <span className="text-muted-foreground">Litres:</span> {formatNumber(entry.litres, 2)}
                </div>
                <div>
                  <span className="text-muted-foreground">Rate/L:</span> {formatCurrency(entry.ratePerLitre)}
                </div>
                <div className="font-semibold">
                  <span className="text-muted-foreground font-normal">Total:</span> {formatCurrency(entry.totalAmount)}
                </div>
                <div>
                  <span className="text-muted-foreground">Odometer:</span> {formatNumber(entry.odometerReading, 0)} km
                </div>
                <div>
                  <span className="text-muted-foreground">Economy:</span> {entry.fuelEconomy !== undefined ? `${formatNumber(entry.fuelEconomy, 2)} km/L` : '-'}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/fuel/${entry.id}/edit`)}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this fuel entry?')) {
                      setDeletingId(entry.id)
                      await deleteFuelEntryAction(entry.id)
                      setDeletingId(null)
                      router.refresh()
                    }
                  }}
                  disabled={deletingId === entry.id}
                  className="flex-1 text-red-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}