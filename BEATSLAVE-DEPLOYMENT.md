# 🎵 BeatSlave Database - CQI Deployment

**Database**: vvmlgbwtaavrkvygazgm
**URL**: https://vvmlgbwtaavrkvygazgm.supabase.co
**Status**: 🔄 Ready to Deploy

---

## Quick Deploy (2 Minutes)

### Step 1: Open BeatSlave Dashboard
**Click**: https://app.supabase.com/project/vvmlgbwtaavrkvygazgm/editor

### Step 2: Use Same SQL as Command Lab
**The SQL migration is identical** - use the same 473-line SQL you just ran for Command Lab.

You can either:
- **Option A**: Copy from your clipboard (if you just deployed Command Lab)
- **Option B**: Get fresh copy from the SQL above (same migration file)

### Step 3: Paste and Execute
1. Paste into SQL Editor
2. Click "Run"
3. Wait ~5 seconds

### Step 4: Verify
**Expected**: 14 tables created (same as Command Lab)
- services
- cqi_templates
- cqi_sessions
- cqi_responses
- trials
- closer_scripts
- audit_reports
- follow_up_tasks
- workflow_instances
- workflow_stage_transitions
- cqi_session_states
- system_events
- dashboard_cache
- kpi_snapshots

---

## Verification Query

```sql
-- Run this to confirm all tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'services', 'cqi_templates', 'cqi_sessions', 'cqi_responses',
    'trials', 'closer_scripts', 'audit_reports', 'follow_up_tasks',
    'workflow_instances', 'workflow_stage_transitions',
    'cqi_session_states', 'system_events', 'dashboard_cache',
    'kpi_snapshots'
  )
ORDER BY table_name;
```

**Expected Result**: 14 rows

---

## After Successful Deployment

**Report back**:
```
✅ BeatSlave deployed successfully!
- Tables: 14/14 created
- Execution time: X seconds
- No errors
- Ready for next brand
```

---

## What's Different for BeatSlave?

**Nothing!** The CQI system is the same across all brands. The brand-specific configurations are stored in the YAML files in `projects/beatslave/.agents/brand-config.yml`.

The database schema is identical - only the data that goes into it will be brand-specific:
- Different services (music production vs cleaning)
- Different pricing (beats vs pressure washing)
- Different qualification thresholds (50% vs 70%)

---

## Troubleshooting

### If You See "relation 'public.leads' does not exist"

**Create leads table first**:
```sql
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    brand TEXT NOT NULL,
    message TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Then re-run the CQI migration.

---

**Estimated Time**: 2 minutes
**Difficulty**: Same as Command Lab
**Risk**: Low (uses IF NOT EXISTS)

🎵 **Let's get BeatSlave's CQI system online!**
