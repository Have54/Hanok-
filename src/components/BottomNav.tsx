import React from 'react';
import { Timer as TimerIcon, Watch, Settings as SettingsIcon } from 'lucide-react';
import { NavigationTab } from '../types/timer';

interface BottomNavProps {
  currentTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  activeTimersCount: number;
  isStopwatchRunning: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  activeTimersCount,
  isStopwatchRunning,
}) => {
  const tabs = [
    {
      id: 'timer' as NavigationTab,
      label: 'Timer',
      icon: TimerIcon,
      badge: activeTimersCount > 0 ? activeTimersCount : null,
    },
    {
      id: 'stopwatch' as NavigationTab,
      label: 'Stopwatch',
      icon: Watch,
      badgeDot: isStopwatchRunning,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: SettingsIcon,
    },
  ];

  return (
    <nav className="w-full h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-blue-100/70 dark:border-slate-800 flex items-center justify-around px-4 select-none shrink-0 z-20">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center w-20 h-12 rounded-2xl transition-all duration-150 cursor-pointer ${
              isActive
                ? 'text-orange-600 dark:text-orange-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            {/* Active Pill Glow/Background */}
            {isActive && (
              <div
                className="absolute inset-0 bg-orange-50 dark:bg-orange-950/40 rounded-2xl -z-10 border border-orange-200/50 dark:border-orange-800/30"
              />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />

              {/* Numerical Badge for Running Timers */}
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-orange-600 text-white text-[9px] font-extrabold flex items-center justify-center leading-none shadow-xs">
                  {tab.badge}
                </span>
              )}

              {/* Pulsing Dot for Running Stopwatch */}
              {tab.badgeDot && !tab.badge && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              )}
            </div>

            <span className="text-[11px] mt-1 tracking-tight leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
