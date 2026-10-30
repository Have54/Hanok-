import React from 'react';
import { Bell, RotateCcw, X, Plus } from 'lucide-react';
import { TimerItem } from '../types/timer';

interface CompletedTimerAlertProps {
  timer: TimerItem | null;
  onDismiss: () => void;
  onRestart: (id: string) => void;
  onAddMinute: (id: string) => void;
}

export const CompletedTimerAlert: React.FC<CompletedTimerAlertProps> = ({
  timer,
  onDismiss,
  onRestart,
  onAddMinute,
}) => {
  if (!timer) return null;

  return (
    <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="p-4 rounded-3xl bg-orange-600 text-white shadow-2xl shadow-orange-900/40 border border-orange-400/40 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center animate-bounce">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-200">
                Timer Finished
              </span>
              <h4 className="text-base font-extrabold truncate max-w-[200px]">
                {timer.name}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 py-2 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Stop Alarm
          </button>
          <button
            type="button"
            onClick={() => onAddMinute(timer.id)}
            className="px-3 py-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+1m</span>
          </button>
          <button
            type="button"
            onClick={() => onRestart(timer.id)}
            className="p-2 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold cursor-pointer transition-colors"
            title="Restart timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
