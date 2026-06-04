import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendEmail, ticketsReadyEmail } from '@/lib/mail'

const schema = z.object({
  orderId: z.string(),
  action: z.enum(['confirm', 'cancel']),
})

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { orderId, action } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  })
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  if (action === 'cancel') {
    await prisma.$transaction([
      prisma.seat.updateMany({
        where: { orderId: order.id },
        data: { status: 'AVAILABLE', reservedUntil: null, orderId: null },
      }),
      prisma.cartItem.deleteMany({ where: { orderId: order.id } }),
      prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }),
    ])
    return NextResponse.json({ ok: true, status: 'CANCELLED' })
  }

  // confirm
  if (order.status === 'ISSUED') {
    return NextResponse.json({ ok: true, status: 'ISSUED' })
  }
  if (order.status === 'CANCELLED' || order.status === 'EXPIRED') {
    return NextResponse.json({ error: 'Order is no longer active' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.seat.updateMany({
      where: { orderId: order.id },
      data: { status: 'SOLD', reservedUntil: null },
    }),
    prisma.order.update({ where: { id: order.id }, data: { status: 'ISSUED' } }),
  ])

  const link = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/dashboard/tickets/${order.id}`
  await sendEmail({
    to: order.user.email,
    subject: `Your tickets are ready — ${order.reference}`,
    html: ticketsReadyEmail(order.reference, order.totalAmount, link),
  })

  return NextResponse.json({ ok: true, status: 'ISSUED' })
}
