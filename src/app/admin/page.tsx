import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { releaseExpired } from '@/lib/orders'
import AdminOrders from './AdminOrders'
import { formatMoney } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  await releaseExpired()

  const [orders, pending, issued, revenueAgg] = await Promise.all([
    prisma.order.findMany({
      include: { user: true, seats: { include: { match: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
    prisma.order.count({ where: { status: 'ISSUED' } }),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: 'ISSUED' } }),
  ])

  const rows = orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    email: o.user.email,
    total: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    match: o.seats[0]?.match ? `${o.seats[0].match.homeTeam} vs ${o.seats[0].match.awayTeam}` : '—',
    seatLabels: o.seats.map((s) => `${s.row}${s.number}`),
  }))

  const revenue = revenueAgg._sum.totalAmount ?? 0

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-extrabold">Admin</h1>
        <Link href="/admin/matches" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:bg-ink-800">
          Manage matches
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Awaiting payment" value={String(pending)} accent="text-amber-600" />
        <Stat label="Tickets issued" value={String(issued)} accent="text-pitch" />
        <Stat label="Confirmed revenue" value={formatMoney(revenue)} accent="text-ink" />
      </div>

      <h2 className="mt-12 font-display text-2xl font-extrabold">Recent orders</h2>
      <AdminOrders orders={rows} />
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-card">
      <p className="text-sm text-ink-500">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold ${accent}`}>{value}</p>
    </div>
  )
}
