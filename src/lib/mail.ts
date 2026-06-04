interface MailInput {
  to: string
  subject: string
  html: string
}

/**
 * Sends an email when SMTP env vars are present; otherwise logs to the server
 * console so the app works out of the box without any mail provider.
 * nodemailer is imported lazily and is an OPTIONAL dependency.
 */
export async function sendEmail({ to, subject, html }: MailInput) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('\n────────── EMAIL (SMTP not configured, logging only) ──────────')
    console.log(`To:      ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    console.log('───────────────────────────────────────────────────────────────\n')
    return { delivered: false as const }
  }

  try {
    // Lazy require so the package is optional.
    const nodemailer = (await import('nodemailer')).default
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT || '587', 10),
      secure: false,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
    await transporter.sendMail({ from: EMAIL_FROM || SMTP_USER, to, subject, html })
    return { delivered: true as const }
  } catch (err) {
    console.error('Email send failed:', err)
    return { delivered: false as const }
  }
}

export function ticketsReadyEmail(reference: string, total: number, link: string) {
  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
    <div style="background:#0E6B3F;color:#CDFF3A;padding:24px 28px;border-radius:16px 16px 0 0">
      <h1 style="margin:0;font-size:22px">Your tickets are ready ⚽</h1>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:28px;border-radius:0 0 16px 16px">
      <p>Order <strong>${reference}</strong> is confirmed.</p>
      <p>Total paid: <strong>$${total}</strong></p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#0E6B3F;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;display:inline-block">
          View &amp; download your tickets
        </a>
      </p>
      <p style="color:#666;font-size:14px">Present the QR code at the stadium entrance. Each seat has its own QR code.</p>
    </div>
  </div>`
}
