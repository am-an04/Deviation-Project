import json
import logging
import re
from typing import Dict, Any, Tuple
from groq import Groq
from app.config import settings
from app.schemas.deviation import ExtractedDeviationData

logger = logging.getLogger("qms.ai.extraction")

EXTRACTION_SYSTEM_PROMPT = """You are an information extraction assistant for a Quality Management System.

Extract only information explicitly supported by the supplied document.

Never invent, guess, or infer missing information.

If a field is not explicitly present, return null.

A document reference, report number, or reference identifier must be extracted into source_document_reference. It must NOT be treated as detection_source unless the document explicitly states that it represents the detection source.

Detection source means the explicitly stated method, system, process, person, review, inspection, monitoring system, or other mechanism through which the deviation was detected.

Do not use filenames, document references, department names, batch numbers, or document types as detection sources unless the document explicitly identifies them as such.

The application-generated deviation ID is NOT extracted from the document.

Preserve measurements, units, dates, batch numbers, products, and actions accurately.

You must respond ONLY with a valid JSON object matching this schema:
{
    "source_document_reference": string or null,
    "date_of_occurrence": string or null,
    "site": string or null,
    "department": string or null,
    "title": string or null,
    "detection_source": string or null,
    "related_product": string or null,
    "batch_number": string or null,
    "description": string or null,
    "immediate_action": string or null
}
"""

def fallback_extract(text: str) -> Dict[str, Any]:
    """
    Fallback deterministic parser when Groq API key is not set or API is temporarily unreachable.
    Extracts key QMS fields from standard deviation document headers and sections without guessing.
    """
    logger.info("Executing intelligent fallback extraction from document text.")
    data: Dict[str, Any] = {
        "source_document_reference": None,
        "date_of_occurrence": None,
        "site": None,
        "department": None,
        "title": None,
        "detection_source": None,
        "related_product": None,
        "batch_number": None,
        "description": None,
        "immediate_action": None
    }

    # Extract source document reference (explicit document IDs e.g. Reference: QMS-TEST-2026-021)
    ref_match = re.search(r"(?:Source\s+Document\s+Reference|Document\s+Reference|Reference|Ref(?:\s+ID|\s+No|\.)?|Doc\s+ID|Report\s+No)\s*[:\-]\s*([A-Za-z0-9\-_/]+)", text, re.IGNORECASE)
    if ref_match:
        data["source_document_reference"] = ref_match.group(1).strip()

    # Extract detection source (ONLY when explicitly stated as detected/discovered by)
    src_match = re.search(r"(?:Detection\s+Source|Detected\s+(?:By|Via|During)|Discovered\s+(?:By|Via|During)|Detection\s+Method|Identified\s+(?:By|Via|During))\s*[:\-]\s*([^\n\r,;]+)", text, re.IGNORECASE)
    if src_match:
        val = src_match.group(1).strip()
        # Ensure it's not simply repeating the document reference
        if val != data["source_document_reference"]:
            data["detection_source"] = val

    # Extract date
    date_match = re.search(r"(?:Date(?:\s+of\s+Occurrence)?|Occurrence Date|Date:)\s*[:\-]?\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[A-Za-z]+\s+[0-9]{1,2},?\s+[0-9]{4})", text, re.IGNORECASE)
    if date_match:
        raw_date = date_match.group(1).strip()
        try:
            from datetime import datetime
            for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d %b %Y", "%d %B %Y", "%B %d, %Y", "%b %d, %Y"):
                try:
                    dt = datetime.strptime(raw_date, fmt)
                    data["date_of_occurrence"] = dt.strftime("%Y-%m-%d")
                    break
                except ValueError:
                    continue
            if not data["date_of_occurrence"]:
                data["date_of_occurrence"] = raw_date
        except Exception:
            data["date_of_occurrence"] = raw_date

    # Site / Facility
    site_match = re.search(r"(?:Site(?:\s*/\s*Facility)?|Facility|Plant|Location)\s*[:\-]\s*([^\n\r;]+)", text, re.IGNORECASE)
    if site_match:
        data["site"] = site_match.group(1).strip()

    # Department
    dept_match = re.search(r"(?:Department|Dept|Area)\s*[:\-]\s*([^\n\r,;]+)", text, re.IGNORECASE)
    if dept_match:
        data["department"] = dept_match.group(1).strip()

    # Title
    title_match = re.search(r"(?:Deviation\s+Title|Title|Subject|Incident\s+Title)\s*[:\-]\s*([^\n\r]+)", text, re.IGNORECASE)
    if title_match:
        data["title"] = title_match.group(1).strip()
    else:
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:5]:
            if any(k in line.lower() for k in ["deviation", "excursion", "incident", "failure"]):
                data["title"] = line
                break

    # Related Product / Material
    prod_match = re.search(r"(?:Related Product(?:\s*/\s*Material)?|Product(?:\s+Name)?|Material|Compound)\s*[:\-]\s*([^\n\r,;]+)", text, re.IGNORECASE)
    if prod_match:
        data["related_product"] = prod_match.group(1).strip()

    # Batch / Lot Number
    batch_match = re.search(r"(?:Batch(?:\s*(?:/|\s+)\s*Lot)?(?:\s+(?:Number|No|#|ID))?|Lot(?:\s+(?:Number|No|#|ID))?)\s*[:\-]\s*([A-Za-z0-9\-_]+)", text, re.IGNORECASE)
    if batch_match:
        data["batch_number"] = batch_match.group(1).strip()

    # Description
    desc_match = re.search(r"(?:Deviation\s+Description|Description(?:\s+of\s+Deviation)?|Event Summary|Observation|Details of Event)\s*[:\-]?\s*([\s\S]*?)(?=(?:3\.|\n\s*Immediate Action|Containment Action|Corrective Action|Impact|Root Cause|Conclusion|$))", text, re.IGNORECASE)
    if desc_match and desc_match.group(1).strip():
        raw_desc = desc_match.group(1).strip()
        raw_desc = re.sub(r"^(&\s*DEVIATION\s*DESCRIPTION\s*|\n)+", "", raw_desc, flags=re.IGNORECASE).strip()
        data["description"] = raw_desc
    else:
        data["description"] = text[:600]

    # Immediate Action
    action_match = re.search(r"(?:Immediate Actions?(?:\s*/\s*Containment Measures)?|Containment (?:Action|Measures)|Initial Response)\s*[:\-]?\s*([\s\S]*?)(?=(?:4\.|\n\s*INITIAL LOGGING|Quality Verification|Impact|Root Cause|Preventive Action|Investigation|Conclusion|$))", text, re.IGNORECASE)
    if action_match and action_match.group(1).strip():
        raw_act = action_match.group(1).strip()
        raw_act = re.sub(r"^(&\s*CONTAINMENT\s*MEASURES\s*|\n)+", "", raw_act, flags=re.IGNORECASE).strip()
        data["immediate_action"] = raw_act

    return data

