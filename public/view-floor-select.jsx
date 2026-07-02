/* ============================================================
 * view-floor-select.jsx — the building, seen from outside
 *
 * Side elevation cross-section of the 6 floors stacked vertically.
 * Click a floor (in the cutaway OR in the directory list) to enter.
 *
 * mapStyle:
 *   'elevation'  → straight side cross-section (default)
 *   'isometric'  → cutaway is tilted, looks layered/3D
 *   'schematic'  → architect's plan with dimension lines and call-outs
 * ============================================================ */

function FloorSelectView({ floors, currentFloorId, onPick, mapStyle = 'elevation', brandDecor = true }) {
  // Building drawn top-down in markup but visually top floor first; floors[5] is the top.
  const reversed = [...floors].slice().reverse();

  return (
    <div className="fsv" data-screen-label="00 Building" data-style={mapStyle}>
      <FloorSelectStyles/>

      {brandDecor && (
        <div className="fsv__decor" aria-hidden="true">
          <BrandScatter seed="floor-select" width={1440} height={900} count={9}
            opacity={0.9} minSize={40} maxSize={130}
            avoid={{ x: 60, y: 120, w: 560, h: 520 }}/>
        </div>
      )}

      <div className="fsv__intro">
        <div className="mono upper fsv__eyebrow">Floor directory · 6 floors</div>
        <h1 className="fsv__title">
          A museum about<br/>
          <em>what teachers and students are making</em><br/>
          with Playlab.
        </h1>
        <p className="fsv__lede">
          Six floors, open every day. The Atrium is on the ground floor. The Lab is on the roof.
          Pick a floor to enter — you can change your mind from the directory at any time.
        </p>
        <div className="fsv__hint mono upper">↘ Click any floor to enter</div>
      </div>

      <div className="fsv__main">
        {/* The building cross-section, centered */}
        <figure className={`fsv__building fsv__building--${mapStyle}`}>
          <BuildingCutaway
            floors={reversed}
            currentFloorId={currentFloorId}
            onPick={onPick}
            mapStyle={mapStyle}
          />
        </figure>
      </div>

      <footer className="fsv__footer mono upper">
        <span>The Museum of Wonder</span>
        <span>· Drawn by the curators, 2026</span>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * Building cross-section — 6 stacked floors with sections
 * ───────────────────────────────────────────────────────── */
function BuildingCutaway({ floors, currentFloorId, onPick, mapStyle }) {
  // SVG canvas — 480 wide × per-floor. Each floor is 100 tall, with a 10px gap.
  const W = 480;
  const FLOOR_H = 96;
  const GAP = 12;
  const ROOF_H = 18;
  const GROUND_H = 16;
  const totalH = ROOF_H + floors.length * FLOOR_H + (floors.length - 1) * GAP + GROUND_H;

  return (
    <svg
      viewBox={`0 0 ${W} ${totalH}`}
      className="fsv-svg"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Cross-section of the Museum of Wonder">

      {/* roof — pitched line only, no label */}
      <g transform="translate(40, 0)">
        <polygon
          points={`0,${ROOF_H} ${W - 80},${ROOF_H} ${W - 100},0 20,0`}
          fill="var(--surface1)" stroke="var(--outline)" strokeWidth="1.25"
        />
      </g>

      {/* floors */}
      {floors.map((f, i) => {
        const y = ROOF_H + i * (FLOOR_H + GAP);
        return (
          <BuildingFloor
            key={f.id}
            floor={f}
            x={40} y={y}
            w={W - 80} h={FLOOR_H}
            isCurrent={f.id === currentFloorId}
            onPick={() => onPick(f.id)}
          />
        );
      })}

      {/* ground line + hatching only, no label */}
      <g transform={`translate(0, ${ROOF_H + floors.length * (FLOOR_H + GAP) - GAP})`}>
        <line x1="20" y1="0" x2={W - 20} y2="0" stroke="var(--outline)" strokeWidth="1.5"/>
        {Array.from({ length: 22 }).map((_, j) => (
          <line key={j}
            x1={28 + j * 20} y1="2"
            x2={20 + j * 20} y2={GROUND_H - 2}
            stroke="var(--outline-quiet)" strokeWidth="0.75"/>
        ))}
      </g>
    </svg>
  );
}

/* ── A single floor inside the cutaway SVG ── */
function BuildingFloor({ floor, x, y, w, h, isCurrent, onPick }) {
  const padX = 8;
  const padY = 6;
  const isEmpty = floor.sections.length === 0 ||
    floor.sections.every(s => s.exhibits.filter(e => !e.isIntro).length === 0);

  return (
    <g
      className={`fsv-floor ${isCurrent ? 'is-current' : ''}`}
      transform={`translate(${x}, ${y})`}
      onClick={onPick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(); } }}
      aria-label={`Floor ${floor.num}: ${floor.name}`}>

      {/* floor slab */}
      <rect width={w} height={h}
        className="fsv-floor__slab"
        rx="1"/>

      {/* tinted band along top — floor's palette */}
      <rect width={w} height="8"
        fill={floor.palette}
        opacity="0.5"/>

      {/* floor number — big numeral on the left */}
      <text
        x={padX + 4} y={h - padY - 2}
        className="fsv-floor__num">
        {String(floor.num).padStart(2, '0')}
      </text>

      {/* name */}
      <text
        x={70} y={padY + 22}
        className="fsv-floor__name">
        {floor.name}
      </text>
      <text
        x={70} y={padY + 38}
        className="fsv-floor__sub">
        {floor.subtitle}
      </text>

      {/* status pill on the right */}
      <g transform={`translate(${w - padX - 6}, ${padY + 6})`} textAnchor="end">
        <text className="fsv-floor__status">
          {isEmpty
            ? '◌ opening soon'
            : floor.status === 'open' ? '◉ open'
            : floor.status === 'rotating' ? '◐ rotating'
            : '◯ in progress'}
        </text>
      </g>

      {/* "Exhibit opening soon" label for floors with no content yet */}
      {isEmpty && (
        <text x={70} y={padY + 56} className="fsv-floor__soon">
          Exhibit opening soon
        </text>
      )}

      {/* enter call-to-action that appears on hover via CSS */}
      <text x={w - padX - 6} y={h - padY - 4} textAnchor="end" className="fsv-floor__enter">
        Enter →
      </text>
    </g>
  );
}

