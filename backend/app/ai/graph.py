import logging
from typing import Dict, Any, List
from langgraph.graph import StateGraph, START, END
from app.ai.state import ExtractionState, AssessmentState
from app.ai.extraction import run_extraction_llm
from app.ai.assessment import run_assessment_llm, run_evidence_extraction
from app.ai.severity_rules import evaluate_severity_rules
from app.ai.rag import retrieve_guidance
from app.schemas.deviation import ExtractedDeviationData
from app.schemas.assessment import AssessmentResponse

logger = logging.getLogger("qms.ai.graph")

# ==============================================================
# Extraction Workflow Graph
# ==============================================================

def validate_input(state: ExtractionState) -> Dict[str, Any]:
    raw_text = state.get("raw_text", "")
    if not raw_text or not raw_text.strip():
        logger.error("validate_input: Raw text is empty")
        return {"error": "Input document contains no extractable text", "success": False}
    return {"validated_text": raw_text.strip(), "success": True}

def extract_document_text(state: ExtractionState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    return {"validated_text": state["validated_text"]}

def llm_extract(state: ExtractionState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    text = state["validated_text"]
    try:
        extracted_data, traceability = run_extraction_llm(text)
        return {
            "extracted_dict": extracted_data,
            "traceability": traceability,
            "success": True
        }
    except Exception as e:
        logger.error(f"llm_extract error: {e}", exc_info=True)
        return {"error": f"LLM extraction failed: {str(e)}", "success": False}

def validate_structured_output(state: ExtractionState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    extracted = state.get("extracted_dict", {})
    try:
        validated = ExtractedDeviationData(**extracted)
        return {"extracted_dict": validated.model_dump(), "success": True}
    except Exception as e:
        logger.warning(f"Schema validation warning: {e}")
        return {"extracted_dict": extracted, "success": True}

def return_result(state: ExtractionState) -> Dict[str, Any]:
    return {"success": not bool(state.get("error"))}

extraction_builder = StateGraph(ExtractionState)
extraction_builder.add_node("validate_input", validate_input)
extraction_builder.add_node("extract_document_text", extract_document_text)
extraction_builder.add_node("llm_extract", llm_extract)
extraction_builder.add_node("validate_structured_output", validate_structured_output)
extraction_builder.add_node("return_result", return_result)

extraction_builder.add_edge(START, "validate_input")
extraction_builder.add_edge("validate_input", "extract_document_text")
extraction_builder.add_edge("extract_document_text", "llm_extract")
extraction_builder.add_edge("llm_extract", "validate_structured_output")
extraction_builder.add_edge("validate_structured_output", "return_result")
extraction_builder.add_edge("return_result", END)

extraction_graph = extraction_builder.compile()


# ==============================================================
# RAG + Rules + LLM Assessment Workflow Graph
# ==============================================================

def validate_deviation(state: AssessmentState) -> Dict[str, Any]:
    dev_data = state.get("deviation_data", {})
    if not dev_data:
        return {"error": "No deviation data provided for assessment", "success": False}
    return {"validated_data": dev_data, "success": True}

def extract_evidence(state: AssessmentState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    data = state["validated_data"]
    try:
        evidence = run_evidence_extraction(data)
        logger.info(f"Extracted structured evidence: {evidence}")
        return {"extracted_evidence": evidence}
    except Exception as e:
        logger.warning(f"Evidence extraction error: {e}")
        return {"extracted_evidence": {}}

def retrieve_guidance_node(state: AssessmentState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    data = state["validated_data"]
    evidence = state.get("extracted_evidence", {})

    # Construct concise, relevant query from reviewed deviation
    title = data.get("title") or ""
    desc = data.get("description") or ""
    act = data.get("immediate_action") or ""
    prod = data.get("related_product") or ""
    dept = data.get("department") or ""

    query = f"{title}. {desc}. {act}. Product: {prod}. Dept: {dept}"
    if evidence.get("deviation_magnitude"):
        query += f" Magnitude: {evidence['deviation_magnitude']}"

    try:
        guidance = retrieve_guidance(query=query, top_k=3)
        logger.info(f"RAG retrieved {len(guidance)} guidance sections.")
        return {"retrieved_guidance": guidance}
    except Exception as e:
        logger.warning(f"Guidance retrieval error: {e}")
        return {"retrieved_guidance": []}

def apply_severity_rules(state: AssessmentState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    data = state["validated_data"]
    evidence = state.get("extracted_evidence", {})

    try:
        rule_results = evaluate_severity_rules(evidence, data)
        logger.info(f"Deterministic rules candidate: {rule_results.get('rule_candidate')}")
        return {"rule_results": rule_results}
    except Exception as e:
        logger.warning(f"Severity rules error: {e}")
        return {"rule_results": {
            "rule_candidate": "Moderate",
            "triggered_rules": ["General deviation review"],
            "rule_confidence": "partially_supported"
        }}

def llm_assess_impact(state: AssessmentState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    data = state["validated_data"]
    evidence = state.get("extracted_evidence", {})
    guidance = state.get("retrieved_guidance", [])
    rule_results = state.get("rule_results", {})

    try:
        assessment = run_assessment_llm(data, guidance, evidence, rule_results)
        return {"assessment_dict": assessment, "success": True}
    except Exception as e:
        logger.error(f"llm_assess_impact error: {e}", exc_info=True)
        return {"error": f"Impact assessment failed: {str(e)}", "success": False}

def compare_rule_and_llm_assessment(state: AssessmentState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    assessment = state.get("assessment_dict", {})
    rule_results = state.get("rule_results", {})
    rule_candidate = rule_results.get("rule_candidate", "Moderate")
    suggested_sev = assessment.get("suggested_severity", rule_candidate)

    if rule_candidate != suggested_sev:
        assessment["assessment_status"] = "Needs Human Review"
    else:
        assessment["assessment_status"] = "supported"

    return {"assessment_dict": assessment}

def validate_assessment(state: AssessmentState) -> Dict[str, Any]:
    if state.get("error"):
        return {}
    assessment = state.get("assessment_dict", {})
    try:
        validated = AssessmentResponse(**assessment)
        return {"assessment_dict": validated.model_dump(), "success": True}
    except Exception as e:
        logger.warning(f"Assessment schema validation warning: {e}")
        return {"assessment_dict": assessment, "success": True}

def return_assessment(state: AssessmentState) -> Dict[str, Any]:
    return {"success": not bool(state.get("error"))}

# Compile LangGraph Assessment Workflow
# START -> validate_deviation -> extract_evidence -> retrieve_guidance -> apply_severity_rules -> llm_assess_impact -> compare_rule_and_llm_assessment -> validate_assessment -> return_assessment -> END
assessment_builder = StateGraph(AssessmentState)
assessment_builder.add_node("validate_deviation", validate_deviation)
assessment_builder.add_node("extract_evidence", extract_evidence)
assessment_builder.add_node("retrieve_guidance", retrieve_guidance_node)
assessment_builder.add_node("apply_severity_rules", apply_severity_rules)
assessment_builder.add_node("llm_assess_impact", llm_assess_impact)
assessment_builder.add_node("compare_rule_and_llm_assessment", compare_rule_and_llm_assessment)
assessment_builder.add_node("validate_assessment", validate_assessment)
assessment_builder.add_node("return_assessment", return_assessment)

assessment_builder.add_edge(START, "validate_deviation")
assessment_builder.add_edge("validate_deviation", "extract_evidence")
assessment_builder.add_edge("extract_evidence", "retrieve_guidance")
assessment_builder.add_edge("retrieve_guidance", "apply_severity_rules")
assessment_builder.add_edge("apply_severity_rules", "llm_assess_impact")
assessment_builder.add_edge("llm_assess_impact", "compare_rule_and_llm_assessment")
assessment_builder.add_edge("compare_rule_and_llm_assessment", "validate_assessment")
assessment_builder.add_edge("validate_assessment", "return_assessment")
assessment_builder.add_edge("return_assessment", END)

assessment_graph = assessment_builder.compile()
