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
