import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  // Detach seats from any orders first to satisfy relations, then cascade delete.
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { matchId: params.id } }),
    prisma.seat.updateMany({ where: { matchId: params.id }, data: { orderId: null } }),
    prisma.match.delete({ where: { id: params.id } }),
  ])
  return NextResponse.json({ ok: true })
}
