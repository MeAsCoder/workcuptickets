// Plain Node ESM seed — resilient against dropped connections, resume-safe.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'node:fs'
import { fetchWorldCupMatches } from './fixtures.mjs'

// --- tiny dependency-free .env loader ---
try {
  const envText = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of envText.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"\n]*?)"?\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
} catch {}

const prisma = new PrismaClient()

// Retry a DB op a few times if the connection drops (Neon P1017 / closed).
async function withRetry(fn, label, tries = 5) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      const transient =
        e?.code === 'P1017' ||
        e?.code === 'P1001' ||
        /closed the connection|Can't reach database|Timed out/i.test(e?.message || '')
      if (!transient || attempt >= tries) throw e
      const wait = 500 * attempt
      console.warn(`  ⚠ ${label} failed (${e.code || 'conn'}), retry ${attempt}/${tries - 1} in ${wait}ms`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@worldcuptickets.test'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234'

  await withRetry(
    () =>
      prisma.user.upsert({
        where: { email: adminEmail },
        update: { password: bcrypt.hashSync(adminPassword, 10), role: 'ADMIN' },
        create: { email: adminEmail, password: bcrypt.hashSync(adminPassword, 10), name: 'Tournament Admin', role: 'ADMIN' },
      }),
    'admin upsert',
  )
  await withRetry(
    () =>
      prisma.user.upsert({
        where: { email: 'fan@worldcuptickets.test' },
        update: {},
        create: { email: 'fan@worldcuptickets.test', password: bcrypt.hashSync('fan12345', 10), name: 'Demo Fan', role: 'CUSTOMER' },
      }),
    'fan upsert',
  )

  const matches = await fetchWorldCupMatches()
  let created = 0
  let skipped = 0

  for (const m of matches) {
    // resume-safe: skip a match only if it already has seats
    const already = await withRetry(
      () => prisma.match.findFirst({ where: { num: m.num, stage: m.stage, group: m.group ?? null }, select: { id: true } }),
      'match lookup',
    )
    if (already) {
      const seatCount = await withRetry(() => prisma.seat.count({ where: { matchId: already.id } }), 'seat count')
      if (seatCount > 0) {
        skipped++
        continue
      }
      // half-made match with no seats: remove it and recreate cleanly
      await withRetry(() => prisma.match.delete({ where: { id: already.id } }), 'cleanup match')
    }

    const match = await withRetry(
      () =>
        prisma.match.create({
          data: {
            homeTeam: m.homeTeam, awayTeam: m.awayTeam,
            homeFlag: m.homeFlag, awayFlag: m.awayFlag,
            stage: m.stage, group: m.group, num: m.num,
            stadium: m.stadium, city: m.city, countryCode: m.countryCode,
            date: m.date,
          },
        }),
      `create match M${m.num}`,
    )

    // Build all categories + seats first, then write with as few round trips as possible.
    const allSeats = []
    for (const c of m.cats) {
      const cat = await withRetry(
        () => prisma.ticketCategory.create({ data: { name: c.name, price: c.price, accent: c.accent, matchId: match.id } }),
        `create category ${c.name}`,
      )
      for (const row of c.rows) for (let i = 1; i <= c.perRow; i++) allSeats.push({ row, number: i, categoryId: cat.id, matchId: match.id })
    }
    await withRetry(() => prisma.seat.createMany({ data: allSeats }), `seats M${m.num}`) // one insert per match

    // Sell a deterministic handful for realism
    const sellCount = 3 + ((m.num ?? 0) % 9)
    const some = await withRetry(
      () => prisma.seat.findMany({ where: { matchId: match.id }, take: sellCount, skip: (m.num ?? 0) % 5, select: { id: true } }),
      'pick sold seats',
    )
    if (some.length) {
      await withRetry(
        () => prisma.seat.updateMany({ where: { id: { in: some.map((s) => s.id) } }, data: { status: 'SOLD' } }),
        'mark sold',
      )
    }

    created++
    if (created % 10 === 0) console.log(`  …${created} created`)
  }

  console.log(`Done. Created ${created}, skipped ${skipped} (already had seats).`)
  console.log(`Totals: ${await prisma.match.count()} matches, ${await prisma.seat.count()} seats.`)
  console.log(`Admin:    ${adminEmail} / ${adminPassword}`)
  console.log(`Demo fan: fan@worldcuptickets.test / fan12345`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })