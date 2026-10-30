import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookingStatus, BookingRequest } from '../types';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Building,
  RotateCcw
} from 'lucide-react';
import { formatTimeRange, formatTo12Hour } from '../utils/timeFormat';

export const AdminRecordsView: React.FC = () => {
  const { 
    institutionBookings, 
    currentInstitution, 
    institutionFacilities,
    resetBookingsToDefault,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [dateFilter, setDateFilter] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredRecords = useMemo(() => {
    return institutionBookings.filter((b) => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      if (facilityFilter !== 'All' && b.facilityId !== facilityFilter) return false;
      if (dateFilter && b.date !== dateFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.referenceNumber.toLowerCase().includes(q) ||
          b.eventName.toLowerCase().includes(q) ||
          b.requesterName.toLowerCase().includes(q) ||
          b.facilityName.toLowerCase().includes(q) ||
          (b.permitReference && b.permitReference.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [institutionBookings, statusFilter, facilityFilter, dateFilter, searchQuery]);

  const exportRecordsCsv = () => {
    const headers = [
      'Booking Reference',
      'Facility',
      'Event Name',
      'Purpose',
      'Date',
      'Start Time',
      'End Time',
      'Attendees',
      'Requester Name',
      'Role',
      'Email',
      'Status',
      'Permit Reference',
      'Decision Note / Rejection Reason',
      'Submitted At',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.referenceNumber}"`,
      `"${r.facilityName}"`,
      `"${r.eventName.replace(/"/g, '""')}"`,
      `"${r.purpose.replace(/"/g, '""')}"`,
      `"${r.date}"`,
      `"${r.startTime}"`,
      `"${r.endTime}"`,
      r.attendees,
      `"${r.requesterName}"`,
      `"${r.requesterRole}"`,
      `"${r.requesterEmail}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.permitReference || ''}"`,
      `"${(r.rejectionReason || '').replace(/"/g, '""')}"`,
      `"${new Date(r.createdAt).toISOString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartspace_reservations_${currentInstitution.shortName.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'CSV Export Complete', `Exported ${filteredRecords.length} reservation records.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Centralized Reservation Records
            </h1>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {currentInstitution.name}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Institutional master log of all submitted requests, authorized permits, and administrative rejection decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Reset to default initial demonstration records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Records</span>
          </button>

          <button
            onClick={exportRecordsCsv}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference, event, requester..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Facility Filter */}
          <div className="sm:col-span-3">
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="All">All Facilities</option>
              {institutionFacilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved Only</option>
              <option value="rejected">Rejected Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {(searchQuery || facilityFilter !== 'All' || statusFilter !== 'All' || dateFilter) && (
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span>Filtered result: {filteredRecords.length} record(s)</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setFacilityFilter('All');
                setStatusFilter('All');
                setDateFilter('');
              }}
              className="text-blue-600 hover:underline cursor-pointer text-[11px]"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Table Container */}
      {/* Dual Layout: Stacked Cards for Mobile, Data Table for Tablet & Desktop */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Mobile View: Stacked Record Cards (No horizontal overflow) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredRecords.map((r) => (
            <div key={r.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {r.referenceNumber}
                </span>
                <div>
                  {r.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      <Clock className="w-3 h-3 text-amber-600" /> Pending
                    </span>
                  )}
                  {r.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                    </span>
                  )}
                  {r.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                      <XCircle className="w-3 h-3 text-red-600" /> Rejected
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{r.eventName}</h4>
                <p className="text-xs text-indigo-600 font-semibold">{r.facilityName}</p>
                <p className="text-xs text-slate-500">Purpose: {r.purpose}</p>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold">{r.date} ({formatTimeRange(r.startTime, r.endTime)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Attendees:</span>
                  <span className="font-semibold">{r.attendees} persons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requester:</span>
                  <span className="font-semibold">{r.requesterName} ({r.requesterRole})</span>
                </div>
              </div>

              {r.permitReference && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  Permit Reference: <strong>{r.permitReference}</strong>
                </div>
              )}

              {r.rejectionReason && (
                <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                  Reason: <strong>{r.rejectionReason}</strong>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Event & Purpose</th>
                <th className="py-3 px-4">Requester</th>
                <th className="py-3 px-4">Date & Schedule</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Decision / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => {
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Booking Reference */}
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                      {r.referenceNumber}
                      {r.permitReference && (
                        <span className="block text-[10px] text-emerald-700 font-sans">
                          {r.permitReference}
                        </span>
                      )}
                    </td>

                    {/* Facility */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{r.facilityName}</div>
                      <div className="text-[11px] text-slate-400">
                        Submitted: {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Event & Purpose */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={r.eventName}>
                        {r.eventName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={r.purpose}>
                        {r.purpose}
                      </div>
                    </td>

                    {/* Requester */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{r.requesterName}</div>
                      <div className="text-[10px] text-slate-500">
                        {r.requesterRole} · {r.requesterEmail}
                      </div>
                    </td>

                    {/* Date & Schedule */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{r.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatTimeRange(r.startTime, r.endTime)} ({r.attendees} pax)
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {r.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-amber-600" /> Pending
                        </span>
                      )}
                      {r.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                        </span>
                      )}
                      {r.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-semibold">
                          <XCircle className="w-3 h-3 text-red-600" /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Decision / Reason */}
                    <td className="py-3 px-4 max-w-xs text-[11px]">
                      {r.status === 'approved' && (
                        <span className="text-emerald-700">
                          Approved by {r.reviewedBy || 'Facility Admin'}
                        </span>
                      )}
                      {r.status === 'rejected' && (
                        <span className="text-red-700 line-clamp-2" title={r.rejectionReason}>
                          Reason: {r.rejectionReason || 'No reason specified'}
                        </span>
                      )}
                      {r.status === 'pending' && (
                        <span className="text-slate-400 italic">
                          Awaiting administrative review
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No reservation records match the selected criteria.
          </div>
        )}
      </div>

      {/* Prototype Persistence Disclosure */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong>Prototype Data Scope Notice:</strong>
          <span className="ml-1">
            Reservation records in this MVP are persisted locally in the tester’s browser session for demonstration purposes. This is not a centralized cloud database across remote concurrent devices.
          </span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Reset Reservation Records?
            </h3>
            <p className="text-xs text-slate-600">
              This will restore the workspace bookings to the initial seed demo state. Any requests submitted during this test session will be reset.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetBookingsToDefault();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
