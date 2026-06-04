// Decorative scalloped banner evoking the World Cup 2026 brand pattern.
// Pure SVG, symmetric palette, scales to any width.
const PALETTE = [
  '#1B9E8A', // teal
  '#5B2A86', // purple
  '#8FB339', // olive
  '#2E4A9E', // blue
  '#9A6CA0', // mauve
  '#B11E2F', // red
  '#5B0E14', // dark maroon (center)
]

export default function WorldCupBanner({ className = '' }: { className?: string }) {
  // Build a symmetric set of columns: palette then mirrored back.
  const cols = [...PALETTE, ...[...PALETTE].reverse().slice(1)]
  const n = cols.length
  const W = 1400
  const H = 240
  const cw = W / n
  const r = cw * 0.72

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="World Cup 2026 pattern"
    >
      {/* base vertical color bands */}
      {cols.map((c, i) => (
        <rect key={`b${i}`} x={i * cw} y={0} width={cw + 0.5} height={H} fill={c} />
      ))}
      {/* scallop bulges: big circles straddling each seam, alternating up/down */}
      {cols.map((c, i) => {
        const nextColor = cols[(i + 1) % n]
        const cx = i * cw + cw
        return (
          <g key={`s${i}`}>
            <circle cx={cx} cy={H * 0.16} r={r} fill={nextColor} opacity={0.92} />
            <circle cx={cx - cw} cy={H * 0.84} r={r} fill={c} opacity={0.92} />
          </g>
        )
      })}
      {/* subtle darkening at the very bottom for text legibility */}
      <rect x={0} y={H - 60} width={W} height={60} fill="url(#fade)" />
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
    </svg>
  )
}
