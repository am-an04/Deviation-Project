import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  CheckSquare,
  FileSpreadsheet,
  ClipboardList,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Deviations', path: '/deviations', icon: AlertTriangle, badge: 'Active' },
  { name: 'CAPAs', path: '/capas', icon: CheckSquare },
  { name: 'Change Control', path: '/change-control', icon: FileSpreadsheet },
  { name: 'Audits', path: '/audits', icon: ClipboardList },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#123A63] text-white flex flex-col shrink-0 min-h-screen border-r border-[#174A7E]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#174A7E]/60">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#2F6FED] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center">
              QMS Core
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-semibold bg-[#2F6FED]/30 text-blue-200 rounded">
                AI-Native
              </span>
            </div>
            <div className="text-[11px] text-[#CBD4DD] leading-none">
              Life Sciences Edition
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-[#8A96A3]">
          Quality Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#174A7E] text-white shadow-sm font-semibold'
                    : 'text-[#CBD4DD] hover:text-white hover:bg-[#174A7E]/40'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0 text-[#8A96A3] group-hover:text-white" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-[#247A45] text-white px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#174A7E]/60 text-[11px] text-[#8A96A3]">
        <div className="flex items-center justify-between">
          <span>Compliance Tier</span>
          <span className="text-[#CBD4DD] font-medium">21 CFR Part 11</span>
        </div>
        <div className="mt-1 text-[10px] text-[#8A96A3]">
          AI Assistance Module v1.0.0
        </div>
      </div>
    </aside>
  );
};
