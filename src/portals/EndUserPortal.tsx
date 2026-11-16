import React, { useRef, useState } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import { useConsent } from '../context/ConsentContext';
import { BUSINESS_CONFIG } from '../config/business';
import { PrivacyFormConsent } from '../components/PrivacyFormConsent';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { FacilityDirectory } from '../components/FacilityDirectory';
import { BookingForm, PrefilledBookingSlot } from '../components/BookingForm';
import { MyBookingsView } from '../components/MyBookingsView';
import { motion } from 'motion/react';
import {
  Building2,
  CalendarCheck,
  Clock,
  User,
  LogOut,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Compass,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface EndUserPortalProps {
  initialSubRoute?: 'login' | 'register' | 'dashboard';
}

export const EndUserPortal: React.FC<EndUserPortalProps> = () => {
  const { navigate, currentPath } = useRouter();
  const {
    currentUser,
    signInWithGoogle,
    registerUserAccount,
    logout,
    currentInstitution,
    allInstitutions,
    userBookings,
    activeView,
    setActiveView,
    setSelectedFacility,
    platformSettings,
  } = useApp();

  const { recordFormConsent } = useConsent();

  // Internal dashboard sub-view
  const [activeTab, setActiveTab] = useState<'directory' | 'new-booking' | 'my-reservations' | 'profile'>('directory');
  const [prefilledBookingSlot, setPrefilledBookingSlot] = useState<PrefilledBookingSlot | null>(null);

  // Synchronize internal tab when external components call setActiveView
  React.useEffect(() => {
    if (activeView === 'facilities') setActiveTab('directory');
    else if (activeView === 'new-booking') setActiveTab('new-booking');
    else if (activeView === 'my-bookings') setActiveTab('my-reservations');
  }, [activeView]);

  // Google Sign-In state
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Form states for registration
  const [fullName, setFullName] = useState('');
  const [verifiedEmailHint, setVerifiedEmailHint] = useState('');
  const [selectedInstId, setSelectedInstId] = useState(allInstitutions[0]?.id || 'ctu-main');
  const [userType, setUserType] = useState<
    'Student Organization Officer' | 'Faculty Member' | 'Department Representative' | 'Campus Office Representative' | 'Other Authorized User'
  >('Student Organization Officer');
  const [orgOrDept, setOrgOrDept] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string>>({});
  const [regPrivacyAgreed, setRegPrivacyAgreed] = useState(false);
  const [regMarketingOptIn, setRegMarketingOptIn] = useState(false);
  const [isRegisteringAccount, setIsRegisteringAccount] = useState(false);

  // Refs for focus movement
  const regNameRef = useRef<HTMLInputElement>(null);
  const regOrgRef = useRef<HTMLInputElement>(null);

  const isLoginPage = currentPath === '/user/login';
  const isRegisterPage = currentPath === '/user/register';

  // -------------------------------------------------------------
  // 1. LOGIN PAGE (/user/login)
  // -------------------------------------------------------------
  if (isLoginPage) {
    const handleGoogleUserLogin = async () => {
      setLoginError(null);
      setIsSigningIn(true);
      const res = await signInWithGoogle('user');
      setIsSigningIn(false);

      if (res.success) {
        navigate('/user/dashboard');
        return;
      }

      if (res.needsRegistration) {
        if (res.suggestedName && !fullName) setFullName(res.suggestedName);
        if (res.suggestedEmail) setVerifiedEmailHint(res.suggestedEmail);
        setRegError('No SmartSpace campus profile was found for your Google account. Complete the registration details below to create your account.');
        navigate('/user/register');
        return;
      }

      setLoginError(res.error || 'Unable to sign in with Google.');
    };

    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-slate-800 antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cursor-pointer hover:opacity-90 whitespace-nowrap shrink-0"
              aria-label="SmartSpace Home"
            >
              <SmartSpaceLogo size={30} compact={true} showTagline={false} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/access')}
              className="text-xs font-semibold text-slate-600 hover:text-[#0077C8] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Access Gateway</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center pb-1">
                <SmartSpaceLogo variant="mark-only" size={64} prominent={true} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                End-User Sign In
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sign in with your verified Google account to inspect campus availability and submit facility reservation requests.
              </p>
            </div>

            {loginError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                disabled={isSigningIn}
                onClick={handleGoogleUserLogin}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>{isSigningIn ? 'Signing in with Google...' : 'Sign in with Google'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <p className="text-[11px] text-slate-600 text-center leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3">
                First-time user? If your Google account does not have a campus profile yet, you will be guided to complete registration.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/user/register')}
                  className="font-bold text-[#0077C8] hover:underline cursor-pointer"
                >
                  Create End-User Account
                </button>
              </p>
              <p>
                Representing a university administration?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/university/login')}
                  className="text-slate-700 font-semibold hover:underline cursor-pointer"
                >
                  Go to University Admin Login
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. REGISTRATION PAGE (/user/register)
  // -------------------------------------------------------------
  if (isRegisterPage) {
    const USER_REGISTER_CONSENT_TEXT =
      'I have read the Privacy Policy and Terms & Conditions, and I consent to SmartSpace processing my account registration details for campus facility booking access.';

    const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setRegError(null);
      const errors: Record<string, string> = {};

      if (!fullName.trim()) {
        errors.fullName = 'Please enter your full name.';
      }
      if (!orgOrDept.trim()) {
        errors.orgOrDept = 'Please specify your organization or department.';
      }
      if (!regPrivacyAgreed) {
        errors.privacyAgreed = 'Please consent to the Privacy Policy before registering.';
      }

      if (Object.keys(errors).length > 0) {
        setRegFieldErrors(errors);
        setRegError('Please review the highlighted fields before continuing.');
        if (errors.fullName) regNameRef.current?.focus();
        else if (errors.orgOrDept) regOrgRef.current?.focus();
        else document.getElementById('enduser-register-privacy-consent')?.focus();
        return;
      }

      setRegFieldErrors({});
      setIsRegisteringAccount(true);

      recordFormConsent({
        formName: 'EndUserRegisterPage',
        consentText: USER_REGISTER_CONSENT_TEXT,
        marketingOptIn: regMarketingOptIn,
      });

      const res = await registerUserAccount({
        fullName,
        email: verifiedEmailHint || undefined,
        institutionId: selectedInstId,
        userType,
        organizationOrDept: orgOrDept,
      });

      setIsRegisteringAccount(false);

      if (res.success) {
        navigate('/user/dashboard');
      } else {
        setRegError(res.error || 'Failed to create account.');
      }
    };

    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-slate-800 antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="cursor-pointer hover:opacity-90 whitespace-nowrap shrink-0"
              aria-label="SmartSpace Home"
            >
              <SmartSpaceLogo size={30} compact={true} showTagline={false} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/access')}
              className="text-xs font-semibold text-slate-600 hover:text-[#0077C8] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to Access Gateway</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center pb-1">
                <SmartSpaceLogo variant="mark-only" size={64} prominent={true} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Create End-User Account
              </h1>
              <p className="text-xs text-slate-600">
                Register under an active SmartSpace university to book facilities and manage student org permits.
              </p>
            </div>

            {regError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{regError}</span>
              </div>
            )}

            <form noValidate onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="enduser-reg-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  ref={regNameRef}
                  id="enduser-reg-fullname"
                  type="text"
                  required
                  aria-required="true"
                  aria-invalid={regFieldErrors.fullName ? 'true' : 'false'}
                  aria-describedby={regFieldErrors.fullName ? 'enduser-reg-fullname-err' : undefined}
                  placeholder="e.g. Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                    regFieldErrors.fullName ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {regFieldErrors.fullName && (
                  <p id="enduser-reg-fullname-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                    {regFieldErrors.fullName}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                {verifiedEmailHint ? (
                  <span>
                    Google account selected: <strong className="text-slate-900">{verifiedEmailHint}</strong>. Submitting will verify and bind this account.
                  </span>
                ) : (
                  <span>
                    Clicking <strong>Verify with Google &amp; Create Account</strong> will authenticate your institutional or personal Google email via Firebase Authentication.
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="enduser-reg-inst" className="block text-xs font-semibold text-slate-700 mb-1">
                  University / Institution <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <select
                  id="enduser-reg-inst"
                  aria-describedby="enduser-reg-inst-hint"
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white cursor-pointer"
                >
                  {allInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.shortName}) — {inst.status === 'active' ? 'Active' : 'Pending'}
                    </option>
                  ))}
                </select>
                <p id="enduser-reg-inst-hint" className="text-[11px] text-slate-500 mt-1">
                  Users register under active partner institutions. If your university is missing, your physical plant admin can register first.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="enduser-reg-usertype" className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Type <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="enduser-reg-usertype"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as typeof userType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white cursor-pointer"
                  >
                    <option value="Student Organization Officer">Student Organization Officer</option>
                    <option value="Faculty Member">Faculty Member</option>
                    <option value="Department Representative">Department Representative</option>
                    <option value="Campus Office Representative">Campus Office Representative</option>
                    <option value="Other Authorized User">Other Authorized User</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="enduser-reg-org" className="block text-xs font-semibold text-slate-700 mb-1">
                    Organization / Department <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={regOrgRef}
                    id="enduser-reg-org"
                    type="text"
                    required
                    aria-required="true"
                    aria-invalid={regFieldErrors.orgOrDept ? 'true' : 'false'}
                    aria-describedby={regFieldErrors.orgOrDept ? 'enduser-reg-org-err' : undefined}
                    placeholder="e.g. Supreme Student Council"
                    value={orgOrDept}
                    onChange={(e) => setOrgOrDept(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                      regFieldErrors.orgOrDept ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {regFieldErrors.orgOrDept && (
                    <p id="enduser-reg-org-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                      {regFieldErrors.orgOrDept}
                    </p>
                  )}
                </div>
              </div>

              <PrivacyFormConsent
                idPrefix="enduser-register"
                purpose="Create and verify your campus user account for facility booking and reservation tracking."
                recipients="Your selected institution's facility administrators and assigned custodians."
                retention={BUSINESS_CONFIG.retentionPeriods.accountProfiles}
                requiredConsentText={USER_REGISTER_CONSENT_TEXT}
                agreed={regPrivacyAgreed}
                onAgreedChange={setRegPrivacyAgreed}
                agreedError={regFieldErrors.privacyAgreed}
                includeMarketing={true}
                marketingOptIn={regMarketingOptIn}
                onMarketingChange={setRegMarketingOptIn}
              />

              <button
                type="submit"
                disabled={isRegisteringAccount}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                <span>{isRegisteringAccount ? 'Verifying with Google...' : 'Verify with Google & Create Account'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/user/login')}
                className="font-bold text-[#0077C8] hover:underline cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. NOTION-INSPIRED END-USER WORKSPACE (/user/dashboard)
  // -------------------------------------------------------------
  const navItems: {
    id: 'directory' | 'new-booking' | 'my-reservations' | 'profile';
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'directory', label: 'Facility Directory', icon: <Compass className="w-4 h-4" /> },
    { id: 'new-booking', label: 'Book a Space', icon: <CalendarCheck className="w-4 h-4" /> },
    {
      id: 'my-reservations',
      label: 'My Reservations',
      icon: <Clock className="w-4 h-4" />,
      badge: userBookings.length > 0 ? userBookings.length : undefined,
    },
    { id: 'profile', label: 'Account Profile', icon: <User className="w-4 h-4" /> },
  ];

  const activePageTitle = navItems.find((n) => n.id === activeTab)?.label || 'Workspace';

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* NOTION-STYLE LEFT SIDEBAR (Desktop) */}
      <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col justify-between bg-[#FBFBFA] border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-3 space-y-5 overflow-y-auto">
          {/* Brand + Campus Switcher */}
          <div className="px-2 pt-1 space-y-3">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="cursor-pointer hover:opacity-90 text-left whitespace-nowrap block"
            >
              <SmartSpaceLogo size={26} compact={true} showTagline={false} />
            </button>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Building2 className="w-3 h-3 text-[#0077C8]" />
                <span>Home Campus</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentInstitution.shortName} · {currentInstitution.city}
              </p>
            </div>
          </div>

          {/* Workspace Pages */}
          <div className="space-y-1">
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Workspace
            </span>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive ? 'text-slate-950' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="user-nav-active"
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                      className="absolute inset-0 bg-white border border-slate-200/90 rounded-lg shadow-2xs"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-[#0077C8]' : 'text-slate-400'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="relative z-10 text-[11px] font-mono tabular-nums text-slate-500">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-slate-200 bg-[#FBFBFA] space-y-2">
          <div className="px-2 py-1 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.name || 'Authorized Requester'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {currentUser?.organization || 'Student Council'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/access');
            }}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Sticky Notion Breadcrumb Header */}
        <header className="sticky top-0 z-30 h-12 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="md:hidden shrink-0">
              <SmartSpaceLogo size={24} compact={true} showTagline={false} />
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
              <span className="font-semibold text-slate-700 truncate">{currentInstitution.shortName}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="font-semibold text-slate-950 truncate">{activePageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeTab !== 'new-booking' && (
              <button
                type="button"
                onClick={() => setActiveTab('new-booking')}
                className="px-3 py-1.5 rounded-lg bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Booking</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/access');
              }}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {platformSettings.announcementActive && platformSettings.globalAnnouncement && (
          <div className="bg-[#FAF9F6] text-slate-800 px-4 py-2 text-xs flex items-center justify-center gap-2 border-b border-slate-200">
            <Info className="w-3.5 h-3.5 text-[#0077C8] shrink-0" />
            <span className="font-medium">{platformSettings.globalAnnouncement}</span>
          </div>
        )}

        {/* Main Content Canvas */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 pb-24 md:pb-12">
          {activeTab === 'directory' && (
            <FacilityDirectory
              onRequestBookingWithSlot={(facility, initialDate, startTime, endTime) => {
                setSelectedFacility(facility);
                if (initialDate && startTime && endTime) {
                  setPrefilledBookingSlot({
                    facilityId: facility.id,
                    date: initialDate,
                    startTime,
                    endTime,
                  });
                } else {
                  setPrefilledBookingSlot(null);
                }
                setActiveView('new-booking');
                setActiveTab('new-booking');
              }}
            />
          )}
          {activeTab === 'new-booking' && <BookingForm prefilledSlot={prefilledBookingSlot} />}
          {activeTab === 'my-reservations' && <MyBookingsView />}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-2xs space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl">
                  {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-950">
                    {currentUser?.name || 'End-User Account'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {currentUser?.email || 'user@university.edu.ph'} ·{' '}
                    {currentUser?.role === 'faculty' ? 'Faculty Member' : 'Student Requester'}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 font-medium">Active Institution</span>
                  <span className="font-semibold text-slate-900">{currentInstitution.name}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 font-medium">Organization / Dept</span>
                  <span className="font-semibold text-slate-900">
                    {currentUser?.organization || 'Supreme Student Council'}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 font-medium">Total Bookings Submitted</span>
                  <span className="font-semibold text-[#0077C8] tabular-nums">
                    {userBookings.length} Requests
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 font-medium">Account Status</span>
                  <span className="font-semibold text-emerald-700">Active & Verified</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('new-booking')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs cursor-pointer text-center min-h-[44px]"
                >
                  Submit New Reservation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/access');
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer min-h-[44px]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer min-w-[60px] min-h-[44px] justify-center ${
                  isActive ? 'text-[#0077C8] font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.icon}
                <span className="text-[10px] truncate max-w-[70px]">
                  {item.id === 'directory'
                    ? 'Facilities'
                    : item.id === 'new-booking'
                    ? 'Book Space'
                    : item.id === 'my-reservations'
                    ? 'Bookings'
                    : 'Profile'}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500 mb-14 md:mb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <p>
              SmartSpace Workspace · Institution: <strong className="text-slate-700">{currentInstitution.name}</strong>
            </p>
            <p className="text-slate-400">
              Dedicated portal for student organizations, faculty &amp; authorized campus offices.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
