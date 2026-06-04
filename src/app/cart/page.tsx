import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { releaseExpired } from '@/lib/orders'
import CartView from './CartView'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  await releaseExpired()
  const session = await getSession()
  if (!session) return null // middleware redirects, this is a safety net

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId, orderId: null },
    include: { user: false },
    orderBy: { createdAt: 'asc' },
  })

  const seats = await prisma.seat.findMany({
    where: { id: { in: items.map((i) => i.seatId) } },
    include: { category: true, match: true },
  })

  const rows = items
    .map((i) => {
      const seat = seats.find((s) => s.id === i.seatId)
      if (!seat) return null
      return {
        cartItemId: i.id,
        seatId: seat.id,
        label: `${seat.row}${seat.number}`,
        category: seat.category.name,
        price: seat.category.price,
        match: `${seat.match.homeTeam} vs ${seat.match.awayTeam}`,
        stadium: seat.match.stadium,
        date: seat.match.date.toISOString(),
      }
    })
    .filter(Boolean) as {
      cartItemId: string; seatId: string; label: string; category: string
      price: number; match: string; stadium: string; date: string
    }[]

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-4xl font-extrabold">Your cart</h1>
      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/20 bg-white/60 p-12 text-center">
          <p className="text-lg text-ink-600">Your cart is empty.</p>
          <Link href="/matches" className="mt-4 inline-block font-semibold text-pitch hover:underline">
            Browse matches →
          </Link>
        </div>
      ) : (
        <CartView initial={rows} />
      )}
    </div>
  )
}