def build_traceability(data: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    """Builds field-level metadata and verification status."""
    traceability = {}
    for key, val in data.items():
        if val is not None and str(val).strip() != "" and str(val).strip().lower() not in ["null", "none", "not identified", "n/a"]:
            status = "Extracted"
        else:
            status = "Not identified"
        traceability[key] = {
            "value": val if status == "Extracted" else None,
            "source": "document",
            "status": status
        }
    return traceability

def run_extraction_llm(text: str) -> Tuple[Dict[str, Any], Dict[str, Dict[str, Any]]]:
    """Runs extraction via Groq LLM or fallback, returning (extracted_data, traceability)."""
    api_key = settings.GROQ_API_KEY.strip() if settings.GROQ_API_KEY else ""

    if not api_key:
        logger.info("GROQ_API_KEY not configured. Using deterministic document parser.")
        extracted_data = fallback_extract(text)
        traceability = build_traceability(extracted_data)
        return extracted_data, traceability

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": f"Document text to extract from:\n\n{text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        content = response.choices[0].message.content
        raw_dict = json.loads(content)
        # Validate through Pydantic
        validated = ExtractedDeviationData(**raw_dict)
        extracted_data = validated.model_dump()

        # Extra safety guard: detection_source must NEVER equal source_document_reference
        if extracted_data.get("detection_source") and extracted_data.get("source_document_reference"):
            if extracted_data["detection_source"].strip().lower() == extracted_data["source_document_reference"].strip().lower():
                extracted_data["detection_source"] = None

        # Clean string placeholders
        for k in ["source_document_reference", "detection_source"]:
            if extracted_data.get(k) and str(extracted_data[k]).strip().lower() in ["not identified", "none", "null", "n/a", "unknown"]:
                extracted_data[k] = None

        traceability = build_traceability(extracted_data)
        return extracted_data, traceability
    except Exception as e:
        logger.error(f"Groq extraction failed ({e}). Falling back to deterministic extraction.", exc_info=True)
        extracted_data = fallback_extract(text)
        traceability = build_traceability(extracted_data)
        return extracted_data, traceability
