import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setFinalSeverity,
  acceptAiSuggestion,
  assessDeviation,
} from '../../store/slices/assessmentSlice';
import { saveDeviation } from '../../store/slices/deviationsSlice';
import { setIsSaving, setActiveStep } from '../../store/slices/uiSlice';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  Edit3,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export const AiAssessmentPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { extractionStatus, reviewedData, sourceFilename } = useAppSelector(
    (state) => state.deviation
  );
  const {
    potentialImpact,
    suggestedSeverity,
    finalSeverity,
    reason,
    keyFactors,
    ruleCandidate,
    triggeredRules,
    retrievedGuidance,
    assessmentStatus,
    assessmentError,
  } = useAppSelector((state) => state.assessment);
  const { isSaving } = useAppSelector((state) => state.ui);

  const [isEditingSeverity, setIsEditingSeverity] = useState<boolean>(false);

  const hasExtracted = extractionStatus === 'succeeded';
  const isAssessing = assessmentStatus === 'loading';
  const hasAssessment = Boolean(suggestedSeverity && assessmentStatus !== 'idle' && assessmentStatus !== 'loading' && assessmentStatus !== 'failed');

  const handleRunAssessment = () => {
    dispatch(setActiveStep(3));
    dispatch(assessDeviation(reviewedData));
  };

  const handleAcceptSuggestion = () => {
    dispatch(acceptAiSuggestion());
    setIsEditingSeverity(false);
  };

  const handleSeverityChange = (
    severity: 'Minor' | 'Moderate' | 'Major' | 'Critical'
  ) => {
    dispatch(setFinalSeverity(severity));
    setIsEditingSeverity(false);
  };

  const handleFinalSubmit = async () => {
    if (!reviewedData.title) {
      alert('Please provide a deviation title before saving.');
      return;
    }

    dispatch(setIsSaving(true));
    const result = await dispatch(
      saveDeviation({
        ...reviewedData,
        ai_potential_impact: potentialImpact,
        ai_suggested_severity: suggestedSeverity,
        ai_severity_reason: reason,
        rule_candidate: ruleCandidate,
        assessment_status: assessmentStatus,
        final_severity: finalSeverity || suggestedSeverity || 'Minor',
        status: 'Submitted',
        source_filename: sourceFilename || undefined,
      })
    );
    dispatch(setIsSaving(false));

    if (saveDeviation.fulfilled.match(result)) {
      dispatch(setActiveStep(4));
      navigate(`/deviations/${result.payload.deviation_id}`);
    } else if (saveDeviation.rejected.match(result)) {
      alert(result.payload || 'Failed to save deviation to database.');
    }
  };

  const getSeverityBadgeClass = (sev: string | null) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-100 text-[#B42318] border-red-300';
      case 'Major':
        return 'bg-amber-100 text-[#A15C00] border-amber-300';
      case 'Moderate':
        return 'bg-blue-100 text-[#174A7E] border-blue-300';
      case 'Minor':
      default:
        return 'bg-green-100 text-[#247A45] border-green-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Panel 1: Document Analysis & Traceability */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E8]">
          <h3 className="text-xs font-semibold text-[#17212B] uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#2F6FED]" />
            AI Assistant
          </h3>
          <span className="text-[10px] text-[#5B6875] font-medium bg-[#F5F7FA] px-2 py-0.5 rounded border border-[#DCE2E8]">
            Workflow Assistant
          </span>
        </div>

        <div className="mt-4">
          <div className="text-xs font-semibold text-[#17212B] mb-2">
            Document Analysis Status
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  hasExtracted ? 'text-[#247A45]' : 'text-[#8A96A3]'
                }`}
              />
              <span
                className={hasExtracted ? 'text-[#17212B]' : 'text-[#8A96A3]'}
              >
                Document text extracted
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  hasExtracted ? 'text-[#247A45]' : 'text-[#8A96A3]'
                }`}
              />
              <span
                className={hasExtracted ? 'text-[#17212B]' : 'text-[#8A96A3]'}
              >
                Deviation parameters identified
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  hasExtracted ? 'text-[#A15C00]' : 'text-[#8A96A3]'
                }`}
              />
              <span
                className={hasExtracted ? 'text-[#17212B] font-medium' : 'text-[#8A96A3]'}
              >
                Human review required
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCE2E8] text-[11px] text-[#5B6875]">
            <span className="font-medium text-[#17212B]">Information source:</span>{' '}
            {sourceFilename ? sourceFilename : 'Uploaded deviation document'}
          </div>
        </div>
      </div>

      {/* Panel 2: AI Impact & Severity Assessment */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E8]">
          <h3 className="text-xs font-semibold text-[#17212B] uppercase tracking-wider flex items-center">
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-[#174A7E]" />
            AI Assessment
          </h3>
          {hasAssessment && (
            <span className="text-[10px] text-[#247A45] font-semibold bg-[#EBF7EE] px-2 py-0.5 rounded border border-[#C3E8CC]">
              Recommendation Ready
            </span>
          )}
        </div>

        {/* If assessment hasn't run yet */}
        {!hasAssessment && !isAssessing && (
          <div className="py-6 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#EEF4FF] text-[#2F6FED] flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#5B6875] max-w-xs mx-auto">
              Run the AI assessment to evaluate potential process/product risk and receive a reasoned severity recommendation.
            </p>
            <button
              type="button"
              onClick={handleRunAssessment}
              disabled={!reviewedData.description}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#174A7E] hover:bg-[#123A63] rounded-md shadow-sm transition-colors disabled:opacity-50"
            >
              Run Impact Assessment
            </button>
          </div>
        )}

        {/* Loading state for assessment */}
        {isAssessing && (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-6 h-6 mx-auto text-[#2F6FED] animate-spin" />
            <div className="text-xs font-semibold text-[#17212B]">
              Analyzing process risk & severity...
            </div>
            <p className="text-[11px] text-[#5B6875]">
              Cross-referencing critical quality attributes (CQAs) and regulatory boundaries
            </p>
          </div>
        )}

        {/* Assessment Results */}
        {hasAssessment && (
          <div className="mt-4 space-y-4">
            {/* Conflict Warning if Rule and LLM disagree */}
            {((ruleCandidate && suggestedSeverity && ruleCandidate !== suggestedSeverity) || assessmentStatus === 'Needs Human Review') && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-amber-900 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-semibold">
                    Human review required: AI recommendation differs from the deterministic assessment.
                  </div>
                  <div className="text-[11px] text-amber-800 mt-1">
                    The deterministic rule check indicates <span className="font-bold underline">{ruleCandidate}</span>, while the AI assessment recommends <span className="font-bold underline">{suggestedSeverity}</span> based on retrieved guidance. Human review is required to confirm the final severity.
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Severity */}
            <div className="bg-[#F5F7FA] p-3.5 rounded-lg border border-[#CBD4DD]">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-[#5B6875] mb-1">
                AI Suggested Severity
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${getSeverityBadgeClass(
                    suggestedSeverity
                  )}`}
                >
                  {suggestedSeverity}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAcceptSuggestion}
                    className="text-xs font-medium text-[#247A45] hover:text-green-800 bg-white px-2 py-1 rounded border border-[#CBD4DD] flex items-center shadow-xs"
                    title="Accept suggested severity"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingSeverity(!isEditingSeverity)}
                    className="text-xs font-medium text-[#174A7E] hover:text-[#123A63] bg-white px-2 py-1 rounded border border-[#CBD4DD] flex items-center shadow-xs"
                  >
                    <Edit3 className="w-3 h-3 mr-1" />
                    Change
                  </button>
                </div>
              </div>

              {/* Severity Selector Dropdown if editing */}
              {isEditingSeverity && (
                <div className="mt-3 pt-3 border-t border-[#DCE2E8]">
                  <label className="block text-[11px] font-semibold text-[#17212B] mb-1">
                    Select Human Confirmed Severity:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Minor', 'Moderate', 'Major', 'Critical'] as const).map(
                      (sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => handleSeverityChange(sev)}
                          className={`text-xs py-1 px-2 rounded border text-left font-medium transition-colors ${
                            finalSeverity === sev
                              ? 'bg-[#174A7E] text-white border-[#174A7E]'
                              : 'bg-white text-[#17212B] border-[#CBD4DD] hover:bg-[#F5F7FA]'
                          }`}
                        >
                          {sev}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Final Severity Verification Badge */}
              <div className="mt-3 pt-2 border-t border-[#DCE2E8] flex items-center justify-between text-[11px]">
                <span className="text-[#5B6875]">Confirmed Severity:</span>
                <span className="font-bold text-[#17212B] flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#247A45] mr-1.5"></span>
                  {finalSeverity || suggestedSeverity}
                </span>
              </div>
            </div>

            {/* Assessment Basis Section */}
            <div className="bg-white p-3.5 rounded-lg border border-[#CBD4DD] space-y-3">
              <div className="text-xs font-bold text-[#17212B] pb-1 border-b border-[#E1E6EB] flex items-center justify-between">
                <span>Assessment Basis</span>
                <span className="text-[10px] text-[#5B6875] font-normal">MVP Decision Support</span>
              </div>

              {/* Severity Guidance (RAG) */}
              <div>
                <div className="text-[11px] font-semibold text-[#17212B] mb-1 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-[#174A7E]" />
                  Severity Guidance
                </div>
                {retrievedGuidance && retrievedGuidance.length > 0 ? (
                  <div className="space-y-1.5">
                    {retrievedGuidance.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#F5F7FA] rounded border border-[#E1E6EB] text-[11px]"
                      >
                        <div className="font-semibold text-[#174A7E]">{item.title}</div>
                        <p className="text-[#5B6875] line-clamp-2 mt-0.5 leading-snug">
                          {item.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#5B6875] italic">No specific guidance chunks retrieved.</p>
                )}
              </div>

              {/* Deterministic Rule Check */}
              <div>
                <div className="text-[11px] font-semibold text-[#17212B] mb-1 flex items-center justify-between">
                  <span>Rule Check</span>
                  {ruleCandidate && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadgeClass(
                        ruleCandidate
                      )}`}
                    >
                      {ruleCandidate} candidate
                    </span>
                  )}
                </div>
                {triggeredRules && triggeredRules.length > 0 ? (
                  <ul className="text-[11px] text-[#5B6875] space-y-1 bg-[#F5F7FA] p-2.5 rounded border border-[#E1E6EB]">
                    {triggeredRules.map((rule, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#247A45] font-bold mr-1.5">✓</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-[#5B6875] italic">No automated rule conditions triggered.</p>
                )}
              </div>

              {/* Key Factors */}
              {keyFactors && keyFactors.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#17212B] mb-1">
                    Key Factors
                  </div>
                  <ul className="text-[11px] text-[#5B6875] space-y-1 bg-[#F5F7FA] p-2.5 rounded border border-[#E1E6EB]">
                    {keyFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-[#2F6FED] font-bold mr-1.5">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Suggested Severity & Reason summary */}
              <div>
                <div className="text-[11px] font-semibold text-[#17212B] mb-1">
                  Reason
                </div>
                <p className="text-[11px] text-[#5B6875] bg-[#F5F7FA] p-2.5 rounded border border-[#E1E6EB] leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>

            {/* Potential Impact */}
            <div>
              <div className="text-xs font-semibold text-[#17212B] mb-1">
                Potential Impact
              </div>
              <p className="text-xs text-[#5B6875] bg-[#F5F7FA] p-3 rounded-md border border-[#DCE2E8] leading-relaxed">
                {potentialImpact}
              </p>
            </div>

            {/* Human-in-the-loop compliance callout */}
            <div className="p-3 bg-[#EEF4FF] rounded-md border border-[#CBD4DD] flex items-start space-x-2 text-[11px] text-[#174A7E]">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#2F6FED]" />
              <div>
                <span className="font-semibold">Human-Controlled Decision:</span>{' '}
                This recommendation was generated by AI based solely on documented facts and MVP decision-support guidance. Human sign-off is required before final commitment to the QMS database.
              </div>
            </div>

            {/* Final Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSaving}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#247A45] hover:bg-[#1E663A] rounded-md shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <span>{isSaving ? 'Saving to Database...' : 'Confirm & Save Deviation Record'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {assessmentError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-[#B42318]">
            {assessmentError}
          </div>
        )}
      </div>
    </div>
  );
};
