'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatMoney, formatDate } from '@/lib/utils'
import { ORDER_STATUS_META } from '@/lib/constants'

interface Order {
  id: string
  reference: string
  email: string
  total: number
  status: string
  createdAt: string
  match: string
  seatLabels: string[]
}

export default function AdminOrders({ orders: initial }: { orders: Order[] }) {
  const router = useRouter()
  const [orders, setOrders] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)

  async function act(id: string, action: 'confirm' | 'cancel') {
    if (action === 'cancel' && !confirm('Cancel this order and release its seats?')) return
    setBusy(id)
    const res = await fetch(`/api/admin/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: id, action }),
    })
    setBusy(null)
    if (res.ok) {
      const next = action === 'confirm' ? 'ISSUED' : 'CANCELLED'
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: next } : x)))
      toast.success(action === 'confirm' ? 'Payment confirmed — tickets issued' : 'Order cancelled')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Action failed')
    }
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-ink/5 text-left text-xs uppercase tracking-wider text-ink-500">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Match</th>
              <th className="px-5 py-3">Seats</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orders.map((o) => {
              const meta = ORDER_STATUS_META[o.status] ?? { label: o.status, className: 'bg-ink/10 text-ink-600 ring-ink/10' }
              return (
                <tr key={o.id} className="hover:bg-cream/60">
                  <td className="px-5 py-3 font-mono font-semibold">{o.reference}<div className="text-xs font-normal text-ink-500">{formatDate(o.createdAt)}</div></td>
                  <td className="px-5 py-3">{o.email}</td>
                  <td className="px-5 py-3">{o.match}</td>
                  <td className="px-5 py-3 text-ink-500">{o.seatLabels.join(', ')}</td>
                  <td className="px-5 py-3 font-semibold">{formatMoney(o.total)}</td>
                  <td className="px-5 py-3"><Badge className={meta.className}>{meta.label}</Badge></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {o.status === 'PENDING_PAYMENT' && (
                        <>
                          <Button size="sm" disabled={busy === o.id} onClick={() => act(o.id, 'confirm')}>Confirm</Button>
                          <Button size="sm" variant="ghost" className="text-rose-600" disabled={busy === o.id} onClick={() => act(o.id, 'cancel')}>Cancel</Button>
                        </>
                      )}
                      {o.status !== 'PENDING_PAYMENT' && <span className="text-xs text-ink-400">—</span>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
