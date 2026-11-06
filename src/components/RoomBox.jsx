import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Arrow, Chevron } from './Icons.jsx';
import { Frame, FrameReflection, WallLabel } from './Frame.jsx';
import { GEO, placeFace } from '../room/geometry.js';

// Every big surface is built from pieces (see GEO): the browser draws only those in view.

// A wall's surface in panels, left to right. With a door: panels up to the arch, the arch
// itself (a panel with the opening cut out of it), panels after.
function panelsFor(len, S, door, size) {
  const w = Math.max(size * S, GEO.panelMin);
  const out = [];
  const run = (a, b, key) => {
    const n = Math.max(1, Math.ceil((b - a) / w));
    const pw = (b - a) / n;
    for (let i = 0; i < n; i++) out.push({ key: key + i, left: a + i * pw, width: pw + (i < n - 1 ? 2 : 0), first: a === 0 && i === 0, last: b === len && i === n - 1 });
  };
  if (!door) run(0, len, 'p');
  else {
    const dw = GEO.arch.w * S;
    const dl = len / 2 - dw / 2;
    run(0, dl, 'l');
    out.push({ key: 'arch', left: dl, width: dw, arch: true });
    run(dl + dw, len, 'r');
  }
  return out;
}

export function Panels({ len, S, door, size = GEO.panel }) {
  return panelsFor(len, S, door, size).map((p) =>
    p.arch ? (
      <ArchPanel key={p.key} left={p.left} S={S} />
    ) : (
      <div key={p.key} className={`panel${p.first ? ' first' : ''}${p.last ? ' last' : ''}`} style={{ left: p.left, width: p.width, backgroundPosition: `${-p.left}px 0, ${-p.left}px 0, 0 0` }} aria-hidden="true">
        <div className="shade" />
      </div>
    ),
  );
}

// The wall over the archway, from the ceiling line down to where the arch springs, with the
// round top of the opening cut out of it (drawn in SVG, so no mask is needed).
function ArchPanel({ left, S }) {
  const W = GEO.arch.w * S;
  const r = W / 2;
  const H = (0.71 - (GEO.arch.h - GEO.arch.w / 2)) * S;
  const d = `M0 0H${W}V${H}H${W / 2 + r}A${r} ${r} 0 0 0 ${W / 2 - r} ${H}H0Z`;
  return (
    <div className="panel arch" style={{ left, width: W, height: H }} aria-hidden="true">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="arch-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="s0" />
            <stop offset="1" className="s1" />
          </linearGradient>
          <pattern id="arch-grain" patternUnits="userSpaceOnUse" width="256" height="256">
            <image href="/textures/wall-grain.png" width="256" height="256" />
          </pattern>
        </defs>
        <path d={d} fill="url(#arch-g)" />
        <path d={d} fill="url(#arch-grain)" />
      </svg>
      <div className="shade" />
    </div>
  );
}

// The floor's reflection of what hangs on a wall: each frame mirrored below the floor line, a
// small plane of its own (`children`, laid out like the wall's own row). The wall's own
// reflection is painted into the floor tiles instead (see Tile): as planes the length of the
// walls, it ran the browser out of memory and it dropped surfaces.
function Reflection({ children }) {
  return (
    <div className="refl" aria-hidden="true">
      <div className="refl-row">{children}</div>
    </div>
  );
}

// A bay: a stretch of wall standing out from the rest, full height, for one photo to hang on
// alone (in a solo room). Its sides show as you come round to it.
function Bay() {
  return (
    <div className="bay" aria-hidden="true">
      <div className="bay-side bay-l" />
      <div className="bay-side bay-r" />
    </div>
  );
}

// One wall of the room: its surface, the floor's reflection of what hangs on it, the photos in
// their slots (each on a bay of its own, in a solo room), and on the entrance wall, the
// archway out.
export function Wall({ side, len, S, groups, near, solo, offFor, onOpen, onZoom, door, style, wallRef }) {
  const one = groups.length === 1 && !door;
  return (
    <div ref={wallRef} className={`wall wall-${side}${one ? ' one' : ''}${door ? ' has-door' : ''}`} data-side={side} style={style}>
      {len > 0 && <Panels len={len} S={S} door={!!door} size={door ? GEO.panelNear : GEO.panel} />}
      <Reflection>
        {groups.map((g, gi) => (
          <span key={gi} className="gpad refl-col">
            <span className="ggap refl-frames">
              {g.map((p) => <FrameReflection key={p.id} photo={p} />)}
            </span>
            <WallLabel group={g} ghost />
          </span>
        ))}
        {door && (
          <span className="refl-door">
            <span className="door" />
          </span>
        )}
      </Reflection>
      {groups.map((g, gi) => (
        <div key={gi} className={g.includes(near) ? 'col gpad lit' : 'col gpad'} data-stop="photo" style={{ '--off': offFor(g) }}>
          {solo && <Bay />}
          <div className="ggap p3 frames">
            {g.map((p) => <Frame key={p.id} photo={p} lit={p === near} onOpen={() => onOpen(p)} />)}
          </div>
          <WallLabel group={g} onZoom={() => onZoom(g)} />
        </div>
      ))}
      {door && <DoorCol {...door} S={S} />}
    </div>
  );
}

