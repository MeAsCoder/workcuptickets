# Touchline26 — World Cup 2026 Ticket Resale

A polished, fully working reserved-seat ticket marketplace built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Prisma + SQLite**. No Docker, Postgres, Redis, or mail server required to run.

## Why this runs out of the box

The previous version required PostgreSQL, Redis, Docker, and SMTP all configured before it would start. This rebuild removes those hard dependencies:

- **SQLite** instead of Postgres — the database is a single file, created automatically.
- **No Redis** — reservation expiry is handled with plain database queries.
- **Graceful email** — if no SMTP is configured, "sent" emails are logged to the server console instead of crashing.
- **Printable QR tickets** — tickets render in the browser as QR codes you can print or save as PDF (serverless-safe, no filesystem writes).

## Quick start (local)

This app uses **PostgreSQL**. The easiest path is a free [Neon](https://neon.tech) database (or Vercel Postgres) for both local and production.

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Put your Postgres connection strings in .env
#    (copy .env.example → .env and fill DATABASE_URL + DATABASE_URL_UNPOOLED)

# 3. Create the tables + seed fixtures (fetched live from openfootball) and demo users
npm run db:setup        # = prisma db push && node prisma/seed.mjs

# 4. Start the dev server
npm run dev
```

Then open http://localhost:3000.

## Deploy to Vercel (with Neon Postgres)

1. **Create the database.** In Vercel → **Storage → Create → Neon**. Enable it for Production, Preview and Development. Neon automatically adds `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) to your project — these are exactly what `prisma/schema.prisma` reads, so no extra env wiring is needed for the database.
   _(If you only see `POSTGRES_*` variables, add `DATABASE_URL` = `POSTGRES_PRISMA_URL` and `DATABASE_URL_UNPOOLED` = `POSTGRES_URL_NON_POOLING`.)_

2. **Set the remaining env vars** in Vercel → Settings → Environment Variables: `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`.

3. **Deploy** (push to Git or `vercel --prod`). The build runs `prisma generate && next build` automatically.

4. **Seed the cloud database once, from your machine.** Copy the two connection strings from Vercel → Storage → your DB. Use the **direct (unpooled)** string for this:

   ```bash
   export DATABASE_URL="<DATABASE_URL_UNPOOLED value>"
   export DATABASE_URL_UNPOOLED="<DATABASE_URL_UNPOOLED value>"
   npx prisma db push        # creates the tables on Neon
   node prisma/seed.mjs       # fetches 104 fixtures + flags and inserts them
   ```

   The seed is idempotent (it skips if matches already exist) and takes ~30–60s over the network. Reload your site — the fixtures now appear.

> There is no "run db:setup on Vercel" step — Vercel's filesystem is ephemeral, so the database lives in Neon and you seed it once from your machine (or any environment that can reach Neon). The deployed app just reads from it.

## Demo accounts

| Role     | Email                          | Password   |
|----------|--------------------------------|------------|
| Admin    | `admin@worldcuptickets.test`   | `admin1234`|
| Customer | `fan@worldcuptickets.test`     | `fan12345` |

## How the flow works

1. **Browse matches** → open a match to see the interactive stadium map.
2. **Select seats** → seats are reserved (held) instantly via a database transaction that prevents double-booking. Holds last 30 minutes.
3. **Checkout** → an order is created with an order code. Pay via the pre-filled WhatsApp link.
4. **Admin confirms payment** → from `/admin`, confirming an order marks seats `SOLD`, issues the order, and emails the customer.
5. **Tickets** → the customer views/prints QR tickets (one unique QR per seat) at `/dashboard/tickets/[orderId]`.

## Useful scripts

```bash
npm run dev        # start dev server
npm run build      # prisma generate + next build
npm run start      # start production server (after build)
npm run db:setup   # create tables + seed (first-time setup)
npm run db:seed    # seed matches and demo users (idempotent)
npm run db:reset   # wipe + recreate + seed the database
npm run cleanup    # release expired holds / orders (cron-friendly)
```

## Configuration (`.env`)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file path (default `file:./dev.db`) |
| `JWT_SECRET` | Secret used to sign session cookies — **change in production** |
| `NEXT_PUBLIC_SITE_URL` | Base URL used in ticket links |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Business WhatsApp number for payments |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin credentials |
| `SMTP_*`, `EMAIL_FROM` | Optional. Leave blank to log emails to console |

## Tech notes

- Auth uses an httpOnly session cookie signed with `jose` (edge-safe), verified in `middleware.ts`.
- Passwords are hashed with `bcryptjs` (pure JS — no native build step).
- All status fields are strings (SQLite has no enums) with typed constants in `src/lib/constants.ts`.
- Seat holds are enforced with conditional `updateMany` guards inside transactions, so two people can never grab the same seat.

## Switching to PostgreSQL later

Change the datasource in `prisma/schema.prisma` to `provider = "postgresql"`, set `DATABASE_URL` to your Postgres connection string, then run `npx prisma db push && npm run db:seed`. No application code needs to change.
