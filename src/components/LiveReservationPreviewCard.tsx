import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarCheck, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  QrCode, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const LiveReservationPreviewCard: React.FC = () => {
  const { allFacilities, setSelectedFacility, setActiveView, setCurrentRole, currentInstitution } = useApp();

  const [selectedVenue, setSelectedVenue] = useState('ctu-fac-auditorium');
  const [selectedSlot, setSelectedSlot] = useState('2:00 PM - 5:00 PM');
  const [selectedDate, setSelectedDate] = useState('Today (Oct 28)');
  const [hasTestedCheck, setHasTestedCheck] = useState(true);

  const venues = [
    { id: 'ctu-fac-auditorium', name: 'Cultural Center Auditorium', cap: '350 seats', floor: 'Level 1' },
    { id: 'ctu-fac-commlab-1', name: 'Computer Lab 1 (Software)', cap: '45 PCs', floor: 'Level 2' },
    { id: 'ctu-fac-innovation', name: 'Innovation Studio & Pitch Stage', cap: '70 seats', floor: 'Level 3' },
  ];

  const handleLaunchBooking = () => {
    const facilityToSelect = allFacilities.find((f) => f.id === selectedVenue) || allFacilities[0] || null;
    setSelectedFacility(facilityToSelect);
    setCurrentRole('student');
    setActiveView('new-booking');
  };

  const activeVenueData = venues.find((v) => v.id === selectedVenue) || venues[0];

  return (
    <div className="w-full max-w-lg bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-6 text-white backdrop-blur-md space-y-5">
      {/* Card Top Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-200">
            Interactive Reservation Engine
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-800">
          Live Conflict Guard
        </span>
      </div>

      {/* Interactive Venue Picker */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          1. Select Campus Space
        </label>
        <div className="grid grid-cols-1 gap-2">
          {venues.map((venue) => (
            <button
              key={venue.id}
              type="button"
              onClick={() => setSelectedVenue(venue.id)}
              className={`p-2.5 rounded-xl text-left border text-xs transition-all flex items-center justify-between cursor-pointer ${
                selectedVenue === venue.id
                  ? 'bg-purple-900/50 border-purple-500 text-white shadow-xs ring-1 ring-purple-500/50'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <span className="font-bold block">{venue.name}</span>
                <span className="text-[10px] text-slate-400 block">{venue.floor} · {venue.cap}</span>
              </div>
              {selectedVenue === venue.id && (
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time Slot Selector */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Target Date
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="Today (Oct 28)">Today (Oct 28)</option>
            <option value="Tomorrow (Oct 29)">Tomorrow (Oct 29)</option>
            <option value="Friday (Oct 31)">Friday (Oct 31)</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Timeslot
          </label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
          >
            <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM (Morning)</option>
            <option value="2:00 PM - 5:00 PM">2:00 PM - 5:00 PM (Afternoon)</option>
            <option value="5:30 PM - 8:30 PM">5:30 PM - 8:30 PM (Evening)</option>
          </select>
        </div>
      </div>

      {/* Live Verification Result Box */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Instant Slot Verification Passed</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-300">0.02s check</span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <strong>{activeVenueData.name}</strong> is clear on <strong>{selectedDate}</strong> for <strong>{selectedSlot}</strong>. No overlapping bookings.
        </p>
      </div>

      {/* Action CTA Button */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleLaunchBooking}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Complete Booking Request for {activeVenueData.name.split(' ')[0]}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[10px] text-center text-slate-400">
          Submits directly to {currentInstitution.name} facility review queue.
        </p>
      </div>
    </div>
  );
};
