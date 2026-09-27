import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2, RotateCcw } from 'lucide-react';

interface AnalyzingModalProps {
  isOpen: boolean;
  onReset?: () => void;
}

export const AnalyzingModal: React.FC<AnalyzingModalProps> = ({ isOpen, onReset }) => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      return;
    }

    const t1 = setTimeout(() => setStep(2), 600);
    const t2 = setTimeout(() => setStep(3), 1400);
    const t3 = setTimeout(() => setStep(4), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-[#DCE2E8]">
          <Loader2 className="w-5 h-5 text-[#2F6FED] animate-spin" />
          <h3 className="text-sm font-semibold text-[#17212B]">
            Analyzing deviation report
          </h3>
        </div>

        <div className="space-y-3 py-2">
          {/* Step 1 */}
          <div className="flex items-center space-x-3 text-xs">
            {step >= 2 ? (
              <CheckCircle2 className="w-4 h-4 text-[#247A45] shrink-0" />
            ) : (
              <Loader2 className="w-4 h-4 text-[#2F6FED] animate-spin shrink-0" />
            )}
            <span className={step >= 2 ? 'text-[#17212B] font-medium' : 'text-[#2F6FED] font-semibold'}>
              Reading document
            </span>
          </div>

          {/* Step 2 */}
          <div className="flex items-center space-x-3 text-xs">
            {step >= 3 ? (
              <CheckCircle2 className="w-4 h-4 text-[#247A45] shrink-0" />
            ) : step === 2 ? (
              <Loader2 className="w-4 h-4 text-[#2F6FED] animate-spin shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-[#CBD4DD] shrink-0" />
            )}
            <span
              className={
                step >= 3
                  ? 'text-[#17212B] font-medium'
                  : step === 2
                  ? 'text-[#2F6FED] font-semibold'
                  : 'text-[#8A96A3]'
              }
            >
              Extracting text
            </span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center space-x-3 text-xs">
            {step >= 4 ? (
              <CheckCircle2 className="w-4 h-4 text-[#247A45] shrink-0" />
            ) : step === 3 ? (
              <Loader2 className="w-4 h-4 text-[#2F6FED] animate-spin shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-[#CBD4DD] shrink-0" />
            )}
            <span
              className={
                step >= 4
                  ? 'text-[#17212B] font-medium'
                  : step === 3
                  ? 'text-[#2F6FED] font-semibold'
                  : 'text-[#8A96A3]'
              }
            >
              Identifying deviation information
            </span>
          </div>

          {/* Step 4 */}
          <div className="flex items-center space-x-3 text-xs">
            {step >= 4 ? (
              <Loader2 className="w-4 h-4 text-[#2F6FED] animate-spin shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-[#CBD4DD] shrink-0" />
            )}
            <span
              className={
                step >= 4
                  ? 'text-[#2F6FED] font-semibold'
                  : 'text-[#8A96A3]'
              }
            >
              Preparing review
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#DCE2E8] flex items-center justify-between">
          <span className="text-[11px] text-[#5B6875]">
            LangGraph extraction workflow executing
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1 text-xs font-medium text-[#5B6875] hover:text-[#17212B] bg-white rounded border border-[#CBD4DD] hover:bg-[#F5F7FA] transition-colors flex items-center shadow-xs"
              title="Cancel and reset workflow"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
