// audio.js — tiny WebAudio blips, one clear job: every sound the game makes.
// No audio files: each effect is a short oscillator phrase, generated in code.

let audioContext = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function context() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(frequency, startAt, duration, type, volume) {
  const ctx = context();
  if (!ctx || muted) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + startAt);
  oscillator.stop(ctx.currentTime + startAt + duration + 0.05);
}

// The satisfying two-note chime on a found difference.
export function playFound() {
  tone(660, 0, 0.16, 'sine', 0.22);
  tone(990, 0.09, 0.28, 'sine', 0.2);
}

// A soft low thud on a miss.
export function playMiss() {
  tone(160, 0, 0.14, 'triangle', 0.16);
}

// A gentle ping when a hint lights up.
export function playHint() {
  tone(880, 0, 0.12, 'sine', 0.14);
  tone(1174, 0.08, 0.18, 'sine', 0.12);
}

// A little arpeggio for clearing a scene.
export function playWin() {
  [523, 659, 784, 1046].forEach((frequency, i) => tone(frequency, i * 0.11, 0.3, 'sine', 0.2));
}

// A sad descending pair when the timer runs out.
export function playTimeUp() {
  tone(392, 0, 0.25, 'triangle', 0.18);
  tone(262, 0.2, 0.4, 'triangle', 0.16);
}
