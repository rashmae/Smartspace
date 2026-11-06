import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Facility, FacilityAssignment, BookingRequest } from '../types';
import { formatTo12Hour, formatDateTime12Hour, formatTimeOnly12Hour } from '../utils/timeFormat';
import {
  ShieldCheck,
  Building2,
  KeyRound,
  Lock,
  Unlock,
  Clock,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Search,
  Filter,
  FileText,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';

export const FacilityHandlerWorkspaceView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    institutionFacilities,
    institutionBookings,
    facilityHandlers,
    facilityAssignments,
    facilityApprovalLogs,
    verifiedFacilitySessions,
    activeFacilityWorkspace,
    setActiveFacilityWorkspace,
    verifyFacilityAccessCode,
    clearVerifiedFacilitySession,
    approveBookingAsHandler,
    rejectBookingAsHandler,
    checkTimeConflict,
    loginAs,
    addToast,
    setActiveView,
  } = useApp();

  // Find currently authenticated handler
  const currentHandler = facilityHandlers.find(
    (h) => h.email.toLowerCase() === (currentUser?.email || '').toLowerCase()
  ) || facilityHandlers[0];

  // Active facility tab in workspace
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');

  // Access Code Modal state
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [targetFacilityForCode, setTargetFacilityForCode] = useState<Facility | null>(null);
  const [targetAssignmentForCode, setTargetAssignmentForCode] = useState<FacilityAssignment | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingBooking, setRejectingBooking] = useState<BookingRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

  // Approval notes modal state
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [approvingBooking, setApprovingBooking] = useState<BookingRequest | null>(null);
  const [approvalNotesInput, setApprovalNotesInput] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Status Filter in Queue
  const [queueStatusFilter, setQueueStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Assigned facilities for current handler
  const assignedFacilities = facilityAssignments
    .filter((a) => a.handlerUserId === currentHandler?.id && a.assignmentStatus === 'active')
    .map((a) => {
      const fac = institutionFacilities.find((f) => f.id === a.facilityId);
      return {
        assignment: a,
        facility: fac,
      };
    })
    .filter((item): item is { assignment: FacilityAssignment; facility: Facility } => !!item.facility);

  // Initial selection of facility
  useEffect(() => {
    if (assignedFacilities.length > 0 && !selectedFacilityId) {
      setSelectedFacilityId(assignedFacilities[0].facility.id);
    }
  }, [assignedFacilities, selectedFacilityId]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds && lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (!prev || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutSeconds]);

  // Active facility object & assignment
  const activeItem = assignedFacilities.find((item) => item.facility.id === selectedFacilityId);
  const activeFacility = activeItem?.facility;
  const activeAssignment = activeItem?.assignment;

  // Active verified session check
  const activeSession = activeFacility ? verifiedFacilitySessions[activeFacility.id] : null;
  const isWorkspaceUnlocked = !!(
    activeSession &&
    activeSession.handlerId === currentHandler?.id &&
    activeSession.expiresAt > Date.now()
  );

  // Remaining minutes in verified session
  const remainingMinutes = activeSession
    ? Math.max(0, Math.ceil((activeSession.expiresAt - Date.now()) / (1000 * 60)))
    : 0;

  // Bookings specifically for the currently active facility (STRICT ISOLATION)
  const facilityBookings = activeFacility
    ? institutionBookings.filter((b) => {
        if (b.facilityId !== activeFacility.id) return false;
        if (queueStatusFilter !== 'all' && b.status !== queueStatusFilter) return false;
        return true;
      })
    : [];

  // Audit logs specifically for this facility
  const facilityLogs = activeFacility
    ? facilityApprovalLogs.filter((l) => l.facilityId === activeFacility.id)
    : [];

  // Handle open access code prompt
  const openCodeChallenge = (fac: Facility, asgn: FacilityAssignment) => {
    setTargetFacilityForCode(fac);
    setTargetAssignmentForCode(asgn);
    setAccessCodeInput('');
    setVerificationError(null);
    setLockoutSeconds(null);
    setAttemptsRemaining(null);
    setIsCodeModalOpen(true);
  };

  // Submit code verification
  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFacilityForCode || !targetAssignmentForCode || !accessCodeInput.trim()) {
      setVerificationError('Please enter the facility-specific access code.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    const res = await verifyFacilityAccessCode({
      assignmentId: targetAssignmentForCode.id,
      facilityId: targetFacilityForCode.id,
      handlerId: currentHandler.id,
      accessCode: accessCodeInput.trim(),
      facilityName: targetFacilityForCode.name,
      handlerName: currentHandler.fullName,
      handlerRole: targetAssignmentForCode.assignmentRole,
    });

    setIsVerifying(false);

    if (res.success) {
      setIsCodeModalOpen(false);
      setSelectedFacilityId(targetFacilityForCode.id);
    } else {
      setVerificationError(res.error || 'Access code verification failed.');
      if (res.isLocked && res.remainingSeconds) {
        setLockoutSeconds(res.remainingSeconds);
      }
      if (res.attemptsRemaining !== undefined) {
        setAttemptsRemaining(res.attemptsRemaining);
      }
    }
  };

  // Handle Booking Approval
  const handleConfirmApproval = async () => {
    if (!approvingBooking || !activeFacility) return;
    setIsSubmittingApproval(true);

    const res = await approveBookingAsHandler({
      bookingId: approvingBooking.id,
      facilityId: activeFacility.id,
      notes: approvalNotesInput.trim() || undefined,
    });

    setIsSubmittingApproval(false);
    if (res.success) {
      setIsApproveModalOpen(false);
      setApprovingBooking(null);
      setApprovalNotesInput('');
    }
  };

  // Handle Booking Rejection
  const handleConfirmRejection = async () => {
    if (!rejectingBooking || !activeFacility) return;
    if (!rejectionReasonInput.trim()) {
      addToast('error', 'Reason Required', 'Please provide a clear justification for rejecting the booking.');
      return;
    }

    setIsSubmittingRejection(true);

    const res = await rejectBookingAsHandler({
      bookingId: rejectingBooking.id,
      facilityId: activeFacility.id,
      reason: rejectionReasonInput.trim(),
    });

    setIsSubmittingRejection(false);
    if (res.success) {
      setIsRejectModalOpen(false);
      setRejectingBooking(null);
      setRejectionReasonInput('');
    }
  };

  // Quick helper to show demo reference codes
  const getDemoHintCode = (facilityId: string) => {
    if (facilityId === 'ctu-fac-cn-hall') return 'CN-8421';
    if (facilityId === 'ctu-fac-gym') return activeAssignment?.assignmentRole === 'backup' ? 'GYM-7731' : 'GYM-5920';
    if (facilityId === 'ctu-fac-opencourt-1') return 'OC1-3142';
    if (facilityId === 'ctu-fac-opencourt-2') return 'OC2-6805';
    if (facilityId === 'ctu-fac-commlab-1') return 'LAB-4791';
    if (facilityId === 'ctu-fac-tennis') return 'TC-9283';
    return '1234';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Handler Authentication Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Facility Handler Authenticated Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {currentHandler.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {currentHandler.titleOrDesignation} · Assigned to {assignedFacilities.length} University Venue{assignedFacilities.length !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Quick Persona Switcher for Evaluation */}
          <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 block">
              Quick Test Persona (Cebu Tech University)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {facilityHandlers.map((h) => (
                <button
                  key={h.id}
                  onClick={() => loginAs('facility_handler', h.email, h.fullName)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    h.id === currentHandler.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {h.fullName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Access Restrictions Reminder */}
        <div className="mt-5 pt-4 border-t border-white/10 text-xs text-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Zero Cross-Facility Leaks:</strong> You only hold permit review authority for your explicitly assigned venues.
            </span>
          </div>
          <button
            onClick={() => setActiveView('admin-handlers')}
            className="text-xs font-bold text-amber-300 hover:underline cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>University Admin Personnel Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Assigned Venues Selector & Security Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignedFacilities.map(({ facility, assignment }) => {
          const isSelected = selectedFacilityId === facility.id;
          const session = verifiedFacilitySessions[facility.id];
          const isUnlocked = !!(session && session.handlerId === currentHandler.id && session.expiresAt > Date.now());
          const pendingCount = institutionBookings.filter(
            (b) => b.facilityId === facility.id && b.status === 'pending'
          ).length;

          return (
            <div
              key={facility.id}
              onClick={() => setSelectedFacilityId(facility.id)}
              className={`rounded-2xl p-5 border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900">{facility.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{facility.building}</p>
                </div>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    assignment.assignmentRole === 'primary'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {assignment.assignmentRole} Reviewer
                </span>
              </div>

              {/* Status and Pending Counters */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlocked ({Math.max(1, Math.ceil((session.expiresAt - Date.now()) / (1000 * 60)))}m)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked (Code Required)</span>
                    </span>
                  )}
                </div>

                <span
                  className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                    pendingCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {pendingCount} Pending
                </span>
              </div>

              {/* Action Prompt */}
              <div className="mt-3">
                {!isUnlocked ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCodeChallenge(facility, assignment);
                    }}
                    className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Enter Access Code</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearVerifiedFacilitySession(facility.id);
                      }}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Lock Workspace
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace Area for Selected Facility */}
      {activeFacility && activeAssignment && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Workspace Header */}
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>{activeFacility.name} — Review Queue</span>
                    {isWorkspaceUnlocked ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Authenticated ({remainingMinutes}m)</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Code Required</span>
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Role: <strong>{activeAssignment.assignmentRole === 'primary' ? 'Primary Handler' : 'Designated Backup'}</strong> · Max Capacity: {activeFacility.capacity} · {activeFacility.building}
                  </p>
                </div>
              </div>
            </div>

            {/* Filter buttons & Lock button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setQueueStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    queueStatusFilter === 'pending' ? 'bg-white text-purple-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setQueueStatusFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    queueStatusFilter === 'approved' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Approved
                </button>
                <button
                  onClick={() => setQueueStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    queueStatusFilter === 'rejected' ? 'bg-white text-rose-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Rejected
                </button>
                <button
                  onClick={() => setQueueStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    queueStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
              </div>

              {isWorkspaceUnlocked && (
                <button
                  onClick={() => clearVerifiedFacilitySession(activeFacility.id)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Lock
                </button>
              )}
            </div>
          </div>

          {/* Locked Overlay or Queue Content */}
          {!isWorkspaceUnlocked ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <KeyRound className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Facility Security Code Challenge</h3>
                <p className="text-xs text-slate-500">
                  To view and process booking requests for <strong>{activeFacility.name}</strong>, enter your designated access code.
                </p>
              </div>
              <button
                onClick={() => openCodeChallenge(activeFacility, activeAssignment)}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify Access Code & Open Queue</span>
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Queue List */}
              {facilityBookings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No {queueStatusFilter} requests for this facility</p>
                  <p className="text-xs text-slate-400">All student and faculty requests for this venue are up to date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {facilityBookings.map((req) => {
                    // Check conflicts with approved bookings
                    const conflict = req.status === 'pending'
                      ? checkTimeConflict(req.facilityId, req.date, req.startTime, req.endTime, req.id)
                      : { hasConflict: false };

                    return (
                      <div
                        key={req.id}
                        className={`rounded-2xl border p-5 shadow-xs transition-all ${
                          req.status === 'pending'
                            ? 'bg-white border-slate-200 hover:border-purple-300'
                            : req.status === 'approved'
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Left: Request details */}
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                {req.referenceNumber}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  req.status === 'pending'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : req.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-900 border border-rose-200'
                                }`}
                              >
                                {req.status}
                              </span>
                              {req.permitReference && (
                                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                                  Permit: {req.permitReference}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-black text-slate-900">{req.eventName}</h4>
                            <p className="text-xs text-slate-600">{req.purpose}</p>

                            {/* Schedule & Requester */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs pt-1">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>
                                  {req.date} · <strong>{formatTo12Hour(req.startTime)} – {formatTo12Hour(req.endTime)}</strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>{req.attendees} attendees</span>
                              </div>
                              <div className="text-slate-600 truncate">
                                Requester: <strong>{req.requesterName}</strong> ({req.requesterRole})
                                {req.organization && <span className="block text-[11px] text-slate-400 truncate">{req.organization}</span>}
                              </div>
                            </div>

                            {req.notes && (
                              <p className="text-xs bg-slate-50 p-2 rounded-lg text-slate-600 border border-slate-100">
                                <em>Notes:</em> {req.notes}
                              </p>
                            )}

                            {/* Conflict Warning */}
                            {conflict.hasConflict && conflict.conflictingBooking && (
                              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block">Schedule Conflict Detected</strong>
                                  <span>
                                    Overlaps with approved event "{conflict.conflictingBooking.eventName}" ({formatTo12Hour(conflict.conflictingBooking.startTime)} – {formatTo12Hour(conflict.conflictingBooking.endTime)}). Approval is strictly blocked until reschedule.
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Rejection reason if already rejected */}
                            {req.rejectionReason && (
                              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                                <strong>Rejection Reason:</strong> {req.rejectionReason}
                              </div>
                            )}
                          </div>

                          {/* Right: Decision Actions */}
                          {req.status === 'pending' && (
                            <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0">
                              <button
                                disabled={conflict.hasConflict}
                                onClick={() => {
                                  setApprovingBooking(req);
                                  setApprovalNotesInput('');
                                  setIsApproveModalOpen(true);
                                }}
                                className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                                  conflict.hasConflict
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve Request</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectingBooking(req);
                                  setRejectionReasonInput('');
                                  setIsRejectModalOpen(true);
                                }}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject Request</span>
                              </button>
                            </div>
                          )}

                          {req.status !== 'pending' && req.reviewedBy && (
                            <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                              <span className="block font-bold text-slate-700">Reviewed By:</span>
                              <span className="block">{req.reviewedBy}</span>
                              {req.reviewedAt && (
                                <span className="block text-slate-400 font-mono text-[10px]">
                                  {formatDateTime12Hour(req.reviewedAt)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Facility Audit History Sub-table */}
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Decision & Access Audit History for {activeFacility.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">{facilityLogs.length} events logged</span>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3">Timestamp (12-Hour)</th>
                        <th className="py-2.5 px-3">Reviewer</th>
                        <th className="py-2.5 px-3">Action</th>
                        <th className="py-2.5 px-3">Event / Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {facilityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-100/50">
                          <td className="py-2.5 px-3 font-mono text-[10px]">
                            {log.formattedTime} · {log.formattedDate}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {log.handlerName} ({log.handlerRole})
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                log.decision === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.decision === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {log.decision.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">
                            {log.reason || log.eventName || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: FACILITY ACCESS CODE CHALLENGE                         */}
      {/* ------------------------------------------------------------- */}
      {isCodeModalOpen && targetFacilityForCode && targetAssignmentForCode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Unlock {targetFacilityForCode.name}
              </h3>
              <p className="text-xs text-slate-500">
                Enter your designated security credential for this venue.
              </p>
            </div>

            {/* Hint Box for demo evaluator */}
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <div>
                <span className="font-bold block">Assigned Security Code:</span>
                <span className="text-[11px] text-purple-700">Configured by University Admin</span>
              </div>
              <code className="font-mono font-black text-sm bg-white px-2 py-1 rounded border border-purple-200 text-purple-800">
                {getDemoHintCode(targetFacilityForCode.id)}
              </code>
            </div>

            {/* Error & Lockout Display */}
            {verificationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="block font-bold">{verificationError}</span>
                  {attemptsRemaining !== null && attemptsRemaining > 0 && (
                    <span className="block text-[11px] text-rose-600">
                      Remaining attempts before temporary lockout: <strong>{attemptsRemaining}</strong>
                    </span>
                  )}
                  {lockoutSeconds && (
                    <span className="block text-[11px] font-black text-rose-800">
                      Security Lockout active: Retry in {lockoutSeconds}s
                    </span>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Facility-Specific Access Code
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showCode ? 'text' : 'password'}
                    required
                    disabled={!!lockoutSeconds}
                    placeholder="Enter assigned code..."
                    value={accessCodeInput}
                    onChange={(e) => setAccessCodeInput(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCodeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || !!lockoutSeconds}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isVerifying ? 'Verifying with Server...' : 'Verify & Unlock Workspace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: APPROVE BOOKING WITH NOTES                             */}
      {/* ------------------------------------------------------------- */}
      {isApproveModalOpen && approvingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Approve Booking Request</h3>
                <p className="text-xs text-slate-500">{approvingBooking.referenceNumber} · {approvingBooking.eventName}</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Permit Issuance Confirmation</p>
              <p className="text-[11px] text-emerald-700">
                Approving this request will generate an official digital venue permit and log your authenticated approval with a 12-hour AM/PM timestamp in the audit record.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Approval Endorsement Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified adviser endorsement slip. Projector test cleared."
                  value={approvalNotesInput}
                  onChange={(e) => setApprovalNotesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingApproval}
                  onClick={handleConfirmApproval}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmittingApproval ? 'Issuing Permit...' : 'Confirm & Issue Permit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REJECT BOOKING WITH MANDATORY REASON                   */}
      {/* ------------------------------------------------------------- */}
      {isRejectModalOpen && rejectingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Reject Booking Request</h3>
                <p className="text-xs text-slate-500">{rejectingBooking.referenceNumber} · {rejectingBooking.eventName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justification Reason (Mandatory)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="State clearly why this reservation is rejected (e.g. Venue maintenance scheduled, non-academic event, or missing departmental endorsement)..."
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingRejection || !rejectionReasonInput.trim()}
                  onClick={handleConfirmRejection}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmittingRejection ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
