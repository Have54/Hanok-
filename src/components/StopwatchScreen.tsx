import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Copy, Check } from 'lucide-react';
import { LapItem } from '../types/timer';
import { formatStopwatchTime } from '../utils/format';
import { playTickFeedback } from '../utils/audio';

interface StopwatchScreenProps {
  soundEnabled: boolean;
}

export const StopwatchScreen: React.FC<StopwatchScreenProps> = ({ soundEnabled }) => {
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const startTimeRef = useRef<number>(0);
  const accumulatedMsRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Restore stopwatch state from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timer_plus_stopwatch');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.startTime) {
          accumulatedMsRef.current = parsed.accumulatedMs;
          startTimeRef.current = parsed.startTime;
          setElapsedMs(accumulatedMsRef.current + (Date.now() - parsed.startTime));
          setIsRunning(true);
        } else {
          accumulatedMsRef.current = parsed.accumulatedMs || 0;
          setElapsedMs(accumulatedMsRef.current);
          setIsRunning(false);
        }
        if (parsed.laps) {
          setLaps(parsed.laps);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save stopwatch state to localStorage
  const saveStopwatchState = (running: boolean, accum: number, start: number, lapList: LapItem[]) => {
    try {
      localStorage.setItem(
        'timer_plus_stopwatch',
        JSON.stringify({
          isRunning: running,
          accumulatedMs: accum,
          startTime: start,
          laps: lapList,
        })
      );
    } catch {
      // ignore
    }
  };

  // High precision timer loop using requestAnimationFrame
  useEffect(() => {
    if (isRunning) {
      const tick = () => {
        const now = Date.now();
        const current = accumulatedMsRef.current + (now - startTimeRef.current);
        setElapsedMs(current);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isRunning]);

  const handleStartResume = () => {
    if (soundEnabled) playTickFeedback();
    const now = Date.now();
    startTimeRef.current = now;
    setIsRunning(true);
    saveStopwatchState(true, accumulatedMsRef.current, now, laps);
  };

  const handlePause = () => {
    if (soundEnabled) playTickFeedback();
    const now = Date.now();
    const current = accumulatedMsRef.current + (now - startTimeRef.current);
    accumulatedMsRef.current = current;
    setElapsedMs(current);
    setIsRunning(false);
    saveStopwatchState(false, current, 0, laps);
  };

  const handleReset = () => {
    if (soundEnabled) playTickFeedback();
    setIsRunning(false);
    accumulatedMsRef.current = 0;
    setElapsedMs(0);
    setLaps([]);
    saveStopwatchState(false, 0, 0, []);
  };

  const handleLap = () => {
    if (soundEnabled) playTickFeedback();
    const currentTotal = isRunning
      ? accumulatedMsRef.current + (Date.now() - startTimeRef.current)
      : elapsedMs;

    const lastOverall = laps.length > 0 ? laps[0].overallTimeMs : 0;
    const splitTime = currentTotal - lastOverall;

    const newLap: LapItem = {
      lapIndex: laps.length + 1,
      lapTimeMs: splitTime,
      overallTimeMs: currentTotal,
    };

    const updated = [newLap, ...laps];
    // Recalculate fastest and slowest if >= 2 laps
    if (updated.length >= 2) {
      let minLap = updated[0].lapTimeMs;
      let maxLap = updated[0].lapTimeMs;
      updated.forEach((l) => {
        if (l.lapTimeMs < minLap) minLap = l.lapTimeMs;
        if (l.lapTimeMs > maxLap) maxLap = l.lapTimeMs;
      });
      updated.forEach((l) => {
        l.isFastest = l.lapTimeMs === minLap;
        l.isSlowest = l.lapTimeMs === maxLap;
      });
    }

    setLaps(updated);
    saveStopwatchState(isRunning, accumulatedMsRef.current, startTimeRef.current, updated);
  };

  const handleCopyLaps = () => {
    if (laps.length === 0) return;
    const text = laps
      .map((l) => {
        const split = formatStopwatchTime(l.lapTimeMs);
        const total = formatStopwatchTime(l.overallTimeMs);
        return `Lap ${l.lapIndex}: +${split.minutes}:${split.seconds}.${split.centiseconds} (${total.minutes}:${total.seconds}.${total.centiseconds})`;
      })
      .reverse()
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { hours, minutes, seconds, centiseconds } = formatStopwatchTime(elapsedMs);
  const showHours = Number(hours) > 0;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-blue-50/70 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 overflow-y-auto no-scrollbar">
      {/* Top App Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-blue-100/70 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Stopwatch</span>
            {isRunning && <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Precision millisecond chronograph
          </p>
        </div>

        {laps.length > 0 && (
          <button
            type="button"
            onClick={handleCopyLaps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200/60 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-orange-600 transition-colors shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Export Laps'}</span>
          </button>
        )}
      </div>

      {/* Main Digital Stopwatch Dial Display */}
      <div className="flex flex-col items-center justify-center my-6 py-4">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center border-[8px] border-blue-100/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-inner">
          {/* Subtle rotating glow when running */}
          {isRunning && (
            <div className="absolute inset-0 rounded-full border-[8px] border-transparent border-t-orange-500 animate-spin transition-all duration-300 pointer-events-none" />
          )}

          {/* Time Digits */}
          <div className="flex items-baseline justify-center font-black tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
            {showHours && (
              <>
                <span className="text-3xl sm:text-4xl">{hours}</span>
                <span className="text-2xl text-slate-300 dark:text-slate-600 mx-1">:</span>
              </>
            )}
            <span className="text-4xl sm:text-5xl">{minutes}</span>
            <span className="text-3xl text-slate-300 dark:text-slate-600 mx-1">:</span>
            <span className="text-4xl sm:text-5xl">{seconds}</span>
            <span className="text-2xl text-orange-600 dark:text-orange-500 font-bold ml-1.5 font-mono">
              .{centiseconds}
            </span>
          </div>

          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2">
            {isRunning ? 'Running' : elapsedMs > 0 ? 'Paused' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Stopwatch Action Controls */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        {/* Reset or Lap button */}
        {isRunning ? (
          <button
            type="button"
            onClick={handleLap}
            className="h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-base flex items-center justify-center gap-2 hover:bg-blue-50 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <Flag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span>Lap</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            disabled={elapsedMs === 0}
            className="h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-400 font-extrabold text-base flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        )}

        {/* Start / Pause Orange CTA */}
        {isRunning ? (
          <button
            type="button"
            onClick={handlePause}
            className="h-14 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            <Pause className="w-5 h-5 fill-current" />
            <span>Pause</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStartResume}
            className="h-14 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{elapsedMs > 0 ? 'Resume' : 'Start'}</span>
          </button>
        )}
      </div>

      {/* Laps List */}
      {laps.length > 0 && (
        <div className="mt-2 flex-1 flex flex-col min-h-[140px] border-t border-blue-100 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 px-2">
            <span>Lap</span>
            <span>Split</span>
            <span>Total</span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-56 pr-1 no-scrollbar">
            {laps.map((lap) => {
              const split = formatStopwatchTime(lap.lapTimeMs);
              const total = formatStopwatchTime(lap.overallTimeMs);

              return (
                <div
                  key={lap.lapIndex}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold tabular-nums border transition-colors ${
                    lap.isFastest
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : lap.isSlowest
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      : 'bg-white dark:bg-slate-800/70 border-blue-50 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">#{lap.lapIndex}</span>
                    {lap.isFastest && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                        Fastest
                      </span>
                    )}
                    {lap.isSlowest && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        Slowest
                      </span>
                    )}
                  </div>

                  <span className="font-mono font-bold">
                    +{split.minutes}:{split.seconds}.{split.centiseconds}
                  </span>

                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {total.minutes}:{total.seconds}.{total.centiseconds}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
