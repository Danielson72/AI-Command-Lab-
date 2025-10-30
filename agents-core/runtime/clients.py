"""
CQI System - Client Setup Module

This module provides configured clients for:
- Anthropic (Claude AI)
- Supabase (PostgreSQL database)

All clients are initialized with environment variables and include
retry logic and error handling.
"""

import os
import logging
from typing import Optional
from functools import lru_cache

from anthropic import Anthropic
from supabase import create_client, Client
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()


class EnvironmentError(Exception):
    """Raised when required environment variables are missing"""
    pass


def validate_environment() -> None:
    """
    Validate that all required environment variables are set.

    Raises:
        EnvironmentError: If any required variables are missing
    """
    required_vars = [
        'ANTHROPIC_API_KEY',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]

    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing_vars)}\n"
            f"Please set these in your .env file. See .env.example for template."
        )

    logger.info("✅ All required environment variables are set")


@lru_cache(maxsize=1)
def get_anthropic_client() -> Anthropic:
    """
    Get configured Anthropic client for Claude API.

    Uses service account key with retry logic and timeout settings.
    Cached to avoid recreating client on every call.

    Returns:
        Anthropic: Configured Anthropic client

    Environment Variables:
        ANTHROPIC_API_KEY: Your Anthropic API key (required)
            Get from: https://console.anthropic.com/settings/keys
    """
    api_key = os.getenv('ANTHROPIC_API_KEY')

    if not api_key:
        raise EnvironmentError(
            "ANTHROPIC_API_KEY not found in environment. "
            "Get your key from: https://console.anthropic.com/settings/keys"
        )

    client = Anthropic(
        api_key=api_key,
        # Default timeout is 600 seconds (10 minutes)
        # Adjust if you need shorter/longer timeouts
        timeout=120.0,  # 2 minutes
        max_retries=3,  # Retry failed requests up to 3 times
    )

    logger.info("✅ Anthropic client initialized")
    return client


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    """
    Get configured Supabase client for database operations.

    Uses service role key which bypasses Row Level Security (RLS).
    This is required for server-side operations that need full access.

    ⚠️  SECURITY WARNING: Never expose service role key in frontend code!

    Returns:
        Client: Configured Supabase client

    Environment Variables:
        SUPABASE_URL: Your Supabase project URL (required)
            Format: https://[project-ref].supabase.co
            Get from: Supabase Dashboard → Settings → API

        SUPABASE_SERVICE_ROLE_KEY: Your service role key (required)
            Get from: Supabase Dashboard → Settings → API
            ⚠️  This key bypasses all RLS policies - keep it secret!
    """
    url = os.getenv('SUPABASE_URL')
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

    if not url:
        raise EnvironmentError(
            "SUPABASE_URL not found in environment. "
            "Get from: Supabase Dashboard → Settings → API"
        )

    if not key:
        raise EnvironmentError(
            "SUPABASE_SERVICE_ROLE_KEY not found in environment. "
            "Get from: Supabase Dashboard → Settings → API → service_role key"
        )

    client = create_client(url, key)

    logger.info("✅ Supabase client initialized")
    return client


