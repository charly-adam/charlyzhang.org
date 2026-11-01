import { useContext } from 'react';
import { MapContext } from './GalleryMap.jsx';
import { Home } from './Icons.jsx';

// The glass home button floating at the bottom: it brings out the gallery map, wherever you are.
export default function Dock() {
  const openMap = useContext(MapContext);
  return (
    <nav aria-label="Galleries" className="dock">
      <button type="button" className="dock-home" aria-haspopup="dialog" aria-label="Open the gallery map" onClick={(e) => openMap('dock', e.currentTarget)}>
        <Home />
      </button>
    </nav>
  );
}
