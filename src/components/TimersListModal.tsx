import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Pencil,
  Plus,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';
import { TimerItem } from '../types/timer';
import { formatTimeDisplay } from '../utils/format';

interface TimersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  timers: TimerItem[];
  currentTimerId: string | null;
  onSelectTimer: (id: string) => void;
  onPauseResume: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenEditModal: (timer: TimerItem) => void;
  onAddNewTimer: () => void;
}

export const TimersListModal: React.FC<TimersListModalProps> = ({
  isOpen,
  onClose,
  timers,
  currentTimerId,
  onSelectTimer,
  onPauseResume,
  onReset,
  onDelete,
  onOpenEditModal,
  onAddNewTimer,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  if (!isOpen) return null;

  const filteredTimers = timers.filter((t) => {
    if (filter === 'active') return t.isRunning || (!t.isCompleted && t.remainingMs > 0);
    if (filter === 'completed') return t.isCompleted || t.remainingMs === 0;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[750px] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>All Timers</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold">
                {timers.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage simultaneous countdowns
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddNewTimer();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Segmented Control */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex gap-1 border-b border-slate-100 dark:border-slate-800">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Timers List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
          {filteredTimers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No timers found in this view</p>
            </div>
          ) : (
            filteredTimers.map((timer) => {
              const { formatted } = formatTimeDisplay(timer.remainingMs);
              const isSelected = timer.id === currentTimerId;
              const ratio =
                timer.totalDurationMs > 0
                  ? Math.max(0, Math.min(1, timer.remainingMs / timer.totalDurationMs))
                  : 0;

              return (
                <div
                  key={timer.id}
                  onClick={() => {
                    onSelectTimer(timer.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/80 hover:border-orange-200'
                  }`}
                >
                  {/* Left: Mini Circular Progress & Title */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                      <svg width="48" height="48" className="transform -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="18"
                          className="stroke-slate-100 dark:stroke-slate-700"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="18"
                          className="stroke-orange-500 transition-all duration-200"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - ratio)}
                          strokeLinecap="round"
                        />
                      </svg>
                      {timer.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-orange-600 absolute" />
                      ) : (
                        <span className="text-[10px] font-bold font-mono absolute text-slate-700 dark:text-slate-300">
                          {Math.round(ratio * 100)}%
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[180px]">
                          {timer.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-orange-600 text-white font-bold uppercase tracking-wider">
                            Active Focus
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-base font-bold text-orange-600 dark:text-orange-400">
                          {formatted}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {timer.isRunning ? 'Running' : timer.isCompleted ? 'Finished' : 'Paused'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Pause / Resume */}
                    <button
                      type="button"
                      onClick={() => onPauseResume(timer.id)}
                      className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors cursor-pointer"
                      title={timer.isRunning ? 'Pause' : 'Resume'}
                    >
                      {timer.isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    {/* Reset */}
                    <button
                      type="button"
                      onClick={() => onReset(timer.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(timer)}
                      className="p-2 rounded-xl text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete(timer.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
