/* ============================================================
 * view-minimap.jsx — collapsible corner map
 *
 * Default: collapsed into a small icon button in the bottom-left.
 * Click → expands into the full mini-map (building stack + floorplan).
 * Click the × → collapses again.
 *
 * Reflects current location across all 3 layers. Jumping to a floor
 * works from any phase.
 * ============================================================ */

function MiniMap({ floors, floor, section, phase, onBuilding, onFloor, onPickFloor }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  // Auto-collapse when we go back to building view (no map needed there).
  React.useEffect(() => {
    if (phase === 0) setOpen(false);
  }, [phase]);

  // Click outside → close
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    // pointerdown fires before click; use that so clicks inside reach buttons
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div className="mm-root" data-phase={phase} ref={rootRef}>
      <MiniMapStyles/>

      {/* COLLAPSED: compact icon button */}
      <button
        className={`mm-trigger ${open ? 'is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open map"
        aria-expanded={open}
        title="Open map">
        <MapIcon/>
        {floor && (
          <span className="mm-trigger__pal" style={{ background: floor.palette }} aria-hidden="true"/>
        )}
      </button>

      {/* EXPANDED: full panel */}
      <aside
        className={`mm ${open ? 'is-open' : ''}`}
        aria-label="Museum map"
        aria-hidden={!open}>
        <header className="mm__hd">
          <span className="mono upper mm__hd-t">You are here</span>
          <button
            className="mm__hd-close"
            onClick={() => setOpen(false)}
            aria-label="Close map">✕</button>
        </header>

        <div className="mm__phase mono upper">
          {phase === 0 && 'The building'}
          {phase === 1 && `Floor ${String(floor?.num).padStart(2, '0')} · ${floor?.name}`}
          {phase === 2 && section?.name}
        </div>

        {/* Tiny building stack — always shown, always clickable */}
        <div className="mm__building" role="group" aria-label="Building stack">
          {[...floors].reverse().map((f) => (
            <button
              key={f.id}
              className={`mm__floor ${floor?.id === f.id ? 'is-current' : ''}`}
              onClick={() => onPickFloor(f.id)}
              title={`Jump to Floor ${f.num}: ${f.name}`}>
              <span className="mm__floor-num mono">{String(f.num).padStart(2, '0')}</span>
              <span className="mm__floor-name">{f.name}</span>
              <span className="mm__floor-bar" style={{ background: f.palette }}/>
            </button>
          ))}
        </div>

        {/* When on a floor or in POV, show tiny floorplan with rooms */}
        {floor && (
          <div className="mm__plan">
            <svg viewBox="-1 -1 26 16" className="mm__plansvg">
              <rect x="0" y="0" width="24" height="14"
                fill="var(--surface1)" stroke="var(--outline-quiet)" strokeWidth="0.06"/>
              {floor.sections.map((s) => (
                <g key={s.id}>
                  {s.shape?.path ? (
                    <path
                      d={s.shape.path}
                      className={`mm__room ${s.id === section?.id ? 'is-current' : ''}`}/>
                  ) : (
                    <rect
                      x={s.x + 0.15} y={s.y + 0.15}
                      width={s.w - 0.3} height={s.h - 0.3}
                      className={`mm__room ${s.id === section?.id ? 'is-current' : ''}`}
                      rx="0.12"/>
                  )}
                </g>
              ))}
            </svg>
          </div>
        )}

        {/* Back actions */}
        <div className="mm__actions">
          <button className="mm__btn" onClick={onBuilding} disabled={phase === 0}>
            ↤ Lobby
          </button>
        </div>
      </aside>
    </div>
  );
}

/* Small inline icon — a stylized folded map */
function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="mm-icon" aria-hidden="true">
      <path d="M2 5 L9 3 L16 5 L22 3 L22 19 L16 21 L9 19 L2 21 Z"
        fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M9 3 L9 19 M16 5 L16 21"
        fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.45"/>
      <circle cx="13" cy="11" r="1.6" fill="currentColor"/>
    </svg>
  );
}

function MiniMapStyles() {
  return (
    <style>{`
      .mm-root {
        position: fixed;
        left: 16px; top: 8px;
        z-index: 110;
      }

      /* ── trigger ── */
      .mm-trigger {
        position: relative;
        display: flex; align-items: center; justify-content: center;
        width: 38px; height: 38px;
        padding: 0;
        background: var(--overlay);
        border: 1px solid var(--outline);
        border-radius: var(--r-control);
        box-shadow: var(--shadow-2);
        cursor: pointer;
        color: var(--ink);
        font: inherit;
        transition: background-color var(--dur-fast) var(--ease-fast),
                    transform var(--dur-medium) var(--ease-medium),
                    opacity var(--dur-medium) var(--ease-medium);
      }
      .mm-trigger:hover {
        background: var(--highlighter);
        border-color: var(--on-highlighter);
      }
      .mm-trigger.is-hidden {
        opacity: 0;
        transform: translateY(-8px);
        pointer-events: none;
      }
      .mm-icon { color: var(--ink); flex: none; }
      .mm-trigger__pal {
        position: absolute;
        right: -3px; top: -3px;
        width: 10px; height: 10px;
        border-radius: 999px;
        border: 1.5px solid var(--background);
      }

      /* ── expanded panel ── */
      .mm {
        position: fixed;
        left: 16px; top: 60px;
        width: 260px;
        background: var(--overlay);
        border: 1px solid var(--outline);
        border-radius: var(--r-surface);
        box-shadow: var(--shadow-2);
        padding: 12px;
        display: flex; flex-direction: column;
        gap: 10px;
        font-size: 11px;
        color: var(--text1);
        transform: translateY(-8px) scale(0.96);
        transform-origin: top left;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--dur-medium) var(--ease-medium),
                    transform var(--dur-medium) var(--ease-medium);
      }
      .mm.is-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      .mm__hd {
        display: flex; justify-content: space-between;
        align-items: center;
      }
      .mm__hd-t {
        font-size: 9px; color: var(--text3);
      }
      .mm__hd-close {
        background: none; border: 1px solid var(--outline-quiet);
        width: 22px; height: 22px;
        border-radius: var(--r-control);
        font-size: 10px;
        color: var(--text2);
        cursor: pointer;
        transition: background-color var(--dur-fast) var(--ease-fast),
                    border-color var(--dur-fast) var(--ease-fast),
                    color var(--dur-fast) var(--ease-fast);
      }
      .mm__hd-close:hover {
        background: var(--highlighter);
        border-color: var(--on-highlighter);
        color: var(--on-highlighter);
      }
      .mm__phase {
        font-size: 10px; color: var(--ink);
        font-weight: 500;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--outline-quiet);
      }

      .mm__building {
        display: flex; flex-direction: column;
        gap: 1px;
      }
      .mm__floor {
        display: grid;
        grid-template-columns: 22px 1fr 24px;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        background: none; border: none;
        border-radius: 2px;
        cursor: pointer;
        font: inherit; color: inherit;
        text-align: left;
        transition: background-color var(--dur-fast) var(--ease-fast);
      }
      .mm__floor:hover { background: var(--surface1); }
      .mm__floor.is-current {
        background: var(--highlighter);
      }
      .mm__floor.is-current .mm__floor-num,
      .mm__floor.is-current .mm__floor-name { color: var(--on-highlighter); }
      .mm__floor-num {
        font-size: 9px; color: var(--text3);
        letter-spacing: 0.06em;
      }
      .mm__floor-name {
        font-size: 11px;
        color: var(--text1);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .mm__floor-bar {
        height: 6px;
        border: 1px solid var(--outline);
        border-radius: 1px;
        opacity: 0.55;
        justify-self: stretch;
      }
      .mm__floor.is-current .mm__floor-bar { opacity: 1; }

      .mm__plan {
        background: var(--background);
        padding: 6px;
        border: 1px solid var(--outline-quiet);
        border-radius: 4px;
      }
      .mm__plansvg { width: 100%; height: auto; display: block; }
      .mm__room {
        fill: var(--surface2);
        stroke: var(--outline);
        stroke-width: 0.08;
      }
      .mm__room.is-current {
        fill: var(--highlighter);
        stroke: var(--on-highlighter);
      }

      .mm__actions { display: flex; gap: 4px; }
      .mm__btn {
        flex: 1;
        padding: 6px 8px;
        background: var(--background);
        border: 1px solid var(--outline-quiet);
        border-radius: var(--r-control);
        font: inherit;
        font-size: 10px;
        letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--text2);
        cursor: pointer;
        transition: background-color var(--dur-fast) var(--ease-fast),
                    border-color var(--dur-fast) var(--ease-fast),
                    color var(--dur-fast) var(--ease-fast);
      }
      .mm__btn:hover:not(:disabled) {
        background: var(--highlighter);
        border-color: var(--on-highlighter);
        color: var(--on-highlighter);
      }
      .mm__btn:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      @media (max-width: 720px) {
        .mm-root { left: 12px; top: 60px; }
        .mm { width: 220px; padding: 10px; }
      }
    `}</style>
  );
}

window.MiniMap = MiniMap;
