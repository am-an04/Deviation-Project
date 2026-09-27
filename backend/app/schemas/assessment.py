from pydantic import BaseModel, Field
from typing import List, Optional

class AssessmentRequest(BaseModel):
    source_document_reference: Optional[str] = None
    date_of_occurrence: Optional[str] = None
    site: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    detection_source: Optional[str] = None
    source: Optional[str] = None
    related_product: Optional[str] = None
    batch_number: Optional[str] = None
    description: Optional[str] = None
    immediate_action: Optional[str] = None

class RetrievedGuidanceItem(BaseModel):
    title: str = Field(description="Title of the retrieved guidance section")
    content: str = Field(description="Content excerpt of the retrieved guidance")

class AssessmentResponse(BaseModel):
    potential_impact: str = Field(description="Evaluation of potential product, GMP, patient, or compliance impact.")
    rule_candidate: Optional[str] = Field(default="Moderate", description="Deterministic severity rule candidate: Minor, Moderate, Major, or Critical")
    triggered_rules: List[str] = Field(default_factory=list, description="Specific deterministic rule conditions that were triggered.")
    retrieved_guidance: List[RetrievedGuidanceItem] = Field(default_factory=list, description="MVP Severity Assessment Guidance sections retrieved by RAG.")
    suggested_severity: str = Field(description="AI recommendation: Minor, Moderate, Major, Critical")
    reason: str = Field(description="Clear factual explanation for the suggested severity level based on evidence and guidance.")
    key_factors: List[str] = Field(default_factory=list, description="Bullet points of key risk factors considered.")
    assessment_status: str = Field(default="supported", description="Status such as 'supported', 'Needs Human Review', or 'partially_supported'.")
