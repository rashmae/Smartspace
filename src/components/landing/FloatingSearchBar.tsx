import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Minus, Plus, Search, Users } from 'lucide-react';
import { Institution } from '../../types';

export type VenueCategoryChip =
  | 'All'
  | 'Auditorium'
  | 'Gymnasium'
  | 'Courts'
  | 'Laboratory'
  | 'Lecture Hall'
  | 'Conference Room';

export const VENUE_TYPE_OPTIONS: { id: VenueCategoryChip; label: string }[] = [
  { id: 'All', label: 'All venue types' },
  { id: 'Auditorium', label: 'Auditorium' },
  { id: 'Gymnasium', label: 'Gymnasium' },
  { id: 'Courts', label: 'Courts' },
  { id: 'Laboratory', label: 'Laboratory' },
  { id: 'Lecture Hall', label: 'Lecture Hall' },
  { id: 'Conference Room', label: 'Conference Room' },
];

interface FloatingSearchBarProps {
  institutions: Institution[];
  campus: string;
  onCampusChange: (campusId: string) => void;
  venueType: VenueCategoryChip;
  onVenueTypeChange: (type: VenueCategoryChip) => void;
  dateISO: string;
  onDateChange: (dateISO: string) => void;
  peopleCount: number;
  onPeopleCountChange: (count: number) => void;
  onSearch: () => void;
}

function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

