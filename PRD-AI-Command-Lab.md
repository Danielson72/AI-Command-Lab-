# AI Command Lab — Product Requirements Document (PRD)

> **Version:** 1.0 | **Date:** February 12, 2026
> **Owner:** Daniel Alvarez | Altamonte Springs, FL
> **Status:** Planning → MVP Development
>
> *"She considers a field and buys it; out of her earnings she plants a vineyard."* — Proverbs 31:16

---

## 1. Executive Summary

AI Command Lab is a custom CRM platform designed to replace GoHighLevel — providing form building, lead management, automation workflows, and multi-business support. Phase 1 serves Daniel's own businesses (SOTSVC, TrustedCleaningExpert, DLD-Online). Phase 2 opens as a SaaS product for other businesses, creating a new recurring revenue stream.

**The core problem:** GoHighLevel charges monthly fees for features Daniel can build and own. Every dollar paid to GHL is a dollar not invested in proprietary infrastructure.

**The solution:** A self-hosted, AI-powered CRM that captures leads, manages contacts, automates follow-ups, and provides embeddable forms — all under Daniel's control.

---

## 2. Vision & Strategic Positioning

### 2.1 What AI Command Lab IS
- A form builder that generates embeddable JS snippets for any website
- A lead capture and management dashboard
- An automation hub for follow-up sequences and lead scoring
- A multi-tenant platform (one install serves multiple businesses)
- A future SaaS product with subscription billing

### 2.2 What AI Command Lab is NOT
- Not a website builder (SOTSVC, BOC, TCE, DLD have their own sites)
- Not a social media scheduler (handled by n8n/Zapier workflows)
- Not a replacement for Stripe (Stripe handles payments; ACL manages the business logic)
- Not GoHighLevel — it's better, because it's yours

### 2.3 Competitive Advantage
| Feature | GoHighLevel | AI Command Lab |
|---------|-------------|----------------|
| Monthly cost | $97-497/mo | $0 (self-hosted) |
| Data ownership | Theirs | Yours |
| AI integration | Limited | Full (Claude, Gemini, custom agents) |
| Multi-brand support | Awkward sub-accounts | Native org_id architecture |
| Customization | Theme-level | Code-level |
| Form embeds | Their branding | Your branding (or white-label) |

---

## 3. User Personas

### 3.1 Daniel (Primary User — Phase 1)
- Manages 4+ businesses from one dashboard
- Needs instant email/SMS notification when leads come in
- Wants to see all leads across brands in one place with brand filtering
- Needs embeddable forms for SOTSVC.com, TrustedCleaningExpert.com, DLD-Online.com

### 3.2 Small Business Owner (Future User — Phase 2)
- Runs 1-3 service businesses
- Currently paying $97+/mo for GoHighLevel or similar
- Wants simple form → lead → follow-up automation
- Needs it to "just work" without technical knowledge

### 3.3 Willie (System Integration)
- AI agent that monitors leads, scores them, and triggers actions
- Reads from AI Command Lab's database
- Pushes notifications to the Willie Life OS dashboard

---

## 4. Technical Architecture

### 4.1 Tech Stack
| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React/Next.js (confirm in package.json) | Verify |
| Backend | Node.js/Express or Next.js API Routes | Verify |
| Database | Supabase (dedicated project — NOT shared) | Configured |
| Auth | Supabase Auth (email + magic link) | Planned |
| Email | Supabase Edge Functions + Resend | Planned |
| SMS | Twilio or Resend SMS (evaluate) | Future |
| Payments | Stripe (SaaS subscriptions — Phase 2) | NOT active yet |
| Hosting | Verify deployment target in config | Verify |
| AI Layer | Claude API / Gemini for lead scoring + auto-responses | Future |

### 4.2 System Architecture
```
AI Command Lab (this project)
├── Form Builder UI
├── Lead Management Dashboard
├── API Layer (form submissions, lead CRUD, analytics)
├── Embeddable Widget (JS snippet)
└── Notification System (email/SMS)

External Sites (embed snippet only):
  SOTSVC.com              → <script src="acl-form.js">
  TrustedCleaningExpert   → <script src="acl-form.js">
  DLD-Online.com          → <script src="acl-form.js">
  Future client sites     → <script src="acl-form.js">

⚠️ AI Command Lab RECEIVES data from other sites.
   It does NOT push code to them.
   Embed codes are generated here; sites paste the snippet.
```

### 4.3 Data Isolation Rules
| Data | Shared With | NOT Shared With |
|------|-------------|-----------------|
| Lead pipeline | SOTSVC + TCE (via org_id filter) | Boss of Clean, Willie |
| Form definitions | Nobody | All other projects |
| User auth | Nobody | All other projects |
| Automation logs | Willie (read-only for monitoring) | All other projects |

---

## 5. Feature Roadmap

### Phase 1: MVP — "Replace GoHighLevel" (Weeks 1-6)

#### F1: Embeddable Form Builder
- **Goal:** Generate JS embed snippets that work on any website
- **Inputs:** Form name, fields (text, email, phone, textarea, select, checkbox), styling options
- **Outputs:** <script> tag + unique embed key; form submits to ACL API
- **Edge Cases:** XSS protection, CORS whitelisting, rate limiting, duplicate submissions
- **Acceptance:** Embed on SOTSVC.com, fill out, lead appears in dashboard within 5 seconds

