AI COMMAND LAB - UNIFIED SOURCE OF TRUTH
Version: 1.1 Last Updated: November 19, 2024 Target Directory: `~/AI-Command-Lab-/` Owner: Daniel Alvarez

"Through wisdom a house is built, and through understanding it is established" (Proverbs 24:3)

---

🎯 PURPOSE

This document is the single source of truth for all AI agents operating in Daniel's AI Command Lab:
* Claude Code (Anthropic)
* Codex CLI (OpenAI)
* Gemini CLI (Google)
* Cursor (AI editor)

All agents MUST reference this document to maintain consistency, alignment, and shared intelligence.

---

👤 OPERATOR PROFILE

Name: Daniel Alvarez
Location: Apopka, Florida, US
Timezone: America/New_York (EST/EDT)
Rest Day: Saturdays (no work scheduled)
Work Style: Automation-first, step-by-step breakdowns, concrete outputs, biblical wisdom

---

🏢 BUSINESS ECOSYSTEM

1. SOTSVC (Sonz of Thunder Services)
Domain: https://SOTSVC.com
Tagline: "YOU'RE CLEAN OR YOU'RE DIRTY" (exact capitalization required)
Logo: Sunburst ST design (MUST appear on ALL branded materials)
Focus: Professional services, automation, God-centered business excellence
Social Media: All cleaning-related content must include SOTSVC.com

2. Boss of Clean
Domain: https://bossofclean.com
Mascot: CEO CAT character (with glasses, suit, and tie) 🐱💼
Focus: Premium cleaning services and expertise
Visual Style: Professional yet approachable
Social Media: Include bossofclean.com on cleaning content

3. Trusted Cleaning Expert
Domain: https://TrustedCleaningExpert.com
Focus: Cleaning expertise, tips, and professional services
Brand Position: Authority in cleaning industry
Social Media: Include on all cleaning-related posts

4. DLD-Online
Domain: https://DLD-Online.com
Focus: Personal brand, inspirational content, faith-based messaging
Social Media: Use for personal/inspirational posts

5. AllCalculate
Status: In development
Focus: Calculator tools and mathematical utilities
Tech Stack: React, Next.js, Supabase

6. BeatSlave (Music Industry)
Status: Active project
Focus: Music production and industry tools

---

🛠️ TECHNICAL INFRASTRUCTURE

Directory Structure

```
~/AI-Command-Lab-/
├── config/                      # Shared configurations
│   └── shared-mcp-servers.json  # MCP server definitions
├── env/                         # Environment variables (git-ignored)
│   ├── .keys.template           # Template for API keys
│   └── .keys                    # Actual keys (NEVER commit)
├── mcp-servers/                 # MCP server installations
│   ├── filesystem/              # File operations
│   ├── github/                  # GitHub integration
│   └── custom/                  # Custom servers
├── scripts/                     # Utility scripts
│   ├── add-mcp-to-codex.sh     # Configure Codex
│   ├── launch-codex.sh         # Launch Codex
│   ├── enable-mcp-features.sh  # Enable MCP features
│   └── deploy.sh               # Deployment helpers
├── projects/                    # Active development projects
├── logs/                        # Execution logs
└── README.md                    # Documentation
```

MCP Servers Configured

1. filesystem
* Purpose: File operations within AI Command Lab
* Command: `npx -y @modelcontextprotocol/server-filesystem`
* Args: `~/AI-Command-Lab-/`
* Auth: None required

2. github
* Purpose: GitHub API integration
* Command: `npx -y @modelcontextprotocol/server-github`
* Auth: `GITHUB_PERSONAL_ACCESS_TOKEN`
* Capabilities: Repos, issues, PRs, Actions

3. brave-search
* Purpose: Web search capabilities
* Command: `npx -y @modelcontextprotocol/server-brave-search`
* Auth: `BRAVE_API_KEY`

4. memory
* Purpose: Persistent memory across sessions
* Command: `npx -y @modelcontextprotocol/server-memory`
* Auth: None required

---

🔐 CREDENTIALS & API KEYS

Location: `~/AI-Command-Lab-/env/.keys`

Load credentials:
```bash
source ~/AI-Command-Lab-/env/.keys
```

