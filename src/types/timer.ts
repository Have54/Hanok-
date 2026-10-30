export type SoundId = 'digital_beep' | 'cosmic_chime' | 'radar_pulse' | 'zen_gong' | 'marimba';

export interface TimerItem {
  id: string;
  name: string;
  totalDurationMs: number; // original duration set by user
  remainingMs: number;     // remaining milliseconds
  endTime: number | null;  // Date.now() timestamp when it is set to end, null if paused
  isRunning: boolean;
  isCompleted: boolean;
  soundId: SoundId;
  loop: boolean;
  createdAt: number;
}

export interface LapItem {
  lapIndex: number;
  lapTimeMs: number;
  overallTimeMs: number;
  isFastest?: boolean;
  isSlowest?: boolean;
}

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  alarmSound: SoundId;
  darkMode: boolean;
  keepScreenAwake: boolean;
  notificationsEnabled: boolean;
  viewMode: 'phone' | 'fluid';
}

export type NavigationTab = 'timer' | 'stopwatch' | 'settings';
