import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { 
  Building2, 
  CalendarCheck, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Users, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  FileCheck2, 
  QrCode, 
  Zap, 
  Search, 
  Sliders, 
  Tv, 
  Check, 
  X, 
  Menu,
  HelpCircle, 
  Sparkles, 
  Lock,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';

export const PublicMarketingPortal: React.FC = () => {
  const { navigate } = useRouter();

  // Mobile menu open state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active showcase tab for Section 11 (Actual Product Interface Preview)
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'directory' | 'calendar' | 'approval' | 'reports'>('directory');

  // Interactive booking preview states
  const [previewRoom, setPreviewRoom] = useState<'auditorium' | 'lab' | 'lecture'>('auditorium');
  const [previewTime, setPreviewTime] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'How does SmartSpace prevent double bookings across diverse campus venues?',
      a: 'SmartSpace employs a real-time reservation conflict engine. The moment a timeslot is reserved or approved by a university facility administrator, that specific room and hour block is locked against conflicting submissions across all departments, faculties, and student councils.',
    },
    {
      q: 'How are multi-tenant university data and student records isolated?',
      a: 'Each participating institution operates within an isolated tenant partition. University administrators can only access and approve requests submitted within their campus, and student organization rosters are strictly sandboxed per institution.',
    },
    {
      q: 'Do security personnel or gate custodians require specialized hardware?',
      a: 'No proprietary hardware is required. When a booking is approved, SmartSpace generates an encrypted digital permit featuring a verifiable QR code. Security guards on duty can scan and verify the permit on any standard smartphone camera.',
    },
    {
      q: 'What is the implementation timeline for a college or university?',
      a: 'A single-campus setup is typically configured within 48 to 72 hours. Our onboarding team provides pre-formatted spreadsheet templates to import your existing room catalog, operating hours, capacity limits, and equipment tags.',
    },
    {
      q: 'Can our university customize approval tiers and endorsement forms?',
      a: 'Yes. Institutional administrators can configure specific advance booking windows, mandatory endorsement rules, required attachments (such as student affairs signatures or adviser approvals), and custom operating hours per facility.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased selection:bg-purple-100 selection:text-purple-900">
      {/* ------------------------------------------------------------- */}
      {/* 0. BRAND TAGLINE ANNOUNCEMENT BAR                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-950 text-white text-xs py-2 px-4 border-b border-slate-800 flex items-center justify-center gap-2.5 sm:gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Campus Resource Platform
        </span>
        <span className="text-slate-600">•</span>
        <span className="font-black tracking-wider text-white italic text-[10px] sm:text-[11px]">
          “BOOK IT, TRACK IT, USE IT.”
        </span>
        <span className="hidden md:inline text-slate-600">•</span>
        <span className="hidden md:inline text-slate-300 text-[11px]">
          Every Campus Space. One Smarter Way to Book.
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. PREMIUM NAVIGATION BAR                                      */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="cursor-pointer hover:opacity-95 text-left"
              >
                <SmartSpaceLogo size={36} showTagline={true} />
              </button>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => scrollToSection('platform')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                Platform
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('audiences')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                Solutions
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('comparison')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                Comparison
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                Capabilities
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('workflow')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('faq')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                FAQ
              </button>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('/access')}
                className="hidden sm:inline-flex px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => navigate('/request-demo')}
                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-md shadow-purple-900/10 hover:shadow-lg transition-all cursor-pointer active:scale-98 min-h-[40px] flex items-center justify-center"
              >
                Request a Demo
              </button>

              {/* Mobile menu toggle button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-purple-700 hover:bg-slate-100 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700">
              <button
                onClick={() => { scrollToSection('platform'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                Platform
              </button>
              <button
                onClick={() => { scrollToSection('audiences'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                Solutions
              </button>
              <button
                onClick={() => { scrollToSection('comparison'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                Comparison
              </button>
              <button
                onClick={() => { scrollToSection('features'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                Capabilities
              </button>
              <button
                onClick={() => { scrollToSection('workflow'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => { scrollToSection('faq'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
              >
                FAQ
              </button>
            </nav>
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <button
                onClick={() => { navigate('/access'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                Log In to Access Portal
              </button>
              <button
                onClick={() => { navigate('/request-demo'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 flex items-center justify-center gap-2 shadow-sm cursor-pointer min-h-[44px]"
              >
                Request Institutional Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. PRODUCT-FOCUSED HERO SECTION                                */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 bg-gradient-to-b from-slate-50 via-white to-white">
        {/* Subtle mesh background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          {/* Headline & Value Proposition */}
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>Multi-University Facility Booking & Governance SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight">
              Every Campus Space. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900">
                One Smarter Way to Book.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              SmartSpace gives universities one organized platform to manage facility reservations, coordinate approvals, and keep every booking on track — from student organizations to faculty and campus offices.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/request-demo')}
                className="px-6 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Request a Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore the Platform</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Prominent Realistic Product Mockup Composition (Skedda & Spline depth inspired) */}
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] border border-slate-800">
              {/* Window Controls Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-xs text-slate-400 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-[11px] font-mono text-slate-400">smartspace.ph/university/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Conflict Engine Active</span>
                </div>
              </div>

              {/* Internal Mockup Content */}
              <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 text-white">
                {/* Left: Facility Directory Preview Card */}
                <div className="md:col-span-5 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      Campus Venue Directory
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                      Open Today
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-base">Main Campus Cultural Auditorium</h3>
                    <p className="text-xs text-slate-400">Academic Complex · Level 1</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium">Capacity</span>
                      <strong className="text-white">350 Attendees</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block font-medium">AV Equipment</span>
                      <strong className="text-white">Full PA & 4K Rig</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-purple-200">
                      <span className="font-bold">Next Available Slot:</span>
                      <span className="font-mono text-emerald-400">2:00 PM – 5:00 PM</span>
                    </div>
                    <p className="text-[10px] text-slate-400">0 schedule conflicts detected for today.</p>
                  </div>
                </div>

                {/* Right: Live Reservation Status & Approval Queue Mockup */}
                <div className="md:col-span-7 space-y-4">
                  <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Administrative Approval Queue
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Ref #SS-CTU-9821</span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-white">General Assembly & Symposium</h4>
                        <p className="text-xs text-slate-400">Supreme Student Council · 120 Expected</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        APPROVED
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        <span>Scheduled: Friday, 02:00 PM – 05:00 PM</span>
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Pass Issued</span>
                      </span>
                    </div>
                  </div>

                  {/* Secondary mini mockup row */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Conflict Prevention
                      </span>
                      <p className="text-xs text-slate-200 font-semibold">Overlapping Slot Check</p>
                      <span className="text-[10px] text-emerald-400 font-bold block">✓ 0 Collisions Found</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Custodial Key Turnover
                      </span>
                      <p className="text-xs text-slate-200 font-semibold">Building Guard Mobile Scan</p>
                      <span className="text-[10px] text-purple-400 font-bold block">✓ Verified Digital Gate Pass</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2.5 OFFICIAL BRAND PILLARS: BOOK SMARTER. MANAGE BETTER.       */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-gradient-to-b from-white via-amber-50/20 to-white border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Heading matching Image 5 */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0077C8] text-xs font-bold border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-[#0077C8] animate-pulse" />
              <span>Core Brand Principles</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black italic tracking-tight text-[#0077C8]">
              BOOK SMARTER. MANAGE BETTER.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Designed specifically around the four essential needs of modern university campus operations.
            </p>
          </div>

          {/* Grid of the 4 Pillars matching Image 5 exact styling & copy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Pillar 1 */}
            <div className="relative bg-[#FEF3E2] hover:bg-[#FEE8C8] rounded-3xl p-6 sm:p-7 border-2 border-[#E6F9AF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white text-[#0077C8] shadow-xs flex items-center justify-center font-black text-lg border border-amber-200">
                  01
                </div>
                <h3 className="text-xl font-black text-[#0077C8] tracking-tight group-hover:text-blue-800 transition-colors">
                  Simplified Reservations
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Submit requests conveniently across campus venues with real-time slot checking.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-[#0077C8]">
                <span>Frictionless Booking</span>
                <span>→</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="relative bg-[#FEF3E2] hover:bg-[#FEE8C8] rounded-3xl p-6 sm:p-7 border-2 border-[#E6F9AF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white text-[#0077C8] shadow-xs flex items-center justify-center font-black text-lg border border-amber-200">
                  02
                </div>
                <h3 className="text-xl font-black text-[#0077C8] tracking-tight group-hover:text-blue-800 transition-colors">
                  Organized Records
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Keep track of reservation statuses, endorsement paperwork, and verified history in one place.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-[#0077C8]">
                <span>Status Tracking</span>
                <span>→</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="relative bg-[#FEF3E2] hover:bg-[#FEE8C8] rounded-3xl p-6 sm:p-7 border-2 border-[#E6F9AF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white text-[#0077C8] shadow-xs flex items-center justify-center font-black text-lg border border-amber-200">
                  03
                </div>
                <h3 className="text-xl font-black text-[#0077C8] tracking-tight group-hover:text-blue-800 transition-colors">
                  Facility Information
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Access facility details, capacities, equipment inventory, and interactive schedules on demand.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-[#0077C8]">
                <span>Live Catalogs</span>
                <span>→</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="relative bg-[#FEF3E2] hover:bg-[#FEE8C8] rounded-3xl p-6 sm:p-7 border-2 border-[#E6F9AF] shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white text-[#0077C8] shadow-xs flex items-center justify-center font-black text-lg border border-amber-200">
                  04
                </div>
                <h3 className="text-xl font-black text-[#0077C8] tracking-tight group-hover:text-blue-800 transition-colors">
                  Efficient Facility Management
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Support facility administrators with automated approvals, conflict locks, and comprehensive logs.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-[#0077C8]">
                <span>Admin Governance</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Dual Brand Graphic Feature: Showing Images 4 and 5 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SPACE FOR EVERY POSSIBILITY</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Meet SmartSpace.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A smarter way to discover, reserve, and manage shared university facilities. From students booking study spaces to administrative councils organizing campus-wide conventions.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/request-demo')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                >
                  Schedule Institutional Walkthrough
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/access')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  Enter Access Gateway
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 p-2 max-w-lg w-full group">
                <img
                  src="/assets/aistudio/4_eae3ba44.png"
                  alt="Meet SmartSpace - Space For Every Possibility"
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. INSTITUTIONAL AUDIENCE SECTION (#audiences)                 */}
      {/* ------------------------------------------------------------- */}
      <section id="audiences" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              Clear Business Positioning
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Built for Universities. Designed for Campus Operators.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              SmartSpace is not a generic consumer calendar or a student-only room tracker. We serve higher education institutions as primary customers, while empowering the organizations that use campus spaces every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Primary Paying Customers: Institutions */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                    Primary Paying Customers
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 pt-1">
                    Universities, Colleges & Systems
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    Public state universities, private higher education institutions, specialized colleges, and multi-campus systems that need campus-wide governance and space optimization.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-700 pt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Physical Plant & Facilities Offices:</strong> Centralize room rules, HVAC operating hours, and equipment tracking.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Deans & Academic Administrators:</strong> Eliminate double-booked lecture halls during exam weeks and symposia.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Campus Security & Building Custodians:</strong> Instant mobile verification of approved room occupants at the gate.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/request-demo')}
                  className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs text-center transition-colors cursor-pointer"
                >
                  Request Institutional Proposal
                </button>
              </div>
            </div>

            {/* Primary End Users: Organizations & Faculty */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                    Primary End Users
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 pt-1">
                    Student Orgs, Faculty & Campus Offices
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    Student councils, recognized academic clubs, collegiate departments, and administrative units that regularly reserve rooms for events.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-700 pt-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Student Organization Officers:</strong> View live venue availability and submit digital requests without walking physical paper forms.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Faculty Members & Department Chairs:</strong> Reserve computer laboratories and screening rooms with instant conflict verification.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Event Organizers:</strong> Receive encrypted digital permits with QR codes directly on their mobile devices upon approval.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/access')}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center transition-colors cursor-pointer"
                >
                  Enter User Access Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. TRADITIONAL BOOKING VERSUS SMARTSPACE COMPARISON TABLE       */}
      {/* ------------------------------------------------------------- */}
      <section id="comparison" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Operational Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Manual Paper Routing vs. SmartSpace Cloud SaaS
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            See how SmartSpace transforms days of bureaucratic friction into a transparent, audit-ready digital workflow.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-6 font-bold w-1/3">Facility Operation Factor</th>
                  <th className="py-4 px-6 font-bold text-rose-700 w-1/3 bg-rose-50/40">Traditional Paper & Logbook System</th>
                  <th className="py-4 px-6 font-bold text-purple-800 w-1/3 bg-purple-50/50">SmartSpace Cloud SaaS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-800">Availability Discovery</td>
                  <td className="py-4 px-6 text-slate-600 bg-rose-50/10">
                    <span className="flex items-center gap-1.5 text-rose-700 font-semibold mb-1">
                      <X className="w-4 h-4 shrink-0" /> Blind Inquiries
                    </span>
                    Requesters must walk between offices or hunt down building custodians with physical logbooks.
                  </td>
                  <td className="py-4 px-6 text-slate-700 bg-purple-50/20">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" /> Real-Time Online Calendar
                    </span>
                    Inspect hourly room availability, equipment specs, and capacity limits 24/7 on any device.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-800">Double-Booking Risk</td>
                  <td className="py-4 px-6 text-slate-600 bg-rose-50/10">
                    <span className="flex items-center gap-1.5 text-rose-700 font-semibold mb-1">
                      <X className="w-4 h-4 shrink-0" /> Frequent Collisions
                    </span>
                    Simultaneous paper forms approved by different deans lead to embarrassing venue collisions on event day.
                  </td>
                  <td className="py-4 px-6 text-slate-700 bg-purple-50/20">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" /> Algorithmic Conflict Engine
                    </span>
                    The platform instantly blocks overlapping submissions for the same date and hour range.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-800">Approval Workflow</td>
                  <td className="py-4 px-6 text-slate-600 bg-rose-50/10">
                    <span className="flex items-center gap-1.5 text-rose-700 font-semibold mb-1">
                      <X className="w-4 h-4 shrink-0" /> 3–5 Business Days
                    </span>
                    Physical routing across deans, student affairs, and physical plant heads with frequent lost slips.
                  </td>
                  <td className="py-4 px-6 text-slate-700 bg-purple-50/20">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" /> Centralized Admin Queue
                    </span>
                    Authorized facility managers review, approve, or reject with recorded justification notes in seconds.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-800">Gate Verification</td>
                  <td className="py-4 px-6 text-slate-600 bg-rose-50/10">
                    <span className="flex items-center gap-1.5 text-rose-700 font-semibold mb-1">
                      <X className="w-4 h-4 shrink-0" /> Easily Forged Paper
                    </span>
                    Guards must rely on printed, easily misplaced slips without verifiable signatory validation.
                  </td>
                  <td className="py-4 px-6 text-slate-700 bg-purple-50/20">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" /> Encrypted QR Code Pass
                    </span>
                    Approved requesters present an encrypted digital permit scanned by campus security at the entrance.
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-bold text-slate-800">Institutional Reporting</td>
                  <td className="py-4 px-6 text-slate-600 bg-rose-50/10">
                    <span className="flex items-center gap-1.5 text-rose-700 font-semibold mb-1">
                      <X className="w-4 h-4 shrink-0" /> Zero Analytics
                    </span>
                    No data to justify physical plant budgets, cooling expenses, or CHED compliance facility usage audits.
                  </td>
                  <td className="py-4 px-6 text-slate-700 bg-purple-50/20">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                      <Check className="w-4 h-4 shrink-0 text-emerald-600" /> Utilization & Audit Reports
                    </span>
                    Exportable records, peak utilization graphs, and complete accountability logs across all campus buildings.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5, 6, 7, 8. FOUR CORE PRODUCT CAPABILITIES (#features)        */}
      {/* ------------------------------------------------------------- */}
      <section id="features" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
              Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Engineered for Institutional Governance
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Four specialized functional modules working together within a secure multi-tenant infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Facility Directory Showcase */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">1. Comprehensive Facility Inventory</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Configure lecture rooms, specialized computer labs, auditoriums, and seminar halls with exact capacity limits, installed audio-visual equipment, operational hours, and specific departmental guidelines.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">✓ Category, floor level, and building filtering</li>
                <li className="flex items-center gap-2">✓ Equipment catalog (laser projectors, PA rigs, PCs)</li>
                <li className="flex items-center gap-2">✓ Configurable custodial buffers between bookings</li>
              </ul>
            </div>

            {/* Feature 2: Availability & Booking Engine */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">2. Live Availability & Conflict Blocker</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Requesters select target dates and timeslots with immediate visual confirmation of open windows. Our conflict algorithm prevents overlapping bookings and enforces campus operating hour limits automatically.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">✓ Instant 0.02s schedule verification</li>
                <li className="flex items-center gap-2">✓ Overcapacity safety warnings</li>
                <li className="flex items-center gap-2">✓ Advance submission window enforcement</li>
              </ul>
            </div>

            {/* Feature 3: University Admin Decision Workflows */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">3. Review Queue with Recorded Justifications</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Authorized physical plant administrators inspect request details, purpose notes, attendee counts, and organization endorsements. Declinations require a recorded audit reason returned to the requester.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">✓ 1-click administrative determinations</li>
                <li className="flex items-center gap-2">✓ Mandatory rejection notes for administrative clarity</li>
                <li className="flex items-center gap-2">✓ Automatic QR pass generation upon approval</li>
              </ul>
            </div>

            {/* Feature 4: Centralized Records & Utilization */}
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">4. Institutional Records & Utilization Metrics</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Track campus space utilization over time, identify peak bottleneck hours, monitor cancellation rates, and export structured CSV audit reports for university regents and CHED accreditation visits.
              </p>
              <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">✓ Hourly occupancy percentage tracking</li>
                <li className="flex items-center gap-2">✓ Permanent digital audit log for all actions</li>
                <li className="flex items-center gap-2">✓ Structured CSV export for board reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. FOUR-STEP BOOKING WORKFLOW (#workflow)                      */}
      {/* ------------------------------------------------------------- */}
      <section id="workflow" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            End-to-End Execution
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            How Campus Facility Booking Works
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            From discovering venue availability to physical gate check-in, everything is coordinated in 4 steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="font-bold text-slate-900 text-base">Browse Venue Catalog</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Explore your university's spaces by building, capacity, and equipment specs (projectors, audio, lab computers).
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="font-bold text-slate-900 text-base">Check Live Hours</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select date and hour windows. The system verifies availability in real-time, preventing double booking submissions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="font-bold text-slate-900 text-base">Admin Determination</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authorized university facility administrators review the request with event notes, approving or declining with reasons.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative">
            <span className="w-9 h-9 rounded-2xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center">
              4
            </span>
            <h3 className="font-bold text-slate-900 text-base">Verified QR Entry Pass</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approved requesters receive an encrypted digital permit with QR verification, scanned by security guards at the facility door.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. THREE ROLE-BASED PRODUCT EXPLANATIONS                      */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              Role Governance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Three Separate Portals. Clear Permissions.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              SmartSpace maintains strict privilege boundaries. No student can view admin controls, and no university admin can access other institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">1. End-User Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated exclusively to student organizations, clubs, faculty members, and campus offices to browse rooms, submit booking requests, and present digital permits.
              </p>
              <div className="pt-2 text-[11px] text-blue-700 font-semibold">
                Routes: /user/login · /user/dashboard
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">2. University Admin Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authorized physical plant and facility managers review their campus queue, approve or reject with justification, edit venue rules, and inspect audit records.
              </p>
              <div className="pt-2 text-[11px] text-purple-700 font-semibold">
                Routes: /university/login · /university/dashboard
              </div>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">3. Super Admin Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Platform operations console restricted to authorized platform administrators via server-side allowlist to enroll institutions and monitor network health.
              </p>
              <div className="pt-2 text-[11px] text-slate-900 font-semibold">
                Routes: /superadmin/login · /superadmin/dashboard
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. ACTUAL PRODUCT INTERFACE PREVIEW (Interactive UI Tabs)     */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Interactive Product Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Explore the Real SmartSpace Experience
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Switch between core interface views to see how SmartSpace organizes campus facility operations.
          </p>

          {/* Tab Selector */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveShowcaseTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcaseTab === 'directory'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Facility Directory View
            </button>
            <button
              onClick={() => setActiveShowcaseTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcaseTab === 'calendar'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Availability Checker
            </button>
            <button
              onClick={() => setActiveShowcaseTab('approval')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcaseTab === 'approval'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Admin Approval Queue
            </button>
            <button
              onClick={() => setActiveShowcaseTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcaseTab === 'reports'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Utilization Analytics
            </button>
          </div>
        </div>

        {/* Dynamic Showcase Container */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl max-w-4xl mx-auto">
          {activeShowcaseTab === 'directory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white">Central Campus Space Inventory</h3>
                  <p className="text-xs text-slate-400">Searchable venue catalog with specifications and capacity.</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2.5 py-1 rounded text-purple-300">
                  Directory Module
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-white">Cultural Center Auditorium</span>
                    <span className="text-emerald-400 font-bold">350 Seats</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Academic Hall 1 · Level 1</p>
                  <div className="flex flex-wrap gap-1 text-[9px] text-slate-300 pt-1">
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">4K Projection</span>
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">Surround PA</span>
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">Air Conditioned</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-white">Computer Laboratory 1</span>
                    <span className="text-emerald-400 font-bold">45 Workstations</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Technology Wing · Room 204</p>
                  <div className="flex flex-wrap gap-1 text-[9px] text-slate-300 pt-1">
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">Gigabit LAN</span>
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">Smart Board</span>
                    <span className="bg-slate-700 px-1.5 py-0.5 rounded">UPS Backup</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white">Real-Time Availability Checker</h3>
                  <p className="text-xs text-slate-400">Instant conflict blocker verifying hourly windows.</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2.5 py-1 rounded text-emerald-300">
                  Algorithm Active
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Slot Confirmed Open: No Collisions</span>
                  </span>
                  <span className="font-mono text-emerald-300 text-[10px]">Verification: 0.02s</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Cultural Center Auditorium is clear on Friday from 02:00 PM – 05:00 PM. No prior bookings or custodian holds.
                </p>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'approval' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white">Administrator Review & Permitting</h3>
                  <p className="text-xs text-slate-400">1-click determination with mandatory recorded audit justifications.</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2.5 py-1 rounded text-purple-300">
                  Governance Queue
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-white block">Supreme Student Council Symposium</span>
                  <span className="text-slate-400 text-[11px] block">Lecture Room A · 40 Expected · Student Officer Endorsement Attached</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-purple-700 text-white font-bold text-xs">
                    Approve & Issue QR Pass
                  </span>
                  <span className="px-3 py-1 rounded-xl border border-slate-700 text-slate-400 text-xs">
                    Decline
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white">Utilization & Compliance Reporting</h3>
                  <p className="text-xs text-slate-400">Audit-ready metrics on campus space efficiency.</p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-slate-800 px-2.5 py-1 rounded text-amber-300">
                  Analytics
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-lg font-black text-purple-400">78.4%</span>
                  <p className="text-[10px] text-slate-400">Auditorium Peak Usage</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-lg font-black text-indigo-400">92.1%</span>
                  <p className="text-[10px] text-slate-400">Lab Capacity Utilization</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                  <span className="text-lg font-black text-emerald-400">0</span>
                  <p className="text-[10px] text-slate-400">Double Bookings</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 12. INSTITUTION-FOCUSED BENEFITS                               */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              Institutional Value
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Why Higher Education Leaders Choose SmartSpace
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed specifically to meet university governance, security, and space optimization demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">Total Schedule Integrity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guaranteed zero double-bookings across campus auditoriums, labs, and lecture rooms through algorithmic timeslot locking.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">Physical Security Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gate security personnel scan cryptographic QR code passes directly at entrance doors, ensuring only approved events access campus facilities.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-lg">Audit & Accreditation Readiness</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permanent digital audit logs of every booking request, approval signatory, and rejection reason for institutional compliance reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 13. INSTITUTIONAL DEMO REQUEST SECTION                         */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-800/40 px-3 py-1 rounded-full border border-purple-700/50">
              Institutional Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Request a Tailored University Demo
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Discover how SmartSpace can centralize your university's facility catalog, eliminate schedule conflicts, and empower student organizations.
            </p>
          </div>

          <div className="space-y-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate('/request-demo')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-purple-950 font-bold text-xs sm:text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Schedule Institutional Demo</span>
              <ArrowRight className="w-4 h-4 text-purple-700" />
            </button>
            <p className="text-[10px] text-center text-purple-300">
              Zero setup fee · No account required to inquire
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 14. COMPREHENSIVE INSTITUTIONAL FAQ (#faq)                     */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
              Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600">
              Detailed answers for university administrators, facility managers, and student leaders.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-slate-900 text-sm hover:text-purple-700 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-purple-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs sm:text-sm text-slate-600 pt-3 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 15. FINAL CONVERSION SECTION                                  */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          Ready to Modernize Campus Facilities?
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Join higher education institutions standardizing their space reservations on SmartSpace.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/request-demo')}
            className="px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            Request a Demo
          </button>
          <button
            onClick={() => navigate('/access')}
            className="px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Enter Access Portal
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 16. PROFESSIONAL B2B SAAS FOOTER                               */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-sm">
              <SmartSpaceLogo size={32} showTagline={true} />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cloud-based multi-university facility booking and resource management SaaS platform. Book It. Track It. Use It.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">Portals</span>
                <button onClick={() => navigate('/access')} className="block hover:text-purple-700">Access Gateway</button>
                <button onClick={() => navigate('/user/login')} className="block hover:text-purple-700">End-User Portal</button>
                <button onClick={() => navigate('/university/login')} className="block hover:text-purple-700">University Admin</button>
                <button onClick={() => navigate('/superadmin/login')} className="block hover:text-purple-700">Super Admin</button>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">Product</span>
                <button onClick={() => scrollToSection('platform')} className="block hover:text-purple-700">Platform</button>
                <button onClick={() => scrollToSection('features')} className="block hover:text-purple-700">Capabilities</button>
                <button onClick={() => scrollToSection('comparison')} className="block hover:text-purple-700">Comparison</button>
                <button onClick={() => navigate('/request-demo')} className="block hover:text-purple-700">Request Demo</button>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">Governance</span>
                <span className="block text-slate-400">Institutional Sandboxing</span>
                <span className="block text-slate-400">RA 10173 Compliance</span>
                <span className="block text-slate-400">Server Allowlist Security</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} SmartSpace SaaS Platform. All rights reserved.</p>
            <p className="text-slate-400">
              Multi-University SaaS Facility Booking & Management Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
