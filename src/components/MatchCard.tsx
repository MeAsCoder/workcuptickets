import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import { fmtServer, tServer, getServerPreferences } from '@/lib/serverPreferences'
import { localeFor } from '@/lib/preferences'

export interface MatchCardData {
  id: string
  num: number | null
  homeTeam: string
  awayTeam: string
  homeFlag?: string | null
  awayFlag?: string | null
  stage: string
  group?: string | null
  stadium: string
  city?: string | null
  countryCode?: string | null
  date: string // ISO
  fromPrice: number
  ticketsLeft: number
}

function dateParts(iso: string, locale: string) {
  const d = new Date(iso)
  return {
    month: new Intl.DateTimeFormat(locale, { month: 'short' }).format(d).toUpperCase(),
    day: new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(d),
    weekday: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).toUpperCase(),
  }
}

export default function MatchCard({ m }: { m: MatchCardData }) {
  const { lang } = getServerPreferences()
  const { month, day, weekday } = dateParts(m.date, localeFor(lang))
  const label = m.group ? `M${m.num} ${m.group}` : `M${m.num} ${m.stage}`
  const soldOut = m.ticketsLeft === 0

  return (
    <div className="group relative flex gap-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-card transition hover:shadow-lift sm:p-5">
      <div className="flex w-20 flex-shrink-0 flex-col gap-2 sm:w-24">
        <div className="relative grid h-20 w-20 place-items-center overflow-hidden rounded-xl sm:h-24 sm:w-24"
             style={{ background: 'radial-gradient(circle at 50% 35%, #15603c, #0a2c1c 80%)' }}>
          <div className="absolute inset-0 opacity-30"
               style={{ backgroundImage: 'repeating-linear-gradient(90deg,#fff2 0 1px,transparent 1px 8px)' }} />
          <div className="relative flex items-center gap-0.5">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-base shadow sm:h-8 sm:w-8">{m.homeFlag || '🏳️'}</span>
            <span className="text-[8px] font-bold text-white/80">VS</span>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-base shadow sm:h-8 sm:w-8">{m.awayFlag || '🏳️'}</span>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl text-center shadow-sm">
          <div className="bg-coral py-1 font-display text-xs font-extrabold tracking-wider text-white">{month}</div>
          <div className="bg-white py-1 font-display text-2xl font-extrabold leading-none text-ink">{day}</div>
          <div className="bg-ink-500/80 py-1 text-[10px] font-bold tracking-wider text-white">{weekday}</div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/matches/${m.id}`} className="min-w-0">
            <h3 className="font-display text-lg font-extrabold leading-tight text-ink hover:text-brand sm:text-xl">
              {m.homeTeam} vs {m.awayTeam}
              <span className="text-ink"> - World Cup 2026 - {label}</span>
            </h3>
          </Link>
          <Heart className="h-5 w-5 flex-shrink-0 text-ink/25" />
        </div>

        <p className="mt-1 text-sm text-ink-500">{m.stadium}</p>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-700">
          <MapPin className="h-4 w-4 text-ink-500" />
          {m.city}{m.countryCode ? `, ${m.countryCode}` : ''}
        </p>
        <p className="mt-1 text-sm text-ink-700">{m.ticketsLeft.toLocaleString(localeFor(lang))} {tServer('card.tickets')}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div className="leading-none">
            <p className="text-xs text-ink-500">{tServer('card.from')}</p>
            <p className="font-display text-2xl font-extrabold text-ink">{fmtServer(m.fromPrice)}</p>
          </div>
          <Link
            href={`/matches/${m.id}`}
            className={`flex-1 rounded-full px-6 py-3 text-center font-display font-extrabold tracking-wide transition ${
              soldOut ? 'cursor-not-allowed bg-ink/10 text-ink/40' : 'bg-go text-white hover:bg-go-dark'
            }`}
            aria-disabled={soldOut}
          >
            {soldOut ? tServer('card.soldout') : tServer('card.buy')}
          </Link>
        </div>
      </div>
    </div>
  )
}
