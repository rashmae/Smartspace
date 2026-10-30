/**
 * Centralized 12-Hour AM/PM Time Utilities for SmartSpace
 * Complies with strict 12-hour clock display across all dashboards, forms, calendars, and records.
 */

/**
 * Converts a 24-hour time string ("08:00", "13:30", "18:00") or ISO string to a 12-hour AM/PM string ("8:00 AM", "1:30 PM", "6:00 PM").
 */
export function formatTo12Hour(timeStr?: string | null): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();

  // If already formatted with AM or PM, clean up and return
  if (/am|pm/i.test(trimmed)) {
    return trimmed.replace(/\s*(am|pm)/i, ' $1').toUpperCase();
  }

  // If ISO string like 2026-10-30T14:30:00Z
  if (trimmed.includes('T')) {
    try {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    } catch {
      // fallback
    }
  }

  // Parse HH:mm or H:mm
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return trimmed;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = minutes.toString().padStart(2, '0');

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Formats a start and end time into a clean 12-hour range: "9:00 AM – 11:30 AM"
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (!startTime && !endTime) return '';
  const start = formatTo12Hour(startTime);
  const end = formatTo12Hour(endTime);
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

/**
 * Formats operating hours: "8:00 AM – 7:30 PM"
 */
export function formatOperatingHours(open: string, close: string, days?: string): string {
  const range = formatTimeRange(open, close);
  return days ? `${range} (${days})` : range;
}

/**
 * Formats an ISO date or timestamp into "Oct 30, 2026, 9:45 AM"
 */
export function formatDateTime12Hour(timestamp?: string | null): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;

    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timestamp || '';
  }
}

/**
 * Formats time only from ISO: "2:30 PM"
 */
export function formatTimeOnly12Hour(timestamp?: string | null): string {
  if (!timestamp) return '';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return formatTo12Hour(timestamp);

    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return formatTo12Hour(timestamp);
  }
}

/**
 * Standard selectable time options with 12-hour labels and 24-hour stored values (every 30 mins from 07:00 to 21:00)
 */
export interface TimeOption {
  value: string; // 24-hr format stored for consistency: "09:00", "13:30"
  label: string; // User-facing 12-hr format: "9:00 AM", "1:30 PM"
}

export const TIME_OPTIONS: TimeOption[] = [
  { value: '07:00', label: '7:00 AM' },
  { value: '07:30', label: '7:30 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '08:30', label: '8:30 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '17:30', label: '5:30 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
];

/**
 * Validates that endTime is strictly later than startTime
 */
export function isEndAfterStart(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) return false;

  const toMinutes = (t: string): number => {
    // If has AM/PM
    if (/am|pm/i.test(t)) {
      const match = t.match(/(\d+):(\d+)\s*(am|pm)/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const isPm = match[3].toLowerCase() === 'pm';
        if (h === 12) h = isPm ? 12 : 0;
        else if (isPm) h += 12;
        return h * 60 + m;
      }
    }
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  return toMinutes(endTime) > toMinutes(startTime);
}
