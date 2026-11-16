import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { FacilityDetailModal } from '../components/FacilityDetailModal';
import { ExecutiveDeckModal } from '../components/ExecutiveDeckModal';
import { DemoRequestModal } from '../components/DemoRequestModal';
import { SaaSPricingMatrix } from '../components/SaaSPricingMatrix';
import { Facility } from '../types';
import { BUSINESS_CONFIG } from '../config/business';
import { FACILITY_IMAGES } from '../data/facilityImages';
import { useConsent } from '../context/ConsentContext';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from 'motion/react';
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
  CheckCircle,
  HelpCircle,
  Laptop,
  GraduationCap,
  Award,
} from 'lucide-react';

export const PublicMarketingPortal: React.FC = () => {
  const { navigate } = useRouter();
  const { setIsDemoModalOpen } = useApp();
  const { openPreferences } = useConsent();
  const shouldReduceMotion = useReducedMotion();

  // Scroll-linked storytelling refs (Apple-inspired scope: landing scroll story only)
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroShowcaseScale = useTransform(
    heroScrollProgress,
    [0, 1],
    [1, shouldReduceMotion ? 1 : 0.96]
  );
  const heroShowcaseY = useTransform(
    heroScrollProgress,
    [0, 1],
    [0, shouldReduceMotion ? 0 : 28]
  );

  const { scrollYProgress: storyScrollProgress } = useScroll({
    target: storyRef,
    offset: ['start 0.85', 'end 0.3'],
  });
  const smoothStoryProgress = useSpring(storyScrollProgress, {
    stiffness: 90,
    damping: 26,
    restDelta: 0.001,
  });
  const storyVisualScale = useTransform(
    smoothStoryProgress,
    [0, 1],
    [shouldReduceMotion ? 1 : 0.96, 1.02]
  );
  const storyProgressWidth = useTransform(smoothStoryProgress, [0, 1], ['0%', '100%']);

  // Navigation & Drawer states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [legalMenuOpen, setLegalMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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

  // Interactive Live Conflict Engine Simulator (ClosePeak-style responsive micro-interaction)
  const [simulatorSlot, setSimulatorSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [isSimulatingConflictCheck, setIsSimulatingConflictCheck] = useState<boolean>(false);

  const handleSelectSlot = (slot: 'morning' | 'afternoon' | 'evening') => {
    setSimulatorSlot(slot);
    setIsSimulatingConflictCheck(true);
    setTimeout(() => {
      setIsSimulatingConflictCheck(false);
    }, 350);
  };

  // Scroll listener for translucent navbar transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero Venue Showcase items (illustrative sample spaces across Public and Private sectors)
  const heroVenues = [
    {
      id: 'preview-fac-auditorium',
      name: 'Sample Cultural Auditorium',
      category: 'Auditorium & Theatre',
      institution: 'Illustrative Public Higher Education Space',
      capacity: 450,
      equipment: 'Stage PA System · 4K Dual Stage Rig · Stage Spotlights · Central AC',
      status: 'Sample Schedule · Conflict Check Active',
      nextSlot: '2:00 PM – 5:00 PM (Sample)',
      imageUrl: FACILITY_IMAGES.auditorium,
      badgeColor: 'border-[#0077C8] text-[#0077C8] bg-blue-50',
    },
    {
      id: 'preview-fac-gym',
      name: 'Sample University Gymnasium',
      category: 'Campus Gymnasium',
      institution: 'Illustrative Public Higher Education Space',
      capacity: 800,
      equipment: 'Maple Hardwood Multi-Court · Digital LED Scoreboard · Retractable Bleachers',
      status: 'Sample Schedule · Slot Checking',
      nextSlot: '3:30 PM – 7:00 PM (Sample)',
      imageUrl: FACILITY_IMAGES.sportsArena,
      badgeColor: 'border-[#EE2726] text-[#EE2726] bg-red-50',
    },
    {
      id: 'preview-fac-courts',
      name: 'Sample Athletics Courts',
      category: 'Open Athletics Court',
      institution: 'Illustrative Private Higher Education Space',
      capacity: 60,
      equipment: 'Tournament Hardcourts · High-Lumen Night Floodlights · Umpire Chairs',
      status: 'Sample Schedule · Evening Slots',
      nextSlot: '4:00 PM – 6:30 PM (Sample)',
      imageUrl: FACILITY_IMAGES.tennisCourts,
      badgeColor: 'border-[#8CC63F] text-[#8CC63F] bg-lime-50',
    },
    {
      id: 'preview-fac-commlab-1',
      name: 'Sample Computer Laboratory',
      category: 'STEM Laboratory',
      institution: 'Illustrative Private Higher Education Space',
      capacity: 30,
      equipment: '30 Workstations · Interactive Laser Projector · Gigabit Fiber LAN',
      status: 'Sample Schedule · Lab Session',
      nextSlot: '1:00 PM – 4:00 PM (Sample)',
      imageUrl: FACILITY_IMAGES.computingLab,
      badgeColor: 'border-[#FDB813] text-amber-700 bg-amber-50',
    },
    {
      id: 'preview-fac-lecture-a',
      name: 'Sample Academic Lecture Hall',
      category: 'Lecture Hall',
      institution: 'Illustrative Public Higher Education Space',
      capacity: 40,
      equipment: 'Overhead HD Projector · Magnetic Whiteboard · Faculty HDMI Lectern',
      status: 'Sample Schedule · Seminar Block',
      nextSlot: '10:00 AM – 1:00 PM (Sample)',
      imageUrl: FACILITY_IMAGES.lectureHall,
      badgeColor: 'border-[#0077C8] text-[#0077C8] bg-blue-50',
    },
  ];

  const currentHeroVenue = heroVenues[heroVenueIndex];

  // Curated Sample Facility Previews (Representative preview venues with Elo One aesthetic metadata)
  const samplePreviewFacilities: (Facility & {
    sector: string;
    badgeColor: string;
    eloGradient: string;
    eloOutcome: string;
    eloStats: { num: string; label: string }[];
    monogramType: 'auditorium' | 'gym' | 'lab' | 'courts' | 'conference' | 'lecture';
  })[] = useMemo(() => [
    {
      id: 'preview-fac-auditorium',
      institutionId: 'public-he-inst',
      sector: 'Public Higher Education Institution',
      name: 'Sample Cultural Auditorium (Illustrative)',
      type: 'University Auditorium',
      building: 'Sample Arts & Culture Wing',
      floor: 'Level 1 & Mezzanine',
      capacity: 450,
      equipment: ['Dual 4K Laser Projection', 'Stage PA Rig', 'Automated Stage Curtains', 'Central Air Conditioning'],
      operatingHours: { open: '08:00', close: '21:00', days: 'Monday – Saturday' },
      rules: [
        'Academic assemblies, student symposiums, and cultural events only',
        'No open flame or prohibited chemical substances permitted',
        'Technical staff supervision required for stage lighting and sound controls',
      ],
      bookingRequirements: ['Faculty Adviser Signature', 'Student Affairs Clearance', 'Advance Notice Policy'],
      imageUrl: FACILITY_IMAGES.auditorium,
      description: 'Illustrative preview of a multi-tier auditorium profile configured for institutional symposiums, assemblies, and academic ceremonies.',
      badgeColor: 'border-[#0077C8] text-[#0077C8] bg-blue-50',
      status: 'active',
      eloGradient: 'radial-gradient(circle at top left, rgb(176, 64, 18), rgb(46, 13, 4))',
      eloOutcome: 'Designed to reduce double bookings across campus assemblies and symposiums',
      eloStats: [
        { num: '450', label: 'Illustrative Seats' },
        { num: 'Lock', label: 'Conflict Check Workflow' },
      ],
      monogramType: 'auditorium',
    },
    {
      id: 'preview-fac-gym',
      institutionId: 'public-he-inst',
      sector: 'Public Higher Education Institution',
      name: 'Sample University Sports Arena (Illustrative)',
      type: 'Gymnasium',
      building: 'Sample Athletic Pavilion',
      floor: 'Main Arena Level',
      capacity: 800,
      equipment: ['Hardwood Multi-Sport Court', 'Digital LED Scoreboard', 'Retractable Bleachers', 'Locker & Shower Rooms'],
      operatingHours: { open: '06:00', close: '22:00', days: 'Monday – Sunday' },
      rules: [
        'Non-marking athletic footwear strictly required',
        'Varsity schedule priority windows apply',
        'Sports equipment must be returned to athletics inventory',
      ],
      bookingRequirements: ['Athletics Director Endorsement', 'Security Office Clearance'],
      imageUrl: FACILITY_IMAGES.sportsArena,
      description: 'Illustrative preview of a university athletic arena profile equipped for tournaments, student assemblies, and intramural sports.',
      badgeColor: 'border-[#EE2726] text-[#EE2726] bg-red-50',
      status: 'active',
      eloGradient: 'linear-gradient(135deg, rgb(236, 96, 28), rgb(250, 150, 56))',
      eloOutcome: 'Designed to track varsity windows and multi-step clearance approvals',
      eloStats: [
        { num: '800', label: 'Illustrative Capacity' },
        { num: 'QR', label: 'Gate Pass Workflow' },
      ],
      monogramType: 'gym',
    },
    {
      id: 'preview-fac-lab',
      institutionId: 'private-he-inst',
      sector: 'Private Higher Education University',
      name: 'Sample Computing Lab (Illustrative)',
      type: 'Computer Laboratory',
      building: 'Sample Technology Hall',
      floor: 'Level 3, West Wing',
      capacity: 35,
      equipment: ['35 Workstation Terminals', 'Gigabit Fiber Uplink', 'Interactive 85" Smart Display', 'Dedicated UPS Power'],
      operatingHours: { open: '07:30', close: '20:00', days: 'Monday – Saturday' },
      rules: [
        'Laboratory custodian sign-in required',
        'No external flash storage without antivirus scan',
        'Stations must be shut down post-session',
      ],
      bookingRequirements: ['Department Chair Approval', 'Lab Custodian Endorsement'],
      imageUrl: FACILITY_IMAGES.computingLab,
      description: 'Illustrative preview of a computer laboratory profile for programming sessions, engineering modeling, and research work.',
      badgeColor: 'border-[#8CC63F] text-emerald-800 bg-lime-50',
      status: 'active',
      eloGradient: 'radial-gradient(circle at top left, rgb(132, 52, 22), rgb(24, 9, 5))',
      eloOutcome: 'Designed to replace manual lab sign-in sheets with digital slot requests',
      eloStats: [
        { num: '35', label: 'Illustrative Stations' },
        { num: 'Custodian', label: 'Approval Step' },
      ],
      monogramType: 'lab',
    },
    {
      id: 'preview-fac-courts',
      institutionId: 'private-he-inst',
      sector: 'Private Higher Education University',
      name: 'Sample Athletics Tennis Courts (Illustrative)',
      type: 'Open Court',
      building: 'Sample Outdoor Sports Quadrangle',
      floor: 'Ground Level Outdoor',
      capacity: 60,
      equipment: ['Dual Hardcourt Surfaces', 'High-Lumen Night Floodlights', 'Umpire High Chairs', 'Player Rest Pavilion'],
      operatingHours: { open: '06:00', close: '20:30', days: 'Monday – Sunday' },
      rules: [
        'Court tennis shoes strictly required',
        'Floodlights must be shut off immediately after evening bookings',
      ],
      bookingRequirements: ['Athletics Department Clearance', 'Advance Notice Policy'],
      imageUrl: FACILITY_IMAGES.tennisCourts,
      description: 'Illustrative preview of an outdoor athletics court profile for scheduled practice sessions and student tournaments.',
      badgeColor: 'border-[#FDB813] text-amber-800 bg-amber-50',
      status: 'active',
      eloGradient: 'radial-gradient(circle at top left, rgb(195, 115, 20), rgb(65, 30, 5))',
      eloOutcome: 'Scheduled court blocks with operating hour guardrails',
      eloStats: [
        { num: '60', label: 'Illustrative Capacity' },
        { num: '2', label: 'Sample Courts' },
      ],
      monogramType: 'courts',
    },
    {
      id: 'preview-fac-conference',
      institutionId: 'public-he-inst',
      sector: 'Public Higher Education Institution',
      name: 'Sample Conference Boardroom (Illustrative)',
      type: 'Conference Room',
      building: 'Sample Administration Hall',
      floor: 'Level 4, Executive Suite',
      capacity: 25,
      equipment: ['Teleconference Rig', 'Acoustic Soundproofing', 'Digital Whiteboard', 'Conference Microphones'],
      operatingHours: { open: '08:00', close: '18:00', days: 'Monday – Friday' },
      rules: [
        'Executive committee and university council priority reservations',
        'Audio/video gear calibrated by IT physical plant technicians',
      ],
      bookingRequirements: ['Office Head Endorsement'],
      imageUrl: FACILITY_IMAGES.boardroom,
      description: 'Illustrative preview of a conference boardroom profile tailored for faculty meetings, thesis defenses, and administrative briefings.',
      badgeColor: 'border-[#0077C8] text-[#0077C8] bg-blue-50',
      status: 'active',
      eloGradient: 'radial-gradient(circle at top left, rgb(160, 58, 20), rgb(38, 12, 6))',
      eloOutcome: 'Structured approval tracking for committee meetings and thesis panels',
      eloStats: [
        { num: '25', label: 'Illustrative Seats' },
        { num: 'Log', label: 'Approval Record' },
      ],
      monogramType: 'conference',
    },
    {
      id: 'preview-fac-lecture-a',
      institutionId: 'public-he-inst',
      sector: 'Public Higher Education Institution',
      name: 'Sample Interactive Lecture Hall (Illustrative)',
      type: 'Lecture Hall',
      building: 'Sample Academic Complex',
      floor: 'Level 2, North Wing',
      capacity: 60,
      equipment: ['Dual Projectors', 'Wireless Audio Rig', 'Tiered Desks', 'Faculty HDMI Pod'],
      operatingHours: { open: '07:30', close: '20:00', days: 'Monday – Saturday' },
      rules: [
        'Academic department lectures and student symposiums only',
        'Beverages strictly restricted to capped water bottles',
      ],
      bookingRequirements: ['Academic Department Chair Clearance', 'Advance Notice Policy'],
      imageUrl: FACILITY_IMAGES.lectureHall,
      description: 'Illustrative preview of a tiered lecture hall profile for college lectures, colloquia, and faculty seminars.',
      badgeColor: 'border-[#8CC63F] text-emerald-800 bg-lime-50',
      status: 'active',
      eloGradient: 'linear-gradient(135deg, rgb(185, 45, 25), rgb(85, 15, 10))',
      eloOutcome: 'Departmental clearance routing configured per room schedule',
      eloStats: [
        { num: '60', label: 'Illustrative Desks' },
        { num: 'Policy', label: 'Notice Rules' },
      ],
      monogramType: 'lecture',
    },
  ], []);

  // Filter sample preview facilities by category
  const filteredPreviewFacilities = useMemo(() => {
    return samplePreviewFacilities.filter((fac) => {
      if (selectedPreviewCategory === 'All') return true;
      if (selectedPreviewCategory === 'Auditoriums' && fac.type === 'University Auditorium') return true;
      if (selectedPreviewCategory === 'Gyms & Courts' && (fac.type === 'Gymnasium' || fac.type === 'Open Court')) return true;
      if (selectedPreviewCategory === 'Laboratories' && fac.type === 'Computer Laboratory') return true;
      if (selectedPreviewCategory === 'Lecture & Conference' && (fac.type === 'Lecture Hall' || fac.type === 'Conference Room')) return true;
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
      q: 'How does SmartSpace help prevent double bookings across university venues?',
      a: 'SmartSpace checks submitted date and time blocks against existing pending or approved reservations for the same facility, helping campus administrators spot and block overlapping schedule requests before approval.',
    },
    {
      q: 'Can student organizations request facilities across participating institutions?',
      a: 'Each subscribing institution defines its own booking clearance policy (such as host college dean endorsement or recognized student council clearance) and chooses whether spaces are open to internal or cross-campus requests.',
    },
    {
      q: 'How are physical campus gates and keys managed on event day?',
      a: 'Once an institutional administrator approves a reservation, SmartSpace generates a digital QR Gate Pass reference tied to that booking record so campus security and building custodians can inspect booking details at the venue.',
    },
    {
      q: 'What equipment and operating constraints can administrators set?',
      a: 'Institutional administrators can configure advance booking rules, required endorsement notes, maximum room capacities, equipment lists, and operating hours per facility.',
    },
    {
      q: 'How can a university or college onboard with SmartSpace?',
      a: 'Higher education institutions can request a guided pilot walkthrough or submit an institutional registration inquiry. Our team configures an evaluation workspace tailored to your approval workflow.',
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-[#0077C8] focus:text-white focus:font-bold focus:text-xs focus:shadow-xl"
        >
          Skip to main content
        </a>
        {/* ------------------------------------------------------------- */}
        {/* 0. BRAND TAGLINE ANNOUNCEMENT BAR                             */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#0B1528] text-white text-xs py-2 px-4 border-b border-slate-800 flex items-center justify-between sm:justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" aria-hidden="true" />
            <span className="font-extrabold uppercase tracking-wider text-[#FDB813] text-[10px] sm:text-[11px]">
              SMARTSPACE SAAS
            </span>
          </div>
          <span className="hidden sm:inline text-slate-400" aria-hidden="true">•</span>
          <span className="font-black tracking-wider text-white italic text-[11px] sm:text-xs">
            “BOOK IT, TRACK IT, USE IT.”
          </span>
          <span className="hidden md:inline text-slate-400" aria-hidden="true">•</span>
          <span className="hidden md:inline text-slate-300 text-[11px]">
            Multi-University Facility Booking &amp; Governance Platform
          </span>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. PREMIUM RESPONSIVE NAVIGATION BAR                           */}
        {/* ------------------------------------------------------------- */}
        <header
          className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/90 py-3'
              : 'bg-white/95 backdrop-blur-xs border-b border-slate-200 py-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Official SmartSpace Brand */}
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="cursor-pointer hover:opacity-95 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0077C8] rounded-xl transition-opacity"
                  aria-label="SmartSpace Home"
                >
                  <SmartSpaceLogo size={38} showTagline={true} />
                </button>
              </div>

              {/* Center: Desktop Navigation Links */}
              <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => scrollToSection('about')}
                  className="hover:text-[#0077C8] transition-colors cursor-pointer py-1 relative group"
                >
                  <span>Overview</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0077C8] transition-all duration-300 group-hover:w-full" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="hover:text-[#0077C8] transition-colors cursor-pointer py-1 relative group"
                >
                  <span>Features</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0077C8] transition-all duration-300 group-hover:w-full" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-[#0077C8] transition-colors cursor-pointer py-1 relative group"
                >
                  <span>How It Works</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0077C8] transition-all duration-300 group-hover:w-full" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('facilities-catalog')}
                  className="hover:text-[#0077C8] transition-colors cursor-pointer py-1 relative group"
                >
                  <span>Facilities</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0077C8] transition-all duration-300 group-hover:w-full" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('universities')}
                  className="hover:text-[#0077C8] transition-colors cursor-pointer py-1 relative group"
                >
                  <span>Universities</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0077C8] transition-all duration-300 group-hover:w-full" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection('pricing')}
                  className="hover:text-[#0077C8] transition-colors cursor-pointer py-1 relative group"
                >
                  <span>Pricing</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0077C8] transition-all duration-300 group-hover:w-full" />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    aria-expanded={legalMenuOpen}
                    aria-haspopup="true"
                    onClick={() => setLegalMenuOpen((prev) => !prev)}
                    className="hover:text-[#0077C8] transition-colors cursor-pointer py-1 flex items-center gap-1"
                  >
                    <span>Legal</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${legalMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {legalMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Legal and governance pages"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLegalMenuOpen(false);
                          navigate(BUSINESS_CONFIG.legalRoutes.privacy);
                        }}
                        className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0077C8] cursor-pointer"
                      >
                        Privacy Policy (RA 10173)
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLegalMenuOpen(false);
                          navigate(BUSINESS_CONFIG.legalRoutes.terms);
                        }}
                        className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0077C8] cursor-pointer"
                      >
                        Terms &amp; Conditions
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLegalMenuOpen(false);
                          navigate(BUSINESS_CONFIG.legalRoutes.cookies);
                        }}
                        className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0077C8] cursor-pointer"
                      >
                        Cookie &amp; Storage Policy
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLegalMenuOpen(false);
                          navigate(BUSINESS_CONFIG.legalRoutes.refunds);
                        }}
                        className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0077C8] cursor-pointer"
                      >
                        Refund &amp; Cancellation Policy
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setLegalMenuOpen(false);
                          navigate(BUSINESS_CONFIG.legalRoutes.accessibility);
                        }}
                        className="block w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0077C8] cursor-pointer"
                      >
                        Accessibility Statement
                      </button>
                    </div>
                  )}
                </div>
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
                  aria-expanded={mobileMenuOpen}
                  className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Toggle navigation"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Drawer with AnimatePresence */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="sm:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 overflow-hidden shadow-xl"
              >
                <button
                  onClick={() => scrollToSection('about')}
                  className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-[#0077C8]"
                >
                  Overview
                </button>
                <button
                  onClick={() => scrollToSection('features')}
                  className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-[#0077C8]"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-[#0077C8]"
                >
                  How It Works
                </button>
                <button
                  onClick={() => scrollToSection('facilities-catalog')}
                  className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-[#0077C8]"
                >
                  Facilities
                </button>
                <button
                  onClick={() => scrollToSection('universities')}
                  className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-[#0077C8]"
                >
                  Universities
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full text-left py-2 text-sm font-bold text-slate-700 hover:text-[#0077C8]"
                >
                  Pricing
                </button>
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Legal &amp; Governance
                  </span>
                  <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(BUSINESS_CONFIG.legalRoutes.privacy);
                      }}
                      className="text-left py-1.5 hover:text-[#0077C8]"
                    >
                      Privacy Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(BUSINESS_CONFIG.legalRoutes.terms);
                      }}
                      className="text-left py-1.5 hover:text-[#0077C8]"
                    >
                      Terms &amp; Conditions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(BUSINESS_CONFIG.legalRoutes.cookies);
                      }}
                      className="text-left py-1.5 hover:text-[#0077C8]"
                    >
                      Cookie Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(BUSINESS_CONFIG.legalRoutes.refunds);
                      }}
                      className="text-left py-1.5 hover:text-[#0077C8]"
                    >
                      Refund Policy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(BUSINESS_CONFIG.legalRoutes.accessibility);
                      }}
                      className="text-left py-1.5 hover:text-[#0077C8]"
                    >
                      Accessibility
                    </button>
                  </div>
                </div>
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
                    Request Demo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* ------------------------------------------------------------- */}
        {/* 2. CINEMATIC EDITORIAL HERO (Framed Deep Navy SaaS Hero)      */}
        {/* ------------------------------------------------------------- */}
        <div ref={heroRef} className="p-2 sm:p-4 max-w-[1920px] mx-auto">
          <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-[#0B1528] text-white pt-14 pb-16 sm:pt-20 sm:pb-24 shadow-2xl border border-slate-800">
            {/* Subtle Atmospheric Campus Lighting Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0077C8]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8CC63F]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
              {/* Headline & Value Proposition */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                className="text-center max-w-4xl mx-auto space-y-6"
              >
                {/* Official Tagline Indicator */}
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
                  <span className="font-extrabold italic tracking-wider text-[#FDB813] text-[11px] sm:text-xs">
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
                <p className="text-sm sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
                  Discover, reserve, and manage university facilities across participating campuses through one intelligent booking platform.
                </p>

                {/* Two Calls-to-Action Max: Request Demo (primary, blue) & Explore facilities (secondary) */}
                <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/request-demo')}
                    className="px-7 py-3.5 rounded-2xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-900/40 transition-all flex items-center gap-2.5 cursor-pointer active:scale-98"
                  >
                    <span>Request Demo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('facilities-catalog')}
                    className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Search className="w-4 h-4 text-[#0077C8]" />
                    <span>Explore facilities</span>
                    <ArrowDown className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </motion.div>

              {/* Dynamic Campus Facility Showcase Composition (Scroll-linked depth) */}
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ scale: heroShowcaseScale, y: heroShowcaseY }}
                className="max-w-5xl mx-auto space-y-4 will-change-transform"
              >
                <div className="bg-slate-900/95 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 backdrop-blur-md">
                  {/* Control bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#EE2726]" />
                      <span className="w-3 h-3 rounded-full bg-[#FDB813]" />
                      <span className="w-3 h-3 rounded-full bg-[#8CC63F]" />
                      <span className="ml-3 font-mono text-[11px] text-slate-400 hidden sm:inline">
                        {BUSINESS_CONFIG.canonicalHost}/facilities/{currentHeroVenue.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsExecutiveDeckOpen(true)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Presentation className="w-3.5 h-3.5 text-[#FDB813]" />
                        <span className="hidden sm:inline">Executive Deck</span>
                      </button>
                      <span className="text-[11px] font-bold text-[#8CC63F] flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] animate-pulse" />
                        Interactive Slot Conflict Demo
                      </span>
                    </div>
                  </div>

                  {/* Showcase Venue Display */}
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Left: Venue Image & Category */}
                    <div className="md:col-span-7 relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-950 border border-slate-800 group">
                      <img
                        src={currentHeroVenue.imageUrl}
                        alt={`${currentHeroVenue.name} — illustrative sample campus venue photograph`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/90 text-white border border-slate-700 backdrop-blur-sm">
                          {currentHeroVenue.category} · Illustrative Image
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white space-y-1">
                        <p className="text-xs text-[#FDB813] font-bold">{currentHeroVenue.institution}</p>
                        <h3 className="text-lg sm:text-xl font-black">{currentHeroVenue.name}</h3>
                      </div>
                    </div>

                    {/* Right: Live Data & Selector */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Live Capacity &amp; Amenities
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
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-400 uppercase tracking-wider">
                            Switch Campus Venue Preview:
                          </span>
                          <span className="text-slate-500 font-mono">
                            {heroVenueIndex + 1} of {heroVenues.length}
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {heroVenues.map((v, idx) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setHeroVenueIndex(idx)}
                              className={`p-1.5 rounded-lg text-[10px] font-bold transition-all border text-center cursor-pointer ${
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

                      {/* Interactive Real-Time Conflict Checker */}
                      <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2 shadow-inner">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3 h-3 text-[#FDB813]" />
                            <span>Simulate Slot Lock:</span>
                          </span>
                          <span className="text-[10px] font-bold text-[#8CC63F] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8CC63F] animate-pulse" />
                            Live Engine
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                          {[
                            { id: 'morning', label: '8 AM – 12 PM' },
                            { id: 'afternoon', label: '1 PM – 5 PM' },
                            { id: 'evening', label: '6 PM – 9 PM' },
                          ].map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => handleSelectSlot(slot.id as 'morning' | 'afternoon' | 'evening')}
                              className={`py-1.5 px-2 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                                simulatorSlot === slot.id
                                  ? 'bg-blue-600/20 border-blue-400/80 text-blue-200 shadow-[0_0_12px_rgba(0,119,200,0.25)]'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80">
                          {isSimulatingConflictCheck ? (
                            <span className="text-[#FDB813] flex items-center gap-1.5 animate-pulse">
                              <Clock className="w-3 h-3 animate-spin" />
                              Checking multi-campus schedule...
                            </span>
                          ) : (
                            <span className="text-[#8CC63F] flex items-center gap-1.5 font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-[#8CC63F]" />
                              0 Conflicts Detected · Verified Available
                            </span>
                          )}
                          <span className="font-mono text-[9px] text-slate-500">Sub-second lock</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/access')}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Check Full Schedule for This Venue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. SCROLL STORY: BOOK SMARTER. MANAGE BETTER. (Apple-inspired)*/}
        {/* ------------------------------------------------------------- */}
        <section
          id="about"
          ref={storyRef}
          className="py-24 lg:py-32 bg-white border-b border-slate-100 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {/* Large Confident Type Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-center max-w-4xl mx-auto space-y-5"
            >
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                Core Brand Story · “Book It, Track It, Use It.”
              </p>
              <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#0B1528] leading-[1.06]">
                BOOK SMARTER. <br />
                <span className="text-[#0077C8]">MANAGE BETTER.</span>
              </h2>
              <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
                Designed specifically around the four essential needs of modern university campus operations—from student reservation to physical plant governance.
              </p>

              {/* Scroll-linked storytelling progress rail */}
              <div className="max-w-xs mx-auto pt-2">
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    style={{ width: storyProgressWidth }}
                    className="h-full bg-gradient-to-r from-[#0077C8] via-[#FDB813] to-[#8CC63F] rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* 4 Scroll-Revealed Story Chapters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {[
                {
                  num: '01',
                  title: 'Simplified Reservations',
                  desc: 'Submit requests conveniently across campus venues with real-time slot checking and instant digital endorsement uploads.',
                  accent: 'border-t-4 border-t-[#0077C8]',
                },
                {
                  num: '02',
                  title: 'Organized Records',
                  desc: 'Keep track of reservation statuses, endorsement paperwork, and verified history in one place with zero lost paper slips.',
                  accent: 'border-t-4 border-t-[#FDB813]',
                },
                {
                  num: '03',
                  title: 'Facility Information',
                  desc: 'Access facility details, capacities, equipment inventory, and interactive 12-hour schedules directly on your smartphone.',
                  accent: 'border-t-4 border-t-[#8CC63F]',
                },
                {
                  num: '04',
                  title: 'Efficient Governance',
                  desc: 'Support facility administrators with automated approvals, conflict locks, and comprehensive logs for transparent operations.',
                  accent: 'border-t-4 border-t-[#0B1528]',
                },
              ].map((pillar, idx) => (
                <motion.div
                  key={pillar.num}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.85,
                    delay: idx * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`bg-slate-50/70 rounded-3xl p-7 border border-slate-200/80 ${pillar.accent} flex flex-col justify-between space-y-5`}
                >
                  <div className="space-y-3">
                    <span className="text-xs font-black font-mono text-[#0077C8] tracking-widest">
                      {pillar.num}
                    </span>
                    <h3 className="text-xl font-black text-[#0B1528] tracking-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Scroll-Linked Story Visual Frame: Meet SmartSpace */}
            <motion.div
              style={{ scale: storyVisualScale }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-[#0B1528] rounded-[2rem] p-8 sm:p-12 text-white shadow-2xl border border-slate-800 will-change-transform"
            >
              <div className="lg:col-span-5 space-y-5">
                <div className="flex items-center gap-4 pb-1">
                  <SmartSpaceLogo variant="mark-only" size={76} theme="dark" prominent={true} />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-[#8CC63F]">
                      Space For Every Possibility
                    </p>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-0.5">
                      Meet SmartSpace.
                    </h3>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  A smarter way to discover, reserve, and manage shared university facilities. From student organizations booking varsity courts to university deans coordinating multi-campus symposiums.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/request-demo')}
                    className="px-6 py-3 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Request Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('facilities-catalog')}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    Explore facilities
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 p-2 max-w-lg w-full">
                  <img
                    src="/assets/aistudio/4_eae3ba44.png"
                    alt="Meet SmartSpace - Space For Every Possibility"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. PILOT STAGE STATUS & FEEDBACK CALLOUT (#proof)             */}
        {/* ------------------------------------------------------------- */}
        <section id="proof" className="py-24 lg:py-32 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            {/* One clear headline + one short supporting sentence */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                {BUSINESS_CONFIG.stage}
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Built for Campus Facility Workflows
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {BUSINESS_CONFIG.stageNote} Built by students to help higher-education teams in Cebu City replace paper slips with structured digital booking workflows.
              </p>
            </div>

            {/* Unified Honest Stage & Architecture Strip */}
            <div className="space-y-8">
              <div className="rounded-3xl bg-[#0B1528] text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      stat: 'Conflict Check',
                      color: 'text-[#8CC63F]',
                      label: 'Slot Overlap Detection',
                      sub: 'Designed to reduce double bookings by checking requested hours against existing reservations.',
                    },
                    {
                      stat: 'Approvals',
                      color: 'text-[#0077C8]',
                      label: 'Structured Clearance Queue',
                      sub: 'Replaces manual paper routing with tracked review statuses and recorded decision notes.',
                    },
                    {
                      stat: 'QR Gate Pass',
                      color: 'text-[#FDB813]',
                      label: 'Digital Entry Reference',
                      sub: 'Generates a scannable digital booking pass after administrator approval.',
                    },
                    {
                      stat: 'Pilot Stage',
                      color: 'text-white',
                      label: 'Cebu City Focus',
                      sub: 'Currently in pilot prototype testing for colleges and universities in Cebu City.',
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <strong className={`text-2xl sm:text-3xl font-black ${item.color} block tracking-tight`}>
                        {item.stat}
                      </strong>
                      <span className="text-xs sm:text-sm text-white font-bold block">
                        {item.label}
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honest Pilot Invitation + Student-Built Transparency Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0077C8]">
                      Early Pilot Evaluation
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      Join the pilot and share campus feedback
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {BUSINESS_CONFIG.stageNote} We welcome university physical plant officers, student organizations, and faculty coordinators in Cebu City to test the platform and share workflow feedback.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/request-demo')}
                      className="px-6 py-3 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Join Pilot / Share Feedback</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-5">
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-600">
                      Transparency Notice
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      Pilot-stage prototype built by students
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      SmartSpace is an early-stage software prototype developed in Cebu City. It is not yet commercially deployed across external universities, and no academic institution endorses or sponsors this service.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    Service area: {BUSINESS_CONFIG.serviceArea}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 5. THREE KEY FEATURES (#features)                             */}
        {/* ------------------------------------------------------------- */}
        <section id="features" className="py-24 lg:py-32 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                Core Platform Capabilities
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Engineered for Campuses. <br />
                <span className="text-[#0077C8]">Built for Operating Precision.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Replace fragmented paper request slips with an automated, role-governed facility reservation ecosystem.
              </p>
            </div>

            {/* One Visual: 3 Key Feature Pillars + Capability Index Strip */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Search className="w-6 h-6 text-[#0077C8]" />,
                    iconBg: 'bg-blue-50 border-blue-200',
                    kicker: 'Discovery & Live Matrix',
                    title: 'Smart Discovery & 12-Hour Availability',
                    desc: 'Search venues across participating universities by capacity, building wing, equipment, and air conditioning with continuous 12-hour conflict grids.',
                    highlights: ['Cross-campus venue search', 'Live 12-hour slot matrix', 'Equipment & capacity tags'],
                  },
                  {
                    icon: <ShieldCheck className="w-6 h-6 text-[#EE2726]" />,
                    iconBg: 'bg-red-50 border-red-200',
                    kicker: 'Conflict Detection',
                    title: 'Automated Conflict Prevention',
                    desc: 'SmartSpace’s reservation workflow checks requested time blocks against existing bookings to help reduce scheduling collisions across campus departments.',
                    highlights: ['Time-block overlap checks', 'Maintenance buffer rules', 'Departmental policy guidelines'],
                  },
                  {
                    icon: <QrCode className="w-6 h-6 text-[#8CC63F]" />,
                    iconBg: 'bg-lime-50 border-lime-200',
                    kicker: 'Governance & Gate Pass',
                    title: 'Multi-Tier Approvals & QR Permits',
                    desc: 'Route requests from student officers to advisers and facility administrators—issuing digital QR entry passes and structured utilization reports.',
                    highlights: ['Digital endorsement records', 'Digital QR gate permits', 'Utilization export summaries'],
                  },
                ].map((feat) => (
                  <div
                    key={feat.title}
                    className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-[#0077C8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} border flex items-center justify-center`}>
                        {feat.icon}
                      </div>
                      <div className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#0077C8] block">
                          {feat.kicker}
                        </span>
                        <h3 className="text-xl font-black text-slate-950 tracking-tight leading-snug">
                          {feat.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {feat.desc}
                        </p>
                      </div>
                    </div>

                    <ul className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-700 font-medium">
                      {feat.highlights.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#8CC63F] shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Compact Secondary Capability Strip */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-[#0077C8]" />
                  Real-Time Availability
                </span>
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0077C8]" />
                  Facility Inventory Governance
                </span>
                <span className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#FDB813]" />
                  Endorsement Document Vault
                </span>
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8CC63F]" />
                  Multi-University Network
                </span>
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#0B1528]" />
                  Utilization Analytics
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 6. HOW IT WORKS: THE 5-STEP CONNECTED WORKFLOW (#how-it-works) */}
        {/* ------------------------------------------------------------- */}
        <section id="how-it-works" className="py-24 lg:py-32 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                Frictionless Process
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                How SmartSpace Works
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                A continuous digital workflow that replaces paper reservation forms, prevents double bookings, and speeds up administrative approvals.
              </p>
            </div>

            {/* 5-Step Connected Timeline Visual */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {[
                {
                  step: '01',
                  title: 'Discover a Facility',
                  desc: 'Search multi-campus venues and filter by capacity, equipment, and room specs.',
                  badge: 'Step 1: Explore',
                  color: 'text-[#0077C8] bg-blue-50 border-blue-200',
                },
                {
                  step: '02',
                  title: 'Check Live Availability',
                  desc: 'Verify 12-hour real-time availability slots with automated conflict detection.',
                  badge: 'Step 2: Verify',
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                },
                {
                  step: '03',
                  title: 'Submit Reservation',
                  desc: 'Fill out event details, participant count, and attach adviser endorsement documents.',
                  badge: 'Step 3: Submit',
                  color: 'text-[#EE2726] bg-red-50 border-red-200',
                },
                {
                  step: '04',
                  title: 'Administrator Review',
                  desc: 'Assigned university plant handlers evaluate requests and enforce campus policies.',
                  badge: 'Step 4: Review',
                  color: 'text-[#0B1528] bg-slate-100 border-slate-300',
                },
                {
                  step: '05',
                  title: 'Receive QR Permit',
                  desc: 'Receive digital confirmation and a scannable QR gate pass for campus security verification.',
                  badge: 'Step 5: Access',
                  color: 'text-emerald-700 bg-lime-50 border-lime-200',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-[#0077C8] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center font-black text-xl border`}>
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {item.badge}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-[#0077C8] transition-colors leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed pt-1 font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8CC63F]" />
                    <span>Verified Step</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 7. FACILITIES CATALOG (#facilities-catalog)                   */}
        {/* ------------------------------------------------------------- */}
        <section id="facilities-catalog" className="py-24 lg:py-32 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                Facility Directory Preview
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Preview Campus Facilities
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Browse illustrative sample facility previews below. Live campus venue catalogs and 12-hour reservation calendars are available after signing into your campus account.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: 'All', label: 'All Sample Previews' },
                { id: 'Auditoriums', label: 'Auditoriums & Event Halls' },
                { id: 'Gyms & Courts', label: 'Sports & Gymnasiums' },
                { id: 'Laboratories', label: 'STEM Laboratories' },
                { id: 'Lecture & Conference', label: 'Lecture & Conference Halls' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedPreviewCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedPreviewCategory === cat.id
                      ? 'bg-[#0077C8] text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Curated Preview Cards Grid (SmartSpace Identity) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPreviewFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* 4:3 Image Frame */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <img
                        src={facility.imageUrl}
                        alt={`${facility.name} — illustrative sample campus venue`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FDB813] text-[#0B1528] shadow-xs">
                          Illustrative Image · Sample
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-slate-900 shadow-xs">
                          {facility.type}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#0B1528]/90 text-white flex items-center gap-1 shadow-xs">
                          <Lock className="w-3 h-3 text-[#FDB813]" aria-hidden="true" />
                          <span>Login to Reserve</span>
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#005A9C]">
                          {facility.sector}
                        </span>
                        <h3 className="text-lg font-black text-slate-950 line-clamp-1 group-hover:text-[#0077C8] transition-colors">
                          {facility.name}
                        </h3>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                          <span className="line-clamp-1">{facility.building} · {facility.floor}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-600 block font-medium">Capacity</span>
                          <span className="font-bold text-slate-800">{facility.capacity} seats</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-600 block font-medium">Operating Hours</span>
                          <span className="font-bold text-slate-800 font-mono text-[11px]">
                            {facility.operatingHours.open} – {facility.operatingHours.close}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {facility.equipment.slice(0, 3).join(' · ')}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-6 pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFacilityForModal(facility)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Quick Specs
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/access')}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Authenticated Access Gateway Callout */}
            <div className="relative overflow-hidden rounded-3xl bg-[#0B1528] text-white p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#FDB813] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authenticated Campus Access Required</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Sign In to Access Your Institutional Facility Catalog
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    To protect campus venues and verify institutional credentials, live 12-hour conflict calendars and digital booking requests require signing in.
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
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 8. PARTICIPATING HIGHER EDUCATION INSTITUTIONS (#universities) */}
        {/* ------------------------------------------------------------- */}
        <section id="universities" className="py-24 lg:py-32 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                Institutional Framework
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Built for Public &amp; Private Higher Education
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                SmartSpace is designed to support both Public and Private higher education institutions with configurable governance models, approval routing, and digital gate passes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 1. PUBLIC HIGHER EDUCATION INSTITUTIONS */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black uppercase tracking-wider text-[#0077C8]">
                      Public Higher Education · SUCs &amp; LUCs
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-950">
                      State Universities &amp; Colleges
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      Designed for chartered state universities, regional campuses, and local government colleges seeking structured facility inventory coordination and digital approval logs.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      {
                        title: 'Multi-Campus Physical Plant Governance',
                        desc: 'Centralized directory linking main and satellite campuses under unified physical plant oversight.',
                        iconColor: 'text-[#0077C8]',
                      },
                      {
                        title: 'Student Council Booking Workflows',
                        desc: 'Digital faculty adviser endorsements and student affairs clearance steps for campus organizations.',
                        iconColor: 'text-[#8CC63F]',
                      },
                      {
                        title: 'Audit Trail & Record Keeping',
                        desc: 'Structured digital reservation logs designed to support institutional audit trails and internal reporting.',
                        iconColor: 'text-[#FDB813]',
                      },
                      {
                        title: 'Advance Notice Policy Rules',
                        desc: 'Configurable advance booking windows so facility technicians, custodial staff, and security can prepare venues.',
                        iconColor: 'text-[#0077C8]',
                      },
                    ].map((cap) => (
                      <div key={cap.title} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className={`w-4 h-4 ${cap.iconColor} shrink-0 mt-0.5`} />
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{cap.title}</strong>
                          <span className="text-[11px] text-slate-600">{cap.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => navigate('/university/register')}
                    className="font-bold text-[#0077C8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Onboard Your Public Institution</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/access')}
                    className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Public SUC Sign In →
                  </button>
                </div>
              </div>

              {/* 2. PRIVATE HIGHER EDUCATION INSTITUTIONS */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black uppercase tracking-wider text-amber-700">
                      Private Higher Education · Autonomous Universities
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-950">
                      Private Universities &amp; Colleges
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      Built for private university systems, sectarian colleges, and autonomous academic institutions requiring granular role-based approvals, QR gate clearance, and operational analytics.
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {[
                      {
                        title: 'Multi-Tier Dean & Custodian Hierarchy',
                        desc: 'Flexible routing through laboratory custodians, department chairs, college deans, and vice presidents.',
                        iconColor: 'text-[#FDB813]',
                      },
                      {
                        title: '12-Hour Real-Time Conflict Locking',
                        desc: 'Continuous conflict engine locks venue slots instantly to eliminate duplicate bookings and room friction.',
                        iconColor: 'text-[#8CC63F]',
                      },
                      {
                        title: 'QR Code Security Gate Verification',
                        desc: 'Digital gate passes generated upon approval for campus security guards and visitor checkpoint verification.',
                        iconColor: 'text-[#0077C8]',
                      },
                      {
                        title: 'Space Utilization & Financial Reporting',
                        desc: 'Detailed analytics on peak occupancy hours, room efficiency, and maintenance budgeting for trustees.',
                        iconColor: 'text-[#0B1528]',
                      },
                    ].map((cap) => (
                      <div key={cap.title} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className={`w-4 h-4 ${cap.iconColor} shrink-0 mt-0.5`} />
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{cap.title}</strong>
                          <span className="text-[11px] text-slate-600">{cap.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => navigate('/request-demo')}
                    className="font-bold text-[#0077C8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request Demo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/access')}
                    className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Private University Sign In →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 9. SECURITY & LIVE INTERFACE PREVIEW (#trust-security)        */}
        {/* ------------------------------------------------------------- */}
        <section id="trust-security" className="py-24 lg:py-32 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                Security &amp; Live Experience
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Designed for Campus Operating Precision
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Inspect the institutional sandboxing, conflict locks, and daily software workflows used by university administrators and student leaders.
              </p>
            </div>

            {/* Tab Selector + Showcase Frame as One Unified Visual */}
            <div className="space-y-6">
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
                      <span className="font-mono text-slate-400">/user/dashboard/facilities</span>
                      <span className="text-[#8CC63F] font-bold">Illustrative Workspace Preview</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[10px] text-[#FDB813] font-bold uppercase">Auditorium (Sample)</span>
                        <h3 className="font-bold text-sm text-white">Sample Cultural Auditorium</h3>
                        <p className="text-xs text-slate-400">450 seats · Stage PA &amp; Acoustic Rig</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-[#8CC63F]">
                          Next Slot: 2:00 PM – 5:00 PM
                        </span>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[10px] text-[#FDB813] font-bold uppercase">Gymnasium (Sample)</span>
                        <h3 className="font-bold text-sm text-white">Sample Sports Arena</h3>
                        <p className="text-xs text-slate-400">800 seats · Hardwood Multi-Court</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-[#8CC63F]">
                          Sample Slot: 3:30 PM – 7:00 PM
                        </span>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                        <span className="text-[10px] text-[#0077C8] font-bold uppercase">Computer Lab (Sample)</span>
                        <h3 className="font-bold text-sm text-white">Sample Computer Laboratory</h3>
                        <p className="text-xs text-slate-400">30 Workstations · Gigabit Fiber</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-[#8CC63F]">
                          Sample Slot: 1:00 PM – 4:00 PM
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeShowcaseTab === 'calendar' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                      <span className="font-mono text-slate-400">/schedule/conflict-engine</span>
                      <span className="text-[#FDB813] font-bold">12-Hour Continuous Lock Active</span>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                      <h3 className="font-bold text-sm">Campus Cultural Auditorium — Schedule Timeline</h3>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-[#8CC63F]">
                          <span className="block text-[10px] text-slate-400">8:00 AM</span>
                          <strong className="text-[11px]">AVAILABLE</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-[#8CC63F]">
                          <span className="block text-[10px] text-slate-400">10:00 AM</span>
                          <strong className="text-[11px]">AVAILABLE</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-[#EE2726]">
                          <span className="block text-[10px] text-slate-400">12:00 PM</span>
                          <strong className="text-[11px]">CONFLICT / LOCKED</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-[#8CC63F]">
                          <span className="block text-[10px] text-slate-400">2:00 PM</span>
                          <strong className="text-[11px]">AVAILABLE</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-800 text-[#8CC63F]">
                          <span className="block text-[10px] text-slate-400">4:00 PM</span>
                          <strong className="text-[11px]">AVAILABLE</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
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
                      <span className="font-mono text-slate-400">/university/dashboard/requests</span>
                      <span className="text-[#0077C8] font-bold">Physical Plant Approval Queue</span>
                    </div>
                    <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-sm text-white">General Assembly &amp; Academic Symposium</h3>
                          <p className="text-xs text-slate-400">Requester: Supreme Student Government · 120 Expected</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-[#8CC63F] border border-emerald-500/40 shrink-0">
                          APPROVED
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                        <span>Adviser Signature: <strong className="text-white">Verified ✓</strong></span>
                        <span>Dean Clearance: <strong className="text-white">Attached ✓</strong></span>
                        <span>QR Gate Pass: <strong className="text-[#8CC63F]">Generated ✓</strong></span>
                      </div>
                    </div>
                  </div>
                )}

                {activeShowcaseTab === 'reports' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                      <span className="font-mono text-slate-400">/university/dashboard/reports</span>
                      <span className="text-[#8CC63F] font-bold">Sample Utilization View (Illustrative)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 text-xs block">Sample Lead Time Metric</span>
                        <strong className="text-2xl font-black text-white">Sample View</strong>
                        <p className="text-[10px] text-[#8CC63F] font-semibold pt-1">Tracks submission vs event date</p>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 text-xs block">Peak Utilization Window</span>
                        <strong className="text-2xl font-black text-white">1:00 PM – 4:00 PM</strong>
                        <p className="text-[10px] text-[#0077C8] font-semibold pt-1">Illustrative demand breakdown</p>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 text-xs block">Workflow Goal</span>
                        <strong className="text-2xl font-black text-[#8CC63F]">Digital Records</strong>
                        <p className="text-[10px] text-[#8CC63F] font-semibold pt-1">Designed to replace manual logbooks</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 10. PRICING MATRIX (#pricing)                                 */}
        {/* ------------------------------------------------------------- */}
        <section id="pricing" className="py-24 lg:py-32 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SaaSPricingMatrix showFaq={false} />
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 11. FREQUENTLY ASKED QUESTIONS (#faq)                         */}
        {/* ------------------------------------------------------------- */}
        <section id="faq" className="py-24 lg:py-32 bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#0077C8]">
                Common Questions
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Everything university boards, physical plant managers, and student organizations need to know about SmartSpace.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isExpanded = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setOpenFaq(isExpanded ? null : idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/70 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-bold text-slate-900">{faq.q}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#0077C8] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/70 pt-4 font-normal bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 12. FINAL CALL-TO-ACTION SECTION                              */}
        {/* ------------------------------------------------------------- */}
        <section className="py-24 lg:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#0B1528] rounded-[2rem] p-10 sm:p-16 text-white space-y-6 shadow-2xl border border-slate-800">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#FDB813]">
              Modernize Campus Facility Operations
            </p>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
              Ready to upgrade your university space management?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
              Schedule an institutional demonstration or explore our live multi-campus facility directory today.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <button
                type="button"
                onClick={() => navigate('/request-demo')}
                className="px-7 py-3.5 rounded-2xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Request Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('facilities-catalog')}
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-98"
              >
                Explore facilities
              </button>
            </div>
          </div>
        </section>

        </main>

        {/* ------------------------------------------------------------- */}
        {/* 13. OFFICIAL SMART SPACE B2B SAAS FOOTER                      */}
        {/* ------------------------------------------------------------- */}
        <footer className="bg-white border-t border-slate-200 py-14 text-xs text-slate-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-3 max-w-sm">
                <SmartSpaceLogo size={36} showTagline={true} />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Cloud-based multi-university facility booking and resource management SaaS platform. Book It, Track It, Use It.
                </p>
              </div>

              <div className="flex flex-wrap gap-10 text-xs">
                <div className="space-y-2.5">
                  <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">
                    Portals
                  </span>
                  <button type="button" onClick={() => navigate('/access')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    Access Gateway
                  </button>
                  <button type="button" onClick={() => navigate('/user/login')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    End-User Portal
                  </button>
                  <button type="button" onClick={() => navigate('/university/login')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    University Admin Portal
                  </button>
                  <button type="button" onClick={() => navigate('/superadmin/login')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    Super Admin Portal
                  </button>
                </div>

                <div className="space-y-2.5">
                  <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">
                    Explore
                  </span>
                  <button type="button" onClick={() => scrollToSection('facilities-catalog')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    Campus Facilities
                  </button>
                  <button type="button" onClick={() => scrollToSection('features')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    Platform Features
                  </button>
                  <button type="button" onClick={() => scrollToSection('how-it-works')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    How It Works
                  </button>
                  <button type="button" onClick={() => scrollToSection('universities')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    Universities
                  </button>
                  <button type="button" onClick={() => scrollToSection('pricing')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    Pricing Matrix
                  </button>
                  <button type="button" onClick={() => navigate('/request-demo')} className="block hover:text-[#0077C8] transition-colors cursor-pointer">
                    Request Demo
                  </button>
                </div>

                <div className="space-y-2.5">
                  <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">
                    Legal &amp; Trust
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.privacy)}
                    className="block hover:text-[#0077C8] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.terms)}
                    className="block hover:text-[#0077C8] transition-colors cursor-pointer"
                  >
                    Terms &amp; Conditions
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.cookies)}
                    className="block hover:text-[#0077C8] transition-colors cursor-pointer"
                  >
                    Cookie &amp; Storage Policy
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.refunds)}
                    className="block hover:text-[#0077C8] transition-colors cursor-pointer"
                  >
                    Refund &amp; Cancellation
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(BUSINESS_CONFIG.legalRoutes.accessibility)}
                    className="block hover:text-[#0077C8] transition-colors cursor-pointer"
                  >
                    Accessibility Statement
                  </button>
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="block hover:text-[#0077C8] transition-colors cursor-pointer font-semibold text-slate-700"
                  >
                    Cookie settings
                  </button>
                </div>

                {/* Business Identity & Support Contact (Single Source of Truth) */}
                <div id="contact" className="space-y-2.5">
                  <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block">
                    Contact &amp; Identity
                  </span>
                  <a
                    href={BUSINESS_CONFIG.supportMailto}
                    className="block text-[#0077C8] font-bold underline hover:text-[#005a99]"
                  >
                    {BUSINESS_CONFIG.supportEmailLabel}
                  </a>
                  <span className="block text-slate-600 text-[11px] font-mono">
                    {BUSINESS_CONFIG.supportEmail}
                  </span>
                  <span className="block text-slate-600 font-medium text-[11px] max-w-[240px]">
                    Phone: {BUSINESS_CONFIG.supportPhone}
                  </span>
                  <span className="block text-slate-600 text-[11px] leading-tight max-w-[240px]">
                    {BUSINESS_CONFIG.registeredAddress}
                  </span>
                  <span className="block text-slate-600 text-[11px] leading-tight max-w-[240px]">
                    {BUSINESS_CONFIG.businessRegistrationNo}
                  </span>
                  <a
                    href={BUSINESS_CONFIG.socialProfiles.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={BUSINESS_CONFIG.socialProfiles.facebookAriaLabel}
                    className="block text-[#0077C8] font-bold underline hover:text-[#005a99] pt-0.5"
                  >
                    {BUSINESS_CONFIG.socialProfiles.facebookLabel}
                  </a>
                  <span className="block text-slate-600 text-[11px]">
                    {BUSINESS_CONFIG.serviceArea}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" aria-hidden="true" />
                    {BUSINESS_CONFIG.stage}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
              <p>© {new Date().getFullYear()} {BUSINESS_CONFIG.legalEntityName}. All rights reserved.</p>
              <p className="text-slate-600 font-semibold">
                {BUSINESS_CONFIG.brandName.toUpperCase()} · “{BUSINESS_CONFIG.tagline.toUpperCase()}”
              </p>
            </div>
          </div>
        </footer>

        {/* ------------------------------------------------------------- */}
        {/* 14. MODALS (Facility Detail, Executive Deck, Demo Request)    */}
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
    </MotionConfig>
  );
};