#### F2: Lead Capture + Instant Notification
- **Goal:** Every form submission → Supabase insert + email to Daniel
- **Inputs:** Form submission data (validated + sanitized server-side)
- **Outputs:** Lead row in leads table, email notification via Resend
- **Edge Cases:** Spam protection (honeypot + rate limit), duplicate detection (email/phone), missing required fields
- **Acceptance:** Submit form → email arrives within 30 seconds with lead details

#### F3: Lead Management Dashboard
- **Goal:** View, filter, sort, and manage all leads across businesses
- **Inputs:** Auth session (Supabase Auth)
- **Outputs:** Table view with brand filter, status filter, search, bulk actions
- **Edge Cases:** Empty states, pagination (100+ leads), mobile responsive at 375px
- **Acceptance:** Login → see all leads → filter by SOTSVC → update status → changes persist

#### F4: Organization / Brand Switching
- **Goal:** One login manages multiple businesses
- **Inputs:** User auth → linked organizations
- **Outputs:** Brand switcher dropdown, all data scoped by org_id
- **Edge Cases:** User with no orgs, user removed from org, switching mid-edit
- **Acceptance:** Switch from SOTSVC → DLD-Online → leads change → forms change → no data leak

### Phase 2: Automation Engine (Weeks 7-12)

#### F5: Follow-Up Sequences
- **Goal:** Automated email/SMS sequences triggered by form submissions
- **Acceptance:** New lead → Day 0 welcome email → Day 2 follow-up → Day 5 offer email

#### F6: Lead Scoring
- **Goal:** Auto-score leads 1-100 based on configurable criteria
- **Acceptance:** Lead from SOTSVC zip code + residential = score 85; unknown zip = score 40

#### F7: Form Analytics
- **Goal:** Track form views, submissions, conversion rates

### Phase 3: SaaS Launch (Months 4-6)

#### F8: Multi-Tenant Registration
#### F9: Stripe Billing (SaaS Subscriptions)
- **⚠️ NOT active until Phase 3 — do not implement Stripe without explicit approval**
#### F10: White-Label Embeds

---

## 6. Integration Map

### Inbound (data flows INTO AI Command Lab)
| Source | Method | Data |
|--------|--------|------|
| SOTSVC.com forms | Embed script → API POST | Lead name, email, phone, service type |
| TrustedCleaningExpert forms | Embed script → API POST | Lead name, email, phone, zip |
| DLD-Online.com forms | Embed script → API POST | Contact name, email, message |
| Florida public records | n8n workflow → API POST | Property data for lead enrichment |

### Outbound (data flows OUT of AI Command Lab)
| Destination | Method | Data |
|-------------|--------|------|
| Daniel's email | Resend API | New lead notification |
| Willie Life OS | Supabase read (or webhook) | Lead data for scoring + dashboard |
| n8n workflows | Webhook trigger | Lead events for automation chains |

### Does NOT Integrate With
- GoHighLevel (migrating AWAY — no new dependencies)
- Boss of Clean database (separate brand, separate data)
- SOTSVC Stripe account (ACL gets its own in Phase 3)

---

## 7. Non-Functional Requirements

### Performance
- Form embed script: < 50KB gzipped
- Form submission to DB: < 2 seconds
- Dashboard page load: < 3 seconds
- Email notification: < 30 seconds from submission

### Security
- All form inputs sanitized server-side (XSS, SQL injection)
- CORS: only whitelisted domains can submit
- Rate limiting: 10 submissions per minute per IP
- Honeypot field for bot detection
- RLS on every Supabase table
- HTTPS only (Cloudflare SSL)

---

## 8. Success Metrics

### Phase 1 (MVP)
- [ ] All SOTSVC forms migrated off GoHighLevel
- [ ] All TCE forms migrated
- [ ] GoHighLevel subscription canceled
- [ ] < 5 second lead notification time
- [ ] Zero data loss over 30 days

### Phase 2 (Automation)
- [ ] 3+ active automation sequences running
- [ ] Lead scoring operational with 70%+ accuracy

### Phase 3 (SaaS)
- [ ] 5+ paying customers
- [ ] $500+/mo recurring revenue from ACL subscriptions

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | Delayed MVP | Strict phase gates |
| Form spam | Data quality | Honeypot + rate limiting + IP blocking |
| Email deliverability | Missed leads | Resend reputation + fallback (Discord) |
| Multi-tenant data leak | Trust violation | RLS mandatory, automated tests |

---

## 10. Open Questions (Resolve Before Phase 1)

1. What is the current state of the codebase? (existing code or fresh start?)
2. Which Supabase project is dedicated to ACL?
3. What email does Daniel want lead notifications sent to?
4. Should TCE forms use the same org as SOTSVC, or separate?
5. What are the current SOTSVC form fields? (exact fields to replicate)
6. Hosting target? (Netlify? Vercel? DigitalOcean?)
7. Domain for ACL? (aicommandlab.com? acl.sotsvc.com?)

---

> *"Commit to the Lord whatever you do, and he will establish your plans."* — Proverbs 16:3
