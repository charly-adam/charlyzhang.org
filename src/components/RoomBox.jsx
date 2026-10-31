import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Arrow, Chevron } from './Icons.jsx';
import { Frame, FrameReflection, WallLabel } from './Frame.jsx';
import { GEO, placeFace } from '../room/geometry.js';

// Every big surface is built from pieces (see GEO): the browser draws only those in view.

// A wall's surface in panels, left to right. With a door: panels up to the arch, the arch
// itself (a panel with the opening cut out of it), panels after.
function panelsFor(len, S, door, size) {
  const w = size * S;
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
      <div key={p.key} className={`panel${p.first ? ' first' : ''}${p.last ? ' last' : ''}`} style={{ left: p.left, width: p.width, backgroundPosition: `${-p.left}px 0, 0 0` }} aria-hidden="true">
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

// One wall of the room: its surface, the floor's reflection of what hangs on it, the photos in
// their slots, and on the entrance wall, the archway out.
export function Wall({ side, len, S, groups, near, artist, offFor, onOpen, onZoom, door, style, wallRef }) {
  const one = groups.length === 1 && !door;
  return (
    <div ref={wallRef} className={`wall wall-${side}${one ? ' one' : ''}${door ? ' has-door' : ''}`} data-side={side} style={style}>
      {len > 0 && <Panels len={len} S={S} door={!!door} size={door ? GEO.panelNear : GEO.panel} />}
      <div className="plane refl" aria-hidden="true">
        <div className="refl-row">
          {groups.map((g, gi) => (
            <span key={gi} className="gpad refl-col">
              <span className="ggap refl-frames">
                {g.map((p) => <FrameReflection key={p.id} photo={p} />)}
              </span>
              <span className="lblpos" />
            </span>
          ))}
          {door && (
            <span className="refl-door">
              <span className="door" />
            </span>
          )}
        </div>
      </div>
      {groups.map((g, gi) => (
        <div key={gi} className={g.includes(near) ? 'col gpad lit' : 'col gpad'} data-stop="photo" style={{ '--off': offFor(g) }}>
          <div className="ggap p3 frames">
            {g.map((p) => <Frame key={p.id} photo={p} lit={p === near} onOpen={() => onOpen(p)} />)}
          </div>
          <WallLabel group={g} artist={artist} onZoom={() => onZoom(g)} />
        </div>
      ))}
      {door && <DoorCol {...door} S={S} />}
    </div>
  );
}

// The archway in the middle of the entrance wall: the reveal through the wall (two jambs and
// the curve of the arch in facets) and the sign for where it leads. Clicking it leaves the room.
function DoorCol({ to, next, onLeave, S }) {
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
            <span className="door-room">{next ? `Room ${next.num}` : 'Exit'}</span>
            <span className="u door-name">{next ? next.name : 'Lobby'}</span>
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
// you go in.
export function Hallway({ S, D, theme }) {
  if (!S) return null;
  const T = GEO.hall.t * S;
  const depth = GEO.hall.depth * S;
  return (
    <>
      <div className="wall hall-wall" style={{ width: D, transform: placeFace(-T, 0, -90) }} aria-hidden="true">
        <Panels len={D} S={S} door size={GEO.panelNear} />
        <div className="plane refl hall" />
      </div>
      <div className="wall hall hall-far" style={{ width: D, transform: placeFace(-depth, D, 90) }} aria-hidden="true">
        <Panels len={D} S={S} />
        <div className="plane refl" />
      </div>
      <Slab kind="floor" S={S} L={depth - T} D={D} theme={theme} x0={-depth} cls="hall" edge={0.12} />
      <Slab kind="ceiling" S={S} L={depth - T} D={D} theme={theme} x0={-depth} cls="hall" edge={0.12} />
    </>
  );
}

// The pillar just inside the door. Its front face, toward the door, carries the room's text.
export function Pillar({ room, site, onToggle, faces, S, pillarRef }) {
  const face = (name, extra) => {
    const f = faces[name];
    return (
      <div className={`face pface ${name}`} style={f && { width: f.len, transform: f.transform }}>
        {f && <Panels len={f.len} S={S} />}
        <div className="plane refl" aria-hidden="true" />
        {extra}
      </div>
    );
  };
  return (
    <div ref={pillarRef} className="pillar">
      {face('front', (
        <section className="col intro">
          <button type="button" className="intro-inner" tabIndex={-1} onClick={onToggle} aria-label={`Read the introduction to ${room.name}`}>
            <span className="intro-room">
              Room {room.num}:
              <br />
              {room.name}
            </span>
            <span className="intro-name">{site.name}</span>
            <span className="intro-text">
              {room.blurb}
              {room.intro ? ` ${room.intro}` : ''}
            </span>
          </button>
        </section>
      ))}
      {face('back')}
      {face('sideN')}
      {face('sideS')}
    </div>
  );
}

// A floor or a ceiling, in tiles from x0 along. Each tile is a canvas, drawn once with its
// share of the texture and the shading toward any wall it meets. A canvas is a texture on the
// GPU, so the browser never redraws it at the screen's resolution however close the camera
// comes (a plain plane it would, at a cost of hundreds of megabytes near the eye). Each tile
// says where it is, for hiding the ones right under or over the camera.
const images = new Map();
function loadImage(src) {
  if (!images.has(src)) {
    images.set(src, new Promise((resolve) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = src;
    }));
  }
  return images.get(src);
}

function Tile({ w, h, S, look, ox, oy, dirs, dark, edge, className, style, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    let live = true;
    const draw = (im) => {
      const c = ref.current;
      if (!c || !live) return;
      const ctx = c.getContext('2d');
      const k = c.width / w; // canvas px per css px
      ctx.fillStyle = look.color;
      ctx.fillRect(0, 0, c.width, c.height);
      if (im) {
        const period = look.size * S; // the texture repeats every `period` css px, from the room's corner
        const pat = ctx.createPattern(im, 'repeat');
        const ph = (v) => (((v % period) + period) % period) * k;
        pat.setTransform(new DOMMatrix().translate(-ph(ox), -ph(oy)).scale((period * k) / im.width));
        ctx.fillStyle = pat;
        ctx.fillRect(0, 0, c.width, c.height);
      }
      const e = edge * k;
      const W = c.width;
      const H = c.height;
      for (const d of dirs) {
        const g = d === 'to bottom' ? ctx.createLinearGradient(0, 0, 0, e) : d === 'to top' ? ctx.createLinearGradient(0, H, 0, H - e) : d === 'to right' ? ctx.createLinearGradient(0, 0, e, 0) : ctx.createLinearGradient(W, 0, W - e, 0);
        g.addColorStop(0, `rgba(0,0,0,${dark})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }
    };
    if (look.img) loadImage(look.img).then(draw);
    else draw(null);
    return () => {
      live = false;
    };
  }, [w, h, S, look, ox, oy, dirs, dark, edge]);
  const px = GEO.tilePx;
  return <canvas ref={ref} width={px} height={Math.round((px * h) / w)} className={className} style={style} {...rest} />;
}

export function Slab({ kind, S, L, D, theme, x0 = 0, cls = '', edge = 0.3 }) {
  if (!L) return null;
  const floor = kind === 'floor';
  const look = floor ? theme.floor : theme.ceil;
  const T = GEO.tile * S;
  const nx = Math.ceil(L / T);
  const ny = Math.ceil(D / T) | 1; // an odd count across, so no seam runs down the middle
  // the floor is see-through (the reflections show in it), so its tiles meet edge to edge:
  // overlapped, the join would show twice as dense. The ceiling is solid and can overlap.
  const lap = floor ? 0 : 2;
  const w = L / nx;
  const h = D / ny;
  const y = (floor ? 0.78 - GEO.eye : 0.07 - GEO.eye) * S;
  const tiles = [];
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const tx = x0 + i * w;
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

// The arrows floating either side of the view: at the door they pick a way round (and nudge
// to catch the eye); after that they walk you left and right, and up close, to the photo
// either side.
export function EdgeArrows({ onLeft, onRight, hidden, leftLabel, rightLabel }) {
  return (
    <div className={hidden ? 'turn hide' : 'turn'} aria-hidden={hidden}>
      <button type="button" className="turnbtn glass turn-l" onClick={onLeft} tabIndex={hidden ? -1 : 0} aria-label={leftLabel}>
        <Chevron dir={-1} size={26} />
      </button>
      <button type="button" className="turnbtn glass turn-r" onClick={onRight} tabIndex={hidden ? -1 : 0} aria-label={rightLabel}>
        <Chevron dir={1} size={26} />
      </button>
    </div>
  );
}
