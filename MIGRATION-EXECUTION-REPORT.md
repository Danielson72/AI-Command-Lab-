# CQI Migration Execution Report

**Date**: 2025-10-29
**Target**: AI Command Lab Supabase
**Status**: ⏳ **READY FOR MANUAL EXECUTION**

---

## 🔌 Connection Attempt Results

### MCP Server Status
- **Connection**: ❌ Requires authentication configuration
- **Error**: "Unauthorized - access token required"
- **Cause**: MCP server not configured with service role credentials
- **Solution**: Manual deployment via Supabase Dashboard

### Why Manual Deployment?

The Supabase MCP server requires:
1. Service role key configuration
2. Write access permissions
3. Direct PostgreSQL connection

**Current limitation**: MCP read-only mode or missing auth token

---

## ✅ Migration File Ready

**File**: `supabase/migrations/20251029000001_create_cqi_system_tables.sql`
**Size**: 20,271 bytes
**Lines**: 473
**Status**: ✅ Validated and ready

### What Will Be Created

#### 14 Tables:

1. **services** - Service catalog for all brands
2. **cqi_templates** - Question templates and scoring criteria
3. **cqi_sessions** - CQI session lifecycle tracking
4. **cqi_responses** - Q&A storage
5. **trials** - Trial appointments and outcomes
6. **closer_scripts** - AI-generated closing scripts
7. **audit_reports** - Compliance documentation
8. **follow_up_tasks** - Scheduled follow-up actions
9. **workflow_instances** - Automated workflow tracking
10. **workflow_stage_transitions** - Stage transition history
11. **cqi_session_states** - Session state snapshots
12. **system_events** - System-wide event logging
13. **dashboard_cache** - Dashboard data cache
14. **kpi_snapshots** - Daily KPI snapshots

#### Additional Objects:
- **30+ Indexes** for query optimization
- **6 Triggers** for automatic timestamp updates
- **1 Function** (`update_updated_at_column()`)
- **Table comments** for documentation

---

## 📋 **EXECUTE NOW - 3 Methods**

### Method 1: Supabase Dashboard (Recommended - 5 min)

**Step-by-step**:

1. **Open SQL Editor**
   - URL: https://app.supabase.com/project/wxsfnpbmngglkjlytlul/editor
   - Or: Dashboard → SQL Editor → New Query

2. **Copy Migration**
   ```bash
   # In terminal
   cat supabase/migrations/20251029000001_create_cqi_system_tables.sql | pbcopy
   ```
   Or manually open and select all (Cmd+A)

3. **Paste and Execute**
   - Paste into SQL Editor
   - Click "Run" or press Cmd+Enter
   - Wait 5-10 seconds

4. **Verify Success**
   - Look for green success message
   - Navigate to Table Editor
   - Count 14 new tables

### Method 2: Supabase CLI (If installed - 2 min)

```bash
# Navigate to project
cd /Users/danielalvarez/AI-Command-Lab-

# Link to project (if not already linked)
supabase link --project-ref wxsfnpbmngglkjlytlul

# Apply migration
supabase db push

# Or apply single migration
supabase db push --dry-run  # Preview first
supabase db push            # Execute
```

### Method 3: psql Direct Connection (Advanced)

```bash
# Get connection string from: Dashboard → Settings → Database
# Format: postgresql://postgres:[PASSWORD]@db.wxsfnpbmngglkjlytlul.supabase.co:5432/postgres

psql "postgresql://postgres:[YOUR_PASSWORD]@db.wxsfnpbmngglkjlytlul.supabase.co:5432/postgres" \
  -f supabase/migrations/20251029000001_create_cqi_system_tables.sql
```

---

## ✅ Post-Execution Verification

### Verification Query 1: Count Tables

```sql
SELECT COUNT(*) as cqi_tables_created
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'services', 'cqi_templates', 'cqi_sessions', 'cqi_responses',
    'trials', 'closer_scripts', 'audit_reports', 'follow_up_tasks',
    'workflow_instances', 'workflow_stage_transitions',
    'cqi_session_states', 'system_events', 'dashboard_cache',
    'kpi_snapshots'
  );
```

**Expected Result**: `14`

### Verification Query 2: List All CQI Tables

```sql
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
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

**Expected Result**: 14 rows with column counts

### Verification Query 3: Check Indexes

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename LIKE '%cqi%'
  OR tablename IN ('services', 'trials', 'workflow_instances', 'system_events', 'dashboard_cache', 'kpi_snapshots')
ORDER BY tablename, indexname;
```

**Expected Result**: 30+ indexes

### Verification Query 4: Check Triggers

```sql
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;
```

**Expected Result**: 6 triggers

---

## 🎯 After Successful Execution

**Update these files**:

1. **DEPLOYMENT-STATUS.md**
   ```markdown
   #### AI Command Lab Database
   - Status: ✅ **DEPLOYED** (Oct 29, 2025)
   - Tables: 14/14 created
   - Indexes: 30+ created
   - Triggers: 6 created
   ```

2. **Reply to Claude Code**:
   ```
   ✅ Migration executed successfully!

   Results:
   - Database: AI Command Lab (wxsfnpbmngglkjlytlul)
   - Tables Created: 14/14
   - Indexes: 30+
   - Triggers: 6
   - Execution Time: ~8 seconds
   - No errors

   Ready for Step 2: Environment Configuration
   ```

---

## 🚨 Troubleshooting

### Issue: "relation 'public.leads' does not exist"

**Cause**: Prerequisite table missing

**Solution**: Create leads table first:

```sql
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    brand TEXT NOT NULL CHECK (brand IN ('sotsvc', 'boss-of-clean', 'beatslave', 'temple-builder')),
    message TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_brand ON public.leads(brand);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
```

Then re-run CQI migration.

### Issue: "permission denied for schema public"

**Solution**: Ensure you're logged in as project owner/admin

### Issue: "duplicate key value violates unique constraint"

**Cause**: Tables partially exist from previous attempt

**Solution**: Clean up first:

```sql
-- WARNING: This deletes existing data!
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
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

Then re-run migration.

---

## 📊 Expected Results Summary

| Metric | Expected | Actual | Status |
|--------|----------|--------|--------|
| Tables Created | 14 | ___ | ⏳ |
| Indexes Created | 30+ | ___ | ⏳ |
| Triggers Created | 6 | ___ | ⏳ |
| Execution Time | 5-10s | ___ | ⏳ |
| Errors | 0 | ___ | ⏳ |

---

## 🔄 Next Steps After Successful Deployment

1. ✅ Mark Phase 2 complete in DEPLOYMENT-STATUS.md
2. ⏭️ Proceed to Phase 3: Environment Configuration
3. 🧪 Create test lead data
4. 🐍 Implement Python agent runtime
5. 🔗 Integrate with contact form

---

## 📞 Support Resources

- **Quick Guide**: [DEPLOY-NOW.md](DEPLOY-NOW.md)
- **Full Guide**: [DEPLOY-TO-SUPABASE.md](DEPLOY-TO-SUPABASE.md)
- **System Docs**: [README-CQI.md](README-CQI.md)
- **Progress Tracker**: [DEPLOYMENT-STATUS.md](DEPLOYMENT-STATUS.md)

---

**Status**: ⏳ Awaiting manual execution via Supabase Dashboard
**Estimated Time**: 5 minutes
**Risk Level**: Low (uses IF NOT EXISTS)
**Rollback**: Drop tables if needed (see Troubleshooting)

---

**Execute the migration now using Method 1 (Supabase Dashboard) above** ⬆️
