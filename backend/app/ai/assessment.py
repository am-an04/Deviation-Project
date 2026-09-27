import json
import logging
from typing import Dict, Any, List, Optional
from groq import Groq
from app.config import settings
from app.schemas.assessment import AssessmentResponse

logger = logging.getLogger("qms.ai.assessment")

EVIDENCE_SYSTEM_PROMPT = """You are an evidence extraction assistant for a Quality Management System.
Analyze the reviewed deviation information and extract structured factual evidence.

Rules:
1. Do NOT invent evidence.
2. If evidence for a field is not explicitly present or cannot be determined from the facts, return null.
3. Do not infer patient safety impact unless explicitly stated or indicated by lethal/contamination data.
4. Preserve numerical metrics, duration, and magnitude accurately.

You must respond ONLY with a valid JSON object matching this schema:
{
    "parameter_deviation_present": boolean or null,
    "deviation_magnitude": string or null,
    "duration": string or null,
    "batch_affected": boolean or null,
    "product_impact_confirmed": boolean or null,
    "potential_product_impact": boolean or null,
    "batch_on_hold": boolean or null,
    "containment_taken": boolean or null,
    "patient_safety_impact_identified": boolean or null,
    "compliance_impact_identified": boolean or null
}
"""

ASSESSMENT_SYSTEM_PROMPT = """You are assisting a Quality professional with an initial deviation impact assessment.

Use ONLY:
1. The reviewed deviation information.
2. The structured evidence extracted from it.
3. The retrieved MVP Severity Assessment Guidance.

Do not invent facts.

The retrieved guidance is decision-support material for this application and is not necessarily an official regulatory standard.

Provide:
- potential impact
- suggested severity (Minor, Moderate, Major, or Critical)
- reason
- key factors

Consider the deterministic severity-rule candidate as an additional guardrail.

If evidence is insufficient, explicitly state that more information is required.

This is an AI recommendation, not a final Quality decision.

The final severity must be determined by the human reviewer.

You must respond ONLY with a valid JSON object matching this schema:
{
    "potential_impact": "String detailing potential impact on product quality, process, or safety.",
    "suggested_severity": "Minor" | "Moderate" | "Major" | "Critical",
    "reason": "Clear factual explanation for the suggested severity level based on evidence and guidance.",
    "key_factors": [
        "First key factor considered",
        "Second key factor considered"
    ]
}
"""

def fallback_extract_evidence(data: Dict[str, Any]) -> Dict[str, Any]:
    """Deterministic fallback evidence extractor when Groq API is offline."""
    text = (
        f"{data.get('title', '')} {data.get('description', '')} "
        f"{data.get('immediate_action', '')}"
    ).lower()

    # Parameter deviation
    param_present = any(k in text for k in ["excursion", "exceeded", "drift", "dropped", "failure", "decay", "temperature", "pressure", "duration", "limit"])
    
    # Hold / quarantine
    on_hold = any(k in text for k in ["hold", "quarantine", "segregated", "isolated", "paused", "halted"])
    
    # Containment
    containment = any(k in text for k in ["containment", "quarantine", "stopped", "paused", "held", "inspected", "lockout"])
    
    # Product confirmed impact
    product_confirmed = any(k in text for k in ["degradation confirmed", "product destroyed", "batch rejected", "out of specification", "failed cqa"])
    
    # Potential product impact
    potential_product = any(k in text for k in ["potential impact", "may affect", "risk of", "uniformity", "sterility", "impurity", "quality risk"])
    if param_present and not product_confirmed:
        potential_product = True

    # Patient safety
    patient_safety = any(k in text for k in ["adverse event", "patient injury", "harm", "toxic", "lethal", "pathogen"])

    # Batch affected
    batch_affected = bool(data.get("batch_number")) or "batch" in text or "lot" in text

    return {
        "parameter_deviation_present": param_present if param_present else None,
        "deviation_magnitude": None,
        "duration": None,
        "batch_affected": batch_affected,
        "product_impact_confirmed": True if product_confirmed else False,
        "potential_product_impact": potential_product,
        "batch_on_hold": on_hold,
        "containment_taken": containment,
        "patient_safety_impact_identified": patient_safety,
        "compliance_impact_identified": False
    }

def run_evidence_extraction(deviation_data: Dict[str, Any]) -> Dict[str, Any]:
    """Runs evidence extraction via Groq LLM or deterministic fallback."""
    api_key = settings.GROQ_API_KEY.strip() if settings.GROQ_API_KEY else ""
    if not api_key:
        return fallback_extract_evidence(deviation_data)

    try:
        client = Groq(api_key=api_key)
        user_content = f"Reviewed Deviation Information:\n{json.dumps(deviation_data, indent=2)}"
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": EVIDENCE_SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.warning(f"Groq evidence extraction failed ({e}); using deterministic fallback.")
        return fallback_extract_evidence(deviation_data)

