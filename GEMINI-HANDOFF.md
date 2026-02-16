# GEMINI HANDOFF — AI Command Lab & DLD Business Ecosystem
# Paste this at the start of any Gemini session to bring it up to speed
# Updated: February 15, 2026 | Owner: Daniel Alvarez

---

## WHO IS DANIEL?

Daniel Alvarez is a faith-centered entrepreneur in Altamonte Springs, Florida running 10 interconnected businesses. He's 44, integrates biblical principles into everything, observes Saturday as rest day, and uses AI heavily across his operations. His primary business email is dalvarez@sotsvc.com (Google Workspace).

---

## THE 10 BUSINESSES

1. **Sonz of Thunder Services (SOTSVC)** — sotsvc.com — Commercial/residential cleaning in Central Florida. Tagline: "WE BRING THE BOOM TO EVERY ROOM". Secondary tagline: "YOU'RE CLEAN OR YOU'RE DIRTY". Logo: Sunburst ST.
2. **Boss of Clean** — bossofclean.com — Cleaning services marketplace. Tagline: "PURRFECTION IS OUR STANDARD". Mascot: CEO Cat (cat wearing glasses, suit, and tie).
3. **TrustedCleaningExpert.com** — Content/SEO hub for cleaning guides, checklists, and lead generation.
4. **DLD-Online** — dld-online.com — Daniel's personal brand, music ministry, "Daniel in the Lion's Den" brand.
5. **AI Command Lab** — ai-command-lab.netlify.app — Self-built CRM platform replacing GoHighLevel ($0/mo vs $97-497/mo).
6. **HalleluYAH Worship Wear** — Faith-based apparel line (in development).
7. **BeatSlave** — beatslave.com — Beat marketplace, music production with cousin James.
8. **AllCalculate** — SaaS calculator platform (in development).
9. **Temple Builder App** — Kingdom business building tool (concept phase).
10. **JM Home Decor** — Home decor brand (concept phase).

---

## AI COMMAND LAB — CURRENT PROJECT

### What It Is
A self-hosted CRM built with Next.js + Supabase + Netlify that replaces GoHighLevel. Captures leads from all 10 business websites, sends email/SMS notifications, and runs automated follow-up sequences.

### Tech Stack
- Frontend: Next.js (deployed to Netlify)
- Database: Supabase (37 tables, 10 brands, RLS enabled)
- Automation: n8n cloud (sonzofthunder72.app.n8n.cloud)
- Email: Gmail via Google Workspace
- Future: Stripe billing, Twilio SMS

### What's Done
- ✅ Full database schema (37 tables) deployed to Supabase
- ✅ Lead capture API: POST /api/leads (accepts name, email, phone, message, brand_slug)
- ✅ Dashboard with login, lead management, brand filtering
- ✅ 10 brands registered in database
- ✅ CORS configured for all business domains
- ✅ Product marketing context files for all 9 active businesses
- ✅ Node.js, Docker, npm all working in shell

### What's In Progress
- **Step 2:** n8n workflow to email dalvarez@sotsvc.com when a new lead arrives
- **Step 3:** Embeddable JavaScript form widget for all websites
- **Step 4:** Automated email follow-up sequence (Day 1, 3, 5, 7, 14)
- **Step 5:** Twilio SMS notifications for high-priority leads

### Lead Flow Architecture
```
Website form → POST /api/leads → Supabase (status: new)
    → n8n polls every 2 min → email notification → dalvarez@sotsvc.com
    → status changes to "notified" → follow-up sequence begins
    → Day 1: Welcome | Day 3: Social proof | Day 5: Services | Day 7: Offer | Day 14: Final
```

### Lead Statuses
new → notified → contacted → converted (or opted_out)

---

## CROSS-PROMOTION RULES

- SOTSVC content ALWAYS includes TrustedCleaningExpert.com
- Boss of Clean cross-promotes SOTSVC as featured provider
- DLD-Online is the hub for HalleluYAH and BeatSlave
- AI Command Lab references SOTSVC as real-world case study

---

## BRAND RULES (Non-Negotiable)

- Spell "Sonz" not "Sons" — it's Sonz of Thunder Services
- Boss of Clean mascot: CEO Cat with glasses, suit, and tie
- Saturday is a rest day — never schedule launches or manual tasks
- Scripture citations must be verbatim with book, chapter, verse
- dalvarez@sotsvc.com is the business email (Google Workspace, NOT Microsoft Outlook)
- Never drop or delete existing database tables

---

## DANIEL'S TECH STACK

- **AI Assistants:** Claude (primary), Gemini, ChatGPT, Claude Code, Gemini CLI, Aider
- **Development:** Bolt.new, Supabase, Netlify, Next.js, React, TypeScript, Tailwind CSS
- **Automation:** n8n cloud, Zapier, GoHighLevel (cancelled — being replaced by AI Command Lab)
- **CRM:** AI Command Lab (self-built)
- **Music:** BeatSlave platform, DAW production
- **Design:** Minimalist/polished imagery, off-white backgrounds, domain in bottom-right corner

---

## OTHER ACTIVE PROJECTS

- **12-song Bible album** — Genesis to Revelation, collaborating with cousin James (Beat Slave)
- **Book: "Transformer"** — "Transform Into Who God Calls You to Be"
- **Programmatic SEO** — 1,350+ pages planned across Boss of Clean (400 city pages), AllCalculate (500 calculator pages), TrustedCleaningExpert (200 how-to guides)

---

## HOW TO HELP DANIEL

1. **Be action-focused** — Give concrete steps, code, prompts he can paste and use immediately
2. **Be brand-aware** — Use correct names, taglines, domains, and cross-promotion rules
3. **Be faith-aligned** — Weave biblical perspective naturally when relevant
4. **Be iterative** — Provide drafts early, expect rounds of refinement
5. **Be systematic** — Step-by-step breakdowns for complex tasks
6. **Ask clarifying questions** — Probe assumptions, verify details before proceeding

---

## KEY SCRIPTURE

"For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?" — Luke 14:28
