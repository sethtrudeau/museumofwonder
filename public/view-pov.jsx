/* ============================================================
 * view-pov.jsx — first-person POV inside a section
 *
 * Three render styles (Tweak: povStyle):
 *   'gallery'   — one-point perspective room, exhibits hung on walls
 *   'isometric' — isometric box, exhibits as labeled tiles
 *   'schematic' — flat elevation of one wall, salon hang with dimension lines
 *
 * All three iterate the same exhibits list. Density tweak changes spacing.
 * ============================================================ */

function POVView({ floor, section, onOpen, povStyle = 'gallery', density = 'comfortable', brandDecor = true }) {
  if (!floor || !section) return null;

  return (
    <div className="pov" data-screen-label={`F${floor.num} ${section.name}`} data-pov={povStyle} data-density={density}>
      <POVStyles/>

      {/* Top: section header */}
      <header className="pov__hd">
        <div className="pov__hd-left">
          <div className="mono upper pov__hd-eyebrow">
            Floor {String(floor.num).padStart(2, '0')} · {floor.name}
          </div>
          <h2 className="pov__hd-title">{section.name}</h2>
          <p className="pov__hd-sub">
            {section.exhibits.length} pieces · click a piece to read its wall label
          </p>
        </div>
        <div className="pov__hd-right mono upper">
          You&nbsp;are&nbsp;here
        </div>
      </header>

      {/* The room */}
      <div className="pov__stage">
        {povStyle === 'gallery'   && <GalleryPOV   section={section} floor={floor} density={density} onOpen={onOpen} brandDecor={brandDecor}/>}
        {povStyle === 'isometric' && <IsoPOV       section={section} floor={floor} density={density} onOpen={onOpen}/>}
        {povStyle === 'schematic' && <SchematicPOV section={section} floor={floor} density={density} onOpen={onOpen}/>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * helper — distribute exhibits across walls
 * Returns: { wall, x, y, w, h, exhibit } for back wall
 *      or  { wall, u, v, uw, vh, exhibit } for left/right walls
 *
 * Honors exhibit.wall if present; otherwise auto-fills back.
 * ───────────────────────────────────────────────────────── */
function layoutExhibits(exhibits, density) {
  const dense = density === 'dense';

  // Wall assignment: explicit wall value wins; remaining exhibits auto-fill
  // back (up to 6) → left (up to 3) → right (up to 3) by sort order.
  const VALID_WALLS = ['back', 'left', 'right'];
  const MAX = { back: 6, left: 3, right: 3 };
  const byWall = { back: [], left: [], right: [] };
  const autoQueue = [];

  for (const e of exhibits) {
    if (e.wall && VALID_WALLS.includes(e.wall)) {
      byWall[e.wall].push(e);
    } else {
      autoQueue.push(e);
    }
  }

  let qi = 0;
  for (const wall of VALID_WALLS) {
    while (byWall[wall].length < MAX[wall] && qi < autoQueue.length) {
      byWall[wall].push(autoQueue[qi++]);
    }
  }

  const slots = [];

  // BACK WALL salon-hang presets — coords are [x, y, w, h] in 0..1 of the wall area.
  const backPresets = {
    1: [[0.32, 0.22, 0.36, 0.50]],
    2: [
      [0.12, 0.18, 0.32, 0.52],
      [0.56, 0.22, 0.32, 0.48],
    ],
    3: [
      [0.08, 0.14, 0.26, 0.44],
      [0.38, 0.20, 0.24, 0.50],
      [0.66, 0.16, 0.26, 0.46],
    ],
    4: [
      [0.06, 0.14, 0.22, 0.34],
      [0.06, 0.50, 0.22, 0.28],
      [0.34, 0.16, 0.32, 0.56],
      [0.72, 0.18, 0.22, 0.50],
    ],
    5: [
      [0.04, 0.16, 0.20, 0.30],
      [0.04, 0.50, 0.20, 0.26],
      [0.28, 0.10, 0.26, 0.62],
      [0.58, 0.14, 0.18, 0.34],
      [0.58, 0.50, 0.20, 0.28],
    ],
    6: [
      [0.04, 0.10, 0.18, 0.28],
      [0.04, 0.44, 0.18, 0.30],
      [0.26, 0.16, 0.22, 0.52],
      [0.52, 0.12, 0.20, 0.30],
      [0.52, 0.46, 0.20, 0.28],
      [0.76, 0.18, 0.18, 0.50],
    ],
  };

  const back = backPresets[Math.min(byWall.back.length, 6)] || backPresets[6];
  byWall.back.forEach((exhibit, i) => {
    if (!back[i]) return;
    let [x, y, w, h] = back[i];
    if (dense) { x = x * 0.92 + 0.04; y = y * 0.92 + 0.04; w *= 0.85; h *= 0.85; }
    slots.push({ wall: 'back', x, y, w, h, exhibit });
  });

  // SIDE WALL presets — coords are [u, v, uw, vh] in 0..1 of the wall (u depth, v vertical)
  // u=0 → near viewer (large), u=1 → far against back wall (small).
  // Bias toward middle-far so pieces have decent size without being cut off.
  const sidePresets = {
    1: [[0.32, 0.20, 0.38, 0.58]],
    2: [
      [0.10, 0.22, 0.32, 0.54],
      [0.52, 0.22, 0.34, 0.54],
    ],
    3: [
      [0.06, 0.24, 0.22, 0.50],
      [0.34, 0.20, 0.24, 0.58],
      [0.66, 0.24, 0.24, 0.50],
    ],
  };

  ['left', 'right'].forEach((wall) => {
    const list = byWall[wall];
    const preset = sidePresets[Math.min(list.length, 3)] || sidePresets[3];
    list.slice(0, 3).forEach((exhibit, i) => {
      let [u, v, uw, vh] = preset[i];
      if (dense) { uw *= 0.85; vh *= 0.85; }
      slots.push({ wall, u, v, uw, vh, exhibit });
    });
  });

  return slots;
}

/* ═════════════════════════════════════════════════════════
 * STYLE 1 — GALLERY (one-point perspective room)
 * ═════════════════════════════════════════════════════════ */
function GalleryPOV({ section, floor, density, onOpen, brandDecor = true }) {
  // Geometry: viewBox 0..1200 × 0..680.
  // Vanishing point at (600, 340). Back wall is a centered rectangle.
  const W = 1200, H = 680;
  const BW_x1 = 320, BW_y1 = 120;
  const BW_x2 = 880, BW_y2 = 560;

  // Side wall projection — u: 0=near viewer, 1=at back wall. v: 0=top, 1=bottom.
  const sidePoint = (wall, u, v) => {
    let tx, bx;
    if (wall === 'left') {
      tx = u * BW_x1;
      bx = u * BW_x1;
    } else { // right
      tx = W - u * (W - BW_x2);
      bx = W - u * (W - BW_x2);
    }
    const ty = u * BW_y1;
    const by = H + u * (BW_y2 - H);
    return [tx + (bx - tx) * v, ty + (by - ty) * v];
  };

  const slots = layoutExhibits(section.exhibits, density);
  const backSlots  = slots.filter(s => s.wall === 'back');
  const sideSlots  = slots.filter(s => s.wall === 'left' || s.wall === 'right');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="pov-svg">
      <defs>
        <pattern id="pov-floor-pattern" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(-10)">
          <path d="M0 0 L40 0" stroke="var(--text4)" strokeWidth="0.5" opacity="0.3"/>
          <path d="M0 20 L40 20" stroke="var(--text4)" strokeWidth="0.5" opacity="0.3"/>
        </pattern>
        <pattern id="pov-wall-tex" patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="1" cy="1" r="0.3" fill="var(--text4)" opacity="0.15"/>
        </pattern>
      </defs>

      {/* CEILING */}
      <polygon
        points={`0,0 ${W},0 ${BW_x2},${BW_y1} ${BW_x1},${BW_y1}`}
        fill="var(--surface1)"
        stroke="var(--outline)" strokeWidth="1"/>

      {/* FLOOR */}
      <polygon
        points={`0,${H} ${W},${H} ${BW_x2},${BW_y2} ${BW_x1},${BW_y2}`}
        fill="var(--surface1)"
        stroke="var(--outline)" strokeWidth="1"/>
      <polygon
        points={`0,${H} ${W},${H} ${BW_x2},${BW_y2} ${BW_x1},${BW_y2}`}
        fill="url(#pov-floor-pattern)"/>

      {/* LEFT WALL trapezoid */}
      <polygon
        points={`0,0 ${BW_x1},${BW_y1} ${BW_x1},${BW_y2} 0,${H}`}
        fill="var(--surface2)"
        stroke="var(--outline)" strokeWidth="1"/>
      <polygon
        points={`0,0 ${BW_x1},${BW_y1} ${BW_x1},${BW_y2} 0,${H}`}
        fill="url(#pov-wall-tex)"/>

      {/* RIGHT WALL trapezoid */}
      <polygon
        points={`${W},0 ${BW_x2},${BW_y1} ${BW_x2},${BW_y2} ${W},${H}`}
        fill="var(--surface2)"
        stroke="var(--outline)" strokeWidth="1"/>
      <polygon
        points={`${W},0 ${BW_x2},${BW_y1} ${BW_x2},${BW_y2} ${W},${H}`}
        fill="url(#pov-wall-tex)"/>

      {/* BACK WALL */}
      <rect
        x={BW_x1} y={BW_y1}
        width={BW_x2 - BW_x1} height={BW_y2 - BW_y1}
        fill="var(--surface2)"
        stroke="var(--outline)" strokeWidth="1.25"/>
      <rect
        x={BW_x1} y={BW_y1}
        width={BW_x2 - BW_x1} height={BW_y2 - BW_y1}
        fill="url(#pov-wall-tex)"/>

      {/* Floor baseboard line on the back wall */}
      <line x1={BW_x1} y1={BW_y2} x2={BW_x2} y2={BW_y2} stroke="var(--outline)" strokeWidth="1.5"/>
      {/* Vanishing-point hairlines (subtle) */}
      <g stroke="var(--text4)" strokeWidth="0.5" opacity="0.4">
        <line x1="0" y1="0" x2={BW_x1} y2={BW_y1}/>
        <line x1={W} y1="0" x2={BW_x2} y2={BW_y1}/>
        <line x1="0" y1={H} x2={BW_x1} y2={BW_y2}/>
        <line x1={W} y1={H} x2={BW_x2} y2={BW_y2}/>
      </g>

      {/* Decorative brand shapes scattered on the floor / corners */}
      {brandDecor && (() => {
        const r = Brand.rng(section.id + '-povdecor');
        const spots = [
          [BW_x1 - 120, H - 90], [BW_x2 + 90, H - 70], [W / 2 + 30, H - 44],
        ];
        return spots.map((s, i) => {
          const type = Brand.FREE_TYPES[Math.floor(r() * Brand.FREE_TYPES.length)];
          const color = Brand.PALETTE[Math.floor(r() * Brand.PALETTE.length)];
          const size = 44 + r() * 40;
          return <g key={i} opacity="0.9"><BrandShape type={type} cx={s[0]} cy={s[1]} size={size} color={color} seed={section.id + i}/></g>;
        });
      })()}

      {/* SIDE WALL pieces — brand tiles clipped to the skewed wall plane */}
      {sideSlots.map((slot) => {
        const { wall, u, v, uw, vh, exhibit } = slot;
        const p00 = sidePoint(wall, u,      v);
        const p10 = sidePoint(wall, u + uw, v);
        const p11 = sidePoint(wall, u + uw, v + vh);
        const p01 = sidePoint(wall, u,      v + vh);
        const shadowDx = 2, shadowDy = 3;
        const labelX = (p01[0] + p11[0]) / 2;
        const labelY = (p01[1] + p11[1]) / 2 + 18;
        return (
          <g key={exhibit.id}
            className="pov-piece"
            onClick={() => onOpen(exhibit.id)}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(exhibit.id); } }}>
            {/* shadow */}
            <polygon
              points={`${p00[0]+shadowDx},${p00[1]+shadowDy} ${p10[0]+shadowDx},${p10[1]+shadowDy} ${p11[0]+shadowDx},${p11[1]+shadowDy} ${p01[0]+shadowDx},${p01[1]+shadowDy}`}
              fill="rgba(12,15,20,0.18)"/>
            {/* brand composition clipped to the skewed plane */}
            <BrandPoly points={[p00, p10, p11, p01]} seed={exhibit.id}/>
            {/* title below side-wall piece */}
            <text x={labelX} y={labelY}
              textAnchor="middle"
              className="pov-label pov-label--title">
              {exhibit.title.length > 18 ? exhibit.title.slice(0, 16) + '…' : exhibit.title}
            </text>
            {/* hover halo */}
            <polygon
              className="pov-piece__halo-poly"
              points={`${p00[0]-4},${p00[1]-4} ${p10[0]+4},${p10[1]-4} ${p11[0]+4},${p11[1]+4} ${p01[0]-4},${p01[1]+4}`}
              fill="none"/>
          </g>
        );
      })}

      {/* Pieces on back wall */}
      {backSlots.map((slot) => {
        const px = BW_x1 + slot.x * (BW_x2 - BW_x1);
        const py = BW_y1 + slot.y * (BW_y2 - BW_y1);
        const pw = slot.w * (BW_x2 - BW_x1);
        const ph = slot.h * (BW_y2 - BW_y1);
        return (
          <GalleryPiece key={slot.exhibit.id}
            x={px} y={py} w={pw} h={ph}
            exhibit={slot.exhibit}
            floorPalette={floor.palette}
            onOpen={onOpen}/>
        );
      })}

      {/* Bench in foreground — last, so it occludes the floor */}
      <g transform={`translate(${W/2 - 90}, ${H - 80})`}>
        <rect x="0" y="0" width="180" height="14" rx="2" fill="var(--ink)" opacity="0.85"/>
        <rect x="6" y="14" width="6" height="40" fill="var(--ink)" opacity="0.85"/>
        <rect x="168" y="14" width="6" height="40" fill="var(--ink)" opacity="0.85"/>
      </g>

      {/* Room name plaque on back wall */}
      <g transform={`translate(${(BW_x1 + BW_x2) / 2}, ${BW_y1 + 24})`}>
        <text textAnchor="middle" className="pov-room-plaque">
          — {section.name.toUpperCase()} —
        </text>
      </g>
    </svg>
  );
}

