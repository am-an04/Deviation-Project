import logging
from typing import Dict, Any, List

logger = logging.getLogger("qms.ai.severity_rules")

def evaluate_severity_rules(evidence: Dict[str, Any], deviation_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic Severity Rules Engine for MVP decision support.
    
    Evaluates structured evidence extracted from the reviewed deviation.
    Does NOT use crude keyword matching.
    Produces:
      - rule_candidate ("Minor" | "Moderate" | "Major" | "Critical")
      - triggered_rules: List[str]
      - rule_confidence: "supported" | "partially_supported" | "insufficient_evidence"
    """
    triggered_rules: List[str] = []
    
    # Read structured evidence
    patient_safety = evidence.get("patient_safety_impact_identified")
    product_confirmed = evidence.get("product_impact_confirmed")
    product_potential = evidence.get("potential_product_impact")
    param_deviation = evidence.get("parameter_deviation_present")
    batch_on_hold = evidence.get("batch_on_hold")
    containment_taken = evidence.get("containment_taken")
    batch_affected = evidence.get("batch_affected")
    compliance_impact = evidence.get("compliance_impact_identified")
    magnitude = evidence.get("deviation_magnitude")
    duration = evidence.get("duration")

    # Assess completeness of evidence
    known_values = [v for v in [patient_safety, product_confirmed, product_potential, param_deviation, batch_on_hold, containment_taken] if v is not None]
    if len(known_values) < 2:
        return {
            "rule_candidate": "Moderate",
            "triggered_rules": ["Insufficient structured evidence available to trigger definitive deterministic rule"],
            "rule_confidence": "insufficient_evidence"
        }

    # 1. CRITICAL CANDIDATE CHECK
    # IF credible evidence indicates serious patient-safety impact OR confirmed serious product quality defect
    if patient_safety is True:
        triggered_rules.append("Credible evidence indicates potential or direct patient safety impact")
        return {
            "rule_candidate": "Critical",
            "triggered_rules": triggered_rules,
            "rule_confidence": "supported"
        }

    if product_confirmed is True and product_potential is True and containment_taken is False:
        triggered_rules.append("Confirmed product quality impact with uncontained distribution or material flow")
        return {
            "rule_candidate": "Critical",
            "triggered_rules": triggered_rules,
            "rule_confidence": "supported"
        }

    # 2. MAJOR CANDIDATE CHECK
    # IF significant product/process impact identified OR broad batch impact OR significant quality/compliance concern
    major_conditions: List[str] = []
    if product_confirmed is True:
        major_conditions.append("Direct product quality or intermediate attribute impact confirmed")
    if compliance_impact is True:
        major_conditions.append("Significant regulatory or compliance commitment impact identified")
    if product_potential is True and batch_on_hold is False and containment_taken is False:
        major_conditions.append("Potential product quality impact without verified hold or containment")

    if major_conditions:
        triggered_rules.extend(major_conditions)
        return {
            "rule_candidate": "Major",
            "triggered_rules": triggered_rules,
            "rule_confidence": "supported"
        }

    # 3. MODERATE CANDIDATE CHECK
    # IF meaningful process/parameter deviation requires investigation AND effectively held/contained
    # AND no critical or major condition is supported
    moderate_conditions: List[str] = []
    if param_deviation is True:
        desc_mag = f" (magnitude: {magnitude})" if magnitude else ""
        desc_dur = f" for duration: {duration}" if duration else ""
        moderate_conditions.append(f"Operating parameter deviation outside validated target{desc_mag}{desc_dur}")
    
    if batch_on_hold is True:
        moderate_conditions.append("Material/batch placed on quarantine hold mitigating immediate release risk")
    elif containment_taken is True:
        moderate_conditions.append("Immediate physical or operational containment measures enacted on shift")

    if product_confirmed is False:
        moderate_conditions.append("No confirmed direct product degradation or defect identified in documented evidence")

    if moderate_conditions and (param_deviation is True or product_potential is True or batch_affected is True):
        triggered_rules.extend(moderate_conditions)
        return {
            "rule_candidate": "Moderate",
            "triggered_rules": triggered_rules,
            "rule_confidence": "supported" if len(moderate_conditions) >= 2 else "partially_supported"
        }

    # 4. MINOR CANDIDATE CHECK
    # IF deviation has limited impact, no significant product/process risk, and is effectively contained
    minor_conditions: List[str] = []
    if param_deviation is False:
        minor_conditions.append("No operating parameter excursion outside proven acceptable boundaries")
    if product_confirmed is False and product_potential is False:
        minor_conditions.append("No identified potential or confirmed product quality impact")
    if containment_taken is True:
        minor_conditions.append("Event promptly contained or corrected with no residual operational impact")

    if minor_conditions and len(minor_conditions) >= 2:
        triggered_rules.extend(minor_conditions)
        return {
            "rule_candidate": "Minor",
            "triggered_rules": triggered_rules,
            "rule_confidence": "supported"
        }

    # Default fallback if intermediate
    triggered_rules.append("Process deviation documented with routine review required")
    if batch_on_hold is True:
        triggered_rules.append("Batch placed on hold")
    return {
        "rule_candidate": "Moderate",
        "triggered_rules": triggered_rules,
        "rule_confidence": "partially_supported"
    }
