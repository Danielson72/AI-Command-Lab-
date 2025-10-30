"""
CQI Conductor - Master Orchestrator for Client Qualification Interviews

This is the main agent that processes leads through the CQI workflow:
1. Fetches lead data from database
2. Analyzes lead using Claude AI with brand-specific scoring criteria
3. Calculates qualification score (0-100)
4. Creates CQI session record
5. Determines if lead qualifies for trial booking

Usage:
    # As a module
    from conductor import process_lead
    result = process_lead(lead_id="uuid-here", brand="sotsvc")

    # As a CLI tool
    python conductor.py --lead-id uuid-here --brand sotsvc
"""

import os
import sys
import json
import logging
import argparse
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID

from clients import (
    get_anthropic_client,
    get_supabase_client,
    get_brand_config,
    validate_environment
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CQIError(Exception):
    """Base exception for CQI processing errors"""
    pass


class LeadNotFoundError(CQIError):
    """Raised when lead_id doesn't exist in database"""
    pass


class ScoringError(CQIError):
    """Raised when Claude AI scoring fails"""
    pass


def fetch_lead_data(lead_id: str) -> Dict[str, Any]:
    """
    Fetch lead data from Supabase database.

    Args:
        lead_id: UUID of the lead to fetch

    Returns:
        dict: Lead data including name, email, phone, message, brand

    Raises:
        LeadNotFoundError: If lead doesn't exist
    """
    logger.info(f"Fetching lead data for: {lead_id}")

    supabase = get_supabase_client()

    try:
        response = supabase.table('leads').select('*').eq('id', lead_id).execute()

        if not response.data or len(response.data) == 0:
            raise LeadNotFoundError(f"No lead found with id: {lead_id}")

        lead = response.data[0]
        logger.info(f"✅ Lead found: {lead.get('name', 'Unknown')} ({lead.get('brand', 'unknown')})")
        return lead

    except Exception as e:
        if isinstance(e, LeadNotFoundError):
            raise
        logger.error(f"Database error fetching lead: {e}")
        raise CQIError(f"Failed to fetch lead: {e}")


def build_scoring_prompt(lead: Dict[str, Any], brand_config: dict) -> str:
    """
    Build the prompt for Claude to analyze and score the lead.

    The prompt includes:
    - Brand-specific scoring criteria and weights
    - Lead information (name, email, phone, message)
    - Instructions for structured JSON output

    Args:
        lead: Lead data from database
        brand_config: Brand configuration with scoring weights

    Returns:
        str: Formatted prompt for Claude
    """
    brand_name = brand_config['brand_name']
    weights = brand_config['scoring_weights']
    threshold = brand_config['qualification_threshold']

    # Extract lead fields with defaults
    name = lead.get('name', 'Not provided')
    email = lead.get('email', 'Not provided')
    phone = lead.get('phone', 'Not provided')
    message = lead.get('message', 'Not provided')
    source = lead.get('source', 'unknown')

    prompt = f"""You are a Client Qualification Interview (CQI) agent for {brand_name}.

Your task is to analyze this lead and assign a qualification score from 0-100 based on the criteria below.

LEAD INFORMATION:
- Name: {name}
- Email: {email}
- Phone: {phone}
- Message: {message}
- Source: {source}

SCORING CRITERIA (total 100 points):
"""

    # Add each scoring criterion with its weight
    for criterion, points in weights.items():
        criterion_display = criterion.replace('_', ' ').title()
        prompt += f"\n{points} points - {criterion_display}"

    prompt += f"""

QUALIFICATION THRESHOLD: {threshold} points

SCORING GUIDELINES:

1. Budget Alignment ({weights.get('budget_alignment', 0)} points):
   - Explicit budget mentioned or implied: {weights.get('budget_alignment', 0)} points
   - Vague budget indicators: {weights.get('budget_alignment', 0) // 2} points
   - No budget info: 0 points

2. Urgency ({weights.get('urgency', 0)} points):
   - "ASAP", "urgent", "this week": {weights.get('urgency', 0)} points
   - "Soon", "next month": {weights.get('urgency', 0) // 2} points
   - "Flexible", no timeline: 0 points

3. Decision Authority ({weights.get('decision_authority', 0)} points):
   - "I", "me", "my": {weights.get('decision_authority', 0)} points (likely decision maker)
   - "We", "us": {weights.get('decision_authority', 0) // 2} points (might need approval)
   - "For someone else", "exploring": 0 points

4. Property/Project Fit ({weights.get('property_fit', weights.get('project_fit', 0))} points):
   - Clear service need matching our offerings: {weights.get('property_fit', weights.get('project_fit', 0))} points
   - Partial match: {weights.get('property_fit', weights.get('project_fit', 0)) // 2} points
   - Poor fit or unclear: 0 points

5. Service History ({weights.get('service_history', 0)} points):
   - Has used similar services before: {weights.get('service_history', 0)} points
   - First time user: {weights.get('service_history', 0) // 2} points
   - Unknown: 0 points

6. Frequency/Commitment ({weights.get('frequency_commitment', weights.get('commitment_level', 0))} points):
   - Mentions recurring, ongoing, or long-term: {weights.get('frequency_commitment', weights.get('commitment_level', 0))} points
   - One-time project: {weights.get('frequency_commitment', weights.get('commitment_level', 0)) // 2} points
   - Unknown: 0 points

ADDITIONAL FACTORS:
- Complete contact info (phone + email): +5 bonus points
- Professional tone in message: +3 bonus points
- Detailed, specific request: +3 bonus points
- Incomplete contact info: -5 penalty points
- Spam-like message: -10 penalty points

OUTPUT FORMAT:
Return ONLY a valid JSON object with this structure:

{{
  "qualification_score": 75,
  "qualified": true,
  "scoring_breakdown": {{
    "budget_alignment": 20,
    "urgency": 15,
    "decision_authority": 20,
    "property_fit": 12,
    "service_history": 5,
    "frequency_commitment": 8
  }},
  "reasoning": "Brief explanation of the score and key factors",
  "recommended_action": "trial_booking|nurture_campaign|disqualify",
  "confidence_level": "high|medium|low"
}}

Analyze the lead now and return the JSON:"""

    return prompt


def score_lead_with_claude(lead: Dict[str, Any], brand_config: dict) -> Dict[str, Any]:
    """
    Use Claude AI to analyze and score the lead.

    Args:
        lead: Lead data from database
        brand_config: Brand configuration with scoring criteria

    Returns:
        dict: Scoring results including:
            - qualification_score (int): 0-100
            - qualified (bool): True if score >= threshold
            - scoring_breakdown (dict): Points per criterion
            - reasoning (str): Explanation of score
            - recommended_action (str): Next step
            - confidence_level (str): How confident Claude is

    Raises:
        ScoringError: If Claude API fails or returns invalid data
    """
    logger.info(f"Analyzing lead with Claude AI...")

    anthropic = get_anthropic_client()

    # Build the scoring prompt
    prompt = build_scoring_prompt(lead, brand_config)

    try:
        # Call Claude API
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20250131",
            max_tokens=1024,
            temperature=0.3,  # Lower temperature for more consistent scoring
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        # Extract the response text
        response_text = response.content[0].text.strip()

        # Parse JSON response
        try:
            result = json.loads(response_text)
        except json.JSONDecodeError:
            # Sometimes Claude wraps JSON in markdown code blocks
            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
                result = json.loads(response_text)
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()
                result = json.loads(response_text)
            else:
                raise

        # Validate required fields
        required_fields = ['qualification_score', 'qualified', 'scoring_breakdown', 'reasoning']
        missing_fields = [f for f in required_fields if f not in result]
        if missing_fields:
            raise ScoringError(f"Missing required fields in response: {missing_fields}")

        # Validate score is within range
        score = result['qualification_score']
        if not isinstance(score, (int, float)) or score < 0 or score > 100:
            raise ScoringError(f"Invalid qualification_score: {score} (must be 0-100)")

        # Ensure qualified boolean matches threshold
        threshold = brand_config['qualification_threshold']
        result['qualified'] = score >= threshold

        logger.info(f"✅ Scoring complete: {score}/100 (qualified: {result['qualified']})")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Claude response as JSON: {e}")
        logger.error(f"Response text: {response_text[:500]}")
        raise ScoringError(f"Claude returned invalid JSON: {e}")

    except Exception as e:
        logger.error(f"Claude API error: {e}")
        raise ScoringError(f"Failed to score lead with Claude: {e}")


def create_cqi_session(
    lead_id: str,
    brand: str,
    scoring_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create CQI session record in Supabase database.

    Args:
        lead_id: UUID of the lead
        brand: Brand identifier
        scoring_result: Results from Claude scoring

    Returns:
        dict: Created session record including session_id

    Raises:
        CQIError: If database insert fails
    """
    logger.info(f"Creating CQI session record...")

    supabase = get_supabase_client()

    # Prepare session data
    session_data = {
        'lead_id': lead_id,
        'brand': brand,
        'session_state': 'scored',  # Initial state after scoring
        'qualification_score': scoring_result['qualification_score'],
        'session_data': {
            'scoring_breakdown': scoring_result['scoring_breakdown'],
            'reasoning': scoring_result['reasoning'],
            'recommended_action': scoring_result.get('recommended_action', 'unknown'),
            'confidence_level': scoring_result.get('confidence_level', 'medium'),
            'scored_at': datetime.utcnow().isoformat(),
            'model_used': 'claude-3-5-sonnet-20250131'
        }
    }

    try:
        response = supabase.table('cqi_sessions').insert(session_data).execute()

        if not response.data or len(response.data) == 0:
            raise CQIError("Failed to create session - no data returned")

        session = response.data[0]
        logger.info(f"✅ CQI session created: {session['id']}")
        return session

    except Exception as e:
        logger.error(f"Database error creating session: {e}")
        raise CQIError(f"Failed to create CQI session: {e}")


def log_system_event(
    brand: str,
    event_type: str,
    event_data: Dict[str, Any],
    severity: str = 'info'
) -> None:
    """
    Log system event to database for monitoring and debugging.

    Args:
        brand: Brand identifier
        event_type: Type of event (e.g., 'cqi_session_created', 'lead_qualified')
        event_data: Event details
        severity: Event severity (info, warning, error)
    """
    supabase = get_supabase_client()

    try:
        supabase.table('system_events').insert({
            'brand': brand,
            'event_type': event_type,
            'event_data': event_data,
            'severity': severity
        }).execute()
    except Exception as e:
        # Don't fail the main operation if logging fails
        logger.warning(f"Failed to log system event: {e}")


def process_lead(lead_id: str, brand: str) -> Dict[str, Any]:
    """
    Main function to process a lead through the CQI workflow.

    This is the entry point for CQI Conductor agent execution.

    Workflow:
    1. Validate environment variables
    2. Fetch lead data from database
    3. Get brand-specific configuration
    4. Score lead using Claude AI
    5. Create CQI session record
    6. Log system event
    7. Return results

    Args:
        lead_id: UUID of the lead to process
        brand: Brand identifier (sotsvc, boss_of_clean, etc.)

    Returns:
        dict: Processing results including:
            - session_id (str): UUID of created CQI session
            - lead_id (str): UUID of the lead
            - brand (str): Brand identifier
            - qualification_score (int): Score 0-100
            - qualified (bool): Whether lead meets threshold
            - reasoning (str): Explanation from Claude
            - recommended_action (str): Next step
            - session_state (str): Current state of session

    Raises:
        CQIError: If any step in the process fails
    """
    logger.info(f"\n{'='*60}")
    logger.info(f"CQI CONDUCTOR - Processing Lead")
    logger.info(f"{'='*60}")
    logger.info(f"Lead ID: {lead_id}")
    logger.info(f"Brand: {brand}")
    logger.info(f"Started: {datetime.utcnow().isoformat()}")
    logger.info(f"{'='*60}\n")

    try:
        # Step 1: Validate environment
        validate_environment()

        # Step 2: Fetch lead data
        lead = fetch_lead_data(lead_id)

        # Step 3: Get brand configuration
        brand_config = get_brand_config(brand)
        logger.info(f"Qualification threshold: {brand_config['qualification_threshold']}")

        # Step 4: Score lead with Claude
        scoring_result = score_lead_with_claude(lead, brand_config)

        # Step 5: Create CQI session
        session = create_cqi_session(lead_id, brand, scoring_result)

        # Step 6: Log system event
        log_system_event(
            brand=brand,
            event_type='cqi_session_created',
            event_data={
                'session_id': session['id'],
                'lead_id': lead_id,
                'qualification_score': scoring_result['qualification_score'],
                'qualified': scoring_result['qualified']
            },
            severity='info'
        )

        # Step 7: Build result object
        result = {
            'success': True,
            'session_id': session['id'],
            'lead_id': lead_id,
            'brand': brand,
            'qualification_score': scoring_result['qualification_score'],
            'qualified': scoring_result['qualified'],
            'reasoning': scoring_result['reasoning'],
            'recommended_action': scoring_result.get('recommended_action', 'unknown'),
            'session_state': session['session_state'],
            'scoring_breakdown': scoring_result['scoring_breakdown']
        }

        logger.info(f"\n{'='*60}")
        logger.info(f"✅ CQI PROCESSING COMPLETE")
        logger.info(f"{'='*60}")
        logger.info(f"Session ID: {result['session_id']}")
        logger.info(f"Score: {result['qualification_score']}/100")
        logger.info(f"Qualified: {result['qualified']}")
        logger.info(f"Action: {result['recommended_action']}")
        logger.info(f"{'='*60}\n")

        return result

    except Exception as e:
        logger.error(f"\n{'='*60}")
        logger.error(f"❌ CQI PROCESSING FAILED")
        logger.error(f"{'='*60}")
        logger.error(f"Error: {e}")
        logger.error(f"{'='*60}\n")

        # Log error event
        try:
            log_system_event(
                brand=brand,
                event_type='cqi_processing_error',
                event_data={
                    'lead_id': lead_id,
                    'error': str(e)
                },
                severity='error'
            )
        except:
            pass  # Ignore logging errors

        raise


def main():
    """
    CLI entry point for CQI Conductor.

    Usage:
        python conductor.py --lead-id uuid-here --brand sotsvc
    """
    parser = argparse.ArgumentParser(
        description='CQI Conductor - Process leads through qualification workflow'
    )
    parser.add_argument(
        '--lead-id',
        required=True,
        help='UUID of the lead to process'
    )
    parser.add_argument(
        '--brand',
        required=True,
        choices=['sotsvc', 'boss_of_clean', 'beatslave', 'temple_builder'],
        help='Brand identifier'
    )
    parser.add_argument(
        '--output-json',
        action='store_true',
        help='Output results as JSON (useful for scripting)'
    )

    args = parser.parse_args()

    try:
        result = process_lead(
            lead_id=args.lead_id,
            brand=args.brand
        )

        if args.output_json:
            print(json.dumps(result, indent=2))
        else:
            print("\n" + "="*60)
            print("CQI PROCESSING RESULTS")
            print("="*60)
            print(f"Session ID:     {result['session_id']}")
            print(f"Lead ID:        {result['lead_id']}")
            print(f"Brand:          {result['brand']}")
            print(f"Score:          {result['qualification_score']}/100")
            print(f"Qualified:      {result['qualified']}")
            print(f"Action:         {result['recommended_action']}")
            print(f"State:          {result['session_state']}")
            print("-"*60)
            print("Reasoning:")
            print(result['reasoning'])
            print("="*60 + "\n")

        sys.exit(0)

    except Exception as e:
        print(f"\n❌ ERROR: {e}\n", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
