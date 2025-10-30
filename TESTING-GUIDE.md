# CQI System - Testing Guide

## Overview
This guide provides step-by-step instructions for testing the CQI (Client Qualification Interview) system after deployment. Use this to verify database integrity, test workflows, and validate agent configurations.

---

## Prerequisites

### Required Access:
- ✅ Supabase Dashboard access (for AI Command Lab or BeatSlave)
- ✅ Database credentials (URL + anon key)
- ✅ API endpoint access (http://localhost:8000 or production)
- ✅ Web app access (http://localhost:3000 or production)

### Required Tools:
- Supabase SQL Editor (in dashboard)
- Postman or curl (for API testing)
- Web browser (for form testing)

---

## Test Suite 1: Database Verification

### 1.1 Verify Tables Exist

**SQL Query**:
```sql
-- Count CQI tables
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name LIKE 'cqi_%'
  OR table_name IN ('services', 'trials', 'closer_scripts', 'audit_reports', 'follow_up_tasks')
);

-- Expected: 14
```

**Expected Result**:
```
table_count
-----------
14
```

---

### 1.2 List All Tables

**SQL Query**:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name LIKE 'cqi_%'
  OR table_name IN ('services', 'trials', 'closer_scripts', 'audit_reports', 'follow_up_tasks')
)
ORDER BY table_name;
```

**Expected Result**:
```
table_name
-------------------------
audit_reports
closer_scripts
cqi_responses
cqi_session_states
cqi_sessions
cqi_templates
dashboard_cache
follow_up_tasks
kpi_snapshots
services
system_events
trials
workflow_instances
workflow_stage_transitions
```

---

### 1.3 Verify Indexes

**SQL Query**:
```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'cqi_sessions', 'cqi_responses', 'trials',
    'workflow_instances', 'system_events'
)
ORDER BY tablename, indexname;
```

**Expected**: Multiple indexes per table for foreign keys and common queries

---

### 1.4 Test Triggers

**SQL Query**:
```sql
-- Insert test record
INSERT INTO public.cqi_sessions (
    lead_id,
    brand,
    session_state
) VALUES (
    gen_random_uuid(), -- Temporary lead_id
    'test_brand',
    'initiated'
) RETURNING id, created_at, updated_at;

-- Verify created_at and updated_at are populated
-- Then update the record
UPDATE public.cqi_sessions
SET session_state = 'scored'
WHERE brand = 'test_brand';

-- Query to verify updated_at changed
SELECT id, created_at, updated_at
FROM public.cqi_sessions
WHERE brand = 'test_brand';

-- Cleanup
DELETE FROM public.cqi_sessions WHERE brand = 'test_brand';
```

**Expected**:
- `created_at` auto-populated on INSERT
- `updated_at` auto-populated on INSERT
- `updated_at` changes on UPDATE
- `created_at` remains unchanged on UPDATE

---

## Test Suite 2: Sample Data Creation

### 2.1 Insert Test Services

**SQL Query**:
```sql
-- SOTSVC Services
INSERT INTO public.services (brand, service_name, service_type, pricing_data, includes, requirements, active) VALUES
('sotsvc', 'Residential Cleaning', 'recurring',
 '{"base_price": 150, "per_sqft": 0.15, "frequency_discount": {"weekly": 0.20, "biweekly": 0.15, "monthly": 0.10}}'::jsonb,
 ARRAY['Deep clean', 'All rooms', 'Kitchen & bathrooms', 'Vacuum & mop'],
 ARRAY['3+ bedrooms', 'Access to all rooms', 'Clear walkways'],
 true),
('sotsvc', 'Commercial Cleaning', 'recurring',
 '{"base_price": 300, "per_sqft": 0.10, "frequency_discount": {"daily": 0.25, "weekly": 0.15}}'::jsonb,
 ARRAY['Office cleaning', 'Restroom sanitation', 'Trash removal', 'Floor care'],
 ARRAY['After-hours access', 'Key/code provided', '2000+ sqft'],
 true),
