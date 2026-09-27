export interface FieldTraceability {
  value: string | null;
  source: string;
  status: 'Extracted by AI' | 'Edited by User' | 'Not identified' | 'Extracted' | 'Needs review';
}

export interface ExtractedData {
  source_document_reference: string | null;
  date_of_occurrence: string | null;
  site: string | null;
  department: string | null;
  title: string | null;
  detection_source: string | null;
  source?: string | null;
  related_product: string | null;
  batch_number: string | null;
  description: string | null;
  immediate_action: string | null;
}

export interface ReviewedData {
  source_document_reference: string | null;
  date_of_occurrence: string | null;
  site: string | null;
  department: string | null;
  title: string | null;
  detection_source: string | null;
  source?: string | null;
  related_product: string | null;
  batch_number: string | null;
  description: string | null;
  immediate_action: string | null;
}

export interface RetrievedGuidanceItem {
  title: string;
  content: string;
}

export interface AssessmentData {
  potential_impact: string;
  suggested_severity: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  reason: string;
  key_factors: string[];
  rule_candidate?: 'Minor' | 'Moderate' | 'Major' | 'Critical' | null;
  triggered_rules?: string[];
  retrieved_guidance?: RetrievedGuidanceItem[];
  assessment_status?: string;
}

export interface DeviationRecord {
  id: number;
  deviation_id: string;
  source_document_reference: string | null;
  date_of_occurrence: string | null;
  site: string | null;
  department: string | null;
  title: string | null;
  detection_source: string | null;
  source?: string | null;
  related_product: string | null;
  batch_number: string | null;
  description: string | null;
  immediate_action: string | null;
  ai_potential_impact: string | null;
  ai_suggested_severity: string | null;
  ai_severity_reason: string | null;
  rule_candidate?: string | null;
  assessment_status?: string | null;
  final_severity: string | null;
  status: string;
  source_filename: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ExtractionApiResponse {
  success: boolean;
  extracted_text: string;
  structured_data: ExtractedData;
  traceability: Record<string, FieldTraceability>;
  message?: string;
}

export interface DeviationSavePayload extends ReviewedData {
  ai_potential_impact?: string | null;
  ai_suggested_severity?: string | null;
  ai_severity_reason?: string | null;
  rule_candidate?: string | null;
  assessment_status?: string | null;
  final_severity?: string | null;
  status?: string;
  source_filename?: string | null;
}
