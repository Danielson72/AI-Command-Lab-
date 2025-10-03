# AI Command Lab — Project Brief (Source of Truth)

## Mission
Multi-brand automation & website platform for: Sonz of Thunder Services (SOTSVC.com), TrustedCleaningExpert.com, DLD-Online.com, BossOfClean.com. Centralizes web, leads, payments, content, and AI agents.

## Non-negotiables
- Hosting/CDN: **Netlify** (not Vercel)
- Frontend: **Next.js (App Router)** in `/next`
- Backend: **FastAPI** in `/server` (DigitalOcean), CORS for Netlify + localhost
- DB/Auth/Storage: **Supabase** (RLS later)
- Media: Cloudinary
- Payments: Stripe
- Dev: GitHub, VS Code, Claude Code (MCP)

## Current status
- `/server` running locally at `http://localhost:8000` (`/health`, `/hello`, POST `/lead`)
- `/next` running locally at `http://localhost:3000` with `/lab` and `/contact`
- Env: `.env.local` (web), `server/.env` (api) — secrets NOT committed

## Repo layout
- `/next` — web app (pages in `app/*`)
- `/server` — FastAPI app (`app.py`, will split routes later)
- `netlify.toml` — base="next", publish=".next"
- `.claude/` — Claude Code config (MCP)
- `CLAUDE.md` — this document (read me first)

## Brand rules (must enforce)
- SOTSVC: show **SOTSVC.com**, **TrustedCleaningExpert.com** in captions, phone **407-461-6039**, tagline **“YOU'RE CLEAN OR YOU'RE DIRTY”**, “Sonz” with a Z
- DLD-Online: watermark **dld-online.com**
- TCE: shield logo + “Trusted Cleaning Experts”

## Phases
- **Phase 1 (MVP):** sites live, contact/quote → FastAPI, store leads in Supabase, Stripe basic checkout
- **Phase 2:** booking, proposals/invoices, analytics dashboards, content engine v2
- **Phase 3:** agentic orchestration, Playwright MCP QA, AllCalculate
- **Phase 4:** SaaS packaging, global payments, dispute automation

## Task backlog (next up)
1. Save `/contact` leads into Supabase `public.leads`
2. Deploy web to Netlify, API to DigitalOcean (systemd + nginx)
3. Add brand theme toggles & shared UI components
4. Add Stripe link creation endpoint

## How to run
- **API:** `cd server && source .venv/bin/activate && python3 -m uvicorn app:app --reload --host 0.0.0.0 --port 8000`
- **Web:** `cd next && npm run dev`

## Claude prompts (examples)
- “Add `/server/routes/lead.py` and refactor `app.py` to include router; keep behavior identical.”
- “Create a Netlify-ready contact page that posts to `${process.env.NEXT_PUBLIC_API_URL}/lead` and handles success/error states.”
- “Write SQL migration for `leads` (id uuid, created_at, name, email, phone, message, brand). RLS policy proposal for Phase 3.”

