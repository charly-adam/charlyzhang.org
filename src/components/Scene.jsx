// The architectural shell shared by the lobby and the rooms: ceiling, back wall,
// floor in perspective, plus flat stand-ins used on phones.
export function Shell({ door = false, ends = false, track = false, children }) {
  return (
    <>
      <div className="plane ceil3d" aria-hidden="true">{track && <div className="track3d" />}</div>
      <div className={`plane backwall${door ? ' hasdoor' : ''}`} aria-hidden="true" />
      {ends && <div className="plane endwall endL" aria-hidden="true" />}
      {ends && <div className="plane endwall endR" aria-hidden="true" />}
      {children}
      <div className="plane floor3d" aria-hidden="true" />
      <div className="plane flatonly flat-ceil" aria-hidden="true" />
      <div className="plane flatonly flat-floor" aria-hidden="true" />
    </>
  );
}

// Lens effects laid over the rendered scene.
export function Lens() {
  return (
    <>
      <div className="dof-t" aria-hidden="true" />
      <div className="dof-b" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
