# Billionaire Brunch

Digital headquarters for a private venture collective. The public site publishes only what administrators release. Approved members use the portal. Access is enforced in Postgres with row level security.

## Stack

Next.js, TypeScript, Tailwind CSS, Supabase Auth, Postgres, and Supabase Storage. Deploy the app on Vercel.

## Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

   Do not put the service role key in the Next.js app.

3. Apply the migration in `supabase/migrations` with the Supabase CLI or the SQL editor:

   ```bash
   supabase db push
   ```

4. Optional local catalogue: `supabase db reset` runs `supabase/seed.sql`.
5. Create your user from **Enter**, then promote that account once:

   ```sql
   update public.profiles
   set role = 'admin', membership_status = 'approved'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

   Roles live on `profiles`. They are never taken from user metadata.

6. `npm run dev`

The public catalogue is cached. A production build reads Supabase while it prerenders, so the project needs to be reachable from the build environment.

Without Supabase environment variables, the site renders a read-only catalogue so the public pages and portal can be reviewed.

## Access

- Anonymous visitors can read public, approved records and can submit interest, event registration, and the connect form.
- Approved members can read member-only records, post opportunities, manage their companies, and request introductions.
- Administrators approve members, companies, opportunities, and event guests, and they control featuring, visibility, partners, sponsors, and insights.

Private opportunities are visible to the creator, company members, and administrators.

## Later modules

Deal rooms, matching, investor portals, CRM, and a fuller sponsorship desk should reference `opportunities`, `events`, and `partners` instead of copying those tables.
