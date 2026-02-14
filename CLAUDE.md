# Tradies Directory

AI-powered Australian business and tradies directory. Community-backed by 25K+ member Northern Beaches Facebook group. Competing with Hipages, Oneflare, ServiceSeeking — differentiated by AI search, community verification, and zero lead fees.

## Tech Stack
- **Framework:** Next.js 15 (App Router, React 19 RC)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui (new-york style)
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **AI:** OpenAI GPT-4o-mini (natural language search parsing)
- **Payments:** Stripe (subscription tiers: basic/pro/enterprise)
- **Maps:** Google Maps API (@react-google-maps/api)
- **Validation:** Zod
- **Geo:** geolib (distance sorting)
- **Email:** Resend (admin notifications via Supabase Edge Functions)

## Commands
- `npm run dev` — dev server (localhost:3000)
- `npm run build` — production build (USE THIS TO CHECK FOR ERRORS)
- `npm run lint` — ESLint check
- `npx supabase start` — local Supabase
- `npx supabase db push` — push migrations

## Architecture
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Homepage (server) — hero, search, ads, notice board
│   ├── layout.tsx          # Root layout — Header, Footer, Toaster
│   ├── directory/page.tsx  # Directory listing (client) — search, filter, geo-sort
│   ├── admin/page.tsx      # Admin approval queue (server) — ADMIN_EMAIL protected
│   ├── auth/
│   │   ├── login/page.tsx  # Email/password login (client)
│   │   └── signup/page.tsx # Email/password + Google OAuth signup (client)
│   ├── callback/page.tsx   # OAuth callback handler (client)
│   └── dashboard/
│       ├── layout.tsx      # Auth guard (server) — redirects if !session
│       ├── page.tsx        # Dashboard home (client)
│       ├── profile/page.tsx      # Company onboarding form (client)
│       └── subscription/page.tsx # Stripe tier selection (client)
├── components/
│   ├── AdSpot.tsx          # Ad banner with Supabase image
│   ├── ChatBox.tsx         # AI natural language search
│   ├── CompanyCard.tsx     # Full company display card
│   ├── Footer.tsx          # Site footer
│   ├── Header.tsx          # Site header with auth state (server)
│   ├── NoticeBoard.tsx     # Job listings from Supabase
│   ├── SearchBar.tsx       # Dropdown service/region search
│   └── ui/                 # shadcn/ui primitives
├── hooks/use-toast.ts      # Toast notification system
└── lib/
    ├── supabaseClient.ts   # createClient() + createServerClient()
    ├── useSession.ts       # Client-side auth session hook
    └── utils.ts            # cn() Tailwind merge utility

supabase/
├── migrations/20260115_create_tables.sql  # Full schema
└── functions/notify-admin/index.ts        # Resend email edge function

## Database Schema (Supabase PostgreSQL)
- **companies** — core entity. user_id, name, abn (unique), location (JSONB), services (TEXT[]), subscription_tier, verified, + 12 optional fields
- **regions** — normalized region lookup
- **ads** — 3 ad spots (spot 1-3, image_url, link_url, active)
- **leads** — search query tracking (query, user_location JSONB)
- **jobs** — notice board postings
- RLS enabled on companies + jobs. Auto-stub trigger on user signup.

## Key Patterns
- Server components for data fetch + auth guards
- Client components ("use client") for interactive forms and search
- createServerClient() for server, createClient() for client
- useSession() hook for client-side auth state
- Zod validation on all form inputs
- Google Places Autocomplete for location
- geolib distance sorting when user shares location
- Lead tracking: every search inserts into leads table

## Known Issues & Import Errors
- @/components/ui/use-toast import — should be @/hooks/use-toast
- @/components/ui/table not installed — needed by admin/page.tsx
- @/components/ui/badge not installed — needed by CompanyCard.tsx
- @/types/supabase doesn't exist — Database type import in supabaseClient.ts
- @stripe/stripe-js not in package.json
- globals.css has duplicate dark mode variables
- OpenAI API key exposed client-side (security risk — move to API route)
- Stripe price IDs are placeholders
- /api/create-checkout-session route doesn't exist
- Companies RLS only allows owner SELECT — needs public read for directory
- e.target.files in profile page needs null safety

---

## PHASE 0: ORIENTATION (mandatory before anything else)
1. Read this CLAUDE.md
2. Run `git status && git branch`
3. Run `git log --oneline -10`
4. Identify subsystem: auth | directory | dashboard | admin | database | payments | ai | ui | infra

## PHASE 1: PLAN (think hard — no code yet)
1. Use a subagent to explore codebase and identify all relevant files
2. List every file that needs to change, grouped by subsystem
3. Identify dependency order
4. Risk areas: CRITICAL (single-file): auth, payments, migrations, RLS. STANDARD (up to 5): UI, search, styling
5. Define test commands (`npm run build` minimum)
6. Break into batches of MAX 5 files
7. Rate confidence (1-10) per batch
8. Present plan and WAIT for approval

## PHASE 2: IMPLEMENT (one batch at a time)
1. Verify on feature/fix branch (NOT main): `git branch`
2. Make changes to this batch ONLY
3. Run `npm run build` immediately — show FULL output
4. Pass → `git add <files> && git commit -m "<type>(<scope>): <description>"`
5. Fail → diagnose, fix, re-run, only commit when clean
6. Report: files changed, build result, issues
7. If > 3 failures → STOP and report

## PHASE 3: VALIDATE (after all batches)
1. `npm run build`
2. `npm run lint`
3. Verify no TypeScript errors or missing imports
4. Summarize: total files changed, build status, remaining issues

## RULES (non-negotiable)
- NEVER modify .env or .env.local files
- NEVER skip `npm run build` between batches
- NEVER guess or fabricate build output
- NEVER commit secrets or API keys
- NEVER install packages without checking package.json first
- NEVER change database schema without approval
- NEVER modify RLS policies without approval
- ALWAYS use existing shadcn/ui components first
- ALWAYS follow @/ import alias pattern
- ALWAYS maintain "use client" / server component separation
- Use subagents for research to preserve context
- If context > 50%, use /clear and restart from CLAUDE.md

## ENV VARS (see .env.example)

---

## TODAY'S TASK
[TASK]: _______________________________________________
