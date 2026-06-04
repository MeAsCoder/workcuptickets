'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { formatDate, formatTime } from '@/lib/utils'
import { usePrice } from '@/components/providers/Preferences'
import { Trash2, Loader2, Clock } from 'lucide-react'

interface Row {
  cartItemId: string
  seatId: string
  label: string
  category: string
  price: number
  match: string
  stadium: string
  date: string
}

export default function CartView({ initial }: { initial: Row[] }) {
  const router = useRouter()
  const fmt = usePrice()
  const [rows, setRows] = useState<Row[]>(initial)
  const [busy, setBusy] = useState(false)

  const total = rows.reduce((sum, r) => sum + r.price, 0)

  async function remove(cartItemId: string) {
    setBusy(true)
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItemId }),
    })
    setBusy(false)
    if (res.ok) {
      setRows((r) => r.filter((x) => x.cartItemId !== cartItemId))
      toast.success('Seat released')
      router.refresh()
    } else {
      toast.error('Could not remove seat')
    }
  }

  async function checkout() {
    setBusy(true)
    const res = await fetch('/api/orders', { method: 'POST' })
    setBusy(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/checkout?order=${data.id}`)
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Could not start checkout')
      router.refresh()
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,340px]">
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <Clock className="h-4 w-4" /> These seats are held for you. Complete checkout to lock in your 30-minute payment window.
        </div>
        {rows.map((r) => (
          <div key={r.cartItemId} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-card">
            <div>
              <p className="font-display text-lg font-bold">{r.match}</p>
              <p className="mt-0.5 text-sm text-ink-500">{formatDate(r.date)} · {formatTime(r.date)} · {r.stadium}</p>
              <p className="mt-2 text-sm">
                <span className="chip bg-pitch-50 text-pitch-dark ring-pitch/20">Seat {r.label}</span>
                <span className="ml-2 text-ink-500">{r.category}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-display text-lg font-bold">{fmt(r.price)}</span>
              <button
                onClick={() => remove(r.cartItemId)}
                disabled={busy}
                className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-ink/10 bg-white/90 p-6 shadow-card">
          <h3 className="font-display text-lg font-extrabold">Order summary</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Seats</span><span>{rows.length}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Service fee</span><span>Included</span></div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-extrabold">{fmt(total)}</span>
          </div>
          <Button onClick={checkout} size="lg" className="mt-5 w-full" disabled={busy || rows.length === 0}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Proceed to checkout'}
          </Button>
        </div>
      </aside>
    </div>
  )
}
