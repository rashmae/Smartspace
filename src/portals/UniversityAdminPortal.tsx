import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext';
import { useApp } from '../context/AppContext';
import SmartSpaceLogo from '../components/SmartSpaceLogo';
import { AdminRequestsView } from '../components/AdminRequestsView';
import { AdminFacilitiesView } from '../components/AdminFacilitiesView';
import { AdminRecordsView } from '../components/AdminRecordsView';
import { UtilizationReportsView } from '../components/UtilizationReportsView';
import { 
  Building2, 
  ShieldCheck, 
  Clock, 
  CalendarCheck2, 
  Layers, 
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
  PlusCircle,
  Settings,
  Users,
  Info,
  Sparkles
} from 'lucide-react';

interface UniversityAdminPortalProps {
  initialSubRoute?: 'login' | 'register' | 'dashboard';
}

export const UniversityAdminPortal: React.FC<UniversityAdminPortalProps> = ({ initialSubRoute = 'dashboard' }) => {
  const { navigate, currentPath } = useRouter();
  const {
    currentUser,
    isLoggedIn,
    currentRole,
    loginWithCredentials,
    submitInstitutionalRegistration,
    logout,
    currentInstitution,
    institutionFacilities,
    institutionBookings,
    registeredUsers,
    activeView,
    setActiveView,
    platformSettings,
  } = useApp();

  // Internal dashboard tab
  const [activeTab, setActiveTab] = useState<'requests' | 'facilities' | 'records' | 'reports' | 'settings'>('requests');

  // Synchronize internal tab when external components call setActiveView
  React.useEffect(() => {
    if (activeView === 'admin-requests') setActiveTab('requests');
    else if (activeView === 'admin-facilities') setActiveTab('facilities');
    else if (activeView === 'admin-records') setActiveTab('records');
    else if (activeView === 'reports') setActiveTab('reports');
  }, [activeView]);

  // Form states for login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form states for institutional registration
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState<'Public University' | 'Private University' | 'College' | 'Other'>('Public University');
  const [instEmail, setInstEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [instPassword, setInstPassword] = useState('');
  const [instConfirmPassword, setInstConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const pendingCount = institutionBookings.filter((b) => b.status === 'pending').length;
  const approvedCount = institutionBookings.filter((b) => b.status === 'approved').length;

  const isLoginPage = currentPath === '/university/login';
  const isRegisterPage = currentPath === '/university/register';
  const isDashboardPage = currentPath === '/university/dashboard';

  // -------------------------------------------------------------
  // 1. UNIVERSITY ADMIN LOGIN (/university/login)
  // -------------------------------------------------------------
  if (isLoginPage) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);

      const res = loginWithCredentials(loginEmail, loginPassword, 'institution');
      if (res.success) {
        navigate('/university/dashboard');
      } else {
        setLoginError(res.error || 'Invalid university administrator credentials.');
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
              className="text-xs font-semibold text-slate-600 hover:text-[#0077C8] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Access Gateway</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0077C8] flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                University Admin Login
              </h1>
              <p className="text-xs text-slate-500">
                Sign in to manage your university's facility catalog, review pending reservations, and inspect utilization reports.
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
                  Official Institutional Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="admin.facilities@ctu.edu.ph"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
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
                className="w-full py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Enter University Management Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

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
                  className="text-indigo-700 font-semibold hover:underline cursor-pointer"
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
    const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setRegError(null);
      setPendingNotice(null);

      if (instPassword.length < 6) {
        setRegError('Password must be at least 6 characters long.');
        return;
      }
      if (instPassword !== instConfirmPassword) {
        setRegError('Passwords do not match.');
        return;
      }

      const res = submitInstitutionalRegistration({
        institutionName: instName,
        institutionType: instType,
        officialEmail: instEmail,
        contactPerson,
        contactNumber,
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
      } else {
        setRegError(res.error || 'Failed to submit registration.');
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
              className="text-xs font-semibold text-slate-600 hover:text-[#0077C8] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Access Gateway</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0077C8] flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Register Your Institution
              </h1>
              <p className="text-xs text-slate-500">
                Institutional onboarding application. Registration enters a pending review status for platform administrator authorization.
              </p>
            </div>

            {regError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {pendingNotice && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-slate-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <CheckCircle2 className="w-5 h-5 text-[#0077C8] shrink-0" />
                  <span>Onboarding Application Logged (Pending Status)</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  {pendingNotice}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/university/login')}
                    className="w-full py-2 px-3 rounded-xl bg-[#0077C8] text-white font-bold text-xs"
                  >
                    Return to University Login
                  </button>
                </div>
              </div>
            )}

            {!pendingNotice && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cebu State College"
                      value={instName}
                      onChange={(e) => setInstName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Institution Type *
                    </label>
                    <select
                      value={instType}
                      onChange={(e) => setInstType(e.target.value as any)}
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. facilities.office@university.edu.ph"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engr. David Reyes"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+63 (32) 234-5678"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Administrator Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 characters"
                      value={instPassword}
                      onChange={(e) => setInstPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
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
                      value={instConfirmPassword}
                      onChange={(e) => setInstConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0077C8] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                  <strong>Governance Policy:</strong> Submitting this registration does not automatically grant admin privileges. A Super Admin must authorize your institutional status before workspace activation.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Submit Institutional Registration</span>
                  <ArrowRight className="w-4 h-4" />
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
  // 3. UNIVERSITY ADMIN DASHBOARD (/university/dashboard)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* University Admin Dedicated Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand & Admin Institution */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('requests')}
                className="cursor-pointer hover:opacity-95 text-left"
              >
                <SmartSpaceLogo size={32} showTagline={false} />
              </button>

              <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
                <Building2 className="w-4 h-4 text-[#0077C8] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0077C8]">
                    Institutional Management
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {currentInstitution.name} ({currentInstitution.shortName})
                  </span>
                </div>
              </div>
            </div>

            {/* Center: University Admin Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'bg-[#0077C8] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Pending Requests</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('facilities')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'facilities'
                    ? 'bg-[#0077C8] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Facilities Inventory
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-[#0077C8] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reservation Records
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'reports'
                    ? 'bg-[#0077C8] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Utilization Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#0077C8] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Settings
              </button>
            </nav>

            {/* Right: Admin Identity & Log Out */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900">
                  {currentUser?.name || currentInstitution.assignedAdminName || 'University Facility Admin'}
                </span>
                <span className="text-[10px] text-[#0077C8] font-semibold truncate max-w-[160px]">
                  Physical Plant Administrator
                </span>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/access');
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Log Out from University Admin Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {platformSettings.announcementActive && platformSettings.globalAnnouncement && (
        <div className="bg-gradient-to-r from-[#0B1528] via-[#0F1E36] to-[#0B1528] text-white px-4 py-2.5 text-xs flex items-center justify-center gap-2 border-b border-slate-800 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
          <span className="font-semibold text-blue-100">{platformSettings.globalAnnouncement}</span>
        </div>
      )}

      {/* Main Admin Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {activeTab === 'requests' && <AdminRequestsView />}
        {activeTab === 'facilities' && <AdminFacilitiesView />}
        {activeTab === 'records' && <AdminRecordsView />}
        {activeTab === 'reports' && <UtilizationReportsView />}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-[#0077C8] flex items-center justify-center font-black text-xl shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">
                  {currentInstitution.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Institution ID: <code className="font-mono text-[#0077C8]">{currentInstitution.id}</code> · Plan: <strong>{currentInstitution.subscriptionPlan || 'Standard'}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">
                Institutional Isolation & Security Configuration
              </h3>
              <p className="text-slate-600 leading-relaxed">
                As a University Facility Administrator, your credentials grant administrative rights strictly over <strong>{currentInstitution.name}</strong>. Access to other universities, student org rosters outside your campus, and SmartSpace Super Admin platform controls is strictly restricted.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Registered Spaces</span>
                  <p className="text-lg font-black text-slate-900">{institutionFacilities.length} Facilities</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Historical Bookings</span>
                  <p className="text-lg font-black text-[#0077C8]">{institutionBookings.length} Bookings</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned Physical Plant Signatory:</span>
                <p className="text-xs font-bold text-slate-800">{currentInstitution.assignedAdminName}</p>
                <p className="text-xs text-slate-500">{currentInstitution.assignedAdminEmail}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  logout();
                  navigate('/access');
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer min-h-[44px]"
              >
                Sign Out from Campus Console
              </button>
            </div>
          </div>
        )}
      </main>

      {/* University Admin Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1.5 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab('requests')}
          className={`relative flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'requests' ? 'text-[#0077C8] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Requests</span>
          {pendingCount > 0 && (
            <span className="absolute 1 right-2 px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'facilities' ? 'text-[#0077C8] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px]">Facilities</span>
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'records' ? 'text-[#0077C8] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px]">Records</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'reports' ? 'text-[#0077C8] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 p-1 rounded-xl cursor-pointer min-w-[56px] min-h-[44px] justify-center ${
            activeTab === 'settings' ? 'text-[#0077C8] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* University Admin Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>
            SmartSpace University Admin Console · Active Workspace: <strong>{currentInstitution.name}</strong>
          </p>
          <p className="text-slate-400">
            Strict multi-tenant security · Authorized facility administrators only.
          </p>
        </div>
      </footer>
    </div>
  );
};
