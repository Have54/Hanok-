import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { TimerItem, SoundId } from '../types/timer';
import { msToHms, hmsToMs } from '../utils/format';
import { WheelPicker } from './WheelPicker';

interface EditTimerModalProps {
  timer: TimerItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, newDurationMs: number, soundId: SoundId, loop: boolean) => void;
}

export const EditTimerModal: React.FC<EditTimerModalProps> = ({
  timer,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !timer) return null;

  const currentHms = msToHms(timer.totalDurationMs);
  const [name, setName] = useState(timer.name);
  const [hours, setHours] = useState(currentHms.hours);
  const [minutes, setMinutes] = useState(currentHms.minutes);
  const [seconds, setSeconds] = useState(currentHms.seconds);
  const [soundId, setSoundId] = useState<SoundId>(timer.soundId || 'digital_beep');
  const [loop, setLoop] = useState(timer.loop || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMs = hmsToMs(hours, minutes, seconds);
    if (totalMs <= 0) return;
    onSave(timer.id, name.trim() || timer.name, totalMs, soundId, loop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
            Edit Timer
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Timer Label
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Adjust Total Duration
            </span>
            <div className="flex items-center justify-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
              <WheelPicker label="H" value={hours} min={0} max={23} onChange={setHours} />
              <span className="text-lg font-bold text-slate-400 mt-6">:</span>
              <WheelPicker label="M" value={minutes} min={0} max={59} onChange={setMinutes} />
              <span className="text-lg font-bold text-slate-400 mt-6">:</span>
              <WheelPicker label="S" value={seconds} min={0} max={59} onChange={setSeconds} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Tone
              </label>
              <select
                value={soundId}
                onChange={(e) => setSoundId(e.target.value as SoundId)}
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
                Loop
              </label>
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <span>Repeat</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