function formatReadableDate(iso: string): string {
  if (!iso) return 'Any date';
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  institutions,
  campus,
  onCampusChange,
  venueType,
  onVenueTypeChange,
  dateISO,
  onDateChange,
  peopleCount,
  onPeopleCountChange,
  onSearch,
}) => {
  const baseId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const dateTriggerRef = useRef<HTMLButtonElement>(null);
  const peopleTriggerRef = useRef<HTMLButtonElement>(null);

  const [openPopover, setOpenPopover] = useState<'date' | 'people' | null>(null);

  const todayISO = useMemo(() => toLocalISODate(new Date()), []);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const base = dateISO ? parseISODate(dateISO) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  // Close popovers on outside click and Escape
  useEffect(() => {
    if (!openPopover) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPopover(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        const closing = openPopover;
        setOpenPopover(null);
        if (closing === 'date') dateTriggerRef.current?.focus();
        if (closing === 'people') peopleTriggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openPopover]);

  const monthLabel = calendarMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const canGoPrevMonth = useMemo(() => {
    const now = new Date();
    return (
      calendarMonth.getFullYear() > now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() &&
        calendarMonth.getMonth() > now.getMonth())
    );
  }, [calendarMonth]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: ({ iso: string; day: number; disabled: boolean } | null)[] = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = toLocalISODate(new Date(year, month, day));
      cells.push({
        iso,
        day,
        disabled: iso < todayISO,
      });
    }
    return cells;
  }, [calendarMonth, todayISO]);

  const activeCampuses = useMemo(
    () => institutions.filter((inst) => inst.status === 'active' || inst.status === 'trial'),
    [institutions]
  );

  const tileClass = (fieldKey: string) =>
    `relative px-3.5 py-2.5 rounded-[18px] transition-all duration-200 flex flex-col justify-center min-w-0 hover:bg-white hover:shadow-[0_6px_20px_rgba(11,21,40,0.09)] focus-within:bg-white focus-within:shadow-[0_6px_20px_rgba(11,21,40,0.09)] ${
      openPopover === fieldKey
        ? 'bg-white shadow-[0_6px_20px_rgba(11,21,40,0.09)]'
        : 'bg-transparent'
    }`;

  return (
    <div
      ref={containerRef}
      role="search"
      aria-label="Search campus facilities"
      className="relative z-20 mx-auto w-[min(900px,calc(100%-40px))] rounded-[26px] border border-white/80 bg-white/[0.93] backdrop-blur-md shadow-[0_24px_60px_rgba(11,21,40,0.18)] p-2.5 md:px-3.5 md:py-2.5 text-[#0B1528]"
    >
      <div className="grid grid-cols-2 md:grid-cols-[1.25fr_1.1fr_1fr_0.9fr_auto] items-center gap-1.5 md:gap-2 md:min-h-[70px]">
        {/* Field 1: Campus */}
        <div className={tileClass('campus')}>
          <label
            htmlFor={`${baseId}-campus`}
            className="block text-[11px] font-bold tracking-wide text-[#4a5a73] mb-0.5 truncate"
          >
            Campus
          </label>
          <select
            id={`${baseId}-campus`}
            value={campus}
            onChange={(e) => onCampusChange(e.target.value)}
            className="w-full bg-transparent text-[13px] font-semibold text-[#0B1528] focus:outline-none cursor-pointer truncate pr-2 min-h-[24px]"
          >
            <option value="all">All campuses</option>
            {activeCampuses.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.shortName} · {inst.name}
              </option>
            ))}
          </select>
        </div>

        {/* Field 2: Venue type */}
        <div className={tileClass('venue')}>
          <label
            htmlFor={`${baseId}-venue`}
            className="block text-[11px] font-bold tracking-wide text-[#4a5a73] mb-0.5 truncate"
          >
            Venue type
          </label>
          <select
            id={`${baseId}-venue`}
            value={venueType}
            onChange={(e) => onVenueTypeChange(e.target.value as VenueCategoryChip)}
            className="w-full bg-transparent text-[13px] font-semibold text-[#0B1528] focus:outline-none cursor-pointer truncate pr-2 min-h-[24px]"
          >
            {VENUE_TYPE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Field 3: Date (Calendar Popover) */}
        <div className={tileClass('date')}>
          <label
            htmlFor={`${baseId}-date-btn`}
            className="block text-[11px] font-bold tracking-wide text-[#4a5a73] mb-0.5 truncate"
          >
            Date
          </label>
          <button
            ref={dateTriggerRef}
            id={`${baseId}-date-btn`}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openPopover === 'date'}
            onClick={() => setOpenPopover((prev) => (prev === 'date' ? null : 'date'))}
            className="w-full text-left flex items-center justify-between gap-2 text-[13px] font-semibold text-[#0B1528] cursor-pointer min-h-[24px]"
          >
            <span className="truncate">{formatReadableDate(dateISO)}</span>
            <Calendar className="w-3.5 h-3.5 text-[#4a5a73] shrink-0" aria-hidden="true" />
          </button>

          {openPopover === 'date' && (
            <div
              role="dialog"
              aria-label="Choose target date"
              className="absolute left-0 bottom-[calc(100%+12px)] z-40 w-[296px] rounded-2xl bg-white border border-[#0B1528]/12 shadow-[0_24px_60px_rgba(11,21,40,0.22)] p-4 text-[#0B1528]"
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  disabled={!canGoPrevMonth}
                  aria-label="Previous month"
                  onClick={() =>
                    setCalendarMonth(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                    )
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>
                <span className="text-xs font-bold text-[#0B1528]">{monthLabel}</span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() =>
                    setCalendarMonth(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                    )
                  }
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#4a5a73] mb-1.5">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd) => (
                  <span key={wd}>{wd}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell, idx) => {
                  if (!cell) {
                    return <span key={`empty-${idx}`} aria-hidden="true" />;
                  }
                  const isSelected = dateISO === cell.iso;
                  const isToday = todayISO === cell.iso;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      disabled={cell.disabled}
                      aria-label={formatReadableDate(cell.iso)}
                      aria-pressed={isSelected}
                      onClick={() => {
                        onDateChange(cell.iso);
                        setOpenPopover(null);
                        dateTriggerRef.current?.focus();
                      }}
                      className={`h-8 w-8 mx-auto rounded-full text-xs font-semibold tabular-nums flex items-center justify-center transition-colors ${
                        cell.disabled
                          ? 'text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#0077C8] text-white cursor-pointer'
                          : isToday
                          ? 'border border-[#0077C8] text-[#0077C8] hover:bg-blue-50 cursor-pointer'
                          : 'text-[#0B1528] hover:bg-slate-100 cursor-pointer'
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onDateChange('');
                    setOpenPopover(null);
                    dateTriggerRef.current?.focus();
                  }}
                  className="font-semibold text-[#4a5a73] hover:text-[#0B1528] cursor-pointer px-2 py-1 rounded-md"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDateChange(todayISO);
                    setOpenPopover(null);
                    dateTriggerRef.current?.focus();
                  }}
                  className="font-semibold text-[#0077C8] hover:underline cursor-pointer px-2 py-1 rounded-md"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Field 4: People (Stepper Popover) */}
        <div className={tileClass('people')}>
          <label
            htmlFor={`${baseId}-people-btn`}
            className="block text-[11px] font-bold tracking-wide text-[#4a5a73] mb-0.5 truncate"
          >
            People
          </label>
          <button
            ref={peopleTriggerRef}
            id={`${baseId}-people-btn`}
            type="button"
            aria-haspopup="dialog"
            aria-expanded={openPopover === 'people'}
            onClick={() => setOpenPopover((prev) => (prev === 'people' ? null : 'people'))}
            className="w-full text-left flex items-center justify-between gap-2 text-[13px] font-semibold text-[#0B1528] cursor-pointer min-h-[24px] tabular-nums"
          >
            <span className="truncate">
              {peopleCount > 0 ? `${peopleCount}+ seats` : 'Any size'}
            </span>
            <Users className="w-3.5 h-3.5 text-[#4a5a73] shrink-0" aria-hidden="true" />
          </button>

          {openPopover === 'people' && (
            <div
              role="dialog"
              aria-label="Choose minimum seating capacity"
              className="absolute right-0 bottom-[calc(100%+12px)] z-40 w-[264px] rounded-2xl bg-white border border-[#0B1528]/12 shadow-[0_24px_60px_rgba(11,21,40,0.22)] p-4 text-[#0B1528] space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#0B1528] block">Attendees</span>
                  <span className="text-[11px] text-[#4a5a73]">Minimum capacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease attendees"
                    disabled={peopleCount <= 0}
                    onClick={() =>
                      onPeopleCountChange(peopleCount <= 10 ? 0 : peopleCount - 10)
                    }
                    className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span
                    aria-live="polite"
                    className="w-10 text-center text-sm font-bold tabular-nums"
                  >
                    {peopleCount}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase attendees"
                    onClick={() =>
                      onPeopleCountChange(peopleCount === 0 ? 20 : Math.min(1000, peopleCount + 10))
                    }
                    className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {[0, 30, 60, 100, 300].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onPeopleCountChange(preset)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tabular-nums cursor-pointer transition-colors ${
                      peopleCount === preset
                        ? 'bg-[#0077C8] text-white'
                        : 'bg-slate-100 text-[#0B1528] hover:bg-slate-200'
                    }`}
                  >
                    {preset === 0 ? 'Any' : `${preset}+`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Button with visible text "Search facilities" */}
        <button
          type="button"
          onClick={() => {
            setOpenPopover(null);
            onSearch();
          }}
          className="col-span-2 md:col-span-1 w-full md:w-auto px-6 py-3.5 rounded-[18px] bg-[#0077C8] hover:bg-[#005fa3] text-white text-[13px] font-bold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 min-h-[50px]"
        >
          <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Search facilities</span>
        </button>
      </div>
    </div>
  );
};
