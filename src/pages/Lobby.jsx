import { useEffect } from 'react';
import { Link } from 'react-router';
import { roomList, site } from '../data/gallery.js';
import { Arrow, Pictogram } from '../components/Icons.jsx';
import { Lens, Shell } from '../components/Scene.jsx';

export default function Lobby() {
  useEffect(() => {
    document.title = `${site.name} · ${site.subtitle}`;
  }, []);

  return (
    <div className="stage t-white">
      <div className="cam">
        <div className="world" style={{ width: '100%' }}>
          <Shell />
          <div className="col lobby-col">
            <Sign />
          </div>
        </div>
      </div>
      <Lens />
    </div>
  );
}

// The wayfinding sign on the lobby wall.
function Sign() {
  return (
    <nav aria-label="Galleries" className="sign">
      <p className="sign-kicker">
        {site.name} · {site.subtitle}
      </p>
      <h1 className="sign-title">Galleries</h1>
      <div className="sign-rows">
        {roomList.map((r) => (
          <Link key={r.slug} to={`/room/${r.slug}`} className="signrow" tabIndex={-1} draggable="false">
            <Arrow rotate={r.arrow} color="#141414" />
            <Pictogram name={r.icon} />
            <span className="u signrow-name">{r.name}</span>
            <span className="signrow-room">Room {r.num}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
