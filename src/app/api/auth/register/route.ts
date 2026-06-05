import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { createSession } from '@/lib/session'

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  country: z.string().max(60).optional(),
  nationality: z.string().max(60).optional(),
  password: z.string().min(8).max(100),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check your details' }, { status: 400 })
  }
  const { name, email, phone, country, nationality, password } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 })
  }
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone,
      country: country || null,
      nationality: nationality || null,
      password: await hashPassword(password),
      role: 'CUSTOMER',
    },
  })
  await createSession({ userId: user.id, email: user.email, role: user.role, name: user.name })
  return NextResponse.json({ ok: true })
}