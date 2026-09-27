from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import date, datetime

class ExtractedDeviationData(BaseModel):
    source_document_reference: Optional[str] = Field(default=None, description="Explicit document reference or report identifier (e.g. QMS-TEST-2026-021), or null if absent")
    date_of_occurrence: Optional[str] = Field(default=None, description="Date of occurrence normalized to YYYY-MM-DD or null")
    site: Optional[str] = Field(default=None, description="Manufacturing or testing site/facility, or null if absent")
    department: Optional[str] = Field(default=None, description="Department involved, or null if absent")
    title: Optional[str] = Field(default=None, description="Concise, factual title of the deviation, or null if absent")
    detection_source: Optional[str] = Field(default=None, description="Explicitly stated method, system, audit, or review that detected the deviation, or null if absent")
    related_product: Optional[str] = Field(default=None, description="Related product, intermediate, or material, or null")
    batch_number: Optional[str] = Field(default=None, description="Batch, lot, or equipment identifier, or null")
    description: Optional[str] = Field(default=None, description="Accurate factual summary preserving metrics and units, or null")
    immediate_action: Optional[str] = Field(default=None, description="Immediate containment actions explicitly documented, or null")

class FieldTraceability(BaseModel):
    value: Optional[str] = None
    source: str = "document"
    status: str = "Extracted"  # Extracted by AI, Edited by User, Not identified

class ExtractionResponse(BaseModel):
    success: bool
    extracted_text: str
    structured_data: ExtractedDeviationData
    traceability: Dict[str, FieldTraceability]
    message: Optional[str] = None

class DeviationCreate(BaseModel):
    source_document_reference: Optional[str] = None
    date_of_occurrence: Optional[str] = None
    site: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    detection_source: Optional[str] = None
    source: Optional[str] = None  # Backward compatibility
    related_product: Optional[str] = None
    batch_number: Optional[str] = None
    description: Optional[str] = None
    immediate_action: Optional[str] = None

    ai_potential_impact: Optional[str] = None
    ai_suggested_severity: Optional[str] = None
    ai_severity_reason: Optional[str] = None
    rule_candidate: Optional[str] = None
    assessment_status: Optional[str] = None

    final_severity: Optional[str] = None
    status: Optional[str] = "Submitted"
    source_filename: Optional[str] = None

class DeviationResponse(BaseModel):
    id: int
    deviation_id: str
    source_document_reference: Optional[str] = None
    date_of_occurrence: Optional[date] = None
    site: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    detection_source: Optional[str] = None
    source: Optional[str] = None
    related_product: Optional[str] = None
    batch_number: Optional[str] = None
    description: Optional[str] = None
    immediate_action: Optional[str] = None

    ai_potential_impact: Optional[str] = None
    ai_suggested_severity: Optional[str] = None
    ai_severity_reason: Optional[str] = None
    rule_candidate: Optional[str] = None
    assessment_status: Optional[str] = None

    final_severity: Optional[str] = None
    status: str
    source_filename: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DeviationListResponse(BaseModel):
    items: List[DeviationResponse]
    total: int
