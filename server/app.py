"""
AI Command Lab - FastAPI Server
Multi-brand automation platform with CQI (Client Qualification Interview) system
"""

import os
import sys
import logging
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field

# Add the agents-core/runtime directory to Python path
# This allows importing conductor and clients modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents-core', 'runtime'))

# Import CQI conductor (will be available after runtime files are in place)
try:
    from conductor import process_lead
    CQI_AVAILABLE = True
except ImportError as e:
    logging.warning(f"CQI conductor not available: {e}")
    CQI_AVAILABLE = False

# Import Supabase client
try:
    from clients import get_supabase_client
    SUPABASE_AVAILABLE = True
except ImportError:
    logging.warning("Supabase client not available")
    SUPABASE_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI Command Lab API",
    description="Multi-brand automation platform with CQI system",
    version="1.0.0"
)

# CORS configuration
# Add your production domains here
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://*.netlify.app",
    "https://sotsvc.com",
    "https://www.sotsvc.com",
    "https://bossofclean.com",
    "https://www.bossofclean.com",
    "https://beatslave.com",
    "https://www.beatslave.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================================================================
# REQUEST/RESPONSE MODELS
# ================================================================

class LeadRequest(BaseModel):
    """Request model for creating a new lead"""
    name: str = Field(..., min_length=1, max_length=200, description="Lead's full name")
    email: EmailStr = Field(..., description="Lead's email address")
    phone: Optional[str] = Field(None, max_length=50, description="Lead's phone number")
    message: Optional[str] = Field(None, max_length=5000, description="Lead's message or inquiry")
    brand: str = Field(default="sotsvc", description="Brand identifier (sotsvc, boss_of_clean, beatslave, temple_builder)")
    source: Optional[str] = Field(default="website_contact_form", description="Lead source (e.g., website, referral, ad)")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "407-555-0100",
                "message": "I need a deep cleaning for my 3-bedroom house",
                "brand": "sotsvc",
                "source": "website_contact_form"
            }
        }


class LeadResponse(BaseModel):
    """Response model for lead creation"""
    success: bool
    lead_id: str
    session_id: Optional[str] = None
    qualification_score: Optional[int] = None
    qualified: Optional[bool] = None
    message: str


class CQISessionResponse(BaseModel):
    """Response model for CQI session details"""
    session_id: str
    lead_id: str
    brand: str
    qualification_score: int
    qualified: bool
    reasoning: str
    recommended_action: str
    session_state: str


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    timestamp: str
    services: dict


