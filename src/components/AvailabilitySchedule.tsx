import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookingRequest, Facility } from '../types';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  RotateCcw,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { formatTo12Hour } from '../utils/timeFormat';

export interface AvailabilityScheduleProps {
  facility: Facility;
  selectedDate?: string;
  onSelectSlot?: (date: string, startTime: string, endTime: string) => void;
  isBlocked?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  theme?: 'light' | 'dark';
}

const SLOT_START_HOUR = 7; // 7:00 AM
const SLOT_END_HOUR = 20; // 8:00 PM
const SLOT_STEP_MINS = 30;
const TOTAL_SLOTS = ((SLOT_END_HOUR - SLOT_START_HOUR) * 60) / SLOT_STEP_MINS; // 26 half-hour slots
const HOUR_COUNT = SLOT_END_HOUR - SLOT_START_HOUR; // 13 major hours (7 AM .. 7 PM)

function toMinutes(timeStr: string): number {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function minutesToHHMM(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function slotIndexToStartTime(idx: number): string {
  return minutesToHHMM(SLOT_START_HOUR * 60 + idx * SLOT_STEP_MINS);
}

function slotIndexToEndTime(idx: number): string {
  return minutesToHHMM(SLOT_START_HOUR * 60 + (idx + 1) * SLOT_STEP_MINS);
}

function formatLocalDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDateISO(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function addDaysISO(dateStr: string, days: number): string {
  const d = parseLocalDateISO(dateStr);
  d.setDate(d.getDate() + days);
  return formatLocalDateISO(d);
}

function getMondayOfWeekISO(dateStr: string): string {
  const d = parseLocalDateISO(dateStr);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatLocalDateISO(d);
}

function formatDayShort(dateStr: string): { weekday: string; monthDay: string; full: string } {
  const d = parseLocalDateISO(dateStr);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const full = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return { weekday, monthDay, full };
}

function formatWeekRangeLabel(weekStartISO: string): string {
  const start = parseLocalDateISO(weekStartISO);
  const end = parseLocalDateISO(addDaysISO(weekStartISO, 6));
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function formatDurationLabel(startIdx: number, endIdx: number): string {
  const totalMins = (endIdx - startIdx + 1) * SLOT_STEP_MINS;
  const hrs = totalMins / 60;
  if (Number.isInteger(hrs)) {
    return hrs === 1 ? '1 hour' : `${hrs} hours`;
  }
  return `${hrs} hours`;
}

function isFacilityOpenOnDay(daysSpec: string | undefined, dateStr: string): boolean {
  if (!daysSpec) return true;
  const normalized = daysSpec.toLowerCase();
  if (normalized.includes('daily') || normalized.includes('mon') && normalized.includes('sun')) {
    return true;
  }
  const day = parseLocalDateISO(dateStr).getDay(); // 0=Sun..6=Sat
  if (day === 0 && (normalized.includes('mon') && (normalized.includes('sat') || normalized.includes('fri')))) {
    return false;
  }
  if (day === 6 && normalized.includes('mon') && normalized.includes('fri') && !normalized.includes('sat')) {
    return false;
  }
  return true;
}

interface RangeSelection {
  date: string;
  startIdx: number;
  endIdx: number;
}

export const AvailabilitySchedule: React.FC<AvailabilityScheduleProps> = ({
  facility,
  selectedDate: initialDate,
  onSelectSlot,
  isBlocked = false,
  isLoading = false,
  error = null,
  onRetry,
  theme = 'light',
}) => {
  const {
    allBookings,
    checkTimeConflict,
    allInstitutions,
    currentInstitution,
    currentUser,
  } = useApp();

  const [nowDate, setNowDate] = useState<Date>(() => new Date());
  const todayISO = useMemo(() => formatLocalDateISO(nowDate), [nowDate]);
  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  const [viewMode, setViewMode] = useState<'week' | 'day'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 720) return 'day';
    return 'week';
  });
  const manualViewOverrideRef = useRef(false);

  const [weekStartISO, setWeekStartISO] = useState<string>(() =>
    getMondayOfWeekISO(initialDate || formatLocalDateISO(new Date()))
  );
  const [activeDayISO, setActiveDayISO] = useState<string>(
    () => initialDate || formatLocalDateISO(new Date())
  );

  // Selection state
  const [selection, setSelection] = useState<RangeSelection | null>(null);
  const [pickingAnchor, setPickingAnchor] = useState<{ date: string; slotIdx: number } | null>(null);
  const [dragOrigin, setDragOrigin] = useState<{ date: string; slotIdx: number } | null>(null);
  const didDragMoveRef = useRef(false);

  // Conflict shake state
  const [shakeTriggerKey, setShakeTriggerKey] = useState(0);
  const prevConflictRef = useRef(false);

  // Live screen-reader announcement
  const [announcement, setAnnouncement] = useState('');

  // Roving focus cell coordinate
  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number }>({
    row: 0,
    col: 2, // 8:00 AM default focus
  });
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Update "now" line every 60 seconds
  useEffect(() => {
    const id = window.setInterval(() => setNowDate(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  // Responsive breakpoint (< 720px defaults to Day view unless user toggled manually)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      if (manualViewOverrideRef.current) return;
      setViewMode(window.innerWidth < 720 ? 'day' : 'week');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global mouseup to complete desktop drag cleanly
  useEffect(() => {
    if (!dragOrigin) return;
    const handleMouseUp = () => {
      if (didDragMoveRef.current) {
        setPickingAnchor(null);
      }
      setDragOrigin(null);
      didDragMoveRef.current = false;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [dragOrigin]);

  // Reset schedule focus/selection when facility changes
  useEffect(() => {
    setSelection(null);
    setPickingAnchor(null);
    setDragOrigin(null);
  }, [facility.id]);

  const hostInstitution = useMemo(() => {
    return (
      allInstitutions.find((i) => i.id === facility.institutionId) || {
        ...currentInstitution,
        shortName:
          facility.institutionId === 'public-he-inst'
            ? 'Public SUC'
            : facility.institutionId === 'private-he-inst'
            ? 'Private University'
            : currentInstitution.shortName,
      }
    );
  }, [allInstitutions, facility.institutionId, currentInstitution]);

  const openMins = useMemo(() => {
    const parsed = toMinutes(facility.operatingHours?.open || '07:00');
    return Number.isFinite(parsed) ? parsed : 420;
  }, [facility.operatingHours?.open]);

  const closeMins = useMemo(() => {
    const parsed = toMinutes(facility.operatingHours?.close || '20:00');
    return Number.isFinite(parsed) ? parsed : 1200;
  }, [facility.operatingHours?.close]);

  const hasInvalidHours = !facility?.id || openMins >= closeMins;

  // 7 days of active week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDaysISO(weekStartISO, i));
  }, [weekStartISO]);

  // Bookings for this facility indexed by date
  const facilityBookingsByDate = useMemo(() => {
    const map = new Map<string, BookingRequest[]>();
    for (const b of allBookings) {
      if (b.facilityId !== facility.id) continue;
      if (b.status !== 'approved' && b.status !== 'pending') continue;
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    }
    return map;
  }, [allBookings, facility.id]);

  const weekHasAnyBookings = useMemo(() => {
    return weekDays.some((d) => (facilityBookingsByDate.get(d)?.length || 0) > 0);
  }, [weekDays, facilityBookingsByDate]);

  // Safe display label that never leaks another user's identity
  const getSafeBookingLabel = useCallback(
    (booking: BookingRequest): string => {
      const userEmail = currentUser?.email?.trim().toLowerCase();
      const requesterEmail = booking.requesterEmail?.trim().toLowerCase();
      if (userEmail && requesterEmail && userEmail === requesterEmail) {
        return booking.eventName || 'Your reservation';
      }
      return booking.status === 'approved' ? 'Reserved' : 'Pending review';
    },
    [currentUser?.email]
  );

  // Determine exact status of a single 30-min slot
  const getSlotStatus = useCallback(
    (dateStr: string, slotIdx: number) => {
      const slotStartM = SLOT_START_HOUR * 60 + slotIdx * SLOT_STEP_MINS;
      const slotEndM = slotStartM + SLOT_STEP_MINS;

      const dayOpen = isFacilityOpenOnDay(facility.operatingHours?.days, dateStr);
      const outsideHours = !dayOpen || slotStartM < openMins || slotEndM > closeMins;
      const isPastDate = dateStr < todayISO;
      const isPastToday = dateStr === todayISO && slotEndM <= nowMinutes;
      const isSlotBlocked = outsideHours || isPastDate || isPastToday;

      const dayBookings = facilityBookingsByDate.get(dateStr) || [];
      const approved = dayBookings.find((b) => {
        if (b.status !== 'approved') return false;
        return slotStartM < toMinutes(b.endTime) && slotEndM > toMinutes(b.startTime);
      });
      const pending = dayBookings.find((b) => {
        if (b.status !== 'pending') return false;
        return slotStartM < toMinutes(b.endTime) && slotEndM > toMinutes(b.startTime);
      });

      return {
        isBlocked: isSlotBlocked,
        blockedReason: !dayOpen
          ? 'Facility closed on this day'
          : outsideHours
          ? 'Outside operating hours'
          : 'Past time slot',
        approvedBooking: approved,
        pendingBooking: pending,
      };
    },
    [facility.operatingHours?.days, openMins, closeMins, todayISO, nowMinutes, facilityBookingsByDate]
  );

  // Validate active selection against existing checkTimeConflict + operating hours / past time
  const selectionEvaluation = useMemo(() => {
    if (!selection) {
      return {
        hasConflict: false,
        hasPendingOverlap: false,
        reason: '',
        startTime: '',
        endTime: '',
      };
    }

    const minIdx = Math.min(selection.startIdx, selection.endIdx);
    const maxIdx = Math.max(selection.startIdx, selection.endIdx);
    const startTime = slotIndexToStartTime(minIdx);
    const endTime = slotIndexToEndTime(maxIdx);

    if (isBlocked) {
      return {
        hasConflict: true,
        hasPendingOverlap: false,
        reason: 'External bookings are restricted for this facility.',
        startTime,
        endTime,
      };
    }

    // Check blocked / past slots in range
    for (let idx = minIdx; idx <= maxIdx; idx++) {
      const info = getSlotStatus(selection.date, idx);
      if (info.isBlocked) {
        return {
          hasConflict: true,
          hasPendingOverlap: false,
          reason: `Conflict: ${info.blockedReason}`,
          startTime,
          endTime,
        };
      }
    }

    // Real AppContext conflict check against approved bookings
    const realConflict = checkTimeConflict(facility.id, selection.date, startTime, endTime);
    if (realConflict.hasConflict) {
      return {
        hasConflict: true,
        hasPendingOverlap: false,
        reason: 'Conflict: overlaps a confirmed reservation',
        startTime,
        endTime,
      };
    }

    // Check if selection touches any pending review booking (informational only)
    const dayList = facilityBookingsByDate.get(selection.date) || [];
    const sMin = toMinutes(startTime);
    const eMin = toMinutes(endTime);
    const hasPendingOverlap = dayList.some(
      (b) => b.status === 'pending' && sMin < toMinutes(b.endTime) && eMin > toMinutes(b.startTime)
    );

    return {
      hasConflict: false,
      hasPendingOverlap,
      reason: 'No conflicts',
      startTime,
      endTime,
    };
  }, [selection, isBlocked, getSlotStatus, checkTimeConflict, facility.id, facilityBookingsByDate]);

  // Trigger shake once whenever selection transitions into conflict
  useEffect(() => {
    const isNowConflict = Boolean(selection && selectionEvaluation.hasConflict);
    if (isNowConflict && !prevConflictRef.current) {
      setShakeTriggerKey((k) => k + 1);
    }
    prevConflictRef.current = isNowConflict;
  }, [selection, selectionEvaluation.hasConflict]);

  const clearSelection = useCallback(() => {
    setSelection(null);
    setPickingAnchor(null);
    setDragOrigin(null);
    setAnnouncement('Selection cleared.');
  }, []);

  const announceSelection = useCallback(
    (date: string, startIdx: number, endIdx: number, isAnchorOnly = false) => {
      const minIdx = Math.min(startIdx, endIdx);
      const maxIdx = Math.max(startIdx, endIdx);
      const startTime = slotIndexToStartTime(minIdx);
      const endTime = slotIndexToEndTime(maxIdx);
      const dayFmt = formatDayShort(date).full;
      const start12 = formatTo12Hour(startTime);
      const end12 = formatTo12Hour(endTime);
      const dur = formatDurationLabel(minIdx, maxIdx);

      // Compute conflict immediately for spoken feedback
      let conflictFound = isBlocked;
      let conflictNote = isBlocked ? 'External bookings restricted' : '';
      if (!conflictFound) {
        for (let i = minIdx; i <= maxIdx; i++) {
          const st = getSlotStatus(date, i);
          if (st.isBlocked) {
            conflictFound = true;
            conflictNote = st.blockedReason;
            break;
          }
        }
      }
      if (!conflictFound) {
        const c = checkTimeConflict(facility.id, date, startTime, endTime);
        if (c.hasConflict) {
          conflictFound = true;
          conflictNote = 'Overlaps confirmed booking';
        }
      }

      if (isAnchorOnly) {
        setAnnouncement(
          `Start selected: ${dayFmt}, ${start12}. Pick an end slot or press Enter again for ${start12} to ${end12}.`
        );
      } else {
        setAnnouncement(
          `${dayFmt}, ${start12} to ${end12}, ${dur}, ${conflictFound ? conflictNote : 'No conflicts'}.`
        );
      }
    },
    [isBlocked, getSlotStatus, checkTimeConflict, facility.id]
  );

  // Activate a cell by pointer or click
  const handleCellMouseDown = (date: string, slotIdx: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    didDragMoveRef.current = false;
    setDragOrigin({ date, slotIdx });

    if (pickingAnchor && pickingAnchor.date === date) {
      const minIdx = Math.min(pickingAnchor.slotIdx, slotIdx);
      const maxIdx = Math.max(pickingAnchor.slotIdx, slotIdx);
      setSelection({ date, startIdx: minIdx, endIdx: maxIdx });
      setPickingAnchor(null);
      announceSelection(date, minIdx, maxIdx);
    } else {
      setSelection({ date, startIdx: slotIdx, endIdx: slotIdx });
      setPickingAnchor({ date, slotIdx });
      announceSelection(date, slotIdx, slotIdx, true);
    }
  };

  const handleCellMouseEnter = (date: string, slotIdx: number) => {
    if (!dragOrigin) return;
    if (dragOrigin.date !== date) return;
    if (slotIdx !== dragOrigin.slotIdx) {
      didDragMoveRef.current = true;
    }
    const minIdx = Math.min(dragOrigin.slotIdx, slotIdx);
    const maxIdx = Math.max(dragOrigin.slotIdx, slotIdx);
    setSelection({ date, startIdx: minIdx, endIdx: maxIdx });
    if (didDragMoveRef.current) {
      announceSelection(date, minIdx, maxIdx);
    }
  };

  // Next 2-hour opening quick chip
  const handleFindNextOpening = () => {
    if (isBlocked || hasInvalidHours) return;
    const neededSlots = 4; // 4 * 30m = 2 hours
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const dateStr = addDaysISO(todayISO, dayOffset);
      for (let startIdx = 0; startIdx <= TOTAL_SLOTS - neededSlots; startIdx++) {
        let allClear = true;
        for (let k = 0; k < neededSlots; k++) {
          const st = getSlotStatus(dateStr, startIdx + k);
          if (st.isBlocked || st.approvedBooking) {
            allClear = false;
            break;
          }
        }
        if (!allClear) continue;

        const startT = slotIndexToStartTime(startIdx);
        const endT = slotIndexToEndTime(startIdx + neededSlots - 1);
        const res = checkTimeConflict(facility.id, dateStr, startT, endT);
        if (!res.hasConflict) {
          setWeekStartISO(getMondayOfWeekISO(dateStr));
          setActiveDayISO(dateStr);
          setSelection({ date: dateStr, startIdx, endIdx: startIdx + neededSlots - 1 });
          setPickingAnchor(null);
          announceSelection(dateStr, startIdx, startIdx + neededSlots - 1);

          const rowIdx = viewMode === 'week' ? Math.max(0, parseLocalDateISO(dateStr).getDay() === 0 ? 6 : parseLocalDateISO(dateStr).getDay() - 1) : startIdx;
          const colIdx = viewMode === 'week' ? startIdx : 0;
          setFocusedCell({ row: rowIdx, col: colIdx });
          setTimeout(() => {
            cellRefs.current.get(`${rowIdx}-${colIdx}`)?.focus();
          }, 0);
          return;
        }
      }
    }
    setAnnouncement('No 2-hour opening found in the next 30 days.');
  };

  // Keyboard navigation inside role="grid"
  const handleGridKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    rowIdx: number,
    colIdx: number,
    dateStr: string,
    slotIdx: number
  ) => {
    const maxRow = viewMode === 'week' ? 6 : TOTAL_SLOTS - 1;
    const maxCol = viewMode === 'week' ? TOTAL_SLOTS - 1 : 0;

    let nextRow = rowIdx;
    let nextCol = colIdx;
    let handled = false;

    if (e.key === 'ArrowRight') {
      nextCol = Math.min(maxCol, colIdx + 1);
      handled = true;
    } else if (e.key === 'ArrowLeft') {
      nextCol = Math.max(0, colIdx - 1);
      handled = true;
    } else if (e.key === 'ArrowDown') {
      nextRow = Math.min(maxRow, rowIdx + 1);
      handled = true;
    } else if (e.key === 'ArrowUp') {
      nextRow = Math.max(0, rowIdx - 1);
      handled = true;
    } else if (e.key === 'Home') {
      if (viewMode === 'week') nextCol = 0;
      else nextRow = 0;
      handled = true;
    } else if (e.key === 'End') {
      if (viewMode === 'week') nextCol = maxCol;
      else nextRow = maxRow;
      handled = true;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (pickingAnchor && pickingAnchor.date === dateStr) {
        const minIdx = Math.min(pickingAnchor.slotIdx, slotIdx);
        const maxIdx = Math.max(pickingAnchor.slotIdx, slotIdx);
        setSelection({ date: dateStr, startIdx: minIdx, endIdx: maxIdx });
        setPickingAnchor(null);
        announceSelection(dateStr, minIdx, maxIdx);
      } else {
        setSelection({ date: dateStr, startIdx: slotIdx, endIdx: slotIdx });
        setPickingAnchor({ date: dateStr, slotIdx });
        announceSelection(dateStr, slotIdx, slotIdx, true);
      }
      return;
    } else if (e.key === 'Escape') {
      if (selection || pickingAnchor) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation?.();
        clearSelection();
      }
      return;
    }

    if (handled) {
      e.preventDefault();
      setFocusedCell({ row: nextRow, col: nextCol });
      cellRefs.current.get(`${nextRow}-${nextCol}`)?.focus();

      // Live-preview end selection while arrowing along the anchor's day
      if (pickingAnchor) {
        const targetDate = viewMode === 'week' ? weekDays[nextRow] : activeDayISO;
        const targetSlot = viewMode === 'week' ? nextCol : nextRow;
        if (targetDate === pickingAnchor.date) {
          const minIdx = Math.min(pickingAnchor.slotIdx, targetSlot);
          const maxIdx = Math.max(pickingAnchor.slotIdx, targetSlot);
          setSelection({ date: targetDate, startIdx: minIdx, endIdx: maxIdx });
        }
      }
    }
  };

  // Navigation handlers
  const handlePrevPeriod = () => {
    if (viewMode === 'week') {
      setWeekStartISO((w) => addDaysISO(w, -7));
    } else {
      const nextDay = addDaysISO(activeDayISO, -1);
      setActiveDayISO(nextDay);
      setWeekStartISO(getMondayOfWeekISO(nextDay));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'week') {
      setWeekStartISO((w) => addDaysISO(w, 7));
    } else {
      const nextDay = addDaysISO(activeDayISO, 1);
      setActiveDayISO(nextDay);
      setWeekStartISO(getMondayOfWeekISO(nextDay));
    }
  };

  const handleToday = () => {
    setWeekStartISO(getMondayOfWeekISO(todayISO));
    setActiveDayISO(todayISO);
  };

  const handleSwitchViewMode = (mode: 'week' | 'day') => {
    manualViewOverrideRef.current = true;
    setViewMode(mode);
    if (mode === 'day' && !weekDays.includes(activeDayISO)) {
      setActiveDayISO(weekDays.includes(todayISO) ? todayISO : weekStartISO);
    }
    setFocusedCell({ row: 0, col: mode === 'week' ? 2 : 0 });
  };

  const isDark = theme === 'dark';

  // "Now" indicator percentage along 7 AM .. 8 PM axis
  const nowPercent = useMemo(() => {
    const minM = SLOT_START_HOUR * 60;
    const maxM = SLOT_END_HOUR * 60;
    if (nowMinutes < minM || nowMinutes > maxM) return null;
    return ((nowMinutes - minM) / (maxM - minM)) * 100;
  }, [nowMinutes]);

  // Format summary text
  const summaryText = useMemo(() => {
    if (!selection) return null;
    const minIdx = Math.min(selection.startIdx, selection.endIdx);
    const maxIdx = Math.max(selection.startIdx, selection.endIdx);
    const dayStr = formatDayShort(selection.date).full;
    const start12 = formatTo12Hour(slotIndexToStartTime(minIdx));
    const end12 = formatTo12Hour(slotIndexToEndTime(maxIdx));
    const dur = formatDurationLabel(minIdx, maxIdx);
    const statusText = selectionEvaluation.hasConflict
      ? selectionEvaluation.reason
      : selectionEvaluation.hasPendingOverlap
      ? 'No confirmed conflicts · Pending request overlaps'
      : 'No conflicts';
    return `${dayStr} · ${start12} - ${end12} · ${dur} · ${statusText}`;
  }, [selection, selectionEvaluation]);

  // Helper to compute booking bar overlays positioned horizontally (Week) or vertically (Day)
  const getDayBookingBars = useCallback(
    (dateStr: string) => {
      const dayBookings = facilityBookingsByDate.get(dateStr) || [];
      const minM = SLOT_START_HOUR * 60;
      const maxM = SLOT_END_HOUR * 60;
      const span = maxM - minM;

      return dayBookings
        .map((b) => {
          const bStart = Math.max(minM, toMinutes(b.startTime));
          const bEnd = Math.min(maxM, toMinutes(b.endTime));
          if (bEnd <= bStart) return null;
          const startPct = ((bStart - minM) / span) * 100;
          const sizePct = ((bEnd - bStart) / span) * 100;
          return {
            booking: b,
            startPct,
            sizePct,
            label: getSafeBookingLabel(b),
            timeRangeLabel: `${formatTo12Hour(b.startTime)} – ${formatTo12Hour(b.endTime)}`,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
    },
    [facilityBookingsByDate, getSafeBookingLabel]
  );

  // Error State
  if (error || hasInvalidHours) {
    return (
      <div
        role="alert"
        className={`rounded-xl border p-6 text-center space-y-3 ${
          isDark
            ? 'bg-[#0F1E36] border-red-500/40 text-slate-100'
            : 'bg-red-50/70 border-red-200 text-slate-900'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-red-100 text-[#EE2726] flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold">Unable to load facility schedule</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
          {error || 'Facility operating hours are unavailable or could not be parsed for this schedule view.'}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0077C8] hover:bg-[#0060a3] text-white text-xs font-semibold cursor-pointer min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Retry Schedule</span>
          </button>
        )}
      </div>
    );
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading facility schedule">
        <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 motion-safe:animate-pulse" />
        <div className="h-72 rounded-xl bg-slate-100 dark:bg-slate-800 motion-safe:animate-pulse" />
        <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 motion-safe:animate-pulse" />
      </div>
    );
  }

  const canSubmitSelection = Boolean(selection && !selectionEvaluation.hasConflict && onSelectSlot);

  return (
    <div
      className={`space-y-3.5 font-sans select-none ${
        isDark ? 'text-slate-100' : 'text-[#0B1528]'
      }`}
    >
      {/* Screen-reader live announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* 1. SCHEDULE HEADER: Facility Context, Navigation, Week/Day Toggle */}
      <div
        className={`rounded-xl border p-3.5 flex flex-col gap-3 ${
          isDark
            ? 'bg-[#0F1E36] border-slate-700'
            : 'bg-[#FAF9F6] border-slate-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`text-sm font-extrabold tracking-tight truncate ${isDark ? 'text-white' : 'text-[#0B1528]'}`}>
                {facility.name}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                  isDark
                    ? 'bg-slate-900/70 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <Users className="w-3 h-3 text-[#0077C8]" aria-hidden="true" />
                {facility.capacity} cap
              </span>
            </div>
            <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {hostInstitution.shortName} · {facility.building} · Open{' '}
              <span className="font-mono font-medium">
                {formatTo12Hour(facility.operatingHours.open)} – {formatTo12Hour(facility.operatingHours.close)}
              </span>
            </p>
          </div>

          {/* Week/Day Segmented Switcher & Date Navigation */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Date navigation"
              className={`inline-flex items-center rounded-lg border p-0.5 ${
                isDark ? 'bg-[#0B1528] border-slate-700' : 'bg-white border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={handlePrevPeriod}
                aria-label={viewMode === 'week' ? 'Previous week' : 'Previous day'}
                className={`min-w-[28px] min-h-[28px] px-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className={`min-h-[28px] px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextPeriod}
                aria-label={viewMode === 'week' ? 'Next week' : 'Next day'}
                className={`min-w-[28px] min-h-[28px] px-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div
              role="group"
              aria-label="Schedule view mode"
              className={`inline-flex items-center rounded-lg border p-0.5 ${
                isDark ? 'bg-[#0B1528] border-slate-700' : 'bg-white border-slate-300'
              }`}
            >
              <button
                type="button"
                aria-pressed={viewMode === 'week'}
                onClick={() => handleSwitchViewMode('week')}
                className={`min-h-[28px] px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-[#0B1528] text-white dark:bg-[#0077C8]'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Week
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'day'}
                onClick={() => handleSwitchViewMode('day')}
                className={`min-h-[28px] px-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-[#0B1528] text-white dark:bg-[#0077C8]'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar: Period Range + Quick Action Chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#0077C8] shrink-0" aria-hidden="true" />
            <span className="font-mono tabular-nums">
              {viewMode === 'week'
                ? formatWeekRangeLabel(weekStartISO)
                : formatDayShort(activeDayISO).full + ', ' + parseLocalDateISO(activeDayISO).getFullYear()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleFindNextOpening}
              disabled={isBlocked}
              className={`min-h-[28px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                isBlocked
                  ? 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400'
                  : isDark
                  ? 'bg-[#0B1528] border-[#0077C8]/60 text-sky-200 hover:bg-[#0077C8]/20 cursor-pointer'
                  : 'bg-white border-[#0077C8]/40 text-[#005EA2] hover:bg-blue-50 cursor-pointer'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[#0077C8]" aria-hidden="true" />
              <span>Next 2-hour opening</span>
            </button>

            <button
              type="button"
              onClick={clearSelection}
              disabled={!selection}
              className={`min-h-[28px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                selection
                  ? isDark
                    ? 'bg-[#0B1528] border-slate-600 text-slate-200 hover:bg-slate-800 cursor-pointer'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                  : 'opacity-45 cursor-not-allowed border-slate-200 text-slate-500'
              }`}
            >
              <X className="w-3 h-3" aria-hidden="true" />
              <span>Clear selection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty-week informational banner */}
      {!weekHasAnyBookings && (
        <div
          className={`rounded-lg border px-3 py-2 text-xs flex items-center gap-2 ${
            isDark
              ? 'bg-[#0F1E36] border-slate-700 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#0077C8] shrink-0" aria-hidden="true" />
          <span>No confirmed or pending reservations yet for this week — all open operating hours are available.</span>
        </div>
      )}

      {/* 2. GANTT TIMELINE GRID (WEEK VIEW OR DAY VIEW) */}
      {viewMode === 'week' ? (
        <div
          className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-[#0B1528] border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          <div className="overflow-x-auto">
            <div
              role="grid"
              aria-label={`Weekly availability schedule for ${facility.name}`}
              className="min-w-[820px]"
            >
              {/* Column Header Row (7 AM to 8 PM) */}
              <div
                role="row"
                className={`flex border-b ${
                  isDark ? 'bg-[#0F1E36] border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  role="columnheader"
                  className={`sticky left-0 z-20 w-[108px] shrink-0 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider border-r flex items-center ${
                    isDark
                      ? 'bg-[#0F1E36] border-slate-700 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  Day
                </div>
                <div className="relative flex-1 grid grid-cols-13">
                  {Array.from({ length: HOUR_COUNT }, (_, hIdx) => {
                    const hr = SLOT_START_HOUR + hIdx;
                    const label =
                      hr === 12 ? '12 PM' : hr > 12 ? `${hr - 12} PM` : `${hr} AM`;
                    return (
                      <div
                        key={hr}
                        role="columnheader"
                        className={`px-1 py-2.5 text-[11px] font-mono font-medium border-r last:border-r-0 text-left ${
                          isDark
                            ? 'border-slate-700/70 text-slate-300'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {label}
                      </div>
                    );
                  })}
                  <span
                    aria-hidden="true"
                    className={`absolute right-1.5 top-2.5 text-[10px] font-mono ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    8 PM
                  </span>
                </div>
              </div>

              {/* 7 Day Rows */}
              {weekDays.map((dateStr, rowIdx) => {
                const isToday = dateStr === todayISO;
                const dayFmt = formatDayShort(dateStr);
                const bookingBars = getDayBookingBars(dateStr);

                return (
                  <div
                    key={dateStr}
                    role="row"
                    className={`flex border-b last:border-b-0 ${
                      isDark ? 'border-slate-800' : 'border-slate-200'
                    }`}
                  >
                    {/* Sticky Day Row Header */}
                    <div
                      role="rowheader"
                      className={`sticky left-0 z-20 w-[108px] shrink-0 px-3 py-2 border-r flex flex-col justify-center ${
                        isToday
                          ? isDark
                            ? 'bg-[#0F1E36] border-slate-700'
                            : 'bg-blue-50/80 border-slate-200'
                          : isDark
                          ? 'bg-[#0B1528] border-slate-700'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'text-[#0077C8]'
                              : isDark
                              ? 'text-slate-100'
                              : 'text-[#0B1528]'
                          }`}
                        >
                          {dayFmt.weekday}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#0077C8] text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-mono ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {dayFmt.monthDay}
                      </span>
                    </div>

                    {/* Timeline 26-Slot Track + Overlaid Booking Bars + Now Line */}
                    <div className="relative flex-1 min-h-[52px]">
                      {/* Interactive 26 half-hour gridcells */}
                      <div className="grid grid-cols-26 h-full w-full">
                        {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
                          const slotStart = slotIndexToStartTime(slotIdx);
                          const slotEnd = slotIndexToEndTime(slotIdx);
                          const status = getSlotStatus(dateStr, slotIdx);
                          const isSelected =
                            selection?.date === dateStr &&
                            slotIdx >= Math.min(selection.startIdx, selection.endIdx) &&
                            slotIdx <= Math.max(selection.startIdx, selection.endIdx);
                          const isConflictSel = isSelected && selectionEvaluation.hasConflict;
                          const isFocused =
                            focusedCell.row === rowIdx && focusedCell.col === slotIdx;

                          const statusDesc = status.approvedBooking
                            ? 'confirmed reservation'
                            : status.pendingBooking
                            ? 'pending review'
                            : status.isBlocked
                            ? status.blockedReason.toLowerCase()
                            : 'available';

                          const cellAriaLabel = `${dayFmt.full}, ${formatTo12Hour(
                            slotStart
                          )} to ${formatTo12Hour(slotEnd)}, ${statusDesc}${
                            isSelected ? (isConflictSel ? ', selected conflict' : ', selected') : ''
                          }`;

                          const isHourBoundary = slotIdx % 2 === 1;

                          let cellBg = isDark
                            ? 'bg-[#0B1528] hover:bg-slate-800/70'
                            : 'bg-white hover:bg-sky-50/70';
                          if (status.isBlocked) {
                            cellBg = 'gantt-pattern-blocked';
                          }
                          if (isSelected) {
                            cellBg = isConflictSel
                              ? 'bg-[#EE2726]/20 ring-2 ring-inset ring-[#EE2726] z-10'
                              : 'bg-[#8CC63F]/30 ring-2 ring-inset ring-[#4D7C0F] z-10';
                          }

                          return (
                            <div
                              key={slotIdx}
                              ref={(el) => {
                                if (el) cellRefs.current.set(`${rowIdx}-${slotIdx}`, el);
                                else cellRefs.current.delete(`${rowIdx}-${slotIdx}`);
                              }}
                              role="gridcell"
                              tabIndex={isFocused ? 0 : -1}
                              aria-label={cellAriaLabel}
                              aria-selected={isSelected}
                              title={`${dayFmt.full} · ${formatTo12Hour(slotStart)} – ${formatTo12Hour(
                                slotEnd
                              )} (${statusDesc})`}
                              onMouseDown={(e) => handleCellMouseDown(dateStr, slotIdx, e)}
                              onMouseEnter={() => handleCellMouseEnter(dateStr, slotIdx)}
                              onFocus={() => setFocusedCell({ row: rowIdx, col: slotIdx })}
                              onKeyDown={(e) =>
                                handleGridKeyDown(e, rowIdx, slotIdx, dateStr, slotIdx)
                              }
                              className={`min-w-[26px] min-h-[52px] border-r cursor-pointer transition-colors relative focus:z-30 ${
                                isHourBoundary
                                  ? isDark
                                    ? 'border-slate-700'
                                    : 'border-slate-200'
                                  : isDark
                                  ? 'border-slate-800/60 border-dashed'
                                  : 'border-slate-100 border-dashed'
                              } ${cellBg} ${
                                isSelected && isConflictSel ? 'smartspace-conflict-shake' : ''
                              }`}
                            >
                              {status.isBlocked && slotIdx % 2 === 0 && (
                                <span
                                  aria-hidden="true"
                                  className="sr-only"
                                >
                                  Blocked
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Booked Bars Overlay (non-interactive overlay so cells keep exact click/drag/keyboard focus) */}
                      {bookingBars.map(({ booking, startPct, sizePct, label, timeRangeLabel }) => {
                        const isApproved = booking.status === 'approved';
                        return (
                          <div
                            key={booking.id}
                            aria-hidden="true"
                            style={{
                              left: `calc(${startPct}% + 1px)`,
                              width: `calc(${sizePct}% - 2px)`,
                            }}
                            title={`${label} (${timeRangeLabel})`}
                            className={`pointer-events-none absolute top-1.5 bottom-1.5 rounded-md px-1.5 flex items-center gap-1 overflow-hidden shadow-2xs z-10 ${
                              isApproved
                                ? 'bg-[#006BB8] text-white border border-[#005391]'
                                : 'gantt-pattern-pending text-[#0B1528] border border-[#D97706]'
                            }`}
                          >
                            {isApproved ? (
                              <Check className="w-3 h-3 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 shrink-0 text-[#92400E]" />
                            )}
                            <span className="text-[11px] font-semibold truncate leading-none">
                              {label}
                            </span>
                          </div>
                        );
                      })}

                      {/* Selection Overlay Badge on top of range */}
                      {selection?.date === dateStr && (
                        <div
                          key={`sel-overlay-${shakeTriggerKey}`}
                          aria-hidden="true"
                          style={{
                            left: `${(Math.min(selection.startIdx, selection.endIdx) / TOTAL_SLOTS) * 100}%`,
                            width: `${
                              ((Math.max(selection.startIdx, selection.endIdx) -
                                Math.min(selection.startIdx, selection.endIdx) +
                                1) /
                                TOTAL_SLOTS) *
                              100
                            }%`,
                          }}
                          className={`pointer-events-none absolute inset-y-1 rounded-md border-2 z-20 flex items-center justify-center px-1.5 ${
                            selectionEvaluation.hasConflict
                              ? 'border-[#EE2726] bg-[#EE2726]/20 text-[#991B1B] dark:text-red-100 smartspace-conflict-shake'
                              : 'border-[#4D7C0F] bg-[#8CC63F]/30 text-[#0B1528] dark:text-white'
                          }`}
                        >
                          <span className="text-[11px] font-mono font-bold truncate bg-white/90 dark:bg-[#0B1528]/90 px-1.5 py-0.5 rounded shadow-2xs">
                            {formatTo12Hour(
                              slotIndexToStartTime(Math.min(selection.startIdx, selection.endIdx))
                            )}{' '}
                            –{' '}
                            {formatTo12Hour(
                              slotIndexToEndTime(Math.max(selection.startIdx, selection.endIdx))
                            )}
                          </span>
                        </div>
                      )}

                      {/* Live Red "Now" Line on Today */}
                      {isToday && nowPercent !== null && (
                        <div
                          aria-hidden="true"
                          style={{ left: `${nowPercent}%` }}
                          className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-[#EE2726] z-30"
                        >
                          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#EE2726] ring-2 ring-white dark:ring-[#0B1528]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* MOBILE / DAY VIEW: Hours down the side, one day at a time */
        <div className="space-y-2.5">
          {/* 7-Day Selector Strip */}
          <div className="grid grid-cols-7 gap-1" role="group" aria-label="Choose day in week">
            {weekDays.map((dateStr) => {
              const fmt = formatDayShort(dateStr);
              const isSelectedDay = dateStr === activeDayISO;
              const isToday = dateStr === todayISO;
              const dayCount = facilityBookingsByDate.get(dateStr)?.length || 0;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setActiveDayISO(dateStr)}
                  aria-pressed={isSelectedDay}
                  className={`min-h-[44px] rounded-lg border px-1 py-1.5 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    isSelectedDay
                      ? 'bg-[#0B1528] text-white border-[#0B1528] dark:bg-[#0077C8] dark:border-[#0077C8]'
                      : isToday
                      ? 'bg-blue-50 text-[#005EA2] border-[#0077C8]/40 hover:bg-blue-100'
                      : isDark
                      ? 'bg-[#0F1E36] text-slate-200 border-slate-700 hover:bg-slate-800'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{fmt.weekday}</span>
                  <span className="text-xs font-mono font-bold tabular-nums">
                    {parseLocalDateISO(dateStr).getDate()}
                  </span>
                  {dayCount > 0 && (
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 w-1.5 h-1.5 rounded-full ${
                        isSelectedDay ? 'bg-[#8CC63F]' : 'bg-[#0077C8]'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Vertical Day Grid */}
          <div
            role="grid"
            aria-label={`Daily availability schedule for ${facility.name}, ${formatDayShort(activeDayISO).full}`}
            className={`relative rounded-xl border overflow-hidden ${
              isDark ? 'bg-[#0B1528] border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <div className="relative">
              {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
                const slotStart = slotIndexToStartTime(slotIdx);
                const slotEnd = slotIndexToEndTime(slotIdx);
                const status = getSlotStatus(activeDayISO, slotIdx);
                const isHourMark = slotIdx % 2 === 0;
                const dayFmt = formatDayShort(activeDayISO);

                const isSelected =
                  selection?.date === activeDayISO &&
                  slotIdx >= Math.min(selection.startIdx, selection.endIdx) &&
                  slotIdx <= Math.max(selection.startIdx, selection.endIdx);
                const isConflictSel = isSelected && selectionEvaluation.hasConflict;
                const isFocused = focusedCell.row === slotIdx && focusedCell.col === 0;

                const statusDesc = status.approvedBooking
                  ? `confirmed reservation, ${getSafeBookingLabel(status.approvedBooking)}`
                  : status.pendingBooking
                  ? `pending review, ${getSafeBookingLabel(status.pendingBooking)}`
                  : status.isBlocked
                  ? status.blockedReason.toLowerCase()
                  : 'available';

                const cellAriaLabel = `${dayFmt.full}, ${formatTo12Hour(
                  slotStart
                )} to ${formatTo12Hour(slotEnd)}, ${statusDesc}${
                  isSelected ? (isConflictSel ? ', selected conflict' : ', selected') : ''
                }`;

                let rightCellClass = isDark
                  ? 'bg-[#0B1528] hover:bg-slate-800/70'
                  : 'bg-white hover:bg-sky-50/70';

                if (status.isBlocked) rightCellClass = 'gantt-pattern-blocked';
                else if (status.approvedBooking) {
                  rightCellClass = 'bg-[#006BB8] text-white';
                } else if (status.pendingBooking) {
                  rightCellClass = 'gantt-pattern-pending text-[#0B1528]';
                }

                if (isSelected) {
                  rightCellClass = isConflictSel
                    ? 'bg-[#EE2726]/20 ring-2 ring-inset ring-[#EE2726] text-[#991B1B] dark:text-red-100'
                    : 'bg-[#8CC63F]/30 ring-2 ring-inset ring-[#4D7C0F] text-[#0B1528] dark:text-white';
                }

                return (
                  <div
                    key={slotIdx}
                    role="row"
                    className={`flex border-b last:border-b-0 ${
                      isHourMark
                        ? isDark
                          ? 'border-slate-700'
                          : 'border-slate-200'
                        : isDark
                        ? 'border-slate-800/60 border-dashed'
                        : 'border-slate-100 border-dashed'
                    }`}
                  >
                    <div
                      role="rowheader"
                      className={`w-24 shrink-0 px-3 py-2 border-r flex items-center font-mono text-xs tabular-nums ${
                        isDark
                          ? 'bg-[#0F1E36] border-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className={isHourMark ? 'font-semibold' : 'opacity-70'}>
                        {formatTo12Hour(slotStart)}
                      </span>
                    </div>

                    <div
                      ref={(el) => {
                        if (el) cellRefs.current.set(`${slotIdx}-0`, el);
                        else cellRefs.current.delete(`${slotIdx}-0`);
                      }}
                      role="gridcell"
                      tabIndex={isFocused ? 0 : -1}
                      aria-label={cellAriaLabel}
                      aria-selected={isSelected}
                      onMouseDown={(e) => handleCellMouseDown(activeDayISO, slotIdx, e)}
                      onMouseEnter={() => handleCellMouseEnter(activeDayISO, slotIdx)}
                      onFocus={() => setFocusedCell({ row: slotIdx, col: 0 })}
                      onKeyDown={(e) =>
                        handleGridKeyDown(e, slotIdx, 0, activeDayISO, slotIdx)
                      }
                      className={`flex-1 min-h-[38px] px-3 py-1.5 flex items-center justify-between gap-2 cursor-pointer transition-colors ${rightCellClass} ${
                        isSelected && isConflictSel ? 'smartspace-conflict-shake' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {status.approvedBooking ? (
                          <>
                            <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span className="text-xs font-semibold truncate">
                              {getSafeBookingLabel(status.approvedBooking)}
                            </span>
                          </>
                        ) : status.pendingBooking ? (
                          <>
                            <Clock className="w-3.5 h-3.5 shrink-0 text-[#92400E]" aria-hidden="true" />
                            <span className="text-xs font-semibold truncate">
                              {getSafeBookingLabel(status.pendingBooking)}
                            </span>
                          </>
                        ) : status.isBlocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                              {status.blockedReason}
                            </span>
                          </>
                        ) : (
                          <span
                            className={`text-xs font-medium ${
                              isSelected
                                ? 'font-bold'
                                : isDark
                                ? 'text-slate-300'
                                : 'text-slate-600'
                            }`}
                          >
                            {isSelected
                              ? isConflictSel
                                ? 'Conflict'
                                : 'Your selection'
                              : 'Available'}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-mono opacity-80 shrink-0">
                        {formatTo12Hour(slotStart)} – {formatTo12Hour(slotEnd)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Horizontal Red "Now" Indicator in Day View */}
              {activeDayISO === todayISO && nowPercent !== null && (
                <div
                  aria-hidden="true"
                  style={{ top: `${nowPercent}%` }}
                  className="pointer-events-none absolute left-24 right-0 h-0.5 bg-[#EE2726] z-30 flex items-center"
                >
                  <span className="-ml-1.5 w-2.5 h-2.5 rounded-full bg-[#EE2726] ring-2 ring-white dark:ring-[#0B1528]" />
                  <span className="ml-1.5 px-1.5 py-0.5 rounded bg-[#EE2726] text-white text-[10px] font-mono font-bold leading-none">
                    NOW
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. LEGEND (Color + Pattern + Label — never color alone) */}
      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-xs px-1 ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded border border-slate-300 bg-white inline-block"
          />
          <span>Available</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded bg-[#006BB8] border border-[#005391] inline-flex items-center justify-center text-white"
          >
            <Check className="w-2.5 h-2.5" />
          </span>
          <span>Confirmed</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded gantt-pattern-pending border border-[#D97706] inline-block"
          />
          <span>Pending review</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded gantt-pattern-blocked border border-slate-400 inline-block"
          />
          <span>Blocked</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="w-3.5 h-3.5 rounded bg-[#8CC63F]/35 border-2 border-[#4D7C0F] inline-block"
          />
          <span>Your selection</span>
        </span>
      </div>

      {/* 4. SELECTION SUMMARY BAR & "REQUEST TO BOOK" CTA */}
      <div
        key={`summary-${shakeTriggerKey}`}
        className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          selection
            ? selectionEvaluation.hasConflict
              ? 'bg-red-50 border-[#EE2726] text-[#991B1B] dark:bg-red-950/40 dark:text-red-100 smartspace-conflict-shake'
              : 'bg-lime-50 border-[#65A30D] text-[#0B1528] dark:bg-emerald-950/40 dark:text-slate-100'
            : isDark
            ? 'bg-[#0F1E36] border-slate-700 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div className="space-y-0.5 min-w-0">
          {selection ? (
            <>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-2 flex-wrap">
                {selectionEvaluation.hasConflict ? (
                  <AlertCircle className="w-4 h-4 text-[#EE2726] shrink-0" aria-hidden="true" />
                ) : (
                  <Check className="w-4 h-4 text-[#3F6212] dark:text-[#8CC63F] shrink-0" aria-hidden="true" />
                )}
                <span className="font-mono tabular-nums break-words">{summaryText}</span>
              </div>
              {pickingAnchor && (
                <p className="text-xs opacity-80">
                  Start locked — click, drag, or press Arrow + Enter on another slot to extend your range.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs">
              Click, drag across cells, or use Arrow keys + Enter/Space to select a start and end time (30-min steps).
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!canSubmitSelection}
          onClick={() => {
            if (!selection || selectionEvaluation.hasConflict || !onSelectSlot) return;
            onSelectSlot(selection.date, selectionEvaluation.startTime, selectionEvaluation.endTime);
          }}
          className={`min-h-[38px] px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors ${
            canSubmitSelection
              ? 'bg-[#0077C8] hover:bg-[#0060a3] text-white cursor-pointer shadow-xs'
              : 'bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Request to book</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