Available Keys:
```bash
# AI Services
OPENAI_API_KEY=<your_key>
ANTHROPIC_API_KEY=<your_key>
GEMINI_API_KEY=AIzaSyA2fMJg7BWGSPpD6X1CC65_gIHiEn6Dg44

# Development Tools
GITHUB_PERSONAL_ACCESS_TOKEN=<your_token>
BRAVE_API_KEY=<your_key>

# Backend Services
SUPABASE_URL=<your_url>
SUPABASE_ANON_KEY=<your_key>
SUPABASE_SERVICE_ROLE=<your_key>

# Integration Services
FIRECRAWL_API_KEY=<your_key>
EXA_API_KEY=<your_key>
```

Security Rules:
* ✅ Always source from `.keys` file
* ❌ NEVER commit `.keys` to git
* ❌ NEVER hard-code credentials
* ✅ Use environment variables only
* ✅ Validate keys before use

---

💾 SUPABASE INTEGRATION

Connection Details
URL: `$SUPABASE_URL`
Anon Key: `$SUPABASE_ANON_KEY` (client-side)
Service Role: `$SUPABASE_SERVICE_ROLE` (server-side)

Common Schemas

Example: Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

Example: Services Table (for SOTSVC/Boss of Clean)
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(active);
```

Edge Functions Template

Location: `~/AI-Command-Lab-/supabase/functions/`

Example: Stripe Webhook Handler
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', event.data.object.id)
        break
      case 'customer.subscription.created':
        // Handle new subscription
        console.log('Subscription created:', event.data.object.id)
        break
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    })
  }
})
```

Best Practices
* ✅ Always use Row Level Security (RLS)
* ✅ Create indexes for frequently queried columns
* ✅ Use transactions for multi-table operations
* ✅ Validate data at database level with CHECK constraints
* ✅ Use Edge Functions for secure server-side operations
* ✅ Never expose service_role key to client

---

🐙 GITHUB INTEGRATION

Repository Structure

Personal Repos:
* `danielalvarez/sotsvc-website`
* `danielalvarez/boss-of-clean`
* `danielalvarez/trusted-cleaning-expert`
* `danielalvarez/dld-online`
* `danielalvarez/allcalculate`
* `danielalvarez/ai-command-lab` (this workspace)

GitHub Actions Workflow Template

Location: `.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

Common Git Workflows
```bash
# Start new feature
git checkout -b feature/new-calculator
git add .
git commit -m "feat: Add new calculator component"
git push origin feature/new-calculator

# Create PR via GitHub CLI
gh pr create --title "Add new calculator" --body "Description here"

# Merge and deploy
gh pr merge --squash --delete-branch
```

---

💳 STRIPE INTEGRATION

Configuration
Mode: Test & Production available
Webhook Secret: Stored in `STRIPE_WEBHOOK_SECRET`

Common Operations

Create Payment Intent
```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function createPayment(amount: number, currency: string = 'usd') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  })
  
  return paymentIntent.client_secret
}
```

Create Subscription
```typescript
async function createSubscription(customerId: string, priceId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  })
  
  return subscription
}
```

Webhook Event Types:
* `payment_intent.succeeded`
* `payment_intent.failed`
* `customer.subscription.created`
* `customer.subscription.updated`
* `customer.subscription.deleted`
* `invoice.payment_succeeded`
* `invoice.payment_failed`

---

🔮 FUTURE TECH STACK & STRATEGIC CONTEXT

Planned Integrations

OpenSearch (Monitoring & Analytics)
* Cost: $19/month when scaling
* Purpose: Application monitoring, log aggregation, search analytics
* Timeline: Month 3-6 (when traffic scales)
* Use Cases: Performance monitoring, error tracking, search optimization

Resend (Email Notifications)
* Cost: $0/month (free tier initially)
* Purpose: Transactional emails, form confirmations, notifications
* Timeline: Implementing now (Phase 1-2)
* Use Cases:
  * Form submission confirmations
  * Booking confirmations
  * Payment receipts
  * Lead notifications to team

Twilio (SMS Integration)
* Cost: ~$20-50/month (when needed)
* Purpose: SMS notifications and two-way communication
* Timeline: Phase 4 (Month 3+)
* Use Cases:
  * Booking reminders
  * Payment confirmations
  * Two-factor authentication
  * Customer communication

Kingdom Closer (AI Intelligence Layer)
* Cost: Development time + API costs
* Purpose: AI-powered lead qualification and follow-up automation
* Timeline: Phase 4 (Month 3-6, when capacity allows)
* Capabilities:
  * Lead scoring (hot/warm/cold)
  * Automated qualification
  * Smart follow-up sequences
  * Multi-touch communication strategy
  * Intelligent routing

Strategic Context: GHL Replacement Project

Current Situation:
* Paying GoHighLevel $297/month ($3,564/year)
* Only using it for 3 simple contact forms
* Massive resource waste

The Solution: Build custom forms routing through CQL → Supabase → Email notifications

The Three Forms:
1. SOTSVC.com - Quote request form
2. JamHomeDecor.com - Contact form (client project)
3. TrustedCleaningExpert.com - Lead capture

Form Architecture:
```
User fills form
    ↓
