# CLAUDE.md — AI Command Lab

## Project Overview
AI Command Lab is a self-hosted CRM replacing GoHighLevel. Built with Next.js + Supabase + Netlify.
Live at: https://ai-command-lab.netlify.app

## Read First
- **HANDOFF.md** — Full project status, credentials, database schema, automation architecture
- **PRD-AI-Command-Lab.md** — Product requirements document
- **product-context.md** — Marketing context (audience, competitors, USP)
- **next/.env.local** — All credentials (Supabase URL, keys, site URL)

## Tech Stack
- **Frontend:** Next.js (in /next/ directory)
- **Database:** Supabase (project: wxsfnpbmngglkjlytlul)
- **Hosting:** Netlify (ai-command-lab.netlify.app)
- **Email:** Gmail via Google Workspace (dalvarez@sotsvc.com)
- **Automation:** n8n cloud (sonzofthunder72.app.n8n.cloud)
- **Future:** Stripe (SaaS billing), Twilio (SMS)

## Key Files
- `/next/app/api/leads/route.ts` — Lead capture API
- `/next/app/dashboard/` — Admin dashboard
- `/next/app/login/page.tsx` — Auth page
- `/supabase/migrations/` — Database migrations
- `/next/public/embed/` — Embeddable form widget (Step 3)

## Database
37 tables in Supabase. Key tables: brands (10 records), leads, profiles, feature_flags.
Lead statuses: new → notified → contacted → converted (or opted_out).
NEVER drop or delete existing tables. Use CREATE IF NOT EXISTS and ON CONFLICT DO NOTHING.

## Current Sprint (Feb 2026)
Step 2: n8n email notification on new leads → dalvarez@sotsvc.com
Step 3: Embeddable JS form widget for all 10 brand websites
Step 4: Automated email follow-up sequences (Day 1/3/5/7/14)
Step 5: Twilio SMS for high-priority leads

## MCP Servers Available
- n8n cloud (search_workflows, execute_workflow, get_workflow_details)
- Supabase (read-only via MCP — use API or SQL editor for writes)
- Stripe (for future billing features)
- Netlify (deploy-site, get-projects, manage-env-vars)

## Build & Deploy
```bash
cd ~/AI-Command-Lab-/next
npm ci && npm run build
# Deploys automatically via Netlify on git push
```

## Brand Rules
- "Sonz" not "Sons" for SOTSVC
- CEO Cat (Boss of Clean) always wears glasses, suit, tie
- Saturday = rest day
- Always include both SOTSVC.com AND TrustedCleaningExpert.com in cleaning content
- dalvarez@sotsvc.com is the business email (Google Workspace, NOT Outlook)

## Product Context
Full marketing context files at ~/.claude/skills/product-context-skills/
Each business has: personas, competitors, SEO strategy, email sequences, cross-promotion rules.
