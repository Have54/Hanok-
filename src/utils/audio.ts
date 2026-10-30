import { SoundId } from '../types/timer';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let activeAlarmStopFn: (() => void) | null = null;

export function stopCurrentAlarm() {
  if (activeAlarmStopFn) {
    try {
      activeAlarmStopFn();
    } catch {
      // ignore
    }
    activeAlarmStopFn = null;
  }
}

/**
 * Synthesizes alarm audio using the Web Audio API without needing external MP3 files.
 */
export function playAlarmSound(soundId: SoundId, volume = 0.8): () => void {
  stopCurrentAlarm();
  const ctx = getAudioContext();
  let isStopped = false;
  let intervalId: number | null = null;

  const playTone = (freq: number, type: OscillatorType, duration: number, delay = 0, gainLevel = volume) => {
    if (isStopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gain.gain.setValueAtTime(gainLevel, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  };

  if (soundId === 'digital_beep') {
    const cycle = () => {
      if (isStopped) return;
      playTone(880, 'square', 0.12, 0, volume * 0.4);
      playTone(880, 'square', 0.12, 0.16, volume * 0.4);
      playTone(880, 'square', 0.12, 0.32, volume * 0.4);
      playTone(1100, 'square', 0.25, 0.48, volume * 0.45);
    };
    cycle();
    intervalId = window.setInterval(cycle, 1200);
  } else if (soundId === 'cosmic_chime') {
    const cycle = () => {
      if (isStopped) return;
      playTone(523.25, 'sine', 0.8, 0, volume * 0.6); // C5
      playTone(659.25, 'sine', 0.8, 0.2, volume * 0.6); // E5
      playTone(783.99, 'sine', 0.8, 0.4, volume * 0.6); // G5
      playTone(1046.5, 'sine', 1.2, 0.6, volume * 0.7); // C6
    };
    cycle();
    intervalId = window.setInterval(cycle, 1800);
  } else if (soundId === 'radar_pulse') {
    const cycle = () => {
      if (isStopped) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    };
    cycle();
    intervalId = window.setInterval(cycle, 800);
  } else if (soundId === 'zen_gong') {
    const cycle = () => {
      if (isStopped) return;
      // Rich overtone gong
      [220, 330, 440, 554, 660].forEach((freq, idx) => {
        playTone(freq, 'sine', 2.2, 0, (volume * 0.4) / (idx + 1));
      });
    };
    cycle();
    intervalId = window.setInterval(cycle, 2800);
  } else {
    // marimba
    const cycle = () => {
      if (isStopped) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        playTone(freq, 'triangle', 0.2, i * 0.12, volume * 0.6);
      });
    };
    cycle();
    intervalId = window.setInterval(cycle, 1400);
  }

  const stop = () => {
    isStopped = true;
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  activeAlarmStopFn = stop;
  return stop;
}

/**
 * Subtle tactile haptic tick sound for button taps and scrolling number wheels
 */
export function playTickFeedback() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.02);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch {
    // ignore
  }
}

/**
 * Tactile vibration feedback using Navigator Vibration API
 */
export function triggerVibration(pattern: number[] = [80, 50, 80]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // ignore
    }
  }
}

/**
 * Browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch {
    return false;
  }
}

export function showSystemNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'multi-timer-alert',
      });
    } catch {
      // In some sandboxed iframes, Notification constructor might throw
    }
  }
}