('sotsvc', 'Post-Construction Cleanup', 'one_time',
 '{"base_price": 500, "per_sqft": 0.25}'::jsonb,
 ARRAY['Dust removal', 'Window cleaning', 'Floor scrubbing', 'Debris removal'],
 ARRAY['Construction complete', 'Utilities on', 'Access clearance'],
 true);

-- Boss of Clean Services
INSERT INTO public.services (brand, service_name, service_type, pricing_data, includes, requirements, active) VALUES
('boss_of_clean', 'Pressure Washing - Driveway', 'one_time',
 '{"base_price": 150, "per_sqft": 0.05}'::jsonb,
 ARRAY['High-pressure wash', 'Oil stain treatment', 'Sealer optional'],
 ARRAY['Clear driveway', 'Water access', 'Parking available'],
 true),
('boss_of_clean', 'Soft Wash - House Exterior', 'one_time',
 '{"base_price": 300, "per_sqft": 0.08}'::jsonb,
 ARRAY['Soft chemical wash', 'Mold/mildew removal', 'Window exterior'],
 ARRAY['2-story max', 'Power access', 'Landscaping clearance'],
 true);

-- BeatSlave Services
INSERT INTO public.services (brand, service_name, service_type, pricing_data, includes, requirements, active) VALUES
('beatslave', 'Beat Production - Custom', 'project',
 '{"base_price": 500, "per_revision": 50, "package_discount": {"5_beats": 0.15, "10_beats": 0.25}}'::jsonb,
 ARRAY['Original composition', '2 revisions', 'WAV + MP3', 'Unlimited distribution'],
 ARRAY['Genre specified', 'BPM range', 'Reference tracks'],
 true),
('beatslave', 'Mixing & Mastering', 'project',
 '{"base_price": 200, "per_track": 150}'::jsonb,
 ARRAY['Professional mix', 'Mastering', 'Stem separation', '1 revision'],
 ARRAY['Recorded tracks', 'Minimum 44.1kHz', 'No clipping'],
 true);

-- Verify inserts
SELECT brand, COUNT(*) as service_count
FROM public.services
GROUP BY brand
ORDER BY brand;
```

**Expected Result**:
```
brand           | service_count
----------------|--------------
beatslave       | 2
boss_of_clean   | 2
sotsvc          | 3
```

---

### 2.2 Insert Test CQI Templates

**SQL Query**:
```sql
-- SOTSVC CQI Template
INSERT INTO public.cqi_templates (
    brand,
    template_name,
    questions,
    scoring_weights,
    qualification_threshold,
    active
) VALUES (
    'sotsvc',
    'Residential Cleaning CQI',
    ARRAY[
        'What type of property needs cleaning? (residential/commercial)',
        'What is the approximate square footage?',
        'How many bedrooms and bathrooms?',
        'What is your budget range for cleaning services?',
        'How soon do you need the service? (urgent/this week/this month/flexible)',
        'Who is the decision maker? (me/spouse/property manager/other)',
        'Have you used professional cleaning services before?',
        'What is the primary reason you are seeking cleaning services?',
        'Are there any special requirements? (pets/allergies/eco-friendly)',
        'What frequency are you considering? (one-time/weekly/biweekly/monthly)'
    ],
    '{
        "budget_alignment": 25,
        "urgency": 20,
        "decision_authority": 20,
        "property_fit": 15,
        "service_history": 10,
        "frequency_commitment": 10
    }'::jsonb,
    70,
    true
);

-- BeatSlave CQI Template
INSERT INTO public.cqi_templates (
    brand,
    template_name,
    questions,
    scoring_weights,
    qualification_threshold,
    active
) VALUES (
    'beatslave',
    'Music Production CQI',
    ARRAY[
        'What type of music project are you working on? (album/EP/single/other)',
        'What genre or style are you looking for?',
        'What is your budget for this project?',
        'What is your timeline? (urgent/weeks/months/flexible)',
        'Do you have reference tracks or examples?',
        'Who owns the rights to this project? (me/label/client/other)',
        'What is the intended use? (streaming/radio/film/personal)',
        'Have you worked with producers before?',
        'Do you need additional services? (mixing/mastering/features)',
        'What makes this project important to you?'
    ],
    '{
        "budget_alignment": 20,
        "urgency": 15,
        "decision_authority": 20,
        "project_fit": 20,
        "creative_clarity": 15,
        "commercial_potential": 10
    }'::jsonb,
    50,
    true
);

