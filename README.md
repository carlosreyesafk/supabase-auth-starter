# Supabase Auth Starter

**Live Demo:** [https://supabase-auth-starter-eight.vercel.app](https://supabase-auth-starter-eight.vercel.app)


A minimal, production-shaped auth foundation: **Next.js (App Router) + TypeScript + Supabase Auth** via `@supabase/ssr` — the current recommended package for cookie-based sessions in Next.js.

> Screenshots: add `screenshots/login.png` and `screenshots/dashboard.png` here after deploying.

## What it demonstrates

- **Email/password sign-up + login** with loading and error states.
- **Google OAuth** button wired through Supabase Auth (`signInWithOAuth` + `/auth/callback` code exchange).
- **Protected `/dashboard` route** — guarded twice: `middleware.ts` refreshes the session and redirects signed-out visitors; the server component re-checks with `getUser()`.
- **Row Level Security**: `supabase/schema.sql` creates a `profiles` table where users can only read/update/insert their **own** row (`auth.uid() = id`), plus a trigger that auto-creates the profile on signup.
- Clean separation: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/middleware.ts` (session refresh).

## 1. Create the free Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign up / log in.
2. Click **New project**, pick a name, generate a database password, choose the nearest region → **Create new project** (takes ~2 minutes).
3. Open the **SQL Editor** (left sidebar) → **New query** → paste the full contents of `supabase/schema.sql` → **Run**. You should see "Success. No rows returned".
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configure the app

```bash
cp .env.example .env.local
# paste the two values into .env.local
npm install
npm run dev
```

Open http://localhost:3000, create an account, and you'll land on `/dashboard`.

> **Email confirmation:** Supabase enables "Confirm email" by default. For quick local testing, disable it at **Authentication → Providers → Email → Confirm email** — or keep it on and confirm via the inbox.

## 3. Enable Google OAuth (optional)

1. In [Google Cloud Console](https://console.cloud.google.com), create OAuth 2.0 credentials (Web application) and add this authorized redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. In Supabase go to **Authentication → Providers → Google** → enable it and paste the Client ID + Client Secret.
3. Back in the app, add your dev URL to **Authentication → URL Configuration → Redirect URLs** (e.g. `http://localhost:3000/**`).

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In [Vercel](https://vercel.com): **Add New → Project** → import the repo.
3. Under **Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as `.env.local`).
4. In Supabase **Authentication → URL Configuration**, add your production URL (e.g. `https://your-app.vercel.app/**`) to Redirect URLs.
5. Click **Deploy**.

## Project structure

```
lib/supabase/
  client.ts       # browser client (Client Components)
  server.ts       # server client (Server Components / Route Handlers)
  middleware.ts   # session refresh + /dashboard protection
supabase/
  schema.sql      # profiles table + RLS policies + signup trigger
app/
  page.tsx              # login / signup (redirects if already signed in)
  auth/callback/route.ts# OAuth code exchange
  dashboard/page.tsx    # protected page: session + RLS profile row
components/
  AuthForm.tsx    # email/password tabs + Google button
  LogoutButton.tsx
middleware.ts     # runs updateSession on every request
```