// The archway in the middle of the entrance wall: the reveal through the wall (two jambs and
// the curve of the arch in facets) and the sign: every room goes back out to the front desk.
// Clicking it leaves the room.
function DoorCol({ to, onLeave, S }) {
  const W = GEO.arch.w * S;
  const r = W / 2;
  const T = GEO.hall.t * S;
  const spring = GEO.arch.h * S - r;
  const N = 14;
  const c = 2 * r * Math.tan(Math.PI / (2 * N)) + 1; // a facet, a hair over so they meet
  const facets = [];
  for (let i = 0; i < N; i++) {
    const th = 180 - (i + 0.5) * (180 / N);
    facets.push(<div key={i} className="parch" style={{ width: c, height: T, transform: `translate3d(${W / 2}px,${r}px,0) rotateZ(${90 - th}deg) translate3d(${-c / 2}px,${-r}px,0) rotateX(-90deg)` }} />);
  }
  return (
    <section className="col door-w" data-stop="door">
      <div className="passage" aria-hidden="true">
        <div className="pjl" style={{ width: T, height: spring }} />
        <div className="pjr" style={{ width: T, height: spring }} />
        {facets}
      </div>
      <Link to={to} className="doorbtn walltext-btn ink" tabIndex={-1} draggable="false" onClick={(e) => { e.preventDefault(); onLeave(); }}>
        <span className="door-sign">
          <Arrow />
          <span>
            <span className="door-room">Exit</span>
            <span className="u door-name">Front desk</span>
          </span>
        </span>
        <span className="door" aria-hidden="true" />
      </Link>
    </section>
  );
}

// The hallway outside the arch, where you start, finished like the room: the outside of the
// entrance wall, the wall across from it, and its floor and ceiling. The floor and ceiling and
// the far wall are under, over and behind you while you stand there, so they stay hidden until
// you go in. Left of the arch hangs the room's sign, as in a gallery: its number, name and
// blurb. Clicking it walks up to read it. On the floor before the arch, an arrow that takes you in.
export function Hallway({ S, D, theme, room, onToggle, onEnter, hallRef }) {
  if (!S) return null;
  const T = GEO.hall.t * S;
  const depth = GEO.hall.depth * S;
  const signLeft = D / 2 - (GEO.arch.w / 2 + GEO.sign.gap + GEO.sign.w) * S;
  return (
    <>
      <div ref={hallRef} className="wall hall-wall" style={{ width: D, transform: placeFace(-T, 0, -90), '--sl': `${signLeft}px`, '--sc': `${D / 2}px` }}>
        <Panels len={D} S={S} door size={GEO.panelNear} />
        <section className="intro hall-intro ink">
          <button type="button" className="intro-inner" tabIndex={-1} onClick={onToggle} aria-label={`Read the introduction to ${room.name}`}>
            <span className="intro-kicker">Room {room.num}</span>
            <span className="intro-room">{room.name}</span>
            <span className="intro-text">
              {room.blurb}
              {room.intro ? ` ${room.intro}` : ''}
            </span>
          </button>
        </section>
      </div>
      <div className="wall hall hall-far" style={{ width: D, transform: placeFace(-depth, D, 90) }} aria-hidden="true">
        <Panels len={D} S={S} />
      </div>
      <EnterMark S={S} D={D} onEnter={onEnter} />
      <Slab kind="floor" S={S} L={depth - T} D={D} theme={theme} x0={-depth} cls="hall" edge={0.12} />
      <Slab kind="ceiling" S={S} L={depth - T} D={D} theme={theme} x0={-depth} cls="hall" edge={0.12} />
    </>
  );
}

// A floor or a ceiling, in tiles from x0 along. Each tile is a canvas, drawn once with its
// share of the texture, on the floor the walls' sheen in it (look.sheen), and the shading
// toward any wall it meets. A canvas is a texture on the
// GPU, so the browser never redraws it at the screen's resolution however close the camera
// comes (a plain plane it would, at a cost of hundreds of megabytes near the eye). Each tile
// says where it is, for hiding the ones right under or over the camera.
// Loaded and decoded: Safari decodes big images in the background after they load, and until
// it has, it can't make a pattern of one (it throws).
const images = new Map();
function loadImage(src) {
  if (!images.has(src)) {
    const im = new Image();
    im.src = src;
    images.set(src, im.decode().then(() => im, () => null));
  }
  return images.get(src);
}