/* One framed exhibit, hung on the back wall — a Playlab brand tile. */
function GalleryPiece({ x, y, w, h, exhibit, floorPalette, onOpen }) {
  return (
    <g
      className="pov-piece"
      onClick={() => onOpen(exhibit.id)}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(exhibit.id); } }}>
      {/* Frame shadow underneath */}
      <rect
        x={x + 2} y={y + 3} width={w} height={h}
        fill="rgba(12,15,20,0.18)"/>

      {/* Brand composition inside the frame */}
      <BrandTile x={x} y={y} w={w} h={h} seed={exhibit.id}/>

      {/* Title below piece */}
      <foreignObject x={x} y={y + h + 6} width={w} height={36}>
        <div xmlns="http://www.w3.org/1999/xhtml" style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          lineHeight: 1.35,
          color: 'var(--text1)',
          overflow: 'hidden',
          maxHeight: '36px',
        }}>
          {exhibit.title}
        </div>
      </foreignObject>

      {/* Hover halo */}
      <rect
        className="pov-piece__halo"
        x={x - 4} y={y - 4} width={w + 8} height={h + 8}
        fill="none"/>
    </g>
  );
}

/* ═════════════════════════════════════════════════════════
 * STYLE 2 — ISOMETRIC (small isometric box, pieces as tiles)
 * ═════════════════════════════════════════════════════════ */
