import { prisma } from './prisma'

/**
 * Frees any seats whose hold has expired and marks stale pending orders EXPIRED.
 * Seat.reservedUntil is the single source of truth for a hold. Safe to call often.
 */
export async function releaseExpired() {
  const now = new Date()

  // 1) Expire stale pending orders
  const expiredOrders = await prisma.order.findMany({
    where: { status: 'PENDING_PAYMENT', expiresAt: { lt: now } },
    select: { id: true },
  })
  if (expiredOrders.length) {
    const ids = expiredOrders.map((o) => o.id)
    await prisma.order.updateMany({ where: { id: { in: ids } }, data: { status: 'EXPIRED' } })
  }

  // 2) Release any reserved seat whose hold lapsed
  const lapsed = await prisma.seat.findMany({
    where: { status: 'RESERVED', reservedUntil: { lt: now } },
    select: { id: true },
  })
  if (lapsed.length) {
    const seatIds = lapsed.map((s) => s.id)
    await prisma.cartItem.deleteMany({ where: { seatId: { in: seatIds } } })
    await prisma.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { status: 'AVAILABLE', reservedUntil: null, orderId: null },
    })
  }

  return { expiredOrders: expiredOrders.length, freedSeats: lapsed.length }
}
