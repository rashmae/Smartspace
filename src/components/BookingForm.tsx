import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useConsent } from '../context/ConsentContext';
import { BUSINESS_CONFIG } from '../config/business';
import { PrivacyFormConsent } from './PrivacyFormConsent';
import { BookingRequest } from '../types';
import {
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  Send,
  Building,
  Info,
  Check,
  Globe,
} from 'lucide-react';
import { TIME_OPTIONS, formatTo12Hour, formatTimeRange } from '../utils/timeFormat';

const BOOKING_CONSENT_TEXT =
  'I acknowledge the Privacy Policy and Terms & Conditions and confirm that this reservation request contains accurate event information for campus administrative clearance.';

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
  const { recordFormConsent } = useConsent();

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
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submittedBooking, setSubmittedBooking] = useState<BookingRequest | null>(null);

  const eventNameRef = useRef<HTMLInputElement>(null);
  const customPurposeRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const attendeesRef = useRef<HTMLInputElement>(null);
  const requesterNameRef = useRef<HTMLInputElement>(null);
  const requesterEmailRef = useRef<HTMLInputElement>(null);

  // Sync selected facility
  useEffect(() => {
    if (selectedFacility) {
      setFacilityId(selectedFacility.id);
    } else if (institutionFacilities.length > 0 && !facilityId) {
      setFacilityId(institutionFacilities[0].id);
    }
  }, [selectedFacility, institutionFacilities]);

  const activeFacility = useMemo(() => {
    return (
      allFacilities.find((f) => f.id === facilityId) ||
      institutionFacilities.find((f) => f.id === facilityId) ||
      allFacilities[0]
    );
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
    const errors: Record<string, string> = {};

    if (!eventName.trim()) {
      errors.eventName = 'Please enter an event or activity title.';
    }
    if (purpose === 'Other' && !customPurpose.trim()) {
      errors.customPurpose = 'Please specify the purpose of your event.';
    }
    if (!date) {
      errors.date = 'Please select a reservation date.';
    }
    if (!isTimeOrderValid) {
      errors.endTime = 'End time must be later than start time.';
    }
    if (!isCapacityValid) {
      errors.attendees = `Attendees must be between 1 and ${activeFacility?.capacity || 500}.`;
    }
    if (!requesterName.trim()) {
      errors.requesterName = 'Please enter your full name or representative name.';
    }
    if (!requesterEmail.trim() || !requesterEmail.includes('@') || !requesterEmail.includes('.')) {
      errors.requesterEmail = 'Please enter a valid institutional email address.';
    }
    if (!privacyAgreed) {
      errors.privacyAgreed = 'Please acknowledge the Privacy Policy and booking confirmation before submitting.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please review the highlighted fields before submitting.');
      if (errors.eventName) eventNameRef.current?.focus();
      else if (errors.customPurpose) customPurposeRef.current?.focus();
      else if (errors.date) dateRef.current?.focus();
      else if (errors.attendees) attendeesRef.current?.focus();
      else if (errors.requesterName) requesterNameRef.current?.focus();
      else if (errors.requesterEmail) requesterEmailRef.current?.focus();
      else document.getElementById('booking-form-privacy-consent')?.focus();
      return;
    }

    if (isExternalBooking && !isExternalAllowed) {
      setErrorMsg(
        `${hostInstitution.name} enforces an internal-only reservation policy. External bookings from other universities cannot be accepted.`
      );
      return;
    }

    setFieldErrors({});

    recordFormConsent({
      formName: 'BookingForm',
      consentText: BOOKING_CONSENT_TEXT,
      marketingOptIn: false,
    });

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
          type="button"
          onClick={() => setActiveView('facilities')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Facility Directory</span>
        </button>

        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Workspace Booking · {currentInstitution.shortName}
        </span>
      </div>

      {/* Confirmation Success Modal */}
      {submittedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-submitted-title"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-300">
              <Check className="w-6 h-6" aria-hidden="true" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 inline-block">
                Status: Pending Administrative Review
              </span>
              <h3 id="booking-submitted-title" className="text-lg font-bold text-slate-900 pt-1">
                Booking Request Submitted!
              </h3>
              <p className="text-xs text-slate-600">
                Your reservation has been logged under reference number:
              </p>
              <div className="text-xl font-mono font-black text-blue-700 tracking-wider py-1">
                {submittedBooking.referenceNumber}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-800 border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Facility:</span>
                <span className="font-semibold text-slate-900">{submittedBooking.facilityName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Event:</span>
                <span className="font-semibold text-slate-900">{submittedBooking.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Schedule:</span>
                <span className="font-semibold text-slate-900">
                  {submittedBooking.date} ({formatTimeRange(submittedBooking.startTime, submittedBooking.endTime)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Attendees:</span>
                <span className="font-semibold text-slate-900">{submittedBooking.attendees} persons</span>
              </div>
            </div>

            <div className="text-xs text-amber-950 bg-amber-50 p-3 rounded border border-amber-200">
              <strong>Next Step:</strong> Your request is queued for review by the campus facility office. Track it under <strong>My Booking Requests</strong>.
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmittedBooking(null);
                  setActiveView('my-bookings');
                }}
                className="flex-1 py-2.5 px-3 rounded-lg bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
              >
                View My Booking Requests
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedBooking(null);
                  setEventName('');
                  setNotes('');
                  setPrivacyAgreed(false);
                }}
                className="py-2.5 px-3 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Booking Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Facility Reservation Request Form
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Submit your schedule and event specifications for administrative clearance.
            </p>
          </div>

          <div className="text-xs bg-blue-50 text-blue-900 px-2.5 py-1 rounded font-medium border border-blue-200">
            Initial Status: <strong>Pending Approval</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
          {errorMsg && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" aria-hidden="true" />
              <div>
                <strong>Submission Error:</strong> {errorMsg}
              </div>
            </div>
          )}

          {/* Section 1: Facility Selection */}
          <fieldset className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="booking-facility-select" className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Choose University Facility <span className="text-red-700" aria-hidden="true">*</span>
              </label>
              {hostInstitution && (
                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  Host: <strong className="text-slate-900">{hostInstitution.shortName}</strong> ({hostInstitution.name})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <select
                  id="booking-facility-select"
                  aria-required="true"
                  value={facilityId}
                  onChange={(e) => {
                    setFacilityId(e.target.value);
                    const found = allFacilities.find((f) => f.id === e.target.value);
                    if (found) setSelectedFacility(found);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
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
                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
                  <div>
                    <span className="font-semibold block">{activeFacility.name}</span>
                    <span className="text-xs text-blue-800">
                      {activeFacility.building} · {activeFacility.floor} · {hostInstitution.shortName}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#0077C8] text-white font-bold text-xs">
                    Cap: {activeFacility.capacity}
                  </span>
                </div>
              )}
            </div>

            {/* Cross-University Policy Status Banner */}
            {isExternalBooking &&
              (!isExternalAllowed ? (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold block text-red-900">
                      External Bookings Restricted by {hostInstitution.name}
                    </span>
                    <p className="mt-0.5 text-red-800 leading-relaxed">
                      {hostInstitution.externalBookingNotice ||
                        `${hostInstitution.name} enforces an internal-only reservation policy. Bookings from external universities are blocked.`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-[#0077C8] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold block text-blue-950">
                      Cross-University Facility Booking (Requester: {currentInstitution.shortName} → Host: {hostInstitution.shortName})
                    </span>
                    <p className="mt-0.5 text-blue-900 leading-relaxed">
                      {hostInstitution.externalBookingNotice ||
                        `This reservation will be routed to ${hostInstitution.name} facility administrators for review and approval.`}
                    </p>
                  </div>
                </div>
              ))}
          </fieldset>

          {/* Section 2: Event Details */}
          <fieldset className="space-y-4 pt-2 border-t border-slate-200">
            <legend className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Event &amp; Activity Information
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="booking-event-name" className="block text-xs font-semibold text-slate-800 mb-1">
                  Event / Activity Title <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  ref={eventNameRef}
                  id="booking-event-name"
                  type="text"
                  aria-required="true"
                  aria-invalid={fieldErrors.eventName ? 'true' : 'false'}
                  aria-describedby={fieldErrors.eventName ? 'booking-event-name-error' : undefined}
                  placeholder="e.g. Senior Capstone Project Defense"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                    fieldErrors.eventName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.eventName && (
                  <p id="booking-event-name-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                    {fieldErrors.eventName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-purpose" className="block text-xs font-semibold text-slate-800 mb-1">
                  Booking Purpose <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <select
                  id="booking-purpose"
                  aria-required="true"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                >
                  <option value="Academic Presentation / Defense">Academic Presentation / Defense</option>
                  <option value="Student Organization General Assembly">Student Organization General Assembly</option>
                  <option value="Faculty Department Deliberation">Faculty Department Deliberation</option>
                  <option value="Research & Capstone Workshop">Research &amp; Capstone Workshop</option>
                  <option value="Rehearsal / Cultural Practice">Rehearsal / Cultural Practice</option>
                  <option value="University Conference / Symposium">University Conference / Symposium</option>
                  <option value="Other">Other (Specify below)</option>
                </select>
              </div>
            </div>

            {purpose === 'Other' && (
              <div>
                <label htmlFor="booking-custom-purpose" className="block text-xs font-semibold text-slate-800 mb-1">
                  Specific Purpose Description <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  ref={customPurposeRef}
                  id="booking-custom-purpose"
                  type="text"
                  aria-required="true"
                  aria-invalid={fieldErrors.customPurpose ? 'true' : 'false'}
                  aria-describedby={fieldErrors.customPurpose ? 'booking-custom-purpose-error' : undefined}
                  placeholder="Describe the nature of your event..."
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                    fieldErrors.customPurpose ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.customPurpose && (
                  <p id="booking-custom-purpose-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                    {fieldErrors.customPurpose}
                  </p>
                )}
              </div>
            )}
          </fieldset>

          {/* Section 3: Schedule & Attendees */}
          <fieldset className="space-y-4 pt-2 border-t border-slate-200">
            <legend className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Date, Time &amp; Expected Capacity
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label htmlFor="booking-date" className="block text-xs font-semibold text-slate-800 mb-1">
                  Reservation Date <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  ref={dateRef}
                  id="booking-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-required="true"
                  aria-invalid={fieldErrors.date ? 'true' : 'false'}
                  aria-describedby={fieldErrors.date ? 'booking-date-error' : undefined}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                />
                {fieldErrors.date && (
                  <p id="booking-date-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                    {fieldErrors.date}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-start-time" className="block text-xs font-semibold text-slate-800 mb-1">
                  Start Time <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <select
                  id="booking-start-time"
                  aria-required="true"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white font-medium"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="booking-end-time" className="block text-xs font-semibold text-slate-800 mb-1">
                  End Time <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <select
                  id="booking-end-time"
                  aria-required="true"
                  aria-invalid={!isTimeOrderValid ? 'true' : 'false'}
                  aria-describedby={!isTimeOrderValid ? 'booking-time-error' : undefined}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white font-medium ${
                    !isTimeOrderValid ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  }`}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="booking-attendees" className="block text-xs font-semibold text-slate-800 mb-1">
                  Attendees Count <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  ref={attendeesRef}
                  id="booking-attendees"
                  type="number"
                  min={1}
                  max={activeFacility?.capacity || 500}
                  value={attendees}
                  onChange={(e) => setAttendees(Number(e.target.value))}
                  aria-required="true"
                  aria-invalid={!isCapacityValid || Boolean(fieldErrors.attendees) ? 'true' : 'false'}
                  aria-describedby={!isCapacityValid || fieldErrors.attendees ? 'booking-capacity-error' : undefined}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                    !isCapacityValid || fieldErrors.attendees ? 'border-red-500 bg-red-50/50' : 'border-slate-300'
                  }`}
                />
              </div>
            </div>

            {!isTimeOrderValid && (
              <p id="booking-time-error" role="alert" className="text-xs text-red-700 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                End time must be later than start time.
              </p>
            )}

            {!isCapacityValid && activeFacility && (
              <p id="booking-capacity-error" role="alert" className="text-xs text-red-700 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Expected attendees ({attendees}) exceed maximum capacity of {activeFacility.name} ({activeFacility.capacity} seats).
              </p>
            )}

            {/* Live Conflict Status Indicator */}
            {conflictCheck.hasConflict && conflictCheck.conflictingBooking ? (
              <div role="status" className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs text-red-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="block font-semibold">Overlapping Schedule Conflict Detected</strong>
                  <span>
                    Another reservation &ldquo;{conflictCheck.conflictingBooking.eventName}&rdquo; is already APPROVED for this facility on {date} from {formatTo12Hour(conflictCheck.conflictingBooking.startTime)} to {formatTo12Hour(conflictCheck.conflictingBooking.endTime)}.
                  </span>
                </div>
              </div>
            ) : (
              <div role="status" className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>
                  <strong>Schedule Clear:</strong> No approved bookings conflict with {formatTimeRange(startTime, endTime)} on {date}.
                </span>
              </div>
            )}
          </fieldset>

          {/* Section 4: Requester Details */}
          <fieldset className="space-y-4 pt-2 border-t border-slate-200">
            <legend className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              4. Requester Identification
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="booking-requester-name" className="block text-xs font-semibold text-slate-800 mb-1">
                  Full Name / Representative <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  ref={requesterNameRef}
                  id="booking-requester-name"
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  aria-required="true"
                  aria-invalid={fieldErrors.requesterName ? 'true' : 'false'}
                  aria-describedby={fieldErrors.requesterName ? 'booking-requester-name-error' : undefined}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                    fieldErrors.requesterName ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.requesterName && (
                  <p id="booking-requester-name-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                    {fieldErrors.requesterName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-requester-role" className="block text-xs font-semibold text-slate-800 mb-1">
                  University Role <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <select
                  id="booking-requester-role"
                  aria-required="true"
                  value={requesterRole}
                  onChange={(e) => setRequesterRole(e.target.value as 'Student' | 'Faculty')}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                >
                  <option value="Student">Student / Student Org Officer</option>
                  <option value="Faculty">Faculty Member / Department Chair</option>
                </select>
              </div>

              <div>
                <label htmlFor="booking-requester-email" className="block text-xs font-semibold text-slate-800 mb-1">
                  Institutional Email <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  ref={requesterEmailRef}
                  id="booking-requester-email"
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  aria-required="true"
                  aria-invalid={fieldErrors.requesterEmail ? 'true' : 'false'}
                  aria-describedby={fieldErrors.requesterEmail ? 'booking-requester-email-error' : undefined}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                    fieldErrors.requesterEmail ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.requesterEmail && (
                  <p id="booking-requester-email-error" role="alert" className="text-xs text-red-700 font-semibold mt-1">
                    {fieldErrors.requesterEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="booking-organization" className="block text-xs font-semibold text-slate-800 mb-1">
                  College, Department, or Organization Name
                </label>
                <input
                  id="booking-organization"
                  type="text"
                  placeholder="e.g. BS Information Technology / Student Council"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="booking-notes" className="block text-xs font-semibold text-slate-800 mb-1">
                  Special Resource Requests or Notes <span className="font-normal text-slate-600">(Optional)</span>
                </label>
                <input
                  id="booking-notes"
                  type="text"
                  placeholder="e.g. Extra wireless mic, podium, projector setup"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                />
              </div>
            </div>
          </fieldset>

          {/* Protocol Disclosure */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0077C8] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <strong className="text-slate-900 block">SmartSpace Reservation Protocol:</strong>
              <p>
                Submitting this form registers a <strong>Pending Request</strong>. No facility is officially reserved or permitted for use until reviewed and approved by the designated Facility Administrator.
              </p>
            </div>
          </div>

          {/* RA 10173 Collection Notice & Unchecked Consent */}
          <PrivacyFormConsent
            idPrefix="booking-form"
            purpose="Evaluate your reservation request, check schedule conflicts, issue digital QR gate passes if approved, and maintain campus audit trails."
            recipients="Authorized administrators and assigned facility custodians of the host campus workspace, plus Google Firebase storage."
            retention={BUSINESS_CONFIG.retentionPeriods.bookingAndAuditLogs}
            requiredConsentText={BOOKING_CONSENT_TEXT}
            agreed={privacyAgreed}
            onAgreedChange={setPrivacyAgreed}
            agreedError={fieldErrors.privacyAgreed}
            includeMarketing={false}
          />

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveView('facilities')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={conflictCheck.hasConflict || (isExternalBooking && !isExternalAllowed)}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
                conflictCheck.hasConflict || (isExternalBooking && !isExternalAllowed)
                  ? 'bg-slate-500 cursor-not-allowed opacity-75'
                  : 'bg-[#0077C8] hover:bg-[#0060a3] active:scale-98'
              }`}
            >
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
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
