# Deploy CQI Migration to Supabase

## STEP 1: Apply Migration to AI Command Lab

**Database**: `wxsfnpbmngglkjlytlul` (AI Command Lab)
**URL**: https://wxsfnpbmngglkjlytlul.supabase.co

### Option A: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **AI Command Lab** (`wxsfnpbmngglkjlytlul`)
3. Navigate to: **SQL Editor**
4. Click: **New Query**
5. Open file: `supabase/migrations/20251029000001_create_cqi_system_tables.sql`
6. Copy **entire contents** (473 lines)
7. Paste into SQL Editor
8. Click: **Run** (or Cmd/Ctrl + Enter)
9. Wait for completion (should take 5-10 seconds)

### Option B: Using Supabase CLI

```bash
# From project root
cd /Users/danielalvarez/AI-Command-Lab-

# Link to AI Command Lab project
supabase link --project-ref wxsfnpbmngglkjlytlul

# Apply migration
supabase db push
```

### Verification

After running, verify in **Table Editor**:

**Expected: 14 New Tables Created**
1. ✅ `services`
2. ✅ `cqi_templates`
3. ✅ `cqi_sessions`
4. ✅ `cqi_responses`
5. ✅ `trials`
6. ✅ `closer_scripts`
7. ✅ `audit_reports`
8. ✅ `follow_up_tasks`
9. ✅ `workflow_instances`
10. ✅ `workflow_stage_transitions`
11. ✅ `cqi_session_states`
12. ✅ `system_events`
13. ✅ `dashboard_cache`
14. ✅ `kpi_snapshots`

**Run this verification query:**
```sql
-- Check all CQI tables were created
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

## STEP 2: Apply Migration to BeatSlave (Optional)

**Database**: `vvmlgbwtaavrkvygazgm` (BeatSlave)
**URL**: https://vvmlgbwtaavrkvygazgm.supabase.co

**Note**: Only apply if you want CQI on BeatSlave immediately. Can be done later.

### Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **BeatSlave** (`vvmlgbwtaavrkvygazgm`)
3. Navigate to: **SQL Editor**
4. Copy same migration file
5. Run migration
6. Verify 14 tables created

---

## Troubleshooting

### Error: "relation 'public.leads' does not exist"

**Cause**: The `leads` table doesn't exist yet (required for foreign keys)

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

CREATE INDEX idx_leads_brand ON public.leads(brand);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
```

Then re-run the CQI migration.

### Error: "permission denied for schema public"

**Cause**: User doesn't have sufficient permissions

**Solution**: Run as admin or adjust permissions:
```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

### Error: "duplicate key value violates unique constraint"

**Cause**: Migration already partially applied

**Solution**: Drop existing CQI tables and re-run:
```sql
-- CAUTION: This deletes data!
DROP TABLE IF EXISTS public.kpi_snapshots CASCADE;
DROP TABLE IF EXISTS public.dashboard_cache CASCADE;
DROP TABLE IF EXISTS public.system_events CASCADE;
DROP TABLE IF EXISTS public.cqi_session_states CASCADE;
DROP TABLE IF EXISTS public.workflow_stage_transitions CASCADE;
DROP TABLE IF EXISTS public.workflow_instances CASCADE;
DROP TABLE IF EXISTS public.follow_up_tasks CASCADE;
DROP TABLE IF EXISTS public.audit_reports CASCADE;
DROP TABLE IF EXISTS public.closer_scripts CASCADE;
DROP TABLE IF EXISTS public.trials CASCADE;
DROP TABLE IF EXISTS public.cqi_responses CASCADE;
DROP TABLE IF EXISTS public.cqi_sessions CASCADE;
DROP TABLE IF EXISTS public.cqi_templates CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;

-- Then re-run migration
```

---

## Post-Deployment Checklist

After successful migration:

- [ ] Verify 14 tables created
- [ ] Check indexes were created (`\d+ table_name` in psql)
- [ ] Verify triggers are active
- [ ] Test foreign key relationships
- [ ] Insert test data (optional)
- [ ] Update `.env` with database URL

---

## Test Data (Optional)

Insert test lead to verify system:

```sql
-- Insert test lead
INSERT INTO public.leads (name, email, phone, brand, message, source, status)
VALUES (
    'John Test',
    'john.test@example.com',
    '407-555-1234',
    'sotsvc',
    'I need cleaning service for my 3-bedroom home',
    'contact_form',
    'new'
);

-- Verify insert
SELECT id, name, brand, created_at
FROM public.leads
WHERE email = 'john.test@example.com';
```

---

## Next Steps After Deployment

1. **Configure Environment**
   ```bash
   cp .env.shared .env.local
   # Add your Supabase URL and keys
   ```

2. **Seed CQI Templates**
   - Insert question templates from brand configs
   - See: `projects/*/agents/brand-config.yml`

3. **Test Python Agent Runtime**
   - Create `server/agents/cqi_conductor.py`
   - Test with sample lead

4. **Integrate with Contact Form**
   - Update `/contact` to trigger CQI
   - Test end-to-end flow

---

## Support

- **Full Migration SQL**: `supabase/migrations/20251029000001_create_cqi_system_tables.sql`
- **Documentation**: `README-CQI.md`
- **Quick Start**: `QUICKSTART-CQI.md`

---

**Estimated Time**: 10 minutes
**Risk Level**: Low (uses CREATE IF NOT EXISTS)
**Rollback**: Drop tables listed in Troubleshooting section
