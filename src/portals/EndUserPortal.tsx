import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { FacilityDirectory } from '../components/FacilityDirectory';
import { BookingForm } from '../components/BookingForm';
import { MyBookingsView } from '../components/MyBookingsView';
import { 
  Building2, 
  CalendarCheck, 
  Clock, 
  User, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  PlusCircle,
  HelpCircle,
  Compass,
  FileCheck2,
  Calendar
} from 'lucide-react';

interface EndUserPortalProps {
  initialSubRoute?: 'login' | 'register' | 'dashboard';
}

export const EndUserPortal: React.FC<EndUserPortalProps> = ({ initialSubRoute = 'dashboard' }) => {
  const { navigate, currentPath } = useRouter();
  const {
    currentUser,
    isLoggedIn,
    currentRole,
    loginWithCredentials,
    registerUserAccount,
    logout,
    currentInstitution,
    allInstitutions,
    setInstitutionId,
    institutionFacilities,
    userBookings,
    activeView,
    setActiveView,
    platformSettings,
  } = useApp();

  // Internal dashboard sub-view
  const [activeTab, setActiveTab] = useState<'directory' | 'new-booking' | 'my-reservations' | 'profile'>('directory');

  // Synchronize internal tab when external components call setActiveView
  React.useEffect(() => {
    if (activeView === 'facilities') setActiveTab('directory');
    else if (activeView === 'new-booking') setActiveTab('new-booking');
    else if (activeView === 'my-bookings') setActiveTab('my-reservations');
  }, [activeView]);

  // Form states for login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form states for registration
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [selectedInstId, setSelectedInstId] = useState(allInstitutions[0]?.id || 'ctu-main');
  const [userType, setUserType] = useState<
    'Student Organization Officer' | 'Faculty Member' | 'Department Representative' | 'Campus Office Representative' | 'Other Authorized User'
  >('Student Organization Officer');
  const [orgOrDept, setOrgOrDept] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  // Forgot password modal
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  // Determine view based on URL route
  const isLoginPage = currentPath === '/user/login';
  const isRegisterPage = currentPath === '/user/register';
  const isDashboardPage = currentPath === '/user/dashboard';

  // -------------------------------------------------------------
  // 1. LOGIN PAGE (/user/login)
  // -------------------------------------------------------------
  if (isLoginPage) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      const res = loginWithCredentials(loginEmail, loginPassword, 'user');
      if (res.success) {
        navigate('/user/dashboard');
      } else {
        setLoginError(res.error || 'Invalid credentials.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="cursor-pointer hover:opacity-95">
              <SmartSpaceLogo size={34} showTagline={true} />
            </button>
            <button
              onClick={() => navigate('/access')}
              className="text-xs font-semibold text-slate-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Access Gateway</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                End-User Sign In
              </h1>
              <p className="text-xs text-slate-500">
                Sign in to check facility availability and submit reservation requests for your organization.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@university.edu.ph"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Log In to User Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center space-y-2 text-xs text-slate-500">
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/user/register')}
                  className="font-bold text-indigo-700 hover:underline cursor-pointer"
                >
                  Create End-User Account
                </button>
              </p>
              <p>
                Representing a university administration?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/university/login')}
                  className="text-purple-700 font-semibold hover:underline cursor-pointer"
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
    const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRegError(null);

      if (regPassword.length < 6) {
        setRegError('Password must be at least 6 characters long.');
        return;
      }
      if (regPassword !== regConfirmPassword) {
        setRegError('Passwords do not match.');
        return;
      }

      const res = registerUserAccount({
        fullName,
        email: regEmail,
        institutionId: selectedInstId,
        userType,
        organizationOrDept: orgOrDept,
        password: regPassword,
      });

      if (res.success) {
        navigate('/user/dashboard');
      } else {
        setRegError(res.error || 'Failed to create account.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="cursor-pointer hover:opacity-95">
              <SmartSpaceLogo size={34} showTagline={true} />
            </button>
            <button
              onClick={() => navigate('/access')}
              className="text-xs font-semibold text-slate-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Access Gateway</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Create End-User Account
              </h1>
              <p className="text-xs text-slate-500">
                Register under an active SmartSpace university to book facilities and manage student org permits.
              </p>
            </div>

            {regError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institutional Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. juan.delacruz@ctu.edu.ph"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  University / Institution *
                </label>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                >
                  {allInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.shortName}) — {inst.status === 'active' ? 'Active' : 'Pending'}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Users can only register under active institutions. If your university is not registered, your administrator must register first.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white cursor-pointer"
                  >
                    <option value="Student Organization Officer">Student Organization Officer</option>
                    <option value="Faculty Member">Faculty Member</option>
                    <option value="Department Representative">Department Representative</option>
                    <option value="Campus Office Representative">Campus Office Representative</option>
                    <option value="Other Authorized User">Other Authorized User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization / Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Supreme Student Council"
                    value={orgOrDept}
                    onChange={(e) => setOrgOrDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Register End-User Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/user/login')}
                className="font-bold text-indigo-700 hover:underline cursor-pointer"
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
  // 3. END-USER DASHBOARD (/user/dashboard)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-purple-100 selection:text-purple-900">
      {/* End-User Dedicated Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand & Institution Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('directory')}
                className="cursor-pointer hover:opacity-95 text-left"
              >
                <SmartSpaceLogo size={32} showTagline={false} />
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    My University Campus
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {currentInstitution.name} ({currentInstitution.shortName})
                  </span>
                </div>
              </div>
            </div>

            {/* Center: End-User Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Facility Directory
              </button>
              <button
                onClick={() => setActiveTab('new-booking')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'new-booking'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Book Space
              </button>
              <button
                onClick={() => setActiveTab('my-reservations')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'my-reservations'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>My Reservations</span>
                {userBookings.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded-full">
                    {userBookings.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Profile
              </button>
            </nav>

            {/* Right: User Identity & Log Out */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900">
                  {currentUser?.name || 'Authorized Requester'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                  {currentUser?.organization || 'Student Council'}
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/access');
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Log Out from End-User Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {platformSettings.announcementActive && platformSettings.globalAnnouncement && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white px-4 py-2.5 text-xs flex items-center justify-center gap-2 border-b border-purple-700/50 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
          <span className="font-semibold text-purple-100">{platformSettings.globalAnnouncement}</span>
        </div>
      )}

      {/* Main End-User Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {activeTab === 'directory' && <FacilityDirectory />}
        {activeTab === 'new-booking' && <BookingForm />}
        {activeTab === 'my-reservations' && <MyBookingsView />}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shadow-inner">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">
                  {currentUser?.name || 'End-User Account'}
                </h2>
                <p className="text-xs text-slate-500">
                  {currentUser?.email || 'user@university.edu.ph'} · {currentUser?.role === 'faculty' ? 'Faculty Member' : 'Student Requester'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Active Institution:</span>
                <span className="font-bold text-slate-900">{currentInstitution.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Organization / Dept:</span>
                <span className="font-bold text-slate-900">{currentUser?.organization || 'Supreme Student Council'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-semibold">Total Bookings Submitted:</span>
                <span className="font-bold text-indigo-700">{userBookings.length} Requests</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-semibold">Account Status:</span>
                <span className="font-bold text-emerald-600">Active & Verified</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setActiveTab('new-booking')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs cursor-pointer text-center min-h-[44px]"
              >
                Submit New Reservation
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/access');
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer min-h-[44px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (High Usability on iPhone / Android) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'directory' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px]">Facilities</span>
        </button>

        <button
          onClick={() => setActiveTab('new-booking')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'new-booking' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span className="text-[10px]">Book Space</span>
        </button>

        <button
          onClick={() => setActiveTab('my-reservations')}
          className={`relative flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'my-reservations' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">My Bookings</span>
          {userBookings.length > 0 && (
            <span className="absolute 1 right-2 px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] font-black rounded-full">
              {userBookings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'profile' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>

      {/* End-User Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>
            SmartSpace End-User Workspace · Institution: <strong>{currentInstitution.name}</strong>
          </p>
          <p className="text-slate-400">
            Dedicated portal for student organizations, faculty & authorized campus offices.
          </p>
        </div>
      </footer>
    </div>
  );
};
