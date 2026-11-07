// A salon hang: every photo of a collage packed onto one wall, edge to edge with a narrow gap,
// in mixed sizes, the way a 19th-century salon hung its pictures.
//
// The wall is cut in two again and again, side by side or one above the other, until each piece
// holds one photo. Every piece keeps its photos' proportions exactly, so nothing is cropped: a
// piece's height is a straight-line function of its width, h = p·w + q, and two pieces put
// together give another (see `join`). Each photo is given a weight first (most 1, some 2, a few
// 4), and the cuts share the wall out by weight, so a few photos come out big. Many such hangs
// are tried, from a fixed seed (the same wall every visit), and the best kept: the one nearest
// the shape asked for, with no photo far bigger or smaller than its share.

// Frame border per theme, as a fraction of the frame's own scale S, as in index.css (--fb), so
// a collage frame looks like the room's. The mat is 0.02 S; S is 5x the image's short side.
const FB = { white: 0.0035, spot: 0.0094, teal: 0.0165, violet: 0.012, sky: 0.008, salon: 0.009 };
export const GAP = 18; // between frames, in wall units (about 300 per frame)
const UNIT = 300; // a typical frame's size, in wall units

// a small seeded random number generator (mulberry32), and a seed from a string
export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function shuffled(list, rnd) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// the frame's edge (border + mat) as a fraction of the image's short side
const edgeOf = (theme) => 0.1 + 5 * (FB[theme] ?? FB.white);

// a photo's frame, as a piece: its width/height ratio, with the mat and border around it
function leaf(photo, c, weight) {
  const r = photo.width / photo.height;
  const a = r >= 1 ? (r + 2 * c) / (1 + 2 * c) : (1 + 2 * c) / (1 / r + 2 * c);
  return { photo, weight, p: 1 / a, q: 0 };
}

// a piece's p and q (and weight) from its two halves: side by side they share a height, one
// above the other a width
function sum(n) {
  if (n.photo) return;
  sum(n.A);
  sum(n.B);
  const { A, B } = n;
  n.weight = A.weight + B.weight;
  if (n.across) {
    n.p = 1 / (1 / A.p + 1 / B.p);
    n.q = (A.q / A.p + B.q / B.p - GAP) * n.p;
  } else {
    n.p = A.p + B.p;
    n.q = A.q + B.q + GAP;
  }
}

// cut a run of weighted leaves into a piece aiming at width/height ratio T
function build(items, T, rnd) {
  if (items.length === 1) return items[0];
  const total = items.reduce((s, it) => s + it.weight, 0);
  // where to cut: somewhere between a third and two-thirds of the weight
  const aim = total * (0.33 + 0.34 * rnd());
  let k = 1;
  let acc = items[0].weight;
  while (k < items.length - 1 && acc + items[k].weight / 2 < aim) acc += items[k++].weight;
  const f = acc / total;
  // wide pieces are mostly cut side by side, tall ones one above the other
  const across = T > 1.2 ? rnd() < 0.88 : T < 0.83 ? rnd() < 0.12 : rnd() < 0.5;
  const TA = across ? T * f : T / f;
  const TB = across ? T * (1 - f) : T / (1 - f);
  return { A: build(items.slice(0, k), TA, rnd), B: build(items.slice(k), TB, rnd), across };
}

// lay a piece out at (x, y), w wide
function place(n, x, y, w, out) {
  const h = n.p * w + n.q;
  if (n.photo) {
    out.push({ photo: n.photo, weight: n.weight, x, y, w, h });
    return;
  }
  if (n.across) {
    const wA = (h - n.A.q) / n.A.p;
    place(n.A, x, y, wA, out);
    place(n.B, x + wA + GAP, y, w - wA - GAP, out);
  } else {
    const hA = n.A.p * w + n.A.q;
    place(n.A, x, y, w, out);
    place(n.B, x, y + hA + GAP, w, out);
  }
}

