import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Phone,
  User,
  Briefcase,
  ChevronRight,
  ShieldAlert,
  Info
} from 'lucide-react';

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
    loginAs,
    setInstitutionId,
  } = useApp();

  const { audience, tab, highlight } = authFlowState;

  // Form states
  const [isRegistering, setIsRegistering] = useState<boolean>(tab === 'register');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Common errors / loading
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [pendingApprovalNotice, setPendingApprovalNotice] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

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

  // Super Admin state
  const [superAdminEmail, setSuperAdminEmail] = useState('superadmin@smartspace.ph');
  const [superAdminPassword, setSuperAdminPassword] = useState('••••••••');

  // Handle switching audience / tabs
  const handleSwitchAudience = (newAudience: 'selection' | 'institution' | 'user' | 'super_admin') => {
    setErrorMsg(null);
    setSuccessNotice(null);
    setPendingApprovalNotice(null);
    setAuthFlowState((prev) => ({ ...prev, audience: newAudience, tab: 'login' }));
    setIsRegistering(false);
  };

  const handleToggleTab = (toRegister: boolean) => {
    setErrorMsg(null);
    setSuccessNotice(null);
    setPendingApprovalNotice(null);
    setIsRegistering(toRegister);
    setAuthFlowState((prev) => ({ ...prev, tab: toRegister ? 'register' : 'login' }));
  };

  // Institutional Login Submission
  const handleInstitutionalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setPendingApprovalNotice(null);

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

    if (instRegPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (instRegPassword !== instRegConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    const res = submitInstitutionalRegistration({
      institutionName: instRegName,
      institutionType: instRegType,
      officialEmail: instRegEmail,
      contactPerson: instRegContactPerson,
      contactNumber: instRegContactNumber,
      password: instRegPassword,
    });

    if (res.success) {
      setPendingApprovalNotice(res.message);
      // Reset form
      setInstRegName('');
      setInstRegEmail('');
      setInstRegContactPerson('');
      setInstRegContactNumber('');
      setInstRegPassword('');
      setInstRegConfirmPassword('');
    } else {
      setErrorMsg(res.error || 'Failed to submit registration.');
    }
  };

  // User Login Submission
  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = loginWithCredentials(userLoginEmail, userLoginPassword, 'user');
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  // User Registration Submission
  const handleUserRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (userPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (userPassword !== userConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

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

    const res = loginWithCredentials(superAdminEmail, superAdminPassword, 'super_admin');
    if (!res.success) {
      setErrorMsg(res.error || 'Super admin authentication failed.');
    }
  };

  // Selected institution active status check
  const selectedInstObj = allInstitutions.find((i) => i.id === userInstitutionId);
  const isSelectedInstInactive = selectedInstObj && selectedInstObj.status !== 'active';

  // Demo auto-fill helper
  const handleFillDemoCreds = (type: 'ctu-admin' | 'usc-admin' | 'student' | 'faculty' | 'super') => {
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
    } else if (type === 'super') {
      setSuperAdminEmail('superadmin@smartspace.ph');
      setSuperAdminPassword('demo1234');
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

      {/* Main 850px x 550px Animated Container */}
      <div 
        className="relative bg-white mx-4 rounded-[30px] shadow-[0_0_30px_rgba(0,0,0,0.18)] overflow-hidden w-full max-w-[850px] min-h-[580px] lg:h-[550px] border border-slate-200 transition-all duration-500"
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

                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {pendingApprovalNotice && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{pendingApprovalNotice}</span>
                  </div>
                )}

                {/* The Login Form */}
                <form
                  onSubmit={audience === 'institution' ? handleInstitutionalLogin : handleUserLogin}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institutional Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder={
                          audience === 'institution'
                            ? 'admin.facilities@ctu.edu.ph'
                            : 'juan.delacruz@ctu.edu.ph'
                        }
                        value={audience === 'institution' ? instLoginEmail : userLoginEmail}
                        onChange={(e) =>
                          audience === 'institution'
                            ? setInstLoginEmail(e.target.value)
                            : setUserLoginEmail(e.target.value)
                        }
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={audience === 'institution' ? instLoginPassword : userLoginPassword}
                        onChange={(e) =>
                          audience === 'institution'
                            ? setInstLoginPassword(e.target.value)
                            : setUserLoginPassword(e.target.value)
                        }
                        className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>{audience === 'institution' ? 'Log In as University Admin' : 'Sign In to Campus Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Authorized Credentials Quick Fill */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Fill Authorized Credentials:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {audience === 'institution' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('ctu-admin')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Auto-fill CTU Admin (Engr. Santos)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('usc-admin')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Auto-fill USC Admin (Arch. Tan)
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('student')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Auto-fill Student (Juan Dela Cruz)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCreds('faculty')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                      >
                        Auto-fill Faculty (Dr. Fernandez)
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

                {errorMsg && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {pendingApprovalNotice && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-purple-950">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Registration Pending Authorization</span>
                    </div>
                    <p className="text-[11px] text-purple-800 leading-relaxed">
                      {pendingApprovalNotice}
                    </p>
                  </div>
                )}

                {/* FORM A: INSTITUTIONAL REGISTRATION */}
                {audience === 'institution' ? (
                  <form onSubmit={handleInstitutionalRegistration} className="space-y-2.5">
                    {/* Institution Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Institution Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cebu Institute of Technology - University"
                        value={instRegName}
                        onChange={(e) => setInstRegName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                      />
                    </div>

                    {/* Institution Type */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Institution Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={instRegType}
                          onChange={(e) => setInstRegType(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                        >
                          <option value="Public University">Public University</option>
                          <option value="Private University">Private University</option>
                          <option value="College">College</option>
                          <option value="Other">Other Higher Ed</option>
                        </select>
                      </div>

                      {/* Official Email */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Official Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="admin@univ.edu.ph"
                          value={instRegEmail}
                          onChange={(e) => setInstRegEmail(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Contact Person & Number */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Contact Person <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Dr. / Engr. Full Name"
                          value={instRegContactPerson}
                          onChange={(e) => setInstRegContactPerson(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Contact Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+63 (32) 234-5678"
                          value={instRegContactNumber}
                          onChange={(e) => setInstRegContactNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Admin Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 chars"
                          value={instRegPassword}
                          onChange={(e) => setInstRegPassword(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm"
                          value={instRegConfirmPassword}
                          onChange={(e) => setInstRegConfirmPassword(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Submit Institutional Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  /* FORM B: USER REGISTRATION */
                  <form onSubmit={handleUserRegistration} className="space-y-2">
                    {/* Full Name & Institutional Email */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Juan Dela Cruz"
                          value={userFullName}
                          onChange={(e) => setUserFullName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Institutional Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@ctu.edu.ph"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* University / Institution Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        University / Institution <span className="text-red-500">*</span>
                      </label>
                      <select
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
                        <p className="text-[10px] text-amber-700 mt-1 font-semibold">
                          ⚠️ This institution has not yet been activated on SmartSpace. Registration is unavailable.
                        </p>
                      )}
                    </div>

                    {/* User Type & Org Name */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          User Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={userType}
                          onChange={(e) => setUserType(e.target.value as any)}
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
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Organization / Dept <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Supreme Student Council"
                          value={userOrgOrDept}
                          onChange={(e) => setUserOrgOrDept(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Min 6 chars"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm"
                          value={userConfirmPassword}
                          onChange={(e) => setUserConfirmPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSelectedInstInactive}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-800 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <span>Create End-User Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSuperAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-indigo-200 mb-1">
                    Super Admin Identity (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={superAdminEmail}
                      onChange={(e) => setSuperAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-200 mb-1">
                    Platform Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={superAdminPassword}
                      onChange={(e) => setSuperAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate to Platform Operations</span>
                </button>
              </form>
            </div>

            <div className="text-center pt-4 border-t border-slate-800 text-xs text-slate-400">
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Institutional Credential Assistance
              </h3>
              <p className="text-xs text-slate-500">
                Enter your registered institutional email to receive password recovery instructions or contact campus administration.
              </p>
            </div>

            {forgotPasswordSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p>
                  Instructions have been dispatched to <strong>{forgotPasswordEmail}</strong>. Please check your institutional inbox or spam filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setForgotPasswordSuccess(false);
                  }}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu.ph"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!forgotPasswordEmail.trim() || !forgotPasswordEmail.includes('@')) {
                        alert('Please enter a valid institutional email address.');
                        return;
                      }
                      setForgotPasswordSuccess(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Send Recovery Instructions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
