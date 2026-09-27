import React, { useState } from 'react';
import { PdfUpload } from '../components/upload/PdfUpload';
import { EditableDeviationForm } from '../components/deviations/EditableDeviationForm';
import { AiAssessmentPanel } from '../components/assessment/AiAssessmentPanel';
import { AnalyzingModal } from '../components/common/AnalyzingModal';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { RotateCcw } from 'lucide-react';
import { executeResetWorkflow } from '../utils/intakeWorkflow';
import { ResetConfirmModal } from '../components/common/ResetConfirmModal';

export const LogDeviation: React.FC = () => {
  const dispatch = useAppDispatch();
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const { extractionStatus, uploadedFileMeta, reviewedData } = useAppSelector(
    (state) => state.deviation
  );
  const { assessmentStatus } = useAppSelector((state) => state.assessment);

  const isAnalyzing = extractionStatus === 'loading';

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#17212B]">Log Deviation</h2>
          <p className="text-xs text-[#5B6875] mt-1">
            Upload a deviation report and let the system extract the relevant information for review.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetClick}
          className="px-3.5 py-2 text-xs font-medium text-[#5B6875] hover:text-[#17212B] bg-white rounded-md border border-[#CBD4DD] hover:bg-[#F5F7FA] hover:border-[#8A96A3] transition-colors flex items-center shadow-xs"
          title="Reset deviation intake workflow"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset
        </button>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Upload + Editable Form (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <PdfUpload />
          <EditableDeviationForm />
        </div>

        {/* Right Column: Enterprise AI Assistant & Assessment (5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-20">
          <AiAssessmentPanel />
        </div>
      </div>

      {/* Professional Analysis Progress Modal */}
      <AnalyzingModal isOpen={isAnalyzing} onReset={executeReset} />

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={showResetModal}
        onConfirm={executeReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