// a repeating pattern of an image, or null if the browser won't make one yet (the tile is then
// left its plain colour, still shaded)
function makePattern(ctx, im) {
  try {
    return ctx.createPattern(im, 'repeat');
  } catch {
    return null;
  }
}

const phone = window.matchMedia('(max-width: 700px)');

// '#rrggbb' at k times its strength, as rgb()
const scaled = (hex, k) => `rgb(${[1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k)).join(',')})`;

function Tile({ w, h, S, look, ox, oy, dirs, dark, edge, solid, className, style, ...rest }) {
  const ref = useRef(null);
  // A texture gets 1.5 canvas px per css px, up to tilePx; a phone's small room needs far less
  // than a desktop's, and canvases are memory a phone hasn't got to spare (with them all at
  // full size the biggest room ran Safari out of it). A plain colour needs only a little
  // canvas: its edge shading scales up smoothly.
  const px = look.img ? Math.min(GEO.tilePx, Math.ceil(w * 1.5)) : 64;
  const py = Math.round((px * h) / w);
  // Safari keeps a canvas's memory until it's collected, long after the room has gone, and it
  // has a hard limit on canvas memory in all: past it a canvas stays blank (a dark patch in
  // the floor). So a tile gives its memory back as it goes.
  useEffect(
    () => () => {
      const c = ref.current;
      if (c) c.width = c.height = 0;
    },
    [],
  );
  useEffect(() => {
    let live = true;
    const draw = (im) => {
      const c = ref.current;
      if (!c || !live) return;
      if (c.width !== px) c.width = px;
      if (c.height !== py) c.height = py;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const k = c.width / w; // canvas px per css px
      ctx.fillStyle = look.color;
      ctx.fillRect(0, 0, c.width, c.height);
      const pat = im && makePattern(ctx, im);
      if (pat) {
        const period = look.size * S; // the texture repeats every `period` css px, from the room's corner
        const ph = (v) => (((v % period) + period) % period) * k;
        pat.setTransform(new DOMMatrix().translate(-ph(ox), -ph(oy)).scale((period * k) / im.width));
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, c.width, c.height);
      }
      const W = c.width;
      const H = c.height;
      const from = (d, e) => (d === 'to bottom' ? ctx.createLinearGradient(0, 0, 0, e) : d === 'to top' ? ctx.createLinearGradient(0, H, 0, H - e) : d === 'to right' ? ctx.createLinearGradient(0, 0, e, 0) : ctx.createLinearGradient(W, 0, W - e, 0));
      // the wall's reflection, seen through the polished floor: added light, fading out
      if (look.sheen) {
        ctx.globalCompositeOperation = 'lighter';
        for (const d of dirs) {
          const g = from(d, 0.6 * S * k);
          g.addColorStop(0, look.sheen);
          g.addColorStop(0.4, scaled(look.sheen, 0.55));
          g.addColorStop(1, 'black');
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      const e = edge * k;
      for (const d of dirs) {
        const g = from(d, e);
        g.addColorStop(0, `rgba(0,0,0,${dark})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
      // a solid floor: the room's dark mixed in as the see-through floor would show it, so it
      // looks the same at full opacity
      if (solid) {
        const css = getComputedStyle(c);
        ctx.globalAlpha = 1 - parseFloat(css.getPropertyValue('--floorop'));
        ctx.fillStyle = css.getPropertyValue('--stagebg');
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    };
    if (look.img) loadImage(look.img).then(draw);
    else draw(null);
    return () => {
      live = false;
    };
  }, [w, h, S, look, ox, oy, dirs, dark, edge, solid, px, py]);
  return <canvas ref={ref} width={px} height={py} className={className} style={style} {...rest} />;
}

export function Slab({ kind, S, L, D, theme, x0 = 0, cls = '', edge = 0.3 }) {
  if (!L) return null;
  const floor = kind === 'floor';
  const look = floor ? theme.floor : theme.ceil;
  // (a phone's room is drawn bigger than its screen is wide, so its tiles are bigger too: as
  // many as a room the screen's width would have, not two and a half times as many canvases)
  const T = Math.max(GEO.tile * S, phone.matches ? GEO.tilePhone * S : GEO.tileMin);
  // columns along the room
  const cuts = [x0, x0 + L];
  const cols = [];
  for (let k = 1; k < cuts.length; k++) {
    const n = Math.ceil((cuts[k] - cuts[k - 1]) / T - 0.01);
    const cw = (cuts[k] - cuts[k - 1]) / n;
    for (let i = 0; i < n; i++) cols.push([cuts[k - 1] + i * cw, cw]);
  }
  const nx = cols.length;
  const ny = Math.ceil(D / T) | 1; // an odd count across, so no seam runs down the middle
  // The floor is see-through (the reflections show in it), so its tiles meet edge to edge:
  // overlapped, the join would show twice as dense. The ceiling is solid and can overlap. So
  // is the floor on a phone, where there are no reflections and you see a lot of floor (and
  // see-through tiles edge to edge can leave a hairline between them).
  // (the hallway's floor is solid too: from the doorway you'd see the room's reflections
  // under it, through it, out of place)
  const solid = !floor || phone.matches || cls === 'hall';
  const lap = solid ? 2 : 0;
  const h = D / ny;
  const y = (floor ? 0.78 - GEO.eye : 0.07 - GEO.eye) * S;
  const tiles = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const [tx, w] = cols[i];
      const z0 = j * h;
      // which edges of this tile meet a wall (the ceiling is turned the other way, so its
      // local top is the far side)
      const dirs = [];
      if (j === 0) dirs.push(floor ? 'to bottom' : 'to top');
      if (j === ny - 1) dirs.push(floor ? 'to top' : 'to bottom');
      if (i === 0) dirs.push('to right');
      if (i === nx - 1) dirs.push('to left');
      tiles.push(
        <Tile
          key={`${i}-${j}`}
          w={w}
          h={h}
          S={S}
          look={look}
          ox={tx}
          oy={floor ? z0 : D - z0 - h}
          dirs={dirs}
          dark={floor ? 0.42 : 0.3}
          solid={floor && solid}
          edge={edge * S}
          className={`plane tile ${floor ? 'ftile' : 'ctile'}${cls ? ` ${cls}` : ''}`}
          data-cx={(tx + w / 2).toFixed(1)}
          data-cz={(z0 + h / 2).toFixed(1)}
          data-r={(Math.hypot(w, h) / 2).toFixed(1)}
          style={{
            width: w + (i < nx - 1 ? lap : 0),
            height: h + (j < ny - 1 ? lap : 0),
            transform: floor ? `translate3d(${tx}px,${y}px,${z0}px) rotateX(90deg)` : `translate3d(${tx}px,${y}px,${z0 + h}px) rotateX(-90deg)`,
          }}
          aria-hidden="true"
        />,
      );
    }
  }
  return tiles;
}

// The lighting track: four strips just under the ceiling, 0.15 S in from the walls.
export function Track({ S, L, D }) {
  if (!L) return null;
  const y = (0.07 - GEO.eye) * S + 0.5;
  const m = 0.15 * S;
  const tw = 0.009 * S;
  const strip = (key, x0, z0, w, h) => (
    <div key={key} className="plane tstrip" style={{ width: w, height: h, transform: `translate3d(${x0}px,${y}px,${z0 + h}px) rotateX(-90deg)` }} aria-hidden="true" />
  );
  return [
    strip('n', m, m, L - 2 * m, tw),
    strip('s', m, D - m - tw, L - 2 * m, tw),
    strip('w', m, m, tw, D - 2 * m),
    strip('e', L - m - tw, m, tw, D - 2 * m),
  ];
}

// The arrow on the hallway floor, pointing in through the arch, with ENTER under it: lying
// flat between you and the arch (GEO.enter), its letters drawn tall so they read at that slant.
// Clicking it takes you in.
function EnterMark({ S, D, onEnter }) {
  const { x0, x1, w } = GEO.enter;
  const W = w * S; // across the hallway
  const H = (x1 - x0) * S; // along it, toward the arch
  const cx = ((x0 + x1) / 2) * S;
  const y = (0.78 - GEO.eye) * S - 1;
  return (
    <button
      type="button"
      className="plane enter-mark"
      tabIndex={-1}
      onClick={onEnter}
      aria-label="Enter the room"
      style={{ width: W, height: H, transformOrigin: '50% 50%', transform: `translate3d(${cx - W / 2}px,${y - H / 2}px,${D / 2}px) rotateY(-90deg) rotateX(90deg)` }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 4 L84 40 L63 40 L63 64 L37 64 L37 40 L16 40 Z" />
        <text x="50" y="94" textAnchor="middle" textLength="76" lengthAdjust="spacingAndGlyphs">ENTER</text>
      </svg>
    </button>
  );
}

// The arrows floating either side of the view, inside the room: they walk you left and right,
// and up close, to the photo either side.
export function EdgeArrows({ onLeft, onRight, hidden, wake, leftLabel, rightLabel }) {
  return (
    <div className={`turn${hidden ? ' hide' : ''}${wake ? ' wake' : ''}`} aria-hidden={hidden}>
      <button type="button" className="turnbtn glass turn-l" onClick={onLeft} tabIndex={hidden ? -1 : 0} aria-label={leftLabel}>
        <Chevron dir={-1} size={26} />
      </button>
      <button type="button" className="turnbtn glass turn-r" onClick={onRight} tabIndex={hidden ? -1 : 0} aria-label={rightLabel}>
        <Chevron dir={1} size={26} />
      </button>
    </div>
  );
}