-- Verify templates
SELECT brand, template_name, qualification_threshold, active
FROM public.cqi_templates
ORDER BY brand;
```

**Expected Result**:
```
brand      | template_name               | qualification_threshold | active
-----------|-----------------------------|------------------------|-------
beatslave  | Music Production CQI        | 50                     | t
sotsvc     | Residential Cleaning CQI    | 70                     | t
```

---

### 2.3 Create Test Lead

**SQL Query**:
```sql
-- Note: Assumes public.leads table exists from main app
-- If not, you'll need to create it first

-- Insert test lead
INSERT INTO public.leads (
    name,
    email,
    phone,
    message,
    brand,
    source
) VALUES (
    'John Test',
    'john.test@example.com',
    '407-555-0100',
    'I need a deep cleaning for my 3-bedroom house. Moving in next week.',
    'sotsvc',
    'website_contact_form'
) RETURNING id, name, email, brand, created_at;

-- Save the returned id for next steps
```

**Expected**: Single row returned with auto-generated UUID `id`

---

### 2.4 Create Test CQI Session

**SQL Query**:
```sql
-- Use the lead_id from previous step
-- Replace [LEAD_ID] with actual UUID

INSERT INTO public.cqi_sessions (
    lead_id,
    brand,
    template_id,
    session_state,
    qualification_score,
    session_data
) VALUES (
    '[LEAD_ID]'::uuid,  -- Replace with actual lead_id
    'sotsvc',
    (SELECT id FROM public.cqi_templates WHERE brand = 'sotsvc' LIMIT 1),
    'scored',
    75,
    '{
        "property_type": "residential",
        "bedrooms": 3,
        "bathrooms": 2,
        "square_footage": 1800,
        "urgency": "high",
        "budget_range": "150-200",
        "frequency": "weekly"
    }'::jsonb
) RETURNING id, lead_id, brand, qualification_score, session_state;
```

**Expected**: Single row returned with qualification_score = 75

---

### 2.5 Add CQI Responses

**SQL Query**:
```sql
-- Use the session_id from previous step
-- Replace [SESSION_ID] with actual UUID

INSERT INTO public.cqi_responses (session_id, question_text, answer_text, score_contribution)
VALUES
('[SESSION_ID]'::uuid, 'What type of property needs cleaning?', 'Residential house', 15),
('[SESSION_ID]'::uuid, 'What is the approximate square footage?', '1800 sq ft', 12),
('[SESSION_ID]'::uuid, 'How many bedrooms and bathrooms?', '3 bedrooms, 2 bathrooms', 10),
('[SESSION_ID]'::uuid, 'What is your budget range?', '$150-200 per cleaning', 20),
('[SESSION_ID]'::uuid, 'How soon do you need the service?', 'This week - moving in', 18);

-- Verify responses
SELECT
    question_text,
    answer_text,
    score_contribution
FROM public.cqi_responses
WHERE session_id = '[SESSION_ID]'::uuid
ORDER BY created_at;
```

**Expected**: 5 rows with varying score contributions

---

### 2.6 Create Test Trial

**SQL Query**:
```sql
-- Use the session_id from previous steps
-- Replace [SESSION_ID] with actual UUID

