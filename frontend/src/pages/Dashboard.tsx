import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDeviations } from '../store/slices/deviationsSlice';
import {
  AlertTriangle,
  ShieldAlert,
  FileCheck,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { records, total } = useAppSelector((state) => state.deviations);

  useEffect(() => {
    dispatch(fetchDeviations());
  }, [dispatch]);

  const criticalCount = records.filter(
    (r) => r.final_severity === 'Critical' || r.ai_suggested_severity === 'Critical'
  ).length;

  const majorCount = records.filter(
    (r) => r.final_severity === 'Major' || r.ai_suggested_severity === 'Major'
  ).length;

  const submittedCount = records.filter((r) => r.status === 'Submitted').length;

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#17212B]">Quality Operations Overview</h2>
          <p className="text-xs text-[#5B6875] mt-1">
            Real-time status of manufacturing non-conformances, excursions, and AI deviation intakes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/deviations/new')}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#174A7E] hover:bg-[#123A63] rounded-md shadow-sm flex items-center space-x-2 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Deviation</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6875]">
            <span className="text-xs font-medium">Total Deviations</span>
            <AlertTriangle className="w-4 h-4 text-[#174A7E]" />
          </div>
          <div className="text-2xl font-bold text-[#17212B] mt-2">{total}</div>
          <div className="text-[11px] text-[#247A45] mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> Active database records
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6875]">
            <span className="text-xs font-medium">Critical Risk</span>
            <ShieldAlert className="w-4 h-4 text-[#B42318]" />
          </div>
          <div className="text-2xl font-bold text-[#B42318] mt-2">{criticalCount}</div>
          <div className="text-[11px] text-[#5B6875] mt-1">Direct safety/release impact</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6875]">
            <span className="text-xs font-medium">Major Risk</span>
            <Clock className="w-4 h-4 text-[#A15C00]" />
          </div>
          <div className="text-2xl font-bold text-[#A15C00] mt-2">{majorCount}</div>
          <div className="text-[11px] text-[#5B6875] mt-1">CPP/CQA boundaries exceeded</div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-xs">
          <div className="flex items-center justify-between text-[#5B6875]">
            <span className="text-xs font-medium">Submitted Records</span>
            <FileCheck className="w-4 h-4 text-[#247A45]" />
          </div>
          <div className="text-2xl font-bold text-[#247A45] mt-2">{submittedCount}</div>
          <div className="text-[11px] text-[#5B6875] mt-1">Human reviewed & logged</div>
        </div>
      </div>

      {/* Recent Deviations List preview */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-xs p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCE2E8]">
          <h3 className="text-sm font-semibold text-[#17212B]">
            Recent Deviation Activity
          </h3>
          <button
            type="button"
            onClick={() => navigate('/deviations')}
            className="text-xs font-medium text-[#2F6FED] hover:underline flex items-center"
          >
            View All Register Records <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#5B6875]">
            No deviations recorded yet. Upload a deviation report to get started.
          </div>
        ) : (
          <div className="divide-y divide-[#DCE2E8]">
            {records.slice(0, 5).map((dev) => (
              <div
                key={dev.deviation_id}
                onClick={() => navigate(`/deviations/${dev.deviation_id}`)}
                className="py-3 flex items-center justify-between hover:bg-[#F5F7FA] px-2 rounded cursor-pointer transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-[#174A7E]">
                      {dev.deviation_id}
                    </span>
                    <span className="text-xs font-medium text-[#17212B]">
                      {dev.title || 'Untitled Deviation'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5B6875] mt-0.5">
                    {dev.department} · {dev.related_product || 'General'} · Batch: {dev.batch_number || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-gray-100 text-[#17212B] border-gray-300">
                    {dev.final_severity || dev.ai_suggested_severity || 'Minor'}
                  </span>
                  <span className="text-[11px] text-[#5B6875]">
                    {dev.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
