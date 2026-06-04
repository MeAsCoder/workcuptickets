'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/Button'
import { Printer } from 'lucide-react'

interface Ticket {
  id: string
  seat: string
  row: string
  number: number
  category: string
  payload: string
}

export default function TicketStubs({
  tickets,
  reference,
  matchTitle,
  flags,
  stage,
  stadium,
  dateLine,
}: {
  tickets: Ticket[]
  reference: string
  matchTitle: string
  flags: string
  stage: string
  stadium: string
  dateLine: string
}) {
  const [qr, setQr] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    Promise.all(
      tickets.map(async (t) => {
        const url = await QRCode.toDataURL(t.payload, {
          width: 320,
          margin: 1,
          color: { dark: '#11150f', light: '#ffffff' },
        })
        return [t.id, url] as const
      }),
    ).then((entries) => {
      if (active) setQr(Object.fromEntries(entries))
    })
    return () => {
      active = false
    }
  }, [tickets])

  return (
    <div>
      <div className="no-print mt-4">
        <Button onClick={() => window.print()} variant="outline">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>

      <div className="print-area mt-6 grid gap-5 sm:grid-cols-2">
        {tickets.map((t) => (
          <div key={t.id} className="overflow-hidden rounded-3xl border border-ink/15 bg-white shadow-card">
            <div className="flex items-center justify-between bg-ink px-5 py-3 text-cream">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-lime">{stage || 'Match Pass'}</span>
              <span className="font-mono text-xs text-cream/80">{reference}</span>
            </div>
            <div className="flex">
              <div className="flex-1 p-5">
                <div className="text-2xl">{flags}</div>
                <h3 className="mt-1 font-display text-xl font-extrabold leading-tight">{matchTitle}</h3>
                <p className="mt-1 text-sm text-ink-500">{stadium}</p>
                <p className="text-sm text-ink-500">{dateLine}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Cell label="Section" value={t.category.replace('Category ', 'C')} />
                  <Cell label="Row" value={t.row} />
                  <Cell label="Seat" value={String(t.number)} />
                </div>
              </div>
              <div className="relative flex w-32 flex-col items-center justify-center border-l border-dashed border-ink/25 p-4 text-ink">
                <span className="ticket-perf absolute left-0 top-0 h-full w-1 text-ink/20" />
                {qr[t.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr[t.id]} alt={`QR for seat ${t.seat}`} className="h-24 w-24" />
                ) : (
                  <div className="h-24 w-24 animate-pulse rounded bg-ink/10" />
                )}
                <span className="mt-2 font-display text-lg font-extrabold">{t.seat}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="no-print mt-6 text-center text-sm text-ink-500">
        Each QR is unique to one seat. Screenshots are fine — staff scan the code at the gate.
      </p>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream py-2">
      <p className="text-[10px] uppercase tracking-widest text-ink-500">{label}</p>
      <p className="font-display text-lg font-extrabold">{value}</p>
    </div>
  )
}
