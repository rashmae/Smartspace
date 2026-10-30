import React, { useState, useMemo } from 'react';
import { Facility, FacilityType, Institution } from '../types';
import { useApp } from '../context/AppContext';
import { FacilityDetailModal } from './FacilityDetailModal';
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Clock, 
  CalendarDays, 
  ArrowRight,
  Info,
  Sparkles,
  Building,
  Building2,
  Globe,
  ShieldCheck,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { formatOperatingHours } from '../utils/timeFormat';

export const FacilityDirectory: React.FC = () => {
  const { 
    allFacilities,
    allInstitutions,
    currentInstitution, 
    setSelectedFacility, 
    setActiveView 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [capacityFilter, setCapacityFilter] = useState<string>('All');
  const [showUniversityShowcase, setShowUniversityShowcase] = useState(true);
  const [detailModalFacility, setDetailModalFacility] = useState<Facility | null>(null);

  const facilityTypes: ('All' | FacilityType)[] = [
    'All',
    'Lecture Room',
    'Computer Laboratory',
    'Conference Room',
    'University Auditorium',
    'Student Activity Room',
    'Multimedia Presentation Hall',
  ];

  // Base facilities filtered by selected university
  const universityFacilities = useMemo(() => {
    if (selectedUniversity === 'all') return allFacilities;
    return allFacilities.filter((f) => f.institutionId === selectedUniversity);
  }, [allFacilities, selectedUniversity]);

  const filteredFacilities = useMemo(() => {
    return universityFacilities.filter((f) => {
      // Type match
      if (selectedType !== 'All' && f.type !== selectedType) {
        return false;
      }

      // Capacity match
      if (capacityFilter === '1-30' && f.capacity > 30) return false;
      if (capacityFilter === '31-60' && (f.capacity < 31 || f.capacity > 60)) return false;
      if (capacityFilter === '61-100' && (f.capacity < 61 || f.capacity > 100)) return false;
      if (capacityFilter === '100+' && f.capacity < 100) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesBuilding = f.building.toLowerCase().includes(q);
        const matchesEquipment = f.equipment.some((eq) => eq.toLowerCase().includes(q));
        const matchesDesc = f.description.toLowerCase().includes(q);
        
        // Also match university name or short name
        const hostInst = allInstitutions.find((i) => i.id === f.institutionId);
        const matchesUniv = hostInst && (
          hostInst.name.toLowerCase().includes(q) ||
          hostInst.shortName.toLowerCase().includes(q) ||
          hostInst.city.toLowerCase().includes(q)
        );

        return matchesName || matchesBuilding || matchesEquipment || matchesDesc || matchesUniv;
      }

      return true;
    });
  }, [universityFacilities, selectedType, capacityFilter, searchQuery, allInstitutions]);

  const handleBookNow = (facility: Facility, initialDate?: string, startTime?: string, endTime?: string) => {
    setSelectedFacility(facility);
    setActiveView('new-booking');
  };

  const getInstitutionForFacility = (institutionId: string): Institution => {
    return allInstitutions.find((i) => i.id === institutionId) || currentInstitution;
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner / Workspace Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-University Facility Network</span>
              <span className="bg-blue-600 text-white px-2 py-0.2 rounded text-[10px] font-bold">
                {allInstitutions.length} Universities Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Cross-University Facility Directory
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Explore participating universities across the platform. View available academic halls, auditoriums, and laboratories, check live 12-hour availability schedules, and submit reservation requests.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-slate-200">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                Your Home Institution: <strong>{currentInstitution.name} ({currentInstitution.shortName})</strong>
              </span>
              <span>·</span>
              <span>Total Available Spaces: <strong className="text-slate-200">{allFacilities.length} venues</strong></span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 lg:w-80 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Cross-University Policy Note
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              External reservations from other universities are accepted by participating partner institutions, subject to host administrator clearance. Internal-only facilities are marked accordingly.
            </p>
          </div>
        </div>
      </div>

      {/* University Directory Showcase Cards */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Participating Universities & Booking Policies
            </h2>
          </div>
          <button
            onClick={() => setShowUniversityShowcase(!showUniversityShowcase)}
            className="text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            {showUniversityShowcase ? 'Hide Universities' : 'Browse Universities'}
          </button>
        </div>

        {showUniversityShowcase && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            {allInstitutions.map((inst) => {
              const facCount = allFacilities.filter((f) => f.institutionId === inst.id).length;
              const isSelected = selectedUniversity === inst.id;
              const isHome = inst.id === currentInstitution.id;

              return (
                <div
                  key={inst.id}
                  onClick={() => setSelectedUniversity(isSelected ? 'all' : inst.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 truncate">{inst.shortName}</span>
                      {isHome && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold shrink-0">
                          Your Campus
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{inst.name}</p>
                    <p className="text-[10px] text-slate-400">{inst.city} · {facCount} facilities</p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between">
                    {inst.bookingPolicy === 'internal_only' ? (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Internal Only
                      </span>
                    ) : inst.bookingPolicy === 'approval_required' ? (
                      <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        Approval Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        External Allowed
                      </span>
                    )}

                    <span className="text-[10px] text-blue-600 font-semibold">
                      {isSelected ? 'Selected' : 'Filter →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search facilities, university, equipment, building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* University Filter Dropdown */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
            >
              <option value="all">All Participating Universities ({allFacilities.length} venues)</option>
              {allInstitutions.map((inst) => {
                const count = allFacilities.filter((f) => f.institutionId === inst.id).length;
                return (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.shortName}) - {count} spaces
                  </option>
                );
              })}
            </select>
          </div>

          {/* Capacity filter dropdown */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              <option value="All">All Capacities</option>
              <option value="1-30">Small (1 – 30)</option>
              <option value="31-60">Medium (31 – 60)</option>
              <option value="61-100">Large (61 – 100)</option>
              <option value="100+">Auditorium (100+)</option>
            </select>
          </div>
        </div>

        {/* Facility Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          <span className="text-[11px] font-semibold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Type:
          </span>
          {facilityTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                selectedType === type
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => {
          const hostInst = getInstitutionForFacility(facility.institutionId);
          const isExternal = facility.institutionId !== currentInstitution.id;
          const isExternalBlocked = isExternal && (!hostInst.allowExternalBookings || hostInst.bookingPolicy === 'internal_only');

          return (
            <div
              key={facility.id}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                  <img
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                  
                  {/* University Tag */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide border border-slate-700">
                    {hostInst.shortName}
                  </span>

                  {/* Policy Tag */}
                  <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold shadow-xs ${
                    hostInst.bookingPolicy === 'internal_only'
                      ? 'bg-amber-500 text-slate-950'
                      : hostInst.bookingPolicy === 'approval_required'
                      ? 'bg-blue-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {hostInst.bookingPolicy === 'internal_only'
                      ? 'Internal Only'
                      : hostInst.bookingPolicy === 'approval_required'
                      ? 'Approval Req.'
                      : 'External Allowed'}
                  </span>

                  {/* Capacity & Location */}
                  <div className="absolute bottom-2 left-3 right-3 text-white flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-200 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      {facility.building} · {facility.floor}
                    </p>
                    <span className="text-[11px] font-bold bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded text-white shrink-0">
                      {facility.capacity} seats
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {facility.type}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {hostInst.name}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {facility.description}
                    </p>
                  </div>

                  {/* Equipment Highlights */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Key Equipment:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {facility.equipment.slice(0, 3).map((eq, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[200px]"
                        >
                          {eq}
                        </span>
                      ))}
                      {facility.equipment.length > 3 && (
                        <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                          +{facility.equipment.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Operating hours strictly in 12-hour format */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-700">
                      {formatOperatingHours(facility.operatingHours.open, facility.operatingHours.close, facility.operatingHours.days)}
                    </span>
                  </div>

                  {/* Policy restriction note if external and blocked */}
                  {isExternalBlocked && (
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{hostInst.shortName} reserves this space strictly for internal campus members.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center gap-2">
                <button
                  onClick={() => setDetailModalFacility(facility)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                  <span>Details & Schedule</span>
                </button>

                <button
                  onClick={() => handleBookNow(facility)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                    isExternalBlocked
                      ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <span>{isExternalBlocked ? 'View Policy' : 'Book Request'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Building className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Facilities Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No facilities match your current university, search query, or capacity criteria. Try selecting All Universities or resetting filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedUniversity('all');
              setSelectedType('All');
              setCapacityFilter('All');
            }}
            className="px-3.5 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Facility Detail Modal */}
      {detailModalFacility && (
        <FacilityDetailModal
          facility={detailModalFacility}
          onClose={() => setDetailModalFacility(null)}
          onBookNow={handleBookNow}
        />
      )}
    </div>
  );
};
