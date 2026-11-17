// Small sounds for the front desk's props, made on the spot with Web Audio (no sound files):
// struck metal is a few sine partials dying away, a drip a quick upward chirp, leaves a hiss of
// filtered noise. Only ever played from a click, which is what lets a
// browser start audio. Quiet: the whole lot goes through one gain.

let ctx = null;
let out = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = 0.5;
    out.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// a struck partial: frequency f, loudness a, dying away over `decay` seconds
function partial(c, t, f, a, decay, dest = out) {
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(a, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + decay + 0.05);
}

let noiseBuf = null;
function noise(c, t, dur, { type = 'bandpass', freq = 3000, q = 1, a = 0.3, attack = 0.002 } = {}) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const fl = c.createBiquadFilter();
  fl.type = type;
  fl.frequency.value = freq;
  fl.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(a, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fl).connect(g).connect(out);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
  return { fl, g };
}

const at = (c, delay = 0) => c.currentTime + delay;

export const sound = {
  // the desk bell: a bright strike with its bell's inharmonic ring
  bell() {
    const c = audio();
    if (!c) return;
    const t = at(c);
    noise(c, t, 0.03, { type: 'highpass', freq: 5000, a: 0.12 });
    partial(c, t, 2093, 0.32, 1.9);
    partial(c, t, 2093 * 2.32, 0.12, 1.1);
    partial(c, t, 2093 * 4.07, 0.05, 0.6);
    partial(c, t, 2093 * 1.003, 0.16, 1.7); // a slow beat
  },
  // a drop of water into the bucket
  drip(delay = 0) {
    const c = audio();
    if (!c) return;
    const t = at(c, delay);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(700 + Math.random() * 200, t);
    o.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 400, t + 0.05);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.15);
  },
  // leaves brushing together
  rustle() {
    const c = audio();
    if (!c) return;
    for (let i = 0; i < 5; i++) noise(c, at(c, i * 0.11 + Math.random() * 0.05), 0.22, { freq: 4500 + Math.random() * 2500, q: 0.7, a: 0.09, attack: 0.04 });
  },
  // the rope's brass hook knocking on its post
  clink() {
    const c = audio();
    if (!c) return;
    const t = at(c);
    partial(c, t, 1320, 0.14, 0.35);
    partial(c, t, 3170, 0.05, 0.2);
    partial(c, t + 0.32, 1320, 0.07, 0.25);
    partial(c, t + 0.32, 3170, 0.025, 0.15);
  },
  // a frame lifted off its nail: a scrape of the hanging wire, then a soft whoosh as it drops
  lift() {
    const c = audio();
    if (!c) return;
    const t = at(c);
    noise(c, t, 0.08, { freq: 2600, q: 2, a: 0.08, attack: 0.01 });
    const { fl } = noise(c, t + 0.18, 0.4, { type: 'lowpass', freq: 1800, q: 0.5, a: 0.06, attack: 0.12 });
    fl.frequency.setValueAtTime(1800, t + 0.18);
    fl.frequency.exponentialRampToValueAtTime(300, t + 0.58);
  },
  // a frame hung back on its nail: a soft knock of wood on the wall (after `delay` s)
  hang(delay = 0) {
    const c = audio();
    if (!c) return;
    const t = at(c, delay);
    noise(c, t, 0.06, { type: 'lowpass', freq: 900, a: 0.22 });
    partial(c, t, 190, 0.16, 0.14);
    partial(c, t, 410, 0.05, 0.08);
  },
  // a light switched on
  click() {
    const c = audio();
    if (!c) return;
    noise(c, at(c), 0.025, { type: 'highpass', freq: 2500, a: 0.35 });
  },
  // someone coming up from behind the desk
  pop() {
    const c = audio();
    if (!c) return;
    const t = at(c);
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.setValueAtTime(260, t);
    o.frequency.exponentialRampToValueAtTime(620, t + 0.14);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.25);
  },
};
