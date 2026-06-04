import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { releaseExpired } from '@/lib/orders'
import CheckoutView from './CheckoutView'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ searchParams }: { searchParams: { order?: string } }) {
  await releaseExpired()
  const session = await getSession()
  if (!session) redirect('/login?redirect=/cart')

  const orderId = searchParams.order
  if (!orderId) redirect('/cart')

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { seats: { include: { category: true, match: true } }, user: true },
  })
  if (!order || order.userId !== session.userId) redirect('/dashboard/orders')

  const seats = order.seats.map((s) => ({
    label: `${s.row}${s.number}`,
    category: s.category.name,
    price: s.category.price,
  }))
  const match = order.seats[0]?.match

  return (
    <CheckoutView
      order={{
        id: order.id,
        reference: order.reference,
        total: order.totalAmount,
        status: order.status,
        expiresAt: order.expiresAt.toISOString(),
        email: order.user.email,
      }}
      seats={seats}
      matchTitle={match ? `${match.homeTeam} vs ${match.awayTeam}` : 'Your match'}
      stadium={match?.stadium ?? ''}
    />
  )
}
