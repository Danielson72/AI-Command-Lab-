# AI Command Lab - Backend

This directory contains the backend infrastructure for the **Kingdom Closer Engine** and **Kingdom Ops Agent** systems.

## 🏗️ Architecture Overview

The backend is built on **Supabase** (PostgreSQL + Edge Functions) and integrates with:
- **Stripe** for subscription and payment management
- **DigitalOcean** for infrastructure automation
- **Claude API** for AI-powered service recommendations and empathy-driven interactions
- **Terminus** for WordPress site management

## 📁 Directory Structure

```
backend/
├── supabase/
│   ├── schema.sql              # Complete database schema
│   ├── functions/              # Supabase Edge Functions
│   │   ├── on_cqi_submit/      # Triggered when CQI form is submitted
│   │   ├── on_trial_convert/   # Triggered when trial converts to paid
│   │   └── on_ops_task_trigger/ # Triggered for ops automation tasks
│   └── webhooks/
│       └── stripe-subscription.js  # Stripe webhook handler
├── scripts/
│   ├── seed.ts                 # Database seeding script
│   └── testOpsAgent.ts         # Ops Agent testing utilities
├── knowledge/
│   ├── empathy_patterns.json   # Empathy response patterns
│   ├── persuasion_strategies.json  # Persuasion frameworks
│   ├── emotional_triggers.json # Emotional intelligence data
│   └── decision_drivers.json   # Decision-making psychology
└── README.md
```

## 🗃️ Database Schema

### Kingdom Closer Engine Tables
- **brands** - Multi-brand configuration
- **cqi_templates** - Customer Qualification Interview templates
- **cqi_responses** - User responses to CQI questions
- **trials** - Trial subscription tracking
- **services** - Service catalog and recommendations

### Kingdom Ops Agent Tables
- **ops_tasks** - Automated operations task queue
- **infra_logs** - Infrastructure and agent activity logs

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials:
   - Supabase URL and service key
   - Stripe secret key
   - DigitalOcean API key
   - Terminus token
   - Claude and OpenAI API keys

3. Enable Realtime on these tables in Supabase:
   - `cqi_responses`
   - `trials`
   - `ops_tasks`

## 🚀 Deployment

### Deploy Schema
```bash
supabase db push
```

### Deploy Edge Functions
```bash
supabase functions deploy on_cqi_submit
supabase functions deploy on_trial_convert
supabase functions deploy on_ops_task_trigger
```

## 🔌 API Endpoints

Once deployed, the following endpoints will be available:

- `POST /api/cqi/start` - Initialize a new CQI session
- `POST /api/cqi/recommend` - Generate AI service recommendation
- `POST /api/trials/convert` - Convert trial to paid subscription
- `POST /api/ops/task` - Trigger ops automation task

## 🧠 Mind Engine

The knowledge folder contains JSON files that power the empathetic AI responses:

- **empathy_patterns.json** - Maps emotional states to appropriate responses
- **persuasion_strategies.json** - Ethical persuasion frameworks
- **emotional_triggers.json** - Common emotional triggers and responses
- **decision_drivers.json** - Psychology of decision-making

These are consumed by Claude to generate contextually appropriate, emotionally intelligent responses.

## 🛡️ Security & Governance

- All tables use Row Level Security (RLS)
- Separate policies for `chatbot` and `ai_agent` roles
- No destructive operations without `approved: true` flag
- All AI actions logged to `infra_logs` for audit trail

## 📊 Testing

Run the ops agent test suite:
```bash
npm run test:ops
```

## 🎯 Integration Flow

1. User fills out CQI form → stored in `cqi_responses`
2. `on_cqi_submit` edge function triggers → Claude analyzes responses
3. AI generates service recommendation → stored in `trials`
4. Trial begins → Ops Agent monitors via `ops_tasks`
5. Mind Engine tracks emotional tone and conversion data
6. Command Lab dashboard displays real-time metrics

---

**Philosophy**: "We're not building software — we're building discernment in code."

Every system carries Daniel's character: humble, wise, and focused on value through empathy.