INSERT INTO public.trials (
    cqi_session_id,
    brand,
    trial_type,
    scheduled_at,
    duration_minutes,
    price,
    status,
    confirmation_data
) VALUES (
    '[SESSION_ID]'::uuid,
    'sotsvc',
    'trial_cleaning',
    NOW() + INTERVAL '3 days',
    60,
    99.00,
    'confirmed',
    '{
        "address": "123 Test St, Orlando, FL 32801",
        "contact_phone": "407-555-0100",
        "special_instructions": "Ring doorbell, dog friendly"
    }'::jsonb
) RETURNING id, trial_type, scheduled_at, status, price;
```

**Expected**: Trial scheduled 3 days in future with $99 price

---

## Test Suite 3: Query Validation

### 3.1 Full Lead Journey Query

**SQL Query**:
```sql
-- Query entire lead-to-trial journey
SELECT
    l.name as lead_name,
    l.email,
    l.brand,
    cs.qualification_score,
    cs.session_state,
    t.trial_type,
    t.scheduled_at,
    t.status as trial_status,
    t.price as trial_price,
    COUNT(cr.id) as response_count
FROM public.leads l
LEFT JOIN public.cqi_sessions cs ON l.id = cs.lead_id
LEFT JOIN public.cqi_responses cr ON cs.id = cr.session_id
LEFT JOIN public.trials t ON cs.id = t.cqi_session_id
WHERE l.email = 'john.test@example.com'
GROUP BY l.name, l.email, l.brand, cs.qualification_score, cs.session_state,
         t.trial_type, t.scheduled_at, t.status, t.price;
```

**Expected Result**:
```
lead_name | email                  | brand  | qualification_score | session_state | trial_type     | trial_status | response_count
----------|------------------------|--------|--------------------|--------------|--------------------|--------------|---------------
John Test | john.test@example.com  | sotsvc | 75                 | scored       | trial_cleaning     | confirmed    | 5
```

---

### 3.2 Brand Performance Query

**SQL Query**:
```sql
-- Aggregate metrics by brand
SELECT
    brand,
    COUNT(DISTINCT cs.id) as total_sessions,
    AVG(cs.qualification_score)::numeric(10,2) as avg_score,
    COUNT(DISTINCT t.id) as trials_booked,
    COUNT(DISTINCT CASE WHEN cs.qualification_score >= 70 THEN cs.id END) as qualified_leads,
    COUNT(DISTINCT CASE WHEN t.status = 'confirmed' THEN t.id END) as confirmed_trials
FROM public.cqi_sessions cs
LEFT JOIN public.trials t ON cs.id = t.cqi_session_id
GROUP BY brand
ORDER BY brand;
```

**Expected**: Aggregated metrics showing session counts and averages per brand

---

### 3.3 Service Catalog Query

**SQL Query**:
```sql
-- List all active services by brand
SELECT
    brand,
    service_name,
    service_type,
    pricing_data->>'base_price' as base_price,
    array_length(includes, 1) as features_count,
    active
FROM public.services
WHERE active = true
ORDER BY brand, service_type, service_name;
```

**Expected**: All services with pricing and feature counts

---

### 3.4 Recent Activity Query

**SQL Query**:
```sql
-- Last 10 system events
SELECT
    event_type,
    brand,
    event_data->>'message' as message,
    severity,
    created_at
FROM public.system_events
ORDER BY created_at DESC
LIMIT 10;
```

**Expected**: Recent system events (if any exist)

---

## Test Suite 4: API Testing

### 4.1 Health Check

**Request**:
```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-30T12:00:00Z"
}
```

---

### 4.2 Create Lead via API

**Request**:
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

**Expected Response**:
```json
{
  "success": true,
  "lead_id": "uuid-here",
  "message": "Lead created successfully"
}
```

---

### 4.3 Verify Lead in Database

**SQL Query**:
```sql
SELECT id, name, email, brand, created_at
FROM public.leads
WHERE email = 'jane.api@example.com';
```

**Expected**: Single row with matching data

---

## Test Suite 5: Web Form Testing

### 5.1 Submit Contact Form

**Steps**:
1. Open browser to http://localhost:3000/contact
2. Fill out form:
   - Name: "Web Test User"
   - Email: "webtest@example.com"
   - Phone: "407-555-0300"
   - Message: "Testing CQI integration"
   - Select brand (if dropdown exists)
3. Click Submit
4. Verify success message appears

---

### 5.2 Verify Form Submission

**SQL Query**:
```sql
SELECT id, name, email, brand, source, created_at
FROM public.leads
WHERE email = 'webtest@example.com';
```

**Expected**: Form data saved to database

---

## Test Suite 6: Workflow Testing

### 6.1 Create Workflow Instance

**SQL Query**:
```sql
-- Create lead-to-trial workflow instance
INSERT INTO public.workflow_instances (
    workflow_name,
    workflow_version,
    brand,
    lead_id,
    current_stage,
    stage_data,
    status
) VALUES (
    'lead-to-trial',
    '1.0.0',
    'sotsvc',
    (SELECT id FROM public.leads WHERE email = 'john.test@example.com'),
    'lead_captured',
    '{
        "entry_point": "website_form",
        "utm_source": "test"
    }'::jsonb,
    'running'
) RETURNING id, workflow_name, current_stage, status;
```

**Expected**: New workflow instance created

---

### 6.2 Add Stage Transition

**SQL Query**:
```sql
-- Replace [WORKFLOW_ID] with actual ID from previous step

