// The lobby's shell: ceiling, back wall and floor in perspective. (A room is built from its own
// planes in RoomBox.jsx.)
export function Shell({ children }) {
  return (
    <>
      <div className="plane ceil3d" aria-hidden="true">
        <div className="shade" />
      </div>
      <div className="plane backwall" aria-hidden="true">
        <div className="shade" />
      </div>
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

// Black over the page until it's ready to be seen: while it loads, where you're going and how far
// along it is (the line fills; it only shows if loading takes a moment).
export function Curtain({ kicker, name, progress }) {
  return (
    <div className="curtain" aria-hidden="true">
      <div className="loader">
        <p className="loader-kicker">{kicker}</p>
        <p className="loader-name">{name}</p>
        <span className="loader-bar">
          <span style={{ transform: `scaleX(${progress.toFixed(3)})` }} />
        </span>
      </div>
    </div>
  );
}
