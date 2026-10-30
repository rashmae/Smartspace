import React, { useState, useMemo } from 'react';
import { Facility, BookingRequest } from '../types';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatTo12Hour, formatTimeRange } from '../utils/timeFormat';

interface AvailabilityScheduleProps {
  facility: Facility;
  selectedDate?: string;
  onSelectSlot?: (date: string, startTime: string, endTime: string) => void;
}

export const AvailabilitySchedule: React.FC<AvailabilityScheduleProps> = ({
  facility,
  selectedDate: initialDate,
  onSelectSlot,
}) => {
  const { allBookings, setActiveView, setSelectedFacility } = useApp();

  const getToday = () => new Date().toISOString().split('T')[0];
  const [activeDate, setActiveDate] = useState<string>(initialDate || getToday());

  // Filter bookings for this facility and active date across all bookings
  const dayBookings = useMemo(() => {
    return allBookings.filter(
      (b) => b.facilityId === facility.id && b.date === activeDate
    );
  }, [allBookings, facility.id, activeDate]);

  // Generate hourly slots from 07:00 to 20:00
  const hours = useMemo(() => {
    const slots = [];
    for (let h = 7; h <= 19; h++) {
      const startH = h.toString().padStart(2, '0') + ':00';
      const endH = (h + 1).toString().padStart(2, '0') + ':00';
      
      const toMin = (t: string) => {
        const [hr, min] = t.split(':').map(Number);
        return hr * 60 + min;
      };

      const slotStart = toMin(startH);
      const slotEnd = toMin(endH);

      // Check if any booking overlaps with this slot
      const overlappingApproved = dayBookings.find((b) => {
        if (b.status !== 'approved') return false;
        const bStart = toMin(b.startTime);
        const bEnd = toMin(b.endTime);
        return slotStart < bEnd && slotEnd > bStart;
      });

      const overlappingPending = dayBookings.find((b) => {
        if (b.status !== 'pending') return false;
        const bStart = toMin(b.startTime);
        const bEnd = toMin(b.endTime);
        return slotStart < bEnd && slotEnd > bStart;
      });

      slots.push({
        start: startH,
        end: endH,
        approvedBooking: overlappingApproved,
        pendingBooking: overlappingPending,
        isAvailable: !overlappingApproved,
      });
    }
    return slots;
  }, [dayBookings]);

  const approvedCount = dayBookings.filter((b) => b.status === 'approved').length;
  const pendingCount = dayBookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="space-y-4">
      {/* Date selector bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-semibold text-slate-700">Check Date:</span>
          <input
            type="date"
            value={activeDate}
            min={getToday()}
            onChange={(e) => setActiveDate(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></span>
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500"></span>
            Pending Request
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-600/20 border border-blue-600"></span>
            Booked (Approved)
          </span>
        </div>
      </div>

      {/* Summary status notice */}
      <div className="text-xs flex items-center justify-between text-slate-600 px-1">
        <span>
          Schedule for <strong className="text-slate-800">{activeDate}</strong> ({formatTimeRange(facility.operatingHours.open, facility.operatingHours.close)})
        </span>
        <span className="text-[11px] text-slate-500">
          {approvedCount} confirmed reservation(s) · {pendingCount} pending review
        </span>
      </div>

      {/* Hourly Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {hours.map((slot) => {
          let cardStyle = 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 text-emerald-950';
          let statusBadge = (
            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Available
            </span>
          );
          let extraInfo = null;

          if (slot.approvedBooking) {
            cardStyle = 'bg-blue-50 border-blue-300 text-blue-950';
            statusBadge = (
              <span className="text-[10px] font-semibold text-blue-800 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-blue-600" /> Booked
              </span>
            );
            extraInfo = (
              <div className="text-[10px] text-blue-700 truncate mt-0.5" title={slot.approvedBooking.eventName}>
                {slot.approvedBooking.eventName}
              </div>
            );
          } else if (slot.pendingBooking) {
            cardStyle = 'bg-amber-50 border-amber-200 text-amber-950';
            statusBadge = (
              <span className="text-[10px] font-semibold text-amber-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Pending Request
              </span>
            );
            extraInfo = (
              <div className="text-[10px] text-amber-700 truncate mt-0.5" title={slot.pendingBooking.eventName}>
                {slot.pendingBooking.eventName} (Under Review)
              </div>
            );
          }

          return (
            <div
              key={slot.start}
              onClick={() => {
                if (slot.isAvailable && onSelectSlot) {
                  onSelectSlot(activeDate, slot.start, slot.end);
                }
              }}
              className={`p-2.5 rounded-lg border text-xs transition-all ${cardStyle} ${
                slot.isAvailable && onSelectSlot ? 'cursor-pointer hover:shadow-xs' : ''
              }`}
            >
              <div className="flex items-center justify-between font-mono font-medium text-slate-800">
                <span>{formatTimeRange(slot.start, slot.end)}</span>
                {statusBadge}
              </div>
              {extraInfo}
              {slot.isAvailable && onSelectSlot && (
                <div className="text-[10px] text-emerald-600 mt-1 font-medium hover:underline">
                  Click to select this slot →
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Conflict Explanation Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800">SmartSpace Availability Policy:</strong>
          <span className="ml-1">
            Pending requests do not block booking submissions until approved by the Facility Administrator. However, submitted requests will be flagged with a conflict warning if another reservation is approved for the same time slot.
          </span>
        </div>
      </div>
    </div>
  );
};
