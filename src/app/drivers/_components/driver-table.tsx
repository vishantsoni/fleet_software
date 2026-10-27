'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDriverAction, deleteDriverAction } from '@/server/actions/drivers'
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
import { ArrowUpDown, Pencil, Trash2, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Driver = {
  id: string
  fullName: string
  licenseNumber: string
  licenseExpiry: string | Date
  phone: string | null
  status: string
}

interface DriverTableProps {
  data: Driver[]
}

export function DriverTable({ data }: DriverTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const columns: ColumnDef<Driver>[] = [
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'licenseNumber',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          License Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.getValue('phone') || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            variant={
              status === 'ACTIVE'
                ? 'success'
                : status === 'INACTIVE'
                ? 'secondary'
                : 'outline'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const driver = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/drivers/${driver.id}`)}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/drivers/${driver.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (confirm('Are you sure you want to deactivate this driver?')) {
                  setDeletingId(driver.id)
                  await deleteDriverAction(driver.id)
                  setDeletingId(null)
                  router.refresh()
                }
              }}
              disabled={deletingId === driver.id}
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
                    No drivers found.
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
            No drivers found.
          </div>
        ) : (
          data.map((driver) => (
            <div key={driver.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{driver.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{driver.licenseNumber}</p>
                </div>
                <Badge
                  variant={
                    driver.status === 'ACTIVE'
                      ? 'success'
                      : driver.status === 'INACTIVE'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {driver.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Phone:</span> {driver.phone || '-'}
                </div>
                <div>
                  <span className="text-muted-foreground">License Expiry:</span> {new Date(driver.licenseExpiry).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/drivers/${driver.id}`)}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/drivers/${driver.id}/edit`)}
                  className="flex-1"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to deactivate this driver?')) {
                      setDeletingId(driver.id)
                      await deleteDriverAction(driver.id)
                      setDeletingId(null)
                      router.refresh()
                    }
                  }}
                  disabled={deletingId === driver.id}
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