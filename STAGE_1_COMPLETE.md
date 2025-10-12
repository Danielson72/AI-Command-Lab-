# ✅ Stage 1: Database Foundation - COMPLETE

## 📁 Files Created

**Schema File:** `/db/schema_agents.sql`

This file contains the complete Phase 0.5 agent infrastructure schema with:
- ✅ 6 new tables (agents, mcp_tasks, agent_tasks, approvals, knowledge_sources, agent_templates)
- ✅ 6 ID generation functions (auto-increment text IDs)
- ✅ 6 auto-ID triggers
- ✅ 5 updated_at triggers

---

## 🎯 What Was Created

### Tables

| Table | Purpose | ID Pattern |
|-------|---------|------------|
| **agents** | Reusable AI agents per brand | agent_001, agent_002... |
| **mcp_tasks** | Individual agent execution runs | task_001, task_002... |
| **agent_tasks** | Kanban-style task board items | atask_001, atask_002... |
| **approvals** | Human-in-the-loop approval workflow | appr_001, appr_002... |
| **knowledge_sources** | Curated documentation for RAG | ksrc_001, ksrc_002... |
| **agent_templates** | Reusable workflow templates | tpl_001, tpl_002... |

### Functions

- `generate_agent_id()` - Auto-generates agent_001, agent_002, etc.
- `generate_mcp_task_id()` - Auto-generates task_001, task_002, etc.
- `generate_agent_task_id()` - Auto-generates atask_001, atask_002, etc.
- `generate_approval_id()` - Auto-generates appr_001, appr_002, etc.
- `generate_knowledge_source_id()` - Auto-generates ksrc_001, ksrc_002, etc.
- `generate_agent_template_id()` - Auto-generates tpl_001, tpl_002, etc.

### Triggers

- Auto-ID triggers on all 6 tables (before insert)
- Updated_at triggers on 5 tables (before update)

---

## 🚀 How to Apply to Supabase

### Method 1: SQL Editor (Recommended)

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/wxsfnpbmngglkjlytlul
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Copy the entire contents of `/db/schema_agents.sql`
5. Paste into the SQL editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Verify success (you should see "Success. No rows returned")

### Method 2: Command Line (Alternative)

If you have the Supabase CLI installed:

```bash
cd AI-Command-Lab
supabase db push --db-url "postgresql://postgres:[YOUR_PASSWORD]@db.wxsfnpbmngglkjlytlul.supabase.co:5432/postgres" --file db/schema_agents.sql
```

---

## ✅ Verification

After applying the schema, verify it worked:

### Check Tables Exist

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('agents', 'mcp_tasks', 'agent_tasks', 'approvals', 'knowledge_sources', 'agent_templates')
ORDER BY tablename;
```

**Expected result:** 6 rows

### Check Functions Exist

```sql
SELECT proname 
FROM pg_proc 
WHERE proname LIKE '%agent%' OR proname LIKE '%mcp%' OR proname LIKE '%approval%' OR proname LIKE '%knowledge%'
ORDER BY proname;
```

**Expected result:** 12+ functions

### Test Auto-ID Generation

```sql
-- Test creating an agent (ID should auto-generate)
INSERT INTO agents (brand_id, name, description) 
VALUES ('brand_001', 'Test Agent', 'Testing auto-ID generation')
RETURNING id;
```

**Expected result:** `agent_001`

---

## 📊 Stage 1 Status

| Item | Status |
|------|--------|
| Schema file created | ✅ Complete |
| 6 tables defined | ✅ Complete |
| ID generation functions | ✅ Complete |
| Auto-ID triggers | ✅ Complete |
| Updated_at triggers | ✅ Complete |
| Applied to Supabase | ⏳ **Manual step required** |

---

## 🎯 Next Steps

Once you've applied the schema to Supabase:

1. ✅ Verify tables exist (run verification queries above)
2. ✅ Test auto-ID generation
3. 🚀 **Proceed to Stage 2: Security Layer (RLS Policies)**

---

**Ready for Stage 2?** Let me know once the schema is applied and I'll implement the RLS policies!

