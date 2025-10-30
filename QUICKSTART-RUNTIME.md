# CQI Runtime - Quick Start Guide

## Overview
This guide will get your CQI (Client Qualification Interview) runtime operational in **15 minutes**. You'll be able to process real leads through the qualification workflow using Claude AI.

**What you'll do:**
1. Set up environment variables (5 min)
2. Install Python dependencies (3 min)
3. Test the CQI Conductor manually (2 min)
4. Start the FastAPI server (1 min)
5. Test the `/api/lead` endpoint (2 min)
6. Process your first real lead (2 min)

---

## Prerequisites

### Required:
- ✅ Python 3.11+ installed
- ✅ Supabase database with CQI tables deployed (see [DEPLOY-TO-SUPABASE.md](DEPLOY-TO-SUPABASE.md))
- ✅ Anthropic API key (get from https://console.anthropic.com/settings/keys)
- ✅ Supabase credentials (URL + service role key)

### Check Python version:
```bash
python3 --version
# Should show Python 3.11.0 or higher
```

---

## Step 1: Set Up Environment Variables (5 minutes)

### 1.1 Copy the environment template

```bash
# Copy template to runtime directory
cp agents-core/runtime/.env.example agents-core/runtime/.env

# Copy template to server directory
cp agents-core/runtime/.env.example server/.env
```

### 1.2 Get your API credentials

**Anthropic API Key:**
1. Visit https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-api03-`)

**Supabase Credentials:**
1. Go to your Supabase Dashboard
2. Select your project (AI Command Lab or BeatSlave)
3. Navigate to: **Settings → API**
4. Copy:
   - **Project URL** (https://[project-ref].supabase.co)
   - **service_role key** (the secret key - NOT the anon key!)

### 1.3 Edit the .env file

```bash
# Edit runtime .env
nano agents-core/runtime/.env

# Or use your favorite editor
code agents-core/runtime/.env
```

**Fill in these THREE required values:**

```bash
# REQUIRED: Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# REQUIRED: Your Supabase project URL
SUPABASE_URL=https://yourproject.supabase.co

# REQUIRED: Your Supabase service role key (⚠️ keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Also edit server/.env** with the same values:

```bash
nano server/.env
```

Paste the same three values.

---

## Step 2: Install Python Dependencies (3 minutes)

### 2.1 Create virtual environment (recommended)

```bash
# Navigate to server directory
cd server

# Create virtual environment
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Your prompt should now show (.venv)
```

### 2.2 Install dependencies

```bash
# Install all required packages
pip install -r requirements.txt

# This installs:
# - fastapi (web framework)
# - uvicorn (server)
# - anthropic (Claude AI)
# - supabase (database)
# - pydantic (data validation)
# - python-dotenv (environment variables)
```

**Expected output:**
```
Successfully installed anthropic-0.42.0 fastapi-0.115.6 supabase-2.16.1 ...
```

### 2.3 Verify installation

```bash
# Check all packages installed
pip list | grep -E "anthropic|supabase|fastapi"

# Should show:
# anthropic      0.42.0
# fastapi        0.115.6
# supabase       2.16.1
```

---

## Step 3: Test the CQI Conductor Manually (2 minutes)

### 3.1 Test connections first

```bash
# Test Anthropic and Supabase connections
cd ..  # Back to project root
python3 agents-core/runtime/clients.py
```

**Expected output:**
```
============================================================
CQI System - Connection Test
============================================================

2025-01-30 12:00:00 - INFO - ✅ All required environment variables are set
2025-01-30 12:00:00 - INFO - ✅ Anthropic client initialized
2025-01-30 12:00:00 - INFO - ✅ Anthropic connection successful
2025-01-30 12:00:00 - INFO - ✅ Supabase client initialized
2025-01-30 12:00:00 - INFO - ✅ Supabase connection successful

------------------------------------------------------------
Results:
------------------------------------------------------------
✅ Environment: Connected
✅ Anthropic: Connected
✅ Supabase: Connected

============================================================
✅ All systems operational - ready to process CQI sessions!
============================================================
```

**If you see errors:**
- ❌ "Missing required environment variables" → Check your .env file paths and values
- ❌ "Anthropic connection failed" → Verify your API key is correct
- ❌ "Supabase connection failed" → Verify your URL and service role key

---

### 3.2 Create a test lead in Supabase

Before testing the conductor, you need a lead in your database.

**Option A: Use Supabase Dashboard (easiest)**

1. Go to your Supabase Dashboard
2. Navigate to: **Table Editor → leads**
3. Click **Insert Row**
4. Fill in:
   - `name`: John Test
   - `email`: john.test@example.com
   - `phone`: 407-555-0100
   - `message`: I need a deep cleaning for my 3-bedroom house. Moving in next week, budget around $150-200.
   - `brand`: sotsvc
   - `source`: test
5. Click **Save**
6. **Copy the `id` value** (UUID) - you'll need this!

**Option B: Use SQL Editor**

```sql
-- Insert test lead
INSERT INTO public.leads (name, email, phone, message, brand, source)
VALUES (
    'John Test',
    'john.test@example.com',
    '407-555-0100',
    'I need a deep cleaning for my 3-bedroom house. Moving in next week, budget around $150-200.',
    'sotsvc',
    'test'
) RETURNING id;

-- Copy the returned id
```

---

### 3.3 Run the CQI Conductor

```bash
# Replace [LEAD-ID] with the UUID you copied above
python3 agents-core/runtime/conductor.py \
  --lead-id [LEAD-ID] \
  --brand sotsvc
```

**Example with real UUID:**
```bash
python3 agents-core/runtime/conductor.py \
  --lead-id 550e8400-e29b-41d4-a716-446655440000 \
  --brand sotsvc
```

**Expected output:**
```
============================================================
CQI CONDUCTOR - Processing Lead
============================================================
Lead ID: 550e8400-e29b-41d4-a716-446655440000
Brand: sotsvc
Started: 2025-01-30T12:00:00Z
============================================================

INFO - Fetching lead data for: 550e8400-e29b-41d4-a716-446655440000
INFO - ✅ Lead found: John Test (sotsvc)
INFO - Qualification threshold: 70
INFO - Analyzing lead with Claude AI...
INFO - ✅ Scoring complete: 75/100 (qualified: True)
INFO - Creating CQI session record...
INFO - ✅ CQI session created: 660e8400-e29b-41d4-a716-446655440001

============================================================
✅ CQI PROCESSING COMPLETE
============================================================
Session ID: 660e8400-e29b-41d4-a716-446655440001
Score: 75/100
Qualified: True
Action: trial_booking
============================================================

CQI PROCESSING RESULTS
============================================================
Session ID:     660e8400-e29b-41d4-a716-446655440001
Lead ID:        550e8400-e29b-41d4-a716-446655440000
Brand:          sotsvc
Score:          75/100
Qualified:      True
Action:         trial_booking
State:          scored
------------------------------------------------------------
Reasoning:
This lead shows strong qualification signals: explicit budget
range ($150-200) indicates serious intent, urgent timeline
("moving in next week") shows high urgency, detailed property
info (3-bedroom house) suggests good fit, and first-person
language ("I need") indicates decision-making authority.
============================================================
```

**🎉 Success!** Your CQI Conductor is working! It:
1. ✅ Fetched the lead from Supabase
2. ✅ Analyzed it with Claude AI
3. ✅ Assigned a qualification score (75/100)
4. ✅ Determined the lead qualifies (≥70)
5. ✅ Created a CQI session record
6. ✅ Recommended next action (trial_booking)

---

## Step 4: Start the FastAPI Server (1 minute)

### 4.1 Start the server

```bash
# Make sure you're in the server directory with venv activated
cd server
source .venv/bin/activate

# Start FastAPI with auto-reload
python3 -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
============================================================
AI Command Lab API - Starting Up
============================================================
CQI Conductor: ✅ Available
Supabase Client: ✅ Available
============================================================
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Keep this terminal open!** The server is now running.

---

### 4.2 Test the health endpoint

Open a **new terminal** window and run:

```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-30T12:00:00.000Z",
  "services": {
    "api": "operational",
    "cqi_conductor": "operational",
    "supabase": "operational"
  }
}
```

### 4.3 View API documentation

Open your browser to:
- **Interactive docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

You'll see all available endpoints with Try It Out buttons!

---

## Step 5: Test the /api/lead Endpoint (2 minutes)

### 5.1 Create a lead via API (without CQI)

```bash
curl -X POST http://localhost:8000/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane API Test",
    "email": "jane.api@example.com",
    "phone": "407-555-0200",
    "message": "I need pressure washing for my driveway",
    "brand": "boss_of_clean"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "lead_id": "770e8400-e29b-41d4-a716-446655440002",
  "session_id": null,
  "qualification_score": null,
  "qualified": null,
  "message": "Lead created successfully"
}
```

This creates the lead but **doesn't run CQI**.

---

### 5.2 Create a lead with CQI processing

```bash
curl -X POST http://localhost:8000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike CQI Test",
    "email": "mike.cqi@example.com",
    "phone": "407-555-0300",
    "message": "Need residential cleaning ASAP. 4 bedroom house, budget $200-250 per visit. Want weekly service starting this Friday.",
    "brand": "sotsvc",
    "source": "api_test"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "lead_id": "880e8400-e29b-41d4-a716-446655440003",
  "session_id": "990e8400-e29b-41d4-a716-446655440004",
  "qualification_score": 85,
  "qualified": true,
  "message": "Lead qualified with score 85/100 - recommended for trial_booking"
}
```

**🎉 Excellent!** This endpoint:
1. ✅ Created the lead in Supabase
2. ✅ Triggered CQI Conductor
3. ✅ Scored the lead with Claude AI (85/100)
4. ✅ Determined qualification (85 ≥ 70)
5. ✅ Created CQI session
6. ✅ Returned all details in one response

---

### 5.3 Verify in Supabase Dashboard

1. Go to Supabase Dashboard → **Table Editor**
2. Check **leads** table - you should see 3 test leads
3. Check **cqi_sessions** table - you should see 2 sessions
4. Click on a session to see the `session_data` JSONB column with full scoring details

---

## Step 6: Process Your First Real Lead (2 minutes)

Now let's test with a realistic SOTSVC lead!

### 6.1 Create a real-looking lead

```bash
curl -X POST http://localhost:8000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah.j@gmail.com",
    "phone": "407-461-1234",
    "message": "Hi, I saw your website and Im interested in getting a quote for regular cleaning service. I have a 2,400 sq ft home with 3 bedrooms and 2.5 bathrooms in Winter Park. Looking to start bi-weekly service as soon as possible. My budget is around $150-175 per cleaning. Can someone call me to discuss? Thanks!",
    "brand": "sotsvc",
    "source": "website_contact_form"
  }'
