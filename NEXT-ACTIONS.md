# CQI System - Next Actions

## Phase 1 Status: ✅ COMPLETE
- **Commit**: bbb125f
- **Files**: 29 committed to GitHub
- **Databases**: 2/7 deployed (Command Lab + BeatSlave)
- **Foundation**: Agent definitions, workflows, brand configs, database schema

---

## Immediate Actions (Week 1)

### 1. Test with Sample Leads
**Priority**: CRITICAL
**Duration**: 2-4 hours
**Owner**: Development Team

**Tasks**:
- [ ] Insert test lead into `public.leads` table
- [ ] Manually create CQI session in `cqi_sessions` table
- [ ] Verify foreign key relationships work correctly
- [ ] Test scoring algorithm with sample responses
- [ ] Validate trial booking flow
- [ ] Check audit report generation

**Testing Checklist**:
```sql
-- Test 1: Create lead
INSERT INTO public.leads (name, email, phone, message, brand)
VALUES ('Test User', 'test@example.com', '407-555-0100', 'Test message', 'sotsvc');

-- Test 2: Create CQI session
INSERT INTO public.cqi_sessions (lead_id, brand, session_state, qualification_score)
VALUES ('[LEAD_ID]', 'sotsvc', 'scored', 75);

-- Test 3: Query results
SELECT * FROM cqi_sessions WHERE brand = 'sotsvc';
```

**Success Criteria**:
- All inserts succeed without errors
- Foreign keys enforce data integrity
- Queries return expected results
- Timestamps auto-populate correctly

---

### 2. Environment Configuration
**Priority**: CRITICAL
**Duration**: 1-2 hours
**Owner**: DevOps

**Tasks**:
- [ ] Copy `.env.shared` to `.env.local` in `/next`
- [ ] Copy `.env.shared` to `.env` in `/server`
- [ ] Add Anthropic API key for Claude integration
- [ ] Add Supabase credentials (URL + anon key) for each brand
- [ ] Add Stripe keys for payment processing
- [ ] Verify all environment variables load correctly

**Environment Files Needed**:
```
/next/.env.local          # Web app config
/server/.env              # API config
/agents-core/.env         # Agent runtime config (create)
```

**See**: [ENV-SETUP-GUIDE.md](ENV-SETUP-GUIDE.md) for detailed instructions

---

### 3. Database Verification
**Priority**: HIGH
**Duration**: 30 minutes
**Owner**: Database Admin

**Tasks**:
- [ ] Verify all 14 tables exist in Command Lab
- [ ] Verify all 14 tables exist in BeatSlave
- [ ] Check all indexes are created
- [ ] Test triggers (updated_at auto-update)
- [ ] Validate RLS policies (when enabled)

**Verification Script**:
```sql
-- Count tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cqi_%' OR table_name IN ('services', 'trials');

-- Expected: 14 tables

-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## Short-Term Actions (Weeks 2-3)

### 4. Deploy to Remaining Brands
**Priority**: HIGH
**Duration**: 2-3 hours
**Owner**: DevOps

**Deployment Queue**:
1. **SOTSVC** (sotsvc.com)
   - [ ] Obtain Supabase project URL
   - [ ] Run migration
   - [ ] Verify 14 tables created
   - [ ] Test with sample lead

2. **Boss of Clean** (bossofclean.com)
   - [ ] Obtain Supabase project URL
   - [ ] Run migration
   - [ ] Verify 14 tables created
   - [ ] Test with sample provider listing

3. **DLD-Online** (dld-online.com)
   - [ ] Obtain Supabase project URL
   - [ ] Run migration
   - [ ] Verify 14 tables created
   - [ ] Test with sample client

4. **Trusted Cleaning Expert** (trustedcleaningexpert.com)
   - [ ] Obtain Supabase project URL
   - [ ] Run migration
   - [ ] Verify 14 tables created
   - [ ] Test with sample request

5. **JM Home Décor**
   - [ ] Create Supabase project
   - [ ] Run migration
   - [ ] Configure brand-config.yml
   - [ ] Test with sample inquiry

**Success Metrics**:
- 7/7 databases deployed
- 98 total tables created (14 × 7)
- 0 deployment errors
- All brands passing health checks

---

### 5. Contact Form Integration
**Priority**: HIGH
**Duration**: 4-6 hours
**Owner**: Full Stack Developer

**Integration Points**:
1. **Web Forms** (`/next/app/contact/page.tsx`)
   - [ ] Update form to capture all CQI-required fields
   - [ ] Add brand detection logic
   - [ ] POST to `/api/lead` with CQI metadata

2. **FastAPI Endpoint** (`/server/app.py`)
   - [ ] Enhance `/lead` endpoint to create CQI session
   - [ ] Trigger CQI Conductor agent
   - [ ] Return session ID to frontend

3. **Email Notifications**
   - [ ] Send confirmation to lead
   - [ ] Send alert to sales team
   - [ ] Include CQI session link

**API Flow**:
```
User submits form
  ↓
