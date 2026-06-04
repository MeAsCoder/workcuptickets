import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'
import { getSession } from '@/lib/session'
import { PreferencesProvider } from '@/components/providers/Preferences'
import { getServerPreferences } from '@/lib/serverPreferences'

export const metadata: Metadata = {
  title: 'Touchline26 — Reserved-seat World Cup tickets',
  description:
    'Pick your seats for the 2026 tournament, hold them while you pay over WhatsApp, and get QR tickets the moment payment clears.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const user = session
    ? { email: session.email, name: (session.name as string) ?? null, role: session.role }
    : null
  const { currency, lang } = getServerPreferences()

  return (
    <html lang={lang.startsWith('en') ? 'en' : lang}>
      <body>
        <PreferencesProvider initialCurrency={currency} initialLang={lang}>
          <div className="flex min-h-screen flex-col">
            <Navbar user={user} />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </PreferencesProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { borderRadius: '12px', background: '#11150f', color: '#faf6ec' },
          }}
        />
      </body>
    </html>
  )
}
