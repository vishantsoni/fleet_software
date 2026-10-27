'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteVehicleAction } from '@/server/actions/vehicles'
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
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react'

type Vehicle = {
  id: string
  vehicleNo: string
  makeModel: string
  year: number
  capacityTonnage: number
  ownerType: string
  status: string
  currentOdometer: number
}

interface VehicleTableProps {
  data: Vehicle[]
}

export function VehicleTable({ data }: VehicleTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: 'vehicleNo',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Vehicle No
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'makeModel',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Make/Model
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'year',
      header: 'Year',
      cell: ({ row }) => row.getValue('year'),
    },
    {
      accessorKey: 'capacityTonnage',
      header: 'Capacity (T)',
      cell: ({ row }) => `${row.getValue('capacityTonnage')} t`,
    },
    {
      accessorKey: 'ownerType',
      header: 'Owner Type',
      cell: ({ row }) => row.getValue('ownerType'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'currentOdometer',
      header: 'Odometer',
      cell: ({ row }) => `${row.getValue('currentOdometer')} km`,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const vehicle = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/vehicles/${vehicle.id}`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (confirm('Are you sure you want to delete this vehicle?')) {
                  setDeletingId(vehicle.id)
                  const result = await deleteVehicleAction(vehicle.id)
                  setDeletingId(null)
                  if (result.success) {
                    router.refresh()
                  } else {
                    alert(result.error || 'Failed to delete vehicle')
                  }
                }
              }}
              disabled={deletingId === vehicle.id}
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
                    No vehicles found.
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
            No vehicles found.
          </div>
        ) : (
          data.map((vehicle) => (
            <div key={vehicle.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{vehicle.vehicleNo}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.makeModel}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  vehicle.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Year:</span> {vehicle.year}
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span> {vehicle.capacityTonnage} t
                </div>
                <div>
                  <span className="text-muted-foreground">Owner:</span> {vehicle.ownerType}
                </div>
                <div>
                  <span className="text-muted-foreground">Odometer:</span> {vehicle.currentOdometer} km
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this vehicle?')) {
                      setDeletingId(vehicle.id)
                      const result = await deleteVehicleAction(vehicle.id)
                      setDeletingId(null)
                      if (result.success) {
                        router.refresh()
                      } else {
                        alert(result.error || 'Failed to delete vehicle')
                      }
                    }
                  }}
                  disabled={deletingId === vehicle.id}
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
