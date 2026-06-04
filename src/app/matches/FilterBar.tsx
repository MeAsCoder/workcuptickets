'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { CalendarDays, Globe, SlidersHorizontal, Search } from 'lucide-react'
import { useT } from '@/components/providers/Preferences'

const PILL = 'flex items-center gap-2 rounded-xl border border-ink/20 bg-white px-4 py-2.5 text-sm font-bold text-ink'

export default function FilterBar({
  countries,
  stages,
  current,
}: {
  countries: { code: string; label: string }[]
  stages: string[]
  current: { q?: string; country?: string; stage?: string; sort?: string }
}) {
  const router = useRouter()
  const params = useSearchParams()
  const t = useT()
  const [q, setQ] = useState(current.q || '')

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v)
      else sp.delete(k)
    }
    router.push(`/matches?${sp.toString()}`)
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    update({ q })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form onSubmit={submitSearch} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search.placeholderShort')}
          className="w-44 rounded-xl border border-ink/20 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold outline-none focus:border-brand"
        />
      </form>

      <label className={PILL}>
        <Globe className="h-4 w-4 text-ink-500" />
        <select value={current.country || ''} onChange={(e) => update({ country: e.target.value })} className="cursor-pointer bg-transparent font-bold outline-none">
          <option value="">{t('matches.country')}</option>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </label>

      <label className={PILL}>
        <CalendarDays className="h-4 w-4 text-ink-500" />
        <select value={current.stage || ''} onChange={(e) => update({ stage: e.target.value })} className="cursor-pointer bg-transparent font-bold outline-none">
          <option value="">{t('matches.stage')}</option>
          {stages.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <label className={PILL}>
        <SlidersHorizontal className="h-4 w-4 text-ink-500" />
        <select value={current.sort || 'date'} onChange={(e) => update({ sort: e.target.value })} className="cursor-pointer bg-transparent font-bold outline-none">
          <option value="date">{t('matches.sortDate')}</option>
          <option value="price">{t('matches.sortPrice')}</option>
        </select>
      </label>

      {(current.q || current.country || current.stage || current.sort) && (
        <button onClick={() => router.push('/matches')} className="rounded-xl px-3 py-2.5 text-sm font-bold text-brand hover:bg-brand/5">
          {t('matches.clear')}
        </button>
      )}
    </div>
  )
}
