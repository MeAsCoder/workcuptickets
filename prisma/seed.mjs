// Plain Node ESM seed — no ts-node, no compilation, runs anywhere with `node`.
// Match data is pulled live from the openfootball World Cup 2026 dataset.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'node:fs'
import { fetchWorldCupMatches } from './fixtures.mjs'

// --- tiny dependency-free .env loader (so this works however it's invoked) ---
try {
  const envText = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of envText.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"\n]*?)"?\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
} catch {}

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@worldcuptickets.test'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234'

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: await bcrypt.hash(adminPassword, 10), role: 'ADMIN' },
    create: { email: adminEmail, password: await bcrypt.hash(adminPassword, 10), name: 'Tournament Admin', role: 'ADMIN' },
  })
  await prisma.user.upsert({
    where: { email: 'fan@worldcuptickets.test' },
    update: {},
    create: { email: 'fan@worldcuptickets.test', password: await bcrypt.hash('fan12345', 10), name: 'Demo Fan', role: 'CUSTOMER' },
  })

  const existing = await prisma.match.count()
  if (existing > 0) {
    console.log(`Matches already present (${existing}). Skipping match seed. (Run "npm run db:reset" to rebuild.)`)
  } else {
    const matches = await fetchWorldCupMatches()
    let n = 0
    for (const m of matches) {
      const match = await prisma.match.create({
        data: {
          homeTeam: m.homeTeam, awayTeam: m.awayTeam,
          homeFlag: m.homeFlag, awayFlag: m.awayFlag,
          stage: m.stage, group: m.group, num: m.num,
          stadium: m.stadium, city: m.city, countryCode: m.countryCode,
          date: m.date,
        },
      })
      for (const c of m.cats) {
        const cat = await prisma.ticketCategory.create({
          data: { name: c.name, price: c.price, accent: c.accent, matchId: match.id },
        })
        const seats = []
        for (const row of c.rows) for (let i = 1; i <= c.perRow; i++) seats.push({ row, number: i, categoryId: cat.id, matchId: match.id })
        await prisma.seat.createMany({ data: seats })
      }
      // Sell a deterministic handful of seats for realism (varies per match)
      const sellCount = 3 + (m.num % 9)
      const some = await prisma.seat.findMany({ where: { matchId: match.id }, take: sellCount, skip: m.num % 5 })
      if (some.length) await prisma.seat.updateMany({ where: { id: { in: some.map((s) => s.id) } }, data: { status: 'SOLD' } })
      n++
    }
    console.log(`Created ${n} matches.`)
  }

  console.log(`Seed complete. ${await prisma.match.count()} matches, ${await prisma.seat.count()} seats.`)
  console.log(`Admin:    ${adminEmail} / ${adminPassword}`)
  console.log(`Demo fan: fan@worldcuptickets.test / fan12345`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
