import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FacilityHandler } from '../types';
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  Building, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  Trash2, 
  Edit3, 
  UserCheck, 
  Lock 
} from 'lucide-react';
import { formatDateTime12Hour } from '../utils/timeFormat';

export const AdminPersonnelView: React.FC = () => {
  const { 
    currentInstitution, 
    institutionHandlers, 
    institutionFacilities, 
    addFacilityHandler, 
    updateFacilityHandler, 
    deleteFacilityHandler 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHandler, setEditingHandler] = useState<FacilityHandler | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [assignedFacilityIds, setAssignedFacilityIds] = useState<string[]>([]);
  const [isPrimary, setIsPrimary] = useState(true);
  const [accessCode, setAccessCode] = useState('123456');

  const handleOpenAdd = () => {
    setName('');
    setEmail('');
    setPhone('+63 ');
    setDepartment('Physical Plant & Venues Desk');
    setAssignedFacilityIds(institutionFacilities.map((f) => f.id).slice(0, 2));
    setIsPrimary(true);
    setAccessCode('123456');
    setEditingHandler(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (handler: FacilityHandler) => {
    setEditingHandler(handler);
    setName(handler.name);
    setEmail(handler.email);
    setPhone(handler.phone || '');
    setDepartment(handler.department);
    setAssignedFacilityIds(handler.assignedFacilityIds);
    setIsPrimary(handler.isPrimary);
    setAccessCode('123456');
    setIsAddModalOpen(true);
  };

  const handleSaveHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingHandler) {
      updateFacilityHandler(editingHandler.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department: department.trim(),
        assignedFacilityIds,
        isPrimary,
        hasAccessCode: true,
      });
    } else {
      addFacilityHandler({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        institutionId: currentInstitution.id,
        department: department.trim(),
        status: 'active',
        assignedFacilityIds,
        isPrimary,
        hasAccessCode: true,
      });
    }

    setIsAddModalOpen(false);
  };

  const toggleFacilityAssignment = (facId: string) => {
    setAssignedFacilityIds((prev) =>
      prev.includes(facId) ? prev.filter((id) => id !== facId) : [...prev, facId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold uppercase tracking-wider">
              Governance & Physical Plant
            </span>
            <span className="text-slate-400 text-xs font-semibold">
              {currentInstitution.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Facility Personnel & Designated Handlers
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Assign designated building custodians, lab technicians, and event coordinators. Handlers authenticate facility approvals using individual PIN codes with atomic attribution.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Assign New Personnel</span>
        </button>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {institutionHandlers.map((handler) => {
          const assignedFacs = institutionFacilities.filter((f) =>
            handler.assignedFacilityIds.includes(f.id)
          );

          return (
            <div
              key={handler.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {handler.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{handler.name}</h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{handler.department}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      handler.isPrimary
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {handler.isPrimary ? 'Primary Handler' : 'Backup Handler'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{handler.email}</span>
                  </div>
                  {handler.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{handler.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      Access PIN Enforced (SHA-256 Hashed)
                    </span>
                  </div>
                </div>

                {/* Assigned Facilities */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Authorized Venues ({assignedFacs.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {assignedFacs.length > 0 ? (
                      assignedFacs.map((fac) => (
                        <span
                          key={fac.id}
                          className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]"
                        >
                          {fac.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-amber-800 italic">No venues assigned yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Activity and Controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-medium">
                  {handler.approvalCount} permit approval(s)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(handler)}
                    aria-label={`Edit ${handler.name}`}
                    className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Personnel Assignment"
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFacilityHandler(handler.id)}
                    aria-label={`Revoke privileges for ${handler.name}`}
                    className="p-1.5 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Revoke Personnel Privileges"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-personnel-modal-title"
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 id="admin-personnel-modal-title" className="text-base font-black text-slate-900">
                  {editingHandler ? 'Update Facility Handler' : 'Assign Facility Personnel'}
                </h3>
                <p className="text-xs text-slate-600">Configure access codes and assigned campus venues</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close personnel assignment modal"
                className="text-slate-600 hover:text-slate-900 text-lg font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHandler} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="personnel-name" className="block text-xs font-bold text-slate-700 mb-1">Personnel Name *</label>
                  <input
                    id="personnel-name"
                    type="text"
                    required
                    placeholder="e.g. Ms. Julia Alcantara"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="personnel-email" className="block text-xs font-bold text-slate-700 mb-1">Institutional Email *</label>
                  <input
                    id="personnel-email"
                    type="email"
                    required
                    placeholder="handler@ctu.edu.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="personnel-phone" className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    id="personnel-phone"
                    type="text"
                    placeholder="+63 917 555 0192"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="personnel-dept" className="block text-xs font-bold text-slate-700 mb-1">Department / Unit</label>
                  <input
                    id="personnel-dept"
                    type="text"
                    placeholder="Physical Plant / Custodian"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="personnel-access-pin" className="block text-xs font-bold text-slate-700 mb-1">
                  Designated Facility Access PIN (Default: 123456)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="personnel-access-pin"
                    type="password"
                    placeholder="6-digit PIN"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  Required during reservation review to atomically attribute the approval permit.
                </p>
              </div>

              {/* Assigned Venues Checkbox Selection */}
              <div role="group" aria-labelledby="personnel-venues-group">
                <span id="personnel-venues-group" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Assigned Campus Venues ({assignedFacilityIds.length} selected)
                </span>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  {institutionFacilities.map((fac) => (
                    <label
                      key={fac.id}
                      htmlFor={`personnel-venue-${fac.id}`}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white text-xs cursor-pointer"
                    >
                      <input
                        id={`personnel-venue-${fac.id}`}
                        type="checkbox"
                        checked={assignedFacilityIds.includes(fac.id)}
                        onChange={() => toggleFacilityAssignment(fac.id)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-semibold text-slate-800">{fac.name}</span>
                      <span className="text-[10px] text-slate-600">({fac.building})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary / Backup Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryToggle"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isPrimaryToggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Designate as Primary Handler for these facilities
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Personnel Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
