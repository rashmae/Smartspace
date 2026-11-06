import React, { useState, useMemo } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { FacilityDetailModal } from '../components/FacilityDetailModal';
import { ExecutiveDeckModal } from '../components/ExecutiveDeckModal';
import { DemoRequestModal } from '../components/DemoRequestModal';
import { Facility } from '../types';
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
  BarChart3,
  FileCheck2,
  QrCode,
  Zap,
  Search,
  Check,
  X,
  Menu,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Presentation,
  Filter,
  ArrowDown,
  CalendarDays,
  ShieldAlert,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';

export const PublicMarketingPortal: React.FC = () => {
  const { navigate } = useRouter();
  const { setIsDemoModalOpen } = useApp();

  // Navigation & Drawer states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExecutiveDeckOpen, setIsExecutiveDeckOpen] = useState(false);
  const [selectedFacilityForModal, setSelectedFacilityForModal] = useState<Facility | null>(null);

  // Hero interactive venue slider state
  const [heroVenueIndex, setHeroVenueIndex] = useState(0);

  // Facility discovery catalog states (curated preview only)
  const [selectedPreviewCategory, setSelectedPreviewCategory] = useState<string>('All');

  // Interactive Product Interface Showcase state
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'directory' | 'calendar' | 'approval' | 'reports'>('directory');

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Hero Venue Showcase items (campus venues classified by Public and Private sectors)
  const heroVenues = [
    {
      id: 'preview-fac-auditorium',
      name: 'Main Campus Cultural Auditorium',
      category: 'Auditorium & Theatre',
      institution: 'Public Higher Education Institution',
      capacity: 450,
      equipment: 'Stage PA System · 4K Dual Stage Rig · Stage Spotlights · Central AC',
      status: 'Open Today · 0 Conflicts',
      nextSlot: '2:00 PM – 5:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'border-[#0077C8] text-[#0077C8] bg-blue-50',
    },
    {
      id: 'preview-fac-gym',
      name: 'University Gymnasium & Sports Arena',
      category: 'Campus Gymnasium',
      institution: 'Public Higher Education Institution',
      capacity: 800,
      equipment: 'Maple Hardwood Multi-Court · Digital LED Scoreboard · Retractable Bleachers',
      status: 'Available · Practice Window Open',
      nextSlot: '3:30 PM – 7:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'border-[#EE2726] text-[#EE2726] bg-red-50',
    },
    {
      id: 'preview-fac-courts',
      name: 'Varsity Tennis & Open Athletic Courts',
      category: 'Open Athletics Court',
      institution: 'Private Higher Education University',
      capacity: 60,
      equipment: 'Tournament Hardcourts · High-Lumen Night Floodlights · Umpire Chairs',
      status: 'Open Today · Evening Slots Active',
      nextSlot: '4:00 PM – 6:30 PM',
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'border-[#8CC63F] text-[#8CC63F] bg-lime-50',
    },
    {
      id: 'preview-fac-commlab-1',
      name: 'High-Performance Computer Laboratory 1',
      category: 'STEM Laboratory',
      institution: 'Private Higher Education University',
      capacity: 30,
      equipment: '30 Dell Workstations · Interactive Laser Projector · Gigabit Fiber LAN',
      status: 'Open Today · Coding Session Ready',
      nextSlot: '1:00 PM – 4:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'border-[#FDB813] text-amber-700 bg-amber-50',
    },
    {
      id: 'preview-fac-lecture-a',
      name: 'Academic Lecture Hall Room A',
      category: 'Lecture Hall',
      institution: 'Public Higher Education Institution',
      capacity: 40,
      equipment: 'Overhead HD Projector · Magnetic Whiteboard · Faculty HDMI Lectern',
      status: 'Open Today · Seminar Ready',
      nextSlot: '10:00 AM – 1:00 PM',
      imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
      badgeColor: 'border-[#0077C8] text-[#0077C8] bg-blue-50',
    },
  ];

  const currentHeroVenue = heroVenues[heroVenueIndex];

  // Curated Sample Facility Previews (Only representative preview venues are shown publicly; full catalog requires logging in)
  const samplePreviewFacilities: (Facility & { sector: string; badgeColor: string })[] = useMemo(() => [
    {
      id: 'preview-fac-auditorium',
      institutionId: 'public-he-inst',
      sector: 'Public Higher Education Institution',
      name: 'Campus Cultural Auditorium',
      type: 'University Auditorium',
      building: 'Arts & Culture Center',
      floor: 'Level 1 & Mezzanine',
      capacity: 450,
      equipment: ['Dual 4K Laser Projection', 'Stage PA Rig', 'Automated Stage Curtains', 'Central Air Conditioning'],
      operatingHours: { open: '08:00', close: '21:00', days: 'Monday – Saturday' },
      rules: [
        'Academic assemblies, student symposiums, and cultural events only',
        'No open flame or prohibited chemical substances permitted',
        'Technical staff supervision required for stage lighting and sound controls'
      ],
      bookingRequirements: ['Faculty Adviser Signature', 'Student Affairs Clearance', '48-Hour Advance Notice'],
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      description: 'Premier multi-tier cultural auditorium designed for institutional symposiums, collegiate assemblies, and academic ceremonies.',
      badgeColor: 'border-[#0077C8] text-[#0077C8] bg-blue-50',
      status: 'active',
    },
    {
      id: 'preview-fac-gym',
      institutionId: 'public-he-inst',
      sector: 'Public Higher Education Institution',
      name: 'University Sports Arena & Multi-Court',
      type: 'Gymnasium',
      building: 'Athletic & Recreation Pavilion',
      floor: 'Main Arena Level',
      capacity: 800,
      equipment: ['Hardwood Multi-Sport Court', 'Digital LED Scoreboard', 'Retractable Bleachers', 'Locker & Shower Rooms'],
      operatingHours: { open: '06:00', close: '22:00', days: 'Monday – Sunday' },
      rules: [
        'Non-marking athletic footwear strictly required',
        'Varsity schedule priority windows apply',
        'Sports equipment must be returned to athletics inventory'
      ],
      bookingRequirements: ['Athletics Director Endorsement', 'Security Office Clearance'],
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
      description: 'Championship-grade maple hardwood athletic arena equipped for university basketball, volleyball tournaments, and collegiate sports rallies.',
      badgeColor: 'border-[#EE2726] text-[#EE2726] bg-red-50',
      status: 'active',
    },
    {
      id: 'preview-fac-lab',
      institutionId: 'private-he-inst',
      sector: 'Private Higher Education University',
      name: 'High-Performance Computing Lab',
      type: 'Computer Laboratory',
      building: 'Technology Innovation Hall',
      floor: 'Level 3, West Wing',
      capacity: 35,
      equipment: ['35 Workstation Terminals', 'Gigabit Fiber Uplink', 'Interactive 85" Smart Display', 'Dedicated UPS Power'],
      operatingHours: { open: '07:30', close: '20:00', days: 'Monday – Saturday' },
      rules: [
        'Laboratory custodian sign-in required',
        'No external flash storage without antivirus scan',
        'Stations must be shut down post-session'
      ],
      bookingRequirements: ['Department Chair Approval', 'Lab Custodian Endorsement'],
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      description: 'Advanced computer laboratory configured for programming sessions, engineering modeling, research computations, and certifications.',
      badgeColor: 'border-[#8CC63F] text-emerald-800 bg-lime-50',
      status: 'active',
    },
  ], []);

  // Filter the sample preview facilities by category
  const filteredPreviewFacilities = useMemo(() => {
    return samplePreviewFacilities.filter((fac) => {
      if (selectedPreviewCategory === 'All') return true;
      if (selectedPreviewCategory === 'Auditoriums' && fac.type === 'University Auditorium') return true;
      if (selectedPreviewCategory === 'Gyms & Courts' && fac.type === 'Gymnasium') return true;
      if (selectedPreviewCategory === 'Laboratories' && fac.type === 'Computer Laboratory') return true;
      return true;
    });
  }, [samplePreviewFacilities, selectedPreviewCategory]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'How does SmartSpace prevent double bookings across university venues?',
      a: 'SmartSpace employs a real-time reservation conflict engine. The moment a timeslot is reserved or approved by a university facility administrator, that specific room and hour block is locked against conflicting submissions across all departments, student organizations, and academic colleges.',
    },
    {
      q: 'Can student organizations book facilities across partner universities?',
      a: 'Yes. SmartSpace supports cross-university facility reservations. Each participating institution defines its own booking clearance policy (e.g. host college dean endorsement or accredited student council clearance). Partner campus organizations can request spaces transparently.',
    },
    {
      q: 'How are physical campus gates and keys managed on event day?',
      a: 'Once an institutional administrator approves a reservation, SmartSpace generates a time-bounded, encrypted QR Gate Pass. Campus security and building custodians scan this pass with any mobile device to immediately confirm authorized venue occupancy.',
    },
    {
      q: 'What equipment and operating constraints can administrators set?',
      a: 'Institutional administrators can customize advance booking windows (e.g. 48h to 5 days), required endorsement attachments (such as adviser signatures or physical therapist coverage for gym events), maximum capacities, and operating schedules per space.',
    },
    {
      q: 'How can a university or college system onboard with SmartSpace?',
      a: 'Higher education institutions can onboard in under 48 hours. Simply request a demo or submit an institutional registration application. Our deployment team provisions your dedicated campus facility sandbox with custom approval hierarchies.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* ------------------------------------------------------------- */}
      {/* 0. BRAND TAGLINE ANNOUNCEMENT BAR                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0B1528] text-white text-xs py-2 px-4 border-b border-slate-800 flex items-center justify-between sm:justify-center gap-3 text-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-[#FDB813] text-[10px] sm:text-[11px]">
            SMARTSPACE SAAS
          </span>
        </div>
        <span className="hidden sm:inline text-slate-600">•</span>
        <span className="font-black tracking-wider text-white italic text-[11px] sm:text-xs">
          “BOOK IT, TRACK IT, USE IT.”
        </span>
        <span className="hidden md:inline text-slate-600">•</span>
        <span className="hidden md:inline text-slate-300 text-[11px]">
          Multi-University Facility Booking & Governance Platform
        </span>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. OFFICIAL BRAND NAVIGATION BAR                               */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Official SmartSpace Brand */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="cursor-pointer hover:opacity-95 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077C8] rounded-xl"
                aria-label="SmartSpace Home"
              >
                <SmartSpaceLogo size={38} showTagline={true} />
              </button>
            </div>

            {/* Center: Navigation Links per specification */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-700">
              <button
                type="button"
                onClick={() => scrollToSection('facilities-catalog')}
                className="hover:text-[#0077C8] transition-colors cursor-pointer py-1"
              >
                Explore Facilities
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#0077C8] transition-colors cursor-pointer py-1"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('universities')}
                className="hover:text-[#0077C8] transition-colors cursor-pointer py-1"
              >
                Universities
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="hover:text-[#0077C8] transition-colors cursor-pointer py-1"
              >
                About SmartSpace
              </button>
            </nav>

            {/* Right: Actions (Log In + Request Demo) */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/access')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => navigate('/request-demo')}
                className="px-5 py-2.5 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold shadow-md shadow-blue-900/15 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Request Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/access')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => scrollToSection('facilities-catalog')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700"
            >
              Explore Facilities
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('universities')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700"
            >
              Universities
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left py-2 text-sm font-bold text-slate-700"
            >
              About SmartSpace
            </button>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/access');
                }}
                className="w-full py-2.5 rounded-xl border border-slate-300 text-center font-bold text-xs text-slate-800"
              >
                Log In to SmartSpace Portal
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/request-demo');
                }}
                className="w-full py-2.5 rounded-xl bg-[#0077C8] text-center font-bold text-xs text-white"
              >
                Request Institutional Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. EDITORIAL HERO SECTION (Page-Inset Framing on Deep Navy)   */}
      {/* ------------------------------------------------------------- */}
      <div className="p-2 sm:p-4 max-w-[1920px] mx-auto">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0B1528] text-white pt-12 pb-16 sm:pt-20 sm:pb-24 shadow-2xl border border-slate-800">
          {/* Subtle Atmospheric Campus Court / Stadium Lighting Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
            {/* Headline & Value Proposition */}
            <div className="text-center max-w-4xl mx-auto space-y-6">
              {/* Official Tagline Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
                <span className="font-extrabold italic tracking-wider text-amber-400 text-[11px] sm:text-xs">
                  BOOK IT, TRACK IT, USE IT.
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300 font-medium text-[11px] sm:text-xs">
                  Unified Campus Resource Platform
                </span>
              </div>

              {/* Official Hero Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] font-sans">
                EVERY CAMPUS SPACE. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077C8] via-[#FDB813] to-[#8CC63F]">
                  ONE SMARTER WAY TO BOOK.
                </span>
              </h1>

              {/* Official Supporting Text */}
              <p className="text-sm sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-normal">
                Discover, reserve, and manage university facilities across participating campuses through one intelligent booking platform.
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => scrollToSection('facilities-catalog')}
                  className="px-7 py-3.5 rounded-2xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-900/40 transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
                >
                  <Search className="w-4 h-4" />
                  <span>Explore Facilities</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/request-demo')}
                  className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Request Demo</span>
                  <ArrowRight className="w-4 h-4 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExecutiveDeckOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Presentation className="w-4 h-4 text-amber-400" />
                  <span>Executive Deck</span>
                </button>
              </div>
            </div>

            {/* Dynamic Campus Facility Showcase Composition */}
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="bg-slate-900/95 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 backdrop-blur-md">
                {/* Control bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EE2726]" />
                    <span className="w-3 h-3 rounded-full bg-[#FDB813]" />
                    <span className="w-3 h-3 rounded-full bg-[#8CC63F]" />
                    <span className="ml-3 font-mono text-[11px] text-slate-400 hidden sm:inline">
                      smartspace.ph/facilities/{currentHeroVenue.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#8CC63F] flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] animate-pulse" />
                      Conflict Engine Active (0 Overlaps)
                    </span>
                  </div>
                </div>

                {/* Showcase Venue Display */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: Venue Image & Category */}
                  <div className="md:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800 group">
                    <img
                      src={currentHeroVenue.imageUrl}
                      alt={currentHeroVenue.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/90 text-white border border-slate-700 backdrop-blur-sm">
                        {currentHeroVenue.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                      <p className="text-xs text-amber-300 font-bold">{currentHeroVenue.institution}</p>
                      <h3 className="text-lg sm:text-xl font-black">{currentHeroVenue.name}</h3>
                    </div>
                  </div>

                  {/* Right: Live Data & Selector */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Live Capacity & Amenities
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-medium">Max Capacity</span>
                          <strong className="text-white text-sm">{currentHeroVenue.capacity} Attendees</strong>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-medium">Next Slot</span>
                          <strong className="text-[#8CC63F] text-xs font-mono">{currentHeroVenue.nextSlot}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                        Equipped With:
                      </span>
                      <p className="text-xs text-slate-300">{currentHeroVenue.equipment}</p>
                    </div>

                    {/* Venue Switcher buttons */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Switch Campus Venue Preview:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {heroVenues.map((v, idx) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setHeroVenueIndex(idx)}
                            className={`p-1.5 rounded-lg text-[10px] font-bold transition-all border text-center ${
                              heroVenueIndex === idx
                                ? 'bg-[#0077C8] border-blue-400 text-white shadow-xs'
                                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            #{idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/access')}
                      className="w-full py-2.5 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <span>Check 12-Hour Schedule for This Venue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. OFFICIAL BRAND PILLARS: BOOK SMARTER. MANAGE BETTER.       */}
      {/* ------------------------------------------------------------- */}
      <section id="about" className="py-20 bg-gradient-to-b from-white via-amber-50/20 to-white border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Heading matching Image 5 */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-[#0077C8] text-xs font-extrabold border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-[#0077C8] animate-pulse" />
              <span>Core Brand Principles</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black italic tracking-tight text-[#0077C8]">
              BOOK SMARTER. MANAGE BETTER.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
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
                  Submit requests conveniently across campus venues with real-time slot checking and instant digital endorsement uploads.
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
                  Keep track of reservation statuses, endorsement paperwork, and verified history in one place with zero lost paper slips.
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
                  Access facility details, capacities, equipment inventory, and interactive 12-hour schedules directly on your smartphone.
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
                  Support facility administrators with automated approvals, conflict locks, and comprehensive logs for transparent operations.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-[#0077C8]">
                <span>Admin Governance</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* Dual Brand Graphic Feature: Showing Authentic Graphic Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0B1528] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-[#8CC63F] text-xs font-bold border border-emerald-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SPACE FOR EVERY POSSIBILITY</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-sans">
                Meet SmartSpace.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A smarter way to discover, reserve, and manage shared university facilities. From student organizations booking varsity courts to university deans coordinating multi-campus symposiums.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/request-demo')}
                  className="px-5 py-2.5 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
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
      {/* 4. PREVIEW CAMPUS FACILITIES (Curated Sample Previews Only)   */}
      {/* ------------------------------------------------------------- */}
      <section id="facilities-catalog" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#0077C8] text-xs font-bold border border-blue-200">
                <Building2 className="w-3.5 h-3.5" />
                <span>Facility Directory Preview</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Preview Campus Facilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                Browse sample facility previews below. To maintain campus security and protect live availability schedules, full access to all 48+ campus venues and reservation booking requires logging into your campus account.
              </p>
            </div>

            {/* Preview notice badge */}
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-xs shrink-0">
              <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                <Lock className="w-3.5 h-3.5" />
                Sample Preview Mode
              </span>
              <span>·</span>
              <span className="text-[#0077C8] font-bold">Log in for 48+ Venues</span>
            </div>
          </div>

          {/* Category Filter Pills for Previews */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'All', label: 'All Sample Previews' },
              { id: 'Auditoriums', label: 'Auditoriums & Halls' },
              { id: 'Gyms & Courts', label: 'Sports & Gymnasiums' },
              { id: 'Laboratories', label: 'STEM Laboratories' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedPreviewCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPreviewCategory === cat.id
                    ? 'bg-[#0077C8] text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Curated Preview Cards Grid (Only 3 Curated Samples) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPreviewFacilities.map((facility) => {
              return (
                <div
                  key={facility.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Frame with Sample Preview Badge */}
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={facility.imageUrl}
                        alt={facility.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                          Sample Preview
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-900 shadow-xs backdrop-blur-xs">
                          {facility.type}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-900/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Login to Reserve</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077C8]">
                          {facility.sector}
                        </span>
                        <h3 className="text-base font-black text-slate-950 line-clamp-1 group-hover:text-[#0077C8] transition-colors">
                          {facility.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="line-clamp-1">{facility.building} · {facility.floor}</span>
                        </p>
                      </div>

                      {/* Capacity & Operating Hours */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Capacity</span>
                          <span className="font-bold text-slate-800">{facility.capacity} seats</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">Operating Hours</span>
                          <span className="font-bold text-slate-800 font-mono text-[11px]">
                            {facility.operatingHours.open} - {facility.operatingHours.close}
                          </span>
                        </div>
                      </div>

                      {/* Equipment tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {facility.equipment.slice(0, 2).map((eq, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                          >
                            {eq}
                          </span>
                        ))}
                        {facility.equipment.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-medium">
                            +{facility.equipment.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFacilityForModal(facility)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Quick Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/access')}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Reserve</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prominent Login-Required Access Gateway Callout Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#10203e] to-[#0B1528] text-white p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authenticated Campus Access Required</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Sign In to Access the Complete 48+ Campus Facility Catalog
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  To protect campus venues against unauthorized scraping, preserve student safety, and verify institutional credentials, all live 12-hour conflict calendars, full room directories, and digital booking request submissions require signing in.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => navigate('/access')}
                  className="px-6 py-3.5 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Lock className="w-4 h-4" />
                  <span>Log In to View All Facilities</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/user/register')}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-bold transition-all text-center cursor-pointer"
                >
                  <span>Create Campus Account</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Campus Network</span>
                <span className="font-bold text-white text-sm">48+ Active Venues</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Conflict Engine</span>
                <span className="font-bold text-[#8CC63F] text-sm">Live 12-Hour Sync</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Institutional Scope</span>
                <span className="font-bold text-amber-400 text-sm">Public & Private Campuses</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block text-[11px]">Security Clearance</span>
                <span className="font-bold text-[#0077C8] text-sm">Encrypted QR Gate Passes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. HOW IT WORKS: THE 3-STEP BOOKING LIFECYCLE                */}
      {/* ------------------------------------------------------------- */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0077C8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Frictionless Process
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            How SmartSpace Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            A three-step digital workflow that replaces paper reservation forms, prevents double bookings, and speeds up approvals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1: Book It */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-[#0077C8] shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0077C8] flex items-center justify-center font-black text-2xl border border-blue-200">
                01
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0077C8]">
                  Phase 1 · Submit
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Book It
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 font-medium">
                  Search across partner universities, check live 12-hour conflict schedules, and submit digital requests with adviser endorsement signatures.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                  <span>Real-time availability matrix</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                  <span>Multi-institution venue search</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                  <span>Required documentation uploads</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-[#0077C8]">
              Step 1 of 3 · Discovery & Request
            </div>
          </div>

          {/* Step 2: Track It */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-[#FDB813] shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-2xl border border-amber-200">
                02
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  Phase 2 · Review
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Track It
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 font-medium">
                  The automated conflict engine protects the timeslot. Track real-time administrative status as physical plant handlers review and approve.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FDB813] shrink-0" />
                  <span>Conflict engine auto-lock</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FDB813] shrink-0" />
                  <span>Live approval tracking badges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FDB813] shrink-0" />
                  <span>Automated notifications & updates</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-amber-700">
              Step 2 of 3 · Approval & Locking
            </div>
          </div>

          {/* Step 3: Use It */}
          <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 hover:border-[#8CC63F] shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-lime-50 text-[#8CC63F] flex items-center justify-center font-black text-2xl border border-lime-200">
                03
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8CC63F]">
                  Phase 3 · Access
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Use It
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 font-medium">
                  Receive an encrypted digital QR gate permit upon approval. Present the QR code to security officers and physical plant custodians for event entry.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8CC63F] shrink-0" />
                  <span>Encrypted digital gate pass</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8CC63F] shrink-0" />
                  <span>Campus guard mobile scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8CC63F] shrink-0" />
                  <span>Post-event facility turnover logs</span>
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 text-[11px] font-bold text-[#8CC63F]">
              Step 3 of 3 · Verification & Occupancy
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. PARTICIPATING HIGHER EDUCATION INSTITUTIONS (Sectors Only)  */}
      {/* ------------------------------------------------------------- */}
      <section id="universities" className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0077C8] bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Institutional Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Participating Higher Education Institutions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              SmartSpace is architected to serve both Public and Private higher education institutions with customized governance models, approval routing, and security clearances.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. PUBLIC HIGHER EDUCATION INSTITUTIONS */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-[#0077C8] border border-blue-200">
                    Public Higher Education Institutions
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    SUCs & LUCs
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950 group-hover:text-[#0077C8] transition-colors">
                    State Universities & Colleges
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Designed for chartered state universities, regional campuses, and local government colleges requiring multi-college inventory coordination, student council allocations, and transparent audit compliance.
                  </p>
                </div>

                {/* Key Capabilities */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                    Institutional Governance Features
                  </span>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">Multi-Campus Physical Plant Governance</strong>
                        <span className="text-[11px] text-slate-600">Centralized directory linking main and satellite campuses under unified physical plant directorate oversight.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-[#8CC63F] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">Student Council (SSG/SSC) Booking Clearances</strong>
                        <span className="text-[11px] text-slate-600">Automated faculty adviser endorsements and student affairs quotas for accredited campus organizations.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">Audit & Regulatory Transparency</strong>
                        <span className="text-[11px] text-slate-600">Immutable digital logs compliant with Commission on Audit (COA) rules and CHED institutional reporting standards.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">48-Hour Advance Rule Enforcements</strong>
                        <span className="text-[11px] text-slate-600">Automated buffer window ensuring public facility technicians, custodial staff, and security are scheduled.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/university/register')}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold transition-all text-center cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Onboard Your Public Institution</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/access')}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-center cursor-pointer"
                >
                  <span>Public SUC Sign In</span>
                </button>
              </div>
            </div>

            {/* 2. PRIVATE HIGHER EDUCATION INSTITUTIONS */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    Private Higher Education Institutions
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Private & Autonomous Universities
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950 group-hover:text-amber-600 transition-colors">
                    Private Universities & Colleges
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Built for private university systems, sectarian colleges, and autonomous academic institutions requiring granular role-based approvals, QR gate clearance, and operational expense analytics.
                  </p>
                </div>

                {/* Key Capabilities */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                    Institutional Governance Features
                  </span>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">Multi-Tier Dean & Custodian Hierarchy</strong>
                        <span className="text-[11px] text-slate-600">Flexible routing through laboratory custodians, department chairs, college deans, and vice presidents.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-[#8CC63F] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">12-Hour Real-Time Conflict Locking</strong>
                        <span className="text-[11px] text-slate-600">Continuous conflict engine locks venue slots instantly to eliminate duplicate bookings and room friction.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-[#0077C8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">QR Code Security Gate Verification</strong>
                        <span className="text-[11px] text-slate-600">Digital gate passes generated upon approval for campus security guards and visitor checkpoint verification.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-[#EE2726] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">Space Utilization & Financial Reporting</strong>
                        <span className="text-[11px] text-slate-600">Detailed analytics on peak occupancy hours, room efficiency, and maintenance budgeting for board of trustees.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDemoModalOpen(true)}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all text-center cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Request Institutional Proposal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/access')}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all text-center cursor-pointer"
                >
                  <span>Private University Sign In</span>
                </button>
              </div>
            </div>
          </div>

          {/* Institutional Ecosystem Summary Bar */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0077C8] shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-slate-900 text-sm block">Are you a university or college administrator?</strong>
                <p className="text-slate-500 text-[11px]">Deploy SmartSpace across your public or private higher education campus in under 24 hours.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/university/register')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs transition-colors"
              >
                Register Your Institution
              </button>
              <button
                type="button"
                onClick={() => navigate('/request-demo')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
              >
                Request Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. ACTUAL INTERFACE PREVIEW (Interactive Product Showcase)     */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0077C8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Real Software Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Designed for Campus Precision
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Inspect the exact interfaces university administrators and student leaders use every single day.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 max-w-full overflow-x-auto gap-1">
            <button
              type="button"
              onClick={() => setActiveShowcaseTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeShowcaseTab === 'directory'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Venue Directory Search
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab('calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeShowcaseTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. 12-Hour Availability Grid
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab('approval')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeShowcaseTab === 'approval'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Administrative Approvals
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcaseTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeShowcaseTab === 'reports'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4. Space Utilization Analytics
            </button>
          </div>
        </div>

        {/* Showcase Screen Frame */}
        <div className="bg-[#0B1528] rounded-3xl p-4 sm:p-8 text-white shadow-2xl border border-slate-800">
          {activeShowcaseTab === 'directory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="font-mono text-slate-400">smartspace.ph/user/dashboard/facilities</span>
                <span className="text-[#8CC63F] font-bold">12 Campus Venues Active</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-amber-400 font-bold uppercase">Auditorium</span>
                  <h4 className="font-bold text-sm text-white">Main Cultural Auditorium</h4>
                  <p className="text-xs text-slate-400">450 seats · Stage PA & Acoustic Rig</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Next Slot: 2:00 PM – 5:00 PM
                  </span>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-[#EE2726] font-bold uppercase">Gymnasium</span>
                  <h4 className="font-bold text-sm text-white">University Sports Arena</h4>
                  <p className="text-xs text-slate-400">800 seats · Hardwood Multi-Court</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Next Slot: 3:30 PM – 7:00 PM
                  </span>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-blue-400 font-bold uppercase">Computer Lab</span>
                  <h4 className="font-bold text-sm text-white">CS Laboratory 1</h4>
                  <p className="text-xs text-slate-400">30 Workstations · Gigabit Fiber</p>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    Next Slot: 1:00 PM – 4:00 PM
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="font-mono text-slate-400">smartspace.ph/schedule/conflict-engine</span>
                <span className="text-amber-400 font-bold">12-Hour Continuous Lock active</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-sm">Campus Cultural Auditorium — Schedule Timeline</h4>
                <div className="grid grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    <span className="block text-[10px] text-slate-400">8:00 AM</span>
                    <strong className="text-[11px]">AVAILABLE</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    <span className="block text-[10px] text-slate-400">10:00 AM</span>
                    <strong className="text-[11px]">AVAILABLE</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-300">
                    <span className="block text-[10px] text-slate-400">12:00 PM</span>
                    <strong className="text-[11px]">RESERVED</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    <span className="block text-[10px] text-slate-400">2:00 PM</span>
                    <strong className="text-[11px]">AVAILABLE</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                    <span className="block text-[10px] text-slate-400">4:00 PM</span>
                    <strong className="text-[11px]">AVAILABLE</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
                    <span className="block text-[10px] text-slate-500">6:00 PM</span>
                    <strong className="text-[11px]">MAINTENANCE</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'approval' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="font-mono text-slate-400">smartspace.ph/university/dashboard/requests</span>
                <span className="text-[#0077C8] font-bold">Physical Plant Approval Queue</span>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">General Assembly & Academic Symposium</h4>
                    <p className="text-xs text-slate-400">Requester: Supreme Student Government · 120 Expected</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    APPROVED
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Adviser Signature: <strong>Verified ✓</strong></span>
                  <span>Dean Clearance: <strong>Attached ✓</strong></span>
                  <span>QR Gate Pass: <strong>Generated ✓</strong></span>
                </div>
              </div>
            </div>
          )}

          {activeShowcaseTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                <span className="font-mono text-slate-400">smartspace.ph/university/dashboard/reports</span>
                <span className="text-[#8CC63F] font-bold">Live Campus Utilization Index</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Average Booking Lead Time</span>
                  <strong className="text-2xl font-black text-white">3.4 Days</strong>
                  <p className="text-[10px] text-emerald-400 font-semibold pt-1">Compliant with 48h policy</p>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Peak Utilization Window</span>
                  <strong className="text-2xl font-black text-white">1:00 PM – 4:00 PM</strong>
                  <p className="text-[10px] text-blue-400 font-semibold pt-1">Auditoriums & Labs highest demand</p>
                </div>
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                  <span className="text-slate-400 text-xs block">Paper Form Reduction</span>
                  <strong className="text-2xl font-black text-[#8CC63F]">100%</strong>
                  <p className="text-[10px] text-emerald-400 font-semibold pt-1">Zero manual logbook records</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. CAMPUS IMPACT STATS BAND (Deep Navy Section)               */}
      {/* ------------------------------------------------------------- */}
      <div className="p-2 sm:p-4 max-w-[1920px] mx-auto">
        <section className="rounded-[2rem] bg-[#0B1528] text-white py-16 sm:py-20 px-6 sm:px-12 border border-slate-800 shadow-2xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FDB813] bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-full">
              Measurable Campus Results
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-sans">
              A Platform Built For Reliability
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <strong className="text-4xl sm:text-6xl font-black text-[#8CC63F] block font-mono">
                100%
              </strong>
              <span className="text-xs sm:text-sm text-slate-300 font-bold block">
                Conflict-Free Rate
              </span>
              <p className="text-[11px] text-slate-400">
                Zero schedule double-bookings recorded across all participating venues.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <strong className="text-4xl sm:text-6xl font-black text-[#0077C8] block font-mono">
                48+
              </strong>
              <span className="text-xs sm:text-sm text-slate-300 font-bold block">
                Active Campus Spaces
              </span>
              <p className="text-[11px] text-slate-400">
                Lecture rooms, gymnasiums, sports courts, and STEM labs in the network.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <strong className="text-4xl sm:text-6xl font-black text-[#FDB813] block font-mono">
                &lt; 15m
              </strong>
              <span className="text-xs sm:text-sm text-slate-300 font-bold block">
                Average Approval Time
              </span>
              <p className="text-[11px] text-slate-400">
                Turnaround on digital endorsements vs days of physical paper routing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 text-center">
              <strong className="text-4xl sm:text-6xl font-black text-[#EE2726] block font-mono">
                12K+
              </strong>
              <span className="text-xs sm:text-sm text-slate-300 font-bold block">
                Users & Students Served
              </span>
              <p className="text-[11px] text-slate-400">
                Student councils, faculty, and administrative staff booking with confidence.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 9. TESTIMONIALS & CAMPUS REVIEWS                              */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0077C8] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Campus Endorsements
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Trusted by Campus Leaders & Student Organizations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-3xl font-serif text-[#0077C8]">“</span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Eliminated the nightmare of paper booking slips and lost request letters. We reserved the grand amphitheater for our annual student convention in under five minutes.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <strong className="text-xs font-black text-slate-900 block">J. Dela Cruz</strong>
              <span className="text-[11px] text-slate-500">Supreme Student Government President</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-3xl font-serif text-[#FDB813]">“</span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                Double bookings used to cause total chaos during midterms and college week. SmartSpace's real-time conflict lock completely ended schedule collisions on our campus.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <strong className="text-xs font-black text-slate-900 block">Engr. R. Santos</strong>
              <span className="text-[11px] text-slate-500">Physical Plant & Facilities Director</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-3xl font-serif text-[#8CC63F]">“</span>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                The mobile QR gate pass makes it effortless for campus security to verify approved room occupants. Transparent approval chains have restored order to our event spaces.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <strong className="text-xs font-black text-slate-900 block">Dr. M. Fernandez</strong>
              <span className="text-[11px] text-slate-500">College of Computer Studies & Engineering Dean</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 10. FREQUENTLY ASKED QUESTIONS (Accordion)                    */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0077C8] bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
              Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#0077C8] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 11. INSTITUTIONAL CALL-TO-ACTION SECTION                       */}
      {/* ------------------------------------------------------------- */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="bg-gradient-to-br from-[#0B1528] via-[#0F1E36] to-[#0B1528] rounded-[2rem] p-8 sm:p-14 text-white space-y-6 shadow-2xl border border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 text-blue-300 text-xs font-bold border border-blue-700/50">
            <Building2 className="w-3.5 h-3.5" />
            <span>Modernize Campus Facility Operations</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto">
            Ready to upgrade your university space management?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Schedule an institutional demonstration or explore our live multi-campus facility directory today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/request-demo')}
              className="px-7 py-3.5 rounded-2xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all cursor-pointer active:scale-98"
            >
              Request Institutional Proposal
            </button>
            <button
              type="button"
              onClick={() => navigate('/access')}
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-98"
            >
              Enter Access Gateway
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 12. OFFICIAL SMART SPACE B2B SAAS FOOTER                      */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-white border-t border-slate-200 py-14 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-sm">
              <SmartSpaceLogo size={36} showTagline={true} />
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Cloud-based multi-university facility booking and resource management SaaS platform. Book It, Track It, Use It.
              </p>
            </div>

            <div className="flex flex-wrap gap-10 text-xs">
              <div className="space-y-2.5">
                <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">
                  Portals
                </span>
                <button onClick={() => navigate('/access')} className="block hover:text-[#0077C8] transition-colors">
                  Access Gateway
                </button>
                <button onClick={() => navigate('/user/login')} className="block hover:text-[#0077C8] transition-colors">
                  End-User Portal
                </button>
                <button onClick={() => navigate('/university/login')} className="block hover:text-[#0077C8] transition-colors">
                  University Admin Portal
                </button>
                <button onClick={() => navigate('/superadmin/login')} className="block hover:text-[#0077C8] transition-colors">
                  Super Admin Portal
                </button>
              </div>

              <div className="space-y-2.5">
                <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">
                  Explore
                </span>
                <button onClick={() => scrollToSection('facilities-catalog')} className="block hover:text-[#0077C8] transition-colors">
                  Campus Facilities
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="block hover:text-[#0077C8] transition-colors">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('universities')} className="block hover:text-[#0077C8] transition-colors">
                  Universities
                </button>
                <button onClick={() => navigate('/request-demo')} className="block hover:text-[#0077C8] transition-colors">
                  Request Demo
                </button>
              </div>

              <div className="space-y-2.5">
                <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">
                  Platform Security
                </span>
                <span className="block text-slate-400">Institutional Sandboxing</span>
                <span className="block text-slate-400">Real-Time Conflict Engine</span>
                <span className="block text-slate-400">Encrypted QR Verification</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} SmartSpace. All rights reserved.</p>
            <p className="text-slate-400">
              SMARTSPACE · “BOOK IT, TRACK IT, USE IT.”
            </p>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* 13. MODALS (Facility Detail, Executive Deck, Demo Request)    */}
      {/* ------------------------------------------------------------- */}
      {selectedFacilityForModal && (
        <FacilityDetailModal
          facility={selectedFacilityForModal}
          onClose={() => setSelectedFacilityForModal(null)}
          onBookNow={() => {
            setSelectedFacilityForModal(null);
            navigate('/access');
          }}
        />
      )}

      <ExecutiveDeckModal
        isOpen={isExecutiveDeckOpen}
        onClose={() => setIsExecutiveDeckOpen(false)}
      />

      <DemoRequestModal />
    </div>
  );
};
