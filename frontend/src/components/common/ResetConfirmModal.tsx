import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-lg max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center space-x-3 text-[#17212B]">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-[#A15C00] flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17212B]">
              Reset this deviation?
            </h3>
            <p className="text-xs text-[#5B6875] mt-0.5">
              All current extracted and edited information will be cleared.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#DCE2E8]">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#5B6875] hover:text-[#17212B] bg-white border border-[#CBD4DD] rounded-md hover:bg-[#F5F7FA] transition-colors"
          >
            Keep Working
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#B42318] hover:bg-red-800 rounded-md transition-colors flex items-center shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
