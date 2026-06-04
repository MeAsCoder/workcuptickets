import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/Button'
import WorldCupBanner from '@/components/WorldCupBanner'
import MatchCard, { type MatchCardData } from '@/components/MatchCard'
import { tServer } from '@/lib/serverPreferences'
import { ArrowRight, ShieldCheck, RefreshCw, Tag, MessagesSquare, Ticket, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function loadFeatured(): Promise<MatchCardData[]> {
  const matches = await prisma.match.findMany({
    orderBy: [{ date: 'asc' }, { num: 'asc' }],
    take: 4,
    include: { categories: true },
  })
  const counts = await prisma.seat.groupBy({
    by: ['matchId'],
    where: { status: 'AVAILABLE', matchId: { in: matches.map((m) => m.id) } },
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
  }))
}

export default async function HomePage() {
  let featured: MatchCardData[] = []
  let dbReady = true
  try {
    featured = await loadFeatured()
  } catch {
    dbReady = false
  }

  return (
    <div>
      {!dbReady && (
        <div className="bg-amber-100 text-amber-900">
          <div className="container-page py-3 text-sm">
            <strong>Almost ready:</strong> the database isn&rsquo;t set up yet. Run{' '}
            <code className="rounded bg-amber-200 px-1.5 py-0.5 font-mono">npm run db:setup</code>, then refresh.
          </div>
        </div>
      )}

      <section className="container-page pt-6">
        <div className="relative overflow-hidden rounded-3xl">
          <WorldCupBanner className="h-[300px] w-full sm:h-[380px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-7 sm:p-12">
            <span className="chip w-fit bg-white/90 text-ink ring-white/40">{tServer('home.tag')}</span>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-6xl">
              {tServer('matches.title')}
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/90 drop-shadow sm:text-lg">{tServer('home.heroSub')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/matches">
                <Button size="lg" className="bg-brand hover:bg-brand-dark group">
                  {tServer('home.browse')}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/20">
                  {tServer('nav.create')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-extrabold">{tServer('home.featured')}</h2>
            <p className="mt-1 text-ink-500">{tServer('home.featuredSub')}</p>
          </div>
          <Link href="/matches" className="hidden items-center gap-1.5 text-sm font-bold text-brand hover:underline sm:flex">
            {tServer('home.allMatches')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featured.length > 0 ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {featured.map((m) => <MatchCard key={m.id} m={m} />)}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-ink/20 bg-white/60 p-12 text-center text-ink-600">
            No fixtures loaded yet. Run <code className="rounded bg-ink/10 px-1.5 py-0.5 font-mono">npm run db:setup</code>.
          </div>
        )}
      </section>

      <section id="how" className="scroll-mt-28 border-y border-ink/10 bg-pitch-50/40">
        <div className="container-page py-14">
          <h2 className="text-center font-display text-3xl font-extrabold">{tServer('home.steps')}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: '01', icon: Ticket, t: 'Pick your seats', d: 'Tap exact seats on the interactive stadium map. We hold them for 30 minutes.' },
              { n: '02', icon: MessagesSquare, t: 'Pay over WhatsApp', d: 'Message our team with your order code and settle up however suits you.' },
              { n: '03', icon: ShieldCheck, t: 'Get QR tickets', d: 'Once payment clears, every seat gets its own scannable QR ticket.' },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-ink/10 bg-white/70 p-7">
                <div className="flex items-center justify-between">
                  <span className="font-display text-4xl font-extrabold text-brand/25">{s.n}</span>
                  <s.icon className="h-7 w-7 text-pitch" />
                </div>
                <h3 className="mt-3 text-xl font-bold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="scroll-mt-28">
        <div className="container-page py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-extrabold">{tServer('matches.why')}</h2>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: RefreshCw, t: tServer('why.refund') },
                  { icon: Tag, t: tServer('why.selection') },
                  { icon: ShieldCheck, t: tServer('why.secure') },
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white/70 p-4">
                    <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-pitch-50 text-pitch"><f.icon className="h-5 w-5" /></span>
                    <p className="font-bold">{f.t}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-ink p-8 text-cream">
              <div className="flex items-center gap-2">
                <span className="font-display text-2xl font-extrabold">{tServer('trust.excellent')}</span>
                <span className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="grid h-6 w-6 place-items-center rounded bg-go"><Star className="h-4 w-4 fill-white text-white" /></span>
                  ))}
                </span>
              </div>
              <p className="mt-4 text-cream/80">{tServer('trust.fans')} — 104 matches, 16 stadiums.</p>
              <Link href="/matches" className="mt-6 inline-flex">
                <Button size="lg" className="bg-lime text-ink hover:bg-lime-dark">{tServer('home.browse')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
