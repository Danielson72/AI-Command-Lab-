#!/usr/bin/env python3
"""
Apply CQI Migration to Supabase
Usage: python deploy_migration.py
"""

import os
import sys
from pathlib import Path

# Read migration file
migration_file = Path("supabase/migrations/20251029000001_create_cqi_system_tables.sql")

if not migration_file.exists():
    print(f"❌ Migration file not found: {migration_file}")
    sys.exit(1)

print("=" * 70)
print("  CQI SYSTEM - DATABASE DEPLOYMENT")
print("=" * 70)
print()

# Configuration
project_ref = "wxsfnpbmngglkjlytlul"
supabase_url = f"https://{project_ref}.supabase.co"

print(f"Target Database: AI Command Lab")
print(f"Project Ref: {project_ref}")
print(f"URL: {supabase_url}")
print()

# Get service role key
print("Please provide your Supabase Service Role Key:")
print("(Find it in: Supabase Dashboard → Settings → API → service_role)")
service_role_key = input().strip()

if not service_role_key:
    print("❌ No service role key provided")
    sys.exit(1)

print()
print("Reading migration file...")
migration_sql = migration_file.read_text()
print(f"✅ Migration file loaded ({len(migration_sql)} characters)")
print()

# For safety, let's show what will be created
import re
table_pattern = r'CREATE TABLE.*?public\.(\w+)'
tables = re.findall(table_pattern, migration_sql, re.IGNORECASE)
print(f"Will create {len(tables)} tables:")
for table in tables:
    print(f"  • {table}")
print()

# Confirm
confirm = input("Proceed with deployment? (yes/no): ").strip().lower()
if confirm != 'yes':
    print("❌ Deployment cancelled")
    sys.exit(0)

print()
print("Applying migration...")

try:
    from supabase import create_client, Client

    supabase: Client = create_client(supabase_url, service_role_key)

    # Execute the migration
    # Note: Supabase Python client doesn't have direct SQL execution
    # We need to use the REST API or PostgreSQL connection

    print()
    print("⚠️  Note: Direct SQL execution via Python client is limited.")
    print()
    print("=" * 70)
    print("RECOMMENDED APPROACH:")
    print("=" * 70)
    print()
    print("1. Copy the migration SQL:")
    print(f"   File: {migration_file}")
    print()
    print("2. Go to Supabase Dashboard:")
    print(f"   https://app.supabase.com/project/{project_ref}/editor")
    print()
    print("3. Paste into SQL Editor and Run")
    print()
    print("4. Verify tables created:")
    print("   Navigate to Table Editor")
    print("   Look for 14 new CQI tables")
    print()
    print("=" * 70)

    # Alternative: Show how to do it via psql
    print()
    print("ALTERNATIVE - Using psql:")
    print("=" * 70)
    print()
    print(f"psql 'postgresql://postgres:[PASSWORD]@db.{project_ref}.supabase.co:5432/postgres' < {migration_file}")
    print()
    print("(Get connection string from: Settings → Database → Connection string)")
    print()

except ImportError:
    print()
    print("⚠️  supabase-py not installed")
    print()
    print("Install with: pip install supabase")
    print()
    print("Or use manual deployment method shown above")
    print()

print("=" * 70)
