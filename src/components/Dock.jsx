import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { roomList } from '../data/gallery.js';
import { Home } from './Icons.jsx';

// Glass dock floating at the bottom: a home button that opens sideways into the rooms.
export default function Dock() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = pathname.startsWith('/room/') ? pathname.split('/')[2] : '';

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const links = [
    { to: '/', name: 'Lobby', active: pathname === '/' },
    ...roomList.map((r) => ({ to: `/room/${r.slug}`, name: r.name, active: current === r.slug })),
  ];
  const half = Math.ceil(links.length / 2);
  const side = (list, cls) => (
    <div className={`dock-side ${cls}`} inert={!open}>
      <div>
        {list.map((l) => (
          <Link key={l.to} to={l.to} className="dock-link" aria-current={l.active ? 'page' : undefined} onClick={() => setOpen(false)}>
            {l.name}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <nav ref={ref} aria-label="Galleries" className={open ? 'dock open' : 'dock'}>
      {side(links.slice(0, half), 'dock-l')}
      <button type="button" className="dock-home" aria-expanded={open} aria-label={open ? 'Close the room list' : 'Open the room list'} onClick={() => setOpen((o) => !o)}>
        <Home />
      </button>
      {side(links.slice(half), 'dock-r')}
    </nav>
  );
}
