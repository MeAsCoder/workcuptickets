'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useT } from '@/components/providers/Preferences'
import { localeFor } from '@/lib/preferences'
import { usePreferences } from '@/components/providers/Preferences'

interface EventHit {
  id: string
  num: number | null
  group: string | null
  stage: string
  homeTeam: string
  awayTeam: string
  date: string
}

function highlight(text: string, q: string) {
  if (!q) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-lime/70 px-0.5 text-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  )
}

export default function SearchBox({ variant = 'desktop', onNavigate }: { variant?: 'desktop' | 'mobile'; onNavigate?: () => void }) {
  const t = useT()
  const { lang } = usePreferences()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [hits, setHits] = useState<{ events: EventHit[]; teams: string[] }>({ events: [], teams: [] })
  const [loading, setLoading] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits({ events: [], teams: [] })
      return
    }
    setLoading(true)
    const ctrl = new AbortController()
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal })
        if (res.ok) setHits(await res.json())
      } catch {
        /* aborted */
      } finally {
        setLoading(false)
      }
    }, 220)
    return () => {
      clearTimeout(id)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function go(url: string) {
    setOpen(false)
    onNavigate?.()
    router.push(url)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    go(q.trim() ? `/matches?q=${encodeURIComponent(q.trim())}` : '/matches')
  }

  const hasResults = hits.events.length > 0 || hits.teams.length > 0
  const showDropdown = open && q.trim().length >= 2

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit}>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-500" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={variant === 'mobile' ? t('search.placeholderShort') : t('search.placeholder')}
          className="w-full rounded-xl border border-ink/15 bg-white py-3 pl-12 pr-4 text-ink outline-none transition placeholder:text-ink-500/70 focus:border-brand focus:ring-4 focus:ring-brand/10"
          aria-label={t('search.placeholder')}
        />
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-auto rounded-2xl border border-ink/10 bg-white p-2 shadow-lift">
          {loading && !hasResults && <p className="px-3 py-3 text-sm text-ink-500">…</p>}

          {!loading && !hasResults && (
            <p className="px-3 py-3 text-sm text-ink-500">{t('search.none')}</p>
          )}

          {hits.events.length > 0 && (
            <div className="mb-1">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink-500">{t('search.events')}</p>
              {hits.events.map((m) => (
                <button
                  key={m.id}
                  onClick={() => go(`/matches/${m.id}`)}
                  className="block w-full rounded-lg px-3 py-2 text-left hover:bg-ink/5"
                >
                  <span className="block text-sm font-semibold text-ink">
                    MATCH {m.num} {m.group ? `${m.group}: ` : `${m.stage}: `}
                    {highlight(`${m.homeTeam} vs ${m.awayTeam}`, q.trim())}
                  </span>
                  <span className="block text-xs text-ink-500">
                    {new Intl.DateTimeFormat(localeFor(lang), { month: 'short', day: 'numeric' }).format(new Date(m.date))}
                    {' · '}
                    {new Intl.DateTimeFormat(localeFor(lang), { hour: '2-digit', minute: '2-digit' }).format(new Date(m.date))}
                  </span>
                </button>
              ))}
            </div>
          )}

          {hits.teams.length > 0 && (
            <div className="mb-1 border-t border-ink/10 pt-1">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-ink-500">{t('search.teams')}</p>
              <div className="flex flex-wrap gap-2 px-3 py-1">
                {hits.teams.map((tm) => (
                  <button
                    key={tm}
                    onClick={() => go(`/matches?q=${encodeURIComponent(tm)}`)}
                    className="rounded-full border border-ink/15 px-3 py-1 text-sm font-semibold hover:border-brand hover:text-brand"
                  >
                    {highlight(tm, q.trim())}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => go(q.trim() ? `/matches?q=${encodeURIComponent(q.trim())}` : '/matches')}
            className="mt-1 w-full rounded-xl border border-ink/20 px-3 py-3 text-center text-sm font-bold text-ink transition hover:bg-ink/5"
          >
            {t('search.all')}
          </button>
        </div>
      )}
    </div>
  )
}
