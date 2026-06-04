import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase()
  if (q.length < 2) return Response.json({ events: [], teams: [] })

  let all: {
    id: string; num: number | null; group: string | null; stage: string
    homeTeam: string; awayTeam: string; date: Date; city: string | null
  }[] = []
  try {
    all = await prisma.match.findMany({
      orderBy: [{ date: 'asc' }, { num: 'asc' }],
      select: { id: true, num: true, group: true, stage: true, homeTeam: true, awayTeam: true, date: true, city: true },
    })
  } catch {
    return Response.json({ events: [], teams: [] })
  }

  const events = all
    .filter((m) => `${m.homeTeam} ${m.awayTeam} ${m.group ?? ''} ${m.stage} ${m.city ?? ''}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map((m) => ({
      id: m.id,
      num: m.num,
      group: m.group,
      stage: m.stage,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      date: m.date.toISOString(),
    }))

  const teams = Array.from(
    new Set(all.flatMap((m) => [m.homeTeam, m.awayTeam]).filter((tm) => tm.toLowerCase().includes(q))),
  ).slice(0, 6)

  return Response.json({ events, teams })
}
