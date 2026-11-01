import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import Dock from './components/Dock.jsx';
import { GalleryMap, MapContext } from './components/GalleryMap.jsx';
import Lobby from './pages/Lobby.jsx';
import Room from './pages/Room.jsx';

// --k: the room's scale against a 900 px tall desktop view, for the few things sized in pixels
// (the lobby sign). Everything else is sized from --S in CSS.
function useRoomScale() {
  useLayoutEffect(() => {
    const set = () => {
      const S = Math.min(window.innerHeight, window.innerWidth / 1.6);
      document.documentElement.style.setProperty('--k', (S / 900).toFixed(4));
    };
    set();
    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);
}

// A gallery, not a document: no context menu, nothing to drag out.
function useNoBrowserMenus() {
  useEffect(() => {
    const stop = (e) => e.preventDefault();
    document.addEventListener('contextmenu', stop);
    document.addEventListener('dragstart', stop);
    return () => {
      document.removeEventListener('contextmenu', stop);
      document.removeEventListener('dragstart', stop);
    };
  }, []);
}

export default function App() {
  useRoomScale();
  useNoBrowserMenus();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const here = pathname.startsWith('/room/') ? pathname.split('/')[2] : null;
  const [map, setMap] = useState(null); // { from, opener } while the map is out
  const openMap = useCallback((from, opener) => setMap({ from, opener }), []);
  const closeMap = () => {
    const opener = map?.opener;
    setMap(null);
    opener?.focus({ preventScroll: true });
  };
  const go = (to) => {
    setMap(null);
    navigate(to);
  };
  return (
    <MapContext.Provider value={openMap}>
      <div className="app">
        <main className="main">
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/room/:slug" element={<Room />} />
            <Route path="/room/:slug/:photoId" element={<Room />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Dock />
        {map && <GalleryMap from={map.from} here={here} onClose={closeMap} onGo={go} />}
      </div>
    </MapContext.Provider>
  );
}
