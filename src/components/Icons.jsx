const ICONS = {
  landscape: 'M2.5 19.5 9 10l4 5.5 3-3.5 5.5 7.5Z M15.5 6.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  city: 'M3 21V10h5v11 M8 21V4h7v17 M15 21v-8h6v8 M2 21h20 M10.5 8h2 M10.5 12h2 M10.5 16h2',
  person: 'M8.5 7.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0 M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7',
  detail: 'M4 10a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M14.5 14.5 20.5 20.5',
  bench: 'M4 7h16v4.5H4Z M2.5 14.5h19 M6 11.5v8 M18 11.5v8',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z',
  bird: 'M3.5 13.5c3 .3 5.2-1.4 6.5-4C11.3 6.8 13.2 5.5 15.6 5.5c2.2 0 3.9 1.3 4.9 3.3l-2.6.6c-.4 4.2-3.6 7.4-8.4 7.6l-3.6 3.2 1-3.6c-1.8-.6-3-1.6-3.4-3.1Z M15.8 8.4h.01',
  globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M3 12h18 M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9 M12 3c-2.4 2.5-3.6 5.5-3.6 9s1.2 6.5 3.6 9',
  car: 'M3 15.5v-3l2.5-5h13l2.5 5v3Z M3.5 15.5V18h3v-2.5 M17.5 15.5V18h3v-2.5 M7 12.5h.01 M17 12.5h.01',
  film: 'M4.5 3.5h15v17h-15Z M8.5 3.5v17 M15.5 3.5v17 M4.5 7.5h4 M4.5 11.5h4 M4.5 15.5h4 M15.5 7.5h4 M15.5 11.5h4 M15.5 15.5h4',
};

export function Pictogram({ name, size = 24, className = 'pictogram', color = '#f4f3f0' }) {
  return (
    <span aria-hidden="true" className={className}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
        <path d={ICONS[name] || ICONS.detail} />
      </svg>
    </span>
  );
}

export function Arrow({ rotate = 0, size = 32, color = 'currentColor' }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="square">
      <g transform={`rotate(${rotate} 12 12)`}>
        <path d="M4 12h15M13 6l6 6-6 6" />
      </g>
    </svg>
  );
}

export function Chevron({ dir = 1, size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir > 0 ? 'M9 5l7 7-7 7' : 'M15 5l-7 7 7 7'} />
    </svg>
  );
}

// A track can seen from the floor: it hangs in front of the wall and aims down and back at the
// work below it, so you see its rear cap and body, with the light spilling out of the far end.
export function TrackLight() {
  return (
    <svg className="can" aria-hidden="true" viewBox="0 0 30 46">
      <defs>
        <radialGradient id="can-spill" cx="50%" cy="0%" r="100%">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#fffaf0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="13.5" y="0" width="3" height="9" fill="#151515" />
      <path d="M6.5 21V9.5h17V21" fill="none" stroke="#151515" strokeWidth="2" />
      <rect x="8.5" y="13" width="13" height="21" rx="1.5" fill="#1c1c1c" />
      <rect x="8.5" y="13" width="3" height="21" fill="#353535" />
      <ellipse cx="15" cy="13.5" rx="6.5" ry="2.4" fill="#2e2e2e" />
      <ellipse className="can-glow" cx="15" cy="35" rx="9" ry="5" fill="url(#can-spill)" />
      <path className="can-glow" d="M8.8 33.6q6.2 2.4 12.4 0" fill="none" stroke="#fffaf0" strokeWidth="1.2" />
    </svg>
  );
}
