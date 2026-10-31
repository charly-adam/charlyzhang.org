import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { getRoom, nextRoom, site, themes } from '../data/gallery.js';
import { Arrow, Chevron, TrackLight } from '../components/Icons.jsx';
import { Frame, FrameReflection, WallLabel, metaLine, titleLine } from '../components/Frame.jsx';
import { LabelZoom, PhotoView } from '../components/Overlays.jsx';
import { Lens, Shell } from '../components/Scene.jsx';
import { useWallCamera } from '../hooks/useWallCamera.js';
import { useDolly } from '../hooks/useDolly.js';

// Phones get the flat wall and a full-screen photo view instead of walking up to the photo.
const FLAT = window.matchMedia('(max-width: 700px)');
const onFlat = (cb) => {
  FLAT.addEventListener('change', cb);
  return () => FLAT.removeEventListener('change', cb);
};
const useFlat = () => useSyncExternalStore(onFlat, () => FLAT.matches);

export default function RoomRoute() {
  const { slug } = useParams();
  const room = getRoom(slug);
  if (!room) return <Navigate to="/" replace />;
  return <Room room={room} />;
}

function Room({ room }) {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(null); // null | 'intro' | group index
  const stageRef = useRef(null);
  const camRef = useRef(null);
  const worldRef = useRef(null);
  const dollyRef = useRef(null);
  const closeRef = useRef(null);
  const printRef = useRef(null);
  const theme = themes[room.theme];
  const next = nextRoom(room);
  const opened = room.photos.find((p) => p.id === photoId);
  const flat = useFlat();
  const near = !flat && opened ? opened : null; // the photo the camera has walked up to
  const nearIndex = near ? room.photos.indexOf(near) : -1;
  const prevPhoto = nearIndex > 0 ? room.photos[nearIndex - 1] : null;
  const nextPhoto = nearIndex >= 0 && nearIndex < room.photos.length - 1 ? room.photos[nearIndex + 1] : null;

  const { stepPrev, stepNext, getX, stopFor, jumpTo } = useWallCamera({
    stageRef,
    camRef,
    worldRef,
    resetKey: room.slug,
    paused: !!opened || zoom !== null,
  });
  useDolly({ stageRef, dollyRef, worldRef, printRef, targetId: near?.id ?? null, resetKey: room.slug, getX, stopFor, jumpTo });

  useEffect(() => {
    document.title = `${room.name} · ${site.name}`;
    setZoom(null);
  }, [room]);

  const open = (p) => {
    setZoom(null);
    navigate(`/room/${room.slug}/${p.id}`);
  };
  const closePhoto = useCallback(() => navigate(`/room/${room.slug}`), [navigate, room.slug]);
  const closeZoom = useCallback(() => setZoom(null), []);

  // up close: Escape steps back, the arrow keys walk to the previous / next photo
  const isNear = !!near;
  useEffect(() => {
    if (isNear) closeRef.current?.focus({ preventScroll: true });
  }, [isNear]);
  useEffect(() => {
    if (!near) return undefined;
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'Escape') closePhoto();
      else if (e.key === 'ArrowLeft' && prevPhoto) open(prevPhoto);
      else if (e.key === 'ArrowRight' && nextPhoto) open(nextPhoto);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <div ref={stageRef} className={`stage t-${room.theme}${near ? ' dark' : ''}`} role="region" aria-label={`${room.name}. Scroll, drag or use the arrow keys to walk along the wall.`}>
        <div ref={dollyRef} className="dolly">
          <div ref={camRef} className="cam">
            <div ref={worldRef} className="world">
              <Shell door ends track={room.theme !== 'white'}>
                {/* floor reflection: the wall mirrored below the floor line */}
                <div className="plane refl" aria-hidden="true">
                  <div className="refl-row">
                    <span className="intro-w" />
                    {room.groups.map((g, gi) => (
                      <span key={gi} className="gpad refl-col">
                        <span className="ggap refl-frames">
                          {g.map((p) => <FrameReflection key={p.id} photo={p} />)}
                        </span>
                        <span className="lblpos" />
                      </span>
                    ))}
                    <span className="end-w refl-end">
                      <span className="door" style={{ background: theme.wall }} />
                    </span>
                  </div>
                </div>
              </Shell>

              <section className="col ink intro-w intro" data-stop="">
                <div className="intro-inner">
                  <p className="intro-room">
                    Room {room.num}:
                    <br />
                    {room.name}
                  </p>
                  <p className="namebox" style={{ background: theme.boxBg, color: theme.boxFg }}>{site.name}</p>
                  <button type="button" className="panel ink" onClick={() => setZoom('intro')} aria-label={`Read the introduction to ${room.name}`}>
                    <span className="lt">
                      {room.blurb}
                      {room.intro ? ` ${room.intro}` : ''}
                    </span>
                  </button>
                </div>
              </section>

              {room.groups.map((g, gi) => (
                <div key={gi} className={g.includes(near) ? 'col gpad lit' : 'col gpad'} data-stop="">
                  <TrackLight />
                  <div className="ggap p3 frames">
                    {g.map((p) => <Frame key={p.id} photo={p} lit={p === near} onOpen={() => open(p)} />)}
                  </div>
                  <WallLabel group={g} artist={site.name} onZoom={() => setZoom(gi)} />
                </div>
              ))}

              <section className="col ink end-w end" data-stop="">
                <div className="passage" aria-hidden="true">
                  <div className="pfloor" />
                  <div className="ptop" />
                  <div className="pjl" />
                  <div className="pjr" />
                  <div className="pback" style={{ background: themes[next.theme].wall }}>
                    <div className="pback-shade" />
                    <div className="pback-frame"><div /></div>
                  </div>
                </div>
                <Link to={`/room/${next.slug}`} className="doorbtn walltext-btn ink">
                  <span className="door-sign">
                    <Arrow size={22} />
                    <span>
                      <span className="door-room">Room {next.num}</span>
                      <span className="u door-name">{next.name}</span>
                    </span>
                  </span>
                  <span className="door" aria-hidden="true" />
                </Link>
              </section>
            </div>
          </div>
        </div>
        {near && (
          <div key={near.id} ref={printRef} className="print" aria-hidden="true">
            <span className="frame">
              <img className={near.portrait ? 'imgP' : 'imgL'} src={near.file} alt="" width={near.width} height={near.height} />
            </span>
          </div>
        )}
        <Lens />
        {near && (
          <div className="closeup">
            <button type="button" className="closeup-hit" tabIndex={-1} aria-hidden="true" onClick={closePhoto} />
            <div className="closeup-cap" aria-live="polite">
              <p className="closeup-title">{titleLine(near)}</p>
              {metaLine(near) && <p className="closeup-meta">{metaLine(near)}</p>}
              {near.note && <p className="closeup-note">{near.note}</p>}
              <p className="closeup-count">
                {nearIndex + 1} / {room.photos.length}
              </p>
            </div>
            <button ref={closeRef} type="button" className="dark-btn closeup-close" onClick={closePhoto}>
              Step back
            </button>
          </div>
        )}
        <div className="stepnav">
          <button type="button" className="stepbtn" disabled={near && !prevPhoto} onClick={near ? () => prevPhoto && open(prevPhoto) : stepPrev} aria-label="Previous photo">
            <Chevron dir={-1} />
          </button>
          <button type="button" className="stepbtn" disabled={near && !nextPhoto} onClick={near ? () => nextPhoto && open(nextPhoto) : stepNext} aria-label="Next photo">
            <Chevron dir={1} />
          </button>
        </div>
      </div>

      {zoom !== null && (
        <LabelZoom
          room={room}
          group={zoom === 'intro' ? null : room.groups[zoom]}
          onClose={closeZoom}
          onView={open}
        />
      )}
      {opened && flat && <PhotoView room={room} photo={opened} onClose={closePhoto} onGo={open} />}
    </>
  );
}
