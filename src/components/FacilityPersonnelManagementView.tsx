import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Facility, FacilityAssignment, FacilityHandler } from '../types';
import { formatDateTime12Hour, formatTimeOnly12Hour } from '../utils/timeFormat';
import {
  Users,
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  PlusCircle,
  Building2,
  CalendarCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Filter,
  FileText,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  HelpCircle,
  Trash2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';

export const FacilityPersonnelManagementView: React.FC = () => {
  const {
    currentInstitution,
    institutionFacilities,
    institutionBookings,
    facilityHandlers,
    facilityAssignments,
    facilityApprovalLogs,
    createFacilityHandlerAccount,
    updateFacilityHandlerStatus,
    assignFacilityHandler,
    revokeFacilityAssignment,
    resetFacilityAccessCode,
    addToast,
    loginAs,
    setActiveView,
  } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'personnel' | 'audit'>('matrix');

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedFacilityForAssign, setSelectedFacilityForAssign] = useState<Facility | null>(null);
  const [assignHandlerId, setAssignHandlerId] = useState('');
  const [assignRole, setAssignRole] = useState<'primary' | 'backup'>('primary');
  const [assignAccessCode, setAssignAccessCode] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [showAssignCode, setShowAssignCode] = useState(false);

  const [isCreateHandlerModalOpen, setIsCreateHandlerModalOpen] = useState(false);
  const [newHandlerName, setNewHandlerName] = useState('');
  const [newHandlerEmail, setNewHandlerEmail] = useState('');
  const [newHandlerPhone, setNewHandlerPhone] = useState('');
  const [newHandlerTitle, setNewHandlerTitle] = useState('');
  const [newHandlerNotes, setNewHandlerNotes] = useState('');

  const [isResetCodeModalOpen, setIsResetCodeModalOpen] = useState(false);
  const [targetAssignmentForReset, setTargetAssignmentForReset] = useState<FacilityAssignment | null>(null);
  const [newAccessCodeInput, setNewAccessCodeInput] = useState('');
  const [showResetCode, setShowResetCode] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Filter facilities of current institution
  const facilities = institutionFacilities.filter((f) => {
    if (selectedFacilityFilter !== 'all' && f.id !== selectedFacilityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.building.toLowerCase().includes(q) || f.type.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate pending requests count for a facility
  const getPendingCount = (facilityId: string) => {
    return institutionBookings.filter((b) => b.facilityId === facilityId && b.status === 'pending').length;
  };

  // Get active assignments for a facility
  const getFacilityAssignments = (facilityId: string) => {
    return facilityAssignments.filter((a) => a.facilityId === facilityId && a.assignmentStatus === 'active');
  };

  // Open Assign Modal
  const openAssignModal = (facility?: Facility) => {
    setSelectedFacilityForAssign(facility || facilities[0] || null);
    setAssignHandlerId(facilityHandlers[0]?.id || '');
    setAssignRole('primary');
    setAssignAccessCode('');
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  // Handle Assign Submit
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacilityForAssign || !assignHandlerId) {
      addToast('error', 'Incomplete Form', 'Please select both a facility and a handler.');
      return;
    }

    const handler = facilityHandlers.find((h) => h.id === assignHandlerId);
    if (!handler) return;

    const res = await assignFacilityHandler({
      facilityId: selectedFacilityForAssign.id,
      facilityName: selectedFacilityForAssign.name,
      handlerUserId: handler.id,
      handlerName: handler.fullName,
      handlerEmail: handler.email,
      assignmentRole: assignRole,
      initialAccessCode: assignAccessCode.trim() || undefined,
      notes: assignNotes.trim() || undefined,
    });

    if (res.success) {
      setIsAssignModalOpen(false);
    }
  };

  // Handle Create Handler Account
  const handleCreateHandlerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHandlerName.trim() || !newHandlerEmail.trim()) {
      addToast('error', 'Missing Information', 'Full name and email are required.');
      return;
    }

    const res = await createFacilityHandlerAccount({
      fullName: newHandlerName.trim(),
      email: newHandlerEmail.trim(),
      phone: newHandlerPhone.trim() || undefined,
      titleOrDesignation: newHandlerTitle.trim() || 'Facility Custodian & Reviewer',
      notes: newHandlerNotes.trim() || undefined,
    });

    if (res.success) {
      setIsCreateHandlerModalOpen(false);
      setNewHandlerName('');
      setNewHandlerEmail('');
      setNewHandlerPhone('');
      setNewHandlerTitle('');
      setNewHandlerNotes('');
    }
  };

  // Handle Reset Access Code Submit
  const handleResetCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAssignmentForReset || newAccessCodeInput.trim().length < 4) {
      addToast('error', 'Invalid Code', 'Access code must be at least 4 characters.');
      return;
    }

    setIsSubmittingCode(true);
    const res = await resetFacilityAccessCode(targetAssignmentForReset.id, newAccessCodeInput.trim());
    setIsSubmittingCode(false);

    if (res.success) {
      setIsResetCodeModalOpen(false);
      setNewAccessCodeInput('');
      setTargetAssignmentForReset(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Overview & Context */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>University Administrator Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Facility Personnel & Secure Booking Approval Management
            </h1>
            <p className="text-sm text-purple-200 leading-relaxed">
              Designate authorized personnel to specific campus venues, enforce individual facility-specific access code credentials, configure primary & backup handlers, and monitor live approval queues.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => setIsCreateHandlerModalOpen(true)}
              className="px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-purple-700" />
              <span>New Personnel Account</span>
            </button>
            <button
              onClick={() => openAssignModal()}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer border border-purple-400/40"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign Facility</span>
            </button>
          </div>
        </div>

        {/* CTU Scenario Reference Box */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="font-black text-amber-300 flex items-center justify-between">
              <span>Ms. Julia</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200">Executive Venues</span>
            </div>
            <p className="text-[11px] text-purple-200 mt-1">CN Function Hall & CTU Gymnasium (Primary)</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="font-black text-emerald-300 flex items-center justify-between">
              <span>Mr. Jomel</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-200">Outdoor Quad</span>
            </div>
            <p className="text-[11px] text-purple-200 mt-1">Open Court 1 & Open Court 2 (Primary)</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="font-black text-sky-300 flex items-center justify-between">
              <span>Mr. Daniel</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-200">Computing Labs</span>
            </div>
            <p className="text-[11px] text-purple-200 mt-1">Computer Laboratories (Primary)</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <div className="font-black text-pink-300 flex items-center justify-between">
              <span>Ms. Angela</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-400/20 text-pink-200">Sports & Backup</span>
            </div>
            <p className="text-[11px] text-purple-200 mt-1">Tennis Court (Primary), CTU Gym (Backup)</p>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-fit">
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'matrix' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility Assignment Matrix</span>
          </button>
          <button
            onClick={() => setViewMode('personnel')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'personnel' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personnel Directory ({facilityHandlers.length})</span>
          </button>
          <button
            onClick={() => setViewMode('audit')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'audit' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Handler Activity & Audit Trail</span>
          </button>
        </div>

        {/* Search & Facility Selector */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search facility or personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
            />
          </div>
          <select
            value={selectedFacilityFilter}
            onChange={(e) => setSelectedFacilityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
          >
            <option value="all">All Facilities ({institutionFacilities.length})</option>
            {institutionFacilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. FACILITY ASSIGNMENT MATRIX VIEW                             */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {facilities.map((fac) => {
              const assignments = getFacilityAssignments(fac.id);
              const primary = assignments.find((a) => a.assignmentRole === 'primary');
              const backups = assignments.filter((a) => a.assignmentRole === 'backup');
              const pendingReqs = getPendingCount(fac.id);

              return (
                <div
                  key={fac.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-200 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  {/* Left: Facility Info */}
                  <div className="flex items-start gap-4 lg:w-1/3">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">{fac.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {fac.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {fac.building} · {fac.floor} · {fac.capacity} seats
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            pendingReqs > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{pendingReqs} Pending Booking{pendingReqs !== 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Handlers Assignment Details */}
                  <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {/* Primary Handler */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">
                          Primary Reviewer
                        </span>
                        {primary && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                            Authorized
                          </span>
                        )}
                      </div>

                      {primary ? (
                        <div className="space-y-0.5 pt-0.5">
                          <p className="text-xs font-black text-slate-900">{primary.handlerName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{primary.handlerEmail}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <KeyRound className="w-3 h-3" />
                              <span>Code Active</span>
                            </span>
                            <button
                              onClick={() => {
                                setTargetAssignmentForReset(primary);
                                setNewAccessCodeInput('');
                                setIsResetCodeModalOpen(true);
                              }}
                              className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                            >
                              Reset Code
                            </button>
                            <button
                              onClick={() => revokeFacilityAssignment(primary.id)}
                              className="text-[10px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer ml-auto"
                              title="Revoke Assignment"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 text-xs text-slate-400 italic flex items-center justify-between">
                          <span>Unassigned</span>
                          <button
                            onClick={() => openAssignModal(fac)}
                            className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer not-italic"
                          >
                            + Assign
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Backup Handler(s) */}
                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200/80 sm:pl-3 pt-2 sm:pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">
                          Backup Reviewer(s)
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {backups.length} Designated
                        </span>
                      </div>

                      {backups.length > 0 ? (
                        <div className="space-y-2 pt-0.5">
                          {backups.map((b) => (
                            <div key={b.id} className="space-y-0.5 border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                              <p className="text-xs font-bold text-slate-800">{b.handlerName}</p>
                              <p className="text-[11px] text-slate-500 truncate">{b.handlerEmail}</p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  onClick={() => {
                                    setTargetAssignmentForReset(b);
                                    setNewAccessCodeInput('');
                                    setIsResetCodeModalOpen(true);
                                  }}
                                  className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                                >
                                  Reset Code
                                </button>
                                <button
                                  onClick={() => revokeFacilityAssignment(b.id)}
                                  className="text-[10px] font-bold text-rose-600 hover:text-rose-800 cursor-pointer ml-auto"
                                >
                                  Revoke
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2 text-xs text-slate-400 italic flex items-center justify-between">
                          <span>No Backup</span>
                          <button
                            onClick={() => {
                              setSelectedFacilityForAssign(fac);
                              setAssignHandlerId(facilityHandlers[0]?.id || '');
                              setAssignRole('backup');
                              setIsAssignModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-indigo-700 hover:underline cursor-pointer not-italic"
                          >
                            + Add Backup
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={() => openAssignModal(fac)}
                      className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-purple-200 flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Configure</span>
                    </button>
                    {primary && (
                      <button
                        onClick={() => {
                          // Quick switch to this handler persona for testing
                          loginAs('facility_handler', primary.handlerEmail, primary.handlerName);
                          setActiveView('facility-handler-workspace');
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                        title={`Simulate sign-in as ${primary.handlerName}`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Test Workspace</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PERSONNEL DIRECTORY VIEW                                   */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'personnel' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-black text-slate-900">Authorized Facility Handlers</h3>
              <p className="text-xs text-slate-500">
                Staff members and hall coordinators credentialed to review booking permits for assigned university venues.
              </p>
            </div>
            <button
              onClick={() => setIsCreateHandlerModalOpen(true)}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Invite New Handler</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="py-3 px-4">Handler Identity</th>
                  <th className="py-3 px-4">Designation / Role</th>
                  <th className="py-3 px-4">Assigned Facilities</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilityHandlers.map((handler) => {
                  const assigned = facilityAssignments.filter(
                    (a) => a.handlerUserId === handler.id && a.assignmentStatus === 'active'
                  );

                  return (
                    <tr key={handler.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">
                            {handler.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{handler.fullName}</span>
                            <span className="text-[11px] text-slate-500">{handler.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {handler.titleOrDesignation}
                        {handler.phone && <span className="block text-[11px] text-slate-400">{handler.phone}</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        {assigned.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assigned.map((asgn) => (
                              <span
                                key={asgn.id}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  asgn.assignmentRole === 'primary'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {asgn.facilityName} ({asgn.assignmentRole})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No venues assigned yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            handler.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {handler.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              openAssignModal();
                              setAssignHandlerId(handler.id);
                            }}
                            className="font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
                          >
                            Assign Venue
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() =>
                              updateFacilityHandlerStatus(
                                handler.id,
                                handler.status === 'active' ? 'suspended' : 'active'
                              )
                            }
                            className={`font-bold cursor-pointer ${
                              handler.status === 'active' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-700 hover:text-emerald-900'
                            }`}
                          >
                            {handler.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            onClick={() => {
                              loginAs('facility_handler', handler.email, handler.fullName);
                              setActiveView('facility-handler-workspace');
                            }}
                            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-0.5"
                          >
                            <span>Sign In</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. HANDLER AUDIT TRAIL & LOGS VIEW                            */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Personnel Decision & Verification Audit Log</h3>
              <p className="text-xs text-slate-500">
                Immutable chronological log of facility access code verifications, booking approvals, and permit rejections.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg">
              {facilityApprovalLogs.length} Logged Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="py-3 px-4">Timestamp (12-Hour)</th>
                  <th className="py-3 px-4">Facility & Role</th>
                  <th className="py-3 px-4">Handler</th>
                  <th className="py-3 px-4">Event / Decision</th>
                  <th className="py-3 px-4">Reason / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilityApprovalLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                      <span className="font-bold text-slate-900">{log.formattedTime}</span>
                      <span className="block text-slate-400 text-[10px]">{log.formattedDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.facilityName}</span>
                      <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider">
                        {log.handlerRole} Handler
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.handlerName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          log.decision === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.decision === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : log.decision === 'code_verified'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.decision === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {log.decision === 'rejected' && <AlertTriangle className="w-3 h-3" />}
                        {log.decision === 'code_verified' && <KeyRound className="w-3 h-3" />}
                        <span>{log.decision.replace(/_/g, ' ')}</span>
                      </span>
                      {log.bookingReference && (
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                          {log.bookingReference}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 truncate">
                      {log.reason || (log.eventName ? `Booking: ${log.eventName}` : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ASSIGN HANDLER TO FACILITY                             */}
      {/* ------------------------------------------------------------- */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Assign Facility Personnel</h3>
                  <p className="text-xs text-slate-500">Designate primary or backup handler for a venue</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Facility</label>
                <select
                  value={selectedFacilityForAssign?.id || ''}
                  onChange={(e) => {
                    const f = institutionFacilities.find((fac) => fac.id === e.target.value);
                    if (f) setSelectedFacilityForAssign(f);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {institutionFacilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.building})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designated Personnel</label>
                <select
                  value={assignHandlerId}
                  onChange={(e) => setAssignHandlerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  {facilityHandlers.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.fullName} — {h.titleOrDesignation} ({h.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      assignRole === 'primary'
                        ? 'bg-purple-50 border-purple-400 text-purple-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignRole"
                      value="primary"
                      checked={assignRole === 'primary'}
                      onChange={() => setAssignRole('primary')}
                      className="sr-only"
                    />
                    <span>Primary Handler</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      assignRole === 'backup'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignRole"
                      value="backup"
                      checked={assignRole === 'backup'}
                      onChange={() => setAssignRole('backup')}
                      className="sr-only"
                    />
                    <span>Backup Handler</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Individual Facility Access Code (Server-Hashed)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showAssignCode ? 'text' : 'password'}
                    placeholder="e.g. CN-8421 or 8421"
                    value={assignAccessCode}
                    onChange={(e) => setAssignAccessCode(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAssignCode(!showAssignCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAssignCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Unique to this handler and venue. Code is hashed with HMAC-SHA256 and never stored in cleartext.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or scheduling coverage details..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE HANDLER ACCOUNT                                 */}
      {/* ------------------------------------------------------------- */}
      {isCreateHandlerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Create Facility Personnel Account</h3>
                  <p className="text-xs text-slate-500">Add an authorized custodian or reviewer</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateHandlerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHandlerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Personnel Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ms. Julia or Mr. Jomel"
                  value={newHandlerName}
                  onChange={(e) => setNewHandlerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. julia.facilities@ctu.edu.ph"
                  value={newHandlerEmail}
                  onChange={(e) => setNewHandlerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Arena Coordinator"
                    value={newHandlerTitle}
                    onChange={(e) => setNewHandlerTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Contact</label>
                  <input
                    type="text"
                    placeholder="+63 917 555 0101"
                    value={newHandlerPhone}
                    onChange={(e) => setNewHandlerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Personnel Notes</label>
                <textarea
                  rows={2}
                  placeholder="Physical plant assignment details..."
                  value={newHandlerNotes}
                  onChange={(e) => setNewHandlerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateHandlerModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CONFIGURE / RESET ACCESS CODE                          */}
      {/* ------------------------------------------------------------- */}
      {isResetCodeModalOpen && targetAssignmentForReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Configure Access Code</h3>
                  <p className="text-xs text-slate-500">
                    {targetAssignmentForReset.facilityName} · {targetAssignmentForReset.handlerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetCodeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
              <p className="font-bold">Cryptographic Server Salting & Lockout Protection</p>
              <p className="text-[11px] text-purple-700">
                Updating this credential immediately invalidates any existing active workspace sessions for this venue. Failed entries are capped at 5 attempts before a 5-minute lockout.
              </p>
            </div>

            <form onSubmit={handleResetCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Access Code</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showResetCode ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 4 characters..."
                    value={newAccessCodeInput}
                    onChange={(e) => setNewAccessCodeInput(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetCode(!showResetCode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetCodeModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCode}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isSubmittingCode ? 'Hashing & Saving...' : 'Save & Hash Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
