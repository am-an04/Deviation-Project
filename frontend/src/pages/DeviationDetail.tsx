import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDeviationById } from '../store/slices/deviationsSlice';
import {
  ArrowLeft,
  Building,
  Tag,
  Layers,
  FileText,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const DeviationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentRecord, detailLoading, detailError } = useAppSelector(
    (state) => state.deviations
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchDeviationById(id));
    }
  }, [dispatch, id]);

  const getSeverityBadge = (sev: string | null) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider bg-red-100 text-[#B42318] border-red-300">
            Critical
          </span>
        );
      case 'Major':
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider bg-amber-100 text-[#A15C00] border-amber-300">
            Major
          </span>
        );
      case 'Moderate':
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider bg-blue-100 text-[#174A7E] border-blue-300">
            Moderate
          </span>
        );
      case 'Minor':
      default:
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wider bg-green-100 text-[#247A45] border-green-300">
            Minor
          </span>
        );
    }
  };

  const formatDate = (val: string | null) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return val;
    }
  };

  if (detailLoading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-xs text-[#5B6875] space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2F6FED]" />
        <div>Loading deviation details...</div>
      </div>
    );
  }

  if (detailError || !currentRecord) {
    return (
      <div className="max-w-5xl mx-auto p-8 bg-white rounded-lg border border-[#DCE2E8] text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-[#B42318] mx-auto" />
        <h3 className="text-sm font-semibold text-[#17212B]">
          {detailError || 'Deviation record not found'}
        </h3>
        <button
          type="button"
          onClick={() => navigate('/deviations')}
          className="px-4 py-2 text-xs font-medium text-white bg-[#174A7E] rounded-md shadow-xs"
        >
          Return to Deviation Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/deviations')}
          className="text-xs text-[#5B6875] hover:text-[#17212B] flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Deviations Register
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#5B6875]">Record Status:</span>
          <span className="font-semibold text-[#174A7E] bg-[#EEF4FF] px-2 py-0.5 rounded border border-[#CBD4DD]">
            {currentRecord.status}
          </span>
        </div>
      </div>

      {/* Record Header Banner */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DCE2E8]">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="font-mono text-sm font-bold text-[#174A7E] bg-[#F5F7FA] px-2 py-0.5 rounded border border-[#CBD4DD]">
                {currentRecord.deviation_id}
              </span>
              <span className="text-xs text-[#5B6875]">
                {formatDate(currentRecord.date_of_occurrence)}
              </span>
            </div>
            <h1 className="text-lg font-bold text-[#17212B] tracking-tight">
              {currentRecord.title || 'Untitled Deviation Record'}
            </h1>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] text-[#5B6875] uppercase tracking-wider mb-1 font-semibold">
              Final Confirmed Severity
            </span>
            {getSeverityBadge(currentRecord.final_severity)}
          </div>
        </div>

        {/* Quick Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <div className="text-[11px] text-[#5B6875] font-medium flex items-center">
              <Building className="w-3.5 h-3.5 mr-1 text-[#8A96A3]" /> Site & Dept
            </div>
            <div className="font-semibold text-[#17212B] mt-0.5">
              {currentRecord.site || '—'}
            </div>
            <div className="text-[#5B6875] text-[11px]">
              {currentRecord.department || '—'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#5B6875] font-medium flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1 text-[#8A96A3]" /> Related Product
            </div>
            <div className="font-semibold text-[#17212B] mt-0.5 truncate" title={currentRecord.related_product || ''}>
              {currentRecord.related_product || '—'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#5B6875] font-medium flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1 text-[#8A96A3]" /> Batch / Lot
            </div>
            <div className="font-mono font-semibold text-[#17212B] mt-0.5">
              {currentRecord.batch_number || '—'}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-[#5B6875] font-medium flex items-center">
              <FileText className="w-3.5 h-3.5 mr-1 text-[#8A96A3]" /> Source Document
            </div>
            <div className="text-[#17212B] mt-0.5 truncate text-[11px]" title={currentRecord.source_filename || 'Uploaded Document'}>
              {currentRecord.source_filename || 'Uploaded Document'}
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Deviation Details */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-semibold text-[#17212B] uppercase tracking-wider pb-2 border-b border-[#DCE2E8]">
          Deviation Information
        </h2>

        <div>
          <div className="text-xs font-semibold text-[#17212B] mb-1">
            Description of Event
          </div>
          <p className="text-xs text-[#17212B] bg-[#F5F7FA] p-3.5 rounded-md border border-[#DCE2E8] leading-relaxed whitespace-pre-line">
            {currentRecord.description || 'No description recorded.'}
          </p>
        </div>

        <div>
          <div className="text-xs font-semibold text-[#17212B] mb-1">
            Immediate Containment Actions Taken
          </div>
          <p className="text-xs text-[#17212B] bg-[#F5F7FA] p-3.5 rounded-md border border-[#DCE2E8] leading-relaxed whitespace-pre-line">
            {currentRecord.immediate_action || 'No immediate actions documented.'}
          </p>
        </div>
      </div>

      {/* Section 2: AI Assessment Record */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#DCE2E8]">
          <h2 className="text-xs font-semibold text-[#17212B] uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#2F6FED]" />
            AI Assessment Trace
          </h2>
          <span className="text-[11px] text-[#5B6875] bg-[#EEF4FF] px-2 py-0.5 rounded border border-[#CBD4DD]">
            LangGraph Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#F5F7FA] p-3 rounded-md border border-[#DCE2E8]">
            <span className="text-[11px] text-[#5B6875] font-medium block mb-1">
              Rule Check Candidate
            </span>
            <div className="flex items-center">
              {currentRecord.rule_candidate ? (
                getSeverityBadge(currentRecord.rule_candidate)
              ) : (
                <span className="text-xs text-[#5B6875] italic">Not recorded</span>
              )}
            </div>
          </div>

          <div className="bg-[#F5F7FA] p-3 rounded-md border border-[#DCE2E8]">
            <span className="text-[11px] text-[#5B6875] font-medium block mb-1">
              AI Suggested Severity
            </span>
            <div className="flex items-center">
              {getSeverityBadge(currentRecord.ai_suggested_severity)}
            </div>
          </div>

          <div className="bg-[#F5F7FA] p-3 rounded-md border border-[#DCE2E8]">
            <span className="text-[11px] text-[#5B6875] font-medium block mb-1">
              Human Final Severity
            </span>
            <div className="flex items-center">
              {getSeverityBadge(currentRecord.final_severity)}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-[#17212B] mb-1">
            AI Severity Rationale
          </div>
          <p className="text-xs text-[#5B6875] bg-[#F5F7FA] p-3 rounded-md border border-[#DCE2E8] leading-relaxed">
            {currentRecord.ai_severity_reason || 'Standard assessment criteria applied.'}
          </p>
        </div>

        {currentRecord.ai_potential_impact && (
          <div>
            <div className="text-xs font-semibold text-[#17212B] mb-1">
              Potential Impact Analysis
            </div>
            <p className="text-xs text-[#5B6875] bg-[#F5F7FA] p-3 rounded-md border border-[#DCE2E8] leading-relaxed">
              {currentRecord.ai_potential_impact}
            </p>
          </div>
        )}
      </div>

      {/* Section 3: Final Decision & Human Review Notice */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-sm">
        <h2 className="text-xs font-semibold text-[#17212B] uppercase tracking-wider pb-2 border-b border-[#DCE2E8]">
          Final Decision & Governance
        </h2>

        <div className="mt-4 p-4 bg-[#EEF4FF] rounded-lg border border-[#CBD4DD] flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#247A45] shrink-0 mt-0.5" />
          <div className="text-xs text-[#17212B] space-y-1">
            <div className="font-semibold text-[#174A7E]">
              AI-generated information was reviewed by a human.
            </div>
            <p className="text-[#5B6875]">
              This deviation record was extracted with AI assistance, verified by an authorized Quality User, and formally recorded into the QMS database under 21 CFR Part 11 audit compliance guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
