import type { AppSettings } from './types';

let audioCtx: AudioContext | null = null;
let currentAlarmInterval: number | null = null;
let activeOscillators: OscillatorNode[] = [];
let alarmVolume = 0.8;
let soundPattern: AppSettings['alarmSoundPattern'] = 'digital';

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAlarmVolume(volume: number) {
  alarmVolume = volume;
}

export function setAlarmPattern(pattern: AppSettings['alarmSoundPattern']) {
  soundPattern = pattern;
}

// Helper to play a single digital beep (square wave)
function playDigitalBeep(ctx: AudioContext, time: number, duration: number, freq = 880) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(freq, time);
  
  // Set target volume
  gain.gain.setValueAtTime(alarmVolume, time);
  // Fade out slightly at the end to prevent clicking sound
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + duration);
  
  activeOscillators.push(osc);
  osc.onended = () => {
    activeOscillators = activeOscillators.filter(o => o !== osc);
  };
}

// Helper to play a chime chord note
function playChimeNote(ctx: AudioContext, time: number, duration: number, freq = 523.25) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, time);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 1.5, time); // 5th interval for harmony

  gain.gain.setValueAtTime(alarmVolume * 0.5, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + duration);
  osc2.stop(time + duration);

  activeOscillators.push(osc1, osc2);
  osc1.onended = () => {
    activeOscillators = activeOscillators.filter(o => o !== osc1 && o !== osc2);
  };
}

// Plays the alarm pattern once
function playPatternOnce() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  if (soundPattern === 'digital') {
    // 3 quick beeps
    playDigitalBeep(ctx, now, 0.1, 987.77); // B5
    playDigitalBeep(ctx, now + 0.15, 0.1, 987.77);
    playDigitalBeep(ctx, now + 0.3, 0.18, 987.77);
  } else if (soundPattern === 'chime') {
    // Elegant arpeggio
    playChimeNote(ctx, now, 1.5, 523.25); // C5
    playChimeNote(ctx, now + 0.25, 1.25, 659.25); // E5
    playChimeNote(ctx, now + 0.5, 1.0, 783.99); // G5
  } else if (soundPattern === 'pulse') {
    // Slow deep warning pulse
    playDigitalBeep(ctx, now, 0.5, 523.25); // C5
  }
}

export function playTestSound() {
  try {
    playPatternOnce();
  } catch (e) {
    console.error('Failed to play test sound. Ensure user interaction occurred.', e);
  }
}

export function startAlarm(onTrigger: () => void) {
  if (currentAlarmInterval) return;
  
  try {
    playPatternOnce();
  } catch (e) {
    console.error('Failed to initiate alarm sound:', e);
  }

  onTrigger();
  
  const intervalTime = soundPattern === 'chime' ? 2500 : 1500;
  currentAlarmInterval = window.setInterval(() => {
    try {
      playPatternOnce();
    } catch (e) {
      console.error('Alarm tick failed:', e);
    }
  }, intervalTime);
}

export function stopAlarm() {
  if (currentAlarmInterval) {
    clearInterval(currentAlarmInterval);
    currentAlarmInterval = null;
  }
  activeOscillators.forEach(osc => {
    try {
      osc.stop();
    } catch (e) {
      // ignore
    }
  });
  activeOscillators = [];
}
