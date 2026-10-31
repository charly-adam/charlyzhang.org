import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { getRoom, nextRoom, site, themes } from '../data/gallery.js';
import { Arrow, Chevron } from '../components/Icons.jsx';
import { Frame, FrameReflection, WallLabel } from '../components/Frame.jsx';
import { Lens, Shell } from '../components/Scene.jsx';
import { useWallCamera } from '../hooks/useWallCamera.js';
import { useDolly } from '../hooks/useDolly.js';

export default function RoomRoute() {
  const { slug } = useParams();
  const room = getRoom(slug);
  if (!room) return <Navigate to="/" replace />;
  return <Room room={room} />;
}

function Room({ room }) {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const [atIntro, setAtIntro] = useState(false);
  const stageRef = useRef(null);
  const dollyRef = useRef(null);
  const camRef = useRef(null);
  const worldRef = useRef(null);
  const theme = themes[room.theme];
  const next = nextRoom(room);

  // What the camera has walked up to: a photo (in the URL), the room's introduction, or nothing.
  const near = room.photos.find((p) => p.id === photoId) || null;
  const focus = near ? near.id : atIntro ? 'intro' : null;
  const nearIndex = near ? room.photos.indexOf(near) : -1;
  // lamps switch off (and back on) in a ripple outward from the photo you walked up to
  const litGroup = useRef(0);
  if (near) litGroup.current = room.groups.findIndex((g) => g.includes(near));
  const prevPhoto = nearIndex > 0 ? room.photos[nearIndex - 1] : null;
  const nextPhoto = near ? room.photos[nearIndex + 1] || null : atIntro ? room.photos[0] : null;

  const { stepPrev, stepNext, getX, stopFor, jumpTo } = useWallCamera({
    stageRef,
    camRef,
    worldRef,
    resetKey: room.slug,
    paused: !!focus,
  });

  // a photo is framed with its wall label beside it
  const resolve = useCallback((id) => {
    const w = worldRef.current;
    if (id === 'intro') return [w?.querySelector('.intro-inner')];
    const frame = w?.querySelector(`[data-photo="${id}"]`);
    return [frame, frame?.closest('[data-stop]').querySelector('.label')];
  }, []);
  // walking up to a photo waits a moment for the other lights to go out first
  const leadIn = useCallback((id) => (id === 'intro' ? 0 : 420), []);
  useDolly({ stageRef, dollyRef, worldRef, targetId: focus, resolve, leadIn, resetKey: room.slug, getX, stopFor, jumpTo });

  useEffect(() => {
    document.title = `${room.name} · ${site.name}`;
    setAtIntro(false);
  }, [room]);

  const open = (p) => {
    setAtIntro(false);
    navigate(`/room/${room.slug}/${p.id}`);
  };
  const stepBack = useCallback(() => {
    setAtIntro(false);
    if (photoId) navigate(`/room/${room.slug}`);
  }, [navigate, room.slug, photoId]);
  const toggleIntro = () => {
    if (atIntro) return stepBack();
    if (photoId) navigate(`/room/${room.slug}`);
    setAtIntro(true);
  };

  // Moving from one photo to the next up close, its lamp clicks on as the camera arrives.
  const prevNear = useRef(null);
  const switching = !!near && !!prevNear.current && prevNear.current !== near;
  useEffect(() => {
    prevNear.current = near;
  });

  const exit = next ? `/room/${next.slug}` : '/';

  // Enter walks up to whatever you're facing; up close, Escape steps back and the arrow keys move
  // to the previous / next photo
  const facing = () => {
    const center = getX() + stageRef.current.clientWidth / 2;
    let best = null;
    worldRef.current.querySelectorAll('[data-stop]').forEach((col) => {
      const d = Math.abs(col.offsetLeft + col.offsetWidth / 2 - center);
      if (!best || d < best.d) best = { col, d };
    });
    return best?.col;
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (!focus) {
        if ((e.key !== 'Enter' && e.key !== ' ') || e.target.closest?.('button, a')) return;
        const col = facing();
        const id = col?.querySelector('.frame')?.dataset.photo;
        if (id) open(room.photos.find((p) => p.id === id));
        else if (col?.querySelector('.intro-inner')) toggleIntro();
        else if (col?.querySelector('.doorbtn')) navigate(exit);
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape') stepBack();
      else if (e.key === 'ArrowLeft' && prevPhoto) open(prevPhoto);
      else if (e.key === 'ArrowRight' && nextPhoto) open(nextPhoto);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // up close, a click anywhere but on the wall's own things steps back
  const onStageClick = (e) => {
    if (focus && !e.target.closest('.frame, .label, .intro-inner, .doorbtn, .stepnav')) stepBack();
  };

  const stageClass = `stage t-${room.theme}${focus ? ' near' : ''}${near ? ' dark' : ''}`;

  return (
    <div ref={stageRef} className={stageClass} style={{ '--on': switching ? '0.85s' : '0s' }} onClick={onStageClick} role="region" aria-label={`${room.name}. Scroll, drag or use the arrow keys to walk along the wall.`}>
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
              <button type="button" className="intro-inner" tabIndex={-1} onClick={toggleIntro} aria-label={`Read the introduction to ${room.name}`}>
                <span className="intro-room">
                  Room {room.num}:
                  <br />
                  {room.name}
                </span>
                <span className="intro-name">{site.name}</span>
                <span className="intro-text">
                  {room.blurb}
                  {room.intro ? ` ${room.intro}` : ''}
                </span>
              </button>
            </section>

            {room.groups.map((g, gi) => (
              <div key={gi} className={g.includes(near) ? 'col gpad lit' : 'col gpad'} data-stop="" style={{ '--off': `${Math.abs(gi - litGroup.current) * 70}ms` }}>
                <div className="ggap p3 frames">
                  {g.map((p) => (
                    <Frame key={p.id} photo={p} lit={p === near} onOpen={() => (p === near ? stepBack() : open(p))} />
                  ))}
                </div>
                <WallLabel group={g} artist={site.name} onZoom={() => (g.includes(near) ? stepBack() : open(g[0]))} />
              </div>
            ))}

            <section className="col ink end-w end" data-stop="">
              <div className="passage" aria-hidden="true">
                <div className="pfloor" />
                <div className="ptop" />
                <div className="pjl" />
                <div className="pjr" />
                <div className="pback" style={{ background: themes[next ? next.theme : 'white'].wall }}>
                  <div className="pback-shade" />
                  {next && <div className="pback-frame"><div /></div>}
                </div>
              </div>
              <Link to={exit} className="doorbtn walltext-btn ink" tabIndex={-1} draggable="false">
                <span className="door-sign">
                  <Arrow />
                  <span>
                    <span className="door-room">{next ? `Room ${next.num}` : 'Exit'}</span>
                    <span className="u door-name">{next ? next.name : 'Lobby'}</span>
                  </span>
                </span>
                <span className="door" aria-hidden="true" />
              </Link>
            </section>
          </div>
        </div>
      </div>
      <Lens />
      <div className="stepnav">
        <button type="button" className="stepbtn glass" disabled={!!focus && !prevPhoto} onClick={focus ? () => prevPhoto && open(prevPhoto) : stepPrev} aria-label="Previous photo">
          <Chevron dir={-1} />
        </button>
        <button type="button" className="stepbtn glass" disabled={!!focus && !nextPhoto} onClick={focus ? () => nextPhoto && open(nextPhoto) : stepNext} aria-label="Next photo">
          <Chevron dir={1} />
        </button>
      </div>
    </div>
  );
}
