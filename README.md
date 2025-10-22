# AutoMatch

A Next.js + Supabase application that simulates a car financing marketplace with two portals:

- User Portal: manage profile, upload required documents, view matches, and track contracts.
- Dealer Portal: see incoming match requests, view customer profiles (with a “Customer Validity Score”), and send offers.

## Overview

- App Router pages
  - `/login` – email/password authentication (Supabase Auth).
  - `/user` – tabbed portal: Profile, Documents, Matches, Contracts.
  - `/dealer` and `/dealer/dashboard` – dealer views for pending match requests and customer profiles.
- Data interactions (via Supabase)
  - Reads and writes to `profiles`, `customer_documents`, `customer_matches`, `match_requests`, `dealer_offers`, and `cars` tables.
  - Uses a service-role client on server routes to bypass RLS where needed.
- UX touches
  - “Find matches” button shows a 30-second loading animation in the Matches tab.
  - “Customer Validity Score” displays a randomized score each time the profile dialog opens.
  - Toast notifications for key actions.

## Tech Stack

- Next.js `15.5.6` (App Router)
- React `19.1.0`, TypeScript
- Supabase JS `^2.75.1`
- Tailwind CSS `^4` (with `@tailwindcss/postcss`)
- Zustand, React Hook Form, Zod
- Sonner (toasts), Lucide React (icons)

## Quick Start

- Requirements
  - Node.js 18+ (20+ recommended)
  - A Supabase project (hosted or local)

- Install dependencies
  ```bash
  npm install
  ```

- Create environment file at `car-platform/.env.local`:
  ```ini
  NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
  ```

- Run the dev server
  ```bash
  npm run dev
  ```

- Open the app at `http://localhost:3000/`

### Supabase (optional local setup)

If you want to run Supabase locally, the repo includes CLI config at `supabase/config.toml`. You can start the local stack with:

```bash
npx supabase start
```

Note: The CLI must be installed or available via `npx`. Check Supabase docs for prerequisites (Docker, etc.).

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (public client).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key for client-side auth and queries.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key used on server routes to bypass RLS when needed.

## Features

- User Portal (`/user`)
  - Profile: update `name`, `email`, `phone`, `zip`.
  - Documents: upload via server API; ensures a `customer-documents` storage bucket exists and creates a `customer_documents` row.
  - Matches: fetches `customer_matches` for the signed-in user; includes a “Find matches” button with a 30-second spinner; can send offer requests to dealers via `match_requests`.
  - Contracts: aggregates pending/denied requests and dealer offers; hides pending items that already have an offer.

- Dealer Portal (`/dealer`, `/dealer/dashboard`)
  - Lists pending `match_requests` for the dealer.
  - Customer Profile dialog with a randomized “Customer Validity Score”.
  - Actions:
    - Reject: sets `match_requests.status = 'denied'`.
    - Send Offer: posts to `/api/dealer/offer` (JSON or form fields).

## API Routes

- `GET /api/dealer/requests?dealer_id=...`
  - Returns pending match requests for a dealer along with matching `profiles` data.
  - Uses service role (`getServiceSupabase`).

- `POST /api/dealer/offer`
  - Accepts JSON or `formData` fields: `dealer_id`, `request_id`, `customer_id`, optional `pdf_url`.
  - Inserts into `dealer_offers`.

- `POST /api/customer-documents/upload`
  - Accepts `customer_id`, `doc_type`, `file`.
  - Ensures `customer-documents` bucket exists, uploads the file, and inserts into `customer_documents`.

- `POST /api/profile/update`
  - Upserts `profiles` for a given `user_id` and sets `role` when missing.

- `POST /api/storage/ensure-bucket`
  - Ensures a named storage bucket exists (optional helper).

## Data Model (what the app expects)

This project includes a migration for `profiles` with RLS enabled. Other tables are used by the app but not defined in migrations here; create them in your Supabase project. Minimal columns (inferred from code) you will need:

- `profiles`: `user_id (uuid, PK)`, `email`, `name`, `role ('customer'|'dealer')`, `phone`, `zip`
- `customer_documents`: `id`, `customer_id (uuid)`, `doc_type`, `file_path`
- `customer_matches`: `id`, `customer_id (uuid)`, `car_id (references cars.id)` (joined via `cars(*)`)
- `match_requests`: `id`, `customer_id (uuid)`, `dealer_id (uuid)`, `status ('pending'|'denied'|...)`, optionally `pricing_plan_id`
- `dealer_offers`: `id`, `dealer_id (uuid)`, `request_id`, `customer_id (uuid)`, `pdf_url (nullable)`
- `cars`: fields used include `id`, `dealer_id`, `make`, `model`, `year`, `msrp`, `apr`, `monthly_rate`, `time`
- `pricing_plans`: fields used include `id`, `plan`, `monthly`, `term`, `apr`, possibly relationships to `cars`

Adjust the schema to your needs; set RLS and foreign keys appropriately for production. Server APIs use the service role to operate when RLS is enabled.

## Project Structure

- `src/app/` – Next.js App Router pages
  - `user/` – tabbed portal page and standalone pages (e.g., `matches`, `contracts`, `profile`)
  - `dealer/` – dealer portal pages
  - `api/` – server routes using the service role for DB/storage
- `src/lib/` – supabase clients, domain utilities, and data helpers
  - `supabaseClient.ts` – public client using `NEXT_PUBLIC_*` env
  - `supabaseServer.ts` – service role client using `SUPABASE_SERVICE_ROLE_KEY`
- `src/components/` – UI components (dialogs, buttons, etc.)
- `src/store/` – Zustand stores
- `supabase/` – CLI config and migrations (profiles)

## Scripts

- Dev server
  ```bash
  npm run dev
  ```
- Build
  ```bash
  npm run build
  ```
- Start (production)
  ```bash
  npm run start
  ```
- Lint
  ```bash
  npm run lint
  ```

## Notes & Limitations

- Only `profiles` has a migration here; other tables must exist in your Supabase project.
- Several server APIs rely on the service role key; keep it secret and never expose it to the client.
- The “Find matches” button is purely UI (spinner for ~30 seconds); it does not trigger backend matching logic.
- The “Customer Validity Score” is randomized on dialog open and intended for demo purposes.

## Contributing

Pull requests welcome. Keep changes focused and consistent with the existing style. Configure RLS and migrations before shipping any production changes.

