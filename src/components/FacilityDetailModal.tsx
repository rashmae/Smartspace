import React, { useEffect, useRef, useState } from 'react';
import { Facility } from '../types';
import { useApp } from '../context/AppContext';
import { AvailabilitySchedule } from './AvailabilitySchedule';
import { 
  X, 
  Users, 
  MapPin, 
  Clock, 
  CheckSquare, 
  FileText, 
  ShieldCheck, 
  CalendarDays,
  ArrowRight,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { formatTimeRange } from '../utils/timeFormat';
import { ResilientImage } from './ResilientImage';

interface FacilityDetailModalProps {
  facility: Facility | null;
  onClose: () => void;
  onBookNow: (facility: Facility, initialDate?: string, startTime?: string, endTime?: string) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  facility,
  onClose,
  onBookNow,
}) => {
  const { allInstitutions, currentInstitution } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'availability'>('details');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!facility) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [facility, onClose]);

  if (!facility) return null;

  const matchedInstitution = allInstitutions.find((i) => i.id === facility.institutionId);
  const hostInstitution = matchedInstitution || {
    ...currentInstitution,
    id: facility.institutionId,
    name: facility.institutionId === 'public-he-inst' ? 'Public Higher Education Institution' : facility.institutionId === 'private-he-inst' ? 'Private Higher Education University' : 'Participating Higher Education Campus',
    shortName: facility.institutionId === 'public-he-inst' ? 'Public SUC' : facility.institutionId === 'private-he-inst' ? 'Private University' : 'Campus Venue',
    allowExternalBookings: true,
    bookingPolicy: 'external_allowed' as const,
  };
  const isExternal = Boolean(facility.institutionId && currentInstitution.id && facility.institutionId !== currentInstitution.id && matchedInstitution);
  const isBlocked = isExternal && (!hostInstitution.allowExternalBookings || hostInstitution.bookingPolicy === 'internal_only');

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="facility-detail-title"
      >
        {/* Modal Header Image & Details */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-800 overflow-hidden">
          <ResilientImage
            src={facility.imageUrl}
            alt={facility.name}
            className="w-full h-full object-cover opacity-85"
            loading="eager"
            fallbackLabel={facility.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />
          
          {/* Close button */}
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Close facility details modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Header Title & Badges */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-semibold tracking-wide uppercase">
                {facility.type}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium">
                {facility.building} · {facility.floor}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 text-[10px] font-semibold border border-slate-700">
                {hostInstitution.name} ({hostInstitution.shortName})
              </span>
            </div>
            <h2 id="facility-detail-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {facility.name}
            </h2>
          </div>
        </div>

        {/* Tab Switcher */}
        <div role="tablist" aria-label="Facility information sections" className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'details'}
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Facility Details &amp; Rules
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'availability'}
            onClick={() => setActiveTab('availability')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'availability'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
            Check Availability Schedule
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'details' ? (
            <>
              {/* Institutional Booking Policy Box */}
              {isBlocked ? (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-red-800">
                      Internal Bookings Only · {hostInstitution.name}
                    </span>
                    <p className="mt-0.5 text-red-700 leading-relaxed">
                      {hostInstitution.externalBookingNotice ||
                        `This facility is reserved exclusively for enrolled students and faculty of ${hostInstitution.name}. External cross-university reservation requests cannot be processed.`}
                    </p>
                  </div>
                </div>
              ) : isExternal ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2.5">
                  <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-blue-800">
                      Cross-University Bookings Permitted
                    </span>
                    <p className="mt-0.5 text-blue-700 leading-relaxed">
                      {hostInstitution.externalBookingNotice ||
                        `External organizations and collegiate delegates from other participating universities may request reservations subject to ${hostInstitution.shortName} administrator review.`}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Quick Spec Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1">
                    <Users className="w-4 h-4 text-blue-700" aria-hidden="true" />
                    <span>Seating Capacity</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {facility.capacity} <span className="text-xs font-normal text-slate-600">attendees max</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1">
                    <Clock className="w-4 h-4 text-blue-700" aria-hidden="true" />
                    <span>Operating Hours</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {formatTimeRange(facility.operatingHours.open, facility.operatingHours.close)}
                  </div>
                  <div className="text-[11px] text-slate-600">{facility.operatingHours.days}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs mb-1">
                    <MapPin className="w-4 h-4 text-blue-700" aria-hidden="true" />
                    <span>Exact Location</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900">
                    {facility.building}
                  </div>
                  <div className="text-[11px] text-slate-600">{facility.floor} · {hostInstitution.shortName}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  About This Space
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {facility.description}
                </p>
              </div>

              {/* Equipment & Resources */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Available Equipment &amp; Infrastructure
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {facility.equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Rules */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" aria-hidden="true" />
                  Facility Usage Regulations
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                  {facility.rules.map((rule, idx) => (
                    <li key={idx} className="leading-normal">{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Booking Requirements */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" aria-hidden="true" />
                  Reservation Requirements &amp; Approvals Needed
                </h3>
                <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside">
                  {facility.bookingRequirements.map((req, idx) => (
                    <li key={idx} className="leading-normal">{req}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <AvailabilitySchedule
              facility={facility}
              onSelectSlot={(date, start, end) => {
                onClose();
                onBookNow(facility, date, start, end);
              }}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            {activeTab === 'details' && (
              <button
                type="button"
                onClick={() => setActiveTab('availability')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Check Schedule First
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isBlocked) return;
                onClose();
                onBookNow(facility);
              }}
              disabled={isBlocked}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors ${
                isBlocked
                  ? 'bg-slate-600 cursor-not-allowed'
                  : 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
              }`}
            >
              <span>{isBlocked ? 'External Bookings Restricted' : 'Book Facility Request'}</span>
              {!isBlocked && <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