/* ─────────────────────────────────────────────────────────
 * Styles, scoped to the floor select view
 * ───────────────────────────────────────────────────────── */
function FloorSelectStyles() {
  return (
    <style>{`
      .fsv {
        position: absolute; inset: 0;
        padding: 80px 48px 32px;
        display: grid;
        grid-template-columns: minmax(280px, 420px) 1fr;
        grid-template-rows: 1fr auto;
        gap: 24px 64px;
        background: transparent;
      }
      .fsv__decor {
        position: absolute; inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .fsv__decor .brand-scatter { width: 100%; height: 100%; }
      .fsv__intro { grid-column: 1; grid-row: 1; align-self: center; position: relative; z-index: 1; }
      .fsv__main  { grid-column: 2; grid-row: 1; display: flex; align-items: stretch; justify-content: center; min-height: 0; position: relative; z-index: 1; }
      .fsv__footer { grid-column: 1 / -1; grid-row: 2; position: relative; z-index: 1; }

      .fsv__eyebrow { font-size: 11px; color: var(--text3); margin-bottom: 16px; }
      .fsv__title {
        font-family: var(--font-editorial);
        font-weight: 500;
        font-size: clamp(32px, 3.4vw, 50px);
        line-height: 1.04;
        letter-spacing: -0.024em;
        color: var(--text1);
        margin: 0 0 16px;
      }
      .fsv__title em { font-style: italic; color: var(--text2); font-weight: 400; }
      .fsv__lede {
        font-size: 15px; line-height: 1.55; color: var(--text2);
        max-width: 36ch;
        margin: 0 0 24px;
      }
      .fsv__hint {
        font-size: 10px; color: var(--text3);
        padding-top: 12px;
        border-top: 1px solid var(--outline-quiet);
        max-width: 36ch;
      }

      /* ── building cutaway ── */
      .fsv__building {
        margin: 0; min-height: 0;
        display: flex; align-items: stretch; justify-content: center;
        width: 100%;
      }
      .fsv-svg {
        width: auto; height: 100%;
        max-height: 78vh;
        max-width: 100%;
      }
      .fsv__building--isometric .fsv-svg {
        transform: rotateX(8deg) rotateZ(-6deg) skewY(-3deg);
        transform-origin: center center;
        transition: transform 360ms var(--ease-slow);
      }
      .fsv__building--schematic .fsv-svg { filter: contrast(1.05); }

      .fsv-dim { stroke: var(--text4); stroke-width: 0.75; }
      .fsv-dim__t {
        font-family: var(--font-mono);
        font-size: 9px; fill: var(--text4);
        letter-spacing: 0.06em; text-transform: uppercase;
      }

      .fsv-floor { cursor: pointer; outline: none; }
      .fsv-floor__slab {
        fill: var(--surface2);
        stroke: var(--outline);
        stroke-width: 1.25;
        transition: fill var(--dur-medium) var(--ease-medium);
      }
      .fsv-floor:hover .fsv-floor__slab { fill: var(--surface1); }
      .fsv-floor.is-current .fsv-floor__slab {
        fill: var(--highlighter);
        stroke: var(--on-highlighter);
      }
      .fsv-floor__num {
        font-family: var(--font-editorial);
        font-size: 38px;
        font-weight: 600;
        fill: var(--ink);
        dominant-baseline: alphabetic;
      }
      .fsv-floor.is-current .fsv-floor__num { fill: var(--on-highlighter); }
      .fsv-floor__name {
        font-family: var(--font-body);
        font-size: 15px; font-weight: 600;
        fill: var(--ink); letter-spacing: -0.005em;
      }
      .fsv-floor__sub {
        font-family: var(--font-body);
        font-size: 11px;
        fill: var(--text2);
      }
      .fsv-floor.is-current .fsv-floor__name,
      .fsv-floor.is-current .fsv-floor__sub { fill: var(--on-highlighter); }
      .fsv-floor__status {
        font-family: var(--font-mono);
        font-size: 9px;
        fill: var(--text3);
        letter-spacing: 0.06em; text-transform: uppercase;
      }
      .fsv-floor.is-current .fsv-floor__status { fill: var(--on-highlighter); }
      .fsv-floor__soon {
        font-family: var(--font-mono);
        font-size: 10px;
        fill: var(--text3);
        letter-spacing: 0.06em; text-transform: uppercase;
        font-style: italic;
      }
      .fsv-floor.is-current .fsv-floor__soon { fill: var(--on-highlighter); }
      .fsv-floor__enter {
        font-family: var(--font-mono);
        font-size: 10px;
        fill: var(--ink);
        letter-spacing: 0.06em; text-transform: uppercase;
        opacity: 0;
        transition: opacity var(--dur-fast) var(--ease-fast);
      }
      .fsv-floor:hover .fsv-floor__enter { opacity: 1; }
      .fsv-floor.is-current .fsv-floor__enter { opacity: 1; fill: var(--on-highlighter); }

      /* ── footer ── */
      .fsv__footer {
        display: flex; gap: 12px;
        font-size: 10px; color: var(--text3);
        padding-top: 12px;
        border-top: 1px solid var(--outline-quiet);
      }

      @media (max-width: 1080px) {
        .fsv { grid-template-columns: 1fr; padding: 76px 24px 24px; }
        .fsv__intro, .fsv__main { grid-column: 1; }
        .fsv__intro { grid-row: 1; }
        .fsv__main { grid-row: 2; }
      }
    `}</style>
  );
}

window.FloorSelectView = FloorSelectView;
