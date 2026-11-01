import { createContext, useEffect, useRef, useState } from 'react';
import { roomList, site } from '../data/gallery.js';
import { Arrow, Pictogram } from './Icons.jsx';

// openMap(from, opener): takes the map out, from the stand on the desk ('stand') or the home
// button ('dock'); `opener` gets focus back when it's folded away. Provided by App.
export const MapContext = createContext(() => {});

// Map tints follow each room's walls: white, teal, violet, the grey of the spotlit rooms, and
// the claret of the salon.
const TINT = { white: '#ebe6d8', teal: '#c3d6d4', violet: '#cfc9de', spot: '#d9d4c8', salon: '#e2c4c0' };

// The floor plan: rooms in a ring round the hall, four columns wide, the front desk at the
// bottom in the middle. The ring has a slot top-left, top-right, two between them, and one in
// each outer column for every row below; it gets a row deeper for every two more rooms. With a
// slot to spare, the two at the top in the middle become one wide room, for the room with the
// most photos. The rest are handed out in this order: by the desk on the right, the top
// corners, down the right-hand side, by the desk on the left, up the left-hand side, then the
// top middle.
export function planFor(list) {
  const cols = 4;
  const rows = Math.max(3, Math.ceil((list.length - 2) / 2));
  const wide = 2 * rows + 2 > list.length;
  const at = (col, row) => ({ col: String(col), row: String(row) });
  const slots = [at(cols, rows), at(cols, 1), at(1, 1)];
  for (let r = 2; r < rows; r++) slots.push(at(cols, r));
  slots.push(at(1, rows));
  for (let r = rows - 1; r >= 2; r--) slots.push(at(1, r));
  if (!wide) slots.push(at(2, 1), at(3, 1));
  const out = [];
  let rest = list;
  if (wide && list.length) {
    const big = list.reduce((a, b) => (b.photos.length > a.photos.length ? b : a));
    out.push({ room: big, col: '2 / span 2', row: '1' });
    rest = list.filter((r) => r !== big);
  }
  rest.forEach((room, i) => out.push({ room, ...slots[i] }));
  out.sort((a, b) => a.room.num - b.room.num);
  return { cols, rows, rooms: out, middle: `2 / span ${cols - 2}` };
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

// The map, over whatever page you're on: unfolded from the stand, or uncrumpled up out of the
// home button. `here` is the room you're in (null at the front desk). Pick a room on the plan
// or in the key to read about it and walk there: the map goes to black, and onGo(path) takes
// you. Escape, the fold button or a click off the paper puts it away.
export function GalleryMap({ from, here, onClose, onGo }) {
  const ref = useRef(null);
  const paperRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const goRef = useRef(onGo);
  goRef.current = onGo;
  const [sel, setSel] = useState(null); // a room's slug, or DESK
  const [folding, setFolding] = useState(false);
  const [going, setGoing] = useState(null); // where you've set off for
  const fold = () => !going && setFolding(true);

  useEffect(() => {
    const d = ref.current;
    if (!d.open) d.showModal();
    paperRef.current.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    if (!folding) return undefined;
    // closed first, so the page is no longer inert when focus goes back to the opener
    const id = setTimeout(() => ref.current?.close(), from === 'dock' ? 380 : 280);
    return () => clearTimeout(id);
  }, [folding, from]);
  useEffect(() => {
    if (!going) return undefined;
    const id = setTimeout(() => goRef.current(going), 550);
    return () => clearTimeout(id);
  }, [going]);

  const room = roomList.find((r) => r.slug === sel) || null;
  const pressed = (key) => (sel === key ? 'true' : 'false');
  const walk = (label, to) => (
    <button type="button" className="walk" onClick={() => setGoing(to)} disabled={!!going}>
      Walk to {label}
      <Arrow size={16} />
    </button>
  );

  let pick;
  if (room) {
    pick = (
      <>
        <p className="pick-room">Room {room.num}</p>
        <p className="pick-name">{room.name}</p>
        <p className="pick-blurb">{room.blurb}</p>
        {room.slug === here ? <p className="pick-here">You are here.</p> : walk(room.name, `/room/${room.slug}`)}
      </>
    );
  } else if (sel === DESK) {
    pick = (
      <>
        <p className="pick-room">The lobby</p>
        <p className="pick-name">Front desk</p>
        <p className="pick-blurb">Where you came in. Charly&rsquo;s at the desk, with the maps.</p>
        {here ? walk('the front desk', '/') : <p className="pick-here">You are here.</p>}
      </>
    );
  } else {
    pick = <p className="pick-blurb">Pick a room on the plan or in the list.</p>;
  }

  return (
    <dialog
      ref={ref}
      className={`map from-${from}${folding ? ' folding' : ''}${going ? ' going' : ''}`}
      aria-labelledby="map-title"
      onCancel={(e) => {
        e.preventDefault();
        fold();
      }}
      onClose={() => closeRef.current()}
    >
      <div className="map-dim" onClick={fold} aria-hidden="true" />
      <div ref={paperRef} className="paper" tabIndex={-1}>
        <header className="paper-head">
          <div>
            <p className="paper-kicker">
              {site.name} · {site.subtitle}
            </p>
            <h2 id="map-title" className="paper-title">
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
              <button
                key={r.slug}
                type="button"
                className={r.slug === here ? 'plan-room is-here' : 'plan-room'}
                aria-pressed={pressed(r.slug)}
                aria-label={`Room ${r.num}, ${r.name}, ${r.photos.length} photographs${r.slug === here ? ', you are here' : ''}`}
                onClick={() => setSel(r.slug)}
                style={{ gridColumn: col, gridRow: row, background: TINT[r.theme] }}
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
                    {r.slug === here && <Here />}
                  </span>
                </span>
              </button>
            ))}
            <div className="plan-hall" aria-hidden="true" style={{ gridColumn: plan.middle, gridRow: `2 / span ${plan.rows - 2}` }}>
              Hall
            </div>
            <button
              type="button"
              className="plan-desk"
              aria-pressed={pressed(DESK)}
              aria-label={`Front desk${here ? '' : ', you are here'}`}
              onClick={() => setSel(DESK)}
              style={{ gridColumn: plan.middle, gridRow: plan.rows }}
            >
              <span className="plan-desk-top" aria-hidden="true" />
              <span className="plan-desk-name">Front desk</span>
              {!here && <Here />}
            </button>
            <div className="plan-door" aria-hidden="true" />
          </div>

          <div className="map-key">
            <p className="key-title" id="map-key">
              Rooms
            </p>
            <div className="key-rows" role="group" aria-labelledby="map-key">
              {roomList.map((r) => (
                <button key={r.slug} type="button" className="key-row" aria-pressed={pressed(r.slug)} onClick={() => setSel(r.slug)}>
                  <span className="key-num">{r.num}</span>
                  <span className="key-name">
                    {r.name}
                    {r.slug === here && <KeyHere />}
                  </span>
                  <span className="key-count">{r.photos.length}</span>
                </button>
              ))}
              <button type="button" className="key-row" aria-pressed={pressed(DESK)} onClick={() => setSel(DESK)}>
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

          <div className={sel ? 'key-pick picked' : 'key-pick'} aria-live="polite">
            {pick}
          </div>
        </div>
      </div>
      <div className="map-veil" aria-hidden="true" />
    </dialog>
  );
}
