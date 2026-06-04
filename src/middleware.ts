import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, SESSION_COOKIE } from './lib/jwt'

// Routes that always require a logged-in user
const PROTECTED = ['/cart', '/checkout', '/dashboard']
const ADMIN = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifyToken(token) : null

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const needsAdmin = ADMIN.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if ((needsAuth || needsAdmin) && !session) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  if (needsAdmin && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/dashboard/:path*', '/admin/:path*'],
}
