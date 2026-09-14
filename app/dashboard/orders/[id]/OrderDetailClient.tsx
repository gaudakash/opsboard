'use client'

import { useOptimistic, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateOrderStatus } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Package, User, MapPin, CheckCircle2 } from 'lucide-react'

interface OrderDetailProps {
  params: Promise<{ id: string }>
  initialOrder: any
}

export default function OrderDetailPage({ params, initialOrder }: OrderDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // React 19 / Next.js optimistic state for instant UI updates
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    initialOrder?.status || 'pending',
    (state, newStatus: string) => newStatus
  )

  if (!initialOrder) {
    return <div className="p-6 text-center text-slate-500">Order not found.</div>
  }

  const handleStatusChange = async (newStatus: string) => {
    setSuccessMessage(null)
    startTransition(async () => {
      // 1. Instantly update UI optimistically
      setOptimisticStatus(newStatus)

      // 2. Call server action
      const result = await updateOrderStatus(initialOrder.id, newStatus)
      if (result?.error) {
        alert('Failed to update status: ' + result.error)
      } else {
        setSuccessMessage('Order status updated successfully!')
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Order #{initialOrder.order_number}</h2>
            <p className="text-xs text-slate-500">Placed on {new Date(initialOrder.created_at).toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">Status:</span>
          <select
            value={optimisticStatus}
            disabled={isPending}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" /> Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm border">
                  <div>
                    <p className="font-semibold text-slate-800">Wireless Mechanical Keyboard (Sample Item)</p>
                    <p className="text-xs text-slate-500">SKU: SKU-KB-001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹5,998.00</p>
                    <p className="text-xs text-slate-500">Qty: 1</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{Number(initialOrder.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 text-base pt-2 border-t">
                    <span>Total Amount</span>
                    <span>₹{Number(initialOrder.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Shipping Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-slate-600">
              <p className="font-semibold text-slate-800">{initialOrder.shipping_first_name} {initialOrder.shipping_last_name}</p>
              <p>{initialOrder.shipping_email}</p>
              <p>{initialOrder.shipping_phone}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-slate-600">
              <p>{initialOrder.shipping_address_line1}</p>
              <p>{initialOrder.shipping_city}, {initialOrder.shipping_state} - {initialOrder.shipping_postal_code}</p>
              <p>{initialOrder.shipping_country}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}