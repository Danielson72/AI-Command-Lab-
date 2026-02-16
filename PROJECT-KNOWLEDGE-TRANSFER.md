# AI COMMAND LAB — COMPLETE PROJECT KNOWLEDGE
# Transfer Document for Claude Project Chat
# Source: Claude.ai Session Feb 14-15, 2026
# Owner: Daniel Alvarez | dalvarez@sotsvc.com
# Last Updated: February 15, 2026

---

## PURPOSE OF THIS DOCUMENT

This is the complete context transfer from a multi-day Claude.ai session (Feb 14-15, 2026)
into the AI Command Lab Claude Project. It contains everything needed to continue
development without losing any context: project status, credentials, database schema,
automation architecture, multi-agent coordination, and exact next steps.

---

## SECTION 1: WHAT IS AI COMMAND LAB?

AI Command Lab is Daniel's self-built CRM platform replacing GoHighLevel.
- **Cost:** $0/month (vs GoHighLevel $97-497/month)
- **Purpose:** Capture leads, manage contacts, automate email/SMS follow-ups, provide embeddable forms for all 10 businesses
- **Live URL:** https://ai-command-lab.netlify.app
- **Tech Stack:** Next.js + Supabase + Netlify + n8n cloud + Stripe (future)
- **Project Directory:** ~/AI-Command-Lab-/
- **Frontend App:** ~/AI-Command-Lab-/next/

---

## SECTION 2: THE 10-BUSINESS ECOSYSTEM

| # | Brand | Slug | Domain | Tagline | Status |
|---|-------|------|--------|---------|--------|
| 1 | Sonz of Thunder Services | sotsvc | sotsvc.com | WE BRING THE BOOM TO EVERY ROOM | Active — primary cleaning |
| 2 | Boss of Clean | boss-of-clean | bossofclean.com | PURRFECTION IS OUR STANDARD | Active — marketplace |
| 3 | Trusted Cleaning Expert | trusted-cleaning-expert | trustedcleaningexpert.com | Your Trusted Source | Active — content/SEO |
| 4 | DLD-Online | dld-online | dld-online.com | Kingdom Commerce | Active — personal brand |
| 5 | AI Command Lab | ai-command-lab | ai-command-lab.netlify.app | Your AI-Powered CRM | Active — this project |
| 6 | HalleluYAH Worship Wear | halleluyah | (via DLD-Online) | Wear Your Worship | In development |
| 7 | BeatSlave | beatslave | beatslave.com | Production Unleashed | In development |
| 8 | AllCalculate | allcalculate | (TBD) | Calculate Everything | In development |
| 9 | Temple Builder | temple-builder | (TBD) | Building the Kingdom | Concept |
| 10 | JM Home Decor | jm-home-decor | (TBD) | Designed for Living | Concept |

### Cross-Promotion Rules (Non-Negotiable)
- SOTSVC content → ALWAYS include TrustedCleaningExpert.com
- Boss of Clean → cross-promotes SOTSVC as featured provider
- DLD-Online → hub for HalleluYAH and BeatSlave
- AI Command Lab → references SOTSVC as real-world case study
- Inspirational/personal posts → include DLD-Online.com

### Brand Rules
- Spell "Sonz" NOT "Sons" — Sonz of Thunder Services
- Boss of Clean mascot: CEO Cat wearing glasses, suit, and tie
- SOTSVC secondary tagline: "YOU'RE CLEAN OR YOU'RE DIRTY"
- SOTSVC logo: Sunburst ST — appears on all SOTSVC visuals
- Saturday = rest day — never schedule launches or manual tasks
- Scripture citations must be verbatim with full reference
- Visuals: minimalist/polished, off-white backgrounds, domain in bottom-right

---

## SECTION 3: CREDENTIALS & CONNECTIONS

### Supabase
- Project ID: wxsfnpbmngglkjlytlul
- URL: https://wxsfnpbmngglkjlytlul.supabase.co
- All keys in: ~/AI-Command-Lab-/next/.env.local
- Service role key available for server-side operations

### Netlify
- Site: ai-command-lab.netlify.app
- Build: cd ~/AI-Command-Lab-/next && npm ci && npm run build
- Config: ~/AI-Command-Lab-/next/netlify.toml
- Auto-deploys on git push

### n8n Cloud
- Instance: sonzofthunder72.app.n8n.cloud
- Webhook base: https://sonzofthunder72.app.n8n.cloud/webhook/
- Connected via MCP server in Claude

### Business Email
- dalvarez@sotsvc.com (Google Workspace / Gmail)
- MX → smtp.google.com
- NOT using Microsoft Outlook for business

### Other Tools
- Stripe: Connected via MCP (for future SaaS billing)
- Twilio: Not yet set up (Step 5)
- Docker: Installed, CLI in PATH
- Node.js: v22.22.0 via nvm, in PATH

