import { prisma } from '@/lib/prisma'
import { formatDate, formatTime, formatMoney } from '@/lib/utils'
import AdminMatches from './AdminMatches'

export const dynamic = 'force-dynamic'

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({
    orderBy: { date: 'asc' },
    include: {
      categories: true,
      _count: { select: { seats: true } },
    },
  })

  const rows = matches.map((m) => ({
    id: m.id,
    title: `${m.homeTeam} vs ${m.awayTeam}`,
    stage: m.stage,
    stadium: m.stadium,
    when: `${formatDate(m.date)} · ${formatTime(m.date)}`,
    seats: m._count.seats,
    from: m.categories.length ? formatMoney(Math.min(...m.categories.map((c) => c.price))) : '—',
  }))

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">Manage matches</h1>
      <p className="mt-2 text-ink-600">Create a fixture and we’ll generate three seating categories automatically.</p>
      <AdminMatches matches={rows} />
    </div>
  )
}
