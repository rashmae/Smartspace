import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Institution, UserRole, LoginSecurityEvent } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  PlusCircle, 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  ExternalLink, 
  Settings, 
  Mail, 
  MapPin, 
  Sparkles,
  BarChart3,
  Server,
  Activity,
  Layers,
  ArrowRight,
  X,
  FileCheck2,
  CalendarCheck2,
  ShieldAlert,
  Globe,
  Lock,
  UserCheck,
  UserX,
  Palette,
  Bell,
  Sliders,
  Check,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  Bot,
  Send,
  Cpu
} from 'lucide-react';
import { formatDateTime12Hour, formatTimeOnly12Hour } from '../utils/timeFormat';
import { AIWorkflowBuilderPanel } from './AIWorkflowBuilderPanel';

export const SuperAdminView: React.FC = () => {
  const { 
    allInstitutions, 
    addInstitution, 
    updateInstitution, 
    setInstitutionId, 
    setCurrentRole, 
    setActiveView, 
    allFacilities, 
    allBookings,
    addToast,
    institutionalRegistrations,
    approveInstitutionalRegistration,
    rejectInstitutionalRegistration,
    demoRequests,
    registeredUsers,
    updateUserAccountStatus,
    updateUserAccountRole,
    platformSettings,
    updatePlatformSettings,
    aiAutomationJobs,
    emailDeliveryRecords,
    approveAIJob,
    retryAIJob,
    retryEmailDelivery,
    triggerManualAIAnalysis,
    runConciergeForDemo,
  } = useApp();

  const [adminSection, setAdminSection] = useState<
    'institutions' | 'pending-registrations' | 'demo-inquiries' | 'login-security' | 'user-management' | 'platform-settings' | 'ai-automation'
  >('institutions');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [editingInst, setEditingInst] = useState<Institution | null>(null);

  // Security Monitoring state
  const [securityActivities, setSecurityActivities] = useState<LoginSecurityEvent[]>([]);
  const [securityFilterRole, setSecurityFilterRole] = useState<string>('all');
  const [securityFilterStatus, setSecurityFilterStatus] = useState<string>('all');
  const [securitySearch, setSecuritySearch] = useState<string>('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySummary, setSecuritySummary] = useState({
    authorizedAccountsCount: 4,
    activeSessionsCount: 2,
    enforcementMode: 'STRICT_SERVER_ALLOWLIST',
    auditEntriesCount: 18,
    securityEventsCount: 5,
  });

  // User Management state
  const [userSearch, setUserSearch] = useState('');
  const [userInstFilter, setUserInstFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Form states for adding a university
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [campus, setCampus] = useState('');
  const [city, setCity] = useState('Cebu City');
  const [instType, setInstType] = useState<'Public' | 'Private'>('Private');
  const [plan, setPlan] = useState<'Pilot' | 'Standard' | 'Enterprise'>('Standard');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [allowExternal, setAllowExternal] = useState(true);
  const [policy, setPolicy] = useState<'internal_only' | 'external_allowed' | 'approval_required'>('approval_required');

  // Platform Customization Form state
  const [customPlatformName, setCustomPlatformName] = useState(platformSettings.platformName);
  const [customTagline, setCustomTagline] = useState(platformSettings.platformTagline);
  const [customAnnouncement, setCustomAnnouncement] = useState(platformSettings.globalAnnouncement);
  const [customAllowCrossUniv, setCustomAllowCrossUniv] = useState(platformSettings.allowCrossUniversityDiscovery);
  const [customMaxAdvanceDays, setCustomMaxAdvanceDays] = useState(platformSettings.defaultAdvanceBookingDays);
  const [customAutoConflict, setCustomAutoConflict] = useState(platformSettings.autoConflictDetection);

  // Platform metrics
  const totalUniversities = allInstitutions.length;
  const totalFacilities = allFacilities.length;
  const totalBookingsCount = allBookings.length;
  const approvedBookingsCount = allBookings.filter((b) => b.status === 'approved').length;

  // Fetch security activities from server and merge with local audit cache
  const fetchSecurityActivities = async () => {
    setSecurityLoading(true);
    try {
      const [resActs, resStat] = await Promise.all([
        fetch('/api/superadmin/login-activities').catch(() => null),
        fetch('/api/superadmin/security-status').catch(() => null),
      ]);

      let serverActivities: LoginSecurityEvent[] = [];
      if (resActs && resActs.ok) {
        const data = await resActs.json();
        if (data.activities && Array.isArray(data.activities)) {
          serverActivities = data.activities;
        }
      }

      // Read locally recorded events from browser audit cache
      let localActivities: LoginSecurityEvent[] = [];
      try {
        const stored = localStorage.getItem('smartspace_security_activities_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) localActivities = parsed;
        }
      } catch (e) {
        console.warn('Local audit cache parse error:', e);
      }

      // Combine and deduplicate
      const seen = new Set<string>();
      const deduplicated: LoginSecurityEvent[] = [];

      // Local entries first (newest frontend actions), then server entries
      for (const act of [...localActivities, ...serverActivities]) {
        const key = act.id || `${act.accountEmail}-${act.timestamp}-${act.eventType}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(act);
        }
      }

      // Sort newest first
      deduplicated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setSecurityActivities(deduplicated);

      const liveSessions = deduplicated.filter((a) => a.sessionActive).length;

      if (resStat && resStat.ok) {
        const statData = await resStat.json();
        setSecuritySummary({
          ...statData,
          activeSessionsCount: Math.max(liveSessions, statData.activeSessionsCount || 1),
          securityEventsCount: deduplicated.length,
        });
      } else {
        setSecuritySummary((prev) => ({
          ...prev,
          activeSessionsCount: Math.max(1, liveSessions),
          securityEventsCount: deduplicated.length,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch security activities from server, using local fallback:', err);
    } finally {
      setSecurityLoading(false);
    }
  };

  useEffect(() => {
    if (adminSection === 'login-security') {
      fetchSecurityActivities();
    }
  }, [adminSection]);

  const handleRevokeSession = async (activityId: string) => {
    try {
      // 1. Call server API
      const res = await fetch('/api/superadmin/revoke-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId }),
      }).catch(() => null);

      // 2. Update local storage audit cache
      try {
        const stored = localStorage.getItem('smartspace_security_activities_v1');
        if (stored) {
          const list: LoginSecurityEvent[] = JSON.parse(stored);
          const updated = list.map((a) =>
            a.id === activityId ? { ...a, sessionActive: false, eventType: 'SESSION_REVOKED' as const } : a
          );
          localStorage.setItem('smartspace_security_activities_v1', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Failed to update local revoked session:', e);
      }

      // 3. Update active state immediately
      setSecurityActivities((prev) =>
        prev.map((a) =>
          a.id === activityId ? { ...a, sessionActive: false, eventType: 'SESSION_REVOKED' as const } : a
        )
      );

      addToast('success', 'Session Terminated', 'The user session was successfully revoked.');
    } catch {
      addToast('error', 'Revoke Failed', 'Network error while revoking session.');
    }
  };

  const filteredInstitutions = useMemo(() => {
    return allInstitutions.filter((inst) => {
      const matchesSearch = 
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.campus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.assignedAdminName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || inst.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [allInstitutions, searchQuery, filterType]);

  const filteredSecurityActivities = useMemo(() => {
    return securityActivities.filter((act) => {
      if (securityFilterRole !== 'all' && act.role !== securityFilterRole) return false;
      if (securityFilterStatus !== 'all' && act.status !== securityFilterStatus) return false;
      if (securitySearch.trim()) {
        const q = securitySearch.toLowerCase();
        return (
          act.accountEmail.toLowerCase().includes(q) ||
          act.ipAddress.includes(q) ||
          (act.institutionName && act.institutionName.toLowerCase().includes(q)) ||
          act.eventType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [securityActivities, securityFilterRole, securityFilterStatus, securitySearch]);

  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      if (userInstFilter !== 'all' && u.institutionId !== userInstFilter) return false;
      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        return (
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.organizationOrDept.toLowerCase().includes(q) ||
          u.userType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [registeredUsers, userInstFilter, userRoleFilter, userSearch]);

  const handleRegisterUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim() || !campus.trim()) {
      addToast('error', 'Missing Information', 'Please complete university name, code, and campus.');
      return;
    }

    addInstitution({
      name: name.trim(),
      shortName: shortName.trim().toUpperCase(),
      campus: campus.trim(),
      city: city.trim() || 'Cebu City',
      type: instType,
      isPilot: false,
      status: 'active',
      subscriptionPlan: plan,
      contactName: contactName.trim() || 'Institutional Representative',
      contactEmail: contactEmail.trim() || `contact@${shortName.toLowerCase().replace(/[^a-z]/g, '')}.edu.ph`,
      assignedAdminName: adminName.trim() || 'Facilities Coordinator',
      assignedAdminEmail: adminEmail.trim() || `facilities@${shortName.toLowerCase().replace(/[^a-z]/g, '')}.edu.ph`,
      statusNote: `${plan} Institutional Subscription · Active Workspace`,
      allowExternalBookings: allowExternal,
      bookingPolicy: policy,
      externalBookingNotice: allowExternal
        ? 'External reservations permitted subject to host dean / facility administrator approval.'
        : 'Internal Bookings Only: Reserved strictly for enrolled students and university personnel.',
    });

    // Reset form
    setName('');
    setShortName('');
    setCampus('');
    setContactName('');
    setContactEmail('');
    setAdminName('');
    setAdminEmail('');
    setShowAddModal(false);
  };

  const handleUpdateUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;

    updateInstitution(editingInst.id, {
      name: editingInst.name,
      shortName: editingInst.shortName,
      campus: editingInst.campus,
      type: editingInst.type,
      subscriptionPlan: editingInst.subscriptionPlan,
      status: editingInst.status,
      contactName: editingInst.contactName,
      contactEmail: editingInst.contactEmail,
      assignedAdminName: editingInst.assignedAdminName,
      assignedAdminEmail: editingInst.assignedAdminEmail,
      allowExternalBookings: editingInst.allowExternalBookings,
      bookingPolicy: editingInst.bookingPolicy,
      externalBookingNotice: editingInst.externalBookingNotice,
    });

    setEditingInst(null);
  };

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings({
      platformName: customPlatformName.trim() || 'SmartSpace',
      platformTagline: customTagline.trim(),
      globalAnnouncement: customAnnouncement.trim(),
      allowCrossUniversityDiscovery: customAllowCrossUniv,
      defaultAdvanceBookingDays: Number(customMaxAdvanceDays),
      autoConflictDetection: customAutoConflict,
    });
  };

  const handleSwitchToUniversity = (instId: string, roleToAssume: 'university_admin' | 'student') => {
    setInstitutionId(instId);
    setCurrentRole(roleToAssume);
    if (roleToAssume === 'university_admin') {
      setActiveView('admin-requests');
    } else {
      setActiveView('facilities');
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Super Admin Executive Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>SmartSpace Platform Super Administrator</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Institutional Network & Security Console
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Manage participating higher education institutions, audit real-time login security activities, configure user account roles, and enforce cross-university reservation governance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enroll University</span>
            </button>
            <div className="text-xs text-slate-400 flex items-center gap-2 pl-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Platform Multi-Tenant Network: Healthy · Firestore Cloud Storage: Connected</span>
            </div>
          </div>
        </div>

        {/* Backdrop Graphic */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Platform Network KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Subscribed Institutions</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalUniversities}</div>
          <p className="text-[11px] text-slate-500">Public & private universities</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Active Spaces</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalFacilities}</div>
          <p className="text-[11px] text-slate-500">Across all participating campuses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Bookings</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalBookingsCount}</div>
          <p className="text-[11px] text-slate-500">{approvedBookingsCount} confirmed permits</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Security State</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">Strict</div>
          <p className="text-[11px] text-slate-500">{securitySummary.activeSessionsCount} active sessions</p>
        </div>
      </div>

      {/* Super Admin Section Navigation Bar */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setAdminSection('institutions')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            adminSection === 'institutions'
              ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Universities ({allInstitutions.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('login-security')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            adminSection === 'login-security'
              ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4 text-indigo-600" />
          <span>Login Activity & Security</span>
        </button>

        <button
          onClick={() => setAdminSection('user-management')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            adminSection === 'user-management'
              ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>User & Role Governance ({registeredUsers.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('platform-settings')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            adminSection === 'platform-settings'
              ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Platform Customization</span>
        </button>

        <button
          onClick={() => setAdminSection('pending-registrations')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            adminSection === 'pending-registrations'
              ? 'border-purple-600 text-purple-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-purple-600" />
          <span>Registration Queue</span>
          {institutionalRegistrations.filter((r) => r.status === 'pending').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-black">
              {institutionalRegistrations.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminSection('demo-inquiries')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            adminSection === 'demo-inquiries'
              ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Demo Inquiries ({demoRequests.length})</span>
        </button>

        <button
          onClick={() => setAdminSection('ai-automation')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            adminSection === 'ai-automation'
              ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-600" />
          <span>AI Automation & Dispatch</span>
          {aiAutomationJobs.filter((j) => j.status === 'requires_human_approval').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {aiAutomationJobs.filter((j) => j.status === 'requires_human_approval').length} Review
            </span>
          )}
        </button>
      </div>


      {/* SECTION: LOGIN ACTIVITY & SECURITY MONITORING */}
      {adminSection === 'login-security' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                <span>Login Activity & Security Event Audit</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time monitoring of portal logins, authentication attempts, IP addresses, and active sessions.
              </p>
            </div>

            <button
              onClick={fetchSecurityActivities}
              disabled={securityLoading}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${securityLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {/* Security Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Security Architecture</span>
              <div className="text-sm font-bold text-slate-800">Server-Authoritative Allowlist</div>
              <p className="text-[11px] text-slate-500">Zero frontend exposure of privileged credentials.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Cloud Storage</span>
              <div className="text-sm font-bold text-indigo-700">Google Cloud Firestore</div>
              <p className="text-[11px] text-slate-500">Active real-time persistence and deployed rules.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Active User Sessions</span>
              <div className="text-sm font-bold text-emerald-600">
                {securitySummary.activeSessionsCount} Live Session(s)
              </div>
              <p className="text-[11px] text-slate-500">Across university admin and end-user portals.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Audit Trail Integrity</span>
              <div className="text-sm font-bold text-indigo-600">{securityActivities.length} Security Events</div>
              <p className="text-[11px] text-slate-500">Timestamped in standard 12-hour AM/PM format.</p>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by account email, IP address, or university..."
                value={securitySearch}
                onChange={(e) => setSecuritySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <select
              value={securityFilterRole}
              onChange={(e) => setSecurityFilterRole(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="university_admin">University Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>

            <select
              value={securityFilterStatus}
              onChange={(e) => setSecurityFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">Successful Login</option>
              <option value="failed">Failed Attempt</option>
            </select>
          </div>

          {/* Activity Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Account / Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">University / Campus</th>
                  <th className="py-3 px-4">Timestamp (12-Hour)</th>
                  <th className="py-3 px-4">Status & Event</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSecurityActivities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No security events matched the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSecurityActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {act.accountEmail}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {act.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {act.institutionName || 'Platform Root'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-800 font-medium">
                        {act.formattedDate} · <span className="font-bold text-indigo-700">{act.formattedTime}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {act.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {act.eventType}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            {act.eventType}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {act.ipAddress}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {act.sessionActive ? (
                          <button
                            onClick={() => handleRevokeSession(act.id)}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] border border-red-200 transition-colors cursor-pointer"
                          >
                            Revoke Session
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: USER & ROLE MANAGEMENT */}
      {adminSection === 'user-management' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>User & Role Governance</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Activate, suspend, or update institutional member accounts across all participating universities.
              </p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200">
              Total End Users: {registeredUsers.length}
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search user by name, email, department..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <select
              value={userInstFilter}
              onChange={(e) => setUserInstFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Universities</option>
              {allInstitutions.map((i) => (
                <option key={i.id} value={i.id}>{i.shortName} - {i.name}</option>
              ))}
            </select>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Student / Org Officer</option>
              <option value="faculty">Faculty Member</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Campus / Institution</th>
                  <th className="py-3 px-4">Department / Org</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No user accounts found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const inst = allInstitutions.find((i) => i.id === u.institutionId);
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {u.fullName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {inst ? inst.shortName : u.institutionId}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {u.organizationOrDept}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => updateUserAccountRole(u.id, e.target.value as UserRole)}
                            className="px-2 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {u.status === 'active' ? (
                            <button
                              onClick={() => updateUserAccountStatus(u.id, 'suspended')}
                              className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] border border-amber-200 transition-colors cursor-pointer"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => updateUserAccountStatus(u.id, 'active')}
                              className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                            >
                              Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: PLATFORM CUSTOMIZATION & SETTINGS */}
      {adminSection === 'platform-settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-6 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>Platform Customization & Scheduling Rules</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure platform identity, global announcement banners, and cross-university reservation rules.
            </p>
          </div>

          <form onSubmit={handleSavePlatformSettings} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Branding & Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="sa-platform-name" className="text-xs font-bold text-slate-700">Platform Name</label>
                  <input
                    id="sa-platform-name"
                    type="text"
                    value={customPlatformName}
                    onChange={(e) => setCustomPlatformName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="sa-platform-tagline" className="text-xs font-bold text-slate-700">Tagline / Motto</label>
                  <input
                    id="sa-platform-tagline"
                    type="text"
                    value={customTagline}
                    onChange={(e) => setCustomTagline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="sa-announcement-banner" className="text-xs font-bold text-slate-700">Global Announcement Banner</label>
                <textarea
                  id="sa-announcement-banner"
                  rows={2}
                  value={customAnnouncement}
                  onChange={(e) => setCustomAnnouncement(e.target.value)}
                  placeholder="Displayed across all user portals..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                2. Cross-University Booking Governance
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100">
                  <input
                    id="sa-allow-cross-univ"
                    type="checkbox"
                    checked={customAllowCrossUniv}
                    onChange={(e) => setCustomAllowCrossUniv(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-indigo-600 rounded shrink-0"
                  />
                  <label htmlFor="sa-allow-cross-univ" className="cursor-pointer flex-1 text-xs font-bold text-slate-800">
                    Enable Cross-University Facility Discovery
                    <span className="block text-[11px] font-normal text-slate-600 mt-0.5">
                      When enabled, End-Users can view participating university facilities across the platform network.
                    </span>
                  </label>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100">
                  <input
                    id="sa-auto-conflict"
                    type="checkbox"
                    checked={customAutoConflict}
                    onChange={(e) => setCustomAutoConflict(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-indigo-600 rounded shrink-0"
                  />
                  <label htmlFor="sa-auto-conflict" className="cursor-pointer flex-1 text-xs font-bold text-slate-800">
                    Automated Time Conflict Detection &amp; Overlap Blocking
                    <span className="block text-[11px] font-normal text-slate-600 mt-0.5">
                      Instantly prevents double-booking of facilities on identical dates and time intervals.
                    </span>
                  </label>
                </div>

                <div className="space-y-1 pt-1">
                  <label htmlFor="sa-advance-days" className="text-xs font-bold text-slate-700">Default Advance Reservation Window (Days)</label>
                  <input
                    id="sa-advance-days"
                    type="number"
                    min="1"
                    max="180"
                    value={customMaxAdvanceDays}
                    onChange={(e) => setCustomMaxAdvanceDays(Number(e.target.value))}
                    className="w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Platform Configurations
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION: PENDING INSTITUTIONAL REGISTRATIONS QUEUE */}
      {adminSection === 'pending-registrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Pending Institutional Onboarding Registrations</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                  {institutionalRegistrations.filter((r) => r.status === 'pending').length} Awaiting Authorization
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted institutional accounts. Platform administrator authorization is required before a university workspace is activated.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {institutionalRegistrations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No institutional registrations submitted yet.
              </div>
            ) : (
              institutionalRegistrations.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    req.status === 'pending'
                      ? 'border-purple-200 bg-purple-50/30'
                      : req.status === 'approved'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-red-200 bg-red-50/20 opacity-70'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {req.institutionName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {req.institutionType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          Status: {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Contact Person:</span>
                          <strong>{req.contactPerson}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Official Email:</span>
                          <span>{req.officialEmail}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Contact Number:</span>
                          <span>{req.contactNumber}</span>
                        </div>
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-100">
                          "{req.notes}"
                        </p>
                      )}

                      {req.rejectionReason && (
                        <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                          <strong>Rejection Justification:</strong> {req.rejectionReason}
                        </p>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => approveInstitutionalRegistration(req.id)}
                          className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Authorize & Activate Workspace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const reason = prompt('Please provide reason for declining this institutional registration:');
                            if (reason) rejectInstitutionalRegistration(req.id, reason);
                          }}
                          className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION: DEMO INQUIRIES QUEUE */}
      {adminSection === 'demo-inquiries' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Institutional Demonstration Inquiries</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                {demoRequests.length} Received
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Prospective universities requesting personalized platform presentations.
            </p>
          </div>

          <div className="space-y-3">
            {demoRequests.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{d.institutionName}</span>
                    {d.institutionType && (
                      <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-semibold">
                        {d.institutionType}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                      {d.estimatedFacilities}
                    </span>
                    {d.aiRecommendedTier && (
                      <span className="px-2 py-0.5 rounded bg-[#0077C8]/10 text-[#0077C8] text-[10px] font-bold border border-[#0077C8]/20">
                        {d.aiRecommendedTier}
                      </span>
                    )}
                    {d.aiLeadWarmth && (
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.aiLeadWarmth === 'Hot'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.aiLeadWarmth === 'Warm'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Lead: {d.aiLeadWarmth}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Submitted: {d.submittedAt}</span>
                    <button
                      type="button"
                      onClick={() => runConciergeForDemo(d.id)}
                      className="px-2.5 py-1 rounded-lg bg-[#0077C8] hover:bg-[#0060a3] text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{d.aiTeamSummary ? 'Re-run Concierge AI' : 'Run Concierge AI'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                  <div>Contact: <strong>{d.contactName}</strong> ({d.designation})</div>
                  <div>Email: <strong>{d.contactEmail}</strong></div>
                  <div>Phone: <strong>{d.contactNumber}</strong></div>
                </div>

                {d.message && (
                  <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    "{d.message}"
                  </p>
                )}

                {(d.aiTeamSummary || d.aiEmailDraft) && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
                    {d.aiTeamSummary && (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                          Internal Summary (Rash, Karl, Angel, Krisha)
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">{d.aiTeamSummary}</p>
                      </div>
                    )}
                    {d.aiEmailDraft && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#0077C8]">
                          Draft Institutional Reply (15-Min Pilot Offer)
                        </div>
                        <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">{d.aiEmailDraft}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: ACTIVE UNIVERSITIES MANAGEMENT */}
      {adminSection === 'institutions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header Controls */}
          <div className="p-5 sm:p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Registered Higher Education Institutions
                </h2>
                <p className="text-xs text-slate-500">
                  Configure institution accounts, subscription tiers, external reservation policies, and authorized facility administrators.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enroll University</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by university name, short code, or admin..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterType === 'all' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Institutions ({allInstitutions.length})
                </button>
                <button
                  onClick={() => setFilterType('public')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterType === 'public' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => setFilterType('private')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterType === 'private' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Private
                </button>
              </div>
            </div>
          </div>

          {/* Institutions List */}
          <div className="divide-y divide-slate-100">
            {filteredInstitutions.map((inst) => {
              const instFacilitiesCount = allFacilities.filter((f) => f.institutionId === inst.id).length;
              const instBookingsCount = allBookings.filter((b) => b.institutionId === inst.id).length;

              return (
                <div key={inst.id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {inst.shortName}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {inst.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {inst.type}
                        </span>
                        {inst.bookingPolicy === 'internal_only' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Internal Bookings Only
                          </span>
                        ) : inst.bookingPolicy === 'approval_required' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Approval Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            External Bookings Allowed
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {inst.campus}, {inst.city}
                        </span>
                        <span>·</span>
                        <span>{instFacilitiesCount} bookable spaces</span>
                        <span>·</span>
                        <span>{instBookingsCount} reservation records</span>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Campus Facility Admin</span>
                        <strong>{inst.assignedAdminName}</strong> · <span className="font-mono text-[11px] text-slate-500">{inst.assignedAdminEmail}</span>
                      </div>
                    </div>

                    {/* Quick Access Switch Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleSwitchToUniversity(inst.id, 'university_admin')}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                        title={`Manage ${inst.shortName} as Facility Admin`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Manage Campus</span>
                      </button>

                      <button
                        onClick={() => setEditingInst(inst)}
                        className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
                        title="Edit Institution Configuration"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: AGENTIC AI AUTOMATION & EMAIL DISPATCH MONITOR */}
      {adminSection === 'ai-automation' && (
        <div className="space-y-6">
          {/* Executive Overview Card */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Gemini 4 Workflow Engine &amp; Opal Webhook Bridge</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                AI Workflow Builder, Automation Queue &amp; Dispatch
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Express + Firebase Firestore backend with server-side Gemini prompt chaining, Google Opal JSON export &amp; inbound webhook receiver, and 12-hour AM/PM governance workflows.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={async () => {
                    setIsGeneratingAiSummary(true);
                    const res = await triggerManualAIAnalysis();
                    setIsGeneratingAiSummary(false);
                    if (res.summary) {
                      setAiAnalysisResult(res.summary);
                    }
                  }}
                  disabled={isGeneratingAiSummary}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isGeneratingAiSummary ? 'Analyzing with Gemini...' : 'Run Real-time AI Venue Diagnostics'}</span>
                </button>

                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Private BCC Dispatch: Active (5 Provisioned Super Admins)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live AI Analysis Banner if generated */}
          {aiAnalysisResult && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Gemini Model Diagnostics Brief
                </span>
                <button
                  onClick={() => setAiAnalysisResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {aiAnalysisResult}
              </p>
            </div>
          )}

          {/* Visual AI Workflow Builder & Opal Webhook Bridge */}
          <AIWorkflowBuilderPanel />

          {/* Human-in-the-Loop Review Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  <span>Human-in-the-Loop Governance Queue</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Actions paused for Super Admin review prior to SLA agreement generation or automated tenant provisioning.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {aiAutomationJobs.filter((j) => j.status === 'requires_human_approval').length} Awaiting Approval
              </span>
            </div>

            {aiAutomationJobs.filter((j) => j.status === 'requires_human_approval').length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                All high-priority AI automation tasks are currently approved and processed.
              </div>
            ) : (
              <div className="space-y-3">
                {aiAutomationJobs
                  .filter((j) => j.status === 'requires_human_approval')
                  .map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                            {job.aiCategory || 'Enterprise Onboarding'}
                          </span>
                          {job.recommendedTier && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0077C8]/10 text-[#0077C8] border border-[#0077C8]/20">
                              {job.recommendedTier}
                            </span>
                          )}
                          {job.leadWarmth && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {job.leadWarmth} Lead
                            </span>
                          )}
                          <span className="font-bold text-sm text-slate-900">{job.title}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {job.aiSummary}
                        </p>
                        {job.aiDraftContent && (
                          <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-amber-200/80 italic whitespace-pre-line">
                            "{job.aiDraftContent}"
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 flex items-center gap-3">
                          <span>Suggested Lead: <strong>{job.suggestedSuperAdmin || 'Rash, Karl, Angel & Krisha'}</strong></span>
                          <span>·</span>
                          <span>Logged: {formatDateTime12Hour(job.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => approveAIJob(job.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Dispatch</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Automation Jobs Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>Agent Task Execution Queue</span>
                </h3>
                <p className="text-xs text-slate-500">Autonomous categorization, permit QR compiles, and notification flows</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {aiAutomationJobs.length} Tasks Recorded
              </span>
            </div>

            <div className="space-y-3">
              {aiAutomationJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        job.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.status === 'requires_human_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {job.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{job.title}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{formatDateTime12Hour(job.createdAt)}</span>
                      {job.status === 'failed' && (
                        <button
                          onClick={() => retryAIJob(job.id)}
                          className="px-2.5 py-1 rounded bg-indigo-600 text-white font-bold text-[10px] hover:bg-indigo-700 cursor-pointer"
                        >
                          Retry Task
                        </button>
                      )}
                    </div>
                  </div>

                  {job.aiSummary && (
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {job.aiSummary}
                    </p>
                  )}

                  {/* Execution Logs */}
                  <div className="pt-2 border-t border-slate-200/70 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Autonomous Trace & Verification Logs:
                    </span>
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-600">
                      {job.executionLogs.map((log, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          {log}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automated Email Delivery Audit Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  <span>Super Admin Email Dispatch & Delivery Audit</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Automated alert routing to provisioned Super Admins (BCC recipient addresses protected).
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Delivery Audit Log
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Subject & Payload</th>
                    <th className="py-2.5 px-3">Inquiry Type</th>
                    <th className="py-2.5 px-3">Recipients & Privacy</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emailDeliveryRecords.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                        {del.subject}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200">
                          {del.inquiryType || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span className="font-medium">
                          {del.recipientCount} Provisioned Super Admins
                        </span>
                        <span className="block text-[10px] text-emerald-600 font-medium">
                          ✓ Private BCC Protected
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {del.formattedTime} ({formatDateTime12Hour(del.timestamp).split(',')[0]})
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          del.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : del.status === 'queued'
                            ? 'bg-amber-100 text-amber-800'
                            : del.status === 'sending'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {del.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => retryEmailDelivery(del.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          Resend Alert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD UNIVERSITY MODAL */}
      {showAddModal && (

        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sa-add-univ-title"
            className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 id="sa-add-univ-title" className="text-base font-bold">Register New Higher Education Institution</h3>
                <p className="text-xs text-slate-300 mt-0.5">Enroll an accredited university onto SmartSpace multi-tenant network.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close register institution modal"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleRegisterUniversity} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label htmlFor="sa-add-inst-name" className="text-xs font-bold text-slate-700">Official Institution Name *</label>
                <input
                  id="sa-add-inst-name"
                  type="text"
                  required
                  placeholder="e.g. Southwestern University PHINMA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="sa-add-inst-short" className="text-xs font-bold text-slate-700">Acronym / Code *</label>
                  <input
                    id="sa-add-inst-short"
                    type="text"
                    required
                    placeholder="e.g. SWU"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="sa-add-inst-campus" className="text-xs font-bold text-slate-700">Campus Location *</label>
                  <input
                    id="sa-add-inst-campus"
                    type="text"
                    required
                    placeholder="e.g. Urgello Campus"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="sa-add-inst-type" className="text-xs font-bold text-slate-700">Institution Type</label>
                  <select
                    id="sa-add-inst-type"
                    value={instType}
                    onChange={(e) => setInstType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Private">Private University</option>
                    <option value="Public">Public State University</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="sa-add-inst-policy" className="text-xs font-bold text-slate-700">External Booking Policy</label>
                  <select
                    id="sa-add-inst-policy"
                    value={policy}
                    onChange={(e) => {
                      const p = e.target.value as any;
                      setPolicy(p);
                      setAllowExternal(p !== 'internal_only');
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="approval_required">Approval Required for External</option>
                    <option value="external_allowed">External Bookings Allowed</option>
                    <option value="internal_only">Internal Bookings Only</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Initial Facility Administrator Account</span>
                <input
                  type="text"
                  placeholder="Admin Full Name (e.g. Dr. Cheryl Gantuangco)"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg mb-2"
                />
                <input
                  type="email"
                  placeholder="Official Admin Email (e.g. facilities.admin@swu.edu.ph)"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT UNIVERSITY MODAL */}
      {editingInst && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingInst(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sa-edit-univ-title"
            className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 id="sa-edit-univ-title" className="text-base font-bold">Edit University Configuration</h3>
                <p className="text-xs text-slate-300 mt-0.5">Configure institutional workspace, policies, and credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingInst(null)}
                aria-label="Close edit university modal"
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleUpdateUniversity} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label htmlFor="sa-edit-inst-name" className="text-xs font-bold text-slate-700">University Name</label>
                <input
                  id="sa-edit-inst-name"
                  type="text"
                  value={editingInst.name}
                  onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="sa-edit-inst-tier" className="text-xs font-bold text-slate-700">Subscription Tier</label>
                  <select
                    id="sa-edit-inst-tier"
                    value={editingInst.subscriptionPlan || 'Standard'}
                    onChange={(e) => setEditingInst({ ...editingInst, subscriptionPlan: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Pilot">Pilot Agreement</option>
                    <option value="Standard">Standard Campus</option>
                    <option value="Enterprise">Enterprise Multi-Campus</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="sa-edit-inst-status" className="text-xs font-bold text-slate-700">Account Status</label>
                  <select
                    id="sa-edit-inst-status"
                    value={editingInst.status}
                    onChange={(e) => setEditingInst({ ...editingInst, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="active">Active Subscription</option>
                    <option value="trial">Evaluation Trial</option>
                    <option value="inactive">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Cross-University Booking Policy Controls */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                <span className="text-[11px] font-bold text-blue-900 block flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                  Cross-University Booking Policy
                </span>
                
                <div className="space-y-1">
                  <label htmlFor="sa-edit-inst-policy" className="text-[10px] font-semibold text-slate-700">Policy Mode</label>
                  <select
                    id="sa-edit-inst-policy"
                    value={editingInst.bookingPolicy}
                    onChange={(e) => {
                      const pol = e.target.value as any;
                      setEditingInst({
                        ...editingInst,
                        bookingPolicy: pol,
                        allowExternalBookings: pol !== 'internal_only'
                      });
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    <option value="external_allowed">External Bookings Allowed</option>
                    <option value="approval_required">Approval Required for External</option>
                    <option value="internal_only">Internal Bookings Only (Strict)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="sa-edit-inst-notice" className="text-[10px] font-semibold text-slate-700">Notice Shown to External Requesters</label>
                  <textarea
                    id="sa-edit-inst-notice"
                    rows={2}
                    value={editingInst.externalBookingNotice || ''}
                    onChange={(e) => setEditingInst({ ...editingInst, externalBookingNotice: e.target.value })}
                    placeholder="Instructions or conditions for external requesters..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Assigned University Administrator</span>
                <input
                  type="text"
                  placeholder="Admin Name"
                  value={editingInst.assignedAdminName}
                  onChange={(e) => setEditingInst({ ...editingInst, assignedAdminName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg mb-2"
                />
                <input
                  type="email"
                  placeholder="Admin Email"
                  value={editingInst.assignedAdminEmail}
                  onChange={(e) => setEditingInst({ ...editingInst, assignedAdminEmail: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
