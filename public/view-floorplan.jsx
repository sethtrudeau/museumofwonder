/* ============================================================
 * view-floorplan.jsx — top-down architect's plan of one floor
 *
 * Renders a 24×14 grid as the floor. Each section is a labeled
 * rectangle. Click → enters POV. Hover shows tally of exhibits.
 *
 * mapStyle affects accents but not the fundamental layout (the user
 * picked "side elevation for floors, top-down for floorplans" — top-down
 * stays top-down everywhere).
 * ============================================================ */

function FloorplanView({ floor, currentSectionId, onPick, mapStyle = 'elevation', showLabels = true, brandDecor = true }) {
  if (!floor) return null;

  // floor.sections are positioned in a 24×14 grid (units 0..24 × 0..14)
  const GRID_W = 24;
  const GRID_H = 14;

  return (
    <div className="fpv" data-screen-label={`F${String(floor.num).padStart(2, '0')} Floorplan`} data-style={mapStyle}>
      <FloorplanStyles/>

      {/* Left rail — floor metadata */}
      <aside className="fpv__meta">
        <div className="mono upper fpv__eyebrow">Floor {String(floor.num).padStart(2, '0')} · floorplan</div>
        <h2 className="fpv__title">{floor.name}</h2>
        <p className="fpv__subtitle">{floor.subtitle}</p>

        <dl className="fpv__stats">
          <div><dt className="mono upper">Rooms</dt><dd>{floor.sections.length}</dd></div>
          <div><dt className="mono upper">Pieces</dt><dd>{floor.sections.reduce((n, s) => n + s.exhibits.length, 0)}</dd></div>
          <div><dt className="mono upper">Status</dt><dd>{floor.status}</dd></div>
        </dl>

        <ol className="fpv__rooms" aria-label="Rooms on this floor">
          {floor.sections.map((s) => (
            <li key={s.id}>
              <button
                className={`fpv-roomrow ${s.id === currentSectionId ? 'is-current' : ''}`}
                onClick={() => onPick(s.id)}>
                <span className="fpv-roomrow__dot" style={{ background: floor.palette }}/>
                <span className="fpv-roomrow__name">{s.name}</span>
                <span className="fpv-roomrow__count mono">{s.exhibits.length}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="mono upper fpv__hint">↘ Tap a room on the plan to enter</div>
      </aside>

      {/* Right — the plan itself */}
      <figure className="fpv__plan">
        <svg
          viewBox={`-1 -1 ${GRID_W + 2} ${GRID_H + 3}`}
          className="fpv-svg"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Top-down plan of ${floor.name}`}>

          <defs>
            {/* Light dotted grid */}
            <pattern id="fpv-grid" width="1" height="1" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="0.04" fill="var(--text4)" opacity="0.4"/>
            </pattern>
          </defs>

          {/* outer envelope of the floor */}
          <rect x="0" y="0" width={GRID_W} height={GRID_H}
            fill="var(--surface2)"
            stroke="var(--outline)" strokeWidth="0.08"/>

          <rect x="0" y="0" width={GRID_W} height={GRID_H}
            fill="url(#fpv-grid)"/>

          {/* compass + scale bar */}
          <g transform="translate(0.6, 0.6)" className="fpv-compass">
            <circle r="0.6" fill="none" stroke="var(--text3)" strokeWidth="0.04"/>
            <line x1="0" y1="-0.55" x2="0" y2="0.55" stroke="var(--text3)" strokeWidth="0.04"/>
            <line x1="-0.55" y1="0" x2="0.55" y2="0" stroke="var(--text3)" strokeWidth="0.04"/>
            <text x="0" y="-0.7" textAnchor="middle" className="fpv-compass__t">N</text>
          </g>

          {/* sections */}
          {floor.sections.map((s) => (
            <Room key={s.id}
              section={s}
              palette={floor.palette}
              isCurrent={s.id === currentSectionId}
              onPick={() => onPick(s.id)}
              showLabels={showLabels}
              brandDecor={brandDecor}
            />
          ))}

          {/* Entry marker — south wall, midpoint */}
          <g transform={`translate(${GRID_W / 2}, ${GRID_H + 0.55})`}>
            <rect x="-1.6" y="-0.18" width="3.2" height="0.42" fill="var(--background)"/>
            <text y="0.1" textAnchor="middle" className="fpv-entry">YOU ARE HERE · ENTRY</text>
            <polygon points={`0,${-0.55} ${-0.18},${-0.25} ${0.18},${-0.25}`} fill="var(--ink)"/>
          </g>
        </svg>

      </figure>
    </div>
  );
}

/* ── one room rendered as a (possibly irregular) polygon ── */
function Room({ section, palette, isCurrent, onPick, showLabels, brandDecor }) {
  const { x, y, w, h, exhibits, name, shape } = section;
  const hasShape = !!shape?.path;
  const pad = 0.18;

  // Dot positions: use shape.dots if provided, else fall back to grid layout in rect
  let dotPositions = [];
  if (shape?.dots && shape.dots.length >= exhibits.length) {
    dotPositions = shape.dots.slice(0, exhibits.length);
  } else {
    const cols = Math.min(exhibits.length, Math.max(2, Math.floor(w * 0.5)));
    const rows = Math.ceil(exhibits.length / cols);
    dotPositions = exhibits.map((_, i) => {
      const ci = i % cols;
      const ri = Math.floor(i / cols);
      return {
        x: x + pad + 0.5 + (w - pad * 2 - 1.0) * (cols > 1 ? ci / (cols - 1) : 0.5),
        y: y + pad + 0.6 + (rows > 1 ? (h - pad * 2 - 1.4) * (ri / (rows - 1)) : (h - pad * 2 - 0.4) / 2),
      };
    });
  }

  const labelX = shape?.label?.x ?? (x + pad + 0.4);
  const labelY = shape?.label?.y ?? (y + pad + 0.5);
  const labelAnchor = shape?.label?.anchor || 'start';

  // brand color + watermark motif for this room (stable per section)
  const roomColor = Brand.pick(section.id);
  const wmRand = Brand.rng(section.id + '-wm');
  const wmType = Brand.FREE_TYPES[Math.floor(wmRand() * Brand.FREE_TYPES.length)];
  const wmCx = x + w * (0.62 + wmRand() * 0.18);
  const wmCy = y + h * (0.5 + wmRand() * 0.2);
  const wmSize = Math.min(w, h) * 1.05;
  const clipId = `room-clip-${section.id}`;

  return (
    <g
      className={`fpv-room ${isCurrent ? 'is-current' : ''}`}
      style={{ '--room-tint': roomColor }}
      onClick={onPick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(); } }}
      aria-label={`${name}, ${exhibits.length} exhibits`}>

      <defs>
        <clipPath id={clipId}>
          {hasShape
            ? <path d={shape.path}/>
            : <rect x={x + pad} y={y + pad} width={w - pad * 2} height={h - pad * 2} rx="0.08"/>}
        </clipPath>
      </defs>

      {/* room fill — either custom path or rounded rect */}
      {hasShape ? (
        <path d={shape.path} className="fpv-room__fill"/>
      ) : (
        <rect
          x={x + pad} y={y + pad}
          width={w - pad * 2} height={h - pad * 2}
          className="fpv-room__fill"
          rx="0.08"/>
      )}

      {/* brand watermark motif — clipped to the room, sits behind dots/label */}
      {brandDecor && !isCurrent && (
        <g clipPath={`url(#${clipId})`} className="fpv-room__wm">
          <BrandShape type={wmType} cx={wmCx} cy={wmCy} size={wmSize} color={roomColor} seed={section.id}/>
        </g>
      )}

      {/* room name */}
      {showLabels && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <text className="fpv-room__name" textAnchor={labelAnchor}>{name}</text>
          <text y="0.55" className="fpv-room__meta" textAnchor={labelAnchor}>
            {exhibits.length} {exhibits.length === 1 ? 'piece' : 'pieces'}
            {exhibits.some(e => e.isStub) ? ' · in preparation' : ''}
          </text>
        </g>
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────────────────
 * Styles
 * ───────────────────────────────────────────────────────── */
function FloorplanStyles() {
  return (
    <style>{`
      .fpv {
        position: absolute; inset: 0;
        padding: 88px 48px 32px;
        display: grid;
        grid-template-columns: minmax(240px, 320px) 1fr;
        gap: 32px;
        background: transparent;
      }
      .fpv__meta { align-self: start; padding-top: 56px; }
      .fpv__eyebrow { font-size: 11px; color: var(--text3); margin-bottom: 12px; }
      .fpv__title {
        font-family: var(--font-editorial);
        font-weight: 500; font-size: 38px;
        line-height: 1.05; letter-spacing: -0.018em;
        color: var(--text1);
        margin: 0 0 6px;
      }
      .fpv__subtitle {
        font-size: 13px; line-height: 1.5;
        color: var(--text2); margin: 0 0 24px;
      }
      .fpv__stats {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 12px 0;
        margin: 0 0 24px;
        border-top: 1px solid var(--outline);
        border-bottom: 1px solid var(--outline);
      }
      .fpv__stats > div { display: flex; flex-direction: column; gap: 4px; }
      .fpv__stats dt { font-size: 9px; color: var(--text3); margin: 0; }
      .fpv__stats dd { font-size: 16px; font-weight: 600; color: var(--ink); margin: 0; }

      .fpv__rooms { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 1px; }
      .fpv-roomrow {
        width: 100%;
        display: grid;
        grid-template-columns: 12px 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 8px 6px;
        background: none; border: none;
        border-radius: var(--r-control);
        text-align: left; cursor: pointer;
        font: inherit; color: var(--text1);
        transition: background-color var(--dur-fast) var(--ease-fast);
      }
      .fpv-roomrow:hover { background: var(--surface1); }
      .fpv-roomrow.is-current { background: var(--highlighter); color: var(--on-highlighter); }
      .fpv-roomrow__dot { width: 10px; height: 10px; border-radius: 999px; border: 1px solid var(--outline); }
      .fpv-roomrow__name { font-size: 13px; font-weight: 500; }
      .fpv-roomrow__count {
        font-size: 11px; color: var(--text3);
        letter-spacing: 0.06em;
      }
      .fpv-roomrow.is-current .fpv-roomrow__count { color: var(--on-highlighter); opacity: 0.7; }

      .fpv__hint { font-size: 10px; color: var(--text3); }

      /* the plan */
      .fpv__plan {
        margin: 0;
        display: flex; flex-direction: column;
        align-items: stretch;
        min-height: 0;
      }
      .fpv-svg {
        width: 100%; height: 100%;
        max-height: 76vh;
      }
      .fpv__caption {
        font-size: 10px; color: var(--text3);
        text-align: center;
        padding-top: 8px;
      }

      .fpv-compass__t {
        font-family: var(--font-mono);
        font-size: 0.34px;
        fill: var(--text3);
      }
      .fpv-dim__t {
        font-family: var(--font-mono);
        font-size: 0.34px;
        fill: var(--text4);
        letter-spacing: 0.04em;
      }
      .fpv-entry {
        font-family: var(--font-mono);
        font-size: 0.28px;
        fill: var(--text3);
        letter-spacing: 0.06em;
      }

      .fpv-room { cursor: pointer; outline: none; }
      .fpv-room__fill {
        fill: var(--room-tint, var(--surface1));
        fill-opacity: 0.16;
        stroke: var(--outline);
        stroke-width: 0.05;
        transition: fill-opacity var(--dur-medium) var(--ease-medium), stroke var(--dur-fast) var(--ease-fast);
      }
      .fpv-room:hover .fpv-room__fill { fill-opacity: 0.28; stroke-width: 0.09; }
      .fpv-room.is-current .fpv-room__fill {
        fill: var(--highlighter);
        fill-opacity: 1;
        stroke: var(--on-highlighter); stroke-width: 0.09;
      }
      .fpv-room__wm {
        opacity: 0.5;
        transition: opacity var(--dur-fast) var(--ease-fast);
        pointer-events: none;
      }
      .fpv-room:hover .fpv-room__wm { opacity: 0.72; }
      .fpv-room__name {
        font-family: var(--font-body);
        font-size: 0.42px;
        font-weight: 600;
        fill: var(--ink);
        letter-spacing: -0.005em;
      }
      .fpv-room__meta {
        font-family: var(--font-mono);
        font-size: 0.28px;
        fill: var(--text3);
        letter-spacing: 0.04em;
      }
      .fpv-room.is-current .fpv-room__name,
      .fpv-room.is-current .fpv-room__meta { fill: var(--on-highlighter); }
      .fpv-room__dot {
        fill: var(--background);
        stroke: var(--ink);
        stroke-width: 0.04;
        transition: fill var(--dur-fast) var(--ease-fast);
      }
      .fpv-room:hover .fpv-room__dot { fill: var(--surface2); }
      .fpv-room.is-current .fpv-room__dot { fill: var(--on-highlighter); }
      .fpv-room__dotnum {
        font-family: var(--font-mono);
        font-size: 0.2px;
        fill: var(--ink);
        text-anchor: middle;
      }
      .fpv-room.is-current .fpv-room__dotnum { fill: var(--highlighter); }
      .fpv-room__enter {
        font-family: var(--font-mono);
        font-size: 0.26px;
        fill: var(--ink);
        letter-spacing: 0.06em; text-transform: uppercase;
        opacity: 0;
        transition: opacity var(--dur-fast) var(--ease-fast);
      }
      .fpv-room:hover .fpv-room__enter { opacity: 1; }
      .fpv-room.is-current .fpv-room__enter { opacity: 1; fill: var(--on-highlighter); }

      @media (max-width: 1080px) {
        .fpv { grid-template-columns: 1fr; padding: 80px 24px 24px; gap: 16px; }
      }
    `}</style>
  );
}

window.FloorplanView = FloorplanView;
