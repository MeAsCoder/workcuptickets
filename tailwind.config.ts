import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pitch & Ink palette
        cream: {
          DEFAULT: '#FAF6EC',
          50: '#FDFBF5',
          100: '#FAF6EC',
          200: '#F2EAD6',
        },
        ink: {
          DEFAULT: '#11150F',
          800: '#1A1F17',
          700: '#272E22',
          600: '#3A4233',
          500: '#5A6450',
        },
        pitch: {
          DEFAULT: '#0E6B3F',
          dark: '#0A4F2E',
          light: '#168A52',
          50: '#E8F5EE',
        },
        lime: {
          DEFAULT: '#CDFF3A',
          dark: '#B6E82A',
          soft: '#EAFFB0',
        },
        clay: '#E0552B',
        // screenshot-matching tokens
        brand: { DEFAULT: '#E2231A', dark: '#C21B13', light: '#F4433A' },
        go: { DEFAULT: '#22C39A', dark: '#17A886' },
        coral: '#EC6A63',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,21,15,0.04), 0 8px 24px -12px rgba(17,21,15,0.18)',
        lift: '0 20px 50px -20px rgba(17,21,15,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
}
export default config
