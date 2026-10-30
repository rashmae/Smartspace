import React, { useState } from 'react';
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

  if (!facility) return null;

  const hostInstitution = allInstitutions.find((i) => i.id === facility.institutionId) || currentInstitution;
  const isExternal = facility.institutionId !== currentInstitution.id;
  const isBlocked = isExternal && (!hostInstitution.allowExternalBookings || hostInstitution.bookingPolicy === 'internal_only');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header Image & Details */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-800 overflow-hidden">
          <img
            src={facility.imageUrl}
            alt={facility.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
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
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {facility.name}
            </h2>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Facility Details & Rules
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'availability'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
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
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Seating Capacity</span>
                  </div>
                  <div className="text-lg font-bold text-slate-800">
                    {facility.capacity} <span className="text-xs font-normal text-slate-500">attendees max</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Operating Hours</span>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {formatTimeRange(facility.operatingHours.open, facility.operatingHours.close)}
                  </div>
                  <div className="text-[11px] text-slate-500">{facility.operatingHours.days}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Exact Location</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    {facility.building}
                  </div>
                  <div className="text-[11px] text-slate-500">{facility.floor} · {hostInstitution.shortName}</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  About This Space
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {facility.description}
                </p>
              </div>

              {/* Equipment & Resources */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Available Equipment & Infrastructure
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {facility.equipment.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Rules */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Facility Usage Regulations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                  {facility.rules.map((rule, idx) => (
                    <li key={idx} className="leading-normal">{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Booking Requirements */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-700" />
                  Reservation Requirements & Approvals Needed
                </h4>
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
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            {activeTab === 'details' && (
              <button
                onClick={() => setActiveTab('availability')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Check Schedule First
              </button>
            )}
            <button
              onClick={() => {
                if (isBlocked) return;
                onClose();
                onBookNow(facility);
              }}
              disabled={isBlocked}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                isBlocked
                  ? 'bg-slate-400 cursor-not-allowed opacity-75'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span>{isBlocked ? 'External Bookings Restricted' : 'Book Facility Request'}</span>
              {!isBlocked && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
