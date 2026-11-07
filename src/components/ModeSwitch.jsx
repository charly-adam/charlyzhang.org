import { useLocation, useNavigate } from 'react-router';
import { getRoom } from '../data/gallery.js';
import { allPhotoCount } from '../pages/Collage.jsx';
import { setViewMode } from '../viewMode.js';

// At the top of a room, either way you're seeing it: Gallery (walk round it) | Collage (every
// photo on one wall). The choice is remembered for the next room. Swapping replaces the page in
// the history, so Back still goes to wherever you came from. Up close on a photo it's away; on
// the All photos wall it's just the wall's name.
export default function ModeSwitch() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (pathname === '/collage') {
    return (
      <div className="modeswitch cui">
        <p className="mode-title">
          All photos <span className="mode-count">{allPhotoCount}</span>
        </p>
      </div>
    );
  }
  const m = pathname.match(/^\/room\/([^/]+)(\/collage)?\/?$/);
  const room = m && getRoom(m[1]);
  if (!room) return null;
  const collage = !!m[2];
  const go = (mode) => {
    setViewMode(mode);
    if ((mode === 'collage') !== collage) navigate(mode === 'collage' ? `/room/${room.slug}/collage` : `/room/${room.slug}`, { replace: true });
  };
  return (
    <div className="modeswitch cui" role="group" aria-label={`How to see ${room.name}`}>
      <button type="button" className="mode-btn" aria-pressed={!collage} onClick={() => go('gallery')}>
        Gallery
      </button>
      <button type="button" className="mode-btn" aria-pressed={collage} onClick={() => go('collage')}>
        Collage
      </button>
    </div>
  );
}
