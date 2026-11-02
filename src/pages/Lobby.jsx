import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { roomList, site } from '../data/gallery.js';
import { MapContext, MapThumb, planFor } from '../components/GalleryMap.jsx';
import { Arrow, Pictogram } from '../components/Icons.jsx';
import { Curtain, Lens, Shell } from '../components/Scene.jsx';
import { usePreload } from '../hooks/usePreload.js';

const PHONE = '(max-width: 700px)';

export default function Lobby() {
  const openMap = useContext(MapContext);
  const stageRef = useRef(null);
  // Charly's layers come up together, not a limb at a time; he waves once the curtain lifts
  const { done, progress } = usePreload('lobby', [...LAYERS.map((p) => `/lobby/charly-${p}.png`), '/textures/floor-stone.jpg', '/textures/wall-grain.png']);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!done) return undefined;
    const id = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(id);
  }, [done]);
  useDeskScale(stageRef);
  useLookAround(stageRef);
  useEffect(() => {
    document.title = `${site.name} · ${site.subtitle}`;
  }, []);

  return (
    <div ref={stageRef} className={ready ? 'stage lobby t-white ready' : 'stage lobby t-white'}>
      <div className="cam">
        <div className="world" style={{ width: '100%' }}>
          <Shell />
        </div>
      </div>
      <Lettering />
      <Signage />
      <div className="desk-scene">
        <div className="dl dl-char">
          <Charly />
        </div>
        <div className="dl dl-desk">
          <Desk onMap={(e) => openMap('stand', e.currentTarget)} />
        </div>
      </div>
      <Lens />
      <Curtain kicker={site.name} name={site.subtitle} progress={progress} />
    </div>
  );
}

// The desk scene is drawn at 1440 × 900 and scaled by --dk: with the room on a desktop, and on
// a phone so the desk fills the width.
function useDeskScale(ref) {
  useLayoutEffect(() => {
    const set = () => {
      const W = window.innerWidth;
      const k = window.matchMedia(PHONE).matches ? W / 840 : Math.min(window.innerHeight, W / 1.6) / 900;
      ref.current.style.setProperty('--dk', k.toFixed(4));
    };
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, [ref]);
}

// Where the pointer is over the lobby, -1..1 each way, as --px and --py on the stage. The
// parallax and Charly's glances are all CSS from those two. Not on a phone.
function useLookAround(ref) {
  useEffect(() => {
    const el = ref.current;
    const phone = window.matchMedia(PHONE);
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    let frame = 0;
    let px = 0;
    let py = 0;
    const apply = () => {
      frame = 0;
      el.style.setProperty('--px', px.toFixed(3));
      el.style.setProperty('--py', py.toFixed(3));
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onMove = (e) => {
      if (e.pointerType === 'touch' || phone.matches) return;
      const r = el.getBoundingClientRect();
      px = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
      py = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
      queue();
    };
    // off the window: back to the middle
    const onOut = (e) => {
      if (e.relatedTarget) return;
      px = 0;
      py = 0;
      queue();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onOut);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onOut);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const inWords = (n) => {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${inWords(n % 100)}` : ''}`;
  return String(n);
};
const counted = (n, one, many) => {
  const w = inWords(n);
  return `${w[0].toUpperCase()}${w.slice(1)} ${n === 1 ? one : many}`;
};
const photoCount = roomList.reduce((a, r) => a + r.photos.length, 0);

// Vinyl lettering on the wall, left of the desk.
function Lettering() {
  return (
    <div className="lettering">
      <div className="words">
        <p className="words-kicker">Welcome to</p>
        <h1 className="words-name">
          {site.name.split(' ').map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </h1>
        <p className="words-sub">{site.subtitle}</p>
        <div className="words-rule" aria-hidden="true" />
        <p className="words-count">
          {counted(roomList.length, 'gallery', 'galleries')}
          <br />
          {counted(photoCount, 'photograph', 'photographs')}
        </p>
      </div>
    </div>
  );
}

// Wayfinding on the back wall, right of the desk, like a museum's: each room's pictogram, its
// name and an arrow the way it lies on the plan (the map's ring of rooms round the hall, seen
// from the desk at the bottom: up the right-hand side, across the top, down the left). Each
// sign takes you to its room, as the map does.
const plan = planFor(roomList);
const towards = ({ col, row }) => {
  const c = parseInt(col, 10);
  const top = parseInt(row, 10) === 1 && !String(row).includes('span');
  if (c === plan.cols) return top ? -45 : 0;
  if (c === 1) return top ? -135 : 180;
  return -90;
};
function Signage() {
  const navigate = useNavigate();
  return (
    <nav className="signage" aria-label="Galleries">
      <div className="signs">
        {plan.rooms.map((p) => (
          <button key={p.room.slug} type="button" className="sign" onClick={() => navigate(`/room/${p.room.slug}`)}>
            <Pictogram name={p.room.icon} size={24} className="sign-icon" color="#141414" />
            <span className="sign-name">{p.room.name}</span>
            <span className="sign-arrow">
              <Arrow rotate={towards(p)} size={22} />
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// Charly behind the desk, in cut-out layers stacked at one origin (made by
// scripts/cut-charly.js), cut off at the desk top (only at the bottom, so his arms are free to
// move). He breathes; his head and arms move on their own pivots, the arms behind the torso and
// in front of the underarms, which stay still. Once the curtain lifts he says welcome: a
// speech bubble, and his jaw (a copy of his chin, cut along the line of his lips) flaps up and
// down like a cut-out cartoon's, over a dark gap that shows when it drops.
const LAYERS = ['underarm', 'arm-l', 'arm-r', 'torso', 'head'];
function Charly() {
  return (
    <div className="charly" aria-hidden="true">
      <div className="breathe">
        {LAYERS.map((p) => (
          <div key={p} className={`part ${p}`}>
            <div className="idle">
              <img src={`/lobby/charly-${p}.png`} alt="" width="745" height="1000" draggable="false" />
              {p === 'head' && (
                <>
                  <span className="mouth-gap" />
                  <span className="jaw" />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="bubble">Welcome!</p>
    </div>
  );
}

// The reception desk: pale quartz top, light-oak slats, and on it a welcome card and a stand
// of folded maps.
function Desk({ onMap }) {
  return (
    <>
      <div className="desk-shadow" aria-hidden="true" />
      <div className="desk-top" aria-hidden="true" />
      <div className="desk-edge" aria-hidden="true" />
      <div className="desk-front">
        <p className="desk-plaque">Information</p>
      </div>
      <div className="desk-card">
        <p className="card-title">Welcome in</p>
        <p className="card-text">Take a map to find your way round.</p>
      </div>
      <button type="button" className="stand" onClick={onMap} aria-haspopup="dialog">
        <span className="stand-dot" aria-hidden="true" />
        <span className="stand-maps" aria-hidden="true">
          <span className="sheet sheet-1" />
          <span className="sheet sheet-2" />
          <span className="sheet sheet-3">
            <span className="sheet-title">Gallery map</span>
            <MapThumb />
          </span>
        </span>
        <span className="stand-holder" aria-hidden="true" />
        <span className="stand-label">Take a map</span>
      </button>
    </>
  );
}
