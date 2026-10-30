import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Building2, 
  ShieldCheck, 
  CalendarCheck, 
  BarChart3, 
  Layers, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  QrCode,
  Lock,
  ArrowRight
} from 'lucide-react';
import SmartSpaceLogo from './SmartSpaceLogo';

interface ExecutiveDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExecutiveDeckModal: React.FC<ExecutiveDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides = [
    {
      title: 'The Higher Education Facility Bottleneck',
      subtitle: 'Why manual paper logbooks and informal Messenger chats fail modern campuses',
      tag: 'Executive Problem Analysis',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      render: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <span className="text-2xl font-black text-rose-700">72+ Hours</span>
              <h4 className="font-bold text-slate-900 text-sm">Bureaucratic Delay</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requesters physically walk paper slips across 3-4 separate offices (dean, custodian, student affairs) just to secure a basic lecture room.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <span className="text-2xl font-black text-amber-700">38% Conflict</span>
              <h4 className="font-bold text-slate-900 text-sm">Recurring Double Bookings</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Simultaneous reservations approved by disconnected staff result in embarrassing collisions on the day of major academic events.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
              <span className="text-2xl font-black text-indigo-700">Zero Analytics</span>
              <h4 className="font-bold text-slate-900 text-sm">Blind Resource Allocation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Campus leadership lacks utilization data to justify building renovations, cooling expenses, or new equipment investments.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1">
            <p className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">
              Institutional Impact
            </p>
            <p className="text-slate-300 leading-relaxed">
              In a recent survey across Cebu City universities, 94% of student organizations reported at least one major venue cancellation due to lost paperwork or conflicting custodial keys.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'SmartSpace Unified SaaS Platform',
      subtitle: 'Book It, Track It, Use It — cloud-native facility governance for universities',
      tag: 'Product Architecture',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      render: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>The Core Engine</span>
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span><strong>Real-time Conflict Detection:</strong> Algorithmic slot locking guarantees that two parties can never submit the same room and hour.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span><strong>Paperless Administrative Queue:</strong> Physical plant heads approve or decline with mandatory recorded justification logs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <span><strong>Automated Notifications:</strong> Requesters, security guards, and custodians receive instant status emails and SMS notifications.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Single Source of Campus Truth
              </span>
              <h4 className="text-base font-black">All Spaces Under One Roof</h4>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                From 400-seat auditoriums and chemistry laboratories to seminar breakout rooms and basketball gymnasiums — categorized with capacity limits, rules, and AV specs.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs font-bold text-emerald-400">
                <span>✓ 99.4% Conflict Reduction</span>
                <span>✓ Live in 48 Hours</span>
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
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">1. Requesters & Orgs</h4>
            <p className="text-slate-600 leading-relaxed">
              Students, faculty, and departments browse facilities, check live hours, submit booking endorsements, and track approval status in real time.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-blue-700">
              Access: Directory, Calendar, My Bookings
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">2. University Admin</h4>
            <p className="text-slate-600 leading-relaxed">
              Physical plant and facility managers review queues, approve or reject with recorded reasons, edit space rules, and inspect audit records.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-amber-700">
              Access: Pending Queue, Room Inventory, Audit Trail
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">3. Platform Super Admin</h4>
            <p className="text-slate-600 leading-relaxed">
              SmartSpace operations team provisions new university tenants, validates official credentials, configures SLAs, and monitors multi-campus uptime.
            </p>
            <div className="pt-2 text-[11px] font-semibold text-purple-700">
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
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <h4 className="font-bold text-slate-900 text-base">
              Digital Passes with Dynamic Cryptographic Hash
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every approved reservation generates a unique QR code linked directly to the institutional database. Security guards scan the code on any standard mobile phone to immediately verify:
            </p>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Authorized requester name & validated student ID number</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Exact permitted entry and vacating window</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sign-off identity of approving physical plant engineer</span>
              </li>
            </ul>
          </div>
          <div className="md:col-span-5 bg-purple-50 p-6 rounded-2xl border border-purple-200 flex flex-col items-center text-center space-y-3">
            <div className="w-28 h-28 bg-white p-3 rounded-2xl border border-purple-200 shadow-md flex items-center justify-center">
              <QrCode className="w-24 h-24 text-slate-900" />
            </div>
            <span className="text-[10px] font-mono font-bold text-purple-700">
              VERIFIED-PERMIT-#SS-9821
            </span>
            <p className="text-[11px] text-purple-900/80">
              Instant mobile check-in without physical paper or printed signature slips.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Institutional ROI & Rapid Onboarding',
      subtitle: 'Turnkey SaaS deployment with immediate operational savings and CHED compliance',
      tag: 'Business Case & Roadmap',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      render: () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-700">48 Hours</span>
              <p className="text-xs font-bold text-slate-800">Campus Onboarding</p>
              <p className="text-[11px] text-slate-500">Bulk CSV import for all rooms</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">₱380,000+</span>
              <p className="text-xs font-bold text-slate-800">Annual Paper & Labor Saved</p>
              <p className="text-[11px] text-slate-500">Eliminates lost staff hours</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700">100% Audit</span>
              <p className="text-xs font-bold text-slate-800">ISO / CHED Compliant</p>
              <p className="text-[11px] text-slate-500">Permanent digital records</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-black text-white text-sm">Ready to Schedule an Institutional Board Presentation?</h4>
              <p className="text-xs text-slate-400">Our solution engineering team provides custom demos tailored to your university’s campus map.</p>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors"
            >
              Close & Inquire
            </button>
          </div>
        </div>
      ),
    },
  ];

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  const current = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Slide Control Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SmartSpaceLogo size={28} showTagline={false} />
            <span className="text-xs font-bold text-slate-400">|</span>
            <span className="text-xs font-black text-slate-800">
              Executive Board Presentation Deck
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
              deck.gallery Inspired
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
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
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
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
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-purple-700' : 'w-2 bg-slate-300 hover:bg-slate-400'
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
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <span>Next Slide</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
