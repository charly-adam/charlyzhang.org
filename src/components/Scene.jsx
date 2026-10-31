// The architectural shell shared by the lobby and the rooms: ceiling, back wall and floor in
// perspective. Each surface carries a `.shade` that darkens it when the room's lights go out.
export function Shell({ door = false, ends = false, track = false, children }) {
  return (
    <>
      <div className="plane ceil3d" aria-hidden="true">
        {track && <div className="track3d" />}
        <div className="shade" />
      </div>
      <div className={`plane backwall${door ? ' hasdoor' : ''}`} aria-hidden="true">
        <div className="shade" />
      </div>
      {ends && (
        <div className="plane endwall endL" aria-hidden="true">
          <div className="shade" />
        </div>
      )}
      {ends && (
        <div className="plane endwall endR" aria-hidden="true">
          <div className="shade" />
        </div>
      )}
      {children}
      <div className="plane floor3d" aria-hidden="true">
        <div className="shade" />
      </div>
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
