import React from 'react';
import { Clock } from 'lucide-react';

interface PlaceholderModuleProps {
  moduleName: string;
}

export const PlaceholderModule: React.FC<PlaceholderModuleProps> = ({ moduleName }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg border border-[#DCE2E8] p-12 text-center shadow-xs space-y-3">
      <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#8A96A3] flex items-center justify-center mx-auto">
        <Clock className="w-6 h-6 text-[#174A7E]" />
      </div>
      <h2 className="text-lg font-bold text-[#17212B]">{moduleName}</h2>
      <p className="text-xs text-[#5B6875] max-w-md mx-auto">
        Module coming soon. The current MVP scope is focused on the AI-Powered Deviation Intake Module.
      </p>
    </div>
  );
};
