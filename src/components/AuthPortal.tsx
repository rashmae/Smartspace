import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useConsent } from '../context/ConsentContext';
import { BUSINESS_CONFIG } from '../config/business';
import { PrivacyFormConsent } from './PrivacyFormConsent';
import SmartSpaceLogo from './SmartSpaceLogo';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Shield, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';

const INST_REG_CONSENT_TEXT =
  'I have read the Privacy Policy and Terms & Conditions, and I consent to SmartSpace processing my institutional registration and contact details for onboarding verification.';

const USER_REG_CONSENT_TEXT =
  'I have read the Privacy Policy and Terms & Conditions, and I consent to SmartSpace processing my account registration details for campus facility booking access.';

export const AuthPortal: React.FC = () => {
  const {
    authFlowState,
    setAuthFlowState,
    setActiveView,
    allInstitutions,
    submitInstitutionalRegistration,
    registerUserAccount,
    loginWithCredentials,
    setIsDemoModalOpen,
  } = useApp();
  const { recordFormConsent } = useConsent();

  const { audience, tab, highlight } = authFlowState;

  // Form states
  const [isRegistering, setIsRegistering] = useState<boolean>(tab === 'register');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common errors / loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pendingApprovalNotice, setPendingApprovalNotice] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Consent states (never pre-checked)
  const [instPrivacyAgreed, setInstPrivacyAgreed] = useState(false);
  const [instMarketingOptIn, setInstMarketingOptIn] = useState(false);
  const [userPrivacyAgreed, setUserPrivacyAgreed] = useState(false);
  const [userMarketingOptIn, setUserMarketingOptIn] = useState(false);

  // Refs for focus movement
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const instNameRef = useRef<HTMLInputElement>(null);
  const instEmailRef = useRef<HTMLInputElement>(null);
  const instContactRef = useRef<HTMLInputElement>(null);
  const instPassRef = useRef<HTMLInputElement>(null);
  const instConfirmRef = useRef<HTMLInputElement>(null);
  const userFullNameRef = useRef<HTMLInputElement>(null);
  const userEmailRef = useRef<HTMLInputElement>(null);
  const userOrgRef = useRef<HTMLInputElement>(null);
  const userPassRef = useRef<HTMLInputElement>(null);
  const userConfirmRef = useRef<HTMLInputElement>(null);
  const superEmailRef = useRef<HTMLInputElement>(null);
  const superPassRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!forgotPasswordOpen) return;
    setTimeout(() => forgotEmailRef.current?.focus(), 0);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setForgotPasswordOpen(false);
        setForgotPasswordError(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [forgotPasswordOpen]);

  // Institutional Login state
  const [instLoginEmail, setInstLoginEmail] = useState('');
  const [instLoginPassword, setInstLoginPassword] = useState('');

  // Institutional Registration state
  const [instRegName, setInstRegName] = useState('');
  const [instRegType, setInstRegType] = useState<'Public University' | 'Private University' | 'College' | 'Other'>('Public University');
  const [instRegEmail, setInstRegEmail] = useState('');
  const [instRegContactPerson, setInstRegContactPerson] = useState('');
  const [instRegContactNumber, setInstRegContactNumber] = useState('');
  const [instRegPassword, setInstRegPassword] = useState('');
  const [instRegConfirmPassword, setInstRegConfirmPassword] = useState('');

  // User Login state
  const [userLoginEmail, setUserLoginEmail] = useState('');
  const [userLoginPassword, setUserLoginPassword] = useState('');

  // User Registration state
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userInstitutionId, setUserInstitutionId] = useState(allInstitutions[0]?.id || 'ctu-main');
  const [userType, setUserType] = useState<
    'Student Organization Officer' | 'Faculty Member' | 'Department Representative' | 'Campus Office Representative' | 'Other Authorized User'
  >('Student Organization Officer');
  const [userOrgOrDept, setUserOrgOrDept] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userConfirmPassword, setUserConfirmPassword] = useState('');

  // Super Admin state (never pre-filled)
  const [superAdminEmail, setSuperAdminEmail] = useState('');
  const [superAdminPassword, setSuperAdminPassword] = useState('');

  // Handle switching audience / tabs
  const handleSwitchAudience = (newAudience: 'selection' | 'institution' | 'user' | 'super_admin') => {
    setErrorMsg(null);
    setFieldErrors({});
    setPendingApprovalNotice(null);
    setAuthFlowState((prev) => ({ ...prev, audience: newAudience, tab: 'login' }));
    setIsRegistering(false);
  };

  const handleToggleTab = (toRegister: boolean) => {
    setErrorMsg(null);
    setFieldErrors({});
    setPendingApprovalNotice(null);
    setIsRegistering(toRegister);
    setAuthFlowState((prev) => ({ ...prev, tab: toRegister ? 'register' : 'login' }));
  };

  // Institutional Login Submission
  const handleInstitutionalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingApprovalNotice(null);
    const errors: Record<string, string> = {};
    if (!instLoginEmail.trim() || !instLoginEmail.includes('@')) {
      errors.loginEmail = 'Enter a valid institutional email address.';
    }
    if (!instLoginPassword) {
      errors.loginPassword = 'Enter your password.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please enter both your institutional email and password.');
      if (errors.loginEmail) loginEmailRef.current?.focus();
      else loginPasswordRef.current?.focus();
      return;
    }
    setFieldErrors({});

    const res = loginWithCredentials(instLoginEmail, instLoginPassword, 'institution');
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid institutional credentials.');
    }
  };

  // Institutional Registration Submission
  const handleInstitutionalRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingApprovalNotice(null);
    const errors: Record<string, string> = {};

    if (!instRegName.trim()) {
      errors.instRegName = 'Institution name is required.';
    }
    if (!instRegEmail.trim() || !instRegEmail.includes('@') || !instRegEmail.includes('.')) {
      errors.instRegEmail = 'Enter a valid official institutional email.';
    }
    if (!instRegContactPerson.trim()) {
      errors.instRegContactPerson = 'Contact person name is required.';
    }
    if (instRegPassword.length < 6) {
      errors.instRegPassword = 'Password must be at least 6 characters long.';
    }
    if (instRegPassword !== instRegConfirmPassword) {
      errors.instRegConfirmPassword = 'Passwords do not match.';
    }
    if (!instPrivacyAgreed) {
      errors.instPrivacyAgreed = 'Please consent to the Privacy Policy before registering.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please review the highlighted fields below.');
      if (errors.instRegName) instNameRef.current?.focus();
      else if (errors.instRegEmail) instEmailRef.current?.focus();
      else if (errors.instRegContactPerson) instContactRef.current?.focus();
      else if (errors.instRegPassword) instPassRef.current?.focus();
      else if (errors.instRegConfirmPassword) instConfirmRef.current?.focus();
      else document.getElementById('auth-inst-reg-privacy-consent')?.focus();
      return;
    }
    setFieldErrors({});

    recordFormConsent({
      formName: 'AuthPortal_InstitutionalRegistration',
      consentText: INST_REG_CONSENT_TEXT,
      marketingOptIn: instMarketingOptIn,
    });

    const res = submitInstitutionalRegistration({
      institutionName: instRegName,
      institutionType: instRegType,
      officialEmail: instRegEmail,
      contactPerson: instRegContactPerson,
      contactNumber: instRegContactNumber.trim() || 'Not provided',
      password: instRegPassword,
    });

    if (res.success) {
      setPendingApprovalNotice(res.message);
      setInstRegName('');
      setInstRegEmail('');
      setInstRegContactPerson('');
      setInstRegContactNumber('');
      setInstRegPassword('');
      setInstRegConfirmPassword('');
      setInstPrivacyAgreed(false);
      setInstMarketingOptIn(false);
    } else {
      setErrorMsg(res.error || 'Failed to submit registration.');
    }
  };

  // User Login Submission
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errors: Record<string, string> = {};
    if (!userLoginEmail.trim() || !userLoginEmail.includes('@')) {
      errors.loginEmail = 'Enter a valid institutional email address.';
    }
    if (!userLoginPassword) {
      errors.loginPassword = 'Enter your password.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please enter both your institutional email and password.');
      if (errors.loginEmail) loginEmailRef.current?.focus();
      else loginPasswordRef.current?.focus();
      return;
    }
    setFieldErrors({});

    const res = loginWithCredentials(userLoginEmail, userLoginPassword, 'user');
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  // User Registration Submission
  const handleUserRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errors: Record<string, string> = {};

    if (!userFullName.trim()) {
      errors.userFullName = 'Full name is required.';
    }
    if (!userEmail.trim() || !userEmail.includes('@') || !userEmail.includes('.')) {
      errors.userEmail = 'Enter a valid institutional email.';
    }
    if (!userOrgOrDept.trim()) {
      errors.userOrgOrDept = 'Organization or department is required.';
    }
    if (userPassword.length < 6) {
      errors.userPassword = 'Password must be at least 6 characters long.';
    }
    if (userPassword !== userConfirmPassword) {
      errors.userConfirmPassword = 'Passwords do not match.';
    }
    if (!userPrivacyAgreed) {
      errors.userPrivacyAgreed = 'Please consent to the Privacy Policy before creating an account.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please review the highlighted fields below.');
      if (errors.userFullName) userFullNameRef.current?.focus();
      else if (errors.userEmail) userEmailRef.current?.focus();
      else if (errors.userOrgOrDept) userOrgRef.current?.focus();
      else if (errors.userPassword) userPassRef.current?.focus();
      else if (errors.userConfirmPassword) userConfirmRef.current?.focus();
      else document.getElementById('auth-user-reg-privacy-consent')?.focus();
      return;
    }
    setFieldErrors({});

    recordFormConsent({
      formName: 'AuthPortal_UserRegistration',
      consentText: USER_REG_CONSENT_TEXT,
      marketingOptIn: userMarketingOptIn,
    });

    const res = registerUserAccount({
      fullName: userFullName,
      email: userEmail,
      institutionId: userInstitutionId,
      userType,
      organizationOrDept: userOrgOrDept,
      password: userPassword,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  // Super Admin Login Submission
  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const errors: Record<string, string> = {};
    if (!superAdminEmail.trim() || !superAdminEmail.includes('@')) {
      errors.superEmail = 'Enter a valid super admin email address.';
    }
    if (!superAdminPassword) {
      errors.superPassword = 'Enter your master password.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please enter your super admin email and password.');
      if (errors.superEmail) superEmailRef.current?.focus();
      else superPassRef.current?.focus();
      return;
    }
    setFieldErrors({});

    const res = loginWithCredentials(superAdminEmail, superAdminPassword, 'super_admin');
    if (!res.success) {
      setErrorMsg(res.error || 'Super admin authentication failed.');
    }
  };

  // Selected institution active status check
  const selectedInstObj = allInstitutions.find((i) => i.id === userInstitutionId);
  const isSelectedInstInactive = selectedInstObj && selectedInstObj.status !== 'active';

  // Sample sandbox auto-fill helper (student / faculty / campus admin sandboxes only)
  const handleFillDemoCreds = (type: 'ctu-admin' | 'usc-admin' | 'student' | 'faculty') => {
    setErrorMsg(null);
    if (type === 'ctu-admin') {
      setInstLoginEmail('admin.facilities@ctu.edu.ph');
      setInstLoginPassword('demo1234');
    } else if (type === 'usc-admin') {
      setInstLoginEmail('facilities@usc.edu.ph');
      setInstLoginPassword('demo1234');
    } else if (type === 'student') {
      setUserLoginEmail('juan.delacruz@ctu.edu.ph');
      setUserLoginPassword('demo1234');
    } else if (type === 'faculty') {
      setUserLoginEmail('maria.fernandez@ctu.edu.ph');
      setUserLoginPassword('demo1234');
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: DEDICATED ACCESS SELECTION PAGE
  // -------------------------------------------------------------
  if (audience === 'selection') {
    return (
      <div className="py-6 sm:py-10 max-w-5xl mx-auto px-4">
        {/* Header Breadcrumbs / Back */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setActiveView('landing')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Return to SmartSpace Homepage</span>
          </button>
          
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Dedicated Access Hub
          </span>
        </div>

        {/* Title & Introduction */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/70 text-purple-900 text-xs font-bold border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{highlight === 'demo' ? 'Institutional Inquiries & Access Selection' : 'Choose Your SmartSpace Portal'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            How would you like to enter SmartSpace?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Select your organization type below. Institutions and campus end-users have distinct administrative workflows, security boundaries, and dashboard features.
          </p>
        </div>

        {/* The Two Distinct Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-10">
          {/* OPTION A: FOR INSTITUTIONS */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-purple-500 shadow-xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-inner">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                  Primary Customer
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  For Institutions
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Discover how SmartSpace can organize your university's facility booking and management process.
                </p>
              </div>

              {/* Scope & Audience details */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-purple-900">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Audience Scope</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Public universities, private universities, colleges, and higher education institutions seeking campus-wide facility centralization and governance.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-2 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Central campus space inventory & rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Administrative approval and rejection audit trail</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Live conflict prevention and utilization reporting</span>
                </li>
              </ul>
            </div>

            {/* Actions for Option A */}
            <div className="space-y-2.5 pt-6 border-t border-slate-100 mt-6">
              {/* Request an Institutional Demo */}
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  highlight === 'demo'
                    ? 'bg-purple-700 hover:bg-purple-800 text-white ring-2 ring-purple-300'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                <span>Request an Institutional Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* University Admin Login */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthFlowState({ audience: 'institution', tab: 'login', highlight: 'login' });
                    setIsRegistering(false);
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    highlight === 'login'
                      ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  University Admin Login
                </button>

                {/* Register Your Institution */}
                <button
                  type="button"
                  onClick={() => {
                    setAuthFlowState({ audience: 'institution', tab: 'register', highlight: 'login' });
                    setIsRegistering(true);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-all text-center cursor-pointer"
                >
                  Register Institution
                </button>
              </div>
            </div>
          </div>

          {/* OPTION B: FOR ORGANIZATIONS AND USERS */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 hover:border-indigo-500 shadow-xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner">
                  <Users className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                  Campus End Users
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  For Organizations and Users
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Find campus facilities, submit reservation requests, and track your organization's bookings.
                </p>
              </div>

              {/* Scope & Audience details */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Audience Scope</span>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Student organization officers and members, faculty members, academic departments, and authorized campus offices.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-2 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Real-time availability schedule checker</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Instant conflict detection and paperless requests</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Digital reservation permits with verifiable QR codes</span>
                </li>
              </ul>
            </div>

            {/* Actions for Option B */}
            <div className="space-y-2.5 pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => {
                  setAuthFlowState({ audience: 'user', tab: 'login', highlight: 'login' });
                  setIsRegistering(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>User Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthFlowState({ audience: 'user', tab: 'register', highlight: 'login' });
                  setIsRegistering(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 text-xs font-bold transition-all text-center cursor-pointer"
              >
                Create an End-User Account
              </button>
            </div>
          </div>
        </div>

        {/* Super Admin Access Link (Subtle & Restricted) */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500">
            Platform operations or multi-university governance?
          </p>
          <button
            type="button"
            onClick={() => handleSwitchAudience('super_admin')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-200/60"
          >
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            <span>Restricted Platform Super Admin Login</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: ANIMATED SPLIT-PANEL AUTHENTICATION CONTAINER (850px x 550px)
  // -------------------------------------------------------------
  return (
    <div className="py-6 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
      {/* Top Navigation Bar above the Container */}
      <div className="w-full max-w-[850px] px-4 mb-4 flex items-center justify-between text-xs">
        <button
          onClick={() => handleSwitchAudience('selection')}
          className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Access Hub</span>
        </button>

        {/* Portal Indicator Badge */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">Active Portal:</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
            {audience === 'institution'
              ? 'Institutional Access'
              : audience === 'user'
              ? 'Organizations & End Users'
              : 'Platform Super Admin'}
          </span>
          {audience !== 'super_admin' && (
            <button
              onClick={() => handleSwitchAudience(audience === 'institution' ? 'user' : 'institution')}
              className="text-purple-600 hover:text-purple-800 font-semibold underline ml-1 cursor-pointer"
            >
              Switch to {audience === 'institution' ? 'User Portal' : 'Institutional Portal'}
            </button>
          )}
        </div>
      </div>

      {/* Main 850px x 640px Animated Container */}
      <div 
        className="relative bg-white mx-4 rounded-[30px] shadow-[0_0_30px_rgba(0,0,0,0.18)] overflow-hidden w-full max-w-[850px] min-h-[600px] lg:h-[640px] border border-slate-200 transition-all duration-500"
      >
        {/* Mobile Tab Switcher (Visible on small screens where sliding overlay stacks) */}
        {audience !== 'super_admin' && (
          <div className="lg:hidden flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => handleToggleTab(false)}
              className={`flex-1 py-3 text-xs font-bold text-center transition-colors cursor-pointer ${
                !isRegistering
                  ? 'bg-white text-purple-900 border-b-2 border-purple-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleToggleTab(true)}
              className={`flex-1 py-3 text-xs font-bold text-center transition-colors cursor-pointer ${
                isRegistering
                  ? 'bg-white text-purple-900 border-b-2 border-purple-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {audience === 'institution' ? 'Register Institution' : 'Create Account'}
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* CASE 1 & 2: INSTITUTION OR USER SPLIT-PANEL EXPERIENCE      */}
        {/* ----------------------------------------------------------- */}
        {audience !== 'super_admin' ? (
          <div className="relative w-full h-full flex flex-col lg:flex-row">
            {/* LEFT / FIRST FORM PANEL: LOGIN */}
            <div 
              className={`w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto transition-all duration-700 ease-in-out ${
                isRegistering ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100 z-10'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <SmartSpaceLogo size={28} showTagline={false} />
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mt-3">
                    {audience === 'institution' ? 'University Admin Login' : 'User Sign In'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {audience === 'institution'
                      ? 'Sign in to access your university facilities console and review requests.'
                      : 'Sign in to reserve campus facilities and track booking permits.'}
                  </p>
                </div>

                {errorMsg && !isRegistering && (
                  <div role="alert" className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {pendingApprovalNotice && (
                  <div role="status" className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="leading-relaxed">{pendingApprovalNotice}</span>
                  </div>
                )}

                {/* The Login Form */}
                <form
                  noValidate
                  onSubmit={audience === 'institution' ? handleInstitutionalLogin : handleUserLogin}
                  className="space-y-3"
                >
                  <div>
                    <label htmlFor="auth-login-email" className="block text-xs font-bold text-slate-700 mb-1">
                      Institutional Email Address <span className="text-red-700" aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                      <input
                        ref={loginEmailRef}
                        id="auth-login-email"
                        type="email"
                        required
                        aria-required="true"
                        aria-invalid={fieldErrors.loginEmail ? 'true' : 'false'}
                        aria-describedby={fieldErrors.loginEmail ? 'auth-login-email-err' : undefined}
                        placeholder={
                          audience === 'institution'
                            ? 'admin@university.edu.ph'
                            : 'requester@university.edu.ph'
                        }
                        value={audience === 'institution' ? instLoginEmail : userLoginEmail}
                        onChange={(e) =>
                          audience === 'institution'
                            ? setInstLoginEmail(e.target.value)
                            : setUserLoginEmail(e.target.value)
                        }
                        className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                          fieldErrors.loginEmail ? 'border-red-500' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {fieldErrors.loginEmail && (
                      <p id="auth-login-email-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-1">
                        {fieldErrors.loginEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="auth-login-password" className="block text-xs font-bold text-slate-700">
                        Password <span className="text-red-700" aria-hidden="true">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordError(null);
                          setForgotPasswordOpen(true);
                        }}
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                      <input
                        ref={loginPasswordRef}
                        id="auth-login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        aria-required="true"
                        aria-invalid={fieldErrors.loginPassword ? 'true' : 'false'}
                        aria-describedby={fieldErrors.loginPassword ? 'auth-login-password-err' : undefined}
                        placeholder="••••••••"
                        value={audience === 'institution' ? instLoginPassword : userLoginPassword}
                        onChange={(e) =>
                          audience === 'institution'
                            ? setInstLoginPassword(e.target.value)
                            : setUserLoginPassword(e.target.value)
                        }
                        className={`w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                          fieldErrors.loginPassword ? 'border-red-500' : 'border-slate-200'
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
                    {fieldErrors.loginPassword && (
                      <p id="auth-login-password-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-1">
                        {fieldErrors.loginPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>{audience === 'institution' ? 'Log In as University Admin' : 'Sign In to Campus Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </form>
              </div>

              {/* Sample Sandbox Quick Fill */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Fill Sample Sandbox Credentials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {audience === 'institution' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('ctu-admin')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Sample Public Univ Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('usc-admin')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Sample Private Univ Admin
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('student')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Sample Student Sandbox
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('faculty')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Sample Faculty Sandbox
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT / SECOND FORM PANEL: REGISTRATION */}
            <div 
              className={`w-full lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto transition-all duration-700 ease-in-out ${
                !isRegistering ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100 z-10'
              }`}
            >
              <div className="space-y-3">
                <div>
                  <SmartSpaceLogo size={28} showTagline={false} />
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mt-2">
                    {audience === 'institution' ? 'Register Your Institution' : 'Create End-User Account'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {audience === 'institution'
                      ? 'Submit your university for platform authorization and administrator assignment.'
                      : 'Create your account under an active SmartSpace institution.'}
                  </p>
                </div>

                {errorMsg && isRegistering && (
                  <div role="alert" className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {pendingApprovalNotice && (
                  <div role="status" className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-purple-950">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" aria-hidden="true" />
                      <span>Registration Pending Authorization</span>
                    </div>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      {pendingApprovalNotice}
                    </p>
                  </div>
                )}

                {/* FORM A: INSTITUTIONAL REGISTRATION */}
                {audience === 'institution' ? (
                  <form noValidate onSubmit={handleInstitutionalRegistration} className="space-y-2.5">
                    {/* Institution Name */}
                    <div>
                      <label htmlFor="auth-inst-reg-name" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Institution Name <span className="text-red-700" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={instNameRef}
                        id="auth-inst-reg-name"
                        type="text"
                        required
                        aria-required="true"
                        aria-invalid={fieldErrors.instRegName ? 'true' : 'false'}
                        aria-describedby={fieldErrors.instRegName ? 'auth-inst-reg-name-err' : undefined}
                        placeholder="e.g. Sample Higher Education Institution"
                        value={instRegName}
                        onChange={(e) => setInstRegName(e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                          fieldErrors.instRegName ? 'border-red-500' : 'border-slate-200'
                        }`}
                      />
                      {fieldErrors.instRegName && (
                        <p id="auth-inst-reg-name-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                          {fieldErrors.instRegName}
                        </p>
                      )}
                    </div>

                    {/* Institution Type & Official Email */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="auth-inst-reg-type" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Institution Type <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <select
                          id="auth-inst-reg-type"
                          value={instRegType}
                          onChange={(e) => setInstRegType(e.target.value as typeof instRegType)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                        >
                          <option value="Public University">Public University</option>
                          <option value="Private University">Private University</option>
                          <option value="College">College</option>
                          <option value="Other">Other Higher Ed</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="auth-inst-reg-email" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Official Email <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={instEmailRef}
                          id="auth-inst-reg-email"
                          type="email"
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.instRegEmail ? 'true' : 'false'}
                          aria-describedby={fieldErrors.instRegEmail ? 'auth-inst-reg-email-err' : undefined}
                          placeholder="admin@univ.edu.ph"
                          value={instRegEmail}
                          onChange={(e) => setInstRegEmail(e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.instRegEmail ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.instRegEmail && (
                          <p id="auth-inst-reg-email-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.instRegEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Person & Optional Number */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="auth-inst-reg-contact" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Contact Person <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={instContactRef}
                          id="auth-inst-reg-contact"
                          type="text"
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.instRegContactPerson ? 'true' : 'false'}
                          aria-describedby={fieldErrors.instRegContactPerson ? 'auth-inst-reg-contact-err' : undefined}
                          placeholder="Dr. / Engr. Full Name"
                          value={instRegContactPerson}
                          onChange={(e) => setInstRegContactPerson(e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.instRegContactPerson ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.instRegContactPerson && (
                          <p id="auth-inst-reg-contact-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.instRegContactPerson}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="auth-inst-reg-phone" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Contact Number <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          id="auth-inst-reg-phone"
                          type="tel"
                          aria-describedby="auth-inst-reg-phone-hint"
                          placeholder="+63 ..."
                          value={instRegContactNumber}
                          onChange={(e) => setInstRegContactNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                        <p id="auth-inst-reg-phone-hint" className="text-[10px] text-slate-500 mt-0.5">
                          Optional — institutional email is sufficient.
                        </p>
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="auth-inst-reg-pass" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Admin Password <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={instPassRef}
                          id="auth-inst-reg-pass"
                          type={showPassword ? 'text' : 'password'}
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.instRegPassword ? 'true' : 'false'}
                          aria-describedby={fieldErrors.instRegPassword ? 'auth-inst-reg-pass-err' : undefined}
                          placeholder="Min 6 chars"
                          value={instRegPassword}
                          onChange={(e) => setInstRegPassword(e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.instRegPassword ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.instRegPassword && (
                          <p id="auth-inst-reg-pass-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.instRegPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="auth-inst-reg-confirm" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Confirm Password <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={instConfirmRef}
                          id="auth-inst-reg-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.instRegConfirmPassword ? 'true' : 'false'}
                          aria-describedby={fieldErrors.instRegConfirmPassword ? 'auth-inst-reg-confirm-err' : undefined}
                          placeholder="Confirm"
                          value={instRegConfirmPassword}
                          onChange={(e) => setInstRegConfirmPassword(e.target.value)}
                          className={`w-full px-3 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.instRegConfirmPassword ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.instRegConfirmPassword && (
                          <p id="auth-inst-reg-confirm-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.instRegConfirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    <PrivacyFormConsent
                      idPrefix="auth-inst-reg"
                      compact={true}
                      purpose="Verify institutional authorization and provision your university facilities administrator workspace."
                      recipients="Authorized SmartSpace platform administrators during onboarding review."
                      retention={BUSINESS_CONFIG.retentionPeriods.accountProfiles}
                      requiredConsentText={INST_REG_CONSENT_TEXT}
                      agreed={instPrivacyAgreed}
                      onAgreedChange={setInstPrivacyAgreed}
                      agreedError={fieldErrors.instPrivacyAgreed}
                      includeMarketing={true}
                      marketingOptIn={instMarketingOptIn}
                      onMarketingChange={setInstMarketingOptIn}
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Submit Institutional Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </form>
                ) : (
                  /* FORM B: USER REGISTRATION */
                  <form noValidate onSubmit={handleUserRegistration} className="space-y-2">
                    {/* Full Name & Institutional Email */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="auth-user-reg-name" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Full Name <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={userFullNameRef}
                          id="auth-user-reg-name"
                          type="text"
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.userFullName ? 'true' : 'false'}
                          aria-describedby={fieldErrors.userFullName ? 'auth-user-reg-name-err' : undefined}
                          placeholder="Juan Dela Cruz"
                          value={userFullName}
                          onChange={(e) => setUserFullName(e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.userFullName ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.userFullName && (
                          <p id="auth-user-reg-name-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.userFullName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="auth-user-reg-email" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Institutional Email <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={userEmailRef}
                          id="auth-user-reg-email"
                          type="email"
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.userEmail ? 'true' : 'false'}
                          aria-describedby={fieldErrors.userEmail ? 'auth-user-reg-email-err' : undefined}
                          placeholder="name@university.edu.ph"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.userEmail ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.userEmail && (
                          <p id="auth-user-reg-email-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.userEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* University / Institution Selector */}
                    <div>
                      <label htmlFor="auth-user-reg-inst" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        University / Institution <span className="text-red-700" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="auth-user-reg-inst"
                        value={userInstitutionId}
                        onChange={(e) => setUserInstitutionId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                      >
                        {allInstitutions.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name} ({inst.shortName}) - {inst.status === 'active' ? 'Active' : 'Inactive'}
                          </option>
                        ))}
                      </select>
                      {isSelectedInstInactive && (
                        <p className="text-[11px] text-amber-800 mt-1 font-semibold">
                          This institution has not yet been activated on SmartSpace. Registration is unavailable.
                        </p>
                      )}
                    </div>

                    {/* User Type & Org Name */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="auth-user-reg-type" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          User Type <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <select
                          id="auth-user-reg-type"
                          value={userType}
                          onChange={(e) => setUserType(e.target.value as typeof userType)}
                          className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                        >
                          <option value="Student Organization Officer">Student Org Officer</option>
                          <option value="Faculty Member">Faculty Member</option>
                          <option value="Department Representative">Dept Representative</option>
                          <option value="Campus Office Representative">Campus Office Rep</option>
                          <option value="Other Authorized User">Other Authorized User</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="auth-user-reg-org" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Organization / Dept <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={userOrgRef}
                          id="auth-user-reg-org"
                          type="text"
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.userOrgOrDept ? 'true' : 'false'}
                          aria-describedby={fieldErrors.userOrgOrDept ? 'auth-user-reg-org-err' : undefined}
                          placeholder="e.g. Supreme Student Council"
                          value={userOrgOrDept}
                          onChange={(e) => setUserOrgOrDept(e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.userOrgOrDept ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.userOrgOrDept && (
                          <p id="auth-user-reg-org-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.userOrgOrDept}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="auth-user-reg-pass" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Password <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={userPassRef}
                          id="auth-user-reg-pass"
                          type={showPassword ? 'text' : 'password'}
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.userPassword ? 'true' : 'false'}
                          aria-describedby={fieldErrors.userPassword ? 'auth-user-reg-pass-err' : undefined}
                          placeholder="Min 6 chars"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.userPassword ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.userPassword && (
                          <p id="auth-user-reg-pass-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.userPassword}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="auth-user-reg-confirm" className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Confirm Password <span className="text-red-700" aria-hidden="true">*</span>
                        </label>
                        <input
                          ref={userConfirmRef}
                          id="auth-user-reg-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          aria-required="true"
                          aria-invalid={fieldErrors.userConfirmPassword ? 'true' : 'false'}
                          aria-describedby={fieldErrors.userConfirmPassword ? 'auth-user-reg-confirm-err' : undefined}
                          placeholder="Confirm"
                          value={userConfirmPassword}
                          onChange={(e) => setUserConfirmPassword(e.target.value)}
                          className={`w-full px-2.5 py-1.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                            fieldErrors.userConfirmPassword ? 'border-red-500' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.userConfirmPassword && (
                          <p id="auth-user-reg-confirm-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-0.5">
                            {fieldErrors.userConfirmPassword}
                          </p>
                        )}
                      </div>
                    </div>

                    <PrivacyFormConsent
                      idPrefix="auth-user-reg"
                      compact={true}
                      purpose="Create and verify your campus user account for facility booking and permit tracking."
                      recipients="Your selected institution's facility administrators and assigned custodians."
                      retention={BUSINESS_CONFIG.retentionPeriods.accountProfiles}
                      requiredConsentText={USER_REG_CONSENT_TEXT}
                      agreed={userPrivacyAgreed}
                      onAgreedChange={setUserPrivacyAgreed}
                      agreedError={fieldErrors.userPrivacyAgreed}
                      includeMarketing={true}
                      marketingOptIn={userMarketingOptIn}
                      onMarketingChange={setUserMarketingOptIn}
                    />

                    <button
                      type="submit"
                      disabled={isSelectedInstInactive}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Create End-User Account</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </form>
                )}
              </div>

              {/* Already Registered Link */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => handleToggleTab(false)}
                  className="font-bold text-purple-700 hover:underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* THE SLIDING OVERLAY PANEL (DESKTOP)                         */}
            {/* ----------------------------------------------------------- */}
            <div
              className={`hidden lg:flex absolute top-0 left-1/2 w-1/2 h-full z-20 text-white overflow-hidden transition-transform duration-700 ease-in-out ${
                isRegistering ? '-translate-x-full' : 'translate-x-0'
              }`}
            >
              <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-10 flex flex-col justify-between relative">
                {/* Decorative glow / backdrop shapes */}
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"></div>

                <div className="space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                    <span>{audience === 'institution' ? 'Higher Education Governance' : 'Campus Reservation Platform'}</span>
                  </div>

                  <h2 className="text-2xl font-black text-white leading-tight">
                    {isRegistering
                      ? 'Already Registered on SmartSpace?'
                      : audience === 'institution'
                      ? 'Need an Institutional Workspace for Your University?'
                      : 'New to SmartSpace Campus Booking?'}
                  </h2>

                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    {isRegistering
                      ? 'Sign in to access your authorized university dashboard, live reservation status, and conflict-free booking tools.'
                      : audience === 'institution'
                      ? 'Register your institution to centralize campus buildings, lecture halls, and facilities with automated conflict detection and approval tracking.'
                      : 'Create an account to browse lecture halls, conference spaces, and activity venues across participating Cebu City campuses.'}
                  </p>

                  <div className="pt-2 space-y-2 text-xs text-purple-200/80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Dedicated role-based security boundaries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Paperless requests & verifiable digital permits</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleTab(!isRegistering)}
                    className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>
                      {isRegistering
                        ? 'Sign In to Existing Account'
                        : audience === 'institution'
                        ? 'Register Your Institution'
                        : 'Create New Account'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ----------------------------------------------------------- */
          /* CASE 3: SUPER ADMIN ACCESS (RESTRICTED PLATFORM CONSOLE)    */
          /* ----------------------------------------------------------- */
          <div className="w-full h-full p-8 sm:p-12 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white">
            <div className="max-w-md mx-auto w-full space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/30 shadow-lg">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  SmartSpace Platform Super Admin
                </h3>
                <p className="text-xs text-indigo-200/80 max-w-sm mx-auto">
                  Platform administration console for managing multi-university tenant accounts, reviewing institutional registrations, and authorizing facility coordinators.
                </p>
              </div>

              {/* Strict Security Notice */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">
                  <strong>Restricted Access:</strong> Unrestricted registration is disabled for platform security. Authorized platform engineers only. University facility staff must use the University Admin portal.
                </span>
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form noValidate onSubmit={handleSuperAdminLogin} className="space-y-4">
                <div>
                  <label htmlFor="auth-super-email" className="block text-xs font-semibold text-indigo-200 mb-1">
                    Super Admin Identity (Email) <span className="text-red-300" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={superEmailRef}
                      id="auth-super-email"
                      type="email"
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.superEmail ? 'true' : 'false'}
                      aria-describedby={fieldErrors.superEmail ? 'auth-super-email-err' : undefined}
                      value={superAdminEmail}
                      onChange={(e) => setSuperAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {fieldErrors.superEmail && (
                    <p id="auth-super-email-err" role="alert" className="text-[11px] font-semibold text-red-300 mt-1">
                      {fieldErrors.superEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="auth-super-password" className="block text-xs font-semibold text-indigo-200 mb-1">
                    Platform Master Password <span className="text-red-300" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                    <input
                      ref={superPassRef}
                      id="auth-super-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.superPassword ? 'true' : 'false'}
                      aria-describedby={fieldErrors.superPassword ? 'auth-super-pass-err' : undefined}
                      value={superAdminPassword}
                      onChange={(e) => setSuperAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.superPassword && (
                    <p id="auth-super-pass-err" role="alert" className="text-[11px] font-semibold text-red-300 mt-1">
                      {fieldErrors.superPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Authenticate to Platform Operations</span>
                </button>
              </form>
            </div>

            <div className="text-center pt-4 border-t border-slate-800 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => handleSwitchAudience('selection')}
                className="hover:text-white underline cursor-pointer"
              >
                Return to Audience Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setForgotPasswordOpen(false);
              setForgotPasswordError(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-forgot-pw-title"
            className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="text-center space-y-1">
              <h3 id="auth-forgot-pw-title" className="text-lg font-bold text-slate-900">
                Institutional Credential Assistance
              </h3>
              <p className="text-xs text-slate-600">
                Enter your registered institutional email to receive password recovery instructions or contact campus administration.
              </p>
            </div>

            {forgotPasswordSuccess ? (
              <div role="status" className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" aria-hidden="true" />
                <p>
                  Instructions have been logged for <strong>{forgotPasswordEmail}</strong>. Please check your institutional inbox or contact campus administration.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotPasswordSuccess(false);
                    setForgotPasswordError(null);
                  }}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotPasswordEmail.trim() || !forgotPasswordEmail.includes('@') || !forgotPasswordEmail.includes('.')) {
                    setForgotPasswordError('Please enter a valid institutional email address.');
                    forgotEmailRef.current?.focus();
                    return;
                  }
                  setForgotPasswordError(null);
                  setForgotPasswordSuccess(true);
                }}
                className="space-y-3"
              >
                <div>
                  <label htmlFor="auth-forgot-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Institutional Email <span className="text-red-700" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={forgotEmailRef}
                    id="auth-forgot-email"
                    type="email"
                    required
                    aria-required="true"
                    aria-invalid={forgotPasswordError ? 'true' : 'false'}
                    aria-describedby={forgotPasswordError ? 'auth-forgot-email-err' : undefined}
                    placeholder="name@university.edu.ph"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white ${
                      forgotPasswordError ? 'border-red-500' : 'border-slate-200'
                    }`}
                  />
                  {forgotPasswordError && (
                    <p id="auth-forgot-email-err" role="alert" className="text-[11px] font-semibold text-red-700 mt-1">
                      {forgotPasswordError}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordOpen(false);
                      setForgotPasswordError(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Send Recovery Instructions
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
