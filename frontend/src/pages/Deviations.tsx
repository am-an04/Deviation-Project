import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchDeviations,
  setFilterSearch,
  setFilterStatus,
  setFilterSeverity,
  resetFilters,
} from '../store/slices/deviationsSlice';
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  FileText,
} from 'lucide-react';

export const Deviations: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { records, loading, error, filters } = useAppSelector(
    (state) => state.deviations
  );

  useEffect(() => {
    dispatch(fetchDeviations());
  }, [dispatch, filters.search, filters.status, filters.severity]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilterSearch(e.target.value));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterStatus(e.target.value));
  };

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilterSeverity(e.target.value));
  };

  const getSeverityBadge = (sev: string | null) => {
    switch (sev) {
      case 'Critical':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-red-100 text-[#B42318] border-red-300">
            Critical
          </span>
        );
      case 'Major':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-amber-100 text-[#A15C00] border-amber-300">
            Major
          </span>
        );
      case 'Moderate':
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-blue-100 text-[#174A7E] border-blue-300">
            Moderate
          </span>
        );
      case 'Minor':
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-green-100 text-[#247A45] border-green-300">
            Minor
          </span>
        );
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#174A7E] border border-[#CBD4DD]">
            Submitted
          </span>
        );
      case 'Draft':
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-[#5B6875] border border-gray-300">
            Draft
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#2F6FED] border border-blue-200">
            {status || 'Logged'}
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

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-[#DCE2E8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17212B]">Deviation Records</h2>
          <p className="text-xs text-[#5B6875] mt-0.5">
            Enterprise register of validated quality deviations, excursions, and event reports.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => dispatch(fetchDeviations())}
            className="p-2 text-[#5B6875] hover:text-[#17212B] bg-white border border-[#CBD4DD] rounded-md hover:bg-[#F5F7FA] transition-colors"
            title="Refresh Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => navigate('/deviations/new')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#174A7E] hover:bg-[#123A63] rounded-md shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Log Deviation</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-[#DCE2E8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A96A3]" />
          <input
            type="text"
            placeholder="Search ID, title, product, batch..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F7FA] border border-[#CBD4DD] rounded-md text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-[#5B6875]">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </div>
          <select
            value={filters.severity}
            onChange={handleSeverityChange}
            className="text-xs bg-[#F5F7FA] border border-[#CBD4DD] rounded-md py-1.5 px-2.5 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="Major">Major</option>
            <option value="Moderate">Moderate</option>
            <option value="Minor">Minor</option>
          </select>

          <div className="flex items-center space-x-1.5 text-xs text-[#5B6875]">
            <span>Status:</span>
          </div>
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="text-xs bg-[#F5F7FA] border border-[#CBD4DD] rounded-md py-1.5 px-2.5 text-[#17212B] focus:outline-none focus:border-[#2F6FED]"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Draft">Draft</option>
          </select>

          {(filters.search || filters.status !== 'All' || filters.severity !== 'All') && (
            <button
              type="button"
              onClick={() => dispatch(resetFilters())}
              className="text-xs text-[#2F6FED] hover:underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-[#DCE2E8] shadow-sm overflow-hidden">
        {loading && records.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5B6875] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2F6FED]" />
            <div>Loading deviation records from database...</div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#B42318] space-y-2">
            <AlertTriangle className="w-6 h-6 mx-auto" />
            <div>{error}</div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#8A96A3] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-[#17212B]">
              No deviation records found
            </div>
            <p className="text-xs text-[#5B6875] max-w-sm mx-auto">
              No deviations match your active filters, or no records have been submitted yet.
            </p>
            <button
              type="button"
              onClick={() => navigate('/deviations/new')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#174A7E] hover:bg-[#123A63] rounded-md shadow-xs"
            >
              Log First Deviation
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#DCE2E8] text-[11px] font-semibold text-[#5B6875] uppercase tracking-wider">
                  <th className="py-3 px-4">Deviation ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Occurrence Date</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Product / Material</th>
                  <th className="py-3 px-4">Batch / Lot</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE2E8] text-xs text-[#17212B]">
                {records.map((dev) => (
                  <tr
                    key={dev.deviation_id}
                    onClick={() => navigate(`/deviations/${dev.deviation_id}`)}
                    className="hover:bg-[#F5F7FA] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#174A7E]">
                      {dev.deviation_id}
                    </td>
                    <td className="py-3 px-4 font-medium max-w-xs truncate" title={dev.title || ''}>
                      {dev.title || 'Untitled Deviation'}
                    </td>
                    <td className="py-3 px-4 text-[#5B6875]">
                      {formatDate(dev.date_of_occurrence)}
                    </td>
                    <td className="py-3 px-4 text-[#5B6875]">
                      {dev.department || '—'}
                    </td>
                    <td className="py-3 px-4 text-[#5B6875] max-w-[150px] truncate" title={dev.related_product || ''}>
                      {dev.related_product || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#5B6875]">
                      {dev.batch_number || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {getSeverityBadge(dev.final_severity || dev.ai_suggested_severity)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(dev.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ChevronRight className="w-4 h-4 text-[#8A96A3] inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