INSERT INTO public.workflow_stage_transitions (
    workflow_instance_id,
    from_stage,
    to_stage,
    transition_reason,
    transition_data,
    success
) VALUES (
    '[WORKFLOW_ID]'::uuid,
    'lead_captured',
    'cqi_initiated',
    'automatic',
    '{
        "trigger": "new_lead_webhook",
        "delay_seconds": 5
    }'::jsonb,
    true
);

-- Query workflow history
SELECT
    from_stage,
    to_stage,
    transition_reason,
    success,
    created_at
FROM public.workflow_stage_transitions
WHERE workflow_instance_id = '[WORKFLOW_ID]'::uuid
ORDER BY created_at;
```

**Expected**: Transition recorded successfully

---

## Test Suite 7: Data Integrity Testing

### 7.1 Test Foreign Key Constraints

**SQL Query**:
```sql
-- This should FAIL (no lead with this ID)
INSERT INTO public.cqi_sessions (
    lead_id,
    brand,
    session_state
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test',
    'initiated'
);

-- Expected error: violates foreign key constraint
```

**Expected**: Error with foreign key violation message

---

### 7.2 Test Cascade Delete

**SQL Query**:
```sql
-- Create temporary lead and session
INSERT INTO public.leads (name, email, phone, brand)
VALUES ('Delete Test', 'delete@test.com', '000-000-0000', 'test')
RETURNING id;

-- Use returned ID to create session
INSERT INTO public.cqi_sessions (lead_id, brand, session_state)
VALUES ('[LEAD_ID]'::uuid, 'test', 'initiated');

-- Delete the lead
DELETE FROM public.leads WHERE email = 'delete@test.com';

-- Verify session was also deleted (cascade)
SELECT COUNT(*) FROM public.cqi_sessions
WHERE lead_id = '[LEAD_ID]'::uuid;

-- Expected: 0 (session deleted with lead)
```

**Expected**: Count = 0 (cascade delete worked)

---

### 7.3 Test Check Constraints

**SQL Query**:
```sql
-- This should FAIL (score > 100)
INSERT INTO public.cqi_sessions (
    lead_id,
    brand,
    session_state,
    qualification_score
) VALUES (
    (SELECT id FROM public.leads LIMIT 1),
    'test',
    'scored',
    150  -- Invalid: > 100
);

-- Expected error: check constraint violation
```

**Expected**: Error about qualification_score constraint

---

## Test Suite 8: Performance Testing

### 8.1 Bulk Insert Test

**SQL Query**:
```sql
-- Insert 100 test leads
DO $$
DECLARE
    i INTEGER;
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO public.leads (name, email, phone, brand, message)
        VALUES (
            'Bulk Test ' || i,
            'bulk' || i || '@test.com',
            '407-555-' || LPAD(i::text, 4, '0'),
            CASE WHEN i % 3 = 0 THEN 'sotsvc'
                 WHEN i % 3 = 1 THEN 'boss_of_clean'
                 ELSE 'beatslave'
            END,
            'Bulk test message ' || i
        );
    END LOOP;
END $$;

