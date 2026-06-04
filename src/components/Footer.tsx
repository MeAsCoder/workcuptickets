import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default function Footer() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-xl font-extrabold tracking-tight">
                Touch<span className="text-brand">line</span>26
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-cream/50">
                Reliable. Secure. Enjoy the match.
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            Reserved-seat resale for the 2026 tournament. Pick your seats, hold them while you
            settle up over WhatsApp, and receive QR tickets the moment payment is confirmed.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-lime">Legal</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li><Link href="/terms" className="hover:text-lime">Terms of service</Link></li>
            <li><Link href="/privacy" className="hover:text-lime">Privacy policy</Link></li>
            <li><Link href="/disclaimer" className="hover:text-lime">Reseller disclaimer</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-lime">Support</h4>
          <ul className="mt-4 space-y-2 text-sm text-cream/70">
            <li>WhatsApp: {wa || '—'}</li>
            <li><Link href="/matches" className="hover:text-lime">Browse matches</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-cream/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Touchline26. Independent reseller — not affiliated with FIFA.</p>
        </div>
      </div>
    </footer>
  )
}