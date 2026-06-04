import { LegalLayout } from '@/components/Legal'
export const metadata = { title: 'Reseller Disclaimer — Touchline26' }
export default function Disclaimer() {
  return (
    <LegalLayout title="Reseller Disclaimer" updated="June 2026">
      <p>Touchline26 is an independent ticket resale marketplace. We are not affiliated with FIFA, any national football association, stadium operator, or official ticketing partner. All team names, tournament references, and stadium names are used for identification purposes only.</p>
      <h2>Pricing</h2>
      <p>Resale prices are set independently and may differ from face value. Prices reflect availability and demand.</p>
      <h2>No guarantee of affiliation</h2>
      <p>Any resemblance to official branding is incidental. Always verify entry requirements with the official organizers for your event.</p>
    </LegalLayout>
  )
}
