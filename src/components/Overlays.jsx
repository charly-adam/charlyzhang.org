import { useEffect, useRef } from 'react';
import { site } from '../data/gallery.js';
import { metaLine, titleLine } from './Frame.jsx';

function useDialog(onClose, keys) {
  const first = useRef(null);
  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (keys && keys[e.key]) {
        e.preventDefault();
        keys[e.key]();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, keys]);
  return first;
}

// Close-up of a wall label (or the room introduction), legible.
export function LabelZoom({ room, group, onClose, onView }) {
  const closeRef = useDialog(onClose);
  const title = group ? `Label for ${group.map((p) => p.title).join(' and ')}` : `Introduction to ${room.name}`;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="zoom-backdrop" onClick={onClose}>
      <div className="zoom-card" onClick={(e) => e.stopPropagation()}>
        {group ? (
          <>
            <p className="zoom-artist">{site.name}</p>
            {group.map((p) => (
              <div key={p.id} className="zoom-entry">
                <p className="zoom-title">{titleLine(p)}</p>
                {metaLine(p) && <p className="zoom-meta">{metaLine(p)}</p>}
                {p.note && <p className="zoom-note">{p.note}</p>}
                <button type="button" className="light-btn zoom-view" onClick={() => onView(p)}>
                  View photo
                </button>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="zoom-room">
              Room {room.num}:
              <br />
              {room.name}
            </p>
            <p className="zoom-namebox">{site.name}</p>
            <p className="zoom-note zoom-lead">{room.blurb}</p>
            {room.intro && <p className="zoom-note">{room.intro}</p>}
          </>
        )}
        <button ref={closeRef} type="button" className="light-btn zoom-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

// Full-screen view of one photo with previous / next.
export function PhotoView({ room, photo, onClose, onGo }) {
  const i = room.photos.findIndex((p) => p.id === photo.id);
  const prev = i > 0 ? room.photos[i - 1] : null;
  const next = i < room.photos.length - 1 ? room.photos[i + 1] : null;
  const keys = useRef({});
  keys.current.ArrowLeft = () => prev && onGo(prev);
  keys.current.ArrowRight = () => next && onGo(next);
  const closeRef = useDialog(onClose, keys.current);
  return (
    <div role="dialog" aria-modal="true" aria-label={photo.title} className="photo-backdrop" onClick={onClose}>
      <button ref={closeRef} type="button" className="dark-btn photo-close" onClick={onClose}>
        Close
      </button>
      <div className="photo-body" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.file}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          className={photo.portrait ? 'photo-img portrait' : 'photo-img'}
        />
        <aside className="photo-side">
          <p className="photo-title">{titleLine(photo)}</p>
          {metaLine(photo) && <p className="photo-meta">{metaLine(photo)}</p>}
          <p className="photo-count" aria-live="polite">
            {i + 1} / {room.photos.length}
          </p>
          <div className="photo-nav">
            <button type="button" className="dark-btn" disabled={!prev} onClick={() => prev && onGo(prev)}>
              Previous
            </button>
            <button type="button" className="dark-btn" disabled={!next} onClick={() => next && onGo(next)}>
              Next
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
