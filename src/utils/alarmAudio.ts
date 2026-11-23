// Generates a loud, clear medical double-chime WAV buffer in memory and plays it via HTMLAudioElement
// (much more reliable on Android/iOS mobile browsers than AudioContext alone)

let cachedWavUrl: string | null = null;
let activeAudioEl: HTMLAudioElement | null = null;
let stopTimerId: number | null = null;
let vibrateIntervalId: number | null = null;
let audioUnlocked = false;
let fallbackCtx: AudioContext | null = null;
let fallbackIntervalId: number | null = null;

function buildMedicalChimeWavUrl(): string {
  if (cachedWavUrl) return cachedWavUrl;

  const sampleRate = 22050;
  const durationSec = 2.2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF / WAVE header
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // 4 distinct bright medical chime tones inside each 2.2s loop
  const notes = [
    { start: 0.0, dur: 0.24, f1: 880, f2: 1318.5 },
    { start: 0.26, dur: 0.24, f1: 987.8, f2: 1480.0 },
    { start: 0.52, dur: 0.42, f1: 1046.5, f2: 1568.0 },
    { start: 1.08, dur: 0.55, f1: 1174.7, f2: 1760.0 },
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const n of notes) {
      if (t >= n.start && t <= n.start + n.dur) {
        const localT = t - n.start;
        const attack = Math.min(1, localT / 0.015);
        const decay = Math.exp(-localT * 4.5);
        const env = attack * decay;
        const wave =
          0.65 * Math.sin(2 * Math.PI * n.f1 * localT) +
          0.35 * Math.sin(2 * Math.PI * n.f2 * localT);
        sample += wave * env * 0.85;
      }
    }

    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  cachedWavUrl = URL.createObjectURL(blob);
  return cachedWavUrl;
}

function getOrCreateAudioEl(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!activeAudioEl) {
    const url = buildMedicalChimeWavUrl();
    activeAudioEl = new Audio(url);
    activeAudioEl.preload = 'auto';
    activeAudioEl.loop = true;
    activeAudioEl.volume = 1.0;
  }
  return activeAudioEl;
}

async function playFallbackOscillatorPhrase() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!fallbackCtx || fallbackCtx.state === 'closed') {
      fallbackCtx = new AudioContextClass();
    }
    if (fallbackCtx.state === 'suspended') {
      await fallbackCtx.resume();
    }
    const now = fallbackCtx.currentTime;
    const tones = [
      { freq: 880, start: 0, dur: 0.22 },
      { freq: 1046.5, start: 0.24, dur: 0.22 },
      { freq: 1318.5, start: 0.48, dur: 0.4 },
    ];
    tones.forEach(({ freq, start, dur }) => {
      if (!fallbackCtx) return;
      const osc = fallbackCtx.createOscillator();
      const gain = fallbackCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.01, now + start);
      gain.gain.linearRampToValueAtTime(0.55, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain);
      gain.connect(fallbackCtx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });
  } catch {}
}

/**
 * Call inside any user tap/click handler so mobile browsers permit future audio playback.
 */
export function unlockAlarmAudio(): void {
  if (typeof window === 'undefined' || audioUnlocked) return;
  try {
    const el = getOrCreateAudioEl();
    if (el) {
      const prevMuted = el.muted;
      el.muted = true;
      const p = el.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          el.pause();
          el.currentTime = 0;
          el.muted = prevMuted;
          audioUnlocked = true;
        }).catch(() => {
          el.muted = prevMuted;
        });
      }
    }
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      if (!fallbackCtx || fallbackCtx.state === 'closed') {
        fallbackCtx = new AudioContextClass();
      }
      if (fallbackCtx.state === 'suspended') {
        fallbackCtx.resume().catch(() => {});
      }
    }
  } catch {}
}

export function stopAlarmRing(): void {
  if (stopTimerId !== null) {
    window.clearTimeout(stopTimerId);
    stopTimerId = null;
  }
  if (vibrateIntervalId !== null) {
    window.clearInterval(vibrateIntervalId);
    vibrateIntervalId = null;
  }
  if (fallbackIntervalId !== null) {
    window.clearInterval(fallbackIntervalId);
    fallbackIntervalId = null;
  }
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
      activeAudioEl.currentTime = 0;
    } catch {}
  }
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(0);
    }
  } catch {}
}

/**
 * Starts the medical alarm sound loop for `durationMs` (default 30s).
 * Returns `true` if HTMLAudio/AudioContext started, or `false` if browser blocked autoplay.
 */
export async function startAlarmRing(durationMs: number = 30000): Promise<boolean> {
  stopAlarmRing();

  const triggerVibration = () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([350, 120, 350, 120, 500]);
      }
    } catch {}
  };

  triggerVibration();
  vibrateIntervalId = window.setInterval(triggerVibration, 2200);

  let played = false;
  const el = getOrCreateAudioEl();
  if (el) {
    try {
      el.muted = false;
      el.volume = 1.0;
      el.currentTime = 0;
      await el.play();
      played = true;
    } catch {
      played = false;
    }
  }

  if (!played) {
    try {
      await playFallbackOscillatorPhrase();
      fallbackIntervalId = window.setInterval(() => {
        playFallbackOscillatorPhrase();
      }, 2200);
      played = fallbackCtx?.state === 'running';
    } catch {
      played = false;
    }
  }

  stopTimerId = window.setTimeout(() => {
    stopAlarmRing();
  }, durationMs);

  return played;
}
