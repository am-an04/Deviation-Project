import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  pageTitle?: string;
  breadcrumb?: string;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle = 'Deviation Management',
  breadcrumb,
}) => {
  return (
    <header className="h-16 bg-white border-b border-[#DCE2E8] px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex flex-col">
        {breadcrumb && (
          <span className="text-xs text-[#5B6875] font-medium tracking-wide">
            {breadcrumb}
          </span>
        )}
        <h1 className="text-xl font-semibold text-[#17212B] tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="hidden md:flex items-center text-xs text-[#5B6875] bg-[#F5F7FA] px-3 py-1.5 rounded-full border border-[#DCE2E8]">
          <span className="w-2 h-2 rounded-full bg-[#247A45] mr-2"></span>
          <span>GxP Validated System</span>
        </div>

        <button
          className="text-[#5B6875] hover:text-[#17212B] p-1.5 rounded-md hover:bg-[#F5F7FA] transition-colors relative"
          title="System Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#2F6FED] rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-[#DCE2E8]"></div>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-[#174A7E] text-white flex items-center justify-center font-medium text-xs shadow-sm">
            QU
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#17212B]">
              Quality User
            </span>
            <span className="text-[11px] text-[#5B6875]">
              QA Specialist · GxP Operations
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
