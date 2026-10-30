import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  TimerItem,
  AppSettings,
  NavigationTab,
  SoundId,
} from './types/timer';
import { AndroidFrame } from './components/AndroidFrame';
import { HomeQuickStart } from './components/HomeQuickStart';
import { ActiveTimerView } from './components/ActiveTimerView';
import { StopwatchScreen } from './components/StopwatchScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { TimersListModal } from './components/TimersListModal';
import { EditTimerModal } from './components/EditTimerModal';
import { AndroidCodeModal } from './components/AndroidCodeModal';
import { CompletedTimerAlert } from './components/CompletedTimerAlert';
import {
  playAlarmSound,
  stopCurrentAlarm,
  triggerVibration,
  showSystemNotification,
  playTickFeedback,
} from './utils/audio';

const STORAGE_KEY_TIMERS = 'timer_plus_timers_v1';
const STORAGE_KEY_SETTINGS = 'timer_plus_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  alarmSound: 'digital_beep',
  darkMode: false,
  keepScreenAwake: true,
  notificationsEnabled: false,
  viewMode: 'phone',
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [timers, setTimers] = useState<TimerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TIMERS);
      if (saved) {
        const parsed: TimerItem[] = JSON.parse(saved);
        // Recalculate remainingMs for any timers that were running
        const now = Date.now();
        return parsed.map((t) => {
          if (t.isRunning && t.endTime) {
            const diff = t.endTime - now;
            if (diff <= 0) {
              return { ...t, isRunning: false, isCompleted: true, remainingMs: 0, endTime: null };
            } else {
              return { ...t, remainingMs: diff };
            }
          }
          return t;
        });
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeTimerId, setActiveTimerId] = useState<string | null>(() => {
    return timers.length > 0 ? timers[0].id : null;
  });

  const [currentTab, setCurrentTab] = useState<NavigationTab>('timer');
  const [showQuickStartExplicitly, setShowQuickStartExplicitly] = useState(false);

  // Modals
  const [isAllTimersModalOpen, setIsAllTimersModalOpen] = useState(false);
  const [editingTimer, setEditingTimer] = useState<TimerItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAndroidCodeModalOpen, setIsAndroidCodeModalOpen] = useState(false);
  const [ringingTimer, setRingingTimer] = useState<TimerItem | null>(null);

  // Wake Lock sentinel
  const wakeLockRef = useRef<unknown>(null);

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Save timers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIMERS, JSON.stringify(timers));
    } catch {
      // ignore
    }
  }, [timers]);

  // Screen Wake Lock API
  useEffect(() => {
    const hasRunningTimers = timers.some((t) => t.isRunning);
    const nav = navigator as unknown as { wakeLock?: { request: (type: string) => Promise<{ release: () => Promise<void> }> } };

    if (nav.wakeLock && settings.keepScreenAwake && hasRunningTimers) {
      const requestWakeLock = async () => {
        try {
          if (nav.wakeLock) {
            wakeLockRef.current = await nav.wakeLock.request('screen');
          }
        } catch {
          // ignore wake lock failure
        }
      };
      requestWakeLock();
    } else if (wakeLockRef.current) {
      try {
        const sentinel = wakeLockRef.current as { release: () => Promise<void> };
        sentinel.release();
        wakeLockRef.current = null;
      } catch {
        // ignore
      }
    }
  }, [timers, settings.keepScreenAwake]);

  // Trigger celebration and alert when a timer finishes
  const handleTimerFinished = useCallback((timer: TimerItem) => {
    if (settings.soundEnabled) {
      playAlarmSound(timer.soundId || settings.alarmSound, 0.85);
    }
    if (settings.vibrationEnabled) {
      triggerVibration([200, 100, 200, 100, 400]);
    }
    showSystemNotification('Timer Finished!', `${timer.name} has reached 00:00.`);
    setRingingTimer(timer);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF6B00', '#FFA04D', '#3B82F6', '#10B981'],
      });
    } catch {
      // ignore
    }
  }, [settings.soundEnabled, settings.vibrationEnabled, settings.alarmSound]);

  // Accurate Master Timer Loop (runs every 100ms)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasFinishedTimer = false;

      setTimers((prevTimers) => {
        let changed = false;
        const next = prevTimers.map((timer) => {
          if (!timer.isRunning || !timer.endTime) return timer;

          const remaining = Math.max(0, timer.endTime - now);
          if (remaining === 0) {
            changed = true;
            hasFinishedTimer = true;
            handleTimerFinished(timer);

            if (timer.loop) {
              // Auto-restart if loop is enabled
              return {
                ...timer,
                remainingMs: timer.totalDurationMs,
                endTime: now + timer.totalDurationMs,
                isRunning: true,
                isCompleted: false,
              };
            }

            return {
              ...timer,
              remainingMs: 0,
              endTime: null,
              isRunning: false,
              isCompleted: true,
            };
          }

          if (Math.abs(timer.remainingMs - remaining) > 50) {
            changed = true;
            return {
              ...timer,
              remainingMs: remaining,
            };
          }

          return timer;
        });

        return changed ? next : prevTimers;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [handleTimerFinished]);

  // Start a new timer
  const handleStartTimer = (durationMs: number, name: string, soundId: SoundId, loop: boolean) => {
    if (settings.soundEnabled) playTickFeedback();
    const now = Date.now();
    const newTimer: TimerItem = {
      id: `timer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name || 'Timer',
      totalDurationMs: durationMs,
      remainingMs: durationMs,
      endTime: now + durationMs,
      isRunning: true,
      isCompleted: false,
      soundId,
      loop,
      createdAt: now,
    };

    setTimers((prev) => [newTimer, ...prev]);
    setActiveTimerId(newTimer.id);
    setShowQuickStartExplicitly(false);
  };

  // Pause / Resume a timer
  const handlePauseResume = (id: string) => {
    if (settings.soundEnabled) playTickFeedback();
    const now = Date.now();

    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        if (t.isRunning) {
          // Pause it
          return {
            ...t,
            isRunning: false,
            endTime: null,
          };
        } else {
          // Resume it
          const remaining = t.remainingMs <= 0 ? t.totalDurationMs : t.remainingMs;
          return {
            ...t,
            isRunning: true,
            isCompleted: false,
            remainingMs: remaining,
            endTime: now + remaining,
          };
        }
      })
    );
  };

  // Reset a timer to its original duration
  const handleResetTimer = (id: string) => {
    if (settings.soundEnabled) playTickFeedback();
    stopCurrentAlarm();
    if (ringingTimer?.id === id) setRingingTimer(null);

    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          remainingMs: t.totalDurationMs,
          endTime: null,
          isRunning: false,
          isCompleted: false,
        };
      })
    );
  };

  // Delete a timer
  const handleDeleteTimer = (id: string) => {
    if (settings.soundEnabled) playTickFeedback();
    if (ringingTimer?.id === id) {
      stopCurrentAlarm();
      setRingingTimer(null);
    }
    const updated = timers.filter((t) => t.id !== id);
    setTimers(updated);
    if (activeTimerId === id) {
      setActiveTimerId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Add seconds dynamically (+10s, +30s, +1m)
  const handleAddSeconds = (id: string, seconds: number) => {
    if (settings.soundEnabled) playTickFeedback();
    const addedMs = seconds * 1000;
    const now = Date.now();

    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newRemaining = t.remainingMs + addedMs;
        const newTotal = Math.max(t.totalDurationMs, newRemaining);

        return {
          ...t,
          remainingMs: newRemaining,
          totalDurationMs: newTotal,
          isCompleted: false,
          endTime: t.isRunning ? (t.endTime ? t.endTime + addedMs : now + newRemaining) : null,
        };
      })
    );
  };

  // Edit timer callback
  const handleSaveEditedTimer = (
    id: string,
    name: string,
    newDurationMs: number,
    soundId: SoundId,
    loop: boolean
  ) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const wasRunning = t.isRunning;
        return {
          ...t,
          name,
          totalDurationMs: newDurationMs,
          remainingMs: newDurationMs,
          soundId,
          loop,
          endTime: wasRunning ? Date.now() + newDurationMs : null,
          isCompleted: false,
        };
      })
    );
  };

  // Dismiss completed alarm banner
  const handleDismissAlert = () => {
    stopCurrentAlarm();
    setRingingTimer(null);
  };

  // Active timer item
  const currentActiveTimer = timers.find((t) => t.id === activeTimerId) || null;
  const runningTimersCount = timers.filter((t) => t.isRunning).length;

  return (
    <AndroidFrame
      viewMode={settings.viewMode}
      onToggleViewMode={() =>
        setSettings((s) => ({ ...s, viewMode: s.viewMode === 'phone' ? 'fluid' : 'phone' }))
      }
      onOpenAndroidCode={() => setIsAndroidCodeModalOpen(true)}
    >
      {/* Alert banner when a timer finishes */}
      <CompletedTimerAlert
        timer={ringingTimer}
        onDismiss={handleDismissAlert}
        onRestart={(id) => {
          handleResetTimer(id);
          handlePauseResume(id);
          handleDismissAlert();
        }}
        onAddMinute={(id) => {
          handleAddSeconds(id, 60);
          handleDismissAlert();
        }}
      />

      {/* Main Tab Content Routing */}
      {currentTab === 'timer' && (
        <>
          {currentActiveTimer && !showQuickStartExplicitly ? (
            <ActiveTimerView
              currentTimer={currentActiveTimer}
              allTimers={timers}
              onSelectTimer={(id) => {
                setActiveTimerId(id);
                setShowQuickStartExplicitly(false);
              }}
              onPauseResume={handlePauseResume}
              onReset={handleResetTimer}
              onDelete={handleDeleteTimer}
              onAddSeconds={handleAddSeconds}
              onOpenEditModal={(timer) => {
                setEditingTimer(timer);
                setIsEditModalOpen(true);
              }}
              onAddNewTimer={() => setShowQuickStartExplicitly(true)}
              onOpenAllTimersList={() => setIsAllTimersModalOpen(true)}
            />
          ) : (
            <HomeQuickStart
              onStartTimer={handleStartTimer}
              activeTimers={timers}
              onViewActiveTimers={() => {
                if (currentActiveTimer) {
                  setShowQuickStartExplicitly(false);
                } else if (timers.length > 0) {
                  setActiveTimerId(timers[0].id);
                  setShowQuickStartExplicitly(false);
                }
              }}
              defaultSound={settings.alarmSound}
              soundEnabled={settings.soundEnabled}
            />
          )}
        </>
      )}

      {currentTab === 'stopwatch' && (
        <StopwatchScreen soundEnabled={settings.soundEnabled} />
      )}

      {currentTab === 'settings' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={(updated) => setSettings((s) => ({ ...s, ...updated }))}
          onOpenAndroidCode={() => setIsAndroidCodeModalOpen(true)}
        />
      )}

      {/* Modern Android Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={(tab) => {
          if (settings.soundEnabled) playTickFeedback();
          setCurrentTab(tab);
          if (tab === 'timer' && timers.length > 0) {
            setShowQuickStartExplicitly(false);
          }
        }}
        activeTimersCount={runningTimersCount}
        isStopwatchRunning={false}
      />

      {/* All Timers Modal */}
      <TimersListModal
        isOpen={isAllTimersModalOpen}
        onClose={() => setIsAllTimersModalOpen(false)}
        timers={timers}
        currentTimerId={activeTimerId}
        onSelectTimer={(id) => {
          setActiveTimerId(id);
          setShowQuickStartExplicitly(false);
        }}
        onPauseResume={handlePauseResume}
        onReset={handleResetTimer}
        onDelete={handleDeleteTimer}
        onOpenEditModal={(timer) => {
          setEditingTimer(timer);
          setIsEditModalOpen(true);
        }}
        onAddNewTimer={() => {
          setShowQuickStartExplicitly(true);
          setCurrentTab('timer');
        }}
      />

      {/* Edit Timer Modal */}
      <EditTimerModal
        timer={editingTimer}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTimer(null);
        }}
        onSave={handleSaveEditedTimer}
      />

      {/* Android Kotlin & APK Project Drawer */}
      <AndroidCodeModal
        isOpen={isAndroidCodeModalOpen}
        onClose={() => setIsAndroidCodeModalOpen(false)}
      />
    </AndroidFrame>
  );
}