function IsoPOV({ section, floor, density, onOpen }) {
  // Iso projection helpers — true 30° iso.
  // World coords (x, y, z) → screen (sx, sy):
  //   sx = (x - y) * cos30
  //   sy = (x + y) * sin30 - z
  const cos30 = Math.cos(Math.PI / 6); // ~0.866
  const sin30 = Math.sin(Math.PI / 6); // 0.5

  // Pick room size and origin
  const RW = 9, RD = 6, RH = 4; // room width / depth / height (units)
  const U = 50;                  // unit length in px
  const cx = 600, cy = 340;       // canvas center

  // Map (x, y, z) where x: 0..RW (room width), y: 0..RD (depth), z: 0..RH (height)
  const project = (x, y, z) => ({
    sx: cx + (x - y) * cos30 * U,
    sy: cy + ((x + y) * sin30 * U) - z * U - 100,
  });

  // Four floor corners
  const f00 = project(0, 0, 0);
  const f10 = project(RW, 0, 0);
  const f11 = project(RW, RD, 0);
  const f01 = project(0, RD, 0);
  // Back wall corners (y = RD)
  const w00 = project(0, RD, 0);
  const w10 = project(RW, RD, 0);
  const w11 = project(RW, RD, RH);
  const w01 = project(0, RD, RH);
  // Left wall corners (x = 0)
  const l00 = project(0, 0, 0);
  const l01 = project(0, RD, 0);
  const l02 = project(0, RD, RH);
  const l03 = project(0, 0, RH);

  const slots = layoutExhibits(section.exhibits, density);

  return (
    <svg viewBox="0 0 1200 680" preserveAspectRatio="xMidYMid meet" className="pov-svg">
      {/* Floor */}
      <polygon
        points={`${f00.sx},${f00.sy} ${f10.sx},${f10.sy} ${f11.sx},${f11.sy} ${f01.sx},${f01.sy}`}
        fill="var(--surface1)" stroke="var(--outline)" strokeWidth="1.25"/>
      {/* floor hatch */}
      {Array.from({ length: 9 }).map((_, i) => {
        const a = project(i, 0, 0);
        const b = project(i, RD, 0);
        return <line key={i} x1={a.sx} y1={a.sy} x2={b.sx} y2={b.sy}
          stroke="var(--text4)" strokeWidth="0.5" opacity="0.4"/>;
      })}

      {/* Back wall */}
      <polygon
        points={`${w00.sx},${w00.sy} ${w10.sx},${w10.sy} ${w11.sx},${w11.sy} ${w01.sx},${w01.sy}`}
        fill="var(--surface2)" stroke="var(--outline)" strokeWidth="1.25"/>

      {/* Left wall */}
      <polygon
        points={`${l00.sx},${l00.sy} ${l01.sx},${l01.sy} ${l02.sx},${l02.sy} ${l03.sx},${l03.sy}`}
        fill="var(--surface1)" stroke="var(--outline)" strokeWidth="1.25" opacity="0.95"/>

      {/* Pieces on back wall — back wall spans across screen as a parallelogram.
          Map slot.x ∈ 0..1 to wall x ∈ 0..RW, slot.y ∈ 0..1 to z = (1-y)*RH (from top). */}
      {slots.filter(s => s.wall === 'back').map((slot, i) => {
        const wx = slot.x * RW;
        const ww = slot.w * RW;
        const wz_top = (1 - slot.y) * RH;
        const wz_bot = (1 - slot.y - slot.h) * RH;
        const p00 = project(wx,      RD, wz_top);
        const p10 = project(wx + ww, RD, wz_top);
        const p11 = project(wx + ww, RD, wz_bot);
        const p01 = project(wx,      RD, wz_bot);
        return (
          <g key={slot.exhibit.id}
            className="pov-piece"
            onClick={() => onOpen(slot.exhibit.id)}
            role="button" tabIndex={0}>
            <polygon
              points={`${p00.sx},${p00.sy} ${p10.sx},${p10.sy} ${p11.sx},${p11.sy} ${p01.sx},${p01.sy}`}
              fill={slot.exhibit.tint || 'var(--tan)'}
              stroke="var(--outline)" strokeWidth="1.25"/>
            {/* label number on the wall under the piece */}
            <text
              x={p01.sx + 6} y={p01.sy + 14}
              className="pov-label">
              {slot.exhibit.label}
            </text>
            <rect
              className="pov-piece__halo"
              x={Math.min(p00.sx, p01.sx) - 4}
              y={Math.min(p00.sy, p10.sy) - 4}
              width={Math.abs(p10.sx - p01.sx) + 8}
              height={Math.abs(p01.sy - p00.sy) + 8}
              fill="none"/>
          </g>
        );
      })}

      {/* Room name plaque */}
      <text x={cx} y={Math.min(w00.sy, w10.sy) - 18}
        textAnchor="middle"
        className="pov-room-plaque">
        — {section.name.toUpperCase()} —
      </text>

      {/* Compass + bench */}
      <g transform="translate(120, 580)">
        <circle r="20" fill="none" stroke="var(--text3)" strokeWidth="1"/>
        <text textAnchor="middle" y="-26" className="pov-tick">N</text>
        <text textAnchor="middle" y="6" className="pov-tick">↑</text>
      </g>
    </svg>
  );
}