Client-side validation
    ↓
CQL middleware endpoint
    ↓
Supabase table (brand-tagged)
    ↓
Email notification via Resend
    ↓
Lead stored for follow-up
```

Lead Management System:
```sql
-- Each brand has separate lead table
CREATE TABLE sotsvc_leads (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  service_type TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  brand TEXT DEFAULT 'sotsvc',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jamhome_leads (...); -- Similar structure
CREATE TABLE tce_leads (...);     -- Similar structure
```

Timeline:
* Week 2-3: Build all 3 forms
* Week 4: Parallel run with GHL (safety check)
* Week 4: Cancel GHL → Save $297/month
* Month 2: Lead management dashboard
* Month 2-3: Auto-responder enhancement
* Month 3+: Kingdom Closer (when ready)

Financial Impact:
* Development: ~40 hours (1-2 weeks)
* Annual savings: $3,564/year
* 5-year savings: $17,820
* Break-even: Immediate

Phased Sophistication Philosophy

Phase 1: Simple (URGENT)
* Forms → Supabase → Email
* Eliminate GHL cost
* Basic but functional

Phase 2: Organized (Near-term)
* Lead management dashboard
* Status tracking
* Notes and filtering

Phase 3: Professional (Month 2-3)
* Automated confirmation emails
* Brand-specific templates
* Enhanced customer experience

Phase 4: Sophisticated (Month 3+)
* Kingdom Closer AI layer
* Lead qualification
* Automated follow-up
* SMS integration
* Competitive advantage

Key Principle: Start simple, add sophistication when capacity allows. Don't over-engineer initially.

CQL Middleware Layer

Purpose: Form processing, validation, and routing

Responsibilities:
* Validate form submissions
* Enforce brand tagging
* Route to correct Supabase tables
* Trigger email notifications
* Handle errors gracefully
* Log all submissions

Example CQL Endpoint:
```javascript
// /api/forms/sotsvc-quote
export async function POST(req) {
  const { name, email, phone, service, message } = await req.json()
  
  // Validate
  if (!email || !name) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }
  
  // Store in Supabase with brand tag
  const { data, error } = await supabase
    .from('sotsvc_leads')
    .insert({
      name,
      email,
      phone,
      service_type: service,
      message,
      brand: 'sotsvc', // Critical for isolation
      status: 'new'
    })
  
  if (error) throw error
  
  // Send notification
  await resend.emails.send({
    from: 'leads@sotsvc.com',
    to: 'daniel@sotsvc.com',
    subject: `New SOTSVC Lead: ${name}`,
    html: `<p>New quote request from ${name}...</p>`
  })
  
  return Response.json({ success: true })
}
```

Integration with Three Pillars

1. Identity Strategy: "Siloed & Secure"
* Each brand's leads isolated in separate tables
* RLS ensures privacy
* Even though one database, data is separated
* Liability reduced, privacy protected

2. Money Strategy: "Unified Treasury"
* All transactions tagged with brand
* Critical for accounting accuracy
* Single dashboard shows all revenue streams
* Brand-level P&L reporting

3. Operations Strategy: "Simple to Sophisticated"
* Start with basic forms (eliminate cost)
* Add dashboard (organize leads)
* Add automation (scale efficiency)
* Add AI (competitive advantage)
* Never over-engineer early phases

---

🎨 BRAND & DESIGN SYSTEM

Color Palettes

SOTSVC:
* Primary: Professional blues and grays
* Accent: Clean whites
* Style: Minimalist, professional

Boss of Clean:
* Primary: Bold, authoritative colors
* Mascot: CEO CAT (consistent across all materials)
* Style: Professional yet approachable

Typography
* Headings: Sans-serif, bold, clear
* Body: Sans-serif, readable, professional
* Code: Monospace when showing technical content

Logo Requirements
* ✅ SOTSVC: Sunburst ST logo REQUIRED on all materials
* ✅ Boss of Clean: CEO CAT mascot
* ✅ Placement: Typically bottom-right corner
* ✅ Domain: Always include relevant domain in footer

Social Media Templates

Post Structure:
```
[Visual: Clean, professional image]

SHORT CAPTION (1-2 lines)
Punchy, engaging opening

