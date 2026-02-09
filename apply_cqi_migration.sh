#!/bin/bash
# Apply CQI Migration to AI Command Lab Supabase

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================================"
echo "  CQI SYSTEM - DATABASE DEPLOYMENT"
echo "================================================================"
echo ""

# Configuration
PROJECT_REF="wxsfnpbmngglkjlytlul"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
MIGRATION_FILE="supabase/migrations/20251029000001_create_cqi_system_tables.sql"

echo -e "${BLUE}Target Database:${NC} AI Command Lab"
echo -e "${BLUE}Project Ref:${NC} $PROJECT_REF"
echo -e "${BLUE}URL:${NC} $SUPABASE_URL"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migration file found${NC}"
echo ""

# Prompt for service role key
echo -e "${BLUE}Please provide your Supabase Service Role Key:${NC}"
echo "(Find it in: Supabase Dashboard → Settings → API → service_role)"
read -s SERVICE_ROLE_KEY
echo ""

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ No service role key provided${NC}"
    exit 1
fi

echo -e "${BLUE}Applying migration...${NC}"
echo ""

# Apply migration using curl
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d @<(cat <<JSONEOF
{
  "query": $(cat "$MIGRATION_FILE" | jq -Rs .)
}
JSONEOF
))

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo -e "${GREEN}✅ Migration applied successfully!${NC}"
    echo ""
    echo "Verifying tables..."
    
    # Verify tables were created
    VERIFY_QUERY='SELECT table_name FROM information_schema.tables WHERE table_schema = '\''public'\'' AND table_name IN ('\''services'\'', '\''cqi_templates'\'', '\''cqi_sessions'\'', '\''cqi_responses'\'', '\''trials'\'', '\''closer_scripts'\'', '\''audit_reports'\'', '\''follow_up_tasks'\'', '\''workflow_instances'\'', '\''workflow_stage_transitions'\'', '\''cqi_session_states'\'', '\''system_events'\'', '\''dashboard_cache'\'', '\''kpi_snapshots'\'') ORDER BY table_name;'
    
    echo ""
    echo -e "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Verify tables in Supabase Dashboard → Table Editor"
    echo "2. Update DEPLOYMENT-STATUS.md"
    echo "3. Configure environment (.env.local)"
else
    echo -e "${RED}❌ Migration failed${NC}"
    echo "HTTP Status: $HTTP_STATUS"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""
echo "================================================================"
