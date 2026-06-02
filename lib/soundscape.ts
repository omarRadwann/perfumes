// Minimal procedural ambient soundscape (reference step 5: "a custom soundscape
// per scene"). A soft low pad synthesised with the Web Audio API — no audio files.
// Created lazily on the first user gesture; each station shifts its tone.
let inited = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let voices: OscillatorNode[] = [];

function init() {
  if (inited || typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 650;
    filter.Q.value = 0.7;
    filter.connect(master);
    [1, 1.5, 2].forEach((mult, i) => {
      const osc = ctx!.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = 110 * mult;
      const g = ctx!.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.16;
      osc.connect(g);
      g.connect(filter);
      osc.start();
      voices.push(osc);
    });
    inited = true;
  } catch {
    /* audio unavailable — silent */
  }
}

export function setSoundEnabled(on: boolean) {
  init();
  if (!ctx || !master) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.linearRampToValueAtTime(on ? 0.05 : 0, t + (on ? 1.6 : 0.5));
}

// Per-station root note (a gentle, consonant progression).
const ROOTS = [110, 98, 123.47, 87.31, 130.81, 116.54];
export function setStationTone(i: number) {
  if (!ctx) return;
  const root = ROOTS[i % ROOTS.length];
  const t = ctx.currentTime;
  voices.forEach((osc, idx) => {
    const mult = idx === 0 ? 1 : idx === 1 ? 1.5 : 2;
    try {
      osc.frequency.linearRampToValueAtTime(root * mult, t + 1.4);
    } catch {
      /* ignore */
    }
  });
}
