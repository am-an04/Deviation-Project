import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/') {
      return { title: 'Quality Management Dashboard', breadcrumb: 'QMS / Overview' };
    }
    if (path === '/deviations') {
      return { title: 'Deviation Management', breadcrumb: 'Deviations / Records' };
    }
    if (path === '/deviations/new') {
      return { title: 'Log Deviation', breadcrumb: 'Deviations / Log Deviation' };
    }
    if (path.startsWith('/deviations/')) {
      return { title: 'Deviation Details', breadcrumb: 'Deviations / Record Inspection' };
    }
    if (path === '/capas') {
      return { title: 'Corrective & Preventive Actions (CAPA)', breadcrumb: 'QMS / CAPA' };
    }
    if (path === '/change-control') {
      return { title: 'Change Control Management', breadcrumb: 'QMS / Change Control' };
    }
    if (path === '/audits') {
      return { title: 'Internal & External Audits', breadcrumb: 'QMS / Audits' };
    }
    if (path === '/reports') {
      return { title: 'Quality Analytics & Reports', breadcrumb: 'QMS / Reports' };
    }
    if (path === '/settings') {
      return { title: 'System Configuration', breadcrumb: 'QMS / Settings' };
    }
    return { title: 'Quality Management System', breadcrumb: 'QMS' };
  };

  const { title, breadcrumb } = getPageMeta();

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header pageTitle={title} breadcrumb={breadcrumb} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
