// Cuts public/lobby/charly.png (Charly, cut out of a photo) into the layers the lobby animates:
// head, torso, each arm, and the underarms behind them, all 745 × 1000 at the same origin.
//
// It cuts like a paper puppet. The torso keeps the whole jacket, side panels and all, plus a
// shoulder cap: a disc round each arm's pivot, feathered at its rim. Each arm is the sleeve
// beyond the line where it meets the body, plus a disc under that cap, and hangs behind the
// torso. So an arm turns under a shoulder that stays put, and nothing of the jacket goes with
// it. Behind the arms, the underarms: the fabric under each armpit, kept still, so lifting an
// arm opens onto jacket rather than the wall. The head takes the chin down to the neck, with a soft lower edge; the torso starts just
// under the jaw, so the neck shows if the head turns.
//
// Run: node scripts/cut-charly.js   (the pivots must match .head, .arm-l and .arm-r in index.css)
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve('public/lobby');
const PIVOT = { 'arm-l': [250, 200], 'arm-r': [470, 205] };
const CAP = 52; // the shoulder cap's radius
const FEATHER = 12; // its rim
// Where each sleeve meets the body, top to bottom ([x, y]); the arm is outside the line. Below
// the armpit the line runs through the gap between arm and body.
const SEAM = {
  'arm-l': [[255, 120], [258, 178], [247, 220], [244, 290], [247, 330], [240, 360], [215, 400], [215, 1000]],
  'arm-r': [[490, 120], [488, 190], [483, 250], [480, 320], [484, 370], [492, 440], [500, 520], [505, 1000]],
};
// The armpits: above them each arm reaches up to 6 px in under the torso (tapering off over the
// last 30 px), so turning never opens a slit at the seam; below them the arm stops at its
// seam, or it would take the jacket's edge.
const ARMPIT = { 'arm-l': 330, 'arm-r': 360 };
// Under each armpit, inside the sleeve as it hangs (so it only shows once the arm lifts), from
// a little in under the torso. Its fabric is taken from `from` px further out, clear of the
// hairline at the seam.
const UNDERARM = [
  { poly: [[250, 245], [250, 325], [222, 315], [208, 290], [224, 250]], from: -6 },
  { poly: [[478, 250], [478, 360], [515, 348], [530, 300], [508, 252]], from: 6 },
];
const JAW = 150; // the torso starts here (fading in over 8 px)
const CHIN = 172; // the head ends here (fading out over 6 px), between NECK[0] and NECK[1]
const NECK = [305, 415];

const inside = (poly, x, y) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const ramp = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));
const seamX = (pts, y) => {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    if (y <= y1) return x0 + ((x1 - x0) * Math.max(0, y - y0)) / (y1 - y0);
  }
  return pts[pts.length - 1][0];
};

const { data, info } = await sharp(path.join(DIR, 'charly.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const layers = { head: new Float32Array(W * H), torso: new Float32Array(W * H), 'arm-l': new Float32Array(W * H), 'arm-r': new Float32Array(W * H), underarm: new Float32Array(W * H) };
const underarmFrom = new Int32Array(W * H); // where each underarm pixel takes its colour from

for (let y = 0; y < H; y++) {
  const xl = seamX(SEAM['arm-l'], y);
  const xr = seamX(SEAM['arm-r'], y);
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    const a = data[i * 4 + 3] / 255;
    if (!a) continue;
    // the head: down to the chin, no wider than the neck below the jaw
    const inNeck = y < JAW || (x >= NECK[0] && x <= NECK[1]);
    layers.head[i] = a * (inNeck ? 1 - ramp(y, CHIN - 6, CHIN) : 0);
    // the torso: between the seams (softened a little where sleeve meets body), plus the caps
    const body = Math.min(ramp(x, xl - 1.5, xl + 1.5), 1 - ramp(x, xr - 1.5, xr + 1.5));
    let t = body * ramp(y, JAW, JAW + 8);
    for (const arm of ['arm-l', 'arm-r']) {
      const [px, py] = PIVOT[arm];
      const d = Math.hypot(x - px, y - py);
      t = Math.max(t, 1 - ramp(d, CAP - FEATHER, CAP));
      // the arm: outside its seam, and a disc reaching under the cap's rim
      const m = 6 * (1 - ramp(y, ARMPIT[arm] - 30, ARMPIT[arm]));
      const out = arm === 'arm-l' ? x < xl + m : x > xr - m;
      if (out || d < CAP + 14) layers[arm][i] = a;
    }
    layers.torso[i] = a * t;
  }
}
// the underarms, with soft edges, in fabric from further out
for (const { poly, from } of UNDERARM) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!inside(poly, x, y)) continue;
      layers.underarm[y * W + x] = 1;
      underarmFrom[y * W + x] = from;
    }
  }
}
const soft = await sharp(Buffer.from(layers.underarm.map((v) => v * 255)), { raw: { width: W, height: H, channels: 1 } }).blur(2.5).extractChannel(0).raw().toBuffer();
for (let i = 0; i < W * H; i++) layers.underarm[i] = (soft[i] / 255) * (data[(i + underarmFrom[i]) * 4 + 3] / 255);

for (const [name, alpha] of Object.entries(layers)) {
  const out = Buffer.from(data);
  if (name === 'underarm') {
    for (let i = 0; i < W * H; i++) for (let c = 0; c < 3; c++) out[i * 4 + c] = data[(i + underarmFrom[i]) * 4 + c];
  }
  for (let i = 0; i < W * H; i++) {
    const a = Math.round(alpha[i] * 255);
    out[i * 4 + 3] = a;
    if (!a) out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 0; // nothing to keep where it's clear
  }
  await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png({ compressionLevel: 9, palette: false }).toFile(path.join(DIR, `charly-${name}.png`));
  console.log(`charly-${name}.png`);
}
