export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  ISSUED: 'ISSUED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const
export type OrderStatus = keyof typeof ORDER_STATUS

export const SEAT_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  SOLD: 'SOLD',
} as const
export type SeatStatus = keyof typeof SEAT_STATUS

export const ORDER_STATUS_META: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: 'Awaiting payment', className: 'bg-amber-100 text-amber-800 ring-amber-200' },
  CONFIRMED: { label: 'Payment confirmed', className: 'bg-sky-100 text-sky-800 ring-sky-200' },
  ISSUED: { label: 'Tickets issued', className: 'bg-pitch-50 text-pitch-dark ring-pitch/30' },
  CANCELLED: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700 ring-rose-200' },
  EXPIRED: { label: 'Expired', className: 'bg-ink-100 text-ink-500 ring-ink-200' },
}

// minutes a reservation is held while the customer pays
export const RESERVATION_MINUTES = 30
export const MAX_SEATS_PER_ORDER = 8
