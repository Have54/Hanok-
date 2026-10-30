import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Pencil,
  Clock,
  Trash2,
  ListPlus,
  Layers,
} from 'lucide-react';
import { TimerItem } from '../types/timer';
import { CircularTimer } from './CircularTimer';
import { formatTimeDisplay } from '../utils/format';

interface ActiveTimerViewProps {
  currentTimer: TimerItem;
  allTimers: TimerItem[];
  onSelectTimer: (id: string) => void;
  onPauseResume: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSeconds: (id: string, seconds: number) => void;
  onOpenEditModal: (timer: TimerItem) => void;
  onAddNewTimer: () => void;
  onOpenAllTimersList: () => void;
}

export const ActiveTimerView: React.FC<ActiveTimerViewProps> = ({
  currentTimer,
  allTimers,
  onSelectTimer,
  onPauseResume,
  onReset,
  onDelete,
  onAddSeconds,
  onOpenEditModal,
  onAddNewTimer,
  onOpenAllTimersList,
}) => {
  const { isRunning, isCompleted, remainingMs, totalDurationMs, name } = currentTimer;
  const otherTimers = allTimers.filter((t) => t.id !== currentTimer.id);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-blue-50/70 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 overflow-y-auto no-scrollbar">
      {/* Multi-Timer Switcher Strip (If multiple timers exist) */}
      {allTimers.length > 1 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Timers ({allTimers.length})
            </span>
            <button
              type="button"
              onClick={onOpenAllTimersList}
              className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              <span>Manage All</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {allTimers.map((t) => {
              const isActiveSelection = t.id === currentTimer.id;
              const { formatted } = formatTimeDisplay(t.remainingMs);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTimer(t.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isActiveSelection
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-300'
                  }`}
                >
                  <span className="truncate max-w-[80px]">{t.name}</span>
                  <span className="font-mono text-[11px] opacity-90">{formatted}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Header: Timer Title & Edit Button */}
      <div className="flex items-center justify-between py-2 border-b border-blue-100/70 dark:border-slate-800">
        <div className="flex items-center gap-2 max-w-[70%]">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white truncate">
            {name || 'Timer'}
          </h2>
          <button
            type="button"
            onClick={() => onOpenEditModal(currentTimer)}
            aria-label="Edit Timer Name and Settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Add Another Timer Button */}
          <button
            type="button"
            onClick={onAddNewTimer}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-blue-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-blue-200/60 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 transition-colors shadow-xs cursor-pointer"
            title="Create New Timer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span className="hidden xs:inline">Add Timer</span>
          </button>

          {/* Delete Timer Button */}
          <button
            type="button"
            onClick={() => onDelete(currentTimer.id)}
            aria-label="Delete Timer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Large Circular Countdown Timer */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 py-2">
        <CircularTimer
          totalMs={totalDurationMs}
          remainingMs={remainingMs}
          isRunning={isRunning}
          isCompleted={isCompleted}
          size={270}
        />

        {/* Quick Add Buttons: +10s, +30s, +1m */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => onAddSeconds(currentTimer.id, 10)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/90 border border-blue-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            +10s
          </button>
          <button
            type="button"
            onClick={() => onAddSeconds(currentTimer.id, 30)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/90 border border-blue-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            +30s
          </button>
          <button
            type="button"
            onClick={() => onAddSeconds(currentTimer.id, 60)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/90 border border-blue-100 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            +1m
          </button>
        </div>
      </div>

      {/* Bottom Action Controls: Stop/Reset & Pause/Resume */}
      <div className="grid grid-cols-2 gap-3 pt-2 pb-2">
        {/* Reset / Stop Button */}
        <button
          type="button"
          onClick={() => onReset(currentTimer.id)}
          className="h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-orange-200 dark:border-slate-700 text-orange-600 dark:text-orange-400 font-extrabold text-base flex items-center justify-center gap-2 hover:bg-orange-50 dark:hover:bg-slate-700/60 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </button>

        {/* Orange Pause / Resume Button */}
        <button
          type="button"
          onClick={() => onPauseResume(currentTimer.id)}
          className="h-14 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-orange-600/30 cursor-pointer"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Resume</span>
            </>
          )}
        </button>
      </div>

      {/* "Add Another Timer" bottom link if user wants to launch another preset */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onAddNewTimer}
          className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1.5 py-1 cursor-pointer transition-colors"
        >
          <ListPlus className="w-4 h-4 text-orange-500" />
          <span>Add Another Timer</span>
        </button>
      </div>
    </div>
  );
};
