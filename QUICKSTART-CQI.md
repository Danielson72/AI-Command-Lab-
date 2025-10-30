# CQI System - Quick Start Guide

**Get your CQI system running in 30 minutes**

---

## Prerequisites Checklist

- [ ] Supabase account with project created
- [ ] Anthropic API key ([get one here](https://console.anthropic.com/))
- [ ] Existing Next.js and FastAPI setup running
- [ ] Node.js 18+ and Python 3.10+ installed

---

## Step 1: Database Setup (5 minutes)

### Option A: Using Supabase CLI

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

### Option B: Manual (Supabase Dashboard)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to SQL Editor
4. Open `supabase/migrations/20251029000001_create_cqi_system_tables.sql`
5. Copy entire contents and paste into SQL Editor
6. Click "Run"
7. Verify 15 tables created in Table Editor

✅ **Verification**: You should see these new tables:
- `cqi_sessions`
- `cqi_responses`
- `trials`
- `closer_scripts`
- `audit_reports`
- (and 10 more)

---

## Step 2: Environment Configuration (5 minutes)

```bash
# Copy shared config
cp .env.shared .env.local

# Edit with your actual values
nano .env.local  # or use your favorite editor
```

### Required Variables (Minimum)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Paths
BRAND_CONTEXT_PATH=./projects
AGENTS_CORE_PATH=./agents-core

# System
NODE_ENV=development
CQI_SYSTEM_MODE=full
```

### Get Your Keys

**Supabase Keys**:
1. Go to your project in Supabase Dashboard
2. Click "Settings" → "API"
3. Copy `URL`, `anon` key, and `service_role` key

**Anthropic Key**:
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to API Keys
3. Create new key or copy existing

✅ **Verification**:
```bash
# Test Supabase connection
curl "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY"

# Should return API version info
```

---

## Step 3: Install Python Dependencies (5 minutes)

```bash
# Navigate to server directory
cd server

# Create virtual environment if not exists
python3 -m venv .venv

# Activate
source .venv/bin/activate  # Mac/Linux
# .venv\Scripts\activate   # Windows

# Install required packages
pip install anthropic supabase langchain pydantic python-dotenv pyyaml
```

---

## Step 4: Test Basic Agent (5 minutes)

Create a test script to verify agent system:

```bash
# Create test file
nano test_cqi_basic.py
```

```python
#!/usr/bin/env python3
"""
Basic CQI System Test
Tests: Environment, Supabase connection, Agent loading
"""

import os
from pathlib import Path
from supabase import create_client
import yaml

def test_environment():
    """Test environment variables"""
    print("🔍 Testing Environment Variables...")

    required = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'ANTHROPIC_API_KEY',
        'BRAND_CONTEXT_PATH'
    ]

    for var in required:
        value = os.getenv(var)
        if value:
            print(f"  ✅ {var}: Set")
        else:
            print(f"  ❌ {var}: Missing!")
            return False

    return True

def test_supabase():
    """Test Supabase connection"""
    print("\n🔍 Testing Supabase Connection...")

    try:
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_ANON_KEY')
        supabase = create_client(url, key)

        # Test query
        result = supabase.table('leads').select("count", count='exact').execute()
        print(f"  ✅ Connected! Found {result.count} leads")
        return True
    except Exception as e:
        print(f"  ❌ Connection failed: {e}")
        return False

def test_agents():
    """Test agent loading"""
    print("\n🔍 Testing Agent Loading...")

    agents_path = Path('../agents-core/cqi')

    if not agents_path.exists():
        print(f"  ❌ Agents directory not found: {agents_path}")
        return False

    agent_files = list(agents_path.glob('*.yml'))
    print(f"  ✅ Found {len(agent_files)} agent files:")

    for agent_file in agent_files:
        try:
            with open(agent_file) as f:
                config = yaml.safe_load(f)
                print(f"    • {config['name']} v{config['version']}")
        except Exception as e:
            print(f"    ❌ Failed to load {agent_file.name}: {e}")
            return False

    return True

def test_brands():
    """Test brand configurations"""
    print("\n🔍 Testing Brand Configurations...")

    projects_path = Path('../projects')
    brands = ['sotsvc', 'boss-of-clean', 'beatslave', 'temple-builder']

    for brand in brands:
        config_file = projects_path / brand / '.agents' / 'brand-config.yml'

        if config_file.exists():
            try:
                with open(config_file) as f:
                    config = yaml.safe_load(f)
                    threshold = config['cqi_settings']['qualification_threshold']
                    print(f"  ✅ {config['brand']['name']}: Threshold {threshold}%")
            except Exception as e:
                print(f"  ❌ Failed to load {brand}: {e}")
                return False
        else:
            print(f"  ❌ Config not found: {config_file}")
            return False

    return True

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 CQI SYSTEM - BASIC TEST")
    print("=" * 60)

    # Load .env file
    from dotenv import load_dotenv
    load_dotenv('../.env.local')

    tests = [
        ("Environment", test_environment),
        ("Supabase", test_supabase),
        ("Agents", test_agents),
        ("Brands", test_brands)
    ]

    passed = 0
    for name, test_func in tests:
        if test_func():
            passed += 1

    print("\n" + "=" * 60)
    print(f"📊 RESULTS: {passed}/{len(tests)} tests passed")

    if passed == len(tests):
        print("✅ All systems operational! CQI ready to go!")
    else:
        print("❌ Some tests failed. Review errors above.")

    print("=" * 60)
```

```bash
# Run test
python test_cqi_basic.py
```

Expected output:
```
============================================================
🚀 CQI SYSTEM - BASIC TEST
============================================================

🔍 Testing Environment Variables...
  ✅ SUPABASE_URL: Set
  ✅ SUPABASE_ANON_KEY: Set
  ✅ ANTHROPIC_API_KEY: Set
  ✅ BRAND_CONTEXT_PATH: Set

🔍 Testing Supabase Connection...
  ✅ Connected! Found 0 leads

🔍 Testing Agent Loading...
  ✅ Found 5 agent files:
    • cqi-conductor v1.0.0
    • cqi-scorer v1.0.0
    • trial-manager v1.0.0
    • closer-script v1.0.0
    • audit-report v1.0.0

🔍 Testing Brand Configurations...
  ✅ Sonz of Thunder Services: Threshold 70%
  ✅ Boss of Clean: Threshold 60%
  ✅ BeatSlave Market: Threshold 50%
  ✅ Temple Builder: Threshold 80%

============================================================
📊 RESULTS: 4/4 tests passed
✅ All systems operational! CQI ready to go!
============================================================
```

---

## Step 5: Create First Test Lead (5 minutes)

```bash
# Create test lead
nano create_test_lead.py
```

```python
#!/usr/bin/env python3
"""Create a test lead to trigger CQI workflow"""

import os
from supabase import create_client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv('../.env.local')

# Connect to Supabase
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')  # Need service role for insert
supabase = create_client(url, key)

# Create test lead
test_lead = {
    'name': 'John Test',
    'email': 'john.test@example.com',
    'phone': '407-555-1234',
    'brand': 'sotsvc',
    'message': 'I need cleaning service for my 3-bedroom home',
    'source': 'contact_form',
    'status': 'new',
    'created_at': datetime.utcnow().isoformat()
}

print("📝 Creating test lead...")
result = supabase.table('leads').insert(test_lead).execute()

if result.data:
    lead_id = result.data[0]['id']
    print(f"✅ Test lead created!")
    print(f"   Lead ID: {lead_id}")
    print(f"   Name: {test_lead['name']}")
    print(f"   Brand: {test_lead['brand']}")
    print(f"\n🎯 Next: CQI workflow should start automatically")
    print(f"   (When agent runtime is implemented)")
else:
    print("❌ Failed to create lead")
```

```bash
# Run
python create_test_lead.py
```

---

## Step 6: Verify Database (5 minutes)

Check that lead was created:

```sql
-- In Supabase SQL Editor

-- Check lead
SELECT * FROM public.leads
WHERE email = 'john.test@example.com';

-- Check if CQI session would be created (manual for now)
-- When agents are running, you'd see:
SELECT * FROM public.cqi_sessions
WHERE lead_id = 'your-lead-id-here';
```

---

## Next Steps

### Immediate (Today)

1. **Read Documentation**
   - Open [README-CQI.md](README-CQI.md)
   - Review agent descriptions
   - Understand workflows

2. **Explore Brand Configs**
   - Open `projects/sotsvc/.agents/brand-config.yml`
   - Review questions, pricing, templates
   - Customize for your needs

3. **Plan Implementation**
   - Review [CQI-SYSTEM-SUMMARY.md](CQI-SYSTEM-SUMMARY.md)
   - Decide on Phase 1 priorities
   - Schedule development sprints

### Short Term (This Week)

1. **Implement Agent Runtime**
   - Create Python agent executor
   - Connect to Claude API
   - Test conductor agent

2. **Integrate with Contact Form**
   - Update `/contact` to trigger CQI
   - Test end-to-end flow
   - Handle errors gracefully

3. **Build Basic Dashboard**
   - Create dashboard UI
   - Show key metrics
   - Real-time updates

### Medium Term (This Month)

1. **Complete Workflows**
   - Lead-to-trial fully automated
   - Trial-to-paid with human-in-loop
   - Email notifications working

2. **Add Monitoring**
   - Dashboard functional
   - Alerts configured
   - Analytics tracking

3. **Test with Real Leads**
   - Start with small volume
   - Monitor closely
   - Iterate based on feedback

---

## Common Issues

### "Table 'leads' doesn't exist"
**Solution**: You need to create the leads table first (should exist from your current setup). If not:
```sql
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    brand TEXT NOT NULL,
    message TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### "Agent files not found"
**Solution**: Make sure you're in the correct directory:
```bash
cd /Users/danielalvarez/AI-Command-Lab-
ls -la agents-core/cqi/  # Should show 5 .yml files
```

### "Anthropic API error"
**Solution**: Verify your API key:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-5-20250929","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

---

## Support

- **Full Documentation**: [README-CQI.md](README-CQI.md)
- **System Overview**: [CQI-SYSTEM-SUMMARY.md](CQI-SYSTEM-SUMMARY.md)
- **Project Context**: [CLAUDE.md](CLAUDE.md)

---

## What You Just Set Up

✅ **Database**: 15 tables created and ready
✅ **Agents**: 11 agent configs loaded
✅ **Brands**: 4 brand configurations
✅ **Workflows**: 2 workflow definitions
✅ **Environment**: All variables configured

**You're now ready to start building the agent runtime!**

Next file to implement: `server/agents/cqi_conductor.py`

---

**Estimated Time**: 30 minutes
**Difficulty**: Beginner-Intermediate
**Prerequisites Met**: ✅

🎉 **Congratulations! Your CQI system foundation is ready!**
