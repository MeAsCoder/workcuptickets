import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

const schema = z.object({
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  homeFlag: z.string().optional(),
  awayFlag: z.string().optional(),
  stage: z.string().optional(),
  stadium: z.string().min(1),
  city: z.string().optional(),
  date: z.string().min(1),
})

// Auto-generated seating layout for new matches
const LAYOUT = [
  { name: 'Category 1', price: 320, accent: 'lime', rows: ['A', 'B', 'C'], perRow: 12 },
  { name: 'Category 2', price: 190, accent: 'pitch', rows: ['D', 'E', 'F', 'G'], perRow: 12 },
  { name: 'Category 3', price: 110, accent: 'clay', rows: ['H', 'J', 'K', 'L'], perRow: 12 },
]

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 })
  const d = parsed.data

  const date = new Date(d.date)
  if (isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  const match = await prisma.match.create({
    data: {
      homeTeam: d.homeTeam, awayTeam: d.awayTeam,
      homeFlag: d.homeFlag || '🏳️', awayFlag: d.awayFlag || '🏳️',
      stage: d.stage || 'Group Stage', stadium: d.stadium, city: d.city || null,
      date,
    },
  })

  for (const cat of LAYOUT) {
    const category = await prisma.ticketCategory.create({
      data: { name: cat.name, price: cat.price, accent: cat.accent, matchId: match.id },
    })
    const seats = []
    for (const row of cat.rows) {
      for (let n = 1; n <= cat.perRow; n++) {
        seats.push({ row, number: n, categoryId: category.id, matchId: match.id })
      }
    }
    await prisma.seat.createMany({ data: seats })
  }

  return NextResponse.json({ ok: true, id: match.id })
}
