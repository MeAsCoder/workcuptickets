'use client'

import { cn } from '@/lib/utils'

export interface SeatVM {
  id: string
  row: string
  number: number
  status: string // AVAILABLE | RESERVED | SOLD
  price: number
  categoryName: string
  accent: string // lime | pitch | clay
}

const ACCENT_BG: Record<string, string> = {
  lime: 'bg-lime/70 hover:bg-lime border-lime-dark/40 text-ink',
  pitch: 'bg-pitch/15 hover:bg-pitch/30 border-pitch/40 text-pitch-dark',
  clay: 'bg-clay/15 hover:bg-clay/30 border-clay/40 text-clay',
}

export default function SeatMap({
  seats,
  selected,
  onToggle,
  maxSelect,
}: {
  seats: SeatVM[]
  selected: string[]
  onToggle: (id: string) => void
  maxSelect: number
}) {
  const rows = Array.from(new Set(seats.map((s) => s.row)))
  const byRow = rows.map((r) => ({
    row: r,
    seats: seats.filter((s) => s.row === r).sort((a, b) => a.number - b.number),
  }))

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-gradient-to-b from-white to-cream/60 p-5 sm:p-8">
      <div className="min-w-[560px]">
        {/* Pitch */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="relative h-12 rounded-t-[100%] bg-gradient-to-b from-pitch to-pitch-dark shadow-inner">
            <span className="absolute inset-x-0 top-3 text-center font-display text-xs font-bold uppercase tracking-[0.3em] text-lime/90">
              Pitch
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {byRow.map(({ row, seats: rowSeats }) => (
            <div key={row} className="flex items-center justify-center gap-2">
              <span className="w-6 text-center text-xs font-bold text-ink-500">{row}</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {rowSeats.map((seat) => {
                  const isSelected = selected.includes(seat.id)
                  const isAvailable = seat.status === 'AVAILABLE'
                  const atLimit = !isSelected && selected.length >= maxSelect
                  return (
                    <button
                      key={seat.id}
                      type="button"
                      disabled={!isAvailable || atLimit}
                      onClick={() => onToggle(seat.id)}
                      title={`${seat.row}${seat.number} · ${seat.categoryName} · $${seat.price}`}
                      className={cn(
                        'h-8 w-8 rounded-t-lg border text-[11px] font-bold transition-all duration-100',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch/40',
                        isSelected && 'scale-110 border-ink bg-ink text-lime shadow-lift',
                        !isSelected && isAvailable && ACCENT_BG[seat.accent],
                        seat.status === 'SOLD' && 'cursor-not-allowed border-ink/10 bg-ink/10 text-ink/30',
                        seat.status === 'RESERVED' && 'cursor-not-allowed border-amber-300 bg-amber-200/60 text-amber-700/70',
                        atLimit && isAvailable && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      {seat.number}
                    </button>
                  )
                })}
              </div>
              <span className="w-6" />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-600">
          <Legend className="bg-ink text-lime" label="Selected" />
          <Legend className="bg-lime/70 border border-lime-dark/40" label="Category 1" />
          <Legend className="bg-pitch/20 border border-pitch/40" label="Category 2" />
          <Legend className="bg-clay/20 border border-clay/40" label="Category 3" />
          <Legend className="bg-amber-200/70 border border-amber-300" label="Reserved" />
          <Legend className="bg-ink/10 border border-ink/10" label="Sold" />
        </div>
      </div>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('inline-block h-4 w-4 rounded', className)} />
      {label}
    </span>
  )
}
