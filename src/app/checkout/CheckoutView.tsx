'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { usePrice } from '@/components/providers/Preferences'
import { MessageCircle, Copy, Check, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  reference: string
  total: number
  status: string
  expiresAt: string
  email: string
}

export default function CheckoutView({
  order,
  seats,
  matchTitle,
  stadium,
}: {
  order: Order
  seats: { label: string; category: string; price: number }[]
  matchTitle: string
  stadium: string
}) {
  const fmt = usePrice()
  const [remaining, setRemaining] = useState(() => msLeft(order.expiresAt))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setRemaining(msLeft(order.expiresAt)), 1000)
    return () => clearInterval(t)
  }, [order.expiresAt])

  const expired = remaining <= 0
  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

 const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const message = [
    `Hello Touchline26 Support,`,
    ``,
    `I'd like to complete payment for my World Cup 2026 ticket order.`,
    ``,
    `• Order code: ${order.reference}`,
    `• Match: ${matchTitle}`,
    `• Venue: ${stadium}`,
    `• Seats: ${seats.map((s) => s.label).join(', ')}`,
    `• Total due: ${fmt(order.total)}`,
    `• Account email: ${order.email}`,
    ``,
    `Please share the available payment options. Thank you!`,
  ].join('\n')
  const waUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`

  async function copyRef() {
    await navigator.clipboard.writeText(order.reference)
    setCopied(true)
    toast.success('Order code copied')
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-extrabold">Almost there</h1>
        <p className="mt-2 text-ink-600">Pay over WhatsApp using your order code. Tickets arrive by email once confirmed.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr,260px]">
          <div className="rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-ink-500">Order code</p>
                <p className="font-display text-2xl font-extrabold tracking-wide">{order.reference}</p>
              </div>
              <button onClick={copyRef} className="inline-flex items-center gap-1.5 rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold hover:bg-ink/5">
                {copied ? <Check className="h-4 w-4 text-pitch" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="mt-6">
              <p className="font-display text-lg font-bold">{matchTitle}</p>
              <p className="text-sm text-ink-500">{stadium}</p>
            </div>

            <ul className="mt-4 divide-y divide-ink/10 rounded-xl border border-ink/10">
              {seats.map((s, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span><strong>{s.label}</strong> <span className="text-ink-500">· {s.category}</span></span>
                  <span className="font-semibold">{fmt(s.price)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-4">
              <span className="font-semibold">Total due</span>
              <span className="font-display text-2xl font-extrabold">{fmt(order.total)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 text-center shadow-card ${expired ? 'border-rose-200 bg-rose-50' : 'border-ink/10 bg-white/80'}`}>
              <p className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-ink-500">
                <Clock className="h-3.5 w-3.5" /> Hold expires in
              </p>
              <p className={`mt-1 font-display text-3xl font-extrabold tabular-nums ${expired ? 'text-rose-600' : 'text-ink'}`}>
                {expired ? '00:00' : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
              </p>
              {expired && <p className="mt-1 text-xs text-rose-600">Seats released. Please re-select.</p>}
            </div>

            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="accent" size="lg" className="w-full" disabled={expired}>
                <MessageCircle className="h-5 w-5" /> Pay via WhatsApp
              </Button>
            </a>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="lg" className="w-full">View my orders</Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-ink/10 bg-pitch-50/50 p-6 text-sm text-ink-700">
          <h3 className="font-display text-base font-bold">How payment works</h3>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5">
            <li>Tap “Pay via WhatsApp” — your order details are pre-filled.</li>
            <li>Our team replies with payment options (bank transfer, wallet, cash).</li>
            <li>Once confirmed, each seat gets a QR ticket emailed to {order.email}.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

function msLeft(iso: string) {
  return Math.max(0, new Date(iso).getTime() - Date.now())
}
