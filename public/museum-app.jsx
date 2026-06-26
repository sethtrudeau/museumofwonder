/* ============================================================
 * museum-app.jsx — root state machine + view stack
 *
 * The museum is a vertical column of 3 fixed-height panels:
 *   phase 0 → building (side elevation of 6 floors)
 *   phase 1 → floorplan (top-down)
 *   phase 2 → POV       (first-person inside a section)
 *
 * The column itself translates by -100vh per step. That gives the
 * "panning up through the building" feel the user asked for.
 * ============================================================ */

const { useState, useEffect, useMemo, useCallback } = React;

/* ── defaults persisted via EDITMODE markers ── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mapStyle": "elevation",
  "povStyle": "gallery",
  "density": "comfortable",
  "showLabels": true,
  "brandDecor": true,
  "gridBg": true
}/*EDITMODE-END*/;

function MuseumApp() {
  const [floors,     setFloors]     = useState(null);   // null while loading
  const [floorId,    setFloorId]    = useState(null);   // null on building view
  const [sectionId,  setSectionId]  = useState(null);   // null on floor view
  const [exhibitId,  setExhibitId]  = useState(null);   // null when no popover
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  /* fetch exhibit data from server on every load */
  useEffect(() => {
    fetch('/api/exhibits')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setFloors)
      .catch((err) => {
        console.error('Failed to load exhibits:', err);
        setFloors([]); // render empty museum rather than hang forever
      });
  }, []);

  /* derived: current phase */
  const phase = sectionId ? 2 : floorId ? 1 : 0;

  /* lookups */
  const floor   = useMemo(() => floors?.find(f => f.id === floorId)   || null, [floors, floorId]);
  const section = useMemo(() => floor?.sections.find(s => s.id === sectionId) || null, [floor, sectionId]);
  const exhibit = useMemo(() => section?.exhibits.find(e => e.id === exhibitId) || null, [section, exhibitId]);

  /* nav handlers */
  const enterFloor   = (id) => { setFloorId(id);   setSectionId(null); setExhibitId(null); };
  const enterSection = (id) => { setSectionId(id); setExhibitId(null); };
  const goBuilding   = ()   => { setFloorId(null); setSectionId(null); setExhibitId(null); };
  const goFloor      = ()   => { setSectionId(null); setExhibitId(null); };
  const openExhibit  = (id) => setExhibitId(id);
  const closeExhibit = ()   => setExhibitId(null);

  /* keyboard: Esc steps back one level */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (exhibitId) closeExhibit();
      else if (sectionId) goFloor();
      else if (floorId) goBuilding();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exhibitId, sectionId, floorId]);

  /* show splash while fetching */
  if (floors === null) return <LoadingScreen />;

  return (
    <div className={`museum-root ${t.gridBg ? 'has-grid' : ''}`}>
      <Chrome
        floor={floor}
        section={section}
        phase={phase}
        onBuilding={goBuilding}
        onFloor={goFloor}
      />

      <div className="museum-stack" style={{ transform: `translateY(-${phase * 100}vh)` }}>
        <section className="museum-panel">
          <FloorSelectView
            floors={floors}
            currentFloorId={floorId}
            onPick={enterFloor}
            mapStyle={t.mapStyle}
            brandDecor={t.brandDecor}
          />
        </section>
        <section className="museum-panel">
          {floor && (
            <FloorplanView
              floor={floor}
              currentSectionId={sectionId}
              onPick={enterSection}
              mapStyle={t.mapStyle}
              showLabels={t.showLabels}
              brandDecor={t.brandDecor}
            />
          )}
        </section>
        <section className="museum-panel">
          {floor && section && (
            <POVView
              floor={floor}
              section={section}
              onOpen={openExhibit}
              povStyle={t.povStyle}
              density={t.density}
              brandDecor={t.brandDecor}
            />
          )}
        </section>
      </div>

      <MiniMap
        floors={floors}
        floor={floor}
        section={section}
        phase={phase}
        onBuilding={goBuilding}
        onFloor={goFloor}
        onPickFloor={enterFloor}
      />

      <ExhibitPopover
        exhibit={exhibit}
        floor={floor}
        section={section}
        onClose={closeExhibit}
      />

      <MuseumTweaks t={t} setTweak={setTweak} />
      <Stylesheet/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * CHROME — top bar with breadcrumb + back affordance
 * ───────────────────────────────────────────────────────── */
function Chrome({ floor, section, phase, onBuilding, onFloor }) {
  return (
    <header className="museum-chrome" data-screen-label="Chrome">
      <div className="museum-chrome__brand">
        <span className="museum-chrome__mark" aria-hidden="true">⌬</span>
        <span className="museum-chrome__brandtxt">
          <span className="museum-chrome__wordmark">Museum of Wonder</span>
          <span className="museum-chrome__sub mono upper">est. 2024 · a Playlab institution</span>
        </span>
      </div>

      <nav className="museum-chrome__crumbs mono upper" aria-label="Breadcrumb">
        <button
          className={`crumb ${phase === 0 ? 'is-current' : ''}`}
          onClick={onBuilding}>
          The building
        </button>
        {floor && <span className="crumb-sep">/</span>}
        {floor && (
          <button
            className={`crumb ${phase === 1 ? 'is-current' : ''}`}
            onClick={onFloor}>
            F·{String(floor.num).padStart(2, '0')} {floor.name}
          </button>
        )}
        {section && <span className="crumb-sep">/</span>}
        {section && (
          <span className="crumb is-current">{section.name}</span>
        )}
      </nav>

      <div className="museum-chrome__hours mono upper">
        Open round the clock
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────────────────
 * TWEAKS panel
 * ───────────────────────────────────────────────────────── */
function MuseumTweaks({ t, setTweak }) {
  return (
    <TweaksPanel title="Tweaks · Museum of Wonder">
      <TweakSection label="Map style">
        <TweakRadio
          label="Building view"
          value={t.mapStyle}
          options={[
            { value: 'elevation',  label: 'Elev.' },
            { value: 'isometric',  label: 'Iso' },
            { value: 'schematic',  label: 'Plan' },
          ]}
          onChange={(v) => setTweak('mapStyle', v)}
        />
        <TweakToggle
          label="Section labels"
          value={t.showLabels}
          onChange={(v) => setTweak('showLabels', v)}
        />
      </TweakSection>

      <TweakSection label="POV style">
        <TweakRadio
          label="Inside a section"
          value={t.povStyle}
          options={[
            { value: 'gallery',   label: 'Gallery' },
            { value: 'isometric', label: 'Iso' },
            { value: 'schematic', label: 'Wall' },
          ]}
          onChange={(v) => setTweak('povStyle', v)}
        />
      </TweakSection>

      <TweakSection label="Density">
        <TweakRadio
          label="Exhibit spacing"
          value={t.density}
          options={[
            { value: 'comfortable', label: 'Comfort' },
            { value: 'dense',       label: 'Dense' },
          ]}
          onChange={(v) => setTweak('density', v)}
        />
      </TweakSection>

      <TweakSection label="Playlab decor">
        <TweakToggle
          label="Brand shapes"
          value={t.brandDecor}
          onChange={(v) => setTweak('brandDecor', v)}
        />
        <TweakToggle
          label="Grid background"
          value={t.gridBg}
          onChange={(v) => setTweak('gridBg', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

/* ─────────────────────────────────────────────────────────
 * Stylesheet — root + chrome only (each view brings its own)
 * ───────────────────────────────────────────────────────── */
function Stylesheet() {
  return (
    <style>{`
      .museum-root {
        position: relative;
        width: 100vw; height: 100vh;
        overflow: hidden;
        background: var(--background);
      }
      .museum-root.has-grid {
        background-color: var(--background);
        background-image:
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
        background-size: 44px 44px;
        --grid-line: color-mix(in oklch, var(--ink) 6%, transparent);
      }

      .museum-stack {
        position: absolute; inset: 0;
        height: 300vh;
        will-change: transform;
        transition: transform 720ms var(--ease-slow);
      }
      .museum-panel {
        height: 100vh;
        position: relative;
        overflow: hidden;
      }

      /* ── chrome ── */
      .museum-chrome {
        position: fixed;
        top: 0; left: 0; right: 0;
        z-index: 100;
        display: grid;
        grid-template-columns: minmax(260px, auto) 1fr auto;
        align-items: center;
        gap: 24px;
        padding: 12px 32px 12px 68px;
        background: var(--background);
        border-bottom: 1px solid var(--outline-quiet);
      }
      .museum-chrome__brand {
        display: flex; align-items: center; gap: 10px;
        min-width: 0;
      }
      .museum-chrome__mark {
        font-size: 20px; line-height: 1; color: var(--ink);
      }
      .museum-chrome__brandtxt {
        display: flex; flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .museum-chrome__wordmark {
        font-family: var(--font-editorial);
        font-size: 16px; font-weight: 600;
        letter-spacing: -0.005em;
        color: var(--ink);
        line-height: 1.05;
        white-space: nowrap;
      }
      .museum-chrome__sub {
        font-size: 9px; color: var(--text3);
        white-space: nowrap;
        line-height: 1.2;
      }
      .museum-chrome__crumbs {
        display: flex; align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 10px;
        color: var(--text3);
        white-space: nowrap;
        overflow: hidden;
      }
      .crumb {
        background: none; border: none; cursor: pointer;
        padding: 4px 8px;
        font: inherit; color: inherit;
        letter-spacing: inherit; text-transform: inherit;
        border-radius: var(--r-control);
        transition: background-color var(--dur-fast) var(--ease-fast),
                    color var(--dur-fast) var(--ease-fast);
      }
      .crumb:hover { background: var(--surface1); color: var(--text1); }
      .crumb.is-current {
        color: var(--on-highlighter);
        background: var(--highlighter);
      }
      .crumb-sep { color: var(--text4); user-select: none; }
      .museum-chrome__hours {
        font-size: 10px; color: var(--text3);
        text-align: right;
      }

      @media (max-width: 720px) {
        .museum-chrome { grid-template-columns: 1fr; gap: 6px; padding: 10px 16px; }
        .museum-chrome__hours { display: none; }
      }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────────────
 * LOADING SCREEN — shown while /api/exhibits is in flight
 * ───────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 20,
      fontFamily: 'var(--font-mono)',
      fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: 'var(--text3)',
      background: 'var(--background)',
    }}>
      <style>{`
        @keyframes fp-reveal {
          0%, 5%  { clip-path: inset(0 0 100% 0); }
          72%     { clip-path: inset(0 0 0% 0); }
          90%     { clip-path: inset(0 0 0% 0); }
          100%    { clip-path: inset(0 0 100% 0); }
        }
        @keyframes fp-scanline {
          0%, 5%  { top: -5px; opacity: 0; }
          8%      { opacity: 1; }
          72%     { top: 75px; opacity: 1; }
          80%     { top: 75px; opacity: 0; }
          100%    { top: 75px; opacity: 0; }
        }
        .fp-bright { animation: fp-reveal 2.6s ease-in-out infinite; }
        .fp-line   { animation: fp-scanline 2.6s ease-in-out infinite; }
      `}</style>

      <div style={{ color: 'var(--text1)' }}>Museum of Wonder</div>

      <FingerprintScanner />

      <div>unlocking the doors…</div>
    </div>
  );
}

function FingerprintScanner() {
  const CX = 30;
  // Loop-pattern ridges: arcs from (CX-rx, cy) to (CX+rx, cy) arching upward.
  // cy is the y of the open end (bottom of each arch); top of arch = cy - ry.
  const RIDGES = [
    { rx: 4,  ry: 5,  cy: 56 },
    { rx: 7,  ry: 10, cy: 57 },
    { rx: 11, ry: 15, cy: 58 },
    { rx: 15, ry: 20, cy: 59 },
    { rx: 19, ry: 25, cy: 60 },
    { rx: 22, ry: 29, cy: 61 },
    { rx: 25, ry: 33, cy: 62 },
    { rx: 27, ry: 36, cy: 63 },
  ];

  // sweep=0 draws the arc through the top (upward arch = ∩ shape)
  const d = ({ rx, ry, cy }) =>
    `M ${CX - rx} ${cy} A ${rx} ${ry} 0 0 0 ${CX + rx} ${cy}`;

  const ridgesDim = (
    <>
      <circle cx={CX} cy="54" r="1.5" fill="var(--text4)" opacity="0.35"/>
      {RIDGES.map((r, i) => (
        <path key={i} d={d(r)}
          fill="none" stroke="var(--text4)" strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
      ))}
    </>
  );

  const ridgesBright = (
    <>
      <circle cx={CX} cy="54" r="1.5" fill="var(--ink)"/>
      {RIDGES.map((r, i) => (
        <path key={i} d={d(r)}
          fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
    </>
  );

  return (
    <div style={{ position: 'relative', width: 60, height: 80 }}>
      {/* Scanner border */}
      <svg viewBox="0 0 60 80" width="60" height="80"
        style={{ position: 'absolute', inset: 0 }}>
        <rect x="1" y="1" width="58" height="78" rx="5"
          fill="none" stroke="var(--outline)" strokeWidth="0.75"/>
        {ridgesDim}
      </svg>

      {/* Bright fingerprint revealed by scan */}
      <div className="fp-bright"
        style={{ position: 'absolute', inset: 0 }}>
        <svg viewBox="0 0 60 80" width="60" height="80">
          {ridgesBright}
        </svg>
      </div>

      {/* Scan line */}
      <div className="fp-line" style={{
        position: 'absolute', left: 4, right: 4, height: 10, opacity: 0,
        background: 'linear-gradient(to bottom, transparent, var(--ink) 50%, transparent)',
      }}/>
    </div>
  );
}

/* ── boot ── */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MuseumApp/>);
