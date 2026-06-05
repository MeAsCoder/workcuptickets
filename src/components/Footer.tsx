import Link from 'next/link'
import { Ticket, MapPin, ShieldCheck, Star } from 'lucide-react'

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.82 9.82 0 001.519 5.256l-.999 3.648 3.969-1.043zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

export default function Footer() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+15736913098'
  const waDigits = wa.replace(/[^0-9]/g, '')
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    "Hello Touchline26 Support, I'd like help with World Cup 2026 tickets.",
  )}`
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-cream">
      {/* brand red top rule, echoing the navbar nav row */}
      <div className="h-1 w-full bg-brand" />

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.5fr,1fr,1fr,1.2fr]">
        {/* brand */}
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-lime">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-xl font-extrabold tracking-tight text-ink">
                Touch<span className="text-brand">line</span>26
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
                Reliable. Secure. Enjoy the match.
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600">
            Reserved-seat resale for the 2026 tournament. Pick your seats, hold them while you
            settle up over WhatsApp, and receive QR tickets the moment payment is confirmed.
          </p>
          {/* trust cue, matching the navbar strip */}
          <div className="mt-5 flex items-center gap-2">
            <span className="text-sm font-bold text-ink">Excellent</span>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="grid h-4 w-4 place-items-center rounded-sm bg-go">
                  <Star className="h-3 w-3 fill-white text-white" />
                </span>
              ))}
            </span>
            <span className="text-xs text-ink-500">21K+ reviews</span>
          </div>
        </div>

        {/* explore */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-600">
            <li><Link href="/matches" className="transition hover:text-brand">World Cup 2026</Link></li>
            <li><Link href="/#how" className="transition hover:text-brand">How it works</Link></li>
            <li><Link href="/#why" className="transition hover:text-brand">Why book with us</Link></li>
            <li><Link href="/dashboard/orders" className="transition hover:text-brand">Track tickets</Link></li>
          </ul>
        </div>

        {/* legal */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-600">
            <li><Link href="/terms" className="transition hover:text-brand">Terms of service</Link></li>
            <li><Link href="/privacy" className="transition hover:text-brand">Privacy policy</Link></li>
            <li><Link href="/disclaimer" className="transition hover:text-brand">Reseller disclaimer</Link></li>
          </ul>
        </div>

        {/* support / WhatsApp */}
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink">Support</h4>
          <p className="mt-4 text-sm text-ink-600">
            Questions or ready to pay? Message our team — available 24/7.
          </p>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2.5 rounded-xl bg-go px-4 py-3 font-bold text-white shadow-sm transition hover:bg-go-dark"
          >
            <WhatsAppIcon className="h-5 w-5" />
            <span className="leading-none">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/80">Chat on WhatsApp</span>
              <span className="block text-base font-extrabold tabular-nums">{wa}</span>
            </span>
          </a>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5 text-pitch" /> Secure checkout &amp; verified sellers
          </p>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-ink/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-500 sm:flex-row">
          <p>© {year} Touchline26. Independent ticket reseller — not affiliated with FIFA.</p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Serving fans worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}