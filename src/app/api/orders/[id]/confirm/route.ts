import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

// Customers cannot self-confirm payment; confirmation is an admin action.
export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(
    { error: 'Payment confirmation is handled by our team after WhatsApp payment.' },
    { status: 403 },
  )
}