```

**Check the server logs** in your FastAPI terminal. You should see:

```
INFO - Received lead with CQI: Sarah Johnson (sotsvc)
INFO - ✅ Lead created: [uuid]
INFO - Fetching lead data for: [uuid]
INFO - ✅ Lead found: Sarah Johnson (sotsvc)
INFO - Qualification threshold: 70
INFO - Analyzing lead with Claude AI...
INFO - ✅ Scoring complete: 78/100 (qualified: True)
INFO - ✅ CQI session created: [session-uuid]
```

**Response:**
```json
{
  "success": true,
  "lead_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "session_id": "bb0e8400-e29b-41d4-a716-446655440006",
  "qualification_score": 78,
  "qualified": true,
  "message": "Lead qualified with score 78/100 - recommended for trial_booking"
}
```

### 6.2 Get session details

```bash
# Replace [SESSION-ID] with the session_id from response above
curl http://localhost:8000/api/cqi/session/[SESSION-ID]
```

**Response includes full reasoning:**
```json
{
  "session_id": "bb0e8400-e29b-41d4-a716-446655440006",
  "lead_id": "aa0e8400-e29b-41d4-a716-446655440005",
  "brand": "sotsvc",
  "qualification_score": 78,
  "qualified": true,
  "reasoning": "Strong qualification: Explicit budget ($150-175) shows serious intent. High urgency (as soon as possible). Clear decision authority (first-person I/my). Perfect property fit (3BR/2.5BA = ideal size). Recurring commitment (bi-weekly service = high LTV). Contact preference shows engagement.",
  "recommended_action": "trial_booking",
  "session_state": "scored"
}
```

---

## 🎉 Success! You're Ready to Go

Your CQI runtime is now fully operational!

### What you can do now:

**Test more leads:**
```bash
# Try different brands
curl -X POST http://localhost:8000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "555-0100",
    "message": "Your message here",
    "brand": "boss_of_clean"  # Try: sotsvc, boss_of_clean, beatslave
  }'