-- Verify inserts
SELECT brand, COUNT(*) as lead_count
FROM public.leads
WHERE email LIKE 'bulk%@test.com'
GROUP BY brand
ORDER BY brand;
```

**Expected**: ~33-34 leads per brand, total 100

---

### 8.2 Query Performance Test

**SQL Query**:
```sql
-- Test complex join query performance
EXPLAIN ANALYZE
SELECT
    l.name,
    cs.qualification_score,
    COUNT(cr.id) as responses,
    t.status
FROM public.leads l
JOIN public.cqi_sessions cs ON l.id = cs.lead_id
LEFT JOIN public.cqi_responses cr ON cs.id = cr.session_id
LEFT JOIN public.trials t ON cs.id = t.cqi_session_id
WHERE l.brand = 'sotsvc'
GROUP BY l.name, cs.qualification_score, t.status;
```

**Expected**: Query execution time < 100ms for small datasets

---

## Test Suite 9: Cleanup

### 9.1 Remove Test Data

**SQL Query**:
```sql
-- Delete test leads and cascading data
DELETE FROM public.leads
WHERE email LIKE '%test%'
   OR email LIKE '%@test.com'
   OR email LIKE 'bulk%@test.com';

-- Delete test services
DELETE FROM public.services
WHERE brand IN ('sotsvc', 'boss_of_clean', 'beatslave')
AND service_name LIKE '%Test%';

-- Delete test templates
DELETE FROM public.cqi_templates
WHERE brand IN ('test', 'test_brand');

-- Delete test workflows
DELETE FROM public.workflow_instances
WHERE brand = 'test';

-- Verify cleanup
SELECT 'leads' as table_name, COUNT(*) as remaining FROM public.leads WHERE email LIKE '%test%'
UNION ALL
SELECT 'cqi_sessions', COUNT(*) FROM public.cqi_sessions WHERE brand = 'test'
UNION ALL
SELECT 'trials', COUNT(*) FROM public.trials WHERE brand = 'test';
```

**Expected**: All test data removed (counts = 0)

---

## Success Criteria Checklist

### Database Integrity:
- [ ] All 14 tables exist
- [ ] All indexes created
- [ ] Triggers working (updated_at)
- [ ] Foreign keys enforced
- [ ] Check constraints working
- [ ] Cascade deletes working

### Sample Data:
- [ ] Services inserted for all brands
- [ ] CQI templates created
- [ ] Test leads created
- [ ] CQI sessions created
- [ ] Trial bookings created

### API Functionality:
- [ ] Health check responds
- [ ] POST /lead accepts data
- [ ] Data persists to database
- [ ] Error handling works

### Web Forms:
- [ ] Contact form loads
- [ ] Form submission works
- [ ] Success message displays
- [ ] Data saves to database

### Workflows:
- [ ] Workflow instances created
- [ ] Stage transitions recorded
- [ ] Status tracking works

### Performance:
- [ ] Bulk inserts complete < 5 seconds
- [ ] Complex queries < 100ms
- [ ] No timeout errors

---

## Troubleshooting

### Issue: "Table does not exist"
**Solution**: Run migration again. Check [DEPLOY-TO-SUPABASE.md](DEPLOY-TO-SUPABASE.md)

### Issue: "Foreign key constraint violation"
**Solution**: Create parent record first (lead before cqi_session)

### Issue: "API endpoint not found"
**Solution**: Verify FastAPI server is running: `cd server && python -m uvicorn app:app --reload`

### Issue: "Connection refused"
**Solution**: Check Supabase credentials in `.env` file

### Issue: "Check constraint violation"
**Solution**: Verify data meets constraints (score 0-100, valid session_state, etc.)

---

## Next Steps

After completing all tests:
1. Review [NEXT-ACTIONS.md](NEXT-ACTIONS.md) for Phase 2 tasks
2. Configure production environment using [ENV-SETUP-GUIDE.md](ENV-SETUP-GUIDE.md)
3. Deploy to remaining brands
4. Implement Python runtime for agent execution

---

**Last Updated**: 2025-01-30
**Database Version**: 20251029000001
**Test Coverage**: 9 suites, 45+ test cases
