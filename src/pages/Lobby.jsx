import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { roomList, site } from '../data/gallery.js';
import { Arrow, Pictogram } from '../components/Icons.jsx';
import { Lens, Shell } from '../components/Scene.jsx';

const readView = () => {
  try {
    return localStorage.getItem('lobby-view') === 'plan' ? 'plan' : 'sign';
  } catch {
    return 'sign';
  }
};

export default function Lobby() {
  const [view, setView] = useState(readView);
  useEffect(() => {
    document.title = `${site.name} · ${site.subtitle}`;
  }, []);
  const choose = (v) => {
    setView(v);
    try {
      localStorage.setItem('lobby-view', v);
    } catch {
      /* not remembered */
    }
  };

  return (
    <div className="stage t-white">
      <div className="cam">
        <div className="world" style={{ width: '100%' }}>
          <Shell />
          <div className="col lobby-col">
            {view === 'sign' ? <Sign /> : <Plan />}
            <div role="group" aria-label="Directory style" className="view-toggle">
              <button type="button" className="light-btn" aria-pressed={view === 'sign'} onClick={() => choose('sign')}>
                Directory
              </button>
              <button type="button" className="light-btn" aria-pressed={view === 'plan'} onClick={() => choose('plan')}>
                Floor plan
              </button>
            </div>
          </div>
        </div>
      </div>
      <Lens />
    </div>
  );
}

function Sign() {
  return (
    <nav aria-label="Galleries" className="sign">
      <p className="sign-kicker">
        {site.name} · {site.subtitle}
      </p>
      <h1 className="sign-title">Galleries</h1>
      <div className="sign-rows">
        {roomList.map((r) => (
          <Link key={r.slug} to={`/room/${r.slug}`} className="signrow">
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

function Plan() {
  const navigate = useNavigate();
  return (
    <div className="plan">
      <h1 className="sign-kicker">Floor plan</h1>
      <div className="plan-box">
        {roomList.map((r) => (
          <button key={r.slug} type="button" className="plan-room" onClick={() => navigate(`/room/${r.slug}`)}>
            <span aria-hidden="true" className="plan-works">
              {r.photos.map((p) => (
                <span key={p.id} style={{ width: p.portrait ? 12 : 20 }} />
              ))}
            </span>
            <span className="plan-label">
              <span aria-hidden="true" className="plan-num">{r.num}</span>
              <span className="plan-name">{r.name}</span>
            </span>
          </button>
        ))}
        <div aria-hidden="true" className="plan-lobby">Lobby</div>
        <div aria-hidden="true" className="plan-wall-l" />
        <div aria-hidden="true" className="plan-wall-r" />
      </div>
      <p aria-hidden="true" className="plan-here">
        <span />
        You are here
      </p>
    </div>
  );
}
