import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, SESSION_COOKIE } from './lib/jwt'

// Routes that always require a logged-in user
const PROTECTED = ['/cart', '/checkout', '/dashboard']
const ADMIN = ['/admin']

// Language auto-detection
const SUPPORTED = ['en-GB', 'en-US', 'es', 'nl', 'de', 'fr']
const LANG_COOKIE = 't26_lang'

function pickLanguage(header: string | null): string {
  if (!header) return 'en-US'
  const wanted = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=')
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of wanted) {
    const exact = SUPPORTED.find((s) => s.toLowerCase() === tag)
    if (exact) return exact
    const base = tag.split('-')[0]
    const byBase = SUPPORTED.find((s) => s.toLowerCase().startsWith(base))
    if (byBase) return byBase
  }
  return 'en-US'
}

// Apply language cookie to any response we return (only if user hasn't chosen yet)
function withLang(request: NextRequest, response: NextResponse): NextResponse {
  if (!request.cookies.get(LANG_COOKIE)) {
    const detected = pickLanguage(request.headers.get('accept-language'))
    response.cookies.set(LANG_COOKIE, detected, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = token ? await verifyToken(token) : null

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const needsAdmin = ADMIN.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if ((needsAuth || needsAdmin) && !session) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return withLang(request, NextResponse.redirect(url))
  }
  if (needsAdmin && session?.role !== 'ADMIN') {
    return withLang(request, NextResponse.redirect(new URL('/', request.url)))
  }
  return withLang(request, NextResponse.next())
}

export const config = {
  matcher: [
    // run on all pages except static assets and API routes
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|api).*)',
  ],
}