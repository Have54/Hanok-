import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  viewMode: 'phone' | 'fluid';
  onToggleViewMode: () => void;
  onOpenAndroidCode: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  viewMode,
  onToggleViewMode,
  onOpenAndroidCode,
}) => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 transition-colors duration-200">
      {/* Top Utility Ribbon for Desktop Viewers */}
      <div className="w-full max-w-4xl hidden sm:flex items-center justify-between py-2 px-4 mb-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Android Jetpack Compose Architecture</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>Material 3 Native Design</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Kotlin Code & APK Modal Trigger */}
          <button
            type="button"
            onClick={onOpenAndroidCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-xs font-semibold cursor-pointer"
          >
            <span className="text-orange-500 font-bold">&lt;/&gt;</span>
            <span>Android Studio Project & APK</span>
          </button>

          {/* Device Frame View Toggle */}
          <button
            type="button"
            onClick={onToggleViewMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors shadow-xs cursor-pointer font-medium"
            title={viewMode === 'phone' ? 'Switch to Fluid Desktop View' : 'Switch to Android Phone View'}
          >
            {viewMode === 'phone' ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Fluid Layout</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          viewMode === 'phone'
            ? 'max-w-[420px] rounded-3xl sm:rounded-[44px] shadow-2xl sm:border-[8px] border-slate-800 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden relative ring-1 ring-black/5 flex flex-col min-h-[780px] sm:h-[844px]'
            : 'max-w-4xl rounded-2xl shadow-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[800px]'
        }`}
      >
        {/* Android Status Bar (Shown in Phone View Mode or on Mobile) */}
        {viewMode === 'phone' && (
          <div className="w-full h-11 px-6 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 select-none bg-blue-50/70 dark:bg-slate-900/90 backdrop-blur-sm border-b border-blue-100/60 dark:border-slate-800/60 z-30 shrink-0">
            {/* Left: Clock */}
            <span className="tabular-nums tracking-tight">{currentTime || '10:24'}</span>

            {/* Center: Punch-hole camera cutout */}
            <div className="w-4 h-4 rounded-full bg-slate-900 dark:bg-black border border-slate-800/80 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950/60" />
            </div>

            {/* Right: Icons (5G, Wi-Fi, Battery) */}
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="text-[10px] font-bold tracking-tighter">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto relative no-scrollbar">
          {children}
        </div>

        {/* Android Gesture Pill Navigation Bar */}
        {viewMode === 'phone' && (
          <div className="w-full h-6 flex items-center justify-center bg-white dark:bg-slate-900 shrink-0 select-none">
            <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
