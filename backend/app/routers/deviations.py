import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.services.pdf_service import PDFService
from app.services.deviation_service import DeviationService
from app.ai.graph import extraction_graph, assessment_graph
from app.schemas.deviation import (
    ExtractionResponse,
    ExtractedDeviationData,
    FieldTraceability,
    DeviationCreate,
    DeviationResponse,
    DeviationListResponse,
)
from app.schemas.assessment import AssessmentRequest, AssessmentResponse

logger = logging.getLogger("qms.routers.deviations")
router = APIRouter(prefix="/api/deviations", tags=["Deviations"])


@router.post(
    "/extract",
    response_model=ExtractionResponse,
    summary="Extract structured deviation data from uploaded PDF",
    description="Extracts raw text via PyMuPDF and processes it through the LangGraph AI extraction graph."
)
async def extract_deviation_from_pdf(
    file: UploadFile = File(..., description="PDF deviation report")
):
    try:
        # Step 1 & 2: Extract text from PDF
        extracted_text = await PDFService.extract_text_from_upload(
            file, max_size_mb=settings.MAX_FILE_SIZE_MB
        )

        # Step 3: Run through LangGraph extraction workflow
        initial_state = {"raw_text": extracted_text}
        result = extraction_graph.invoke(initial_state)

        if result.get("error"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result["error"]
            )

        extracted_dict = result.get("extracted_dict", {})
        traceability_dict = result.get("traceability", {})

        # Ensure traceability models are properly structured
        traceability_models = {
            k: FieldTraceability(**v) for k, v in traceability_dict.items()
        }

        return ExtractionResponse(
            success=True,
            extracted_text=extracted_text,
            structured_data=ExtractedDeviationData(**extracted_dict),
            traceability=traceability_models,
            message="Document text extracted and parsed successfully."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during PDF deviation extraction: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during deviation analysis: {str(e)}"
        )

@router.post(
    "/assess",
    response_model=AssessmentResponse,
    summary="Run AI Impact and Severity Assessment",
    description="Evaluates human-reviewed deviation parameters through the LangGraph assessment workflow to recommend severity and impact."
)
async def assess_deviation_impact(payload: AssessmentRequest):
    try:
        initial_state = {"deviation_data": payload.model_dump()}
        result = assessment_graph.invoke(initial_state)

        if result.get("error"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result["error"]
            )

        assessment_dict = result.get("assessment_dict", {})
        return AssessmentResponse(**assessment_dict)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during impact assessment: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate impact assessment: {str(e)}"
        )

@router.post(
    "",
    response_model=DeviationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save Final Reviewed Deviation",
    description="Persists reviewed deviation record and human-confirmed severity into PostgreSQL database."
)
def create_deviation_record(
    payload: DeviationCreate,
    db: Session = Depends(get_db)
):
    try:
        saved_record = DeviationService.create_deviation(db, payload)
        return saved_record
    except Exception as e:
        logger.error(f"Database error while saving deviation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save deviation to database: {str(e)}"
        )

@router.get(
    "",
    response_model=DeviationListResponse,
    summary="List Deviations",
    description="Retrieves deviation records with optional search, status, and severity filters."
)
def list_deviations(
    search: Optional[str] = Query(None, description="Search term for ID, title, product, batch, etc."),
    status: Optional[str] = Query(None, description="Filter by status (e.g. Submitted, Under Review, Draft)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Minor, Moderate, Major, Critical)"),
    db: Session = Depends(get_db)
):
    items = DeviationService.get_deviations(db, search=search, status=status, severity=severity)
    return DeviationListResponse(items=items, total=len(items))

@router.get(
    "/{deviation_id}",
    response_model=DeviationResponse,
    summary="Get Deviation Details",
    description="Retrieves a single deviation record by its deviation ID (e.g. DEV-0001)."
)
def get_deviation_detail(
    deviation_id: str,
    db: Session = Depends(get_db)
):
    record = DeviationService.get_deviation_by_id(db, deviation_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deviation record '{deviation_id}' not found."
        )
    return record
