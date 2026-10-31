import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { roomList, site } from '../data/gallery.js';
import { Arrow, Pictogram } from '../components/Icons.jsx';
import { Lens, Shell } from '../components/Scene.jsx';

export default function Lobby() {
  const navigate = useNavigate();
  const [going, setGoing] = useState(null); // the room you've set off for: the lobby fades out
  useEffect(() => {
    document.title = `${site.name} · ${site.subtitle}`;
  }, []);
  useEffect(() => {
    if (!going) return undefined;
    const id = setTimeout(() => navigate(going), 550);
    return () => clearTimeout(id);
  }, [going, navigate]);

  return (
    <div className={going ? 'stage lobby t-white going' : 'stage lobby t-white'}>
      <div className="cam">
        <div className="world" style={{ width: '100%' }}>
          <Shell />
          <div className="col lobby-col">
            <Sign onGo={(to) => setGoing(to)} />
          </div>
        </div>
      </div>
      <Lens />
      <div className="curtain" aria-hidden="true" />
    </div>
  );
}

// The wayfinding sign on the lobby wall.
function Sign({ onGo }) {
  return (
    <nav aria-label="Galleries" className="sign">
      <p className="sign-kicker">
        {site.name} · {site.subtitle}
      </p>
      <h1 className="sign-title">Galleries</h1>
      <div className="sign-rows">
        {roomList.map((r) => (
          <a key={r.slug} href={`/room/${r.slug}`} className="signrow" tabIndex={-1} draggable="false" onClick={(e) => { e.preventDefault(); onGo(`/room/${r.slug}`); }}>
            <Arrow rotate={r.arrow} color="#141414" />
            <Pictogram name={r.icon} />
            <span className="u signrow-name">{r.name}</span>
            <span className="signrow-room">Room {r.num}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
