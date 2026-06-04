import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate, formatTime } from '@/lib/utils'
import { getSession } from '@/lib/session'
import SeatSelection from './SeatSelection'
import { MapPin, CalendarDays, ArrowLeft } from 'lucide-react'
import type { SeatVM } from '@/components/SeatMap'

export const dynamic = 'force-dynamic'

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: { categories: true, seats: { include: { category: true } } },
  })
  if (!match) notFound()

  const session = await getSession()

  const seats: SeatVM[] = match.seats.map((s) => ({
    id: s.id,
    row: s.row,
    number: s.number,
    status: s.status,
    price: s.category.price,
    categoryName: s.category.name,
    accent: s.category.accent,
  }))

  return (
    <div className="container-page py-10">
      <Link href="/matches" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-pitch">
        <ArrowLeft className="h-4 w-4" /> All matches
      </Link>

      <div className="mt-5 rounded-3xl border border-ink/10 bg-ink p-7 text-cream shadow-lift sm:p-9">
        <span className="chip bg-lime text-ink ring-lime-dark/30">{match.stage}</span>
        <div className="mt-6 flex items-center justify-center gap-8 sm:gap-14">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl">{match.homeFlag}</div>
            <div className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{match.homeTeam}</div>
          </div>
          <div className="font-display text-2xl text-lime sm:text-3xl">vs</div>
          <div className="text-center">
            <div className="text-5xl sm:text-6xl">{match.awayFlag}</div>
            <div className="mt-2 font-display text-xl font-extrabold sm:text-2xl">{match.awayTeam}</div>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-cream/80">
          <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-lime" /> {formatDate(match.date)} · {formatTime(match.date)}</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-lime" /> {match.stadium}{match.city ? `, ${match.city}` : ''}</span>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Choose your seats</h2>
        <p className="mt-1 text-ink-500">Tap available seats to select. We hold them for 30 minutes once you reserve.</p>
      </div>

      <div className="mt-6">
        <SeatSelection matchId={match.id} seats={seats} isAuthed={!!session} />
      </div>
    </div>
  )
}
