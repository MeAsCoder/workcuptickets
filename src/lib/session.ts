import { cookies } from 'next/headers'
import { signToken, verifyToken, SESSION_COOKIE, type SessionPayload } from './jwt'

const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function createSession(payload: SessionPayload) {
  const token = await signToken(payload)
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}

export function destroySession() {
  cookies().delete(SESSION_COOKIE)
}
