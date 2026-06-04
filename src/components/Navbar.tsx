'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Ticket, Menu, X, ChevronDown, Star, ShieldCheck, Users, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import SearchBox from '@/components/SearchBox'
import { usePreferences, useT } from '@/components/providers/Preferences'
import { CURRENCIES, LANGUAGES, currencyFor } from '@/lib/preferences'

interface NavUser {
  email: string
  name?: string | null
  role: string
}

export default function Navbar({ user }: { user: NavUser | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const t = useT()
  const { currency, lang, setCurrency, setLanguage } = usePreferences()

  const NAV = [
    { href: '/', label: t('nav.home'), exact: true },
    { href: '/matches', label: t('nav.wc') },
    { href: '/#how', label: t('nav.how') },
    { href: '/#why', label: t('nav.why') },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success(t('nav.signout'))
    router.push('/')
    router.refresh()
  }

  const activeLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[1]
  const activeCur = currencyFor(currency)

  return (
    <header className="sticky top-0 z-40">
      {/* promo bar */}
      <div className="bg-ink/5 text-center">
        <p className="container-page py-1.5 text-xs text-ink-500">{t('promo')}</p>
      </div>

      {/* main header */}
      <div className="border-b border-ink/10 bg-cream/95 backdrop-blur-md">
        <div className="container-page flex h-20 items-center gap-4">
          <Link href="/" className="flex flex-shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-lime">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-xl font-extrabold tracking-tight">
                Touch<span className="text-brand">line</span>26
              </span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
                Reliable. Secure. Enjoy the match.
              </span>
            </span>
          </Link>

          <div className="relative hidden flex-1 lg:block">
            <SearchBox variant="desktop" />
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link href="/dashboard/orders" className="flex items-center gap-2 rounded-xl border border-ink/20 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-white">
              <Ticket className="h-4 w-4" /> {t('nav.track')}
            </Link>

            <CurrencyMenu
              title={t('currency.title')}
              current={activeCur.code}
              label={`${activeCur.symbol} ${activeCur.code}`}
              onPick={setCurrency}
            />
            <LanguageMenu
              title={t('lang.title')}
              current={activeLang.code}
              label={`${activeLang.flag} ${activeLang.code.toUpperCase()}`}
              onPick={setLanguage}
            />
          </div>

          <button className="ml-auto md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* red nav row */}
      <nav className="bg-brand text-white">
        <div className="container-page flex h-12 items-center gap-1">
          {NAV.map((l) => {
            const base = l.href.split('#')[0]
            const active = l.exact ? pathname === l.href : l.href !== '/' && pathname.startsWith(base) && base !== '/'
            return (
              <Link key={l.href} href={l.href} className={cn('rounded-md px-3 py-1.5 text-sm font-bold transition hover:bg-white/15', active && 'bg-white/15')}>
                {l.label}
              </Link>
            )
          })}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="rounded-md px-3 py-1.5 text-sm font-bold transition hover:bg-white/15">{t('nav.admin')}</Link>
          )}

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="text-sm text-white/90">{user.name || user.email}</span>
                <button onClick={logout} className="rounded-md px-3 py-1.5 text-sm font-bold transition hover:bg-white/15">{t('nav.signout')}</button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-md px-3 py-1.5 text-sm font-bold transition hover:bg-white/15">{t('nav.signin')}</Link>
                <Link href="/register" className="rounded-md bg-white px-3 py-1.5 text-sm font-bold text-brand transition hover:bg-cream">{t('nav.create')}</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* trust strip */}
      <div className="hidden border-b border-ink/10 bg-pitch-50/70 md:block">
        <div className="container-page flex items-center gap-8 py-2 text-sm text-ink-700">
          <span className="flex items-center gap-2">
            <strong>{t('trust.excellent')}</strong>
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="grid h-4 w-4 place-items-center rounded-sm bg-go">
                  <Star className="h-3 w-3 fill-white text-white" />
                </span>
              ))}
            </span>
            <span className="text-ink-500">{t('trust.reviews')}</span>
          </span>
          <span className="hidden items-center gap-2 lg:flex"><ShieldCheck className="h-4 w-4 text-pitch" /> {t('trust.years')}</span>
          <span className="hidden items-center gap-2 lg:flex"><Users className="h-4 w-4 text-pitch" /> {t('trust.fans')}</span>
        </div>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="border-b border-ink/10 bg-cream md:hidden">
          <div className="container-page flex flex-col gap-2 py-4">
            <SearchBox variant="mobile" onNavigate={() => setOpen(false)} />
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-bold hover:bg-ink/5">{l.label}</Link>
            ))}
            <Link href="/dashboard/orders" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-bold hover:bg-ink/5">{t('nav.track')}</Link>
            {user?.role === 'ADMIN' && <Link href="/admin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-bold hover:bg-ink/5">{t('nav.admin')}</Link>}

            <div className="my-1 h-px bg-ink/10" />
            {/* currency + language (mobile) */}
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-bold">
                <span className="mb-1 block text-xs text-ink-500">{t('currency.title')}</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-2 py-2">
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                </select>
              </label>
              <label className="text-sm font-bold">
                <span className="mb-1 block text-xs text-ink-500">{t('lang.title')}</span>
                <select value={lang} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-lg border border-ink/20 bg-white px-2 py-2">
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                </select>
              </label>
            </div>

            <div className="my-1 h-px bg-ink/10" />
            {user ? (
              <button onClick={logout} className="rounded-lg px-3 py-2.5 text-left font-bold text-brand">{t('nav.signout')}</button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 font-bold hover:bg-ink/5">{t('nav.signin')}</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="rounded-lg bg-brand px-3 py-2.5 font-bold text-white">{t('nav.create')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

/* ---------- dropdown menus ---------- */

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [onClose])
  return ref
}

function CurrencyMenu({ title, current, label, onPick }: { title: string; current: string; label: string; onPick: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 rounded-xl border border-ink/20 px-3 py-2.5 text-sm font-bold text-ink">
        {label} <ChevronDown className="h-4 w-4 text-ink-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lift">
          <p className="border-b border-ink/10 px-4 py-3 font-display font-extrabold">{title}</p>
          {CURRENCIES.map((c) => (
            <button key={c.code} onClick={() => { onPick(c.code); setOpen(false) }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-ink/5">
              <span className="w-5 text-center font-bold">{c.symbol}</span>
              <span className="flex-1">{c.label}</span>
              {current === c.code && <Check className="h-4 w-4 text-go" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function LanguageMenu({ title, current, label, onPick }: { title: string; current: string; label: string; onPick: (l: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 rounded-xl border border-ink/20 px-3 py-2.5 text-sm font-bold text-ink">
        {label} <ChevronDown className="h-4 w-4 text-ink-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lift">
          <p className="border-b border-ink/10 px-4 py-3 font-display font-extrabold">{title}</p>
          {LANGUAGES.map((l) => (
            <button key={l.code} onClick={() => { onPick(l.code); setOpen(false) }} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-ink/5">
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="flex-1">{l.label}</span>
              {current === l.code && <Check className="h-4 w-4 text-go" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
