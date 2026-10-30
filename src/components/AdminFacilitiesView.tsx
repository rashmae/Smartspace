import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Facility, FacilityType } from '../types';
import { 
  Building2, 
  PlusCircle, 
  Users, 
  MapPin, 
  Clock, 
  Search, 
  Settings, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Filter, 
  Layers,
  Wrench,
  X,
  ExternalLink,
  CalendarCheck2
} from 'lucide-react';
import { formatOperatingHours, TIME_OPTIONS } from '../utils/timeFormat';

const FACILITY_TYPES: FacilityType[] = [
  'Lecture Room',
  'Computer Laboratory',
  'Conference Room',
  'University Auditorium',
  'Student Activity Room',
  'Multimedia Presentation Hall',
];

const PRESET_IMAGES = [
  { label: 'Lecture Hall', url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Computer Lab', url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Conference Room', url: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Auditorium', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Activity Complex', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80' },
];

export const AdminFacilitiesView: React.FC = () => {
  const {
    currentInstitution,
    institutionFacilities,
    addFacility,
    updateFacility,
    deleteFacility,
    setSelectedFacility,
    setActiveView,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  // Add Facility Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<FacilityType>('Lecture Room');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [capacity, setCapacity] = useState<number>(40);
  const [equipmentInput, setEquipmentInput] = useState('');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('18:00');
  const [days, setDays] = useState('Monday – Friday');
  const [rulesInput, setRulesInput] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');

  // Metrics
  const totalCount = institutionFacilities.length;
  const activeCount = institutionFacilities.filter((f) => f.status !== 'inactive').length;
  const totalCapacity = institutionFacilities.reduce((sum, f) => sum + f.capacity, 0);

  const filteredFacilities = useMemo(() => {
    return institutionFacilities.filter((f) => {
      const matchesSearch = 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.equipment.some((eq) => eq.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || f.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [institutionFacilities, searchQuery, selectedType]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !building.trim() || capacity <= 0) {
      addToast('error', 'Missing Data', 'Please provide a valid facility name, building, and capacity.');
      return;
    }

    const equipmentList = equipmentInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const rulesList = rulesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const reqsList = requirementsInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    addFacility({
      institutionId: currentInstitution.id,
      name: name.trim(),
      type,
      building: building.trim(),
      floor: floor.trim() || 'Ground Floor',
      capacity: Number(capacity),
      equipment: equipmentList.length > 0 ? equipmentList : ['Air Conditioning', 'Standard Whiteboard'],
      operatingHours: {
        open: openTime,
        close: closeTime,
        days: days || 'Monday – Friday',
      },
      rules: rulesList.length > 0 ? rulesList : ['Keep clean after use.', 'Switch off all equipment before leaving.'],
      bookingRequirements: reqsList.length > 0 ? reqsList : ['Department endorsement required.'],
      imageUrl: imageUrl || PRESET_IMAGES[0].url,
      description: description.trim() || `${type} venue located at ${building}.`,
      status: 'active',
    });

    // Reset
    setName('');
    setBuilding('');
    setFloor('');
    setCapacity(40);
    setEquipmentInput('');
    setRulesInput('');
    setRequirementsInput('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;

    updateFacility(editingFacility.id, editingFacility);
    setEditingFacility(null);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
              {currentInstitution.shortName} Facilities Office
            </span>
            <span className="text-xs text-slate-400">Inventory Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campus Spaces & Facility Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Configure room capacities, equipment specifications, operating hours, and usage rules for {currentInstitution.name}.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-400" />
          <span>Add New Campus Facility</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Spaces</span>
          <span className="text-2xl font-black text-slate-900">{totalCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Under {currentInstitution.shortName} management</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Active Venues</span>
          <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Available for scheduling</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Seating Capacity</span>
          <span className="text-2xl font-black text-indigo-600">{totalCapacity}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Concurrent student seats</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, building, equipment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
              selectedType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Types
          </button>
          {FACILITY_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedType === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map((fac) => (
          <div key={fac.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              <img
                src={fac.imageUrl}
                alt={fac.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs ${
                  fac.status === 'active' || !fac.status 
                    ? 'bg-emerald-500/90 text-white' 
                    : fac.status === 'maintenance'
                    ? 'bg-amber-500/90 text-slate-950'
                    : 'bg-slate-700/90 text-white'
                }`}>
                  {fac.status || 'Active'}
                </span>
              </div>
              <div className="absolute bottom-3 left-3">
                <span className="px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-semibold backdrop-blur-xs">
                  {fac.type}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {fac.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-700 font-bold shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{fac.capacity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{fac.building} · {fac.floor}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{formatOperatingHours(fac.operatingHours.open, fac.operatingHours.close, fac.operatingHours.days)}</span>
                </div>

                <div className="pt-2 flex flex-wrap gap-1">
                  {fac.equipment.slice(0, 3).map((eq, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded text-[10px]">
                      {eq}
                    </span>
                  ))}
                  {fac.equipment.length > 3 && (
                    <span className="px-1.5 py-0.5 text-slate-400 text-[10px]">
                      +{fac.equipment.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setEditingFacility(fac)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Specs</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      updateFacility(fac.id, {
                        status: fac.status === 'active' || !fac.status ? 'maintenance' : 'active'
                      });
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs transition-colors cursor-pointer"
                    title={fac.status === 'maintenance' ? 'Set Active' : 'Mark Maintenance'}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Remove ${fac.name} from campus inventory?`)) {
                        deleteFacility(fac.id);
                      }
                    }}
                    className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs transition-colors cursor-pointer"
                    title="Delete space"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Add Campus Facility</h3>
                <p className="text-xs text-slate-400 mt-0.5">Enrolling new bookable space in {currentInstitution.shortName}.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700">Space Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Multimedia Presentation Hall B"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as FacilityType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  >
                    {FACILITY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-slate-700">Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technology & Engineering Wing"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Opening (AM/PM)</label>
                  <select
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    {TIME_OPTIONS.map((opt) => (
                      <option key={`open-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Closing (AM/PM)</label>
                  <select
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg cursor-pointer"
                  >
                    {TIME_OPTIONS.map((opt) => (
                      <option key={`close-${opt.value}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Operating Days</label>
                  <input
                    type="text"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Equipment Available (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Ceiling Projector, HDMI Podium, Sound System, Whiteboard"
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Usage Rules (one per line)</label>
                <textarea
                  rows={2}
                  placeholder="Turn off projector after use&#10;No beverages inside"
                  value={rulesInput}
                  onChange={(e) => setRulesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
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
                  className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Add Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Edit Facility Specifications</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingFacility.name}</p>
              </div>
              <button
                onClick={() => setEditingFacility(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Space Name</label>
                <input
                  type="text"
                  value={editingFacility.name}
                  onChange={(e) => setEditingFacility({ ...editingFacility, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Capacity</label>
                  <input
                    type="number"
                    value={editingFacility.capacity}
                    onChange={(e) => setEditingFacility({ ...editingFacility, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Operating Status</label>
                  <select
                    value={editingFacility.status || 'active'}
                    onChange={(e) => setEditingFacility({ ...editingFacility, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="active">Active & Available</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Suspended / Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Building / Location</label>
                <input
                  type="text"
                  value={editingFacility.building}
                  onChange={(e) => setEditingFacility({ ...editingFacility, building: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFacility(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
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
