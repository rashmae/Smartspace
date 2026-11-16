import React, { useState, useMemo } from 'react';
import { Facility, FacilityType, Institution } from '../types';
import { useApp } from '../context/AppContext';
import { FacilityDetailModal } from './FacilityDetailModal';
import { ResilientImage } from './ResilientImage';
import { motion } from 'motion/react';
import { SpringSurface } from './MotionPrimitives';
import {
  Search,
  Users,
  MapPin,
  Clock,
  CalendarDays,
  ArrowRight,
  Building,
  Building2,
  ShieldAlert,
  LayoutGrid,
  Presentation,
  Monitor,
  Briefcase,
  Theater,
  Sparkles,
  Tv,
  X,
} from 'lucide-react';
import { formatOperatingHours } from '../utils/timeFormat';

interface FacilityDirectoryProps {
  onRequestBookingWithSlot?: (
    facility: Facility,
    initialDate?: string,
    startTime?: string,
    endTime?: string
  ) => void;
}

export const FacilityDirectory: React.FC<FacilityDirectoryProps> = ({
  onRequestBookingWithSlot,
}) => {
  const {
    allFacilities,
    allInstitutions,
    currentInstitution,
    setSelectedFacility,
    setActiveView,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [capacityFilter, setCapacityFilter] = useState<string>('All');
  const [showUniversityShowcase, setShowUniversityShowcase] = useState(true);
  const [detailModalFacility, setDetailModalFacility] = useState<Facility | null>(null);

  const facilityCategories: { id: 'All' | FacilityType; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Spaces', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'Lecture Room', label: 'Lecture Rooms', icon: <Presentation className="w-4 h-4" /> },
    { id: 'Computer Laboratory', label: 'Computer Labs', icon: <Monitor className="w-4 h-4" /> },
    { id: 'Conference Room', label: 'Conference', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'University Auditorium', label: 'Auditoriums', icon: <Theater className="w-4 h-4" /> },
    { id: 'Student Activity Room', label: 'Activity Halls', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'Multimedia Presentation Hall', label: 'Multimedia', icon: <Tv className="w-4 h-4" /> },
  ];

  // Base facilities filtered by selected university
  const universityFacilities = useMemo(() => {
    if (selectedUniversity === 'all') return allFacilities;
    return allFacilities.filter((f) => f.institutionId === selectedUniversity);
  }, [allFacilities, selectedUniversity]);

  const filteredFacilities = useMemo(() => {
    return universityFacilities.filter((f) => {
      if (selectedType !== 'All' && f.type !== selectedType) {
        return false;
      }

      if (capacityFilter === '1-30' && f.capacity > 30) return false;
      if (capacityFilter === '31-60' && (f.capacity < 31 || f.capacity > 60)) return false;
      if (capacityFilter === '61-100' && (f.capacity < 61 || f.capacity > 100)) return false;
      if (capacityFilter === '100+' && f.capacity < 100) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesBuilding = f.building.toLowerCase().includes(q);
        const matchesEquipment = f.equipment.some((eq) => eq.toLowerCase().includes(q));
        const matchesDesc = f.description.toLowerCase().includes(q);

        const hostInst = allInstitutions.find((i) => i.id === f.institutionId);
        const matchesUniv =
          hostInst &&
          (hostInst.name.toLowerCase().includes(q) ||
            hostInst.shortName.toLowerCase().includes(q) ||
            hostInst.city.toLowerCase().includes(q));

        return matchesName || matchesBuilding || matchesEquipment || matchesDesc || matchesUniv;
      }

      return true;
    });
  }, [universityFacilities, selectedType, capacityFilter, searchQuery, allInstitutions]);

  const handleBookNow = (
    facility: Facility,
    initialDate?: string,
    startTime?: string,
    endTime?: string
  ) => {
    if (onRequestBookingWithSlot) {
      onRequestBookingWithSlot(facility, initialDate, startTime, endTime);
      return;
    }
    setSelectedFacility(facility);
    setActiveView('new-booking');
  };

  const getInstitutionForFacility = (institutionId: string): Institution => {
    return allInstitutions.find((i) => i.id === institutionId) || currentInstitution;
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedUniversity !== 'all' ||
    selectedType !== 'All' ||
    capacityFilter !== 'All';

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedUniversity('all');
    setSelectedType('All');
    setCapacityFilter('All');
  };

  return (
    <div className="space-y-8">
      {/* 1. EDITORIAL WORKSPACE HEADER (Notion + Linear Restraint) */}
      <div className="border-b border-slate-200 pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-semibold text-[#0077C8]">Multi-University Facility Network</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{allInstitutions.length} Institutions Active</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{allFacilities.length} Verified Spaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Cross-University Facility Directory
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Browse participating campuses, inspect live 12-hour schedules, and submit conflict-checked reservation requests. Home campus:{' '}
            <strong className="font-semibold text-slate-900">
              {currentInstitution.name} ({currentInstitution.shortName})
            </strong>
            .
          </p>
        </div>

        <div className="lg:max-w-sm border-l border-slate-200 pl-4 text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-800 block mb-0.5">Inter-Campus Policy</span>
          Partner universities accept external organization requests subject to host administrator clearance. Internal-only spaces are clearly noted.
        </div>
      </div>

      {/* 2. AIRBNB-STYLE UNIFIED SEGMENTED SEARCH BAR + ICON CATEGORY RAIL */}
      <div className="space-y-5">
        {/* Segmented Unified Search Bar */}
        <div className="bg-white rounded-2xl md:rounded-full border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow p-1.5 flex flex-col md:flex-row items-stretch md:items-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Segment 1: Keyword / Venue / Equipment */}
          <div className="flex-[1.4] px-4 py-2 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#005A9C] shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <label htmlFor="dir-search-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Search Space
              </label>
              <input
                id="dir-search-input"
                type="text"
                placeholder="Auditorium, projector, engineering hall..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-500 bg-transparent focus:outline-none truncate"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Segment 2: University Selector */}
          <div className="flex-1 px-4 py-2 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <label htmlFor="dir-campus-select" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Campus
              </label>
              <select
                id="dir-campus-select"
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
              >
                <option value="all">All Universities ({allFacilities.length})</option>
                {allInstitutions.map((inst) => {
                  const count = allFacilities.filter((f) => f.institutionId === inst.id).length;
                  return (
                    <option key={inst.id} value={inst.id}>
                      {inst.shortName} · {inst.city} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Segment 3: Capacity Filter */}
          <div className="flex-[0.8] px-4 py-2 flex items-center gap-2.5">
            <Users className="w-4 h-4 text-slate-600 shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <label htmlFor="dir-capacity-select" className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Capacity
              </label>
              <select
                id="dir-capacity-select"
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value)}
                className="w-full text-xs font-medium text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="All">Any size</option>
                <option value="1-30">1 – 30 seats</option>
                <option value="31-60">31 – 60 seats</option>
                <option value="61-100">61 – 100 seats</option>
                <option value="100+">100+ Auditorium</option>
              </select>
            </div>
          </div>

          {/* Segment 4: Result count / Reset Action */}
          <div className="px-2 py-1.5 md:pl-3 flex items-center justify-between md:justify-end gap-2 shrink-0">
            <span className="text-[11px] font-mono tabular-nums text-slate-600 md:hidden px-2">
              {filteredFacilities.length} spaces shown
            </span>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Reset ({filteredFacilities.length})
              </button>
            ) : (
              <div className="px-4 py-2 rounded-full bg-[#0077C8] text-white text-xs font-semibold tabular-nums whitespace-nowrap">
                {filteredFacilities.length} Available
              </div>
            )}
          </div>
        </div>

        {/* Airbnb-style Horizontal Scrollable Icon Category Rail with Framer layoutId underline */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-200">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pt-1">
            {facilityCategories.map((cat) => {
              const isActive = selectedType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedType(cat.id)}
                  className={`relative pb-3 flex flex-col items-center gap-1.5 shrink-0 cursor-pointer transition-colors ${
                    isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span aria-hidden="true" className={isActive ? 'text-[#005A9C]' : 'text-slate-600'}>
                    {cat.icon}
                  </span>
                  <span className="text-xs font-semibold whitespace-nowrap">{cat.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="dir-cat-line"
                      transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowUniversityShowcase(!showUniversityShowcase)}
            className="hidden sm:inline-flex items-center gap-1.5 pb-3 text-xs font-semibold text-slate-600 hover:text-[#005A9C] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Building className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showUniversityShowcase ? 'Hide Campus Filter' : 'Filter by Campus'}</span>
          </button>
        </div>

        {/* Participating Campus Selector Strip (Hairline 1px Matrix, Zero Pill Clutter) */}
        {showUniversityShowcase && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 bg-slate-200 gap-px rounded-xl overflow-hidden border border-slate-200">
            {allInstitutions.map((inst) => {
              const facCount = allFacilities.filter((f) => f.institutionId === inst.id).length;
              const isSelected = selectedUniversity === inst.id;
              const isHome = inst.id === currentInstitution.id;
              const policyText =
                inst.bookingPolicy === 'internal_only'
                  ? 'Internal Only'
                  : inst.bookingPolicy === 'approval_required'
                  ? 'Approval Required'
                  : 'External Allowed';

              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => setSelectedUniversity(isSelected ? 'all' : inst.id)}
                  className={`p-3.5 text-left transition-colors cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/90'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#005A9C]' : 'text-slate-900'}`}>
                        {inst.shortName}
                      </span>
                      {isHome && (
                        <span className="text-[10px] font-semibold text-[#005A9C] shrink-0">
                          Home Campus
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{inst.name}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-600 tabular-nums">
                      {facCount} spaces · {policyText}
                    </span>
                    <span className={`font-semibold ${isSelected ? 'text-[#005A9C]' : 'text-slate-600'}`}>
                      {isSelected ? 'Active' : 'Filter'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. LINEAR ARCHITECTURAL FACILITY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => {
          const hostInst = getInstitutionForFacility(facility.institutionId);
          const isExternal = facility.institutionId !== currentInstitution.id;
          const isExternalBlocked =
            isExternal && (!hostInst.allowExternalBookings || hostInst.bookingPolicy === 'internal_only');
          const policyLabel =
            hostInst.bookingPolicy === 'internal_only'
              ? 'Internal Only'
              : hostInst.bookingPolicy === 'approval_required'
              ? 'Approval Required'
              : 'External Allowed';

          return (
            <SpringSurface
              key={facility.id}
              className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Clean Architectural 3:2 Frame */}
                <div className="relative aspect-[3/2] w-full bg-slate-900 overflow-hidden">
                  <ResilientImage
                    src={facility.imageUrl}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    fallbackLabel={facility.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />

                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-200 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>
                          {facility.building} · {facility.floor}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-white tabular-nums shrink-0">
                      {facility.capacity} seats
                    </span>
                  </div>
                </div>

                {/* Card Body: Unboxed Metadata & Generous Restraint */}
                <div className="p-5 space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold text-[#0077C8]">
                        {facility.type}
                      </span>
                      <span className="text-slate-500 truncate">
                        {hostInst.shortName} · {policyLabel}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-[#0077C8] transition-colors line-clamp-1">
                      {facility.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {facility.description}
                    </p>
                  </div>

                  {/* Unboxed Equipment Line */}
                  <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    <span className="font-semibold text-slate-700">Equipment: </span>
                    <span>
                      {facility.equipment.slice(0, 3).join(' · ')}
                      {facility.equipment.length > 3 ? ` · +${facility.equipment.length - 3} more` : ''}
                    </span>
                  </div>

                  {/* Operating hours in 12-hour format */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 tabular-nums">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700">
                      {formatOperatingHours(
                        facility.operatingHours.open,
                        facility.operatingHours.close,
                        facility.operatingHours.days
                      )}
                    </span>
                  </div>

                  {isExternalBlocked && (
                    <div className="pt-2 border-t border-amber-100 text-[11px] text-amber-800 flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{hostInst.shortName} restricts this space to internal campus members.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDetailModalFacility(facility)}
                  className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                  <span>Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBookNow(facility)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isExternalBlocked
                      ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                      : 'bg-[#0077C8] hover:bg-[#0060a3] text-white'
                  }`}
                >
                  <span>{isExternalBlocked ? 'View Policy' : 'Book Request'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpringSurface>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFacilities.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <Building className="w-9 h-9 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No Facilities Match Current Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching to All Universities, widening seat capacity, or clearing the search filter.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
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
