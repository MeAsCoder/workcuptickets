import { LegalLayout } from '@/components/Legal'
export const metadata = { title: 'Privacy Policy — Touchline26' }
export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>We collect only what we need to sell you a ticket: your name, email, password (stored hashed), and your order history. We do not sell your personal data.</p>
      <h2>What we store</h2>
      <p>Account details, the seats you reserve, and the status of your orders. Passwords are hashed with bcrypt and are never stored in plain text.</p>
      <h2>Communications</h2>
      <p>We use your email to send order confirmations and issued tickets. Payment coordination happens over WhatsApp at your initiation.</p>
      <h2>Cookies</h2>
      <p>We use a single secure, httpOnly session cookie to keep you signed in. No third-party advertising trackers are used.</p>
      <h2>Your rights</h2>
      <p>You may request deletion of your account and associated data at any time by contacting support.</p>
    </LegalLayout>
  )
}
