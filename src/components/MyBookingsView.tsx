import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookingStatus, BookingRequest } from '../types';
import { 
  CalendarCheck2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Building, 
  Calendar, 
  Users, 
  Trash2, 
  PlusCircle, 
  AlertCircle,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Globe
} from 'lucide-react';
import { formatTimeRange, formatDateTime12Hour } from '../utils/timeFormat';

export const MyBookingsView: React.FC = () => {
  const { 
    userBookings,
    allInstitutions, 
    currentInstitution, 
    cancelBooking, 
    setActiveView, 
    setCurrentRole 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              My Booking Requests & Records
            </h1>
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              {currentInstitution.shortName}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Track submitted facility requests, monitor administrator clearance decisions, and access approved reservation permits.
          </p>
        </div>

        <button
          onClick={() => setActiveView('new-booking')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reservation Request</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Records ({userBookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                  : 'text-amber-800 hover:text-amber-950'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved ({approvedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white font-semibold shadow-xs'
                  : 'text-red-700 hover:text-red-950'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected ({rejectedCount})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by reference, event, facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Administrative Review Status Tip */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Pending Administrative Review:</strong>
              <span className="ml-1">
                You have {pendingCount} request(s) awaiting approval by the campus facility office. You can switch to the <strong>University Admin</strong> role to review or approve reservations.
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setCurrentRole('university_admin');
              setActiveView('admin-requests');
            }}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>Switch to Admin Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => {
          const hostInst = allInstitutions.find((i) => i.id === booking.institutionId);
          const isCrossUniversity = booking.isExternalRequest || (booking.institutionId !== currentInstitution.id);

          let statusCard = (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Review</span>
            </div>
          );

          if (booking.status === 'approved') {
            statusCard = (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Approved & Confirmed</span>
              </div>
            );
          } else if (booking.status === 'rejected') {
            statusCard = (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200">
                <XCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Rejected</span>
              </div>
            );
          }

          return (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top row: Reference & Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {booking.referenceNumber}
                  </span>
                  {hostInst && (
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500" />
                      Host: {hostInst.shortName}
                    </span>
                  )}
                  {isCrossUniversity && (
                    <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-indigo-600" />
                      Cross-University Request
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    Submitted: {formatDateTime12Hour(booking.createdAt)}
                  </span>
                </div>
                {statusCard}
              </div>

              {/* Middle row: Event Details & Facility */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    {booking.eventName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      {booking.facilityName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {booking.purpose}
                    </span>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      Notes: "{booking.notes}"
                    </p>
                  )}
                </div>

                {/* Schedule & Requester */}
                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>{formatTimeRange(booking.startTime, booking.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{booking.attendees} attendees</span>
                  </div>
                </div>
              </div>

              {/* Status Specific Outcome Message */}
              {booking.status === 'approved' && (
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span>Official Permit Issued: <strong>{booking.permitReference || 'PERMIT-2026-VAL'}</strong></span>
                      <span className="text-emerald-700 text-[11px] block">
                        Approved by {booking.reviewedBy || 'Facility Administration'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBookingForPermit(booking)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] transition-colors cursor-pointer"
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

        {/* Empty state */}
        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Booking Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {statusFilter !== 'all'
                ? `You have no ${statusFilter} booking requests in this workspace.`
                : 'You have not submitted any facility reservation requests yet.'}
            </p>
            <button
              onClick={() => setActiveView('new-booking')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Submit Your First Request
            </button>
          </div>
        )}
      </div>

      {/* Permit Slip Modal */}
      {selectedBookingForPermit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="text-center border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                Official Facility Entry Permit
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {currentInstitution.name}
              </h3>
              <p className="text-xs text-slate-500">
                SmartSpace Institutional Facility Permit
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Permit Code:</span>
                <span className="font-bold text-blue-600">{selectedBookingForPermit.permitReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-bold text-slate-800">{selectedBookingForPermit.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="font-bold text-slate-800">{selectedBookingForPermit.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-800">
                  {selectedBookingForPermit.date} ({formatTimeRange(selectedBookingForPermit.startTime, selectedBookingForPermit.endTime)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Requester:</span>
                <span className="font-bold text-slate-800">{selectedBookingForPermit.requesterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Approved By:</span>
                <span className="font-bold text-slate-800">{selectedBookingForPermit.reviewedBy}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center italic">
              Present this digital permit code to campus security and building custodians upon entry.
            </p>

            <button
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
