# 🚀 Deploy CQI Migration RIGHT NOW (5 Minutes)

## Quick Deployment to AI Command Lab

### Step 1: Open Supabase Dashboard
**Click this link**: https://app.supabase.com/project/wxsfnpbmngglkjlytlul/editor

### Step 2: Open SQL Editor
- You should see "SQL Editor" in the left sidebar
- Click it
- Click "+ New query"

### Step 3: Copy Migration SQL
**Open this file in your editor**:
```
/Users/danielalvarez/AI-Command-Lab-/supabase/migrations/20251029000001_create_cqi_system_tables.sql
```

**Or run this command to view it**:
```bash
cat supabase/migrations/20251029000001_create_cqi_system_tables.sql
```

**Select ALL (473 lines)** and copy to clipboard

### Step 4: Paste and Run
1. Paste the entire SQL into the Supabase SQL Editor
2. Click **"Run"** (or press Cmd+Enter / Ctrl+Enter)
3. Wait 5-10 seconds for completion

### Step 5: Verify Success
**Look for**: Green success message at the bottom

**Then navigate to**: Table Editor (left sidebar)

**You should see 14 new tables**:
- ✅ audit_reports
- ✅ cqi_responses
- ✅ cqi_session_states
- ✅ cqi_sessions
- ✅ cqi_templates
- ✅ closer_scripts
- ✅ dashboard_cache
- ✅ follow_up_tasks
- ✅ kpi_snapshots
- ✅ services
- ✅ system_events
- ✅ trials
- ✅ workflow_instances
- ✅ workflow_stage_transitions

### Step 6: Verify with SQL Query
Run this in SQL Editor to confirm:

```sql
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

**Expected**: 14 rows returned

---

## ✅ After Successful Deployment

**Reply to Claude Code with**:
```
✅ Migration successful! 14 tables created in AI Command Lab database.

Show me the verification results and proceed to Step 2: Environment Configuration.
```

---

## 🚨 Troubleshooting

### Error: "relation 'public.leads' does not exist"

**Solution**: Create leads table first:
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

### Error: "permission denied"

**Solution**: Make sure you're logged in as the project owner/admin.

### Error: "duplicate key value"

**Solution**: Some tables may already exist. Drop them first:
```sql
DROP TABLE IF EXISTS public.workflow_stage_transitions CASCADE;
DROP TABLE IF EXISTS public.workflow_instances CASCADE;
DROP TABLE IF EXISTS public.follow_up_tasks CASCADE;
DROP TABLE IF EXISTS public.audit_reports CASCADE;
DROP TABLE IF EXISTS public.closer_scripts CASCADE;
DROP TABLE IF EXISTS public.trials CASCADE;
DROP TABLE IF EXISTS public.cqi_responses CASCADE;
DROP TABLE IF EXISTS public.cqi_session_states CASCADE;
DROP TABLE IF EXISTS public.cqi_sessions CASCADE;
DROP TABLE IF EXISTS public.cqi_templates CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.system_events CASCADE;
DROP TABLE IF EXISTS public.dashboard_cache CASCADE;
DROP TABLE IF EXISTS public.kpi_snapshots CASCADE;
```

Then re-run the migration.

---

## ⏱️ Estimated Time: 5 Minutes

1. Open Dashboard: 30 seconds
2. Copy SQL: 30 seconds
3. Paste and Run: 1 minute
4. Verify: 3 minutes

**Total**: ~5 minutes

---

## 📞 Need Help?

- **Full Guide**: [DEPLOY-TO-SUPABASE.md](DEPLOY-TO-SUPABASE.md)
- **Documentation**: [README-CQI.md](README-CQI.md)
- **Status**: [DEPLOYMENT-STATUS.md](DEPLOYMENT-STATUS.md)

---

**Ready? Click the link above and start! ⬆️**