---

## SECTION 4: DATABASE SCHEMA

### 37 Tables in Supabase (verified Feb 15, 2026)

**Core:**
- brands (10 records) — name, slug, domain, tagline, active
- leads — name, email, phone, message, brand_id, brand_name, source, status, contacted, score
- profiles — linked to Supabase Auth (currently empty)
- feature_flags — 6 flags for feature toggling

**Lead Status Flow:**
new → notified → contacted → converted (or opted_out)

**CQI System:**
- services, cqi_templates, cqi_sessions, cqi_responses, trials, closer_scripts

**Agents/Workflows:**
- agents, agent_templates, agent_tasks, mcp_tasks, approvals
- workflow_instances, workflow_stage_transitions, follow_up_tasks

**Billing (Phase 2 SaaS):**
- plans (4 records), subscriptions (8 records), usage_counters

**Forms:**
- forms, contact_requests, lead_activities, lead_scoring_rules

**Auth:** Supabase Auth enabled (email + password login)

### Safety Rules
- NEVER drop/delete/truncate existing tables
- Always use CREATE TABLE IF NOT EXISTS
- Always use ON CONFLICT DO NOTHING for inserts
- RLS enabled on user-facing tables

---

## SECTION 5: WHAT WAS BUILT IN THIS SESSION

### Part 1: Product Context Skills System (Feb 14)
Created comprehensive marketing context files for all 9 active businesses.
Each file contains 10 sections: Business Identity, Target Audience, Product/Service Overview,
Competitive Landscape, Content & SEO Strategy, Conversion Funnel, Email Nurture Sequences,
Social Media Strategy, Technical Stack, Faith Alignment.

**Files deployed:**
- ~/SOTSVC-WEBSITE/product-context.md
- ~/ralph w BOSSOFCLEAN/product-context.md
- ~/trusted_cleaning_expert/product-context.md
- ~/DLDWebsite/product-context.md
- ~/ai-command-lab/product-context.md (also ~/AI-Command-Lab-/product-context.md)
- ~/Projects/beatslave/product-context.md
- ~/.claude/skills/product-context-skills/halleluyah-product-context.md
- ~/.claude/skills/product-context-skills/allcalculate-product-context.md
- ~/.claude/skills/product-context-skills/SKILL.md (master index)

**Programmatic SEO Opportunity Identified:** 1,350+ potential pages:
- Boss of Clean: 400+ city pages
- AllCalculate: 500+ calculator pages
- TrustedCleaningExpert: 200+ how-to guides
- SOTSVC: 100+ neighborhood pages
- BeatSlave: 100+ type beat pages

### Part 2: Dev Environment Fixes (Feb 15)
- Node.js PATH fixed (nvm → .zshrc, .bashrc, .zprofile)
- Docker CLI PATH fixed
- Microsoft 365 OAuth skipped (not needed — using Google Workspace)
- GoHighLevel confirmed cancelled — AI Command Lab is the replacement

### Part 3: Database Verification (Feb 15)
- All 37 tables verified present
- Added 2 missing brands: AI Command Lab + HalleluYAH Worship Wear
- Now 10 brands total in database
- 12 sample leads exist for testing

### Part 4: Multi-Agent Handoff Documents (Feb 15)
Created handoff files for all AI assistants:
- ~/AI-Command-Lab-/CLAUDE.md — Claude Code project context
- ~/AI-Command-Lab-/HANDOFF.md — Master reference (any AI)
- ~/AI-Command-Lab-/GEMINI-HANDOFF.md — Gemini sessions
- ~/AI-Command-Lab-/CHATGPT-HANDOFF.md — ChatGPT sessions
- Apple Notes: "Gemini Handoff" and "ChatGPT Handoff" for mobile access

---

## SECTION 6: CURRENT SPRINT — Steps 2-5

### Step 2: n8n Email Notification (IN PROGRESS)
**Goal:** Email dalvarez@sotsvc.com instantly when a new lead arrives.

**Architecture Decision:** Webhook trigger (recommended by ChatGPT) vs. polling.
- Webhook = real-time, lower resource usage
- Polling = simpler but 2-min delay

**Webhook approach:**
- Next.js /api/leads route fires POST to n8n webhook after saving lead
- n8n webhook URL: https://sonzofthunder72.app.n8n.cloud/webhook/acl/new-lead
- Netlify env var: LEAD_NOTIFICATION_WEBHOOK=https://sonzofthunder72.app.n8n.cloud/webhook/acl/new-lead

**n8n Workflow: "ACL - New Lead Notify"**
1. Webhook Trigger (POST /acl/new-lead) → respond 200 immediately
2. Set Node: extract brand_slug, name, email, phone, message, lead_id, timestamp
3. Gmail Node: send to dalvarez@sotsvc.com
   - Subject: "[ACL] New Lead — {{name}} ({{brand_slug}})"
   - Body: Full lead details + dashboard link
