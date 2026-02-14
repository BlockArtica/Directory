# TRADIES DIRECTORY

**Australia's AI-Powered Business & Trades Platform**

*Connecting Communities. Verifying Quality. Powering Growth.*

---

**White Paper v1.0 — February 2026 — BlockArtica**

*CONFIDENTIAL — For Internal Use & Investor Review*

---

## 1. Executive Summary

Tradies Directory is an AI-powered platform that connects Australian consumers with verified tradespeople and local businesses. Built on the foundation of a thriving 25,000+ member Northern Beaches Facebook community, the platform transforms organic community trust into a scalable, technology-driven marketplace.

Unlike existing platforms such as Hipages, Oneflare, and ServiceSeeking—which charge tradies per-lead or impose high monthly subscriptions—Tradies Directory offers a community-first model with transparent tiered pricing, AI-enhanced search, and a rigorous verification process that prioritises quality over volume.

The platform is built with Next.js 15, Supabase, and modern AI capabilities, designed for rapid iteration and national scale.

---

## 2. Market Opportunity

### 2.1 The Problem

The Australian trades services market is estimated at $150+ billion annually, yet connecting platforms are plagued by:

- **High lead costs:** Hipages charges ~$21 per lead with no conversion guarantee.
- **Fierce competition:** Most platforms cap quotes at 3 per job, hundreds compete for slots.
- **Lack of verification:** Self-reported credentials with minimal validation.
- **No community context:** Transactional platforms lack genuine trust signals.
- **Outdated search:** Rigid category dropdowns instead of natural language.

### 2.2 Competitive Landscape

| Platform | Model | Lead Cost | Verification | AI Search |
|---|---|---|---|---|
| Hipages | Per-lead | ~$21/lead | Basic | No |
| Oneflare | Per-lead | Varies | Basic | No |
| ServiceSeeking | Subscription | $66+/mo | ABN check | No |
| Airtasker | Commission | 30% fee | ID check | No |
| **Tradies Directory** | **Tiered sub** | **Free/$29/$99** | **Full + community** | **Yes** |

---

## 3. Our Solution

### 3.1 Community-Backed Verification

Every business goes through multi-layer verification:

1. **ABN Validation** — Automated check against the Australian Business Register.
2. **License & Insurance Upload** — Securely stored in Supabase Storage.
3. **Admin Review** — Manual approval verifying document authenticity.
4. **Community Endorsement** — Cross-referenced with 25K+ member Facebook community.

### 3.2 AI-Powered Search

Natural language search via ChatBox:

> *"I need someone to fix a leaking tap in Dee Why this weekend"*
> → AI extracts: **Service:** Plumbing, **Region:** Northern Beaches, **Urgency:** Weekend

GPT-4o-mini parses intent, extracts structured parameters, and routes to results.

### 3.3 Fair & Transparent Pricing

| Tier | Price | Features | Best For |
|---|---|---|---|
| Basic | Free | Directory listing, basic ranking | New tradies |
| Pro | $29/mo | Priority ranking, ad spots, analytics | Growing businesses |
| Enterprise | $99/mo | Top ranking, featured ads, integrations, account manager | Established companies |

---

## 4. Platform Architecture

### 4.1 Technology Stack

**Frontend:** Next.js 15 with React 19, TypeScript, Tailwind CSS, shadcn/ui. SSR for SEO, CSR for interactivity.

**Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions). Row Level Security for data isolation.

**AI Layer:** OpenAI GPT-4o-mini for NL search parsing. Extensible to recommendations and chat.

**Payments:** Stripe subscriptions with webhook-driven tier updates.

**Maps & Geo:** Google Maps Places API for autocomplete. geolib for distance sorting.

### 4.2 Database Design

Five core tables with Row Level Security: companies (20+ fields, JSONB location/social, TEXT[] services), regions (normalized lookup), ads (3-slot system), leads (search tracking), jobs (notice board).

### 4.3 User Flows

**Consumer:** Homepage → AI/dropdown search → Directory results (tier + distance sorted) → Company detail → Contact/Quote.

**Tradie:** Sign up → Auto-stub created → Profile onboarding → Admin review → Verified listing → Manage subscription.

**Admin:** Login → Approval queue → Review details + licenses → Approve/Reject with notification.

---

## 5. Go-to-Market Strategy

### Phase 1: Northern Beaches Launch (Months 1-3)
- Invite top-recommended tradies from FB group (free Basic tier)
- Cross-promote in FB group for common services
- **Target:** 100 verified tradies, 500+ monthly searches

### Phase 2: Greater Sydney (Months 4-6)
- Expand to North Shore, Eastern Suburbs, Inner West
- Partner with local FB groups in each region
- Launch Pro tier upsell
- **Target:** 500 verified tradies, 5,000+ monthly searches

### Phase 3: National Scale (Months 7-12)
- Brisbane, Melbourne, Adelaide, Perth
- Enterprise tier with custom integrations
- Advanced AI: conversational search, recommendations
- **Target:** 5,000+ verified tradies, 50,000+ monthly searches, $50K+ MRR

---

## 6. Revenue Model

1. **Subscriptions:** Free / $29 / $99 tiers. Target 20% conversion to paid.
2. **Advertising:** 3 premium homepage slots at $200-$500/month each.
3. **Lead Intelligence:** Anonymized search trends for industry partners.
4. **Premium Features:** Featured placement, competitor analysis, custom landing pages.

---

## 7. Revenue Projections

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Verified Tradies | 100 | 500 | 5,000 |
| Monthly Searches | 500 | 5,000 | 50,000 |
| Paid Subscribers | 10 | 75 | 1,000 |
| MRR (Subscriptions) | $500 | $3,500 | $45,000 |
| MRR (Ads) | $0 | $600 | $1,500 |
| **Total MRR** | **$500** | **$4,100** | **$46,500** |

*Assumptions: 20% conversion, $45 avg subscription, 3 ad slots from Month 4.*

---

## 8. Technical Roadmap

**v0.1 (Current):** Auth, profile onboarding, directory search, admin queue, ad system, AI search, Stripe infra, job board.

**v0.5 (Weeks 1-4):** Fix build errors, SSR auth, complete Stripe, server-side AI, Vercel deploy.

**v1.0 (Months 2-3):** Reviews, ABN validation, company detail pages, job board enhancement, SEO.

**v2.0 (Months 4-12):** AI chatbot, smart recommendations, mobile app, quote management, national expansion.

---

## 9. Why Now?

**AI Maturity:** GPT-4o-mini costs fractions of a cent per query — AI search is economically viable.

**Community Platform Fatigue:** Facebook groups lack structured search, verification, and persistent profiles. Members are ready for purpose-built tools.

**Tradie Platform Frustration:** Dominant platforms raised prices while lead quality declined. Tradies actively seek alternatives.

---

## 10. Conclusion

Tradies Directory bridges the gap between community trust and scalable technology. With 25,000+ engaged community members, a modern tech stack, and a market ripe for disruption, the platform is positioned to become the go-to directory for Australian tradespeople.

Next step: stabilize the codebase, launch to the Northern Beaches, prove the model, scale nationally.

---

*github.com/BlockArtica/Directory*

*© 2026 BlockArtica. All rights reserved.*
