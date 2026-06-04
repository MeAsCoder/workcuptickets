'use client'

import { usePrice } from '@/components/providers/Preferences'

export default function Price({ usd, className }: { usd: number; className?: string }) {
  const format = usePrice()
  return <span className={className}>{format(usd)}</span>
}
