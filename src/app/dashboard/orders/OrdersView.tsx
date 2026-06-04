'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { usePrice } from '@/components/providers/Preferences'
import { ORDER_STATUS_META } from '@/lib/constants'
import { Ticket, MessageCircle } from 'lucide-react'

interface Order {
  id: string
  reference: string
  total: number
  status: string
  createdAt: string
  expiresAt: string
  match: string
  seatCount: number
  seatLabels: string[]
}

export default function OrdersView({ orders: initial }: { orders: Order[] }) {
  const router = useRouter()
  const fmt = usePrice()
  const [orders, setOrders] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)

  async function cancel(id: string) {
    if (!confirm('Cancel this order? Your seats will be released.')) return
    setBusy(id)
    const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' })
    setBusy(null)
    if (res.ok) {
      setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: 'CANCELLED' } : x)))
      toast.success('Order cancelled')
      router.refresh()
    } else {
      toast.error('Could not cancel')
    }
  }

  return (
    <div className="mt-8 space-y-4">
      {orders.map((o) => {
        const meta = ORDER_STATUS_META[o.status] ?? { label: o.status, className: 'bg-ink/10 text-ink-600 ring-ink/10' }
        return (
          <div key={o.id} className="rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-ink-500">{o.reference}</span>
                  <Badge className={meta.className}>{meta.label}</Badge>
                </div>
                <p className="mt-2 font-display text-lg font-bold">{o.match}</p>
                <p className="mt-1 text-sm text-ink-500">
                  {formatDate(o.createdAt)} · {o.seatCount} seat(s): {o.seatLabels.join(', ')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-extrabold">{fmt(o.total)}</p>
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  {o.status === 'PENDING_PAYMENT' && (
                    <>
                      <Link href={`/checkout?order=${o.id}`}>
                        <Button size="sm" variant="accent"><MessageCircle className="h-4 w-4" /> Pay now</Button>
                      </Link>
                      <Button size="sm" variant="ghost" className="text-rose-600" disabled={busy === o.id} onClick={() => cancel(o.id)}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {o.status === 'ISSUED' && (
                    <Link href={`/dashboard/tickets/${o.id}`}>
                      <Button size="sm"><Ticket className="h-4 w-4" /> View tickets</Button>
                    </Link>
                  )}
                  {o.status === 'CONFIRMED' && (
                    <span className="text-sm text-ink-500">Tickets being issued…</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
