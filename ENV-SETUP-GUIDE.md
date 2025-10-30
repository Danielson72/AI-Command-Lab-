# CQI System - Environment Setup Guide

## Overview
This guide provides step-by-step instructions for configuring environment variables across all components of the CQI system. Follow this guide to set up local development, staging, and production environments.

---

## Quick Start (5 Minutes)

### 1. Copy Environment Templates
```bash
# Web app environment
cp .env.shared next/.env.local

# API environment
cp .env.shared server/.env

# Agent runtime environment (create new)
mkdir -p agents-core/runtime
cp .env.shared agents-core/runtime/.env
```

### 2. Get Required Credentials
- **Anthropic API Key**: https://console.anthropic.com/settings/keys
- **Supabase Credentials**: https://supabase.com/dashboard → Project Settings → API
- **Stripe Keys**: https://dashboard.stripe.com/test/apikeys

### 3. Fill in Values
Edit each `.env` file and replace placeholder values with your actual credentials.

---

## Environment Files Overview

### File Locations:
```
AI-Command-Lab-/
├── .env.shared               # Template (DO NOT commit with real values)
├── next/.env.local           # Web app config (gitignored)
├── server/.env               # API config (gitignored)
├── agents-core/runtime/.env  # Agent runtime config (gitignored)
└── .gitignore                # Ensures .env files are not committed
```

### Verify .gitignore:
```bash
# Check that .env files are ignored
cat .gitignore | grep -E '\\.env'

# Expected output:
# .env
# .env.local
# .env*.local
# **/.env
```

---

## Core Configuration

### 1. Anthropic (Claude AI)

**Where to Get**:
1. Visit https://console.anthropic.com/
2. Sign in or create account
3. Go to Settings → API Keys
4. Create new key or copy existing key

