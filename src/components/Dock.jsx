import { useContext } from 'react';
import { site } from '../data/gallery.js';
import { MapContext, MapThumb } from './GalleryMap.jsx';

// A folded gallery brochure poking up from the bottom edge, wherever you are: it rises a little
// when you point at it, and clicked, it comes up and unfolds into the gallery map.
export default function Dock() {
  const openMap = useContext(MapContext);
  return (
    <nav aria-label="Galleries" className="dock">
      <button type="button" className="brochure" aria-haspopup="dialog" aria-label="Open the gallery map" onClick={(e) => openMap('dock', e.currentTarget)}>
        <span className="brochure-leaf" aria-hidden="true" />
        <span className="brochure-cover" aria-hidden="true">
          <span className="brochure-kicker">{site.name}</span>
          <span className="brochure-title">Gallery map</span>
          <MapThumb />
        </span>
      </button>
    </nav>
  );
}
