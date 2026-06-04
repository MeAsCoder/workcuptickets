import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { formatDate, formatTime } from '@/lib/utils'
import TicketStubs from './TicketStubs'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TicketsPage({ params }: { params: { orderId: string } }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { seats: { include: { match: true, category: true } }, user: true },
  })

  if (!order || (order.userId !== session.userId && session.role !== 'ADMIN')) {
    redirect('/dashboard/orders')
  }
  if (order.status !== 'ISSUED') {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold">Tickets not ready yet</h1>
        <p className="mt-2 text-ink-600">This order’s tickets are issued once payment is confirmed.</p>
        <Link href="/dashboard/orders" className="mt-5 inline-block font-semibold text-pitch hover:underline">Back to orders →</Link>
      </div>
    )
  }

  const match = order.seats[0]?.match
  const tickets = order.seats.map((s) => ({
    id: s.id,
    seat: `${s.row}${s.number}`,
    row: s.row,
    number: s.number,
    category: s.category.name,
    // payload encoded in the QR
    payload: JSON.stringify({
      o: order.reference,
      s: s.id,
      seat: `${s.row}${s.number}`,
      m: match ? `${match.homeTeam}-${match.awayTeam}` : '',
    }),
  }))

  return (
    <div className="container-page py-10">
      <div className="no-print">
        <Link href="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-pitch">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold">Your tickets</h1>
            <p className="mt-1 text-ink-500">Order {order.reference} · {tickets.length} seat(s)</p>
          </div>
        </div>
      </div>

      <TicketStubs
        tickets={tickets}
        reference={order.reference}
        matchTitle={match ? `${match.homeTeam} vs ${match.awayTeam}` : 'Match'}
        flags={match ? `${match.homeFlag ?? ''} ${match.awayFlag ?? ''}` : ''}
        stage={match?.stage ?? ''}
        stadium={match ? `${match.stadium}${match.city ? ', ' + match.city : ''}` : ''}
        dateLine={match ? `${formatDate(match.date)} · ${formatTime(match.date)}` : ''}
      />
    </div>
  )
}
