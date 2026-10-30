import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookingRequest } from '../types';
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Building, 
  Calendar, 
  Users, 
  ShieldAlert, 
  FileText,
  User,
  ArrowRight,
  Filter,
  Globe
} from 'lucide-react';
import { formatDateTime12Hour, formatTimeRange, formatTo12Hour } from '../utils/timeFormat';

export const AdminRequestsView: React.FC = () => {
  const { 
    institutionBookings, 
    approveBooking, 
    rejectBooking, 
    checkTimeConflict,
    currentInstitution,
    setCurrentRole,
    setActiveView 
  } = useApp();

  const [rejectingBooking, setRejectingBooking] = useState<BookingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedPresetReason, setSelectedPresetReason] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');

  const pendingRequests = institutionBookings.filter((b) => b.status === 'pending');
  const allRequests = institutionBookings;

  const displayList = activeTab === 'pending' ? pendingRequests : allRequests;

  const presetReasons = [
    'Facility unavailable due to scheduled campus maintenance or physical plant inspection.',
    'Administrative priority: Venue reserved for official university academic council / dean function.',
    'Expected attendee count exceeds safety limits or physical seating capacity of this room.',
    'Incomplete documentation: Missing faculty adviser endorsement or student affairs clearance.',
    'Proposed activity falls outside authorized student curfew or building operating hours.',
  ];

  const handleOpenReject = (booking: BookingRequest) => {
    setRejectingBooking(booking);
    setRejectionReason('');
    setSelectedPresetReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectingBooking) return;
    const finalReason = selectedPresetReason || rejectionReason;
    if (!finalReason.trim()) return;

    rejectBooking(rejectingBooking.id, finalReason);
    setRejectingBooking(null);
  };

  return (
    <div className="space-y-6">
      {/* Admin Review Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                Administrator Review Console
              </span>
              <span className="text-slate-400 text-xs">
                {currentInstitution.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Pending Facility Clearance Requests
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Evaluate reservation requests, inspect automated schedule conflict checks, and issue official permits or rejection notices.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700 text-center">
              <div className="text-xl font-black text-amber-400">{pendingRequests.length}</div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Needs Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Actioned Requests ({allRequests.length})
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{displayList.length}</strong> record(s)
        </div>
      </div>

      {/* Requests Queue */}
      <div className="space-y-4">
        {displayList.map((booking) => {
          // Perform live conflict check for pending requests
          const conflict = checkTimeConflict(
            booking.facilityId,
            booking.date,
            booking.startTime,
            booking.endTime,
            booking.id
          );

          const isPending = booking.status === 'pending';

          return (
            <div
              key={booking.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all space-y-4 ${
                isPending
                  ? conflict.hasConflict
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-amber-300/80 bg-white'
                  : 'border-slate-200'
              }`}
            >
              {/* Request Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {booking.referenceNumber}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Submitted: {formatDateTime12Hour(booking.createdAt)}
                  </span>
                  {booking.isExternalRequest && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-semibold flex items-center gap-1 border border-indigo-200">
                      <Globe className="w-3 h-3 text-indigo-600" />
                      External: {booking.requesterInstitutionName || booking.requesterInstitutionId}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {booking.status === 'pending' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Administrator Action
                    </span>
                  )}
                  {booking.status === 'approved' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved ({booking.permitReference})
                    </span>
                  )}
                  {booking.status === 'rejected' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1 border border-red-200">
                      <XCircle className="w-3.5 h-3.5 text-red-600" /> Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Event & Requester Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {booking.eventName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      {booking.facilityName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      Purpose: {booking.purpose}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Requester: <strong>{booking.requesterName}</strong> ({booking.requesterRole}) · {booking.requesterEmail}
                      </span>
                    </div>
                    {booking.organization && (
                      <div className="text-[11px] text-slate-500 pl-5">
                        Organization: {booking.organization}
                      </div>
                    )}
                    {booking.notes && (
                      <div className="text-[11px] text-slate-500 pl-5 italic">
                        Special Notes: "{booking.notes}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Schedule & Capacity Details */}
                <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Date: <strong>{booking.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Time: <strong>{formatTimeRange(booking.startTime, booking.endTime)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Expected: <strong>{booking.attendees} attendees</strong></span>
                  </div>
                </div>
              </div>

              {/* Conflict Verification Warning */}
              {isPending && (
                <div>
                  {conflict.hasConflict && conflict.conflictingBooking ? (
                    <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-xs text-red-950 flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-red-900">
                          CONFLICTING APPROVED RESERVATION DETECTED
                        </strong>
                        <span className="text-red-800">
                          This facility is already reserved by "{conflict.conflictingBooking.eventName}" ({formatTo12Hour(conflict.conflictingBooking.startTime)} – {formatTo12Hour(conflict.conflictingBooking.endTime)}). You CANNOT approve this request without modifying schedules or rejecting.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Clear for Approval:</strong> No conflicting approved bookings exist for this facility on {booking.date} during {formatTimeRange(booking.startTime, booking.endTime)}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Decision Actions for Pending Requests */}
              {isPending && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    Actions will immediately update the applicant’s booking status and issue permits or feedback.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReject(booking)}
                      className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Reject with Reason</span>
                    </button>

                    <button
                      onClick={() => approveBooking(booking.id)}
                      disabled={conflict.hasConflict}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                        conflict.hasConflict
                          ? 'bg-slate-400 cursor-not-allowed opacity-60'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      title={conflict.hasConflict ? 'Cannot approve due to conflicting reservation' : 'Approve reservation'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Reservation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Recorded Rejection Reason display if already rejected */}
              {booking.status === 'rejected' && booking.rejectionReason && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <span className="font-semibold text-red-700 block mb-0.5">Rejection Reason Provided:</span>
                  <span className="italic">"{booking.rejectionReason}"</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {displayList.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Pending Requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted facility requests for {currentInstitution.shortName} have been reviewed.
            </p>
            <button
              onClick={() => {
                setCurrentRole('student');
                setActiveView('new-booking');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
            >
              Submit a Test Request as Student
            </button>
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-2 text-red-600 border-b border-slate-100 pb-3">
              <XCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Reject Reservation Request
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Provide an administrative explanation for rejecting request <strong>{rejectingBooking.referenceNumber}</strong> ("{rejectingBooking.eventName}"). This reason will be displayed directly to the applicant.
            </p>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Common Reason Preset:
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {presetReasons.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPresetReason(preset);
                      setRejectionReason(preset);
                    }}
                    className={`w-full text-left p-2 rounded text-xs transition-colors cursor-pointer border ${
                      selectedPresetReason === preset
                        ? 'bg-red-50 border-red-300 text-red-900 font-medium'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Or Write Custom Justification <span className="text-red-500">*</span>:
              </label>
              <textarea
                rows={3}
                placeholder="Enter specific administrative reasons for denying this booking..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setSelectedPresetReason('');
                }}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setRejectingBooking(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer ${
                  !rejectionReason.trim()
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
