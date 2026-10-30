import React from 'react';
import { formatTimeDisplay } from '../utils/format';

interface CircularTimerProps {
  totalMs: number;
  remainingMs: number;
  isRunning: boolean;
  isCompleted: boolean;
  size?: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  totalMs,
  remainingMs,
  isRunning,
  isCompleted,
  size = 280,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress: 1 = full, 0 = done
  const progressRatio = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  // Stroke dash offset: decreases as time elapses
  const strokeDashoffset = circumference * (1 - progressRatio);

  const { formatted, hours } = formatTimeDisplay(remainingMs);
  const showHours = Number(hours) > 0 || totalMs >= 3600000;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Outer ambient glow when running */}
      {isRunning && (
        <div
          className="absolute inset-4 rounded-full bg-orange-500/10 dark:bg-orange-500/15 blur-2xl transition-all duration-700 animate-pulse pointer-events-none"
        />
      )}

      {/* SVG Circular Progress Ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center drop-shadow-sm"
      >
        <defs>
          <linearGradient id="timerOrangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#FF5500" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-blue-100 dark:stroke-slate-800 transition-colors"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Active Animated Orange Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#timerOrangeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-100 ease-linear"
        />
      </svg>

      {/* Digital Countdown Center Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        {isCompleted ? (
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-4xl font-extrabold text-orange-600 dark:text-orange-500 tracking-tight tabular-nums">
              00:00
            </span>
            <span className="mt-1 text-sm font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-3 py-1 rounded-full">
              Time is up!
            </span>
          </div>
        ) : (
          <>
            <div
              className={`font-black tracking-tight text-slate-900 dark:text-slate-100 tabular-nums ${
                showHours ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl'
              }`}
            >
              {formatted}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-2">
              {isRunning ? 'Counting Down' : remainingMs < totalMs ? 'Paused' : 'Ready'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
