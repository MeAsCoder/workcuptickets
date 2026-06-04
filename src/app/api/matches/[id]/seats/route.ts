export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { releaseExpired } from '@/lib/orders'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await releaseExpired()
  const seats = await prisma.seat.findMany({
    where: { matchId: params.id },
    include: { category: true },
    orderBy: [{ row: 'asc' }, { number: 'asc' }],
  })
  return NextResponse.json({
    seats: seats.map((s) => ({
      id: s.id, row: s.row, number: s.number, status: s.status,
      price: s.category.price, categoryName: s.category.name, accent: s.category.accent,
    })),
  })
}
