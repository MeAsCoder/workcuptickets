import Link from 'next/link'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import WorldCupBanner from '@/components/WorldCupBanner'
import MatchCard, { type MatchCardData } from '@/components/MatchCard'
import FilterBar from './FilterBar'
import { fmtServer, tServer } from '@/lib/serverPreferences'
import { ChevronRight, RefreshCw, Tag, ShieldCheck, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

const COUNTRY_LABEL: Record<string, string> = { US: 'United States', CA: 'Canada', MX: 'Mexico' }

async function loadData() {
  const matches = await prisma.match.findMany({
    orderBy: [{ date: 'asc' }, { num: 'asc' }],
    include: { categories: true },
  })
  const counts = await prisma.seat.groupBy({
    by: ['matchId'],
    where: { status: 'AVAILABLE' },
    _count: { _all: true },
  })
  const countMap = new Map(counts.map((c) => [c.matchId, c._count._all]))
  return matches.map((m) => ({
    id: m.id, num: m.num, homeTeam: m.homeTeam, awayTeam: m.awayTeam,
    homeFlag: m.homeFlag, awayFlag: m.awayFlag, stage: m.stage, group: m.group,
    stadium: m.stadium, city: m.city, countryCode: m.countryCode,
    date: m.date.toISOString(),
    fromPrice: m.categories.length ? Math.min(...m.categories.map((c) => c.price)) : 0,
    ticketsLeft: countMap.get(m.id) ?? 0,
  })) as MatchCardData[]
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { q?: string; country?: string; stage?: string; sort?: string }
}) {
  let all: MatchCardData[] = []
  try {
    all = await loadData()
  } catch {
    all = []
  }

  const countryCodes = Array.from(new Set(all.map((m) => m.countryCode).filter(Boolean))) as string[]
  const stages = Array.from(new Set(all.map((m) => m.stage)))
  const priceFrom = all.length ? Math.min(...all.map((m) => m.fromPrice).filter(Boolean)) : 0
  const priceTo = all.length ? Math.max(...all.map((m) => m.fromPrice)) : 0

  const q = (searchParams.q || '').toLowerCase().trim()
  let list = all.filter((m) => {
    if (searchParams.country && m.countryCode !== searchParams.country) return false
    if (searchParams.stage && m.stage !== searchParams.stage) return false
    if (q) {
      const hay = `${m.homeTeam} ${m.awayTeam} ${m.stadium} ${m.city} ${m.group ?? ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
  if (searchParams.sort === 'price') list = [...list].sort((a, b) => a.fromPrice - b.fromPrice)

  return (
    <div className="container-page py-8">
      <nav className="flex items-center gap-2 text-sm text-ink-500">
        <Link href="/" className="hover:text-brand">{tServer('nav.home')}</Link>
        <ChevronRight className="h-4 w-4 text-brand" />
        <span className="font-semibold text-ink">{tServer('nav.wc')}</span>
      </nav>

      <div className="relative mt-4 overflow-hidden rounded-2xl">
        <WorldCupBanner className="h-40 w-full sm:h-56" />
        <div className="absolute inset-0 flex items-end p-5 sm:p-8">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">
            {tServer('matches.title')}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,320px]">
        <div>
          <p className="max-w-2xl leading-relaxed text-ink-700">
            {tServer('matches.intro', { count: all.length || 104 })}
            {priceFrom ? <span className="font-semibold"> · {fmtServer(priceFrom)} – {fmtServer(priceTo)}</span> : null}
          </p>

          <div className="mt-6">
            <Suspense fallback={<div className="h-12" />}>
              <FilterBar
                countries={countryCodes.map((c) => ({ code: c, label: COUNTRY_LABEL[c] || c }))}
                stages={stages}
                current={searchParams}
              />
            </Suspense>
          </div>

          <p className="mt-6 text-sm text-ink-500">{tServer('matches.count', { n: list.length })}</p>
          {list.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-ink/20 bg-white/60 p-12 text-center">
              <p className="text-lg text-ink-600">{tServer('matches.empty')}</p>
              {all.length === 0 && (
                <p className="mt-2 text-sm text-ink-500">
                  Run <code className="rounded bg-ink/10 px-1.5 py-0.5 font-mono">npm run db:setup</code> to load fixtures.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {list.map((m) => <MatchCard key={m.id} m={m} />)}
            </div>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-44 lg:self-start">
          <div className="rounded-2xl bg-pitch-50 p-6">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-extrabold">{tServer('trust.excellent')} 4.7</span>
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="grid h-6 w-6 place-items-center rounded bg-go"><Star className="h-4 w-4 fill-white text-white" /></span>
              ))}
            </div>
            <p className="mt-2 text-sm text-ink-500">{tServer('trust.reviews')}</p>
          </div>

          <div className="rounded-2xl bg-pitch-50 p-6">
            <h3 className="font-display text-xl font-extrabold">{tServer('matches.why')}</h3>
            <ul className="mt-4 space-y-3">
              {[
                { icon: RefreshCw, t: tServer('why.refund') },
                { icon: Tag, t: tServer('why.selection') },
                { icon: ShieldCheck, t: tServer('why.secure') },
              ].map((f, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
                  <f.icon className="h-5 w-5 text-pitch" />
                  <span className="font-semibold text-ink-700">{f.t}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