```

**Connect your web form:**
Update your Next.js contact form to POST to `http://localhost:8000/api/lead`

**Check scoring consistency:**
Try leads with different quality levels and see how scores vary

---

## Troubleshooting

### Error: "Module not found: conductor"
```bash
# Make sure you're running from project root
cd /path/to/AI-Command-Lab-
python3 agents-core/runtime/conductor.py --lead-id [ID] --brand sotsvc
```

### Error: "ANTHROPIC_API_KEY not found"
```bash
# Check .env file exists and has correct values
cat agents-core/runtime/.env | grep ANTHROPIC_API_KEY

# Should show: ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
# If not, edit .env file and add it
```

### Error: "Table 'leads' does not exist"
```bash
# You need to run the database migration first
# See: DEPLOY-TO-SUPABASE.md
```

### Error: "Address already in use" (port 8000)
```bash
# Another process is using port 8000
# Option 1: Kill the process
lsof -ti:8000 | xargs kill -9

# Option 2: Use different port
python3 -m uvicorn app:app --reload --port 8001
```

### Error: "No module named 'anthropic'"
```bash
# Activate virtual environment and install dependencies
cd server
source .venv/bin/activate
pip install -r requirements.txt
```

### Claude returns low scores for good leads
This is normal during testing - the scoring prompt can be tuned. Check:
- Is the message detailed enough?
- Does it mention budget, timeline, or urgency?
- Try adding more context to the message field

