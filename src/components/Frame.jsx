import { useEffect, useState } from 'react';

// A framed, matted print hung on the wall: light pool, cast shadow, frame with real depth.
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
    <div className={lit ? 'fw lit' : 'fw'}>
      <div className="pool" aria-hidden="true" />
      <div className="fshadow" aria-hidden="true" />
      <button type="button" className="frame" data-photo={photo.id} onClick={onOpen} aria-label={`View ${photo.title}`}>
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

// Small wall label printed beside a group of photos.
export function WallLabel({ group, artist, onZoom }) {
  const names = group.map((p) => p.title).join(' and ');
  return (
    <button type="button" className="label ink lblpos" onClick={onZoom} aria-label={`Read label for ${names}`}>
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
