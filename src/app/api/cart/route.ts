import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { releaseExpired } from '@/lib/orders'
import { RESERVATION_MINUTES, MAX_SEATS_PER_ORDER } from '@/lib/constants'

export async function GET() {
  await releaseExpired()
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.cartItem.findMany({
    where: { userId: session.userId, orderId: null },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ items })
}

const postSchema = z.object({ seatIds: z.array(z.string()).min(1).max(MAX_SEATS_PER_ORDER) })

export async function POST(req: Request) {
  await releaseExpired()
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Select between 1 and 8 seats' }, { status: 400 })
  const { seatIds } = parsed.data

  const reservedUntil = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000)

  try {
    await prisma.$transaction(async (tx) => {
      // existing held seats for this user (don't count against the limit twice)
      const currentHeld = await tx.cartItem.count({ where: { userId: session.userId, orderId: null } })
      if (currentHeld + seatIds.length > MAX_SEATS_PER_ORDER) {
        throw new Error(`You can hold at most ${MAX_SEATS_PER_ORDER} seats`)
      }

      for (const seatId of seatIds) {
        // Atomic guard: only flips if still AVAILABLE
        const updated = await tx.seat.updateMany({
          where: { id: seatId, status: 'AVAILABLE' },
          data: { status: 'RESERVED', reservedUntil },
        })
        if (updated.count === 0) {
          throw new Error('One or more seats were just taken. Please pick again.')
        }
        await tx.cartItem.create({
          data: { userId: session.userId, seatId, matchId: (await tx.seat.findUniqueOrThrow({ where: { id: seatId }, select: { matchId: true } })).matchId },
        })
      }
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not reserve seats'
    return NextResponse.json({ error: message }, { status: 409 })
  }

  return NextResponse.json({ ok: true })
}

const delSchema = z.object({ cartItemId: z.string() })

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = delSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const item = await prisma.cartItem.findUnique({ where: { id: parsed.data.cartItemId } })
  if (!item || item.userId !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (item.orderId) {
    return NextResponse.json({ error: 'This seat belongs to an order' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.seat.update({
      where: { id: item.seatId },
      data: { status: 'AVAILABLE', reservedUntil: null, orderId: null },
    }),
    prisma.cartItem.delete({ where: { id: item.id } }),
  ])

  return NextResponse.json({ ok: true })
}
