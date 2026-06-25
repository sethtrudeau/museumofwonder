/* ============================================================
 * view-brand-shapes.jsx — Playlab brand shape + pattern kit
 *
 * The Playlab visual language: bold flat color, organic blobs,
 * jagged starbursts, pixel creatures, polka-dot and diagonal-stripe
 * fills, chains of circles, wedges, and clusters of thin bars — each
 * either free-floating or clipped inside a solid color box, lightly
 * rotated, sitting on a faint grid.
 *
 * Everything here renders as SVG fragments so it composes inside the
 * existing gallery / floorplan / floor-select SVGs. Exposed on window.Brand.
 * ============================================================ */

/* ── deterministic RNG ── */
function hashStr(s) {
  s = String(s);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rng(seed) { return mulberry32(typeof seed === 'string' ? hashStr(seed) : (seed | 0)); }

/* ── palette (matches the brand references) ── */
const PALETTE = [
  '#356fe5', // blue
  '#569aff', // mid blue
  '#00832d', // green
  '#c8ff3d', // chartreuse
  '#df3737', // red
  '#ff6b2e', // orange
  '#fff34d', // yellow
  '#fd93d5', // pink
  '#ffb6f1', // pale pink
  '#b0d4ff', // pale sky
  '#bdb2f0', // lavender
];

/* curated (box, shape) pairs — bold combos pulled from the references */
const ART_PAIRS = [
  ['#356fe5', '#ffe1fb'], // blue box · palest-pink shape
  ['#fff34d', '#df3737'], // yellow box · red shape
  ['#b0d4ff', '#fff34d'], // pale-sky box · yellow shape
  ['#00832d', '#c8ff3d'], // green box · chartreuse shape
  ['#fd93d5', '#356fe5'], // pink box · blue shape
  ['#ff6b2e', '#0c0f14'], // orange box · ink shape
  ['#c8ff3d', '#00832d'], // chartreuse box · green shape
  ['#ffb6f1', '#df3737'], // pale-pink box · red shape
  ['#1f2a52', '#a2dff0'], // navy box · cyan dots
  ['#bdb2f0', '#356fe5'], // lavender box · blue shape
];

const TILE_TYPES = ['blob', 'starburst', 'pixel', 'chain', 'dots', 'stripes', 'wedge', 'ring', 'bars'];
const FREE_TYPES = ['blob', 'starburst', 'wedge', 'pixel', 'chain', 'ring', 'bars'];

/* ── pixel-creature bitmaps ── */
const PIXELS = [
  ['00100', '01110', '11111', '10101', '01010'], // critter
  ['00100', '01110', '11111', '00100', '01010'], // sprite
  ['01010', '11111', '11111', '01110', '00100'], // heart
  ['00100', '00100', '11111', '00100', '00100'], // plus
  ['10001', '01010', '00100', '01010', '10001'], // x-burst
];

/* ── path/point generators ── */
function smoothClosedPath(pts) {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
  }
  return d + 'Z';
}
function blobPath(cx, cy, r, rand, points = 8, jitter = 0.34) {
  const pts = [];
  const a0 = rand() * Math.PI * 2;
  for (let i = 0; i < points; i++) {
    const a = a0 + (i / points) * Math.PI * 2;
    const rr = r * (1 - jitter + rand() * jitter * 2);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  return smoothClosedPath(pts);
}
function starburstPath(cx, cy, outer, inner, spikes) {
  let d = '';
  const total = spikes * 2;
  for (let i = 0; i < total; i++) {
    const a = (i / total) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    d += (i === 0 ? 'M' : 'L') + ` ${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)} `;
  }
  return d + 'Z';
}
function wedgePoints(cx, cy, r, rand) {
  const a0 = rand() * Math.PI * 2;
  return [0, 1, 2].map((i) => {
    const a = a0 + i * (Math.PI * 2 / 3) + (rand() - 0.5) * 0.5;
    const rr = r * (0.8 + rand() * 0.4);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
}

/* ── inner content for a clipped box (tile) ── */
function renderInner(type, x, y, w, h, shapeColor, boxColor, rand, key) {
  const cx = x + w / 2, cy = y + h / 2;
  const r = Math.min(w, h);
  const rot = (rand() - 0.5) * 24;
  const g = (children) => (
    <g key={key} transform={`rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})`}>{children}</g>
  );

  switch (type) {
    case 'blob':
      return g(<path d={blobPath(cx, cy, r * 0.44, rand)} fill={shapeColor} />);
    case 'starburst':
      return g(<path d={starburstPath(cx, cy, r * 0.5, r * 0.22, 9 + Math.floor(rand() * 4))} fill={shapeColor} />);
    case 'wedge':
      return g(<polygon points={wedgePoints(cx, cy, r * 0.5, rand).map((p) => p.join(',')).join(' ')} fill={shapeColor} />);
    case 'ring':
      return g(<>
        <circle cx={cx} cy={cy} r={r * 0.46} fill={shapeColor} />
        <circle cx={cx} cy={cy} r={r * 0.22} fill={boxColor} />
      </>);
    case 'pixel': {
      const grid = PIXELS[Math.floor(rand() * PIXELS.length)];
      const cols = grid[0].length, rows = grid.length;
      const cell = (r * 0.72) / cols;
      const ox = cx - (cols * cell) / 2, oy = cy - (rows * cell) / 2;
      const cells = [];
      for (let ri = 0; ri < rows; ri++) for (let ci = 0; ci < cols; ci++) {
        if (grid[ri][ci] === '1')
          cells.push(<rect key={ri + '-' + ci} x={ox + ci * cell} y={oy + ri * cell} width={cell + 0.5} height={cell + 0.5} fill={shapeColor} />);
      }
      return g(cells);
    }
    case 'chain': {
      const n = 3 + Math.floor(rand() * 2);
      const rad = (w * 0.78) / (n * 1.5);
      const step = (w * 0.78) / n;
      const sx = cx - (w * 0.78) / 2 + step / 2;
      return g(Array.from({ length: n }).map((_, i) =>
        <ellipse key={i} cx={sx + i * step} cy={cy} rx={rad} ry={rad * 1.25} fill={shapeColor} />));
    }
    case 'dots': {
      const cols = 4, rows = Math.max(3, Math.round((4 * h) / w));
      const dx = w / cols, dy = h / rows;
      const dots = [];
      for (let ri = 0; ri < rows; ri++) for (let ci = 0; ci < cols; ci++)
        dots.push(<circle key={ri + '-' + ci} cx={x + dx * (ci + 0.5)} cy={y + dy * (ri + 0.5)} r={Math.min(dx, dy) * 0.26} fill={shapeColor} />);
      return <g key={key}>{dots}</g>;
    }
    case 'stripes': {
      const bw = Math.max(w, h) * 0.13;
      const bars = [];
      const span = w + h;
      let i = 0;
      for (let p = -h; p < w + h; p += bw * 2.0) {
        bars.push(<rect key={i++} x={x + p} y={y - h} width={bw} height={span * 1.6} fill={shapeColor} />);
      }
      return <g key={key} transform={`rotate(34 ${cx} ${cy})`}>{bars}</g>;
    }
    case 'bars': {
      const n = 4 + Math.floor(rand() * 2);
      const bars = [];
      for (let i = 0; i < n; i++) {
        const bx = x + w * (0.18 + 0.62 * (i / Math.max(1, n - 1)));
        const bh = h * (0.4 + rand() * 0.4);
        const brot = (rand() - 0.5) * 50;
        bars.push(<rect key={i} x={bx} y={cy - bh / 2} width={Math.max(3, w * 0.07)} height={bh} fill={shapeColor}
          transform={`rotate(${brot.toFixed(1)} ${bx} ${cy})`} />);
      }
      return <g key={key}>{bars}</g>;
    }
    default:
      return g(<circle cx={cx} cy={cy} r={r * 0.4} fill={shapeColor} />);
  }
}

let _id = 0;

/* ── art descriptor for a seed (kept stable so gallery + popover match) ── */
function artFor(seed) {
  const r = rng(String(seed) + '-art');
  return {
    pair: ART_PAIRS[Math.floor(r() * ART_PAIRS.length)],
    type: TILE_TYPES[Math.floor(r() * TILE_TYPES.length)],
    rot: (r() - 0.5) * 7,
  };
}

/* ── BrandTile: solid color box w/ a clipped shape inside (axis-aligned rect) ── */
function BrandTile({ x = 0, y = 0, w, h, seed, outline = true, rotate = 0 }) {
  const art = artFor(seed);
  const [boxColor, shapeColor] = art.pair;
  const rand = rng(String(seed) + '-tile');
  const cid = `bt${_id++}`;
  const cx = x + w / 2, cy = y + h / 2;
  const rot = rotate || 0;
  return (
    <g transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}>
      <defs>
        <clipPath id={cid}><rect x={x} y={y} width={w} height={h} /></clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={boxColor} />
      <g clipPath={`url(#${cid})`}>
        {renderInner(art.type, x, y, w, h, shapeColor, boxColor, rand, cid + '-i')}
      </g>
      {outline && <rect x={x} y={y} width={w} height={h} fill="none" stroke="var(--outline)" strokeWidth="1.5" />}
    </g>
  );
}

/* ── BrandPoly: solid color box clipped to an arbitrary polygon (for skewed side walls) ── */
function BrandPoly({ points, seed, outline = true }) {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys);
  const w = maxx - minx, h = maxy - miny;
  const art = artFor(seed);
  const [boxColor, shapeColor] = art.pair;
  const rand = rng(String(seed) + '-poly');
  const cid = `bp${_id++}`;
  const ptStr = points.map((p) => p.join(',')).join(' ');
  return (
    <g>
      <defs>
        <clipPath id={cid}><polygon points={ptStr} /></clipPath>
      </defs>
      <polygon points={ptStr} fill={boxColor} />
      <g clipPath={`url(#${cid})`}>
        {renderInner(art.type, minx, miny, w, h, shapeColor, boxColor, rand, cid + '-i')}
      </g>
      {outline && <polygon points={ptStr} fill="none" stroke="var(--outline)" strokeWidth="1.5" />}
    </g>
  );
}

/* ── BrandShape: a single free-floating shape (no box) ── */
function BrandShape({ type, cx, cy, size, color, seed = 0, boxColor = 'var(--background)' }) {
  const rand = rng(String(seed) + type + Math.round(cx) + 'x' + Math.round(cy));
  const x = cx - size / 2, y = cy - size / 2;
  return <g>{renderInner(type, x, y, size, size, color, boxColor, rand, 'free')}</g>;
}

/* ── BrandScatter: a deterministic field of free shapes in a viewBox ── */
function BrandScatter({ seed, width, height, count = 6, opacity = 1, minSize = 26, maxSize = 96, className = 'brand-scatter', avoid = null }) {
  const rand = rng(String(seed) + '-scatter');
  const items = [];
  let placed = 0, guard = 0;
  while (placed < count && guard < count * 12) {
    guard++;
    const cx = rand() * width;
    const cy = rand() * height;
    // optional avoid-rect (keep clear of headline/content): {x,y,w,h}
    if (avoid && cx > avoid.x && cx < avoid.x + avoid.w && cy > avoid.y && cy < avoid.y + avoid.h) continue;
    const size = minSize + rand() * (maxSize - minSize);
    const color = PALETTE[Math.floor(rand() * PALETTE.length)];
    const type = FREE_TYPES[Math.floor(rand() * FREE_TYPES.length)];
    const inBox = rand() < 0.34;
    if (inBox) {
      items.push(<BrandTile key={placed} x={cx - size / 2} y={cy - size / 2} w={size} h={size}
        seed={String(seed) + '-s' + placed} rotate={(rand() - 0.5) * 24} outline={false} />);
    } else {
      items.push(<BrandShape key={placed} type={type} cx={cx} cy={cy} size={size} color={color} seed={String(seed) + placed} />);
    }
    placed++;
  }
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice"
      style={{ opacity }} aria-hidden="true">{items}</svg>
  );
}

window.Brand = {
  rng, hashStr, PALETTE, ART_PAIRS, TILE_TYPES, FREE_TYPES,
  blobPath, starburstPath, wedgePoints, smoothClosedPath, renderInner, artFor,
  pick: (seed) => PALETTE[hashStr(String(seed)) % PALETTE.length],
};
Object.assign(window, { BrandTile, BrandPoly, BrandShape, BrandScatter });
