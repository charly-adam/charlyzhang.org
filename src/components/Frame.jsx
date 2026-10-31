import { useEffect, useState } from 'react';
import { TrackLight } from './Icons.jsx';

// A framed, matted print hung on the wall: its own lamp, its beam and the light it throws on the
// wall (and, with the room dark, its glow), cast shadow, frame with real depth. Wall things stay out of the Tab order: you walk with
// the arrow keys and Enter walks up to what you're facing.
// `lit` means the camera is up close on it: its lamp stays on and the full-size image loads in.
export function Frame({ photo, lit, onOpen }) {
  const [src, setSrc] = useState(photo.wall);
  useEffect(() => {
    if (!lit || src === photo.file) return undefined;
    let live = true;
    const im = new Image();
    im.src = photo.file;
    im.decode().then(() => live && setSrc(photo.file), () => {});
    return () => {
      live = false;
    };
  }, [lit, src, photo.file]);

  return (
    <div className={lit ? 'fw lit' : 'fw'} style={{ '--i': photo.index }}>
      <TrackLight />
      <div className="glow" aria-hidden="true" />
      <div className="pool" aria-hidden="true" />
      <div className="beam" aria-hidden="true" />
      <div className="fshadow" aria-hidden="true" />
      <button type="button" className="frame" data-photo={photo.id} tabIndex={-1} onClick={onOpen} aria-label={`View ${photo.title}`}>
        <img
          className={photo.portrait ? 'imgP' : 'imgL'}
          src={src}
          alt={photo.title}
          width={photo.width}
          height={photo.height}
          decoding="async"
          draggable="false"
        />
        <span className="side sl" aria-hidden="true" />
        <span className="side sr" aria-hidden="true" />
        <span className="side st" aria-hidden="true" />
        <span className="side sb" aria-hidden="true" />
      </button>
    </div>
  );
}

// Mirror copy of a frame for the floor reflection (no interaction).
export function FrameReflection({ photo }) {
  return (
    <span className="fw" style={{ display: 'block' }}>
      <span className="pool" />
      <span className="frame">
        <img className={photo.portrait ? 'imgP' : 'imgL'} src={photo.wall} alt="" width={photo.width} height={photo.height} decoding="async" />
      </span>
    </span>
  );
}

// "Title, year" and "place · camera", skipping whatever hasn't been filled in.
export const titleLine = (p) => [p.title, p.year].filter(Boolean).join(', ');
export const metaLine = (p) => [p.place, p.camera].filter(Boolean).join(' · ');

// Small wall label printed beside a group of photos; clicking it walks up to the photo.
export function WallLabel({ group, artist, onZoom }) {
  const names = group.map((p) => p.title).join(' and ');
  return (
    <button type="button" className="label ink lblpos" tabIndex={-1} onClick={onZoom} aria-label={`View ${names}`}>
      <span className="lt lbl-artist">{artist}</span>
      {group.map((p) => (
        <span key={p.id} className="lbl-entry">
          <span className="lt lbl-title">{titleLine(p)}</span>
          <span className="ink2 lbl-meta">{metaLine(p)}</span>
        </span>
      ))}
    </button>
  );
}
