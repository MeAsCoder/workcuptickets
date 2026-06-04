import { LegalLayout } from '@/components/Legal'
export const metadata = { title: 'Terms of Service — Touchline26' }
export default function Terms() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>Welcome to Touchline26. By creating an account or reserving seats, you agree to these terms. Touchline26 is an independent reseller of reserved-seat tickets and is not affiliated with, endorsed by, or sponsored by FIFA or any official tournament body.</p>
      <h2>Reservations &amp; holds</h2>
      <p>When you add seats to your cart, we place a temporary hold on those seats. Holds expire automatically, releasing the seats back to general availability. Completing checkout starts a fixed payment window during which the seats remain yours.</p>
      <h2>Payment</h2>
      <p>Payment is arranged directly with our team over WhatsApp using the order code shown at checkout. Tickets are issued only after payment is confirmed. We never ask for card details inside this website.</p>
      <h2>Tickets</h2>
      <p>Issued tickets carry a unique QR code per seat. You are responsible for keeping these codes private. Duplicated or screenshotted codes may be refused entry if already scanned.</p>
      <h2>Refunds</h2>
      <p>Refund eligibility depends on the circumstances of the match and is handled case by case. Contact support with your order code.</p>
      <h2>Acceptable use</h2>
      <p>You agree not to abuse the reservation system, attempt to circumvent hold limits, or resell tickets obtained here in violation of local law.</p>
    </LegalLayout>
  )
}