LONG CAPTION
Detailed, story-driven content
Value-focused
Encouraging tone

[Bible Verse Citation]
"Scripture quote here" (Reference)

#relevant #hashtags
Domain: SOTSVC.com | TrustedCleaningExpert.com
```

---

🔧 DEVELOPMENT WORKFLOW

Starting a New Project
```bash
# Navigate to AI Command Lab
cd ~/AI-Command-Lab-

# Load credentials
source env/.keys

# Create project directory
mkdir -p projects/new-project
cd projects/new-project

# Initialize git
git init

# Create Next.js app (example)
npx create-next-app@latest . --typescript --tailwind --app

# Install additional dependencies
npm install @supabase/supabase-js stripe

# Set up environment
cp ../../env/.keys.template .env.local
```

Code Quality Standards

TypeScript:
* ✅ Use strict mode
* ✅ Avoid `any` type
* ✅ Proper interfaces/types
* ✅ Document complex functions

React/Next.js:
* ✅ Use functional components
* ✅ Custom hooks for logic
* ✅ Proper error boundaries
* ✅ Loading states
* ✅ Accessibility (a11y)

Supabase:
* ✅ Always use RLS
* ✅ Validate input server-side
* ✅ Use transactions when needed
* ✅ Proper error handling

Stripe:
* ✅ Never expose secret keys
* ✅ Validate webhooks
* ✅ Handle idempotency
* ✅ Test with test mode first

---

🤖 AI AGENT COLLABORATION

Communication Protocol

When starting work:
1. Announce what you're working on
2. Check recent Git commits
3. Review what other agents have done
4. Load current context

When making changes:
1. Document in code comments
2. Commit with clear messages
3. Update relevant documentation
4. Notify if handoff needed

Git Commit Format:
```
type(scope): description

feat: New feature
fix: Bug fix
docs: Documentation
style: Formatting
refactor: Code restructure
test: Testing
chore: Maintenance
```

Handoff Protocol

To another agent:
```
Context: Working on [project]
Status: [completed/in-progress/blocked]
Files changed: [list]
Next steps: [what needs to happen]
Notes: [any important context]
```

---

📚 DOCUMENTATION STANDARDS

Code Comments
```typescript
/**
 * Creates a new user in Supabase
 * @param email - User's email address
 * @param password - User's password (min 8 characters)
 * @returns User object with ID and auth token
 * @throws Error if email already exists
 */
async function createUser(email: string, password: string) {
  // Implementation
}
```

README Structure
```markdown
# Project Name

## Purpose
Brief description

## Setup
Installation instructions

## Usage
How to use

## Environment Variables
Required variables

## Development
Local development setup

## Deployment
How to deploy

## License
```

---

🙏 GOD-CENTERED PRINCIPLES

Core Values
Stewardship: Efficient use of resources
Excellence: "Work heartily, as for the Lord" (Colossians 3:23)
Integrity: Honest, transparent operations
Service: Serving others through business
Wisdom: Seeking godly counsel

Scripture Integration
* Always verify verses - cite accurately
* Quote verbatim with reference
* Choose relevant passages
* Natural integration (not forced)
* Balance faith and professionalism

Decision Framework
1. Is it honest and true?
2. Does it serve others well?
3. Does it honor God?
4. Is it excellent in quality?
5. Is it sustainable?

---

✅ AGENT-SPECIFIC INSTRUCTIONS

For Claude Code
* Primary development assistant
* Handles complex architecture
* Creates comprehensive documentation
* Manages cross-tool coordination

For Codex CLI
* Command-line coding tasks
* Script automation
* API integration
* Testing and validation

For Gemini CLI
* Alternative perspectives
* Schema optimization
* Performance analysis
* Code review

For All Agents
* Reference this document first
* Load credentials before starting
* Commit changes to Git
* Document your work
* Communicate with other agents
* Maintain security standards
* Follow brand guidelines
* Honor God-centered principles

---

🎯 QUICK REFERENCE

Directory: `~/AI-Command-Lab-/`
Credentials: `source ~/AI-Command-Lab-/env/.keys`
MCP List: `codex mcp list`
Git Status: `git status`
Load Context: Read this file first

Domains:
* SOTSVC.com
* bossofclean.com
* TrustedCleaningExpert.com
* DLD-Online.com

Key Tagline: "YOU'RE CLEAN OR YOU'RE DIRTY"

---

"Through wisdom a house is built, and through understanding it is established" (Proverbs 24:3)

END OF SOURCE OF TRUTH