# ================================================================
# HEALTH CHECK ENDPOINTS
# ================================================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """
    Health check endpoint - verify API is running and services are available.

    Returns:
        HealthResponse: Status of API and connected services
    """
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "operational",
            "cqi_conductor": "operational" if CQI_AVAILABLE else "unavailable",
            "supabase": "operational" if SUPABASE_AVAILABLE else "unavailable"
        }
    }


@app.get("/hello", tags=["Health"])
def hello():
    """Simple hello endpoint for testing"""
    return {
        "message": "Hello from AI Command Lab API",
        "timestamp": datetime.utcnow().isoformat()
    }


# ================================================================
# LEAD MANAGEMENT ENDPOINTS
# ================================================================

@app.post("/lead", response_model=LeadResponse, tags=["Leads"])
async def create_lead_basic(lead: LeadRequest):
    """
    Create a new lead (basic version - no CQI processing).

    This endpoint:
    1. Validates lead data
    2. Saves lead to Supabase
    3. Returns lead_id

    For CQI processing, use POST /api/lead instead.

    Args:
        lead: Lead information

    Returns:
        LeadResponse: Created lead details
    """
    logger.info(f"Received lead: {lead.name} ({lead.brand})")

    if not SUPABASE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable"
        )

    try:
        # Get Supabase client
        supabase = get_supabase_client()

        # Prepare lead data
        lead_data = {
            'name': lead.name,
            'email': lead.email,
            'phone': lead.phone,
            'message': lead.message,
            'brand': lead.brand,
            'source': lead.source or 'website_contact_form'
        }

        # Insert lead into database
        response = supabase.table('leads').insert(lead_data).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to create lead - no data returned"
            )

        created_lead = response.data[0]
        lead_id = created_lead['id']

        logger.info(f"✅ Lead created: {lead_id}")

        return LeadResponse(
            success=True,
            lead_id=lead_id,
            message="Lead created successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating lead: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create lead: {str(e)}"
        )


@app.post("/api/lead", response_model=LeadResponse, tags=["Leads", "CQI"])
async def create_lead_with_cqi(lead: LeadRequest, background_tasks: BackgroundTasks):
    """
    Create a new lead and process through CQI (Client Qualification Interview).

    This endpoint:
    1. Validates lead data
    2. Saves lead to Supabase
    3. Triggers CQI Conductor agent (uses Claude AI)
    4. Returns lead_id, session_id, and qualification results

    The CQI processing uses Claude AI to analyze the lead and assign
    a qualification score from 0-100 based on brand-specific criteria.

    Args:
        lead: Lead information
        background_tasks: FastAPI background tasks (for async processing)

    Returns:
        LeadResponse: Created lead and CQI session details

    Example Response:
        {
            "success": true,
            "lead_id": "uuid-here",
            "session_id": "uuid-here",
            "qualification_score": 75,
            "qualified": true,
            "message": "Lead qualified - recommended for trial booking"
        }
    """
    logger.info(f"Received lead with CQI: {lead.name} ({lead.brand})")

    if not SUPABASE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable"
        )

    if not CQI_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="CQI system unavailable - use POST /lead for basic lead creation"
        )

    try:
        # Step 1: Create lead in database
        supabase = get_supabase_client()

        lead_data = {
            'name': lead.name,
            'email': lead.email,
            'phone': lead.phone,
            'message': lead.message,
            'brand': lead.brand,
            'source': lead.source or 'website_contact_form'
        }

        response = supabase.table('leads').insert(lead_data).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=500,
                detail="Failed to create lead - no data returned"
            )

        created_lead = response.data[0]
        lead_id = created_lead['id']

        logger.info(f"✅ Lead created: {lead_id}")

        # Step 2: Process through CQI Conductor
        try:
            cqi_result = process_lead(lead_id=lead_id, brand=lead.brand)

            # Build success message based on qualification
            if cqi_result['qualified']:
                message = f"Lead qualified with score {cqi_result['qualification_score']}/100 - recommended for {cqi_result['recommended_action']}"
            else:
                message = f"Lead scored {cqi_result['qualification_score']}/100 - below qualification threshold"

            return LeadResponse(
                success=True,
                lead_id=lead_id,
                session_id=cqi_result['session_id'],
                qualification_score=cqi_result['qualification_score'],
                qualified=cqi_result['qualified'],
                message=message
            )

        except Exception as e:
            logger.error(f"CQI processing failed: {e}")
            # Return lead_id even if CQI fails
            return LeadResponse(
                success=True,
                lead_id=lead_id,
                message=f"Lead created but CQI processing failed: {str(e)}"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating lead: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create lead: {str(e)}"
        )


@app.get("/api/cqi/session/{session_id}", response_model=CQISessionResponse, tags=["CQI"])
def get_cqi_session(session_id: str):
    """
    Get CQI session details by session ID.

    Args:
        session_id: UUID of the CQI session

    Returns:
        CQISessionResponse: Full session details including score and reasoning
    """
    if not SUPABASE_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable"
        )

    try:
        supabase = get_supabase_client()

        response = supabase.table('cqi_sessions').select('*').eq('id', session_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=404,
                detail=f"CQI session not found: {session_id}"
            )

        session = response.data[0]
        session_data = session.get('session_data', {})

        return CQISessionResponse(
            session_id=session['id'],
            lead_id=session['lead_id'],
            brand=session['brand'],
            qualification_score=session['qualification_score'],
            qualified=session['qualification_score'] >= 70,  # Default threshold
            reasoning=session_data.get('reasoning', 'No reasoning available'),
            recommended_action=session_data.get('recommended_action', 'unknown'),
            session_state=session['session_state']
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching CQI session: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch CQI session: {str(e)}"
        )


# ================================================================
# ERROR HANDLERS
# ================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom error handler for HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Custom error handler for unhandled exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


# ================================================================
# STARTUP/SHUTDOWN EVENTS
# ================================================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("="*60)
    logger.info("AI Command Lab API - Starting Up")
    logger.info("="*60)
    logger.info(f"CQI Conductor: {'✅ Available' if CQI_AVAILABLE else '❌ Unavailable'}")
    logger.info(f"Supabase Client: {'✅ Available' if SUPABASE_AVAILABLE else '❌ Unavailable'}")
    logger.info("="*60)


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("AI Command Lab API - Shutting Down")


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