POST /api/lead
  ↓
Create lead in public.leads
  ↓
Create CQI session in cqi_sessions
  ↓
Trigger CQI Conductor agent
  ↓
Return session ID + confirmation
  ↓
Send email notifications
```

---

## Medium-Term Actions (Month 1)

### 6. Python Runtime Implementation
**Priority**: CRITICAL
**Duration**: 2-3 weeks
**Owner**: AI Engineering Team

**Architecture**:
```
agents-core/
├── runtime/
│   ├── executor.py        # Agent execution engine
│   ├── conductor.py       # CQI Conductor implementation
│   ├── scorer.py          # Scoring algorithm
│   ├── trial_manager.py   # Trial booking logic
│   ├── closer.py          # Script generation
│   └── audit.py           # Report generation
├── lib/
│   ├── claude_client.py   # Anthropic API wrapper
│   ├── supabase_client.py # Database operations
│   ├── workflow.py        # Workflow state machine
│   └── context.py         # Context management
└── tests/
    ├── test_conductor.py
    ├── test_scorer.py
    └── test_workflows.py
```

**Development Tasks**:
- [ ] Implement agent base class
- [ ] Build Claude API integration
- [ ] Create workflow state machine
- [ ] Implement scoring algorithm
- [ ] Build trial booking system
- [ ] Create closer script generator
- [ ] Write unit tests (80%+ coverage)
- [ ] Write integration tests
- [ ] Load test with 100 concurrent sessions

**Dependencies**:
```bash
pip install anthropic supabase pydantic pyyaml pytest
```

---

### 7. Dashboard Development
**Priority**: MEDIUM
**Duration**: 1-2 weeks
**Owner**: Frontend Team

**Dashboard Views**:

1. **Executive Dashboard**
   - Total leads by brand
   - Conversion funnel metrics
   - Revenue projections
   - Agent performance scores

2. **Operations Dashboard**
   - Active CQI sessions
   - Trial bookings today
   - Follow-up tasks queue
   - System health metrics

3. **Sales Dashboard**
   - Qualified leads ready for outreach
   - Trial confirmations needed
   - Closer scripts generated
   - Win/loss analytics

4. **Analytics Dashboard**
   - Scoring distribution
   - Time-to-trial metrics
   - Trial-to-paid conversion
   - Agent utilization rates

**Tech Stack**:
- Next.js 14 App Router
- React Server Components
- Recharts for visualizations
- Real-time updates via Supabase Realtime

---

### 8. Workflow Automation
**Priority**: MEDIUM
**Duration**: 1 week
**Owner**: Backend Team

**Implement Workflows**:

1. **Lead-to-Trial Workflow**
   - [ ] Automatic lead capture
   - [ ] CQI session initiation
   - [ ] Scoring and qualification
   - [ ] Trial booking automation
   - [ ] Confirmation emails
   - [ ] Reminder sequences

2. **Trial-to-Paid Workflow**
   - [ ] Trial completion tracking
   - [ ] Follow-up scheduling
   - [ ] Closer script generation
   - [ ] Proposal creation
   - [ ] Payment processing
   - [ ] Onboarding automation

**Workflow Engine**:
```python
# Example workflow runner
from agents_core.lib.workflow import WorkflowEngine

engine = WorkflowEngine()
instance = engine.start_workflow(
    workflow_name="lead-to-trial",
    lead_id=lead_id,
    brand="sotsvc"
)

