'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react'
import { deleteProduct } from '@/app/dashboard/products/actions'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  status: string
  images: string[]
  categories?: { name: string }
}

interface ProductsTableProps {
  initialProducts: Product[]
  categories: { id: string; name: string }[]
  totalCount: number
  isAdmin: boolean
}

export default function ProductsTable({
  initialProducts,
  categories,
  totalCount,
  isAdmin,
}: ProductsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Update URL search params for filtering
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1') // reset to page 1 on filter change
    router.push(`/dashboard/products?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setDeletingId(id)
    setErrorMessage(null)

    const result = await deleteProduct(id)
    if (result?.error) {
      setErrorMessage(result.error)
    }
    setDeletingId(null)
  }

  // TanStack Table columns definition
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-3">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-10 w-10 rounded-md object-cover border"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                No img
              </div>
            )}
            <div>
              <div className="font-medium text-slate-900">{product.name}</div>
              <div className="text-xs text-slate-500">{product.sku}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'categories.name',
      header: 'Category',
      cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.categories?.name || 'Uncategorized'}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => <span className="font-medium">₹{Number(row.original.price).toLocaleString('en-IN')}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.original.stock
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            stock > 10 ? 'bg-emerald-50 text-emerald-700' : stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {stock} in stock
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant={status === 'published' ? 'default' : 'secondary'} className="capitalize">
            {status}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/products/${product.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              {isAdmin ? (
                <DropdownMenuItem
                  onClick={() => handleDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="flex items-center gap-2 text-rose-600 focus:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" /> {deletingId === product.id ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem disabled className="text-slate-400 text-xs">
                  🔒 Delete (Admin only)
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
  data: initialProducts,
  columns,
  getCoreRowModel: getCoreRowModel(),
})

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
          {errorMessage}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              updateFilters('search', e.target.value)
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              updateFilters('category', e.target.value)
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value)
              updateFilters('status', e.target.value)
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}