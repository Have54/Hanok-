/**
 * Formats milliseconds into MM:SS or HH:MM:SS
 */
export function formatTimeDisplay(ms: number, forceHours = false): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
} {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hStr = String(hours).padStart(2, '0');
  const mStr = String(minutes).padStart(2, '0');
  const sStr = String(seconds).padStart(2, '0');

  let formatted = '';
  if (hours > 0 || forceHours) {
    formatted = `${hStr}:${mStr}:${sStr}`;
  } else {
    formatted = `${mStr}:${sStr}`;
  }

  return {
    hours: hStr,
    minutes: mStr,
    seconds: sStr,
    formatted,
  };
}

/**
 * Formats milliseconds for stopwatch: HH:MM:SS.cs
 */
export function formatStopwatchTime(ms: number): {
  hours: string;
  minutes: string;
  seconds: string;
  centiseconds: string;
} {
  const safeMs = Math.max(0, ms);
  const hours = Math.floor(safeMs / 3600000);
  const minutes = Math.floor((safeMs % 3600000) / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  const centiseconds = Math.floor((safeMs % 1000) / 10);

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    centiseconds: String(centiseconds).padStart(2, '0'),
  };
}

/**
 * Converts hours, minutes, seconds to total milliseconds
 */
export function hmsToMs(hours: number, minutes: number, seconds: number): number {
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 * Converts total milliseconds to { hours, minutes, seconds }
 */
export function msToHms(ms: number): { hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

/**
 * Human readable label (e.g., "15m", "1h 30m")
 */
export function formatDurationLabel(ms: number): string {
  const { hours, minutes, seconds } = msToHms(ms);
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}
