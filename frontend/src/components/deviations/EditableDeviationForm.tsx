import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateReviewedField } from '../../store/slices/deviationSlice';
import { assessDeviation } from '../../store/slices/assessmentSlice';
import { setActiveStep, setIsSaving } from '../../store/slices/uiSlice';
import { saveDeviation } from '../../store/slices/deviationsSlice';
import type { ReviewedData } from '../../types';
import {
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResetConfirmModal } from '../common/ResetConfirmModal';
import {
  executeResetWorkflow,
  setActiveAssessmentPromise,
} from '../../utils/intakeWorkflow';

export const EditableDeviationForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const { reviewedData, traceability, extractionStatus, uploadedFileMeta } =
    useAppSelector((state) => state.deviation);
  const {
    assessmentStatus,
    finalSeverity,
    suggestedSeverity,
    potentialImpact,
    reason,
  } = useAppSelector((state) => state.assessment);
  const { isSaving } = useAppSelector((state) => state.ui);

  const isAssessing = assessmentStatus === 'loading';
  const hasExtracted = extractionStatus === 'succeeded';

  const handleChange = (field: keyof ReviewedData, value: string) => {
    dispatch(
      updateReviewedField({
        field,
        value: value.trim() === '' ? null : value,
      })
    );
  };

  const handleRunAssessment = async () => {
    dispatch(setActiveStep(3));
    const promise = dispatch(assessDeviation(reviewedData));
    setActiveAssessmentPromise(promise);
    try {
      await promise;
    } finally {
      setActiveAssessmentPromise(null);
    }
  };

  const handleSaveDraft = async () => {
    dispatch(setIsSaving(true));
    const result = await dispatch(
      saveDeviation({
        ...reviewedData,
        ai_potential_impact: potentialImpact,
        ai_suggested_severity: suggestedSeverity,
        ai_severity_reason: reason,
        final_severity: finalSeverity || suggestedSeverity || 'Minor',
        status: 'Draft',
      })
    );
    dispatch(setIsSaving(false));
    if (saveDeviation.fulfilled.match(result)) {
      navigate('/deviations');
    }
  };

  const handleResetClick = () => {
    const hasData = Boolean(
      uploadedFileMeta !== null ||
      extractionStatus !== 'idle' ||
      assessmentStatus !== 'idle' ||
      reviewedData.source_document_reference ||
      reviewedData.date_of_occurrence ||
      reviewedData.site ||
      reviewedData.department ||
      reviewedData.title ||
      reviewedData.detection_source ||
      reviewedData.related_product ||
      reviewedData.batch_number ||
      reviewedData.description ||
      reviewedData.immediate_action
    );

    if (hasData) {
      setShowResetModal(true);
    } else {
      executeReset();
    }
  };

  const executeReset = () => {
    executeResetWorkflow(dispatch);
    setShowResetModal(false);
  };

  // Helper badge component for field traceability
  const FieldStatusBadge = ({ field }: { field: keyof ReviewedData }) => {
    const trace = traceability[field];
    const val = reviewedData[field];

    let status: 'Extracted by AI' | 'Edited by User' | 'Not identified' = 'Not identified';

    if (val && val.trim() !== '') {
      if (trace && (trace.status === 'Extracted by AI' || trace.status === 'Extracted') && trace.source === 'document') {
        status = 'Extracted by AI';
      } else {
        status = 'Edited by User';
      }
    } else {
      status = 'Not identified';
    }

    if (status === 'Extracted by AI') {
      return (
        <span className="inline-flex items-center text-[10px] font-medium text-[#247A45] bg-[#EBF7EE] px-1.5 py-0.5 rounded border border-[#C3E8CC]">
          <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
          Extracted by AI
        </span>
      );
    }
    if (status === 'Edited by User') {
      return (
        <span className="inline-flex items-center text-[10px] font-medium text-[#A15C00] bg-[#FFF8EB] px-1.5 py-0.5 rounded border border-[#FBE0B2]">
          <AlertCircle className="w-2.5 h-2.5 mr-1" />
          Edited by User
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-medium text-[#8A96A3] bg-[#F5F7FA] px-1.5 py-0.5 rounded border border-[#DCE2E8]">
        <HelpCircle className="w-2.5 h-2.5 mr-1" />
        Not identified
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCE2E8]">
          <div>
            <h2 className="text-sm font-semibold text-[#17212B] uppercase tracking-wider flex items-center">
              2. Deviation Details
              {hasExtracted && (
                <span className="ml-2.5 text-[11px] font-normal normal-case text-[#2F6FED] bg-[#EEF4FF] px-2 py-0.5 rounded border border-[#CBD4DD]">
                  AI-Extracted & Editable
                </span>
              )}
            </h2>
            <p className="text-xs text-[#5B6875] mt-0.5">
              Review and adjust AI-extracted parameters. Missing values are displayed as &quot;Not identified&quot;.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Row 1: Deviation ID (Auto) & Source Document Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1">
                Deviation ID
              </label>
              <input
                type="text"
                disabled
                value="Assigned upon submission e.g. DEV-0001"
                className="w-full text-xs bg-[#F5F7FA] border border-[#CBD4DD] rounded-md px-3 py-2 text-[#5B6875] font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  Source Document Reference
                </label>
                <FieldStatusBadge field="source_document_reference" />
              </div>
              <input
                type="text"
                placeholder="Explicit document or report reference ID (e.g. QMS-TEST-2026-021)"
                value={reviewedData.source_document_reference || ''}
                onChange={(e) => handleChange('source_document_reference', e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] font-mono focus:outline-none focus:border-[#2F6FED]"
              />
            </div>
          </div>

          {/* Row 2: Date of Occurrence & Title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  Date of Occurrence <span className="text-red-500">*</span>
                </label>
                <FieldStatusBadge field="date_of_occurrence" />
              </div>
              <input
                type="text"
                placeholder="YYYY-MM-DD"
                value={reviewedData.date_of_occurrence || ''}
                onChange={(e) => handleChange('date_of_occurrence', e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  Deviation Title <span className="text-red-500">*</span>
                </label>
                <FieldStatusBadge field="title" />
              </div>
              <input
                type="text"
                placeholder="Concise factual title of the deviation..."
                value={reviewedData.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
              />
            </div>
          </div>

          {/* Row 3: Site & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  Site / Facility
                </label>
                <FieldStatusBadge field="site" />
              </div>
              <input
                type="text"
                placeholder="Manufacturing site or facility..."
                value={reviewedData.site || ''}
                onChange={(e) => handleChange('site', e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  Department
                </label>
                <FieldStatusBadge field="department" />
              </div>
              <input
                type="text"
                placeholder="e.g. Bioprocess Manufacturing"
                value={reviewedData.department || ''}
                onChange={(e) => handleChange('department', e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
              />
            </div>
          </div>

          {/* Row 4: Detection Source */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#17212B]">
                Detection Source
              </label>
              <FieldStatusBadge field="detection_source" />
            </div>
            <input
              type="text"
              placeholder="Explicit method, system, inspection, or review that detected the deviation..."
              value={reviewedData.detection_source || ''}
              onChange={(e) => handleChange('detection_source', e.target.value)}
              className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
            />
          </div>

          {/* Row 5: Related Product & Batch Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  Related Product / Material
                </label>
                <FieldStatusBadge field="related_product" />
              </div>
              <input
                type="text"
                placeholder="Product or compound name..."
                value={reviewedData.related_product || ''}
                onChange={(e) => handleChange('related_product', e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#17212B]">
                  Batch / Lot Number
                </label>
                <FieldStatusBadge field="batch_number" />
              </div>
              <input
                type="text"
                placeholder="e.g. B-1024 or LOT-88219"
                value={reviewedData.batch_number || ''}
                onChange={(e) => handleChange('batch_number', e.target.value)}
                className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md px-3 py-2 text-[#17212B] font-mono focus:outline-none focus:border-[#2F6FED]"
              />
            </div>
          </div>

          {/* Row 6: Description of Deviation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#17212B]">
                Deviation Description <span className="text-red-500">*</span>
              </label>
              <FieldStatusBadge field="description" />
            </div>
            <textarea
              rows={4}
              placeholder="Detailed factual description of the event, preserving temperatures, pressures, durations, etc."
              value={reviewedData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md p-3 text-[#17212B] focus:outline-none focus:border-[#2F6FED] leading-relaxed"
            />
          </div>

          {/* Row 7: Immediate Action Taken */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#17212B]">
                Immediate Actions / Containment Measures
              </label>
              <FieldStatusBadge field="immediate_action" />
            </div>
            <textarea
              rows={3}
              placeholder="Immediate containment or isolation actions taken on shift..."
              value={reviewedData.immediate_action || ''}
              onChange={(e) => handleChange('immediate_action', e.target.value)}
              className="w-full text-xs bg-white border border-[#CBD4DD] rounded-md p-3 text-[#17212B] focus:outline-none focus:border-[#2F6FED] leading-relaxed"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-6 pt-4 border-t border-[#DCE2E8] flex items-center justify-between">
          {/* Functional Reset Button */}
          <button
            type="button"
            onClick={handleResetClick}
            className="px-3.5 py-2 text-xs font-medium text-[#5B6875] hover:text-[#17212B] bg-white rounded-md border border-[#CBD4DD] hover:bg-[#F5F7FA] hover:border-[#8A96A3] transition-colors flex items-center shadow-xs"
            title="Reset deviation intake workflow"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving || !reviewedData.title}
              className="px-4 py-2 text-xs font-semibold text-[#174A7E] bg-white border border-[#174A7E] rounded-md hover:bg-[#EEF4FF] transition-colors flex items-center shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Draft
            </button>

            <button
              type="button"
              onClick={handleRunAssessment}
              disabled={isAssessing || !reviewedData.description}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-md flex items-center shadow-sm transition-all ${
                isAssessing || !reviewedData.description
                  ? 'bg-[#8A96A3] cursor-not-allowed'
                  : 'bg-[#2F6FED] hover:bg-[#1E57CD]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>{isAssessing ? 'Assessing Risk...' : 'Run AI Assessment'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Professional Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetModal}
        onConfirm={executeReset}
        onCancel={() => setShowResetModal(false)}
      />
    </>
  );
};
