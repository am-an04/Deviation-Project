import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Deviations } from './pages/Deviations';
import { LogDeviation } from './pages/LogDeviation';
import { DeviationDetail } from './pages/DeviationDetail';
import { PlaceholderModule } from './pages/PlaceholderModule';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="deviations" element={<Deviations />} />
        <Route path="deviations/new" element={<LogDeviation />} />
        <Route path="deviations/:id" element={<DeviationDetail />} />
        <Route path="capas" element={<PlaceholderModule moduleName="Corrective & Preventive Actions (CAPA)" />} />
        <Route path="change-control" element={<PlaceholderModule moduleName="Change Control Management" />} />
        <Route path="audits" element={<PlaceholderModule moduleName="Internal & Supplier Audits" />} />
        <Route path="reports" element={<PlaceholderModule moduleName="Quality Analytics & Regulatory Reports" />} />
        <Route path="settings" element={<PlaceholderModule moduleName="System & Workflow Settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
