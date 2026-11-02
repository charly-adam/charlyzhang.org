import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import Dock from './components/Dock.jsx';
import { GalleryMap, MapContext } from './components/GalleryMap.jsx';
import Lobby from './pages/Lobby.jsx';
import Room from './pages/Room.jsx';

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
  // Walking somewhere from the map: it's gone to black; it stays, black, until the new page is
  // up behind it with its own curtain down (the router changes page a moment after asked, and
  // closing the map first would show the page you're leaving), then it goes.
  const going = useRef(null);
  const go = (to) => {
    going.current = to;
    navigate(to);
  };
  useEffect(() => {
    if (going.current && going.current === pathname) {
      going.current = null;
      setMap(null);
    }
  }, [pathname]);
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
        {map && <GalleryMap here={here} onClose={closeMap} onGo={go} />}
      </div>
    </MapContext.Provider>
  );
}
