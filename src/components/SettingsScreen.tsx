import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Vibrate,
  Moon,
  Sun,
  Bell,
  Play,
  Square,
  ShieldCheck,
  Info,
  Code2,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, SoundId } from '../types/timer';
import { playAlarmSound, stopCurrentAlarm, requestNotificationPermission, triggerVibration } from '../utils/audio';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenAndroidCode: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onOpenAndroidCode,
}) => {
  const [playingPreview, setPlayingPreview] = useState<SoundId | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [notifState, setNotifState] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const soundOptions: { id: SoundId; name: string; desc: string }[] = [
    { id: 'digital_beep', name: 'Digital Alarm Beep', desc: 'Classic electronic repeating pulse' },
    { id: 'cosmic_chime', name: 'Cosmic Chime', desc: 'Melodic gentle rising synth arpeggio' },
    { id: 'radar_pulse', name: 'Radar Pulse', desc: 'Urgent ascending acoustic alert' },
    { id: 'zen_gong', name: 'Zen Gong', desc: 'Deep harmonic resonant bowl' },
    { id: 'marimba', name: 'Marimba Bounce', desc: 'Warm bright acoustic wood strike' },
  ];

  const handleTestSound = (soundId: SoundId) => {
    if (playingPreview === soundId) {
      stopCurrentAlarm();
      setPlayingPreview(null);
    } else {
      stopCurrentAlarm();
      setPlayingPreview(soundId);
      playAlarmSound(soundId, 0.7);
      setTimeout(() => {
        stopCurrentAlarm();
        setPlayingPreview(null);
      }, 3500);
    }
  };

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifState(granted ? 'granted' : 'denied');
    onUpdateSettings({ notificationsEnabled: granted });
  };

  const handleTestVibration = () => {
    triggerVibration([100, 50, 100, 50, 200]);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gradient-to-b from-blue-50/70 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 overflow-y-auto no-scrollbar">
      {/* Top App Bar */}
      <div className="pb-3 border-b border-blue-100/70 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
          App preferences & alarms
        </p>
      </div>

      <div className="mt-4 space-y-4 pb-8">
        {/* Sound & Haptics Section */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-blue-100/80 dark:border-slate-700/80 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Sound & Haptics
          </h3>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                  Sound Alert
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ring when countdown reaches zero
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
            </label>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Vibrate className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                  Haptic Vibration
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Vibrate on timer completion & buttons
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestVibration}
                className="px-2 py-1 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-orange-600 cursor-pointer"
              >
                Test
              </button>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.vibrationEnabled}
                  onChange={(e) => onUpdateSettings({ vibrationEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
              </label>
            </div>
          </div>

          {/* Alarm Tone Picker */}
          <div className="mt-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
              Default Alarm Tone
            </span>
            <div className="space-y-1.5">
              {soundOptions.map((opt) => {
                const isSelected = settings.alarmSound === opt.id;
                const isPlaying = playingPreview === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => onUpdateSettings({ alarmSound: opt.id })}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-slate-900 dark:text-slate-100 font-bold'
                        : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-orange-200'
                    }`}
                  >
                    <div>
                      <span className="block">{opt.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{opt.desc}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestSound(opt.id);
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-orange-600'
                        }`}
                        title={isPlaying ? 'Stop Sound' : 'Play Preview'}
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Display & Behavior */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-blue-100/80 dark:border-slate-700/80 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Display & Notifications
          </h3>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                {settings.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                  Dark Mode
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Switch between light and dark palette
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => onUpdateSettings({ darkMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
            </label>
          </div>

          {/* Notifications Permission */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                  System Notifications
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Alert when app is backgrounded
                </span>
              </div>
            </div>
            {notifState === 'granted' ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Allowed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleRequestNotif}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-500 cursor-pointer shadow-xs"
              >
                Enable
              </button>
            )}
          </div>

          {/* Keep Screen Awake */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                  Keep Screen Awake
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Prevent screen sleep during timer
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keepScreenAwake}
                onChange={(e) => onUpdateSettings({ keepScreenAwake: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600" />
            </label>
          </div>
        </div>

        {/* Android Native Studio Project Code */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-white" />
              <h3 className="text-sm font-extrabold tracking-tight">
                Native Android Kotlin Project
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Compose & APK
            </span>
          </div>
          <p className="text-xs text-orange-100 mt-1.5 leading-relaxed">
            Inspect or export the complete Jetpack Compose codebase, AndroidManifest, Foreground Service, and instructions to build the Debug & Release APK.
          </p>
          <button
            type="button"
            onClick={onOpenAndroidCode}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] transition-all"
          >
            <span>View Kotlin Code & APK Build Guide</span>
          </button>
        </div>

        {/* About & Legal */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-blue-100/80 dark:border-slate-700/80 shadow-xs space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            About & Legal
          </h3>

          <div className="flex items-center justify-between text-xs py-1.5 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Version</span>
            </div>
            <span className="font-mono text-slate-500">1.0.0 (Build 2026.10)</span>
          </div>

          <div
            onClick={() => setShowPrivacyPolicy(true)}
            className="flex items-center justify-between text-xs py-1.5 text-slate-700 dark:text-slate-300 hover:text-orange-600 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Privacy Policy</span>
            </div>
            <span className="text-slate-400 hover:underline">Read</span>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Privacy Policy
              </h4>
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 max-h-72 overflow-y-auto leading-relaxed pr-1 no-scrollbar">
              <p>
                <strong>Timer Plus (Multi Timer & Stopwatch)</strong> is committed to preserving your digital privacy. All countdown timers, stopwatch laps, and personal sound preferences are stored 100% locally on your device using client-side localStorage.
              </p>
              <p>
                No personally identifiable information, usage analytics, telemetry, or timer data is transmitted to external servers.
              </p>
              <p>
                Audio alerts are synthesized on-device in real time via the Web Audio API without tracking or profiling.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyPolicy(false)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
