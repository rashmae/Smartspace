import React from 'react';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from './SmartSpaceLogo';
import { 
  Building2, 
  CalendarCheck2, 
  Clock, 
  ClipboardCheck, 
  BarChart3, 
  FileSpreadsheet, 
  User, 
  Shield, 
  ShieldCheck,
  PlusCircle,
  ChevronDown,
  LogOut,
  Home,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onOpenDeck?: () => void;
  onOpenEmails?: () => void;
  onOpenOgPreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDeck,
  onOpenEmails,
  onOpenOgPreview,
}) => {
  const {
    currentInstitution,
    allInstitutions,
    setInstitutionId,
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    institutionBookings,
    currentUser,
    logout,
    openAuthPortal,
    setIsDemoModalOpen,
  } = useApp();

  const pendingCount = institutionBookings.filter((b) => b.status === 'pending').length;

  const scrollToSection = (id: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-all">
      {/* Top Bar: Brand, Workspace Switcher, and 3-Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Logo & Institutional Workspace (or Landing Nav) */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setActiveView('landing')}
              className="text-left cursor-pointer transition-opacity hover:opacity-95 shrink-0"
              title="Return to SmartSpace Portal"
            >
              <SmartSpaceLogo size={36} showTagline={true} />
            </button>

            {/* If NOT landing and NOT auth, show the active campus workspace */}
            {activeView !== 'landing' && activeView !== 'auth' && (
              currentRole !== 'super_admin' ? (
                <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Campus Workspace
                    </span>
                    <div className="relative group">
                      <select
                        value={currentInstitution.id}
                        onChange={(e) => setInstitutionId(e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-transparent pr-5 py-0.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                      >
                        {allInstitutions.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.shortName} · {inst.type}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                      Platform Management
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Multi-University Network ({allInstitutions.length} Campuses)
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Center: LANDING PAGE NAVIGATION LINKS (When on Landing Page) */}
          {activeView === 'landing' ? (
            <div className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => scrollToSection('platform')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                Platform
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('solutions')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                Solutions
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('spatial-explorer')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>3D Explorer</span>
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('pricing')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                Pricing
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-purple-700 transition-colors cursor-pointer py-1"
              >
                How It Works
              </button>
              {onOpenDeck && (
                <button
                  type="button"
                  onClick={onOpenDeck}
                  className="hover:text-purple-700 transition-colors cursor-pointer py-1 text-purple-700 font-bold"
                >
                  Pitch Deck
                </button>
              )}
            </div>
          ) : null}

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {activeView === 'landing' ? (
              <div className="flex items-center gap-2">
                {/* Landing Log In Action */}
                <button
                  type="button"
                  onClick={() => openAuthPortal('selection', 'login', 'login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  Log In
                </button>

                {/* Landing Request a Demo Action */}
                <button
                  type="button"
                  onClick={() => openAuthPortal('selection', 'login', 'demo')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer active:scale-98"
                >
                  Request a Demo
                </button>

                {/* Direct Demo Access Shortcut Toggle */}
                <div className="hidden xl:flex items-center pl-2 border-l border-slate-200">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => {
                        setCurrentRole('student');
                        setActiveView('facilities');
                      }}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      title="Quick Launch Student Portal"
                    >
                      User
                    </button>
                    <button
                      onClick={() => {
                        setCurrentRole('university_admin');
                        setActiveView('admin-requests');
                      }}
                      className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      title="Quick Launch Facility Admin Portal"
                    >
                      Admin
                    </button>
                    <button
                      onClick={() => {
                        setCurrentRole('super_admin');
                        setActiveView('super-admin');
                      }}
                      className="px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
                      title="Quick Launch Super Admin Portal"
                    >
                      Super
                    </button>
                  </div>
                </div>
              </div>
            ) : activeView === 'auth' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveView('landing')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  SmartSpace Home
                </button>
                <button
                  onClick={() => setIsDemoModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Request a Demo
                </button>
              </div>
            ) : (
              /* WORKSPACE 3-ROLE DEMO SWITCHER */
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
                  {/* Role 1: Student / Faculty */}
                  <button
                    onClick={() => {
                      setCurrentRole('student');
                      if (activeView === 'super-admin' || activeView === 'admin-requests' || activeView === 'admin-facilities' || activeView === 'admin-records' || activeView === 'reports') {
                        setActiveView('facilities');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      currentRole === 'student' || currentRole === 'faculty'
                        ? 'bg-white text-blue-700 shadow-xs font-bold ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                    title="Switch to Student / Faculty Requester Mode"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">User</span>
                  </button>

                  {/* Role 2: University Facility Administrator */}
                  <button
                    onClick={() => {
                      setCurrentRole('university_admin');
                      if (activeView === 'super-admin' || activeView === 'new-booking' || activeView === 'my-bookings') {
                        setActiveView('admin-requests');
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      currentRole === 'university_admin' || currentRole === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                    title="Switch to University Facility Administrator Mode"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">University Admin</span>
                    {pendingCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </button>

                  {/* Role 3: SmartSpace Super Admin */}
                  <button
                    onClick={() => {
                      setCurrentRole('super_admin');
                      setActiveView('super-admin');
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      currentRole === 'super_admin'
                        ? 'bg-indigo-700 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                    title="Switch to SmartSpace Super Admin (Platform Level)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="hidden sm:inline">Super Admin</span>
                  </button>
                </div>

                {/* Return to Landing shortcut */}
                <button
                  onClick={() => setActiveView('landing')}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Return to SmartSpace Portal & Landing Page"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar">
          <nav className="flex items-center space-x-1 sm:space-x-1.5 text-xs">
            {/* 1. Student / Faculty Navigation Tabs */}
            {(currentRole === 'student' || currentRole === 'faculty') && (
              <>
                <button
                  onClick={() => setActiveView('facilities')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'facilities'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Browse Facilities</span>
                </button>

                <button
                  onClick={() => setActiveView('new-booking')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'new-booking'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Request Space</span>
                </button>

                <button
                  onClick={() => setActiveView('my-bookings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'my-bookings'
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarCheck2 className="w-3.5 h-3.5" />
                  <span>My Booking Requests</span>
                  {institutionBookings.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
                      {institutionBookings.length}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* 2. University Administrator Navigation Tabs */}
            {(currentRole === 'university_admin' || currentRole === 'admin') && (
              <>
                <button
                  onClick={() => setActiveView('admin-requests')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'admin-requests'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  <span>Review Requests</span>
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-full text-[10px]">
                      {pendingCount} Pending
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveView('admin-facilities')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'admin-facilities'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Manage Spaces</span>
                </button>

                <button
                  onClick={() => setActiveView('admin-records')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'admin-records'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Reservation Records</span>
                </button>

                <button
                  onClick={() => setActiveView('reports')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'reports'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Utilization Reports</span>
                </button>

                <button
                  onClick={() => setActiveView('facilities')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'facilities'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Browse Directory</span>
                </button>
              </>
            )}

            {/* 3. SmartSpace Super Admin Navigation Tabs */}
            {currentRole === 'super_admin' && (
              <>
                <button
                  onClick={() => setActiveView('super-admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    activeView === 'super-admin'
                      ? 'bg-indigo-700 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Subscribed Universities</span>
                </button>

                <button
                  onClick={() => setActiveView('facilities')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeView === 'facilities'
                      ? 'bg-indigo-700 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cross-Campus Spaces</span>
                </button>
              </>
            )}
          </nav>

          {/* Current Workspace Tag & Pilot Notice */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            {currentRole === 'super_admin' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Platform Level View
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-600 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active: <strong className="text-slate-800">{currentInstitution.shortName}</strong></span>
                {currentInstitution.isPilot && (
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded font-semibold border border-blue-100">
                    Pilot
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
