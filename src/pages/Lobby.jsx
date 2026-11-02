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
        <p className="words-sub">{site.subtitle} Gallery</p>
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
// down like a cut-out cartoon's, over a dark gap that shows when it drops. Click his face and he
// says it again, in the next language round.
const LAYERS = ['underarm', 'arm-l', 'arm-r', 'torso', 'head'];
const WELCOMES = ['Welcome!', 'Bienvenue !', '¡Bienvenido!', 'Willkommen!', 'Benvenuto!', '欢迎！', 'ようこそ！', '환영합니다!', 'Bem-vindo!', 'Добро пожаловать!', 'Karibu!', 'Witaj!', 'Hoş geldiniz!', 'Velkommen!', 'स्वागत है!', 'Selamat datang!'];
function Charly() {
  // `said` counts the times he's said it: the first on his own, the rest when clicked; each
  // remounts the jaw and the bubble so their animations run again
  const [said, setSaid] = useState(0);
  const again = said > 0 ? ' again' : '';
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
                  <span key={said} className={`jaw${again}`} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <p key={said} className={`bubble${again}`}>
        {WELCOMES[said % WELCOMES.length]}
        <svg className="bubble-tail" viewBox="0 0 26 22" aria-hidden="true">
          <path d="M3 -2 L5 19 L22 -2" />
        </svg>
      </p>
      <button type="button" className="charly-face" tabIndex={-1} onClick={() => setSaid((n) => n + 1)} />
    </div>
  );
}

// A bucket for wet umbrellas on the floor left of the desk, with three in it, handles up. Drawn
// back to front: the dark opening and the back of the rim, the umbrellas standing in it, then
// the bucket's front, whose top edge is the near half of the rim, so they go down inside.
function UmbrellaStand() {
  return (
    <svg className="umbrellas" viewBox="0 0 150 300" aria-hidden="true">
      <defs>
        <linearGradient id="bucket" x1="0" x2="1">
          <stop offset="0" stopColor="#2a2c2e" />
          <stop offset="0.35" stopColor="#55595d" />
          <stop offset="0.6" stopColor="#3a3d40" />
          <stop offset="1" stopColor="#1f2022" />
        </linearGradient>
      </defs>
      <ellipse cx="75" cy="296" rx="62" ry="6" fill="rgba(0,0,0,0.22)" />
      <ellipse cx="75" cy="196" rx="53" ry="8" fill="#16171a" />
      <path d="M22 196 A53 8 0 0 1 128 196" stroke="#7d8287" strokeWidth="2" fill="none" />
      {/* black, straight-handled, leaning left */}
      <g transform="rotate(-9 75 200)">
        <path d="M66 205 C61 160 66 120 72 74 L78 74 C84 120 89 160 84 205 Z" fill="#1d1e21" />
        <path d="M70 150 L80 150" stroke="#3a3b3f" strokeWidth="3" />
        <path d="M75 74 V40" stroke="#5b5f63" strokeWidth="3" />
        <rect x="71" y="22" width="8" height="20" rx="3" fill="#2a2a2a" />
      </g>
      {/* navy, crook handle, upright */}
      <g transform="rotate(3 75 200)">
        <path d="M62 205 C57 150 64 104 71 58 L78 58 C85 104 92 150 87 205 Z" fill="#1f3556" />
        <path d="M71 58 C75 90 75 150 70 205" stroke="#2b4670" strokeWidth="2" fill="none" />
        <path d="M66 132 L83 132" stroke="#c9b37a" strokeWidth="3" />
        <path d="M74.5 58 V30 C74.5 12 96 12 96 28" stroke="#8a5a32" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
      {/* claret, crook handle, leaning right */}
      <g transform="rotate(12 75 205)">
        <path d="M64 205 C60 162 66 126 72 86 L78 86 C84 126 90 162 86 205 Z" fill="#7a1f2b" />
        <path d="M68 160 L82 160" stroke="#4e121b" strokeWidth="3" />
        <path d="M75 86 V60 C75 44 55 44 55 58" stroke="#6b4426" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>
      {/* the bucket's front: brushed steel, up to the near half of its rim */}
      <path d="M22 196 A53 8 0 0 0 128 196 L119 292 Q75 300 31 292 Z" fill="url(#bucket)" />
      <path d="M22 196 A53 8 0 0 0 128 196" stroke="#9aa0a5" strokeWidth="2" fill="none" />
      <path d="M27 216 Q75 223 123 216" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
      <path d="M30 282 Q75 289 120 282" stroke="rgba(0,0,0,0.35)" strokeWidth="2" fill="none" />
    </svg>
  );
}

// The reception desk: pale quartz top, light-oak slats, and on it a welcome card and a stand
// of folded maps.
function Desk({ onMap }) {
  return (
    <>
      <UmbrellaStand />
      <div className="desk-shadow" aria-hidden="true" />
      <div className="desk-top" aria-hidden="true" />
      <div className="desk-edge" aria-hidden="true" />
      <div className="desk-front">
        <p className="desk-plaque">Information</p>
      </div>
      <p className="nameplate" aria-hidden="true">
        <span>{site.name}</span>
      </p>
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