// lay a hang out and say how good it is (lower is better): how far each frame is from its
// share of the wall (by weight), none so small it's lost among the rest, and how near the
// shape asked for
function judge(root, aspect) {
  sum(root);
  // sized so an average frame is about UNIT across: solve W·(pW + q) = area
  const area = UNIT * UNIT * root.weight * 0.75;
  const W = (-root.q + Math.sqrt(root.q * root.q + 4 * root.p * area)) / (2 * root.p);
  const frames = [];
  place(root, 0, 0, W, frames);
  const H = root.p * W + root.q;
  const share = (W * H) / root.weight;
  let off = 0;
  let tiny = 0;
  for (const f of frames) {
    const d = Math.log((f.w * f.h) / (share * f.weight));
    off += d * d;
    const small = Math.log((UNIT * 0.62) / Math.min(f.w, f.h));
    if (small > 0) tiny += small * small;
  }
  return { score: off / frames.length + 4 * Math.abs(Math.log(W / H / aspect)) + 12 * tiny, W, H, frames };
}

// the share of the wall a photo may get: a favoured one more (see salonHang's `favored`)
const WEIGHTS = [1, 2];
const FAVORED = [3];
const nodesOf = (n, inner, leaves) => {
  if (n.photo) leaves.push(n);
  else {
    inner.push(n);
    nodesOf(n.A, inner, leaves);
    nodesOf(n.B, inner, leaves);
  }
};

/**
 * Hangs `photos` as one block about `aspect` wide for its height. `theme` sets the frame
 * border. Gives { W, H, frames: [{ photo, x, y, w, h, S }] } in wall units, with S each frame's
 * scale (as --S) for the room's frame styles. `favored(photo)`, if given, picks photos to hang
 * bigger: about twice the wall of the rest, so about half as wide again.
 * The best of many random hangs, then bettered a step at a time: a cut turned the other way,
 * two photos swapping places, or a photo given more or less of the wall, kept when it helps.
 */
export function salonHang(photos, { aspect, theme, seed, favored }) {
  const fav = new Set(favored ? photos.filter(favored) : []);
  // with none favoured, a few photos still hang big, so the wall isn't all one size
  const choices = (ph) => (fav.has(ph) ? FAVORED : fav.size ? WEIGHTS : [1, 1, 1, 2, 2, 4]);
  if (!photos.length) return { W: 0, H: 0, frames: [] };
  const c = edgeOf(theme);
  const rnd = seeded(seed);
  let best = null;
  for (let t = 0; t < 160; t++) {
    const items = photos.map((ph) => {
      const x = rnd();
      const ws = choices(ph);
      return leaf(ph, c, ws[Math.floor(x * ws.length)]);
    });
    const root = build(items, aspect, rnd);
    const j = judge(root, aspect);
    if (!best || j.score < best.j.score) best = { root, j };
  }
  const { root } = best;
  const inner = [];
  const leaves = [];
  nodesOf(root, inner, leaves);
  if (leaves.length > 1) {
    for (let s = 0; s < 40 * leaves.length; s++) {
      const kind = rnd();
      let undo;
      if (kind < 0.4) {
        const n = inner[Math.floor(rnd() * inner.length)];
        n.across = !n.across;
        undo = () => (n.across = !n.across);
      } else if (kind < 0.8) {
        const a = leaves[Math.floor(rnd() * leaves.length)];
        const b = leaves[Math.floor(rnd() * leaves.length)];
        // (each takes its share of the wall with it)
        const swap = () => ([a.photo, a.p, a.weight, b.photo, b.p, b.weight] = [b.photo, b.p, b.weight, a.photo, a.p, a.weight]);
        swap();
        undo = swap;
      } else {
        const a = leaves[Math.floor(rnd() * leaves.length)];
        const was = a.weight;
        const ws = choices(a.photo);
        a.weight = ws[Math.floor(rnd() * ws.length)];
        undo = () => (a.weight = was);
      }
      const j = judge(root, aspect);
      if (j.score < best.j.score) best.j = j;
      else undo();
    }
  }
  const { W, H, frames } = best.j;
  // each frame's scale, so the room's mat and border sizes (fractions of S) fit it exactly
  frames.forEach((f) => {
    const r = f.photo.width / f.photo.height;
    const s = r >= 1 ? f.w / (r + 2 * c) : f.w / (1 + 2 * c); // the image's short side
    f.S = 5 * s;
  });
  return { W, H, frames };
}