4. Supabase HTTP: Update leads SET status='notified' WHERE id={{lead_id}}
5. (Optional) Twilio SMS to Daniel's phone
6. (Optional) Discord notification

### Step 3: Embeddable JS Form Widget (PLANNED)
**Goal:** Drop-in JavaScript form for any website.

**Embed code:**
```html
<div id="acl-form"></div>
<script src="https://ai-command-lab.netlify.app/embed/acl-form.js" data-brand="sotsvc"></script>
```

**Key specs:**
- Vanilla JS, no dependencies
- Shadow DOM (Gemini recommendation) to prevent CSS conflicts
- Auto-detects brand_slug from data-brand attribute
- POSTs to https://ai-command-lab.netlify.app/api/leads
- Honeypot spam protection
- Brand-aware theming (SOTSVC blue #0474B4, Boss of Clean #0A69AC)
- Responsive design
- Netlify serves /public at root, so URL is /embed/acl-form.js (not /public/embed/)

**File location:** ~/AI-Command-Lab-/next/public/embed/acl-form.js
**Test page:** ~/AI-Command-Lab-/next/public/embed/test.html

### Step 4: Automated Follow-Up Email Sequence (PLANNED)
**Goal:** 5-email nurture sequence triggered after lead notification.

**Schedule:**
- Day 1: Welcome + ask for details (address, sqft, frequency)
- Day 3: Follow-up check-in
- Day 5: Preference question (price vs detail vs speed)
- Day 7: "Close or keep open?" with reply "OPEN"
- Day 14: Final follow-up, reply "STOP" to opt out

**n8n Workflow: "ACL - Lead Follow Up Sequence"**
- Cron trigger every 30 minutes
- Query leads WHERE status IN ('notified','contacted') AND email IS NOT NULL
- Calculate days since created_at
- Check followup_dX_sent flags before sending (prevent duplicates)
- After send: update followup_dX_sent=true, followup_dX_sent_at=now()
- Stop if status='converted' or 'opted_out'
- **Saturday Sabbath filter** (Gemini recommendation): if dayOfWeek=6, delay until Sunday

**Email templates (ChatGPT drafted, verified accurate):**
All 5 emails include SOTSVC.com + TrustedCleaningExpert.com in footer.
Signed "— Daniel | Sonz of Thunder Services"
Templates are conversational, not robotic. Stored in HANDOFF.md and ChatGPT session.

### Step 5: Twilio SMS (BACKLOG)
**Goal:** Text Daniel + auto-confirm to lead when form submitted.

**To Daniel:** "🔔 New SOTSVC Lead: John Smith (407-555-1234) - Deep cleaning request."
**To Lead:** "Hi {{name}} — this is Daniel with Sonz of Thunder Services. We received your request and will reach out within 24 hours."
- Only for SOTSVC + Boss of Clean leads (high-priority)
- Skip if no phone number
- Twilio account not yet created

---

## SECTION 7: MULTI-AGENT COORDINATION

### Current AI Team Assignments
| Agent | Role | Current Task |
|-------|------|-------------|
| Claude (claude.ai) | Orchestrator | Master context, verification, troubleshooting |
| Claude Code | Builder | Execute all code, workflows, deployments |
| Gemini | PM/Architect | Saturday filter logic, Shadow DOM spec, governance |
| ChatGPT | Workflow Engineer | n8n JSON build plans, email templates, SQL patches |

### Agent Sync Points
- All agents reference ~/AI-Command-Lab-/HANDOFF.md as source of truth
- Claude Code reads CLAUDE.md automatically on project open
- Gemini and ChatGPT get context via their respective HANDOFF files
- Apple Notes versions available for mobile copy-paste

### Corrections for Other Agents
ChatGPT referenced some incorrect field names. Corrections:
- Lead API endpoint: POST /api/leads (NOT /api/forms/submit)
- Status is a direct column: leads.status (NOT meta->status)
- Lead field is "name" (NOT "lead.full_name")
- Status column already exists — no ALTER TABLE needed

Gemini introduced creative concepts not yet built:
- "Clawbot 4-Brain System" and "64% token reduction" — aspirational, not current state
- "Willie" as n8n monitoring name — made up, not documented
- These are cool future ideas but should NOT be treated as existing features

---

## SECTION 8: KEY FILES & LOCATIONS

### Project Root: ~/AI-Command-Lab-/
```
CLAUDE.md              — Claude Code context (reads first)
HANDOFF.md             — Master handoff (all agents)
GEMINI-HANDOFF.md      — Gemini-specific handoff
CHATGPT-HANDOFF.md     — ChatGPT-specific handoff
PRD-AI-Command-Lab.md  — Product requirements
product-context.md     — Marketing context
SOURCE-OF-TRUTH.md     — Architecture decisions
DEPLOYMENT-STATUS.md   — Deploy tracking
```

### Frontend: ~/AI-Command-Lab-/next/
```
app/api/leads/route.ts     — Lead capture API
app/dashboard/             — Admin dashboard
app/login/page.tsx         — Auth page (Supabase Auth)
public/embed/              — Embeddable form widget (Step 3)
.env.local                 — All credentials
netlify.toml               — Netlify config
```

### Database: ~/AI-Command-Lab-/supabase/
```
migrations/                — SQL migration files
```

### Skills: ~/.claude/skills/product-context-skills/
```
SKILL.md                              — Master index
halleluyah-product-context.md         — HalleluYAH context
allcalculate-product-context.md       — AllCalculate context
product-context-template.md           — Blank template
```

---

## SECTION 9: LEAD API SPECIFICATION

**Endpoint:** POST https://ai-command-lab.netlify.app/api/leads

**Request:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "(407) 555-1234",
  "message": "I need a deep cleaning for my office",
  "brand_slug": "sotsvc",
  "source": "embed"
}
```

**Response:** `{ "success": true, "id": "uuid" }`

**CORS Origins:**
- https://sotsvc.com, https://www.sotsvc.com
- https://bossofclean.com, https://www.bossofclean.com
- https://trustedcleaningexpert.com, https://www.trustedcleaningexpert.com
- http://localhost:3000
- https://ai-command-lab.netlify.app

---

## SECTION 10: FUTURE ROADMAP

### Phase 2: SaaS Multi-Tenant
- Database already has brand_id + org_id for multi-tenant
- Lead API accepts any brand_slug
- Embeddable form supports data-brand="any-slug"
- Move email templates from n8n to Supabase email_templates table
- Customer onboarding: sign up → create brand → connect email/phone → auto-routes

### Programmatic SEO (1,350+ pages)
- Boss of Clean: "cleaning-services-in-[city]-florida" (400+ pages)
- AllCalculate: "[industry]-calculator" (500+ pages)
- TrustedCleaningExpert: "how-to-clean-[surface]" (200+ pages)
- SOTSVC: "[service]-cleaning-[neighborhood]" (100+ pages)
- BeatSlave: "[artist]-type-beat" (100+ pages)

### Social Media Integration
- n8n native nodes for Facebook, Instagram, Google Business Profile, TikTok, LinkedIn
- Same functionality as GoHighLevel Social Planner, no monthly fee

### Other Active Projects
- 12-song Bible album (Genesis to Revelation) with cousin James
- Book: "Transformer: Transform Into Who God Calls You to Be"
- Slack workspace "DLD Command Center" (not yet created)

---

## SECTION 11: SCRIPTURE FOUNDATION

- SOTSVC: "Whatever you do, work heartily, as for the Lord and not for men." — Colossians 3:23
- Boss of Clean: "Do not withhold good from those to whom it is due, when it is in your power to act." — Proverbs 3:27
- AI Command Lab: "For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?" — Luke 14:28
- DLD-Online: "The Lord is my light and my salvation — whom shall I fear?" — Psalm 27:1
- HalleluYAH: "Let everything that has breath praise the Lord. Praise the Lord!" — Psalm 150:6
- BeatSlave: "Sing to the Lord a new song; sing to the Lord, all the earth." — Psalm 96:1

---

## SECTION 12: IMMEDIATE NEXT ACTIONS

When continuing in this project chat, pick up here:

1. **Step 2:** Build n8n "ACL - New Lead Notify" workflow
   - Create webhook trigger in n8n
   - Add Gmail node → dalvarez@sotsvc.com
   - Add Supabase update (status → notified)
   - Update /api/leads route to fire webhook
   - Set LEAD_NOTIFICATION_WEBHOOK env var in Netlify
   - Test end-to-end

2. **Step 3:** Build embeddable form widget
   - Create ~/AI-Command-Lab-/next/public/embed/acl-form.js
   - Shadow DOM pattern, vanilla JS, brand-aware theming
   - Create test page at /embed/test.html
   - Deploy via git push to Netlify
   - Test on sotsvc.com

3. **Step 4:** Build follow-up email sequence in n8n
   - Cron every 30 min, query leads by status + days since creation
   - 5 email templates (Day 1/3/5/7/14)
   - Saturday Sabbath filter (skip Saturday, delay to Sunday)
   - Duplicate prevention via followup flags
   - All emails include SOTSVC.com + TrustedCleaningExpert.com

4. **Step 5:** Twilio SMS
   - Create Twilio account, get phone number
   - Add SMS node to Step 2 workflow
   - Auto-confirm to lead + notify Daniel

---

END OF TRANSFER DOCUMENT
