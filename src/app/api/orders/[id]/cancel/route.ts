import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (order.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.seat.updateMany({
      where: { orderId: order.id },
      data: { status: 'AVAILABLE', reservedUntil: null, orderId: null },
    }),
    prisma.cartItem.deleteMany({ where: { orderId: order.id } }),
    prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
  ])

  return NextResponse.json({ ok: true })
}
