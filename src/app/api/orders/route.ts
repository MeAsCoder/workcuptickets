import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { releaseExpired } from '@/lib/orders'
import { makeReference } from '@/lib/utils'
import { RESERVATION_MINUTES } from '@/lib/constants'

export async function GET() {
  await releaseExpired()
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { seats: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ orders })
}

export async function POST() {
  await releaseExpired()
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId, orderId: null },
  })
  if (items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
  }

  const seatIds = items.map((i) => i.seatId)
  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds } },
    include: { category: true },
  })

  // Validate all seats are still reserved (held) for this user
  const stillHeld = seats.every((s) => s.status === 'RESERVED')
  if (!stillHeld) {
    return NextResponse.json({ error: 'Your hold expired. Please re-select your seats.' }, { status: 409 })
  }

  const total = seats.reduce((sum, s) => sum + s.category.price, 0)
  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000)

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference: makeReference(),
        userId: session.userId,
        totalAmount: total,
        status: 'PENDING_PAYMENT',
        expiresAt,
      },
    })
    await tx.seat.updateMany({
      where: { id: { in: seatIds } },
      data: { orderId: created.id, reservedUntil: expiresAt },
    })
    await tx.cartItem.updateMany({
      where: { id: { in: items.map((i) => i.id) } },
      data: { orderId: created.id },
    })
    return created
  })

  return NextResponse.json({ id: order.id, reference: order.reference })
}
