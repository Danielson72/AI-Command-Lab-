# AI COMMAND LAB — MASTER HANDOFF DOCUMENT
# Updated: February 15, 2026
# Owner: Daniel Alvarez | dalvarez@sotsvc.com

---

## WHAT IS AI COMMAND LAB?

AI Command Lab is Daniel's self-built CRM platform replacing GoHighLevel ($0/month vs $97-497/month).
It captures leads, manages contacts, automates email/SMS follow-ups, and provides embeddable forms
for all 10 businesses in the DLD ecosystem.

**Live URL:** https://ai-command-lab.netlify.app
**Tech Stack:** Next.js + Supabase + Netlify + Stripe (future)
**Project Directory:** ~/AI-Command-Lab-/
**Frontend App:** ~/AI-Command-Lab-/next/

---

## CURRENT STATUS (Feb 15, 2026)

### ✅ COMPLETED
- Database: 37 tables in Supabase, fully migrated, RLS enabled
- Brands: 10 brands registered (SOTSVC, Boss of Clean, TrustedCleaningExpert, DLD-Online, AI Command Lab, HalleluYAH, BeatSlave, AllCalculate, Temple Builder, JM Home Decor)
- Lead API: POST /api/leads — accepts name, email, phone, message, brand_slug, source
- CORS: Configured for sotsvc.com, bossofclean.com, trustedcleaningexpert.com, localhost
- Dashboard: Next.js app with login, lead management, brand filtering, settings
- Auth: Supabase Auth (email + magic link)
- Deployment: Live on Netlify at ai-command-lab.netlify.app
- Product Context: Marketing context files deployed to all project roots
- PATH fixes: Node.js, Docker, npm all accessible in shell

### 🔄 IN PROGRESS (Steps 2-4)
- Step 2: n8n email notification workflow when new lead arrives
- Step 3: Embeddable JS form widget for websites
- Step 4: Automated email follow-up sequences (Day 1/3/5/7/14)

### 📋 NOT STARTED YET
- SMS notifications via Twilio
- Slack workspace "DLD Command Center" setup
- Microsoft 365 Azure OAuth (LOW PRIORITY — not using Outlook for business)
- SaaS billing for external customers (Phase 2)
- Social media platform connections

---

## CRITICAL CREDENTIALS & CONNECTIONS

### Supabase (AI Command Lab)
- Project: wxsfnpbmngglkjlytlul
- URL: https://wxsfnpbmngglkjlytlul.supabase.co
- Credentials: ~/AI-Command-Lab-/next/.env.local
- Service role key available in .env.local (for server-side operations)

### Netlify
- Site: ai-command-lab.netlify.app
- Build command: npm ci && npm run build (from ~/AI-Command-Lab-/next/)
- Config: ~/AI-Command-Lab-/next/netlify.toml

### n8n Cloud
- Instance: sonzofthunder72.app.n8n.cloud
- Connected via MCP server in Claude
- Use n8n:search_workflows and n8n:execute_workflow tools

### Business Email
- dalvarez@sotsvc.com (Google Workspace — Gmail)
- MX records point to smtp.google.com
- NOT using Microsoft Outlook for business
- Google account configured in ClawdBot: GOG_ACCOUNT="dalvarez@sotsvc.com"

### Stripe
- Connected via MCP in Claude
- Used for future SaaS billing (Phase 2)
- BeatSlave already has Stripe integration

---

## DATABASE SCHEMA (Key Tables)

### Core Tables
- **brands** — 10 records (slug, domain, tagline, active)
- **leads** — name, email, phone, message, brand_id, brand_name, source, status, contacted, score
- **profiles** — user profiles linked to Supabase Auth
- **feature_flags** — 6 flags for feature toggling

### Lead Statuses
- new → notified → contacted → converted (or opted_out)

### CQI System Tables
- services, cqi_templates, cqi_sessions, cqi_responses, trials, closer_scripts

### Agent/Workflow Tables
- agents, agent_templates, agent_tasks, mcp_tasks, approvals
- workflow_instances, workflow_stage_transitions, follow_up_tasks

### Billing Tables (Phase 2 SaaS)
- plans (4 records), subscriptions (8 records), usage_counters

### Forms
- forms, contact_requests, lead_activities, lead_scoring_rules

---

## THE 10 BUSINESSES

