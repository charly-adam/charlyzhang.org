import { Link, useLocation } from 'react-router';
import { roomList, site } from '../data/gallery.js';

export default function Header() {
  const { pathname } = useLocation();
  const current = pathname.startsWith('/room/') ? pathname.split('/')[2] : '';
  const tab = (active) => ({ 'aria-current': active ? 'page' : undefined, className: 'tab' });
  return (
    <header className="site-header">
      <Link to="/" className="brand walltext-btn">
        <span className="u">{site.name}</span>
        <span className="brand-sub">{site.subtitle}</span>
      </Link>
      <nav aria-label="Rooms" className="tabs">
        <Link to="/" {...tab(!current)}>Galleries</Link>
        {roomList.map((r) => (
          <Link key={r.slug} to={`/room/${r.slug}`} {...tab(current === r.slug)}>
            {r.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
