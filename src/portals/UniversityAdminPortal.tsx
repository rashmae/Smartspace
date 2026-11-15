import React, { useRef, useState } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import { useConsent } from '../context/ConsentContext';
import { BUSINESS_CONFIG } from '../config/business';
import { PrivacyFormConsent } from '../components/PrivacyFormConsent';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { AdminRequestsView } from '../components/AdminRequestsView';
import { AdminFacilitiesView } from '../components/AdminFacilitiesView';
import { AdminRecordsView } from '../components/AdminRecordsView';
import { UtilizationReportsView } from '../components/UtilizationReportsView';
import { FacilityPersonnelManagementView } from '../components/FacilityPersonnelManagementView';
import { FacilityHandlerWorkspaceView } from '../components/FacilityHandlerWorkspaceView';
import { motion } from 'motion/react';
import {
  Building2,
  Clock,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Settings,
  Info,
  UserCheck,
  KeyRound,
  ChevronRight,
} from 'lucide-react';

interface UniversityAdminPortalProps {
  initialSubRoute?: 'login' | 'register' | 'dashboard';
}

export const UniversityAdminPortal: React.FC<UniversityAdminPortalProps> = () => {
  const { navigate, currentPath } = useRouter();
  const {
    currentUser,
    loginWithCredentials,
    submitInstitutionalRegistration,
    logout,
    currentInstitution,
    institutionFacilities,
    institutionBookings,
    activeView,
    platformSettings,
  } = useApp();

  const { recordFormConsent } = useConsent();

  // Internal dashboard tab
  const [activeTab, setActiveTab] = useState<
    'requests' | 'facilities' | 'handlers' | 'handler-workspace' | 'records' | 'reports' | 'settings'
  >('requests');

  // Synchronize internal tab when external components call setActiveView
  React.useEffect(() => {
    if (activeView === 'admin-requests') setActiveTab('requests');
    else if (activeView === 'admin-facilities') setActiveTab('facilities');
    else if (activeView === 'admin-records') setActiveTab('records');
    else if (activeView === 'reports') setActiveTab('reports');
    else if (activeView === 'admin-handlers') setActiveTab('handlers');
    else if (activeView === 'facility-handler-workspace') setActiveTab('handler-workspace');
  }, [activeView]);

  // Form states for login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState<Record<string, string>>({});

  // Form states for institutional registration
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState<'Public University' | 'Private University' | 'College' | 'Other'>(
    'Public University'
  );
  const [instEmail, setInstEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [instPassword, setInstPassword] = useState('');
  const [instConfirmPassword, setInstConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string>>({});
  const [instPrivacyAgreed, setInstPrivacyAgreed] = useState(false);
  const [instMarketingOptIn, setInstMarketingOptIn] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  // Refs for focus movement
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPassRef = useRef<HTMLInputElement>(null);
  const instNameRef = useRef<HTMLInputElement>(null);
  const instEmailRef = useRef<HTMLInputElement>(null);
  const contactPersonRef = useRef<HTMLInputElement>(null);
  const instPassRef = useRef<HTMLInputElement>(null);
  const instConfirmRef = useRef<HTMLInputElement>(null);

  const pendingCount = institutionBookings.filter((b) => b.status === 'pending').length;
  const approvedCount = institutionBookings.filter((b) => b.status === 'approved').length;

  const isLoginPage = currentPath === '/university/login';
  const isRegisterPage = currentPath === '/university/register';

  // -------------------------------------------------------------
  // 1. UNIVERSITY ADMIN LOGIN (/university/login)
  // -------------------------------------------------------------
  if (isLoginPage) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      const errors: Record<string, string> = {};
      if (!loginEmail.trim() || !loginEmail.includes('@')) {
        errors.loginEmail = 'Enter a valid institutional administrator email address.';
      }
      if (!loginPassword) {
        errors.loginPassword = 'Enter your password.';
      }
      if (Object.keys(errors).length > 0) {
        setLoginFieldErrors(errors);
        setLoginError('Please enter both your administrator email and password.');
        if (errors.loginEmail) loginEmailRef.current?.focus();
        else loginPassRef.current?.focus();
        return;
      }
      setLoginFieldErrors({});

      const res = loginWithCredentials(loginEmail, loginPassword, 'institution');
      if (res.success) {
        navigate('/university/dashboard');
      } else {
        setLoginError(res.error || 'Invalid university administrator credentials.');
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
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xs p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-[#0077C8] flex items-center justify-center mx-auto">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                University Admin Login
              </h1>
              <p className="text-xs text-slate-600">
                Manage campus facility catalogs, review reservation requests, and inspect utilization reports.
              </p>
            </div>

            {loginError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{loginError}</span>
              </div>
            )}

            <form noValidate onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="uni-login-email" className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Institutional Admin Email <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    ref={loginEmailRef}
                    id="uni-login-email"
                    type="email"
                    required
                    aria-required="true"
                    aria-invalid={loginFieldErrors.loginEmail ? 'true' : 'false'}
                    aria-describedby={loginFieldErrors.loginEmail ? 'uni-login-email-err' : undefined}
                    placeholder="admin.facilities@ctu.edu.ph"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                      loginFieldErrors.loginEmail ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                </div>
                {loginFieldErrors.loginEmail && (
                  <p id="uni-login-email-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                    {loginFieldErrors.loginEmail}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="uni-login-password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    ref={loginPassRef}
                    id="uni-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    aria-required="true"
                    aria-invalid={loginFieldErrors.loginPassword ? 'true' : 'false'}
                    aria-describedby={loginFieldErrors.loginPassword ? 'uni-login-password-err' : undefined}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                      loginFieldErrors.loginPassword ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
                {loginFieldErrors.loginPassword && (
                  <p id="uni-login-password-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                    {loginFieldErrors.loginPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Enter University Management Portal</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            {/* Quick Demo Evaluation Personas */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Instant Evaluation Sign-In (Sample Campus Workspace)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { label: 'Engr. Santos (Admin)', email: 'admin.facilities@ctu.edu.ph', pass: 'admin123' },
                  { label: 'Ms. Julia (Hall/Gym)', email: 'julia.facilities@ctu.edu.ph', pass: 'handler123' },
                  { label: 'Mr. Jomel (Courts)', email: 'jomel.facilities@ctu.edu.ph', pass: 'handler123' },
                  { label: 'Mr. Daniel (Labs)', email: 'daniel.facilities@ctu.edu.ph', pass: 'handler123' },
                  { label: 'Ms. Angela (Tennis)', email: 'angela.facilities@ctu.edu.ph', pass: 'handler123' },
                ].map((persona) => (
                  <button
                    key={persona.email}
                    type="button"
                    onClick={() => {
                      setLoginEmail(persona.email);
                      setLoginPassword(persona.pass);
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#0077C8] text-slate-800 rounded-lg font-semibold text-[11px] text-left truncate cursor-pointer transition-colors"
                  >
                    {persona.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
              <p>
                Need to onboard your campus?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/university/register')}
                  className="font-bold text-[#0077C8] hover:underline cursor-pointer"
                >
                  Register Your Institution
                </button>
              </p>
              <p>
                Student or faculty requester?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/user/login')}
                  className="text-slate-700 font-semibold hover:underline cursor-pointer"
                >
                  Go to End-User Login
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. INSTITUTIONAL REGISTRATION (/university/register)
  // -------------------------------------------------------------
  if (isRegisterPage) {
    const UNI_REGISTER_CONSENT_TEXT =
      'I have read the Privacy Policy and Terms & Conditions, and I consent to SmartSpace processing my institutional registration and contact details for onboarding verification.';

    const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRegError(null);
      setPendingNotice(null);
      const errors: Record<string, string> = {};

      if (!instName.trim()) {
        errors.instName = 'Please enter your institution name.';
      }
      if (!instEmail.trim() || !instEmail.includes('@') || !instEmail.includes('.')) {
        errors.instEmail = 'Please enter a valid official institutional email.';
      }
      if (!contactPerson.trim()) {
        errors.contactPerson = 'Please provide an official contact person name.';
      }
      if (instPassword.length < 6) {
        errors.instPassword = 'Password must be at least 6 characters long.';
      }
      if (instPassword !== instConfirmPassword) {
        errors.instConfirmPassword = 'Passwords do not match.';
      }
      if (!instPrivacyAgreed) {
        errors.privacyAgreed = 'Please consent to the Privacy Policy before submitting.';
      }

      if (Object.keys(errors).length > 0) {
        setRegFieldErrors(errors);
        setRegError('Please review the highlighted fields below.');
        if (errors.instName) instNameRef.current?.focus();
        else if (errors.instEmail) instEmailRef.current?.focus();
        else if (errors.contactPerson) contactPersonRef.current?.focus();
        else if (errors.instPassword) instPassRef.current?.focus();
        else if (errors.instConfirmPassword) instConfirmRef.current?.focus();
        else document.getElementById('uni-register-privacy-consent')?.focus();
        return;
      }

      setRegFieldErrors({});

      recordFormConsent({
        formName: 'UniversityRegisterPage',
        consentText: UNI_REGISTER_CONSENT_TEXT,
        marketingOptIn: instMarketingOptIn,
      });

      const res = submitInstitutionalRegistration({
        institutionName: instName,
        institutionType: instType,
        officialEmail: instEmail,
        contactPerson,
        contactNumber: contactNumber.trim() || 'Not provided',
        password: instPassword,
      });

      if (res.success) {
        setPendingNotice(res.message);
        setInstName('');
        setInstEmail('');
        setContactPerson('');
        setContactNumber('');
        setInstPassword('');
        setInstConfirmPassword('');
        setInstPrivacyAgreed(false);
        setInstMarketingOptIn(false);
      } else {
        setRegError(res.error || 'Failed to submit registration.');
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
            <div className="text-center space-y-2">
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-[#0077C8] flex items-center justify-center mx-auto">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                Register Your Institution
              </h1>
              <p className="text-xs text-slate-600">
                Institutional onboarding enters a pending authorization state for platform verification.
              </p>
            </div>

            {regError && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{regError}</span>
              </div>
            )}

            {pendingNotice && (
              <div role="status" className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-slate-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <CheckCircle2 className="w-5 h-5 text-[#0077C8] shrink-0" aria-hidden="true" />
                  <span>Onboarding Application Logged (Pending Status)</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">{pendingNotice}</p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/university/login')}
                    className="w-full py-2 px-3 rounded-xl bg-[#0077C8] text-white font-bold text-xs cursor-pointer"
                  >
                    Return to University Login
                  </button>
                </div>
              </div>
            )}

            {!pendingNotice && (
              <form noValidate onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="uni-reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Institution Name <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={instNameRef}
                      id="uni-reg-name"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={regFieldErrors.instName ? 'true' : 'false'}
                      aria-describedby={regFieldErrors.instName ? 'uni-reg-name-err' : undefined}
                      placeholder="e.g. Cebu State College"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                        regFieldErrors.instName ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {regFieldErrors.instName && (
                      <p id="uni-reg-name-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                        {regFieldErrors.instName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="uni-reg-type" className="block text-xs font-semibold text-slate-700 mb-1">
                      Institution Type <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="uni-reg-type"
                      value={instType}
                      onChange={(e) => setInstType(e.target.value as typeof instType)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white cursor-pointer"
                    >
                      <option value="Public University">Public / State University</option>
                      <option value="Private University">Private University</option>
                      <option value="College">College / Institute</option>
                      <option value="Other">Other Higher Education</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="uni-reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Institutional Email <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={instEmailRef}
                    id="uni-reg-email"
                    type="email"
                    required
                    aria-required="true"
                    aria-invalid={regFieldErrors.instEmail ? 'true' : 'false'}
                    aria-describedby={regFieldErrors.instEmail ? 'uni-reg-email-err' : undefined}
                    placeholder="e.g. facilities.office@university.edu.ph"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                      regFieldErrors.instEmail ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {regFieldErrors.instEmail && (
                    <p id="uni-reg-email-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                      {regFieldErrors.instEmail}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="uni-reg-contact" className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Person <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={contactPersonRef}
                      id="uni-reg-contact"
                      type="text"
                      required
                      aria-required="true"
                      aria-invalid={regFieldErrors.contactPerson ? 'true' : 'false'}
                      aria-describedby={regFieldErrors.contactPerson ? 'uni-reg-contact-err' : undefined}
                      placeholder="e.g. Engr. David Reyes"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                        regFieldErrors.contactPerson ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {regFieldErrors.contactPerson && (
                      <p id="uni-reg-contact-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                        {regFieldErrors.contactPerson}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="uni-reg-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Number <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="uni-reg-phone"
                      type="tel"
                      aria-describedby="uni-reg-phone-hint"
                      placeholder="+63 ..."
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                    />
                    <p id="uni-reg-phone-hint" className="text-[11px] text-slate-500 mt-1">
                      Optional — institutional email is sufficient.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="uni-reg-pass" className="block text-xs font-semibold text-slate-700 mb-1">
                      Administrator Password <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={instPassRef}
                      id="uni-reg-pass"
                      type="password"
                      required
                      aria-required="true"
                      aria-invalid={regFieldErrors.instPassword ? 'true' : 'false'}
                      aria-describedby={regFieldErrors.instPassword ? 'uni-reg-pass-err' : undefined}
                      placeholder="Min. 6 characters"
                      value={instPassword}
                      onChange={(e) => setInstPassword(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                        regFieldErrors.instPassword ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {regFieldErrors.instPassword && (
                      <p id="uni-reg-pass-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                        {regFieldErrors.instPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="uni-reg-confirm" className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <input
                      ref={instConfirmRef}
                      id="uni-reg-confirm"
                      type="password"
                      required
                      aria-required="true"
                      aria-invalid={regFieldErrors.instConfirmPassword ? 'true' : 'false'}
                      aria-describedby={regFieldErrors.instConfirmPassword ? 'uni-reg-confirm-err' : undefined}
                      placeholder="Repeat password"
                      value={instConfirmPassword}
                      onChange={(e) => setInstConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white ${
                        regFieldErrors.instConfirmPassword ? 'border-red-500' : 'border-slate-200'
                      }`}
                    />
                    {regFieldErrors.instConfirmPassword && (
                      <p id="uni-reg-confirm-err" role="alert" className="text-xs font-semibold text-red-700 mt-1">
                        {regFieldErrors.instConfirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <strong>Governance Policy:</strong> Submitting this registration requires platform Super Admin authorization before activating your campus sandbox.
                </div>

                <PrivacyFormConsent
                  idPrefix="uni-register"
                  purpose="Verify institutional authorization and provision your university facilities administrator workspace."
                  recipients="Authorized SmartSpace platform administrators during onboarding review."
                  retention={BUSINESS_CONFIG.retentionPeriods.accountProfiles}
                  requiredConsentText={UNI_REGISTER_CONSENT_TEXT}
                  agreed={instPrivacyAgreed}
                  onAgreedChange={setInstPrivacyAgreed}
                  agreedError={regFieldErrors.privacyAgreed}
                  includeMarketing={true}
                  marketingOptIn={instMarketingOptIn}
                  onMarketingChange={setInstMarketingOptIn}
                />

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>Submit Institutional Registration</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an authorized account?{' '}
              <button
                type="button"
                onClick={() => navigate('/university/login')}
                className="font-bold text-[#0077C8] hover:underline cursor-pointer"
              >
                University Admin Sign In
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. NOTION-INSPIRED UNIVERSITY ADMIN WORKSPACE (/university/dashboard)
  // -------------------------------------------------------------
  const workspacePages: {
    id: 'requests' | 'facilities' | 'records' | 'reports';
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'requests',
      label: 'Pending Requests',
      icon: <Clock className="w-4 h-4" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: 'facilities', label: 'Facilities Inventory', icon: <Building2 className="w-4 h-4" /> },
    { id: 'records', label: 'Reservation Records', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'reports', label: 'Utilization Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const governancePages: {
    id: 'handlers' | 'handler-workspace' | 'settings';
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'handlers', label: 'Personnel Assignments', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'handler-workspace', label: 'Handler Workspace', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'settings', label: 'Workspace Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const allPages = [...workspacePages, ...governancePages];
  const activePageTitle = allPages.find((p) => p.id === activeTab)?.label || 'Admin Console';

  return (
    <div className="min-h-screen bg-white flex font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* NOTION-STYLE LEFT SIDEBAR (Desktop) */}
      <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col justify-between bg-[#FBFBFA] border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-3 space-y-5 overflow-y-auto">
          {/* Brand + Institution Switcher Info */}
          <div className="px-2 pt-1 space-y-3">
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className="cursor-pointer hover:opacity-90 text-left whitespace-nowrap block"
            >
              <SmartSpaceLogo size={26} compact={true} showTagline={false} />
            </button>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200/90 space-y-0.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0077C8]">
                <Building2 className="w-3 h-3" />
                <span>Admin Console</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentInstitution.shortName} · {currentInstitution.name}
              </p>
            </div>
          </div>

          {/* Group 1: Facility Operations */}
          <div className="space-y-1">
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Operations
            </span>
            {workspacePages.map((item) => {
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
                      layoutId="admin-nav-active"
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                      className="absolute inset-0 bg-white border border-slate-200/90 rounded-lg shadow-2xs"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-[#0077C8]' : 'text-slate-400'}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="relative z-10 text-[11px] font-mono font-bold tabular-nums text-amber-600">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Group 2: Governance & Personnel */}
          <div className="space-y-1">
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Governance
            </span>
            {governancePages.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isActive ? 'text-slate-950' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="admin-nav-active"
                      transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                      className="absolute inset-0 bg-white border border-slate-200/90 rounded-lg shadow-2xs"
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-[#0077C8]' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Identity Footer */}
        <div className="p-3 border-t border-slate-200 bg-[#FBFBFA] space-y-2">
          <div className="px-2 py-1 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0077C8] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {(currentUser?.name || currentInstitution.assignedAdminName || 'A').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {currentUser?.name || currentInstitution.assignedAdminName || 'University Admin'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">Physical Plant Office</p>
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
              <span className="font-semibold text-slate-700 truncate">{currentInstitution.shortName} Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="font-semibold text-slate-950 truncate">{activePageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono tabular-nums text-slate-500">
              <span>{pendingCount} pending</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700">{approvedCount} approved</span>
            </div>
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

        {/* Main Admin Content Canvas */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 pb-24 md:pb-12">
          {activeTab === 'requests' && <AdminRequestsView />}
          {activeTab === 'facilities' && <AdminFacilitiesView />}
          {activeTab === 'handlers' && <FacilityPersonnelManagementView />}
          {activeTab === 'handler-workspace' && <FacilityHandlerWorkspaceView />}
          {activeTab === 'records' && <AdminRecordsView />}
          {activeTab === 'reports' && <UtilizationReportsView />}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-2xs space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-[#0077C8] flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-extrabold text-slate-950">{currentInstitution.name}</h2>
                  <p className="text-xs text-slate-500">
                    Institution ID: <code className="font-mono text-[#0077C8]">{currentInstitution.id}</code> · Plan:{' '}
                    <strong className="text-slate-800">{currentInstitution.subscriptionPlan || 'Standard'}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">
                  Workspace Access &amp; Security Configuration
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  As a University Facility Administrator, your view is scoped to{' '}
                  <strong>{currentInstitution.name}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 bg-slate-200 gap-px rounded-xl overflow-hidden border border-slate-200">
                  <div className="p-4 bg-white space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Total Registered Spaces</span>
                    <p className="text-lg font-extrabold text-slate-950 tabular-nums">
                      {institutionFacilities.length} Facilities
                    </p>
                  </div>
                  <div className="p-4 bg-white space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Total Historical Bookings</span>
                    <p className="text-lg font-extrabold text-[#0077C8] tabular-nums">
                      {institutionBookings.length} Bookings
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FBFBFA] border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Assigned Physical Plant Signatory
                  </span>
                  <p className="text-xs font-bold text-slate-900">{currentInstitution.assignedAdminName}</p>
                  <p className="text-xs text-slate-500">{currentInstitution.assignedAdminEmail}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/access');
                  }}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer min-h-[44px]"
                >
                  Sign Out from Campus Console
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-1.5 flex items-center justify-around">
          {[
            { id: 'requests' as const, label: 'Requests', icon: <Clock className="w-5 h-5" /> },
            { id: 'facilities' as const, label: 'Facilities', icon: <Building2 className="w-5 h-5" /> },
            { id: 'records' as const, label: 'Records', icon: <FileSpreadsheet className="w-5 h-5" /> },
            { id: 'reports' as const, label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
            { id: 'settings' as const, label: 'Settings', icon: <Settings className="w-5 h-5" /> },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg cursor-pointer min-w-[54px] min-h-[44px] justify-center ${
                activeTab === item.id ? 'text-[#0077C8] font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500 mb-14 md:mb-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <p>
              SmartSpace Admin Console · Workspace: <strong className="text-slate-700">{currentInstitution.name}</strong>
            </p>
            <p className="text-slate-400">
              Strict multi-tenant isolation · Authorized facility administrators only.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};
