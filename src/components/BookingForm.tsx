import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Facility, BookingRequest } from '../types';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowLeft, 
  Send,
  Building,
  User,
  Info,
  Check,
  Globe
} from 'lucide-react';
import { TIME_OPTIONS, formatTo12Hour, formatTimeRange } from '../utils/timeFormat';

export const BookingForm: React.FC = () => {
  const {
    allFacilities,
    institutionFacilities,
    allInstitutions,
    selectedFacility,
    setSelectedFacility,
    submitBooking,
    checkTimeConflict,
    setActiveView,
    currentRole,
    currentInstitution,
  } = useApp();

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Form State
  const [facilityId, setFacilityId] = useState<string>(
    selectedFacility?.id || (institutionFacilities[0]?.id || (allFacilities[0]?.id || ''))
  );
  const [eventName, setEventName] = useState('');
  const [purpose, setPurpose] = useState('Academic Presentation / Defense');
  const [customPurpose, setCustomPurpose] = useState('');
  const [date, setDate] = useState<string>(getTomorrow());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [attendees, setAttendees] = useState<number>(30);
  const [requesterName, setRequesterName] = useState(
    currentRole === 'faculty' ? 'Prof. Maria Santos' : 'Juan Dela Cruz'
  );
  const [requesterRole, setRequesterRole] = useState<'Student' | 'Faculty'>(
    currentRole === 'faculty' ? 'Faculty' : 'Student'
  );
  const [requesterEmail, setRequesterEmail] = useState(
    currentRole === 'faculty' ? 'maria.santos@ctu.edu.ph' : 'juan.delacruz@ctu.edu.ph'
  );
  const [organization, setOrganization] = useState(
    currentRole === 'faculty' ? 'Department of Information Technology' : 'Supreme Student Government (SSG)'
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] = useState<BookingRequest | null>(null);

  // Sync selected facility
  useEffect(() => {
    if (selectedFacility) {
      setFacilityId(selectedFacility.id);
    } else if (institutionFacilities.length > 0 && !facilityId) {
      setFacilityId(institutionFacilities[0].id);
    }
  }, [selectedFacility, institutionFacilities]);

  const activeFacility = useMemo(() => {
    return allFacilities.find((f) => f.id === facilityId) || institutionFacilities.find((f) => f.id === facilityId) || allFacilities[0];
  }, [allFacilities, institutionFacilities, facilityId]);

  const hostInstitution = useMemo(() => {
    if (!activeFacility) return currentInstitution;
    return allInstitutions.find((i) => i.id === activeFacility.institutionId) || currentInstitution;
  }, [allInstitutions, activeFacility, currentInstitution]);

  const isExternalBooking = useMemo(() => {
    return activeFacility ? activeFacility.institutionId !== currentInstitution.id : false;
  }, [activeFacility, currentInstitution]);

  const isExternalAllowed = useMemo(() => {
    if (!isExternalBooking) return true;
    return hostInstitution.allowExternalBookings && hostInstitution.bookingPolicy !== 'internal_only';
  }, [isExternalBooking, hostInstitution]);

  // Live conflict check
  const conflictCheck = useMemo(() => {
    if (!facilityId || !date || !startTime || !endTime) return { hasConflict: false };
    return checkTimeConflict(facilityId, date, startTime, endTime);
  }, [facilityId, date, startTime, endTime, checkTimeConflict]);

  // Validation checks
  const isTimeOrderValid = useMemo(() => {
    if (!startTime || !endTime) return true;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return eh * 60 + em > sh * 60 + sm;
  }, [startTime, endTime]);

  const isCapacityValid = useMemo(() => {
    if (!activeFacility) return true;
    return attendees > 0 && attendees <= activeFacility.capacity;
  }, [attendees, activeFacility]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isExternalBooking && !isExternalAllowed) {
      setErrorMsg(`${hostInstitution.name} enforces an internal-only reservation policy. External bookings from other universities cannot be accepted.`);
      return;
    }

    const finalPurpose = purpose === 'Other' ? customPurpose : purpose;

    const result = submitBooking({
      facilityId,
      eventName,
      purpose: finalPurpose,
      date,
      startTime,
      endTime,
      attendees,
      requesterName,
      requesterRole,
      requesterEmail,
      organization,
      notes,
    });

    if (!result.success) {
      setErrorMsg(result.error || 'Failed to submit booking request.');
    } else if (result.booking) {
      setSubmittedBooking(result.booking);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('facilities')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Facility Directory</span>
        </button>

        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          Demo Booking Portal · {currentInstitution.shortName}
        </span>
      </div>

      {/* Confirmation Success Modal */}
      {submittedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300">
              <Check className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Status: Pending Administrative Review
              </span>
              <h3 className="text-lg font-bold text-slate-900 pt-1">
                Booking Request Submitted!
              </h3>
              <p className="text-xs text-slate-500">
                Your reservation has been logged under reference number:
              </p>
              <div className="text-xl font-mono font-black text-blue-600 tracking-wider py-1">
                {submittedBooking.referenceNumber}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Facility:</span>
                <span className="font-semibold text-slate-800">{submittedBooking.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Event:</span>
                <span className="font-semibold text-slate-800">{submittedBooking.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Schedule:</span>
                <span className="font-semibold text-slate-800">
                  {submittedBooking.date} ({formatTimeRange(submittedBooking.startTime, submittedBooking.endTime)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Attendees:</span>
                <span className="font-semibold text-slate-800">{submittedBooking.attendees} persons</span>
              </div>
            </div>

            <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
              <strong>Next Step:</strong> Your request has been queued for review by the campus facility office. You can track this request under <strong>My Booking Requests</strong> or switch to <strong>University Admin</strong> to simulate administrative approval.
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  setSubmittedBooking(null);
                  setActiveView('my-bookings');
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
              >
                View My Booking Requests
              </button>
              <button
                onClick={() => {
                  setSubmittedBooking(null);
                  setEventName('');
                  setNotes('');
                }}
                className="py-2 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Booking Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Facility Reservation Request Form
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your schedule and event specifications for administrative clearance.
            </p>
          </div>

          <div className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-medium border border-blue-200">
            Initial Status: <strong>Pending Approval</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong>Submission Error:</strong> {errorMsg}
              </div>
            </div>
          )}

          {/* Section 1: Facility Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Choose University Facility <span className="text-red-500">*</span>
              </label>
              {hostInstitution && (
                <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  Host: <strong className="text-slate-800">{hostInstitution.shortName}</strong> ({hostInstitution.name})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={facilityId}
                  onChange={(e) => {
                    setFacilityId(e.target.value);
                    const found = allFacilities.find((f) => f.id === e.target.value);
                    if (found) setSelectedFacility(found);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  {allInstitutions.map((inst) => {
                    const instFacs = allFacilities.filter((f) => f.institutionId === inst.id);
                    if (instFacs.length === 0) return null;
                    return (
                      <optgroup
                        key={inst.id}
                        label={`${inst.name} (${inst.shortName})${!inst.allowExternalBookings ? ' · Internal Only' : ''}`}
                      >
                        {instFacs.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name} ({fac.type} - Max {fac.capacity} seats)
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Facility snapshot badge */}
              {activeFacility && (
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
                  <div>
                    <span className="font-semibold block">{activeFacility.name}</span>
                    <span className="text-[11px] text-blue-700">
                      {activeFacility.building} · {activeFacility.floor} · {hostInstitution.shortName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[11px]">
                    Cap: {activeFacility.capacity}
                  </span>
                </div>
              )}
            </div>

            {/* Cross-University Policy Status Banner */}
            {isExternalBooking && (
              !isExternalAllowed ? (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-red-800">
                      External Bookings Restricted by {hostInstitution.name}
                    </span>
                    <p className="mt-0.5 text-red-700 leading-relaxed">
                      {hostInstitution.externalBookingNotice ||
                        `${hostInstitution.name} enforces an internal-only reservation policy. Bookings from external universities are blocked.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-blue-800">
                      Cross-University Facility Booking (Requester: {currentInstitution.shortName} → Host: {hostInstitution.shortName})
                    </span>
                    <p className="mt-0.5 text-blue-700 leading-relaxed">
                      {hostInstitution.externalBookingNotice ||
                        `This reservation will be routed to ${hostInstitution.name} facility administrators for review and approval.`}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Section 2: Event Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Event & Activity Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Event / Activity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Capstone Project Defense"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Booking Purpose <span className="text-red-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Academic Presentation / Defense">Academic Presentation / Defense</option>
                  <option value="Student Organization General Assembly">Student Organization General Assembly</option>
                  <option value="Faculty Department Deliberation">Faculty Department Deliberation</option>
                  <option value="Research & Capstone Workshop">Research & Capstone Workshop</option>
                  <option value="Rehearsal / Cultural Practice">Rehearsal / Cultural Practice</option>
                  <option value="University Conference / Symposium">University Conference / Symposium</option>
                  <option value="Other">Other (Specify below)</option>
                </select>
              </div>
            </div>

            {purpose === 'Other' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Specific Purpose Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Describe the nature of your event..."
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Section 3: Schedule & Attendees */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Date, Time & Expected Capacity
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reservation Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium ${
                    !isTimeOrderValid ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Attendees Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeFacility?.capacity || 500}
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                  required
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white ${
                    !isCapacityValid ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* Validation feedback banners */}
            {!isTimeOrderValid && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                End time must be later than start time.
              </p>
            )}

            {!isCapacityValid && activeFacility && (
              <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Expected attendees ({attendees}) exceed maximum capacity of {activeFacility.name} ({activeFacility.capacity} seats).
              </p>
            )}

            {/* Live Conflict Status Indicator */}
            {conflictCheck.hasConflict && conflictCheck.conflictingBooking ? (
              <div className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs text-red-800 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Overlapping Schedule Conflict Detected!</strong>
                  <span>
                    Another reservation "{conflictCheck.conflictingBooking.eventName}" is already APPROVED for this facility on {date} from {formatTo12Hour(conflictCheck.conflictingBooking.startTime)} to {formatTo12Hour(conflictCheck.conflictingBooking.endTime)}. Submissions during this time range will be blocked.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Schedule Clear:</strong> No approved bookings conflict with {formatTimeRange(startTime, endTime)} on {date}.
                </span>
              </div>
            )}
          </div>

          {/* Section 4: Requester Details */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              4. Requester Identification
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name / Representative <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  University Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={requesterRole}
                  onChange={(e) => setRequesterRole(e.target.value as 'Student' | 'Faculty')}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                >
                  <option value="Student">Student / Student Org Officer</option>
                  <option value="Faculty">Faculty Member / Department Chair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Institutional Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  College, Department, or Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. BS Information Technology / ACS"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Special Resource Requests or Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra wireless mic, podium, projector test required"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Prototype Disclosure Disclaimer */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-slate-800 block">SmartSpace Reservation Protocol:</strong>
              <p>
                Submitting this form registers a <strong>Pending Request</strong>. No facility is officially reserved or permitted for use until the request is reviewed and approved by the designated Facility Administrator.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveView('facilities')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isTimeOrderValid || !isCapacityValid || conflictCheck.hasConflict || (isExternalBooking && !isExternalAllowed)}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                !isTimeOrderValid || !isCapacityValid || conflictCheck.hasConflict || (isExternalBooking && !isExternalAllowed)
                  ? 'bg-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isExternalBooking
                  ? !isExternalAllowed
                    ? 'External Bookings Not Allowed'
                    : 'Submit Cross-University Request'
                  : 'Submit Reservation Request'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
