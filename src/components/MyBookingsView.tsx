import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookingStatus, BookingRequest } from '../types';
import { motion } from 'motion/react';
import {
  CalendarCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Building,
  Calendar,
  Users,
  Trash2,
  PlusCircle,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Globe,
  LayoutGrid,
  Table2,
} from 'lucide-react';
import { formatTimeRange, formatDateTime12Hour } from '../utils/timeFormat';

export const MyBookingsView: React.FC = () => {
  const {
    userBookings,
    allInstitutions,
    currentInstitution,
    cancelBooking,
    setActiveView,
    setCurrentRole,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedBookingForPermit, setSelectedBookingForPermit] = useState<BookingRequest | null>(null);

  const filteredBookings = useMemo(() => {
    return userBookings.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.referenceNumber.toLowerCase().includes(q) ||
          b.eventName.toLowerCase().includes(q) ||
          b.facilityName.toLowerCase().includes(q) ||
          b.requesterName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [userBookings, statusFilter, searchQuery]);

  const pendingCount = userBookings.filter((b) => b.status === 'pending').length;
  const approvedCount = userBookings.filter((b) => b.status === 'approved').length;
  const rejectedCount = userBookings.filter((b) => b.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Notion Workspace Document Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-[#0077C8]">{currentInstitution.shortName} Workspace</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{userBookings.length} total submissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            My Booking Requests &amp; Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track submitted requests, monitor administrator clearances, and inspect digital entry permits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveView('new-booking')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reservation Request</span>
        </button>
      </div>

      {/* Linear Filter Bar + Notion Database View Switcher */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all' as const, label: `All (${userBookings.length})` },
            { id: 'pending' as const, label: `Pending (${pendingCount})` },
            { id: 'approved' as const, label: `Approved (${approvedCount})` },
            { id: 'rejected' as const, label: `Rejected (${rejectedCount})` },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                  active ? 'text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="user-book-filter"
                    transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                    className="absolute inset-0 bg-slate-900 rounded-lg"
                  />
                )}
                <span className="relative z-10 tabular-nums">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reference, event, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
            />
          </div>

          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
            {[
              { id: 'cards' as const, label: 'Cards', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { id: 'table' as const, label: 'Database', icon: <Table2 className="w-3.5 h-3.5" /> },
            ].map((mode) => {
              const active = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setViewMode(mode.id)}
                  className={`relative px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    active ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="user-book-view-mode"
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                      className="absolute inset-0 bg-white rounded-md shadow-2xs"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    {mode.icon}
                    <span>{mode.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pending Administrative Review Callout */}
      {pendingCount > 0 && (
        <div className="bg-[#FAF9F6] border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-800">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Pending Administrative Review:</strong>
              <span className="ml-1 text-slate-600">
                You have <span className="tabular-nums font-semibold text-slate-900">{pendingCount}</span> request(s) awaiting physical plant clearance. Switch to University Admin to review in demo mode.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCurrentRole('university_admin');
              setActiveView('admin-requests');
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Switch to Admin Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* VIEW A: NOTION DATABASE TABLE */}
      {viewMode === 'table' && filteredBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-[#FBFBFA] text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 px-3 whitespace-nowrap">Reference</th>
                <th className="py-2.5 px-3">Event &amp; Purpose</th>
                <th className="py-2.5 px-3">Facility &amp; Campus</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Schedule</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBookings.map((booking) => {
                const hostInst = allInstitutions.find((i) => i.id === booking.institutionId);
                return (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-[#0077C8] whitespace-nowrap tabular-nums">
                      {booking.referenceNumber}
                    </td>
                    <td className="py-3 px-3 min-w-[180px]">
                      <div className="font-semibold text-slate-950">{booking.eventName}</div>
                      <div className="text-[11px] text-slate-500">{booking.purpose}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900">{booking.facilityName}</div>
                      <div className="text-[11px] text-slate-500">{hostInst?.shortName || 'Campus'}</div>
                    </td>
                    <td className="py-3 px-3 tabular-nums whitespace-nowrap text-slate-700">
                      <div className="font-medium">{booking.date}</div>
                      <div className="text-[11px] text-slate-500">
                        {formatTimeRange(booking.startTime, booking.endTime)} · {booking.attendees} pax
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-semibold">
                      {booking.status === 'pending' && (
                        <span className="text-amber-700 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                      {booking.status === 'approved' && (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {booking.status === 'rejected' && (
                        <span className="text-red-700 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {booking.status === 'approved' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForPermit(booking)}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                        >
                          View Permit
                        </button>
                      ) : booking.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => cancelBooking(booking.id)}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:border-red-300 text-red-600 hover:bg-red-50 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW B: LINEAR CARDS */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const hostInst = allInstitutions.find((i) => i.id === booking.institutionId);
            const isCrossUniversity = booking.isExternalRequest || booking.institutionId !== currentInstitution.id;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 p-5 transition-colors space-y-4"
              >
                {/* Top row: Unboxed Reference & Status */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-[#0077C8] tabular-nums">
                      {booking.referenceNumber}
                    </span>
                    {hostInst && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-semibold text-slate-700">Host: {hostInst.shortName}</span>
                      </>
                    )}
                    {isCrossUniversity && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-semibold text-indigo-700 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Cross-Campus
                        </span>
                      </>
                    )}
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-400 tabular-nums">
                      Submitted {formatDateTime12Hour(booking.createdAt)}
                    </span>
                  </div>

                  <div>
                    {booking.status === 'pending' && (
                      <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Pending Review
                      </span>
                    )}
                    {booking.status === 'approved' && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved &amp; Confirmed
                      </span>
                    )}
                    {booking.status === 'rejected' && (
                      <span className="text-red-700 font-semibold flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle row: Event Details & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-1.5">
                    <h3 className="text-base font-bold text-slate-950">{booking.eventName}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building className="w-3.5 h-3.5 text-[#0077C8]" />
                        {booking.facilityName}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{booking.purpose}</span>
                    </div>

                    {booking.notes && (
                      <p className="text-xs text-slate-500 italic mt-1">Notes: "{booking.notes}"</p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 border-l-0 md:border-l border-slate-200 md:pl-5 flex flex-col justify-center tabular-nums">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.attendees} attendees</span>
                    </div>
                  </div>
                </div>

                {/* Status Specific Outcome Message */}
                {booking.status === 'approved' && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span>
                          Official Permit Issued:{' '}
                          <strong className="font-mono tabular-nums">{booking.permitReference || 'PERMIT-2026-VAL'}</strong>
                        </span>
                        <span className="text-emerald-700 text-[11px] block">
                          Approved by {booking.reviewedBy || 'Facility Administration'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForPermit(booking)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-[11px] transition-colors cursor-pointer"
                    >
                      View Official Permit Slip
                    </button>
                  </div>
                )}

                {booking.status === 'rejected' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Reason for Administrative Rejection:</strong>
                      <span className="text-red-800 mt-0.5 block">
                        "{booking.rejectionReason || 'Facility unavailable for non-academic usage during requested period.'}"
                      </span>
                      <span className="text-[11px] text-red-600 block mt-1">
                        Reviewed by {booking.reviewedBy || 'Facility Administration Office'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Requester: {booking.requesterName} ({booking.requesterRole})
                  </span>

                  {booking.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => cancelBooking(booking.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold cursor-pointer text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Request</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <CalendarCheck2 className="w-9 h-9 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No Booking Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `You have no ${statusFilter} booking requests in this workspace.`
              : 'You have not submitted any facility reservation requests yet.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveView('new-booking')}
            className="px-4 py-2 bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Submit Your First Request
          </button>
        </div>
      )}

      {/* Permit Slip Modal */}
      {selectedBookingForPermit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="text-center border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Official Facility Entry Permit
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">{currentInstitution.name}</h3>
              <p className="text-xs text-slate-500">SmartSpace Institutional Facility Permit</p>
            </div>

            <div className="p-3.5 bg-[#FBFBFA] border border-slate-200 rounded-lg text-xs space-y-2 font-mono tabular-nums">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Permit Code:</span>
                <span className="font-bold text-[#0077C8]">{selectedBookingForPermit.permitReference}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-bold text-slate-800">{selectedBookingForPermit.referenceNumber}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Facility:</span>
                <span className="font-bold text-slate-800 text-right">{selectedBookingForPermit.facilityName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-bold text-slate-800 text-right">
                  {selectedBookingForPermit.date} ({formatTimeRange(selectedBookingForPermit.startTime, selectedBookingForPermit.endTime)})
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Requester:</span>
                <span className="font-bold text-slate-800">{selectedBookingForPermit.requesterName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Approved By:</span>
                <span className="font-bold text-slate-800">{selectedBookingForPermit.reviewedBy}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center italic">
              Present this digital permit code to campus security and building custodians upon entry.
            </p>

            <button
              type="button"
              onClick={() => setSelectedBookingForPermit(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
            >
              Close Permit View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
