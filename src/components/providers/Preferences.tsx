'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CURRENCY_COOKIE,
  LANG_COOKIE,
  DEFAULT_CURRENCY,
  DEFAULT_LANG,
  formatPrice,
} from '@/lib/preferences'
import { t as translate } from '@/lib/i18n'

interface PrefsValue {
  currency: string
  lang: string
  setCurrency: (c: string) => void
  setLanguage: (l: string) => void
  t: (key: string, vars?: Record<string, string | number>) => string
  format: (usd: number) => string
}

const PreferencesContext = createContext<PrefsValue | null>(null)

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;samesite=lax`
}

export function PreferencesProvider({
  initialCurrency = DEFAULT_CURRENCY,
  initialLang = DEFAULT_LANG,
  children,
}: {
  initialCurrency?: string
  initialLang?: string
  children: React.ReactNode
}) {
  const [currency, setCur] = useState(initialCurrency)
  const [lang, setLang] = useState(initialLang)
  const router = useRouter()

  const setCurrency = useCallback(
    (c: string) => {
      setCookie(CURRENCY_COOKIE, c)
      setCur(c)
      router.refresh() // re-render server components that price in the cookie's currency
    },
    [router],
  )

  const setLanguage = useCallback(
    (l: string) => {
      setCookie(LANG_COOKIE, l)
      setLang(l)
      router.refresh()
    },
    [router],
  )

  const value = useMemo<PrefsValue>(
    () => ({
      currency,
      lang,
      setCurrency,
      setLanguage,
      t: (key, vars) => translate(lang, key, vars),
      format: (usd) => formatPrice(usd, currency, lang),
    }),
    [currency, lang, setCurrency, setLanguage],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences(): PrefsValue {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider')
  return ctx
}

export function useT() {
  return usePreferences().t
}

export function usePrice() {
  return usePreferences().format
}
