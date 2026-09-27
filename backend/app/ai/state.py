from typing import TypedDict, Optional, Dict, Any, List

class ExtractionState(TypedDict, total=False):
    raw_text: str
    validated_text: str
    extracted_dict: Optional[Dict[str, Any]]
    traceability: Optional[Dict[str, Dict[str, Any]]]
    error: Optional[str]
    success: bool

class AssessmentState(TypedDict, total=False):
    deviation_data: Dict[str, Any]
    validated_data: Dict[str, Any]
    extracted_evidence: Optional[Dict[str, Any]]
    retrieved_guidance: Optional[List[Dict[str, str]]]
    rule_results: Optional[Dict[str, Any]]
    assessment_dict: Optional[Dict[str, Any]]
    error: Optional[str]
    success: bool