/* ═════════════════════════════════════════════════════════
 * STYLE 3 — SCHEMATIC (flat wall elevation w/ dimension lines)
 * ═════════════════════════════════════════════════════════ */
function SchematicPOV({ section, floor, density, onOpen }) {
  // Flat 2D: one wall, hung salon-style with full annotations.
  const W = 1200, H = 600;
  const PAD_X = 80, PAD_Y = 70;
  const WALL_X = PAD_X, WALL_Y = PAD_Y;
  const WALL_W = W - PAD_X * 2;
  const WALL_H = H - PAD_Y * 2;

  const slots = layoutExhibits(section.exhibits, density)
    .filter(s => s.wall === 'back');

  return (
    <svg viewBox={`0 0 ${W} ${H + 60}`} preserveAspectRatio="xMidYMid meet" className="pov-svg">
      {/* Wall background */}
      <rect x={WALL_X} y={WALL_Y} width={WALL_W} height={WALL_H}
        fill="var(--surface2)" stroke="var(--outline)" strokeWidth="1.5"/>

      {/* baseboard hatch */}
      {Array.from({ length: Math.floor(WALL_W / 24) }).map((_, i) => (
        <line key={i}
          x1={WALL_X + 8 + i * 24} y1={WALL_Y + WALL_H + 1}
          x2={WALL_X + i * 24}     y2={WALL_Y + WALL_H + 16}
          stroke="var(--outline-quiet)" strokeWidth="0.75"/>
      ))}
      <line x1={WALL_X} y1={WALL_Y + WALL_H} x2={WALL_X + WALL_W} y2={WALL_Y + WALL_H}
        stroke="var(--outline)" strokeWidth="1.25"/>

      {/* Pieces */}
      {slots.map((slot, i) => {
        const px = WALL_X + slot.x * WALL_W;
        const py = WALL_Y + slot.y * WALL_H;
        const pw = slot.w * WALL_W;
        const ph = slot.h * WALL_H;
        return (
          <g key={slot.exhibit.id}
            className="pov-piece"
            onClick={() => onOpen(slot.exhibit.id)}
            role="button" tabIndex={0}>
            <rect x={px} y={py} width={pw} height={ph}
              fill={slot.exhibit.tint || 'var(--tan)'}
              stroke="var(--outline)" strokeWidth="1.5"/>
            <rect x={px + 4} y={py + 4} width={pw - 8} height={ph - 8}
              fill="none" stroke="var(--ink)" strokeWidth="0.4" opacity="0.5"/>
            {/* leader line to label */}
            <line x1={px + pw + 2} y1={py + ph / 2}
              x2={px + pw + 32}    y2={py + ph / 2}
              stroke="var(--ink)" strokeWidth="0.5"/>
            <circle cx={px + pw + 32} cy={py + ph / 2} r="2.5"
              fill="var(--ink)"/>
            <text x={px + pw + 40} y={py + ph / 2 + 4}
              className="pov-label pov-label--leader">
              {slot.exhibit.label} · {slot.exhibit.title.length > 26 ? slot.exhibit.title.slice(0, 24) + '…' : slot.exhibit.title}
            </text>
            <rect
              className="pov-piece__halo"
              x={px - 4} y={py - 4} width={pw + 8} height={ph + 8}
              fill="none"/>
          </g>
        );
      })}

      {/* title bar at top */}
      <text x={WALL_X} y={32} className="pov-schematic-title">
        {section.name.toUpperCase()}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
 * Styles for the POV stage
 * ───────────────────────────────────────────────────────── */
function POVStyles() {
  return (
    <style>{`
      .pov {
        position: absolute; inset: 0;
        padding: 88px 0 0;
        display: flex; flex-direction: column;
        background: transparent;
      }
      .pov__hd {
        padding: 8px 48px 16px;
        display: flex; align-items: flex-end; justify-content: space-between;
        gap: 24px;
        border-bottom: 1px solid var(--outline-quiet);
      }
      .pov__hd-eyebrow { font-size: 10px; color: var(--text3); margin-bottom: 6px; }
      .pov__hd-title {
        font-family: var(--font-editorial);
        font-size: 32px; font-weight: 500;
        line-height: 1.1; letter-spacing: -0.018em;
        color: var(--text1); margin: 0;
      }
      .pov__hd-sub {
        font-size: 12px; color: var(--text3);
        margin: 4px 0 0;
      }
      .pov__hd-right { font-size: 10px; color: var(--text3); }

      .pov__stage {
        flex: 1; min-height: 0;
        position: relative;
        padding: 16px 48px 56px;
        display: flex; align-items: center; justify-content: center;
      }
      .pov-svg {
        width: 100%; height: 100%;
        max-height: calc(100vh - 220px);
      }

      .pov-piece { cursor: pointer; outline: none; }
      .pov-piece__halo {
        stroke: transparent;
        stroke-width: 2;
        transition: stroke var(--dur-fast) var(--ease-fast);
      }
      .pov-piece:hover .pov-piece__halo { stroke: var(--ink); }
      .pov-piece:focus-visible .pov-piece__halo { stroke: var(--ink); }
      .pov-piece__halo-poly {
        stroke: transparent;
        stroke-width: 2;
        transition: stroke var(--dur-fast) var(--ease-fast);
        pointer-events: none;
      }
      .pov-piece:hover .pov-piece__halo-poly { stroke: var(--ink); }
      .pov-piece:hover { filter: brightness(1.04); }

      .pov-label {
        font-family: var(--font-mono);
        font-size: 11px;
        fill: var(--text2);
        letter-spacing: 0.06em; text-transform: uppercase;
      }
      .pov-label--title {
        font-family: var(--font-body);
        font-size: 11px;
        fill: var(--text1);
        text-transform: none;
        letter-spacing: 0;
      }
      .pov-label--leader {
        font-family: var(--font-body);
        font-size: 12px;
        fill: var(--text1);
        text-transform: none;
        letter-spacing: 0;
      }
      .pov-room-plaque {
        font-family: var(--font-mono);
        font-size: 12px;
        fill: var(--text2);
        letter-spacing: 0.18em;
      }
      .pov-tick {
        font-family: var(--font-mono);
        font-size: 10px;
        fill: var(--text3);
      }

      .pov-dim line { stroke: var(--text3); stroke-width: 0.75; }
      .pov-dim text {
        font-family: var(--font-mono);
        font-size: 10px;
        fill: var(--text3);
        letter-spacing: 0.06em;
      }
      .pov-ground {
        font-family: var(--font-mono);
        font-size: 10px;
        fill: var(--text3);
        letter-spacing: 0.06em;
      }
      .pov-schematic-title {
        font-family: var(--font-mono);
        font-size: 12px;
        fill: var(--text2);
        letter-spacing: 0.08em;
      }

      @media (max-width: 1080px) {
        .pov__hd { padding: 8px 24px 12px; }
        .pov__stage { padding: 8px 16px 40px; }
      }
    `}</style>
  );
}

window.POVView = POVView;
