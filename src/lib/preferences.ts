// Shared, framework-agnostic preference helpers (usable in both server and
// client code). No React, no next/headers here.

export interface Currency {
  code: string
  symbol: string
  label: string
  rate: number // multiply a USD amount by this
}

export const CURRENCIES: Currency[] = [
  { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.79 },
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 1.52 },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', rate: 1.37 },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc', rate: 0.88 },
]

export interface Language {
  code: string
  label: string
  flag: string
  locale: string
}

export const LANGUAGES: Language[] = [
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧', locale: 'en-GB' },
  { code: 'en-US', label: 'English (USA)', flag: '🇺🇸', locale: 'en-US' },
  { code: 'es', label: 'Español', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', locale: 'nl-NL' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', locale: 'fr-FR' },
]

export const DEFAULT_CURRENCY = 'USD'
export const DEFAULT_LANG = 'en-US'
export const CURRENCY_COOKIE = 't26_currency'
export const LANG_COOKIE = 't26_lang'

export function currencyFor(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[1]
}

export function localeFor(lang: string): string {
  return LANGUAGES.find((l) => l.code === lang)?.locale || 'en-US'
}

export function convert(usd: number, currencyCode: string): number {
  return usd * currencyFor(currencyCode).rate
}

export function formatPrice(usd: number, currencyCode: string, lang: string): string {
  const cur = currencyFor(currencyCode)
  try {
    return new Intl.NumberFormat(localeFor(lang), {
      style: 'currency',
      currency: cur.code,
      maximumFractionDigits: 0,
    }).format(usd * cur.rate)
  } catch {
    return `${cur.symbol}${Math.round(usd * cur.rate).toLocaleString()}`
  }
}

export function formatDateLocalized(date: Date | string, lang: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(localeFor(lang), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}
