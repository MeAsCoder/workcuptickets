import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
try {
  const envText = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of envText.split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"\n]*?)"?\s*$/)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2]
  }
} catch {}

const prisma = new PrismaClient()
async function main() {
  const now = new Date()
  const expired = await prisma.order.findMany({ where: { status: 'PENDING_PAYMENT', expiresAt: { lt: now } }, select: { id: true } })
  if (expired.length) await prisma.order.updateMany({ where: { id: { in: expired.map((o) => o.id) } }, data: { status: 'EXPIRED' } })
  const lapsed = await prisma.seat.findMany({ where: { status: 'RESERVED', reservedUntil: { lt: now } }, select: { id: true } })
  if (lapsed.length) {
    const ids = lapsed.map((s) => s.id)
    await prisma.cartItem.deleteMany({ where: { seatId: { in: ids } } })
    await prisma.seat.updateMany({ where: { id: { in: ids } }, data: { status: 'AVAILABLE', reservedUntil: null, orderId: null } })
  }
  console.log(`Expired ${expired.length} order(s), freed ${lapsed.length} seat(s).`)
}
main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