| # | Brand | Slug | Domain | Status |
|---|-------|------|--------|--------|
| 1 | Sonz of Thunder Services | sotsvc | sotsvc.com | Active — primary cleaning business |
| 2 | Boss of Clean | boss-of-clean | bossofclean.com | Active — cleaning marketplace |
| 3 | Trusted Cleaning Expert | trusted-cleaning-expert | trustedcleaningexpert.com | Active — content/SEO/lead gen |
| 4 | DLD-Online | dld-online | dld-online.com | Active — music ministry/personal brand |
| 5 | AI Command Lab | ai-command-lab | ai-command-lab.netlify.app | Active — this CRM platform |
| 6 | HalleluYAH Worship Wear | halleluyah | (on DLD-Online shop) | In development — faith apparel |
| 7 | BeatSlave | beatslave | beatslave.com | In development — beat marketplace |
| 8 | AllCalculate | allcalculate | (TBD) | In development — SaaS calculator |
| 9 | Temple Builder | temple-builder | (TBD) | Concept — kingdom business building |
| 10 | JM Home Decor | jm-home-decor | (TBD) | Concept — home decor |

---

## LEAD API SPEC

**Endpoint:** POST https://ai-command-lab.netlify.app/api/leads

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "(407) 555-1234",
  "message": "I need a deep cleaning",
  "brand_slug": "sotsvc",
  "source": "embed"
}
```

**Response:** `{ "success": true, "id": "uuid" }`

**CORS Allowed Origins:**
- https://sotsvc.com, https://www.sotsvc.com
- https://bossofclean.com, https://www.bossofclean.com
- https://trustedcleaningexpert.com, https://www.trustedcleaningexpert.com
- http://localhost:3000
- https://ai-command-lab.netlify.app

---

## AUTOMATION ARCHITECTURE

### Lead Flow
```
Website form → POST /api/leads → Supabase (status: new)
                                      ↓
                              n8n checks every 2 min
                                      ↓
                              Email notification → dalvarez@sotsvc.com
                              SMS notification → Daniel's phone (Twilio)
                              Update status → "notified"
                                      ↓
                              Follow-up sequence starts
                              Day 1: Welcome email
                              Day 3: Social proof
                              Day 5: Service breakdown
                              Day 7: Special offer
                              Day 14: Final follow-up
                                      ↓
                              Lead replies → status: "contacted"
                              Lead books → status: "converted"
                              Lead says STOP → status: "opted_out"
```

---

## CROSS-PROMOTION RULES

| Brand | Always Include | Sometimes Include |
|-------|---------------|-------------------|
| SOTSVC | TrustedCleaningExpert.com | Boss of Clean, DLD-Online |
| Boss of Clean | bossofclean.com | SOTSVC (featured provider) |
| TrustedCleaningExpert | SOTSVC.com | Boss of Clean |
| DLD-Online | DLD-Online.com | HalleluYAH, BeatSlave |

---

## IMPORTANT RULES

- Spell "Sonz" not "Sons" for SOTSVC
- CEO Cat (Boss of Clean) always wears glasses, suit, and tie
- Saturday is rest day — no launches, no manual work scheduled
- Tagline exact: "YOU'RE CLEAN OR YOU'RE DIRTY"
- Scripture citations must be verbatim with reference
- dalvarez@sotsvc.com is the primary business email (Google Workspace)
- NEVER drop/delete/truncate existing database tables
- All new tables use CREATE IF NOT EXISTS
- All inserts use ON CONFLICT DO NOTHING for safety

---

## PRODUCT CONTEXT FILES

Full marketing context for each business is deployed at:
- ~/SOTSVC-WEBSITE/product-context.md
- ~/ralph w BOSSOFCLEAN/product-context.md
- ~/trusted_cleaning_expert/product-context.md
- ~/DLDWebsite/product-context.md
- ~/ai-command-lab/product-context.md
- ~/Projects/beatslave/product-context.md
- ~/.claude/skills/product-context-skills/halleluyah-product-context.md
- ~/.claude/skills/product-context-skills/allcalculate-product-context.md
- ~/.claude/skills/product-context-skills/SKILL.md (master index)

Each file contains: audience personas, competitors, USP, SEO strategy, email sequences,
social media strategy, technical stack, and faith alignment with scripture.

---

## NEXT ACTIONS (In Order)

1. **Step 2:** Build n8n workflow — email dalvarez@sotsvc.com on every new lead
2. **Step 3:** Create embeddable JS form widget, deploy to Netlify
3. **Step 4:** Build automated follow-up email sequence in n8n (Day 1/3/5/7/14)
4. **Step 5:** Add Twilio SMS notifications for high-priority leads
5. **Step 6:** Set up Slack "DLD Command Center" workspace
6. **Future:** SaaS billing, social media connections, customer onboarding

---

## SCRIPTURE FOUNDATION

"For which of you, desiring to build a tower, does not first sit down and count the cost,
whether he has enough to complete it?" — Luke 14:28
