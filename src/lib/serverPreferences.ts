import { cookies } from 'next/headers'
import {
  CURRENCY_COOKIE,
  LANG_COOKIE,
  DEFAULT_CURRENCY,
  DEFAULT_LANG,
  formatPrice,
} from '@/lib/preferences'
import { t as translate } from '@/lib/i18n'

export function getServerPreferences() {
  const jar = cookies()
  return {
    currency: jar.get(CURRENCY_COOKIE)?.value || DEFAULT_CURRENCY,
    lang: jar.get(LANG_COOKIE)?.value || DEFAULT_LANG,
  }
}

// Format a USD amount in the visitor's chosen currency (server components).
export function fmtServer(usd: number): string {
  const { currency, lang } = getServerPreferences()
  return formatPrice(usd, currency, lang)
}

// Translate a key in the visitor's chosen language (server components).
export function tServer(key: string, vars?: Record<string, string | number>): string {
  const { lang } = getServerPreferences()
  return translate(lang, key, vars)
}
