import React from 'react';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from './SmartSpaceLogo';
import { LiveReservationPreviewCard } from './LiveReservationPreviewCard';
import { InteractiveSpatialViewer } from './InteractiveSpatialViewer';
import { SaaSPricingMatrix } from './SaaSPricingMatrix';
import { SocialProofSection } from './SocialProofSection';
import { 
  Building2, 
  CalendarCheck, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  User, 
  Shield, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layers, 
  Users, 
  GraduationCap, 
  FileCheck2, 
  QrCode, 
  Zap, 
  HelpCircle, 
  ChevronRight, 
  ExternalLink,
  Presentation,
  Share2,
  Tv
} from 'lucide-react';

interface LandingAndLoginProps {
  onOpenDeck?: () => void;
  onOpenEmails?: () => void;
  onOpenOgPreview?: () => void;
}

export const LandingAndLogin: React.FC<LandingAndLoginProps> = ({
  onOpenDeck,
  onOpenEmails,
  onOpenOgPreview,
}) => {
  const { 
    openAuthPortal, 
    setIsDemoModalOpen, 
    loginAs, 
    setActiveView, 
    currentInstitution, 
    allInstitutions,
    setCurrentRole
  } = useApp();

  const handleRoleLaunch = (role: 'student' | 'admin' | 'super_admin') => {
    if (role === 'super_admin') {
      loginAs('super_admin', 'superadmin@smartspace.ph', 'SmartSpace Super Admin');
    } else if (role === 'admin') {
      loginAs('university_admin', 'admin.facilities@ctu.edu.ph', 'Engr. R. Santos');
    } else {
      loginAs('student', 'juan.delacruz@ctu.edu.ph', 'Juan Dela Cruz');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-20 py-2">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION (Inspired by supahero.io & land-book.com)      */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-8 sm:p-12 lg:p-14 border border-slate-800 shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headline, Value Proposition, Action CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Enterprise University Facility Booking & Governance SaaS</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                University Spaces, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 underline decoration-purple-500/40 decoration-wavy">
                  Booked Smarter.
                </span>
              </h1>
              <p className="text-lg sm:text-xl font-medium text-purple-200 italic pt-1">
                “Book It, Track It, Use It.”
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              SmartSpace centralizes university facility discovery, live availability validation, multi-level administrative approvals, and verifiable QR gate permits — replacing lost paper request slips, physical logbooks, and venue double-bookings across higher education institutions.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => openAuthPortal('selection', 'login', 'demo')}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Request Institutional Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => openAuthPortal('selection', 'login', 'login')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Log In to SmartSpace</span>
                <ChevronRight className="w-4 h-4 text-purple-300" />
              </button>
            </div>

            {/* Micro-Actions / Drawer Openers (deck.gallery, reallygoodemails, ogimage) */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-purple-200 border-t border-slate-800/80">
              {onOpenDeck && (
                <button
                  type="button"
                  onClick={onOpenDeck}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-purple-400" />
                  <span>Executive Pitch Deck</span>
                </button>
              )}
              {onOpenEmails && (
                <button
                  type="button"
                  onClick={onOpenEmails}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span>Email Alerts Suite</span>
                </button>
              )}
              {onOpenOgPreview && (
                <button
                  type="button"
                  onClick={onOpenOgPreview}
                  className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span>Social Share Card</span>
                </button>
              )}
            </div>

            {/* Key Value Metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Double Bookings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Paperless Approvals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Encrypted QR Passes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Reservation Card (supahero.io inspiration) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <LiveReservationPreviewCard />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. THE TWO AUDIENCE ENTRY POINTS                              */}
      {/* ------------------------------------------------------------- */}
      <section id="solutions" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Dedicated Solutions for Two Audiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tailored Experiences for Campuses & Communities
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            SmartSpace never forces university facility administrators and student requesters into the same generic interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Solution 1: For Higher Education Institutions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  Institutional Solution
                </span>
                <h3 className="text-xl font-bold text-slate-900 pt-1">
                  For Universities & Colleges
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Centralize facility reservations across departments, colleges, and satellite campuses with verifiable governance.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 pt-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Comprehensive Space Catalog:</strong> Configure capacity, equipment, rules, and operating hours.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Administrative Decision Workflows:</strong> Approve or reject requests with mandatory recorded justifications.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span><strong>Facility Utilization Reports:</strong> Real-time charts, peak usage metrics, and audit logs.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => openAuthPortal('institution', 'login', 'login')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold text-center transition-colors cursor-pointer"
              >
                University Admin Login
              </button>
              <button
                type="button"
                onClick={() => openAuthPortal('institution', 'register', 'login')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold text-center transition-colors cursor-pointer"
              >
                Register Institution
              </button>
            </div>
          </div>

          {/* Solution 2: For Organizations & Users */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                  End-User Solution
                </span>
                <h3 className="text-xl font-bold text-slate-900 pt-1">
                  For Student Orgs, Faculty & Campus Offices
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Browse venue availability in real time, submit reservation requests, and secure approved digital permits instantly.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 pt-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Live Availability Checking:</strong> Check hourly slots without physically hunting down campus guards or clerks.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Automated Conflict Checking:</strong> Prevents booking overlapping slots or requesting rooms exceeding capacity.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Digital Permit with QR Code:</strong> Present your mobile permit directly to campus security or building custodians.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => openAuthPortal('user', 'login', 'login')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold text-center transition-colors cursor-pointer"
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => openAuthPortal('user', 'register', 'login')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold text-center transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. INTERACTIVE 3D SPATIAL EXPLORER (Inspired by spline.com)    */}
      {/* ------------------------------------------------------------- */}
      <InteractiveSpatialViewer />

      {/* ------------------------------------------------------------- */}
      {/* 4. PLATFORM ARCHITECTURE & CAPABILITIES (#platform)           */}
      {/* ------------------------------------------------------------- */}
      <section id="platform" className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Engineered for Multi-University Reliability
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            SmartSpace operates as a secure multi-tenant cloud SaaS. Each subscribing university maintains its private facilities database, approval boundaries, and student rosters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Conflict Prevention Engine</h3>
            <p className="text-slate-400 leading-relaxed">
              Real-time schedule conflict engine ensures zero double-bookings across lecture rooms, computer laboratories, and auditoriums.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Institutional Isolation</h3>
            <p className="text-slate-400 leading-relaxed">
              University administrators can only review requests and modify facilities within their assigned institution. No cross-tenant leakage.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Verifiable QR Permits</h3>
            <p className="text-slate-400 leading-relaxed">
              Every approved booking generates an encrypted permit reference and QR code, readable by security guards at facility entrances.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Utilization Analytics</h3>
            <p className="text-slate-400 leading-relaxed">
              Actionable campus reports detailing room utilization rates, pending bottleneck durations, and rejection justifications.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. SOCIAL PROOF & BENCHMARKS (socialproofexamples.com)         */}
      {/* ------------------------------------------------------------- */}
      <SocialProofSection />

      {/* ------------------------------------------------------------- */}
      {/* 6. HOW IT WORKS (#how-it-works)                               */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Step-by-Step Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How University Facility Booking Works on SmartSpace
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From initial campus discovery to physical entry, everything is streamlined in 4 steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Browse & Filter Spaces</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore your university’s facilities by building, capacity, and equipment (projectors, audio, lab workstations).
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Check Live Availability</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select date and hours. The system instantly verifies if a slot is open, warning if another request is pending.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Administrative Decision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              University facility administrators review requests with complete event details, approving or providing rejection notes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-sm">Verified Entry Permit</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approved requesters receive a digital permit with QR verification, eliminating printed paperwork and signature slips.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. SAAS PRICING MATRIX (Inspired by pricingpages.design)       */}
      {/* ------------------------------------------------------------- */}
      <SaaSPricingMatrix />

      {/* ------------------------------------------------------------- */}
      {/* 8. ABOUT SMARTSPACE (#about)                                  */}
      {/* ------------------------------------------------------------- */}
      <section id="about" className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>About SmartSpace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Transforming Higher Education Facility Operations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              In Cebu City higher education institutions, student organizations and faculty face days of bureaucracy: physical paper forms routed through multiple offices, handwritten custodian logbooks, and last-minute room conflicts during crucial academic events.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              SmartSpace modernizes institutional facility management into a streamlined cloud SaaS. Our platform provides transparent scheduling, governance-compliant approvals, and actionable utilization metrics for universities of all sizes.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span>Active Anchor Campus: CTU Main</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span>Multi-Campus Network: {allInstitutions.length} Campuses</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border border-purple-100 space-y-4">
            <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider">
              Ready to Upgrade Campus Facilities?
            </h3>
            <p className="text-xs text-purple-800 leading-relaxed">
              Access the three dedicated role interfaces: Student Organization Requester, University Facility Administrator, and Platform Super Admin.
            </p>
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => openAuthPortal('selection', 'login', 'login')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter SmartSpace Access Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-purple-900 border border-purple-200 text-xs font-bold transition-all text-center cursor-pointer"
              >
                Request an Institutional Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. INSTANT WORKSPACE ROLE ACCESS BAR                          */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Direct Role Workspaces</span>
            </h3>
            <p className="text-xs text-slate-400">
              Immediate access to specific role workflows across the platform:
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800 self-start sm:self-auto">
            Role-Based Access
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleRoleLaunch('student')}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Student Requester
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400">
              Juan Dela Cruz · SSG Officer (CTU Main)
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleRoleLaunch('admin')}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                University Facility Admin
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400">
              Engr. R. Santos · Facilities Office (CTU Main)
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleRoleLaunch('super_admin')}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Platform Super Admin
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-University Platform Operations & Tenant Review
            </p>
          </button>
        </div>
      </section>
    </div>
  );
};
