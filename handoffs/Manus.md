# 🧠 Handoff to Manus: Backend Foundation

**To:** Senior Developer & AI Systems Architect
**From:** CTO
**Date:** October 18, 2025
**Subject:** Phase 1 & 2 Handoff: Kingdom Closer + Kingdom Ops Agent Backend

---

This document outlines the mission and technical specifications for implementing the backend foundation for our new AI-driven systems within the AI Command Lab repository.

## 🚀 Mission

Your mission is to implement the complete backend foundation for both the **Kingdom Closer Engine** and the **Kingdom Ops Agent**. This includes:

- **Database Schema:** All necessary tables, policies, and functions in Supabase.
- **Edge Functions:** Serverless logic for key business operations.
- **Webhooks:** Integration with third-party services like Stripe.
- **Repo Structure & Config:** A clean, scalable, and well-documented repository structure.

By the end of this handoff, the backend will be fully operational, ready for the AI logic layer to be built on top of it.

## 📁 Repository Structure

The following structure has been created under `AI-Command-Lab/backend/`:

```
backend/
 ├─ supabase/
 │   ├─ schema.sql              # Complete database schema with RLS
 │   ├─ functions/              # Supabase Edge Functions
 │   │   ├─ on_cqi_submit/      # Triggered on CQI form submission
 │   │   │   ├─ index.ts
 │   │   │   └─ supabase.toml
 │   │   ├─ on_trial_convert/   # Triggered when a trial converts to paid
 │   │   │   └─ index.ts
 │   │   └─ on_ops_task_trigger/ # Triggered for ops automation tasks
 │   │       └─ index.ts
 │   └─ webhooks/
 │       └─ stripe-subscription.js  # Stripe webhook handler
 ├─ scripts/
 │   ├─ seed.ts                 # Database seeding script
 │   └─ testOpsAgent.ts         # Ops Agent testing utilities
 ├─ knowledge/
 │   ├─ empathy_patterns.json   # Empathy response patterns
 │   ├─ persuasion_strategies.json  # Persuasion frameworks
 │   ├─ emotional_triggers.json # Emotional intelligence data
 │   └─ decision_drivers.json   # Decision-making psychology
 └─ README.md
```

## 🗃️ Supabase Schema

The complete database schema is defined in `supabase/schema.sql`. It includes:

### Kingdom Closer Engine Tables
- **brands:** Manages multi-brand configurations.
- **cqi_templates:** Stores templates for Customer Qualification Interviews.
- **cqi_responses:** Captures user responses to CQIs.
- **trials:** Tracks trial subscriptions and AI-generated recommendations.
- **services:** Contains the catalog of services for each brand.

### Kingdom Ops Agent Tables
- **ops_tasks:** A queue for automated operations tasks.
- **infra_logs:** A comprehensive log for all agent and infrastructure activities.

### Security
- **Row Level Security (RLS)** is enabled on all tables.
- **Policies** are in place for `chatbot` (customer-facing) and `ai_agent` (backend automation) roles.

## ⚙️ Configuration

Environment variables are managed via a `.env` file in the `backend/` directory. A `.env.example` file is provided for reference:

```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
STRIPE_SECRET_KEY=
DIGITALOCEAN_API_KEY=
TERMINUS_TOKEN=
CLAUDE_API_KEY=
OPENAI_API_KEY=
```

**Realtime:** Realtime has been enabled on the `cqi_responses`, `trials`, and `ops_tasks` tables in Supabase to power the live dashboard.

## 🧩 Edge Functions Logic

Three core Edge Functions have been implemented:

- **on_cqi_submit:** 
    - Triggers when a CQI form is submitted.
    - Fetches CQI data and available services.
    - Calls the Claude API with a detailed prompt to generate a service recommendation, emotional pitch, and email copy.
    - Creates a new record in the `trials` table with the AI-generated content.
    - Logs all actions to `infra_logs`.

- **on_trial_convert:**
    - Triggers when a trial converts to a paid subscription.
    - Updates the trial status and records Stripe subscription details.
    - Verifies the subscription with the Stripe API.
    - Sends a confirmation email (currently logged, ready for integration).
    - Creates a new `ops_task` for customer onboarding.

- **on_ops_task_trigger:**
    - A versatile function to manage the lifecycle of ops tasks (`create`, `start`, `complete`, `fail`).
    - Includes a safety guard to prevent destructive operations unless an `approved: true` flag is set.
    - Executes task logic based on type (e.g., `deploy_site`, `backup_database`).

## 🧠 Knowledge Folder

The `knowledge/` directory contains the JSON files that power the **Mind Engine**. These files provide the structured knowledge for Claude to generate empathetic, persuasive, and emotionally intelligent responses:

- `empathy_patterns.json`
- `persuasion_strategies.json`
- `emotional_triggers.json`
- `decision_drivers.json`

These files are read by the AI layer to ensure all interactions align with our brand character: humble, wise, and value-focused.

## 🎯 Goal for Manus

**The backend is now live.** `schema.sql` is ready to be pushed to Supabase, all functions are ready for deployment, and API keys can be stored securely.

The following API endpoints are now conceptually available for Claude to call (via front-end or other services):

- `/api/cqi/start`
- `/api/cqi/recommend`
- `/api/trials/convert`
- `/api/ops/task`

This completes the backend foundation. The system is now ready for the AI and front-end implementation.

---

**Closing Statement:** “We’re not building software — we’re building discernment in code.” Every system here must think, feel, and serve as if it carries Daniel’s character: humble, wise, and focused on value through empathy.

