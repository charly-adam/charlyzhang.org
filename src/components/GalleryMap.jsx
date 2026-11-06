import { createContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { roomList, site } from '../data/gallery.js';
import { Pictogram } from './Icons.jsx';

// openMap(from, opener): takes the map out, from the stand on the desk ('stand') or the
// brochure at the bottom ('dock'); `opener` gets focus back when it's folded away. Provided by App.
export const MapContext = createContext(() => {});

// Map tints follow each room's walls: white, teal, violet, the grey of the spotlit rooms, and
// the claret of the salon, the pale blue of the aviary.
const TINT = { white: '#ebe6d8', teal: '#c3d6d4', violet: '#cfc9de', spot: '#d9d4c8', salon: '#e2c4c0', sky: '#cde0ea' };

// The floor plan: the rooms in a ring round the hall, four columns wide, the front desk at the
// bottom in the middle. They go round in order, the way the doors lead from one to the next:
// from beside the desk on the right, up the right-hand side, across the top and down the left.
// The ring gets a row deeper for every two more rooms; any cells to spare go to the rooms with
// the most photos, two cells each (side by side or one above the other, as the ring runs).
export function planFor(list) {
  const cols = 4;
  const rows = Math.max(3, Math.ceil((list.length - 2) / 2));
  const ring = [];
  for (let r = rows; r >= 1; r--) ring.push([cols, r]);
  for (let c = cols - 1; c >= 1; c--) ring.push([c, 1]);
  for (let r = 2; r <= rows; r++) ring.push([1, r]);
  const spare = Math.max(0, ring.length - list.length);
  const big = new Set([...list].sort((a, b) => b.photos.length - a.photos.length).slice(0, spare));
  const span = (a, b) => (a === b ? String(a) : `${Math.min(a, b)} / span 2`);
  let i = 0;
  const rooms = list.map((room) => {
    const [c0, r0] = ring[i++];
    const [c1, r1] = big.has(room) ? ring[i++] : [c0, r0];
    return { room, col: span(c0, c1), row: span(r0, r1) };
  });
  return { cols, rows, rooms, middle: `2 / span ${cols - 2}` };
}

const plan = planFor(roomList);
const gridStyle = { '--cols': plan.cols, '--rows': plan.rows };
const DESK = 'desk';

// The little plan printed on the folded maps in the stand.
export function MapThumb() {
  return (
    <span className="thumb" style={gridStyle} aria-hidden="true">
      {plan.rooms.map(({ room, col, row }) => (
        <span key={room.slug} className={`thumb-room th-${room.theme}`} style={{ gridColumn: col, gridRow: row, background: TINT[room.theme] }} />
      ))}
      <span className="thumb-desk" style={{ gridColumn: plan.middle, gridRow: plan.rows }} />
    </span>
  );
}

function Here() {
  return (
    <span className="plan-here">
      <span className="here-dot" aria-hidden="true" />
      You are here
    </span>
  );
}

function KeyHere() {
  return (
    <>
      <span className="here-dot" aria-hidden="true" />
      <span className="sr-only">, you are here</span>
    </>
  );
}

// The map, over whatever page you're on (taken from the stand on the desk or the brochure at the
// bottom). `here` is the room you're in (null at the front desk). Point at a room on the plan or
// in the key to read about it; click it to go there. Going, the map goes to black and
// onGo(path) takes you (App closes the map once the new page is up behind it). Escape, the fold
// button or a click off the paper puts it away.
// It comes up folded from the brochure and opens out like a book: its right flap turns over on
// its crease, then its left. Put away, it closes up the same way and sinks back into the
// brochure. (index.css times it: rise, flap-r, flap-l.)
const OPEN = 950;
const FOLD = 820;
export function GalleryMap({ here, onClose, onGo }) {
  const ref = useRef(null);
  const paperRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const goRef = useRef(onGo);
  goRef.current = onGo;
  const [sel, setSel] = useState(null); // the room (slug) or DESK you're pointing at
  const [opening, setOpening] = useState(true); // the flaps turning open
  const [folding, setFolding] = useState(false);
  const [going, setGoing] = useState(null); // where you've set off for
  const fold = () => !going && setFolding(true);

  useEffect(() => {
    const d = ref.current;
    if (!d.open) d.showModal();
    paperRef.current.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const id = setTimeout(() => setOpening(false), OPEN);
    return () => clearTimeout(id);
  }, []);
  // the flaps come back to fold it up: scrolled as far down as the paper (a phone's scrolls)
  useLayoutEffect(() => {
    if (!folding) return;
    const top = paperRef.current?.scrollTop || 0;
    ref.current?.querySelectorAll('.flap-face').forEach((el) => (el.scrollTop = top));
  }, [folding]);
  useEffect(() => {
    if (!folding) return undefined;
    // closed first, so the page is no longer inert when focus goes back to the opener
    const id = setTimeout(() => ref.current?.close(), FOLD);
    return () => clearTimeout(id);
  }, [folding]);
  useEffect(() => {
    if (!going) return undefined;
    const id = setTimeout(() => goRef.current(going), 550);
    return () => clearTimeout(id);
  }, [going]);

  const room = roomList.find((r) => r.slug === sel) || null;
  // pointing at a place (or tabbing to it) tells you about it; clicking it takes you there,
  // unless it's where you are
  const pick = (key, to, isHere) => ({
    onPointerEnter: () => !going && setSel(key),
    onFocus: () => !going && setSel(key),
    onClick: () => {
      if (going) return;
      setSel(key);
      if (!isHere) setGoing(to);
    },
    disabled: !!going && sel !== key,
  });

  let about;
  if (room) {
    about = (
      <>
        <p className="pick-room">Room {room.num}</p>
        <p className="pick-name">{room.name}</p>
        <p className="pick-blurb">{room.blurb}</p>
        {room.slug === here && <p className="pick-here">You are here.</p>}
      </>
    );
  } else if (sel === DESK) {
    about = (
      <>
        <p className="pick-room">The lobby</p>
        <p className="pick-name">Front desk</p>
        <p className="pick-blurb">Where you came in. Charly&rsquo;s at the desk, with the maps.</p>
        {!here && <p className="pick-here">You are here.</p>}
      </>
    );
  } else {
    about = <p className="pick-blurb">Click a room on the plan or in the list to go there.</p>;
  }

  // What's printed on the paper: drawn once for the paper itself, and while it opens or folds
  // up, again on each of its two side flaps (inert copies, without ids), which turn on the creases.
  const sheet = (copy) => (
    <>
      <header className="paper-head">
        <div>
          <p className="paper-kicker">
            {site.name} · {site.subtitle}
          </p>
          <h2 id={copy ? undefined : 'map-title'} className="paper-title">
            Gallery map
          </h2>
        </div>
        <button type="button" className="paper-fold" onClick={fold}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
          Fold map
        </button>
      </header>

      <div className="paper-body">
        <div className="plan" style={gridStyle}>
          {plan.rooms.map(({ room: r, col, row }) => (
            <div key={r.slug} className={sel === r.slug ? 'plan-room picked' : 'plan-room'} style={{ gridColumn: col, gridRow: row, background: TINT[r.theme] }}>
              <button
                type="button"
                className="plan-pick"
                aria-label={r.slug === here ? `Room ${r.num}, ${r.name}, ${r.photos.length} photographs, you are here` : `Go to room ${r.num}, ${r.name}, ${r.photos.length} photographs`}
                {...pick(r.slug, `/room/${r.slug}`, r.slug === here)}
              >
                <span className="plan-ticks" aria-hidden="true">
                  {r.photos.map((p) => (
                    <span key={p.id} />
                  ))}
                </span>
                <span className="plan-name" aria-hidden="true">
                  <Pictogram name={r.icon} size={17} className="plan-icon" />
                  <span className="plan-words">
                    <span className="plan-num">
                      {r.num} · {r.name}
                    </span>
                    <span className="plan-count">{r.photos.length} photos</span>
                  </span>
                </span>
              </button>
              {r.slug === here && <Here />}
            </div>
          ))}
          <div className="plan-hall" aria-hidden="true" style={{ gridColumn: plan.middle, gridRow: `2 / span ${plan.rows - 2}` }}>
            Hall
          </div>
          <div className={sel === DESK ? 'plan-desk picked' : 'plan-desk'} style={{ gridColumn: plan.middle, gridRow: plan.rows }}>
            <button type="button" className="plan-pick" aria-label={here ? 'Go to the front desk' : 'Front desk, you are here'} {...pick(DESK, '/', !here)}>
              <span className="plan-desk-top" aria-hidden="true" />
              <span className="plan-desk-name">Front desk</span>
            </button>
            {!here && <Here />}
          </div>
          <div className="plan-door" aria-hidden="true" />
        </div>

        <div className="map-key">
          <p className="key-title" id={copy ? undefined : 'map-key'}>
            Rooms
          </p>
          <div className="key-rows" role="group" aria-labelledby={copy ? undefined : 'map-key'}>
            {roomList.map((r) => (
              <button key={r.slug} type="button" className={sel === r.slug ? 'key-row picked' : 'key-row'} {...pick(r.slug, `/room/${r.slug}`, r.slug === here)}>
                <span className="key-num">{r.num}</span>
                <span className="key-name">
                  {r.name}
                  {r.slug === here && <KeyHere />}
                </span>
                <span className="key-count">{r.photos.length}</span>
              </button>
            ))}
            <button type="button" className={sel === DESK ? 'key-row picked' : 'key-row'} {...pick(DESK, '/', !here)}>
              <span className="key-num" aria-hidden="true">
                ·
              </span>
              <span className="key-name">
                Front desk
                {!here && <KeyHere />}
              </span>
              <span className="key-count" />
            </button>
          </div>
        </div>

        <div className={sel ? 'key-pick picked' : 'key-pick'} aria-live={copy ? undefined : 'polite'}>
          {about}
        </div>
      </div>
    </>
  );

  return (
    <dialog
      ref={ref}
      className={`map${opening ? ' opening' : ''}${folding ? ' folding' : ''}${going ? ' going' : ''}`}
      aria-labelledby="map-title"
      onCancel={(e) => {
        e.preventDefault();
        fold();
      }}
      onClose={() => closeRef.current()}
    >
      <div className="map-dim" onClick={fold} aria-hidden="true" />
      <div className="paper-wrap">
        <div ref={paperRef} className="paper" tabIndex={-1}>
          {sheet(false)}
        </div>
        {(opening || folding) && (
          <div className="flaps" aria-hidden="true" inert>
            <div className="flap flap-r">
              <div className="paper flap-face">{sheet(true)}</div>
              <div className="flap-back" />
            </div>
            <div className="flap flap-l">
              <div className="paper flap-face">{sheet(true)}</div>
              <div className="flap-back" />
            </div>
          </div>
        )}
      </div>
      <div className="map-veil" aria-hidden="true" />
    </dialog>
  );
}
