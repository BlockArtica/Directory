# Tradies Directory — Master TODO

## 🔴 PHASE 1: STABILIZE

### Batch 1.1 — Config Cleanup
- [x] Delete next.config.ts (keep .js)
- [x] Delete postcss.config.mjs (keep .js)
- [x] Add supabase/.temp/ and *.deb to .gitignore
- [x] Remove supabase/.temp/ from git tracking
- [x] Create .env.example

### Batch 1.2 — Missing Dependencies
- [ ] Install shadcn/ui: `npx shadcn@latest add table badge`
- [ ] Install @stripe/stripe-js: `npm install @stripe/stripe-js`
- [ ] Verify all package.json deps match imports

### Batch 1.3 — Fix Broken Imports
- [ ] directory/page.tsx — @/components/ui/use-toast → @/hooks/use-toast
- [ ] subscription/page.tsx — @/components/ui/use-toast → @/hooks/use-toast
- [ ] admin/page.tsx — remove useToast (server component)
- [ ] supabaseClient.ts — remove Database type or create @/types/supabase.ts

### Batch 1.4 — Build Clean
- [ ] Run npm run build and fix ALL TypeScript errors
- [ ] Fix handleLogout server actions
- [ ] Fix e.target.files null safety in profile
- [ ] Fix globals.css duplicate dark mode vars
- [ ] Achieve zero-error build

## 🟠 PHASE 2: CORE FUNCTIONALITY

### Batch 2.1 — Auth Hardening
- [ ] Install @supabase/ssr for proper SSR auth
- [ ] Replace createServerClient() with cookie-based client
- [ ] Fix OAuth callback to PKCE flow
- [ ] Add auth middleware
- [ ] Test full login/logout flow

### Batch 2.2 — Database & RLS
- [ ] Public SELECT on companies (WHERE verified = true)
- [ ] Public SELECT on ads
- [ ] INSERT on leads for anonymous users
- [ ] Generate Supabase types file
- [ ] Test all RLS policies

### Batch 2.3 — Stripe Integration
- [ ] Create /api/create-checkout-session
- [ ] Add /api/webhooks/stripe
- [ ] Replace placeholder price IDs
- [ ] Add customer portal
- [ ] Test upgrade/downgrade

### Batch 2.4 — Directory Search
- [ ] Wire URL query params to directory page
- [ ] Server-side initial fetch + client filtering
- [ ] CompanyCard null safety
- [ ] Pagination
- [ ] Empty state

## 🟡 PHASE 3: FEATURES

### Batch 3.1 — Security
- [ ] Move OpenAI to /api/ai/parse-query
- [ ] Remove NEXT_PUBLIC_OPENAI_API_KEY
- [ ] Rate limiting on AI endpoint
- [ ] Rotate all exposed API keys

### Batch 3.2 — Company Detail Page
- [ ] /directory/[id]/page.tsx
- [ ] Photo gallery
- [ ] Google Reviews embed
- [ ] Request Quote form
- [ ] Social links

### Batch 3.3 — Admin Enhancement
- [ ] Analytics dashboard
- [ ] License preview in admin
- [ ] ABN validation (ABR API)
- [ ] Rejection reasons + email
- [ ] Bulk actions

### Batch 3.4 — Job Board
- [ ] Job posting form in dashboard
- [ ] Job categories + filtering
- [ ] Job detail page
- [ ] Application system
- [ ] Auto-expiry (30 days)

### Batch 3.5 — Reviews
- [ ] Reviews table in Supabase
- [ ] Review submission form
- [ ] Display on cards + detail page
- [ ] Average rating calc
- [ ] Moderation in admin

## 🟢 PHASE 4: POLISH & GROWTH

### Batch 4.1 — UI/UX
- [ ] Brand identity
- [ ] Landing page with CTA
- [ ] Loading skeletons
- [ ] 404 + error pages
- [ ] Mobile responsive

### Batch 4.2 — SEO
- [ ] Metadata on all pages
- [ ] sitemap.xml
- [ ] JSON-LD structured data
- [ ] Lighthouse 90+

### Batch 4.3 — Deployment
- [ ] Vercel setup
- [ ] Custom domain
- [ ] Supabase production
- [ ] Stripe production
- [ ] CI/CD GitHub Actions

### Batch 4.4 — Community
- [ ] FB Group cross-promotion
- [ ] Referral system
- [ ] Email newsletter (Resend)
- [ ] Blog section
- [ ] "Claim your business" flow

## IMMEDIATE NEXT: Run `npm run build` and fix Batch 1.2 → 1.4
