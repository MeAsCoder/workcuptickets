'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import SeatMap, { type SeatVM } from '@/components/SeatMap'
import { Button } from '@/components/ui/Button'
import { usePrice } from '@/components/providers/Preferences'
import { MAX_SEATS_PER_ORDER } from '@/lib/constants'
import { Loader2 } from 'lucide-react'

export default function SeatSelection({
  matchId,
  seats,
  isAuthed,
}: {
  matchId: string
  seats: SeatVM[]
  isAuthed: boolean
}) {
  const router = useRouter()
  const fmt = usePrice()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const selectedSeats = seats.filter((s) => selected.includes(s.id))
  const total = selectedSeats.reduce((sum, s) => sum + s.price, 0)

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function addToCart() {
    if (selected.length === 0) {
      toast.error('Select at least one seat')
      return
    }
    if (!isAuthed) {
      toast('Sign in to reserve seats')
      router.push(`/login?redirect=/matches/${matchId}`)
      return
    }
    setLoading(true)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seatIds: selected }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Added to cart')
      router.push('/cart')
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Could not add to cart')
      router.refresh()
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      <SeatMap seats={seats} selected={selected} onToggle={toggle} maxSelect={MAX_SEATS_PER_ORDER} />

      {/* Summary */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-ink/10 bg-white/90 p-5 shadow-card">
          <h3 className="font-display text-lg font-extrabold">Your selection</h3>
          {selectedSeats.length === 0 ? (
            <p className="mt-3 text-sm text-ink-500">No seats selected yet. Tap seats on the map to begin.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {selectedSeats.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-lg bg-cream px-3 py-2 text-sm">
                  <span className="font-semibold">
                    {s.row}{s.number} <span className="font-normal text-ink-500">· {s.categoryName}</span>
                  </span>
                  <span className="font-semibold">{fmt(s.price)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="text-sm text-ink-500">{selectedSeats.length} seat(s)</span>
            <span className="font-display text-xl font-extrabold">{fmt(total)}</span>
          </div>
          <Button onClick={addToCart} size="lg" className="mt-4 w-full" disabled={loading || selected.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reserve & continue'}
          </Button>
          <p className="mt-2 text-center text-xs text-ink-500">Up to {MAX_SEATS_PER_ORDER} seats per order</p>
        </div>
      </aside>
    </div>
  )
}