**Environment Variable**:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
```

**Usage**:
- CQI Conductor agent
- CQI Scorer agent
- Closer Script generator
- All AI-powered decision making

**Cost Estimate**: $500-1000/month (depends on usage)

**Rate Limits**:
- Claude Sonnet 3.5: 50 requests/minute
- Monitor usage at: https://console.anthropic.com/settings/usage

---

### 2. Supabase (Database & Auth)

**Where to Get**:
1. Visit https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings → API
4. Copy URL and anon/public key

**Environment Variables**:
```bash
# Format: https://[project-ref].supabase.co
SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Public/anon key (safe to expose in frontend)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (NEVER expose in frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Notes**:
- ✅ **SAFE for frontend**: `SUPABASE_ANON_KEY`
- ❌ **NEVER in frontend**: `SUPABASE_SERVICE_ROLE_KEY`
- Use RLS (Row Level Security) policies to protect data
- Service role key bypasses all RLS policies

**Multi-Brand Setup**:
For multi-brand deployments, you can use:
```bash
# Option 1: Single database with brand column
SUPABASE_URL=https://main-project.supabase.co
SUPABASE_ANON_KEY=eyJhbG...

# Option 2: Separate database per brand
SUPABASE_URL_SOTSVC=https://sotsvc-project.supabase.co
SUPABASE_ANON_KEY_SOTSVC=eyJhbG...

SUPABASE_URL_BOC=https://boc-project.supabase.co
SUPABASE_ANON_KEY_BOC=eyJhbG...

SUPABASE_URL_BEATSLAVE=https://beatslave-project.supabase.co
SUPABASE_ANON_KEY_BEATSLAVE=eyJhbG...
```

**Current Deployments**:
- ✅ AI Command Lab: `https://yourproject1.supabase.co`
- ✅ BeatSlave: `https://yourproject2.supabase.co`
- ⏸️ SOTSVC: Awaiting URL
- ⏸️ Boss of Clean: Awaiting URL
- ⏸️ DLD-Online: Awaiting URL

---

### 3. Stripe (Payments)

**Where to Get**:
1. Visit https://dashboard.stripe.com/
2. Toggle Test Mode ON (top right)
3. Go to Developers → API Keys
4. Copy Publishable key and Secret key

**Environment Variables**:
```bash
# Test mode keys (for development)
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Production keys (for live payments)
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_LIVE_SECRET_KEY=sk_live_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_LIVE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

**Webhook Setup**:
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-api.com/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.failed`, `checkout.session.completed`
4. Copy webhook signing secret

**Security Notes**:
- ✅ **SAFE for frontend**: `STRIPE_PUBLISHABLE_KEY`
- ❌ **NEVER in frontend**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Always validate webhooks using signing secret
- Use test mode for all development

**Cost**: 2.9% + $0.30 per successful transaction

---

### 4. Application URLs

**Environment Variables**:
```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Staging
NEXT_PUBLIC_APP_URL=https://staging.yourapp.com
NEXT_PUBLIC_API_URL=https://staging-api.yourapp.com

# Production - SOTSVC
NEXT_PUBLIC_APP_URL=https://sotsvc.com
NEXT_PUBLIC_API_URL=https://api.sotsvc.com

# Production - Boss of Clean
NEXT_PUBLIC_APP_URL=https://bossofclean.com
NEXT_PUBLIC_API_URL=https://api.bossofclean.com
```

**CORS Configuration**:
Update FastAPI CORS settings in `server/app.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://sotsvc.com",
        "https://bossofclean.com",
        # Add all production domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Optional Services

### 5. Cloudinary (Image/Video Storage)

**Where to Get**:
1. Visit https://cloudinary.com/
2. Sign up or log in
3. Go to Dashboard
4. Copy Cloud Name, API Key, API Secret

**Environment Variables**:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

**Usage**:
- Before/after photos (Boss of Clean)
- Profile images
- Audio previews (BeatSlave)
- Property photos (SOTSVC)

**Cost**: Free tier includes 25GB storage, 25GB bandwidth/month

---

### 6. Twilio (SMS Notifications)

**Where to Get**:
1. Visit https://www.twilio.com/
2. Sign up or log in
3. Go to Console → Account Info
4. Copy Account SID and Auth Token

**Environment Variables**:
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14075551234
```

**Usage**:
- Trial booking confirmations
- Appointment reminders
- Follow-up notifications
- Emergency alerts

**Cost**: $0.0079 per SMS (US)

---

### 7. SendGrid (Email)

**Where to Get**:
1. Visit https://sendgrid.com/
2. Sign up or log in
3. Go to Settings → API Keys
4. Create new API key

**Environment Variables**:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@sotsvc.com
SENDGRID_FROM_NAME=Sonz of Thunder Services
```

**Usage**:
- Lead confirmation emails
- Trial booking confirmations
- Closer scripts via email
- Follow-up sequences
- Audit reports

**Cost**: Free tier includes 100 emails/day

---

### 8. Google Calendar (Scheduling)

**Where to Get**:
1. Visit https://console.cloud.google.com/
2. Create project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials

**Environment Variables**:
```bash
GOOGLE_CALENDAR_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

**Usage**:
- Trial booking calendar sync
- Automated appointment scheduling
- Availability checking
- Team calendar integration

**Cost**: Free (Calendar API)

---

## Brand-Specific Configuration

### SOTSVC Configuration

**File**: `projects/sotsvc/.agents/.env`

```bash
# Brand Identity
BRAND_NAME=sotsvc
BRAND_DISPLAY_NAME=Sonz of Thunder Services
BRAND_TAGLINE=YOU'RE CLEAN OR YOU'RE DIRTY
BRAND_PHONE=407-461-6039
BRAND_EMAIL=info@sotsvc.com
BRAND_WEBSITE=https://sotsvc.com

# CQI Settings
CQI_QUALIFICATION_THRESHOLD=70
CQI_TEMPLATE_ID=[UUID from cqi_templates table]

# Trial Settings
TRIAL_TYPE=trial_cleaning
TRIAL_DURATION_MINUTES=60
TRIAL_PRICE=99.00

# Supabase (if using separate database)
SUPABASE_URL=https://sotsvc-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...

# Stripe (if using separate account)
STRIPE_PUBLISHABLE_KEY=pk_test_sotsvc_xxxxx
STRIPE_SECRET_KEY=sk_test_sotsvc_xxxxx
```

---

### Boss of Clean Configuration

**File**: `projects/boss-of-clean/.agents/.env`

```bash
# Brand Identity
BRAND_NAME=boss_of_clean
BRAND_DISPLAY_NAME=Boss of Clean
BRAND_TAGLINE=Premium Pressure Washing & Exterior Cleaning
BRAND_PHONE=407-555-0200
BRAND_EMAIL=info@bossofclean.com
BRAND_WEBSITE=https://bossofclean.com

# CQI Settings
CQI_QUALIFICATION_THRESHOLD=60
CQI_TEMPLATE_ID=[UUID from cqi_templates table]

# Trial Settings
TRIAL_TYPE=free_estimate
TRIAL_DURATION_MINUTES=45
TRIAL_PRICE=0.00

# Marketplace Settings
MARKETPLACE_MODE=true
PROVIDER_COMMISSION_RATE=0.15
```

---

### BeatSlave Configuration

**File**: `projects/beatslave/.agents/.env`

```bash
# Brand Identity
BRAND_NAME=beatslave
BRAND_DISPLAY_NAME=BeatSlave
BRAND_TAGLINE=Your Sound. Perfected.
BRAND_PHONE=407-555-0300
BRAND_EMAIL=bookings@beatslave.com
BRAND_WEBSITE=https://beatslave.com

# CQI Settings
CQI_QUALIFICATION_THRESHOLD=50
CQI_TEMPLATE_ID=[UUID from cqi_templates table]

# Trial Settings
TRIAL_TYPE=creative_consultation
TRIAL_DURATION_MINUTES=30
TRIAL_PRICE=0.00

# Audio Settings
AUDIO_UPLOAD_MAX_SIZE=100MB
AUDIO_FORMATS=mp3,wav,aiff,flac
```

---

### Temple Builder Configuration

**File**: `projects/temple-builder/.agents/.env`

```bash
# Brand Identity
BRAND_NAME=temple_builder
BRAND_DISPLAY_NAME=Temple Builder
BRAND_TAGLINE=Building God's Kingdom, One Life at a Time
BRAND_PHONE=407-555-0400
BRAND_EMAIL=info@templebuilder.org
BRAND_WEBSITE=https://templebuilder.org

# CQI Settings
CQI_QUALIFICATION_THRESHOLD=80
CQI_TEMPLATE_ID=[UUID from cqi_templates table]

# Trial Settings
TRIAL_TYPE=ministry_assessment
TRIAL_DURATION_MINUTES=60
TRIAL_PRICE=0.00

# Ministry Settings
MINISTRY_FOCUS=true
BIBLICAL_RESOURCES=enabled
```

---

## Environment File Templates

### Template 1: next/.env.local

```bash
# ===================================
# Next.js Web App - Environment Config
# ===================================

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase (Public - safe for frontend)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (Public - safe for frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxxxxxxxxxx

# Brand Context
NEXT_PUBLIC_BRAND_NAME=sotsvc
NEXT_PUBLIC_BRAND_DISPLAY_NAME=Sonz of Thunder Services
NEXT_PUBLIC_BRAND_PHONE=407-461-6039
NEXT_PUBLIC_BRAND_EMAIL=info@sotsvc.com

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=sotsvc.com

# Feature Flags
NEXT_PUBLIC_FEATURE_CQI_ENABLED=true
NEXT_PUBLIC_FEATURE_TRIALS_ENABLED=true
NEXT_PUBLIC_FEATURE_PAYMENTS_ENABLED=true

# Environment
NODE_ENV=development
```

---

### Template 2: server/.env

```bash
# ===================================
# FastAPI Server - Environment Config
# ===================================

# Server Config
HOST=0.0.0.0
PORT=8000
DEBUG=true
WORKERS=4

# Supabase (Backend - includes service role)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20250131
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TEMPERATURE=0.7

# Stripe (Backend)
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@sotsvc.com
SENDGRID_FROM_NAME=Sonz of Thunder Services

# SMS (Twilio - optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14075551234

# CORS Allowed Origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,https://sotsvc.com,https://bossofclean.com

# Security
SECRET_KEY=your-secret-key-min-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
```

---

### Template 3: agents-core/runtime/.env

```bash
# ===================================
# Agent Runtime - Environment Config
# ===================================

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_MODEL=claude-3-5-sonnet-20250131

# Supabase (Agent Runtime)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Agent Configuration
AGENT_CONTEXT_PATH=./projects
AGENT_LOG_LEVEL=INFO
AGENT_MAX_RETRIES=3
AGENT_TIMEOUT_SECONDS=30

# CQI Configuration
CQI_CONDUCTOR_ENABLED=true
CQI_SCORER_ENABLED=true
CQI_TRIAL_MANAGER_ENABLED=true
CQI_CLOSER_ENABLED=true
CQI_AUDIT_ENABLED=true

# System Agents
SYSTEM_STARTUP_COORDINATOR_ENABLED=true
SYSTEM_CONTEXT_LIBRARIAN_ENABLED=true
SYSTEM_SESSION_CLOSER_ENABLED=true
SYSTEM_KINGDOM_CLOSER_ENABLED=true

# Workflow Configuration
WORKFLOW_ENGINE_ENABLED=true
WORKFLOW_MAX_CONCURRENT=10
WORKFLOW_RETRY_ATTEMPTS=3

# Monitoring
MONITORING_ENABLED=true
METRICS_EXPORT_INTERVAL=60
HEALTHCHECK_INTERVAL=30

# Environment
ENVIRONMENT=development
LOG_FORMAT=json
```

---

## Security Best Practices

### 1. Never Commit Secrets
```bash
# Always verify .gitignore includes:
.env
.env.local
.env*.local
**/.env

# Check before committing:
git status
git diff

# If you accidentally committed secrets:
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
# Then rotate all exposed credentials immediately!
```

---

### 2. Use Different Keys Per Environment

| Environment | Keys | Purpose |
|-------------|------|---------|
| Development | Test/Sandbox | Local development, no real data |
| Staging | Test/Sandbox | Pre-production testing |
| Production | Live/Production | Real customers, real data |

**Never** use production keys in development!

---

### 3. Rotate Keys Regularly

**Schedule**:
- API keys: Every 90 days
- Service role keys: Every 6 months
- Webhook secrets: Every 90 days
- JWT secrets: Every 12 months

**After Rotation**:
1. Generate new key in service dashboard
2. Update `.env` files
3. Restart all services
4. Revoke old key after 24-hour grace period
5. Monitor for errors

---

### 4. Use Secret Management (Production)

**Options**:
- **AWS Secrets Manager**: Full-featured, $0.40/secret/month
- **HashiCorp Vault**: Self-hosted, enterprise-grade
- **Doppler**: Developer-friendly, good free tier
- **1Password Secrets**: Team-based, integrated with 1Password

**Example with Doppler**:
```bash
# Install Doppler CLI
brew install dopplerhq/cli/doppler

# Login
doppler login

# Setup project
doppler setup

# Run app with secrets
doppler run -- npm run dev
doppler run -- python -m uvicorn app:app
```

---

### 5. Validate Environment Variables

**Create validation script**: `scripts/validate-env.sh`

```bash
#!/bin/bash

# Required variables
REQUIRED_VARS=(
  "ANTHROPIC_API_KEY"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "STRIPE_PUBLISHABLE_KEY"
  "NEXT_PUBLIC_APP_URL"
)

echo "Validating environment variables..."

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  else
    echo "✅ $var is set"
  fi
done

echo "✅ All required variables are set!"
```

**Usage**:
```bash
chmod +x scripts/validate-env.sh
./scripts/validate-env.sh
```

---

## Verification Checklist

### After Setup:
- [ ] All `.env` files created
- [ ] All required credentials added
- [ ] No `.env` files committed to git
- [ ] Test database connection
- [ ] Test API health check
- [ ] Test web app loads
- [ ] Verify CORS settings
- [ ] Test Stripe test mode
- [ ] Send test email
- [ ] Send test SMS (if enabled)

### Test Commands:
```bash
# Test Supabase connection
curl -X POST https://yourproject.supabase.co/rest/v1/rpc/health \
  -H "apikey: YOUR_ANON_KEY"

# Test API
curl http://localhost:8000/health

# Test Web App
curl http://localhost:3000

# Test environment loading (Next.js)
cd next && npm run dev
# Open browser to http://localhost:3000
# Open console, check for NEXT_PUBLIC_ variables

# Test environment loading (FastAPI)
cd server && python -c "import os; print(os.getenv('ANTHROPIC_API_KEY')[:10])"
```

---

## Troubleshooting

### Issue: "Environment variable not found"
**Solutions**:
1. Check file is named exactly `.env.local` (with dot prefix)
2. Restart development server after changes
3. Verify variable name matches exactly (case-sensitive)
4. Check for typos in variable names

---

### Issue: "CORS error in browser console"
**Solutions**:
1. Add frontend URL to `CORS_ORIGINS` in `server/.env`
2. Restart FastAPI server
3. Clear browser cache
4. Check for trailing slashes (http://localhost:3000 vs http://localhost:3000/)

---

### Issue: "Unauthorized" from Supabase
**Solutions**:
1. Verify `SUPABASE_ANON_KEY` is correct (copy from dashboard)
2. Check RLS policies aren't blocking request
3. Use service role key for backend operations
4. Verify project URL is correct

---

### Issue: "Stripe key is invalid"
**Solutions**:
1. Verify test mode is enabled (keys start with `pk_test_` and `sk_test_`)
2. Copy keys from Developers → API Keys page
3. Check for extra spaces or newlines in `.env`
4. Regenerate keys if corrupted

---

## Next Steps

After environment setup:
1. ✅ Run validation script
2. ✅ Test database connection
3. ✅ Follow [TESTING-GUIDE.md](TESTING-GUIDE.md)
4. ✅ Review [NEXT-ACTIONS.md](NEXT-ACTIONS.md)
5. ✅ Deploy to remaining brands

---

## Quick Reference

### Get Credentials:
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Supabase**: https://supabase.com/dashboard → Project → Settings → API
- **Stripe**: https://dashboard.stripe.com/test/apikeys
- **Cloudinary**: https://cloudinary.com/console
- **SendGrid**: https://app.sendgrid.com/settings/api_keys
- **Twilio**: https://console.twilio.com/

### Documentation:
- **Anthropic Docs**: https://docs.anthropic.com/
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs/api
- **Next.js Env Docs**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

**Last Updated**: 2025-01-30
**Applies to**: CQI System v1.0.0
**Support**: See [README-CQI.md](README-CQI.md) for help
