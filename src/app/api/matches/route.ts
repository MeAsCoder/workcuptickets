export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { date: 'asc' },
    include: { categories: true, seats: { where: { status: 'AVAILABLE' }, select: { id: true } } },
  })
  return NextResponse.json({ matches })
}
