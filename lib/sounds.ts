// Tiny Web Audio sound effects. No assets, just oscillators with feelings.

let ctx: AudioContext | null = null;
let muted = false;
let volume = 0.73; // the default every user deserves

export function setMuted(m: boolean) {
  muted = m;
}

export function setVolume(v: number) {
  volume = Math.min(1, Math.max(0, v));
}

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  gainMax = 0.12
) {
  const ac = audio();
  if (!ac || muted || volume === 0) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const peak = gainMax * volume;
  gain.gain.setValueAtTime(0, ac.currentTime + start);
  gain.gain.linearRampToValueAtTime(peak, ac.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.05);
}

/** Sulky refusal: a low, flat bonk. */
export function bonk() {
  tone(110, 0, 0.18, "square", 0.1);
  tone(82, 0.05, 0.22, "square", 0.08);
}

/** Reluctant acceptance: a tired little fanfare. */
export function fanfare() {
  tone(392, 0, 0.12, "triangle");
  tone(494, 0.11, 0.12, "triangle");
  tone(587, 0.22, 0.25, "triangle");
}

/** Answer delivered: a smug chime. */
export function chime() {
  tone(880, 0, 0.3, "sine", 0.08);
  tone(1318, 0.08, 0.35, "sine", 0.06);
}

/** Soft tick for each committee thought appearing. */
export function tick() {
  tone(520, 0, 0.05, "sine", 0.04);
}
