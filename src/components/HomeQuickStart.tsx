import React, { useState } from 'react';
import { Play, Settings2, Sparkles, ChevronRight, Clock } from 'lucide-react';
import { WheelPicker } from './WheelPicker';
import { SoundId, TimerItem } from '../types/timer';
import { hmsToMs } from '../utils/format';
import { playTickFeedback } from '../utils/audio';

interface HomeQuickStartProps {
  onStartTimer: (durationMs: number, name: string, soundId: SoundId, loop: boolean) => void;
  activeTimers: TimerItem[];
  onViewActiveTimers: () => void;
  defaultSound: SoundId;
  soundEnabled: boolean;
}

export const HomeQuickStart: React.FC<HomeQuickStartProps> = ({
  onStartTimer,
  activeTimers,
  onViewActiveTimers,
  defaultSound,
  soundEnabled,
}) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const [seconds, setSeconds] = useState(0);

  const [timerName, setTimerName] = useState('');
  const [selectedSound, setSelectedSound] = useState<SoundId>(defaultSound);
  const [loop, setLoop] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Quick presets requested in user brief: 5m, 10m, 15m, 30m
  const presets = [
    { label: '5 Min', m: 5, h: 0, s: 0 },
    { label: '10 Min', m: 10, h: 0, s: 0 },
    { label: '15 Min', m: 15, h: 0, s: 0 },
    { label: '30 Min', m: 30, h: 0, s: 0 },
  ];

  const handlePresetSelect = (preset: { h: number; m: number; s: number }) => {
    if (soundEnabled) playTickFeedback();
    setHours(preset.h);
    setMinutes(preset.m);
    setSeconds(preset.s);
  };

  const handleStart = () => {
    const totalMs = hmsToMs(hours, minutes, seconds);
    if (totalMs <= 0) return;

    const defaultName = timerName.trim() || `Timer (${minutes > 0 ? `${minutes}m` : ''}${seconds > 0 ? ` ${seconds}s` : ''})`;
    onStartTimer(totalMs, defaultName, selectedSound, loop);
  };

  const currentDurationMs = hmsToMs(hours, minutes, seconds);
  const isStartDisabled = currentDurationMs <= 0;
  const runningTimersCount = activeTimers.filter((t) => t.isRunning).length;

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-blue-50/70 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 overflow-y-auto no-scrollbar">
      {/* Top App Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-blue-100/70 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Timer Plus</span>
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Quick start & multi-countdown
          </p>
        </div>

        {/* Multi-timer pill badge if active */}
        {runningTimersCount > 0 && (
          <button
            type="button"
            onClick={onViewActiveTimers}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 transition-colors shadow-xs cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 animate-spin text-orange-500" />
            <span>{runningTimersCount} Running</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Timer Presets */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Presets
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Tap to load
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => {
            const isMatch = hours === preset.h && minutes === preset.m && seconds === preset.s;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all duration-150 flex flex-col items-center justify-center border shadow-xs cursor-pointer ${
                  isMatch
                    ? 'bg-orange-600 border-orange-600 text-white shadow-orange-500/20 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-slate-800/80 border-blue-100 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-orange-300 dark:hover:border-orange-700'
                }`}
              >
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrolling Number Wheels Card */}
      <div className="mt-5 p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-blue-100/80 dark:border-slate-700/80 shadow-sm flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/50">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Custom Duration
          </span>
          <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400">
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-6 py-2">
          {/* Hours Wheel */}
          <WheelPicker
            label="Hours"
            value={hours}
            min={0}
            max={23}
            onChange={setHours}
            soundFeedback={soundEnabled}
          />
          <span className="text-2xl font-bold text-slate-300 dark:text-slate-600 mt-6">:</span>

          {/* Minutes Wheel */}
          <WheelPicker
            label="Minutes"
            value={minutes}
            min={0}
            max={59}
            onChange={setMinutes}
            soundFeedback={soundEnabled}
          />
          <span className="text-2xl font-bold text-slate-300 dark:text-slate-600 mt-6">:</span>

          {/* Seconds Wheel */}
          <WheelPicker
            label="Seconds"
            value={seconds}
            min={0}
            max={59}
            onChange={setSeconds}
            soundFeedback={soundEnabled}
          />
        </div>
      </div>

      {/* Advanced Timer Settings Toggle */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors py-1 cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Advanced Options' : 'Advanced Timer Settings'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-2.5 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700/80 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Timer Label (Optional)
              </label>
              <input
                type="text"
                value={timerName}
                onChange={(e) => setTimerName(e.target.value)}
                placeholder="e.g., Focus Work, Tea, Workout Rest"
                maxLength={40}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Alarm Tone
                </label>
                <select
                  value={selectedSound}
                  onChange={(e) => setSelectedSound(e.target.value as SoundId)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="digital_beep">Digital Beep</option>
                  <option value="cosmic_chime">Cosmic Chime</option>
                  <option value="radar_pulse">Radar Pulse</option>
                  <option value="zen_gong">Zen Gong</option>
                  <option value="marimba">Marimba</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Loop / Repeat
                </label>
                <label className="flex items-center gap-2 mt-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Auto repeat</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Large Orange Start Button */}
      <div className="mt-auto pt-6 pb-2">
        <button
          type="button"
          onClick={handleStart}
          disabled={isStartDisabled}
          className="w-full h-14 rounded-2xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg shadow-orange-600/30 transition-all duration-150 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Countdown</span>
        </button>
      </div>
    </div>
  );
};