---

## Next Steps

### Immediate (Today):
1. ✅ Test with 5-10 real SOTSVC leads from your CRM
2. ✅ Verify qualification thresholds make sense
3. ✅ Check scoring consistency

### This Week:
1. Connect your website contact forms to `/api/lead`
2. Set up email notifications when leads qualify
3. Build simple dashboard to view CQI sessions

### Follow-Up:
- Read [NEXT-ACTIONS.md](NEXT-ACTIONS.md) for full roadmap
- Follow [TESTING-GUIDE.md](TESTING-GUIDE.md) for comprehensive tests
- Review [ENV-SETUP-GUIDE.md](ENV-SETUP-GUIDE.md) for production setup

---

## Quick Reference

### Start server:
```bash
cd server
source .venv/bin/activate
python3 -m uvicorn app:app --reload --port 8000
```

### Test conductor:
```bash
python3 agents-core/runtime/conductor.py --lead-id [UUID] --brand sotsvc
```

### Test API:
```bash
curl -X POST http://localhost:8000/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message","brand":"sotsvc"}'
```

### View docs:
http://localhost:8000/docs

### Test connections:
```bash
python3 agents-core/runtime/clients.py
```

---

**Last Updated**: 2025-01-30
**Runtime Version**: 1.0.0 (MVP)
**Supports**: SOTSVC, Boss of Clean, BeatSlave, Temple Builder

Need help? See [README-CQI.md](README-CQI.md) or check server logs for detailed error messages.
