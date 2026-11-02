import { useEffect, useState } from 'react';
import { TrackLight } from './Icons.jsx';

// A framed, matted print hung on the wall: its own lamp, its beam and the light it throws on the
// wall (and, with the room dark, its glow), cast shadow, frame with real depth. The frame
// itself is flat, so the print and its glass paint with it as one surface; its edges, turned
// back to the wall, stand beside it. Wall things stay out of the Tab order: you walk with
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
      <svg className="beam" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="beam-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fffbf1" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#fffbf1" stopOpacity="0.45" />
            <stop offset="0.72" stopColor="#fffbf1" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fffbf1" stopOpacity="0" />
          </linearGradient>
          <filter id="beam-b" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <path d="M50 0 L100 100 L0 100 Z" fill="url(#beam-g)" filter="url(#beam-b)" />
      </svg>
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
      </button>
      <span className="side sl" aria-hidden="true" />
      <span className="side sr" aria-hidden="true" />
      <span className="side st" aria-hidden="true" />
      <span className="side sb" aria-hidden="true" />
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

// "Title, year" and "place · camera · lens · film", skipping whatever hasn't been filled in.
export const titleLine = (p) => [p.title, p.year].filter(Boolean).join(', ');
export const metaLine = (p) => [p.place, p.camera, p.lens, p.film].filter(Boolean).join(' · ');

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
