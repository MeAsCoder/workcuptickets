import Link from 'next/link'
import { Ticket } from 'lucide-react'

export default function Footer() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold">Touchline26</span>
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
          <p>© {new Date().getFullYear()} Touchline26. Independent reseller — affiliated with FIFA.</p>
          
        </div>
      </div>
    </footer>
  )
}
