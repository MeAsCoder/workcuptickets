import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { createSession } from '@/lib/session'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }
  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name })
  return NextResponse.json({ ok: true })
}
