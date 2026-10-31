const ICONS = {
  landscape: 'M2.5 19.5 9 10l4 5.5 3-3.5 5.5 7.5Z M15.5 6.5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  city: 'M3 21V10h5v11 M8 21V4h7v17 M15 21v-8h6v8 M2 21h20 M10.5 8h2 M10.5 12h2 M10.5 16h2',
  person: 'M8.5 7.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0 M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7',
  detail: 'M4 10a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M14.5 14.5 20.5 20.5',
  bench: 'M4 7h16v4.5H4Z M2.5 14.5h19 M6 11.5v8 M18 11.5v8',
};

export function Pictogram({ name }) {
  return (
    <span aria-hidden="true" className="pictogram">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4f3f0" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
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

export function Home() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 11 12 4l8.5 7M6 9.5V20h4.5v-5.5h3V20H18V9.5" />
    </svg>
  );
}

export function Chevron({ dir = 1 }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
