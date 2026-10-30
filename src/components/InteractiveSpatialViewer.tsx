import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Layers, 
  Eye, 
  Sparkles, 
  Compass, 
  Maximize2, 
  Users, 
  Tv, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  CalendarCheck,
  ChevronRight,
  ArrowRight,
  Building2,
  Sliders
} from 'lucide-react';

interface SpatialRoom {
  id: string;
  name: string;
  code: string;
  category: 'lecture' | 'lab' | 'auditorium' | 'conference';
  capacity: number;
  floor: 1 | 2 | 3;
  status: 'available' | 'occupied' | 'pending';
  currentOccupant?: string;
  nextAvailable: string;
  equipment: string[];
  x: number; // grid position (percentage)
  y: number;
  w: number;
  h: number;
  color: string;
}

export const InteractiveSpatialViewer: React.FC = () => {
  const { allFacilities, setSelectedFacility, setActiveView, setCurrentRole, currentInstitution } = useApp();
  
  const [selectedFloor, setSelectedFloor] = useState<1 | 2 | 3>(2);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [hoveredRoom, setHoveredRoom] = useState<SpatialRoom | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<SpatialRoom | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const floorRooms: SpatialRoom[] = [
    // Floor 1: Ground Complex
    {
      id: 'ctu-fac-auditorium',
      name: 'Main Campus Cultural Center Auditorium',
      code: 'AUD-101',
      category: 'auditorium',
      capacity: 350,
      floor: 1,
      status: 'occupied',
      currentOccupant: 'University Convocation Assembly',
      nextAvailable: 'Today at 4:00 PM',
      equipment: ['Line Array PA System', '4K Projection Wall', 'Stage Lighting Rig', 'VIP Green Room'],
      x: 10,
      y: 15,
      w: 48,
      h: 68,
      color: 'from-purple-600/30 to-indigo-600/30',
    },
    {
      id: 'ground-conf',
      name: 'Executive Boardroom & Meeting Suite',
      code: 'CONF-102',
      category: 'conference',
      capacity: 25,
      floor: 1,
      status: 'available',
      nextAvailable: 'Available Now',
      equipment: ['Dual Display Video Bar', 'Wireless Screen Share', 'Polycom Acoustic Fence'],
      x: 62,
      y: 15,
      w: 28,
      h: 30,
      color: 'from-emerald-600/30 to-teal-600/30',
    },
    {
      id: 'ground-lounge',
      name: 'Student Org Resource Hub & Lounge',
      code: 'HUB-103',
      category: 'lecture',
      capacity: 60,
      floor: 1,
      status: 'available',
      nextAvailable: 'Available Now',
      equipment: ['Modular Armchairs', 'Mobile Dry Erase Boards', 'High-Speed Wi-Fi 6'],
      x: 62,
      y: 50,
      w: 28,
      h: 33,
      color: 'from-blue-600/30 to-cyan-600/30',
    },

    // Floor 2: Academic & Laboratory Wing
    {
      id: 'ctu-fac-commlab-1',
      name: 'Computer Laboratory 1 (Software Engineering)',
      code: 'LAB-201',
      category: 'lab',
      capacity: 45,
      floor: 2,
      status: 'occupied',
      currentOccupant: 'CS 302: Database Systems Lab',
      nextAvailable: 'Today at 3:30 PM',
      equipment: ['45 High-Spec Workstations', 'Gigabit Managed LAN', 'Central Overhead Projector'],
      x: 10,
      y: 15,
      w: 36,
      h: 38,
      color: 'from-amber-600/30 to-orange-600/30',
    },
    {
      id: 'ctu-fac-lecture-a',
      name: 'Lecture Room A (Smart Classroom)',
      code: 'LEC-202',
      category: 'lecture',
      capacity: 40,
      floor: 2,
      status: 'available',
      nextAvailable: 'Available Now',
      equipment: ['Interactive Smart Board', 'Air Conditioning', 'HDMI Faculty Lectern'],
      x: 50,
      y: 15,
      w: 40,
      h: 38,
      color: 'from-emerald-600/30 to-teal-600/30',
    },
    {
      id: 'ctu-fac-stem-lab',
      name: 'Advanced Microelectronics & IoT Lab',
      code: 'LAB-203',
      category: 'lab',
      capacity: 30,
      floor: 2,
      status: 'pending',
      currentOccupant: 'Robotics Club Project (Pending Approval)',
      nextAvailable: 'Pending Review for 5:00 PM',
      equipment: ['Oscilloscopes & Power Benches', 'Soldering Exhaust Stations', '3D Prototyping Printers'],
      x: 10,
      y: 57,
      w: 42,
      h: 31,
      color: 'from-purple-600/30 to-pink-600/30',
    },
    {
      id: 'ctu-fac-seminar-hall',
      name: 'College Deanery Seminar Room',
      code: 'SEM-204',
      category: 'conference',
      capacity: 55,
      floor: 2,
      status: 'available',
      nextAvailable: 'Available Now',
      equipment: ['Dual Laser Projectors', 'Wireless Lapel Mics', 'Tiered Executive Seating'],
      x: 56,
      y: 57,
      w: 34,
      h: 31,
      color: 'from-blue-600/30 to-indigo-600/30',
    },

    // Floor 3: Innovation Pavilion & Multi-Purpose
    {
      id: 'ctu-fac-innovation',
      name: 'Technopreneurship & Incubation Studio',
      code: 'INN-301',
      category: 'conference',
      capacity: 70,
      floor: 3,
      status: 'available',
      nextAvailable: 'Available Now',
      equipment: ['Movable Breakout Pods', 'Pitch Presentation Stage', 'Acoustic Wall Panels'],
      x: 10,
      y: 15,
      w: 45,
      h: 73,
      color: 'from-emerald-600/30 to-cyan-600/30',
    },
    {
      id: 'ctu-fac-avr-3',
      name: 'Audio-Visual Multi-Media Screening Room',
      code: 'AVR-302',
      category: 'auditorium',
      capacity: 90,
      floor: 3,
      status: 'occupied',
      currentOccupant: 'Department Film Screening',
      nextAvailable: 'Today at 6:00 PM',
      equipment: ['7.1 Surround Sound', 'Motorized Cinema Screen', 'Blackout Automated Blinds'],
      x: 59,
      y: 15,
      w: 31,
      h: 42,
      color: 'from-rose-600/30 to-purple-600/30',
    },
    {
      id: 'faculty-lounge-3',
      name: 'Inter-College Research Collaboration Room',
      code: 'RES-303',
      category: 'conference',
      capacity: 20,
      floor: 3,
      status: 'available',
      nextAvailable: 'Available Now',
      equipment: ['Conference Camera 360', 'Glass Writing Boards', 'Coffee & Water Station'],
      x: 59,
      y: 61,
      w: 31,
      h: 27,
      color: 'from-teal-600/30 to-emerald-600/30',
    },
  ];

  const currentRooms = floorRooms.filter(
    (room) => room.floor === selectedFloor && (filterCategory === 'all' || room.category === filterCategory)
  );

  const activeFocusRoom = hoveredRoom || selectedRoom || currentRooms[0];

  const handleBookRoom = (room: SpatialRoom) => {
    const facilityToSelect = allFacilities.find((f) => f.id === room.id) || allFacilities[0] || null;
    setSelectedFacility(facilityToSelect);
    setCurrentRole('student');
    setActiveView('new-booking');
  };

  return (
    <section id="spatial-explorer" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive 3D Spatial Campus Explorer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Explore Campus Floors in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Inspired by next-generation spatial computing. Click any room to inspect physical capacity, AV equipment, and live reservation status directly on the digital campus twin.
          </p>
        </div>

        {/* View Controls & 3D Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setIs3DMode(true)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                is3DMode
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3D Isometric
            </button>
            <button
              onClick={() => setIs3DMode(false)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                !is3DMode
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2D Blueprint
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Isometric Viewport */}
        <div className="lg:col-span-8 bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Subtle Grid Ambient Lines */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px), radial-gradient(#818cf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px'
            }}
          />

          {/* Top Bar inside Canvas: Campus Selector & Floor Tabs */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                {currentInstitution.name} · Academic Complex
              </span>
            </div>

            {/* Floor Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => {
                  setSelectedFloor(1);
                  setSelectedRoom(null);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedFloor === 1
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Level 1 · Ground
              </button>
              <button
                onClick={() => {
                  setSelectedFloor(2);
                  setSelectedRoom(null);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedFloor === 2
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Level 2 · Academics
              </button>
              <button
                onClick={() => {
                  setSelectedFloor(3);
                  setSelectedRoom(null);
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedFloor === 3
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Level 3 · Innovation
              </button>
            </div>
          </div>

          {/* Interactive Campus Plane with CSS 3D Transformation */}
          <div className="relative z-10 py-8 px-2 flex items-center justify-center my-auto min-h-[320px] overflow-visible">
            <div
              className="w-full max-w-[580px] aspect-[4/3] relative rounded-2xl border-2 border-indigo-500/40 bg-slate-900/90 shadow-[0_20px_50px_rgba(79,70,229,0.15)] transition-all duration-500 ease-out"
              style={
                is3DMode
                  ? {
                      transform: 'perspective(900px) rotateX(46deg) rotateZ(-22deg) translateZ(10px)',
                      boxShadow: '-20px 25px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(99, 102, 241, 0.2)',
                    }
                  : {
                      transform: 'none',
                    }
              }
            >
              {/* Floor Label inside blueprint */}
              <div className="absolute -top-6 left-0 text-[10px] uppercase tracking-widest font-black text-indigo-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Level 0{selectedFloor} Digital Spatial Plane</span>
              </div>

              {/* Rooms in Current Floor */}
              {currentRooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                const isHovered = hoveredRoom?.id === room.id;

                let statusBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                let statusDot = 'bg-emerald-400';
                if (room.status === 'occupied') {
                  statusBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                  statusDot = 'bg-rose-400';
                } else if (room.status === 'pending') {
                  statusBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                  statusDot = 'bg-amber-400 animate-ping';
                }

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    style={{
                      left: `${room.x}%`,
                      top: `${room.y}%`,
                      width: `${room.w}%`,
                      height: `${room.h}%`,
                    }}
                    className={`absolute rounded-xl border transition-all duration-300 cursor-pointer p-2.5 flex flex-col justify-between overflow-hidden backdrop-blur-xs select-none ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-600/40 shadow-[0_0_25px_rgba(99,102,241,0.6)] ring-2 ring-indigo-400/80 -translate-y-1'
                        : isHovered
                        ? 'border-purple-400 bg-purple-600/30 shadow-[0_0_15px_rgba(168,85,247,0.4)] -translate-y-0.5'
                        : 'border-slate-700/80 bg-slate-800/60 hover:bg-slate-800/90'
                    }`}
                  >
                    {/* Top Row: Room Code & Status Pulse */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white/90">
                        {room.code}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                        <span className="text-[9px] font-bold text-slate-300 capitalize hidden sm:inline">
                          {room.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Room Name */}
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white line-clamp-1">
                        {room.name}
                      </p>
                      <p className="text-[9px] text-slate-400 flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" />
                        <span>Cap: {room.capacity} seats</span>
                      </p>
                    </div>

                    {/* Bottom Status pill */}
                    <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-white/10">
                      <span className="truncate">{room.nextAvailable}</span>
                      <span className="text-purple-300 font-bold uppercase">Inspect →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Canvas Footer: Legend & Status Guide */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-medium text-slate-300">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="text-[11px] font-medium text-slate-300">In Session</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-[11px] font-medium text-slate-300">Pending Review</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Hover to preview · Click room to inspect full facility specifications
            </p>
          </div>
        </div>

        {/* Right: Room Specification Inspector Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                  {activeFocusRoom.code} · Level {activeFocusRoom.floor}
                </span>
                <h3 className="text-lg font-black text-slate-950 pt-1 leading-snug">
                  {activeFocusRoom.name}
                </h3>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                  activeFocusRoom.status === 'available'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : activeFocusRoom.status === 'occupied'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {activeFocusRoom.status === 'available'
                  ? 'Available'
                  : activeFocusRoom.status === 'occupied'
                  ? 'Occupied'
                  : 'Pending Approval'}
              </span>
            </div>

            {/* Current Occupancy or Next Window */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Availability Status:</span>
                </span>
                <span className="font-bold text-slate-900">{activeFocusRoom.nextAvailable}</span>
              </div>
              {activeFocusRoom.currentOccupant && (
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  Current Session: <strong className="text-slate-800">{activeFocusRoom.currentOccupant}</strong>
                </div>
              )}
            </div>

            {/* Capacity & Category */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                  Max Capacity
                </span>
                <p className="text-base font-black text-purple-950">
                  {activeFocusRoom.capacity} People
                </p>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Venue Type
                </span>
                <p className="text-base font-black text-indigo-950 capitalize">
                  {activeFocusRoom.category}
                </p>
              </div>
            </div>

            {/* Installed Equipment checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-indigo-600" />
                <span>Installed Venue Amenities</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeFocusRoom.equipment.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTA: Reserve this space */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleBookRoom(activeFocusRoom)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Reserve {activeFocusRoom.code} on SmartSpace</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Instantly verifies real-time schedules to eliminate double bookings.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
