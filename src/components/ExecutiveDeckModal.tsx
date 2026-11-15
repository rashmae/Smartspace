import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
} from 'lucide-react';
import SmartSpaceLogo from './SmartSpaceLogo';

interface ExecutiveDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveDeckModal: React.FC<ExecutiveDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const slides = [
    {
      title: 'The Higher Education Facility Bottleneck',
      subtitle: 'Why manual paper logbooks and informal Messenger chats fail modern campuses',
      tag: 'Executive Problem Analysis',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      render: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <span className="text-2xl font-black text-rose-700">Manual Slips</span>
              <h3 className="font-bold text-slate-900 text-sm">Multi-Office Routing</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Requesters often carry paper slips across separate offices (dean, custodian, student affairs) to request a lecture room or venue.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-2xl font-black text-amber-800">Slot Collisions</span>
              <h3 className="font-bold text-slate-900 text-sm">Risk of Double Bookings</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Disconnected spreadsheets and logbooks can lead to overlapping approvals on busy campus event dates.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <span className="text-2xl font-black text-indigo-700">Scattered Logs</span>
              <h3 className="font-bold text-slate-900 text-sm">Limited Utilization Visibility</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Paper logbooks make it harder for campus staff to review room occupancy patterns or equipment demand.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1">
            <p className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">
              Pilot Motivation
            </p>
            <p className="text-slate-200 leading-relaxed">
              SmartSpace is a pilot-stage prototype designed for Cebu City higher-education campuses to replace informal booking messages and paper logbooks with one structured reservation record.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'SmartSpace Unified SaaS Platform',
      subtitle: 'Book It, Track It, Use It — cloud-native facility governance for universities',
      tag: 'Product Architecture',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      render: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-700" aria-hidden="true" />
                <span>The Core Engine</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-purple-700 mt-1.5 shrink-0" />
                  <span><strong>Real-time Conflict Checking:</strong> Slot overlap checking flags conflicting dates and hours before approval.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-purple-700 mt-1.5 shrink-0" />
                  <span><strong>Paperless Administrative Queue:</strong> Physical plant heads approve or decline with mandatory recorded justification logs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-purple-700 mt-1.5 shrink-0" />
                  <span><strong>Clear Status Visibility:</strong> Requesters, custodians, and admins track request updates inside the portal.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                Single Source of Campus Truth
              </span>
              <h3 className="text-base font-black">All Spaces Under One Roof</h3>
              <p className="text-xs text-purple-100 leading-relaxed">
                From auditoriums and laboratories to seminar rooms and basketball gymnasiums — categorized with capacity limits, rules, and equipment specs.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs font-bold text-emerald-300">
                <span>✓ Conflict-Checked Slots</span>
                <span>✓ Guided Pilot Onboarding</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Three Distinct Role Interfaces',
      subtitle: 'Strict permissions and tailored workflows for every campus stakeholder',
      tag: 'Security & Role Boundaries',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">1. Requesters &amp; Orgs</h3>
            <p className="text-slate-600 leading-relaxed">
              Students, faculty, and departments browse facilities, check live hours, submit booking endorsements, and track approval status in real time.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-blue-800">
              Access: Directory, Calendar, My Bookings
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">2. University Admin</h3>
            <p className="text-slate-600 leading-relaxed">
              Physical plant and facility managers review queues, approve or reject with recorded reasons, edit space rules, and inspect audit records.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-amber-800">
              Access: Pending Queue, Room Inventory, Audit Trail
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">3. Platform Super Admin</h3>
            <p className="text-slate-600 leading-relaxed">
              SmartSpace operations team provisions new university tenants, validates official credentials, configures SLAs, and monitors multi-campus uptime.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-purple-800">
              Access: Tenant Registry, Registration Verifier
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Verifiable QR Permits & Campus Security',
      subtitle: 'Eliminating fraudulent or unauthorized use of campus venues at gate entry',
      tag: 'Physical Verification',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Digital Passes with Dynamic Cryptographic Hash
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every approved reservation generates a unique QR code linked directly to the institutional database. Security guards scan the code on any standard mobile phone to immediately verify:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Authorized requester name &amp; validated student ID number</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Exact permitted entry and vacating window</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Sign-off identity of approving physical plant engineer</span>
              </li>
            </ul>
          </div>
          <div className="md:col-span-5 bg-purple-50 p-6 rounded-2xl border border-purple-200 flex flex-col items-center text-center space-y-3">
            <div className="w-28 h-28 bg-white p-3 rounded-2xl border border-purple-200 shadow-md flex items-center justify-center">
              <QrCode className="w-24 h-24 text-slate-900" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-800">
              VERIFIED-PERMIT-#SS-9821
            </span>
            <p className="text-[11px] text-purple-900">
              Instant mobile check-in without physical paper or printed signature slips.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Pilot Overview & Guided Onboarding',
      subtitle: 'Structured SaaS prototype designed to digitize campus reservations and approval records',
      tag: 'Pilot Walkthrough',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      render: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-700">Guided</span>
              <p className="text-xs font-bold text-slate-800">Campus Onboarding</p>
              <p className="text-[11px] text-slate-600">Configurable room catalog setup</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">Paperless</span>
              <p className="text-xs font-bold text-slate-800">Reservation Workflows</p>
              <p className="text-[11px] text-slate-600">Designed to reduce manual slip routing</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700">Auditable</span>
              <p className="text-xs font-bold text-slate-800">Approval History</p>
              <p className="text-[11px] text-slate-600">Structured digital booking records</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-black text-white text-sm">Ready to Schedule an Institutional Board Presentation?</h3>
              <p className="text-xs text-slate-300">Our solution engineering team provides custom demos tailored to your university’s campus map.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors"
            >
              Close &amp; Inquire
            </button>
          </div>
        </div>
      ),
    },
  ];

  // Keyboard navigation + focus trap
  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    setTimeout(() => closeBtnRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab' && dialogRef.current) {
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
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    };
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  const current = slides[currentSlide];

  return (
    <div
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exec-deck-title"
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Slide Control Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SmartSpaceLogo size={28} showTagline={false} />
            <span aria-hidden="true" className="text-xs font-bold text-slate-600">|</span>
            <span className="text-xs font-black text-slate-900">
              Executive Overview Deck
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close executive deck"
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-6 sm:p-10 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${current.badgeColor}`}>
                {current.tag}
              </span>
            </div>
            <h2 id="exec-deck-title" className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {current.subtitle}
            </p>
          </div>

          <div className="py-2">
            {current.render()}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-4">
          {/* Thumbnails */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1} of ${slides.length}`}
                aria-current={currentSlide === idx ? 'step' : undefined}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-purple-700' : 'w-2.5 bg-slate-400 hover:bg-slate-600'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              aria-label="Previous slide"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