def fallback_assessment(
    deviation_data: Dict[str, Any],
    retrieved_guidance: List[Dict[str, str]],
    evidence: Dict[str, Any],
    rule_results: Dict[str, Any]
) -> Dict[str, Any]:
    """Deterministic fallback assessment incorporating RAG guidance and rule candidate."""
    rule_candidate = rule_results.get("rule_candidate", "Moderate")
    triggered_rules = rule_results.get("triggered_rules", [])

    return {
        "potential_impact": f"Evaluated based on MVP Severity Assessment Guidance. Parameter deviation evaluated with rule candidate '{rule_candidate}'.",
        "rule_candidate": rule_candidate,
        "triggered_rules": triggered_rules,
        "retrieved_guidance": retrieved_guidance,
        "suggested_severity": rule_candidate,
        "reason": f"Deterministic rule analysis triggered: {'; '.join(triggered_rules[:2]) if triggered_rules else 'Standard process review'}.",
        "key_factors": triggered_rules if triggered_rules else ["Deviation logged under MVP decision-support rules"],
        "assessment_status": "supported"
    }

def run_assessment_llm(
    deviation_data: Dict[str, Any],
    retrieved_guidance: List[Dict[str, str]],
    evidence: Dict[str, Any],
    rule_results: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Runs full RAG + Rules + LLM Impact Assessment via Groq or fallback.
    """
    rule_candidate = rule_results.get("rule_candidate", "Moderate")
    triggered_rules = rule_results.get("triggered_rules", [])

    api_key = settings.GROQ_API_KEY.strip() if settings.GROQ_API_KEY else ""
    if not api_key:
        logger.info("GROQ_API_KEY not configured. Using deterministic assessment fallback.")
        return fallback_assessment(deviation_data, retrieved_guidance, evidence, rule_results)

    try:
        client = Groq(api_key=api_key)

        guidance_text = ""
        for idx, g in enumerate(retrieved_guidance, start=1):
            guidance_text += f"\n--- GUIDANCE SECTION {idx}: {g.get('title')} ---\n{g.get('content')}\n"

        user_content = f"""REVIEWED DEVIATION:
{json.dumps(deviation_data, indent=2)}

STRUCTURED EVIDENCE EXTRACTED:
{json.dumps(evidence, indent=2)}

RETRIEVED MVP SEVERITY ASSESSMENT GUIDANCE:
{guidance_text if guidance_text else "No specific guidance retrieved; evaluate against standard decision support."}

DETERMINISTIC SEVERITY-RULE CANDIDATE:
Candidate: {rule_candidate}
Triggered Rules: {json.dumps(triggered_rules)}
Rule Confidence: {rule_results.get('rule_confidence', 'supported')}
"""

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": ASSESSMENT_SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = response.choices[0].message.content
        raw_dict = json.loads(content)

        suggested_sev = raw_dict.get("suggested_severity", rule_candidate)
        # Normalize severity title
        if suggested_sev.capitalize() in ["Minor", "Moderate", "Major", "Critical"]:
            suggested_sev = suggested_sev.capitalize()
        else:
            suggested_sev = rule_candidate

        # Conflict Detection (Requirement 11)
        if rule_candidate != suggested_sev:
            assessment_status = "Needs Human Review"
            conflict_note = (
                f"\n\n[Note: The deterministic assessment indicates {rule_candidate}, "
                f"while the AI assessment recommends {suggested_sev} based on retrieved guidance. "
                f"Human review is required.]"
            )
            reason = raw_dict.get("reason", "") + conflict_note
        else:
            assessment_status = "supported"
            reason = raw_dict.get("reason", "")

        return {
            "potential_impact": raw_dict.get("potential_impact", "Evaluated based on reviewed facts and guidance."),
            "rule_candidate": rule_candidate,
            "triggered_rules": triggered_rules,
            "retrieved_guidance": retrieved_guidance,
            "suggested_severity": suggested_sev,
            "reason": reason,
            "key_factors": raw_dict.get("key_factors", triggered_rules),
            "assessment_status": assessment_status
        }

    except Exception as e:
        logger.error(f"Groq assessment failed ({e}). Falling back to deterministic assessment.", exc_info=True)
        return fallback_assessment(deviation_data, retrieved_guidance, evidence, rule_results)