def get_brand_config(brand: str) -> dict:
    """
    Get brand-specific configuration including scoring weights and thresholds.

    In MVP, this returns hardcoded configs. In production, load from
    brand-config.yml files or database.

    Args:
        brand: Brand identifier (sotsvc, boss_of_clean, beatslave, temple_builder)

    Returns:
        dict: Brand configuration including:
            - qualification_threshold: Minimum score to qualify (0-100)
            - scoring_weights: Point values for each criterion
            - cqi_questions: List of questions to ask
    """
    configs = {
        'sotsvc': {
            'brand_name': 'Sonz of Thunder Services',
            'qualification_threshold': 70,
            'scoring_weights': {
                'budget_alignment': 25,
                'urgency': 20,
                'decision_authority': 20,
                'property_fit': 15,
                'service_history': 10,
                'frequency_commitment': 10
            },
            'service_types': ['residential_cleaning', 'commercial_cleaning', 'post_construction', 'move_in_out'],
            'trial_type': 'trial_cleaning',
            'trial_price': 99.00
        },
        'boss_of_clean': {
            'brand_name': 'Boss of Clean',
            'qualification_threshold': 60,
            'scoring_weights': {
                'budget_alignment': 25,
                'urgency': 20,
                'decision_authority': 20,
                'property_fit': 15,
                'provider_availability': 10,
                'location_serviceability': 10
            },
            'service_types': ['pressure_washing', 'soft_washing', 'driveway_cleaning', 'roof_cleaning'],
            'trial_type': 'free_estimate',
            'trial_price': 0.00
        },
        'beatslave': {
            'brand_name': 'BeatSlave',
            'qualification_threshold': 50,
            'scoring_weights': {
                'budget_alignment': 20,
                'urgency': 15,
                'decision_authority': 20,
                'project_fit': 20,
                'creative_clarity': 15,
                'commercial_potential': 10
            },
            'service_types': ['beat_production', 'mixing_mastering', 'custom_composition'],
            'trial_type': 'creative_consultation',
            'trial_price': 0.00
        },
        'temple_builder': {
            'brand_name': 'Temple Builder',
            'qualification_threshold': 80,
            'scoring_weights': {
                'budget_alignment': 20,
                'urgency': 15,
                'decision_authority': 20,
                'ministry_fit': 20,
                'spiritual_readiness': 15,
                'commitment_level': 10
            },
            'service_types': ['faith_consulting', 'ministry_development', 'leadership_training'],
            'trial_type': 'ministry_assessment',
            'trial_price': 0.00
        }
    }

    if brand not in configs:
        logger.warning(f"Unknown brand '{brand}', using SOTSVC defaults")
        return configs['sotsvc']

    logger.info(f"Loaded config for brand: {brand}")
    return configs[brand]


def test_connections() -> dict:
    """
    Test connections to all external services.

    Useful for debugging and health checks.

    Returns:
        dict: Status of each service connection
    """
    results = {
        'environment': False,
        'anthropic': False,
        'supabase': False
    }

    # Test environment variables
    try:
        validate_environment()
        results['environment'] = True
    except EnvironmentError as e:
        logger.error(f"Environment validation failed: {e}")

    # Test Anthropic connection
    try:
        client = get_anthropic_client()
        # Simple API call to verify connection
        # Using the smallest/cheapest model for testing
        response = client.messages.create(
            model="claude-3-5-sonnet-20250131",
            max_tokens=10,
            messages=[{"role": "user", "content": "Hello"}]
        )
        results['anthropic'] = True
        logger.info(f"✅ Anthropic connection successful (response: {response.content[0].text[:20]}...)")
    except Exception as e:
        logger.error(f"❌ Anthropic connection failed: {e}")

    # Test Supabase connection
    try:
        client = get_supabase_client()
        # Try to query a table (should work even if empty)
        response = client.table('cqi_sessions').select("id").limit(1).execute()
        results['supabase'] = True
        logger.info("✅ Supabase connection successful")
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {e}")

    return results


if __name__ == '__main__':
    """
    Run this file directly to test all connections.

    Usage:
        python agents-core/runtime/clients.py
    """
    print("\n" + "="*60)
    print("CQI System - Connection Test")
    print("="*60 + "\n")

    results = test_connections()

    print("\n" + "-"*60)
    print("Results:")
    print("-"*60)
    for service, status in results.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {service.title()}: {'Connected' if status else 'Failed'}")

    all_connected = all(results.values())
    print("\n" + "="*60)
    if all_connected:
        print("✅ All systems operational - ready to process CQI sessions!")
    else:
        print("❌ Some connections failed - check logs above for details")
    print("="*60 + "\n")

    exit(0 if all_connected else 1)
