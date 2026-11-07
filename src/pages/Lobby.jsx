import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { roomList, site } from '../data/gallery.js';
import { MapContext, MapThumb, planFor } from '../components/GalleryMap.jsx';
import { Arrow, Pictogram } from '../components/Icons.jsx';
import { Curtain, Lens, Shell } from '../components/Scene.jsx';
import { usePreload } from '../hooks/usePreload.js';
import { sound } from '../sound.js';
import { getViewMode } from '../viewMode.js';
import { metaLine, titleLine } from '../components/Frame.jsx';

const PHONE = '(max-width: 700px)';

export default function Lobby() {
  const openMap = useContext(MapContext);
  const stageRef = useRef(null);
  // Charly's layers come in with the rest, so he comes up whole when the bell calls him
  const { done, progress } = usePreload('lobby', [...LAYERS.map((p) => `/lobby/charly-${p}.png`), featured?.wall, '/textures/floor-stone.jpg', '/textures/wall-grain.png']);
  // Charly is out of sight behind the desk until the bell is rung three times quickly, and goes
  // back down when it's rung three times again
  const [charly, setCharly] = useState(false);
  const callTimer = useRef(0);
  const onCall = () => {
    clearTimeout(callTimer.current);
    callTimer.current = setTimeout(() => {
      sound.pop();
      setCharly((up) => !up);
    }, 380);
  };
  useEffect(() => () => clearTimeout(callTimer.current), []);
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
        <div className="dl dl-wall">
          <FeaturedPrint />
          <WallClock />
        </div>
        <div className="dl dl-char">
          <Charly up={charly} />
        </div>
        <div className="dl dl-desk">
          <Desk onMap={(e) => openMap('stand', e.currentTarget)} charly={charly} onCall={onCall} />
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

// Charly behind the desk, out of sight until the bell calls him up (`up`), in cut-out layers
// stacked at one origin (made by scripts/cut-charly.js), cut off at the desk top (only at the
// bottom, so his arms are free to move). He breathes; his head and arms move on their own
// pivots, the arms behind the torso and in front of the underarms, which stay still. Coming up
// he says welcome: a
// speech bubble, and his jaw (a copy of his chin, cut along the line of his lips) flaps up and
// down like a cut-out cartoon's, over a dark gap that shows when it drops. Click his face and he
// says it again, in the next language round.
const LAYERS = ['underarm', 'arm-l', 'arm-r', 'torso', 'head'];
const WELCOMES = ['Welcome!', 'Bienvenue !', '¡Bienvenido!', 'Willkommen!', 'Benvenuto!', '欢迎！', 'ようこそ！', '환영합니다!', 'Bem-vindo!', 'Добро пожаловать!', 'Karibu!', 'Witaj!', 'Hoş geldiniz!', 'Velkommen!', 'स्वागत है!', 'Selamat datang!'];
function Charly({ up }) {
  // `said` counts the times he's said it: the first on his own, the rest when clicked; each
  // remounts the jaw and the bubble so their animations run again
  const [said, setSaid] = useState(0);
  const again = said > 0 ? ' again' : '';
  return (
    <div className={up ? 'charly up' : 'charly'} aria-hidden="true">
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
// Clicked, they give a little shake and a few drops run down them into the bucket, each with a
// ripple and a plip as it lands.
const DROPS = [
  { u: 0, x: 79, y: 150, d: 0.05 },
  { u: 1, x: 84, y: 138, d: 0.4 },
  { u: 2, x: 81, y: 168, d: 0.72 },
  { u: 1, x: 65, y: 160, d: 1.05 },
];
const RIPPLES = [62, 84, 92, 66]; // where each drop lands in the bucket's opening
const DROP_S = 0.76; // from a drop setting off to it landing (index.css: drop-run)
function UmbrellaStand() {
  const [shook, setShook] = useState(0);
  const shake = () => {
    setShook((n) => n + 1);
    DROPS.forEach((dr) => sound.drip(dr.d + DROP_S));
  };
  const drops = (u) =>
    shook > 0 &&
    DROPS.filter((dr) => dr.u === u).map((dr, i) => (
      <path key={i} className="drop" d={`M${dr.x} ${dr.y - 7.5} Q${dr.x + 4.2} ${dr.y} ${dr.x} ${dr.y + 3.8} Q${dr.x - 4.2} ${dr.y} ${dr.x} ${dr.y - 7.5} Z`} style={{ animationDelay: `${dr.d}s` }} />
    ));
  return (
    <button type="button" className="umbrella-btn" tabIndex={-1} onClick={shake} aria-label="The umbrella stand">
    <svg key={shook} className={shook ? 'umbrellas shook' : 'umbrellas'} viewBox="0 0 150 300" aria-hidden="true">
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
      {shook > 0 && RIPPLES.map((x, i) => <ellipse key={i} className="ripple" cx={x} cy="195" rx="5" ry="1.4" style={{ animationDelay: `${DROPS[i].d + DROP_S}s` }} />)}
      <g className="ub">
      {/* black, straight-handled, leaning left */}
      <g transform="rotate(-9 75 200)">
        <path d="M66 205 C61 160 66 120 72 74 L78 74 C84 120 89 160 84 205 Z" fill="#1d1e21" />
        <path d="M70 150 L80 150" stroke="#3a3b3f" strokeWidth="3" />
        <path d="M75 74 V40" stroke="#5b5f63" strokeWidth="3" />
        <rect x="71" y="22" width="8" height="20" rx="3" fill="#2a2a2a" />
        {drops(0)}
      </g>
      {/* navy, crook handle, upright */}
      <g transform="rotate(3 75 200)">
        <path d="M62 205 C57 150 64 104 71 58 L78 58 C85 104 92 150 87 205 Z" fill="#1f3556" />
        <path d="M71 58 C75 90 75 150 70 205" stroke="#2b4670" strokeWidth="2" fill="none" />
        <path d="M66 132 L83 132" stroke="#c9b37a" strokeWidth="3" />
        <path d="M74.5 58 V30 C74.5 12 96 12 96 28" stroke="#8a5a32" strokeWidth="5" strokeLinecap="round" fill="none" />
        {drops(1)}
      </g>
      {/* claret, crook handle, leaning right */}
      <g transform="rotate(12 75 205)">
        <path d="M64 205 C60 162 66 126 72 86 L78 86 C84 126 90 162 86 205 Z" fill="#7a1f2b" />
        <path d="M68 160 L82 160" stroke="#4e121b" strokeWidth="3" />
        <path d="M75 86 V60 C75 44 55 44 55 58" stroke="#6b4426" strokeWidth="5" strokeLinecap="round" fill="none" />
        {drops(2)}
      </g>
      </g>
      {/* the bucket's front: brushed steel, up to the near half of its rim */}
      <path d="M22 196 A53 8 0 0 0 128 196 L119 292 Q75 300 31 292 Z" fill="url(#bucket)" />
      <path d="M22 196 A53 8 0 0 0 128 196" stroke="#9aa0a5" strokeWidth="2" fill="none" />
      <path d="M27 216 Q75 223 123 216" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" />
      <path d="M30 282 Q75 289 120 282" stroke="rgba(0,0,0,0.35)" strokeWidth="2" fill="none" />
    </svg>
    </button>
  );
}

// The reception desk: pale quartz top, light-oak slats, and on it a welcome card, a call bell,
// a stand of folded maps and (while he's up) Charly's name plate. Round it, on the floor: the
// umbrella stand, a velvet rope and a plant.
function Desk({ onMap, charly, onCall }) {
  return (
    <>
      <UmbrellaStand />
      <Rope />
      <Plant />
      <div className="desk-shadow" aria-hidden="true" />
      <div className="desk-top" aria-hidden="true" />
      <div className="desk-edge" aria-hidden="true" />
      <div className="desk-front">
        <p className="desk-plaque">Information</p>
      </div>
      <p className={charly ? 'nameplate up' : 'nameplate'} aria-hidden="true">
        <span>{site.name}</span>
      </p>
      <div className="desk-card">
        <p className="card-title">Welcome in</p>
        <p className="card-text">Take a map to find your way round.</p>
      </div>
      <Bell onCall={onCall} />
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

// A call bell on the desk, left of the maps: it dings. Rung three times quickly, it calls
// Charly up from behind the desk (onCall), and three more send him back down.
const CALL_MS = 1300; // three rings within this
function Bell({ onCall }) {
  const [rung, setRung] = useState(0);
  const rings = useRef([]);
  const ring = () => {
    sound.bell();
    setRung((n) => n + 1);
    const now = performance.now();
    rings.current = [...rings.current.filter((t) => now - t < CALL_MS), now];
    if (rings.current.length >= 3) {
      rings.current = [];
      onCall();
    }
  };
  return (
    <button type="button" className="bell" onClick={ring} aria-label="Ring the bell">
      <svg key={rung} className={rung ? 'bell-svg rung' : 'bell-svg'} viewBox="0 0 60 46" aria-hidden="true">
        <defs>
          <linearGradient id="bell-dome" x1="0" x2="1" y1="0" y2="0.4">
            <stop offset="0" stopColor="#8d6a2c" />
            <stop offset="0.3" stopColor="#f2d58a" />
            <stop offset="0.48" stopColor="#fff4cf" />
            <stop offset="0.7" stopColor="#c99a45" />
            <stop offset="1" stopColor="#6e5020" />
          </linearGradient>
        </defs>
        <ellipse cx="30" cy="43" rx="27" ry="3" fill="rgba(0,0,0,0.25)" />
        <path d="M5 37 H55 V41 Q30 44 5 41 Z" fill="#1d1b19" />
        <ellipse cx="30" cy="37" rx="25" ry="3.2" fill="#34302b" />
        <g className="bell-knob">
          <rect x="28.4" y="5" width="3.2" height="9" fill="#4a3a1c" />
          <ellipse cx="30" cy="5" rx="4.6" ry="2.4" fill="#3a2d15" />
        </g>
        <g className="bell-dome">
          <path d="M8 36.5 C8 22 17 13.5 30 13.5 C43 13.5 52 22 52 36.5 Z" fill="url(#bell-dome)" />
          <path d="M8 36.5 Q30 39.5 52 36.5" stroke="#5a4216" strokeWidth="1.2" fill="none" />
          <path d="M17 26 Q21 18 29 16.5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </button>
  );
}

// The print hung on the wall behind the desk (site.featured), under a brass picture light, with
// a small label. Clicked, its light comes up and you go to it in its room.
const featuredRoom = roomList.find((r) => r.photos.some((p) => p.file.split('?')[0] === site.featured));
const featured = featuredRoom?.photos.find((p) => p.file.split('?')[0] === site.featured);
function FeaturedPrint() {
  const navigate = useNavigate();
  const [lit, setLit] = useState(false);
  useEffect(() => {
    if (!lit) return undefined;
    const to = getViewMode() === 'collage' ? `/room/${featuredRoom.slug}/collage/${featured.id}` : `/room/${featuredRoom.slug}/${featured.id}`;
    const id = setTimeout(() => navigate(to), 750);
    return () => clearTimeout(id);
  }, [lit, navigate]);
  if (!featured) return null;
  const go = () => {
    if (lit) return;
    sound.click();
    setLit(true);
  };
  return (
    <div className={lit ? 'feature lit' : 'feature'}>
      <span className="feature-wash" aria-hidden="true" />
      <span className="feature-lamp" aria-hidden="true" />
      <button type="button" className="feature-frame" onClick={go} aria-label={`Now showing: ${featured.title}. See it in ${featuredRoom.name}`}>
        <img src={featured.wall} alt="" width={featured.width} height={featured.height} draggable="false" />
      </button>
      <div className="feature-label" aria-hidden="true">
        <p className="fl-kicker">Now showing</p>
        <p className="fl-title">{titleLine(featured)}</p>
        <p className="fl-meta">{metaLine(featured)}</p>
        <p className="fl-room">In {featuredRoom.name}</p>
      </div>
    </div>
  );
}

// A plain round clock high on the wall above the signs, keeping the visitor's own time. Clicked,
// it gives a tick-tock and its second hand sweeps round once.
function WallClock() {
  const [now, setNow] = useState(() => Date.now());
  const [sweeps, setSweeps] = useState(0);
  const [sweeping, setSweeping] = useState(false);
  const start = useRef(now);
  useEffect(() => {
    let id = 0;
    const next = () => {
      const t = Date.now();
      setNow(t);
      id = setTimeout(next, 1000 - (t % 1000) + 5);
    };
    id = setTimeout(next, 1000 - (Date.now() % 1000) + 5);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!sweeping) return undefined;
    const id = setTimeout(() => setSweeping(false), 1250);
    return () => clearTimeout(id);
  }, [sweeping, sweeps]);
  const d = new Date(now);
  const h = ((d.getHours() % 12) + d.getMinutes() / 60) * 30;
  const m = (d.getMinutes() + d.getSeconds() / 60) * 6;
  // the second hand only ever goes forward, so it never spins back past twelve
  const secs = new Date(start.current).getSeconds() + Math.floor(now / 1000) - Math.floor(start.current / 1000);
  const sa = secs * 6 + sweeps * 360;
  const click = () => {
    sound.tick(0);
    sound.tick(0.5, true);
    setSweeps((n) => n + 1);
    setSweeping(true);
  };
  return (
    <button type="button" className="clock" tabIndex={-1} onClick={click} aria-label={`A clock: ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="47" fill="#fbfaf7" stroke="#1b1a19" strokeWidth="4" />
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1="50" y1={i % 5 ? 8 : 7} x2="50" y2={i % 5 ? 11 : 17} stroke="#1b1a19" strokeWidth={i % 5 ? 0.9 : 3} transform={`rotate(${i * 6} 50 50)`} />
        ))}
        <line className="hand" x1="50" y1="56" x2="50" y2="27" stroke="#1b1a19" strokeWidth="4.6" style={{ transform: `rotate(${h}deg)` }} />
        <line className="hand" x1="50" y1="58" x2="50" y2="13" stroke="#1b1a19" strokeWidth="3.4" style={{ transform: `rotate(${m}deg)` }} />
        <g className={sweeping ? 'hand sec sweep' : 'hand sec'} style={{ transform: `rotate(${sa}deg)` }}>
          <line x1="50" y1="64" x2="50" y2="11" stroke="#b8322a" strokeWidth="1.4" />
        </g>
        <circle cx="50" cy="50" r="2.6" fill="#b8322a" />
      </svg>
    </button>
  );
}

// A short velvet rope between two brass posts on the floor right of the desk. Clicked, it swings
// and settles, its hooks knocking on the posts.
function Rope() {
  const [swung, setSwung] = useState(0);
  const swing = () => {
    sound.clink();
    setSwung((n) => n + 1);
  };
  const post = (x) => (
    <g>
      <ellipse cx={x} cy="163" rx="17" ry="4.5" fill="rgba(0,0,0,0.2)" />
      <path d={`M${x - 15} 161 Q${x} 150 ${x + 15} 161 Q${x} 166 ${x - 15} 161 Z`} fill="url(#brass)" />
      <rect x={x - 3} y="30" width="6" height="128" fill="url(#brass)" />
      <circle cx={x} cy="26" r="7.5" fill="url(#brass)" />
      <rect x={x - 5} y="38" width="10" height="5" rx="1.5" fill="#8a6a2c" />
    </g>
  );
  return (
    <button type="button" className="rope-btn" tabIndex={-1} onClick={swing} aria-label="A velvet rope">
      <svg viewBox="0 0 170 170" aria-hidden="true">
        <defs>
          <linearGradient id="brass" x1="0" x2="1">
            <stop offset="0" stopColor="#7a5a22" />
            <stop offset="0.4" stopColor="#f3d98f" />
            <stop offset="0.6" stopColor="#c89b47" />
            <stop offset="1" stopColor="#5e4318" />
          </linearGradient>
        </defs>
        <g key={swung} className={swung ? 'rope swung' : 'rope'}>
          <path d="M27 42 Q85 104 143 42" stroke="#5c0f1d" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M27 40 Q85 101 143 40" stroke="rgba(255,190,200,0.25)" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>
        {post(20)}
        {post(150)}
      </svg>
    </button>
  );
}

// A snake plant in a tall charcoal planter, in the corner right of the desk. Clicked, its leaves
// rustle.
const BLADES = [
  { x: 52, tx: 30, ty: 40, w: 9 },
  { x: 60, tx: 52, ty: 8, w: 10 },
  { x: 66, tx: 76, ty: 26, w: 9 },
  { x: 72, tx: 98, ty: 60, w: 9 },
  { x: 56, tx: 44, ty: 84, w: 8 },
  { x: 70, tx: 66, ty: 0, w: 10 },
  { x: 64, tx: 86, ty: 96, w: 8 },
];
function Plant() {
  const [rustled, setRustled] = useState(0);
  const rustle = () => {
    sound.rustle();
    setRustled((n) => n + 1);
  };
  return (
    <button type="button" className="plant-btn" tabIndex={-1} onClick={rustle} aria-label="A plant">
      <svg key={rustled} className={rustled ? 'plant rustled' : 'plant'} viewBox="0 0 130 380" aria-hidden="true">
        <defs>
          <linearGradient id="planter" x1="0" x2="1">
            <stop offset="0" stopColor="#1e1d1c" />
            <stop offset="0.35" stopColor="#4a4845" />
            <stop offset="0.65" stopColor="#2f2e2c" />
            <stop offset="1" stopColor="#171615" />
          </linearGradient>
        </defs>
        <ellipse cx="65" cy="374" rx="50" ry="5" fill="rgba(0,0,0,0.22)" />
        {BLADES.map((b, i) => (
          <g key={i} className="blade" style={{ transformOrigin: `${b.x}px 236px`, animationDelay: `${i * 0.05}s` }}>
            <path d={`M${b.x - b.w} 236 C${b.x - b.w * 1.3} 170 ${b.tx - b.w * 0.6} ${b.ty + 70} ${b.tx} ${b.ty} C${b.tx + b.w * 0.6} ${b.ty + 70} ${b.x + b.w * 1.3} 170 ${b.x + b.w} 236 Z`} fill="#355f38" stroke="#c4bd66" strokeWidth="1.6" />
            <path d={`M${b.x} 232 Q${(b.x + b.tx) / 2} ${(236 + b.ty) / 2 + 10} ${b.tx} ${b.ty + 10}`} stroke="rgba(170,205,140,0.35)" strokeWidth="2.5" fill="none" />
          </g>
        ))}
        <path d="M24 232 H106 L100 370 Q65 376 30 370 Z" fill="url(#planter)" />
        <ellipse cx="65" cy="232" rx="41" ry="5" fill="#2b2a28" />
      </svg>
    </button>
  );
}
