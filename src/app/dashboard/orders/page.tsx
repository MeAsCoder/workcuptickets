import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { releaseExpired } from '@/lib/orders'
import OrdersView from './OrdersView'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  await releaseExpired()
  const session = await getSession()
  if (!session) return null

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { seats: { include: { match: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const rows = orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    total: o.totalAmount,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    expiresAt: o.expiresAt.toISOString(),
    match: o.seats[0]?.match ? `${o.seats[0].match.homeTeam} vs ${o.seats[0].match.awayTeam}` : '—',
    seatCount: o.seats.length,
    seatLabels: o.seats.map((s) => `${s.row}${s.number}`),
  }))

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">My orders</h1>
      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 bg-white/60 p-12 text-center">
          <p className="text-lg text-ink-600">You have no orders yet.</p>
          <Link href="/matches" className="mt-4 inline-block font-semibold text-pitch hover:underline">Browse matches →</Link>
        </div>
      ) : (
        <OrdersView orders={rows} />
      )}
    </div>
  )
}