# Workflow executes asynchronously
# Transitions tracked in workflow_stage_transitions
```

---

## Long-Term Actions (Months 2-3)

### 9. Phase 2 Enhancements
**Priority**: LOW (Future)
**Duration**: 4-6 weeks
**Owner**: Product Team

**See**: [PHASE-2-ENHANCEMENTS.md](PHASE-2-ENHANCEMENTS.md)

**Key Features**:
- Kingdom Closer Intelligence (predictive maintenance, self-healing)
- Voice integration (call transcription, AI phone calls)
- Advanced scheduling (calendar sync, availability optimization)
- Multi-brand intelligence (cross-brand learning)
- Email automation (drip campaigns, nurture sequences)
- Payment processing (invoicing, subscriptions)

---

### 10. Advanced Analytics
**Priority**: LOW
**Duration**: 2-3 weeks
**Owner**: Data Team

**Analytics Capabilities**:
- Predictive lead scoring with ML
- Churn prediction for trials
- Optimal pricing recommendations
- Agent performance optimization
- A/B testing framework
- Cohort analysis

**Tech Stack**:
- Python data science stack (pandas, scikit-learn)
- Supabase for data warehouse
- Metabase or similar for BI
- Daily KPI snapshots

---

### 11. Mobile App
**Priority**: LOW
**Duration**: 6-8 weeks
**Owner**: Mobile Team

**Features**:
- Sales rep dashboard
- Trial booking management
- Closer script viewer
- Push notifications
- Offline mode
- In-app messaging

**Tech Stack**:
- React Native or Flutter
- Supabase backend
- Real-time updates
- iOS + Android

---

## Success Metrics

### Week 1 Targets:
- ✅ Test lead flow working end-to-end
- ✅ All environment variables configured
- ✅ Database verification complete

### Month 1 Targets:
- 7/7 databases deployed
- Contact forms integrated
- Python runtime functional
- 10+ successful CQI sessions

### Month 2 Targets:
- Dashboards live
- Workflows automated
- 100+ CQI sessions completed
- 50+ trials booked

### Month 3 Targets:
- Phase 2 enhancements deployed
- Analytics dashboard live
- 500+ CQI sessions
- 200+ trials booked
- $50K+ in new revenue

---

## Risk Management

### Technical Risks:
1. **Claude API Rate Limits**
   - Mitigation: Implement queue system, caching
   - Fallback: Manual scoring mode

2. **Supabase Performance**
   - Mitigation: Index optimization, query caching
   - Monitoring: Set up performance alerts

3. **Integration Bugs**
   - Mitigation: Comprehensive testing, staged rollout
   - Rollback: Feature flags for quick disable

### Business Risks:
1. **User Adoption**
   - Mitigation: Training materials, onboarding flow
   - Measurement: Track usage metrics daily

2. **Data Quality**
   - Mitigation: Input validation, data cleanup scripts
   - Monitoring: Daily data quality reports

3. **Cost Overruns**
   - Mitigation: Set API budgets, monitor usage
   - Alerts: Daily cost reports

---

## Resource Requirements

### Development Team:
- 1 Full Stack Developer (Python + Next.js)
- 1 AI Engineer (Claude integration)
- 1 DevOps Engineer (deployment, monitoring)
- 1 QA Engineer (testing, validation)

### Tools & Services:
- Anthropic Claude API ($500-1000/month)
- Supabase Pro ($25/month × 7 = $175/month)
- Cloudinary ($50/month)
- Stripe (2.9% + $0.30 per transaction)
- Netlify Pro ($19/month)
- DigitalOcean ($20-50/month)

**Total Estimated Cost**: $800-1300/month

---

## Timeline Overview

```
Week 1:    ████ Testing & Verification
Week 2-3:  ████████ Deployment & Integration
Week 4-6:  ████████████ Python Runtime
Week 7-8:  ████████ Dashboard Development
Week 9-10: ████████ Workflow Automation
Week 11+:  ████████████████ Phase 2 Enhancements
```

---

## Contact & Support

**Project Lead**: Daniel Alvarez
**Repository**: https://github.com/Danielson72/AI-Command-Lab-
**Documentation**: See [README-CQI.md](README-CQI.md)

**Getting Started**:
1. Read [QUICKSTART-CQI.md](QUICKSTART-CQI.md)
2. Follow [ENV-SETUP-GUIDE.md](ENV-SETUP-GUIDE.md)
3. Test using [TESTING-GUIDE.md](TESTING-GUIDE.md)

---

**Last Updated**: 2025-01-30
**Status**: Phase 1 Complete ✅
**Next Review**: 2025-02-06
