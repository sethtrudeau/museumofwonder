/* ============================================================
 * view-popover.jsx — exhibit detail overlay
 *
 * Sliding panel from the right with: wall label, image placeholder,
 * essay, pull quote, video placeholder, optional mini-app, "try it"
 * link to playlab.ai.
 * ============================================================ */

function ExhibitPopover({ exhibit, floor, section, onClose }) {
  const open = !!exhibit;

  // Mount the panel always; toggle the .is-open class so we get an exit animation.
  // Trap the latest non-null exhibit so content stays put during exit.
  const [last, setLast] = React.useState(exhibit);
  React.useEffect(() => { if (exhibit) setLast(exhibit); }, [exhibit]);

  const e = exhibit || last;

  return (
    <>
      <PopoverStyles/>
      <div
        className={`ex-scrim ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`ex-panel ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={e ? `Wall label: ${e.title}` : 'Exhibit detail'}
        aria-hidden={!open}>
        {e && (
          <ExhibitBody
            exhibit={e}
            floor={floor}
            section={section}
            onClose={onClose}
          />
        )}
      </aside>
    </>
  );
}

function ExhibitBody({ exhibit, floor, section, onClose }) {
  return (
    <>
      {/* sticky header */}
      <header className="ex-panel__hd">
        <div className="ex-panel__hd-crumb mono upper">
          F{floor && String(floor.num).padStart(2, '0')} · {section?.name}
        </div>
        <button className="ex-panel__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="ex-panel__body">
        {/* "image" — Playlab brand composition (matches this piece's gallery tile) */}
        <div className="ex-img">
          <svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" className="ex-img__svg" aria-hidden="true">
            <BrandTile x={0} y={0} w={320} h={240} seed={exhibit.id} outline={false}/>
          </svg>
          <div className="ex-img__cap mono upper">
            Image · {exhibit.label}
          </div>
          <div className="ex-img__corner mono upper">
            Plate
          </div>
        </div>

        {/* wall label header */}
        <div className="ex-label">
          <h2 className="ex-label__title">{exhibit.title}</h2>
          {exhibit.label && <div className="ex-label__num mono upper">№ {exhibit.label}</div>}
          {exhibit.description && <p className="ex-label__desc">{exhibit.description}</p>}
        </div>

        {/* essay */}
        {exhibit.essay && (
          <section className="ex-essay">
            <h3 className="ex-section-hd mono upper">Wall label</h3>
            <p>{exhibit.essay}</p>
          </section>
        )}

        {/* pull quote */}
        {exhibit.quote && (
          <figure className="ex-quote">
            <blockquote>“{exhibit.quote.text}”</blockquote>
            <figcaption>— {exhibit.quote.attribution}</figcaption>
          </figure>
        )}

        {/* mini-app */}
        {exhibit.hasMiniApp && (
          <section className="ex-miniapp">
            <h3 className="ex-section-hd mono upper">Try it</h3>
            <MiniApp url={exhibit.miniAppUrl}/>
          </section>
        )}

        {/* video placeholder */}
        {exhibit.video && (
          <section className="ex-video">
            <h3 className="ex-section-hd mono upper">Video</h3>
            <div className="ex-video__frame">
              <div className="ex-video__play">▶</div>
              <div className="ex-video__cap mono upper">{exhibit.video.caption}</div>
            </div>
          </section>
        )}

        {/* try-it preview + full-window link */}
        {exhibit.tryItUrl && (
          <section className="ex-tryit">
            <div className="ex-tryit__bar">
              <h3 className="ex-section-hd mono upper" style={{ margin: 0 }}>Try it</h3>
              <a
                className="ex-tryit__open"
                href={exhibit.tryItUrl}
                target="_blank" rel="noopener noreferrer"
                title="Open in full window">
                {exhibit.tryItLabel || 'Open in Playlab'} ↗
              </a>
            </div>
            <div className="ex-tryit__frame">
              <iframe
                src={exhibit.tryItUrl}
                title={exhibit.tryItLabel || 'Try it'}
                className="ex-tryit__iframe"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          </section>
        )}

        {/* stub note */}
        {exhibit.isStub && (
          <div className="ex-stub mono upper">
            ⚐ This piece is still being catalogued. Wall text in preparation.
          </div>
        )}

        <footer className="ex-panel__ft mono upper">
          Press Esc to close · click any piece outside to switch
        </footer>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 * Styles
 * ───────────────────────────────────────────────────────── */
function PopoverStyles() {
  return (
    <style>{`
      .ex-scrim {
        position: fixed;
        top: 56px; left: 0; right: 0; bottom: 0;
        background: var(--scrim);
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--dur-medium) var(--ease-medium);
        z-index: 80;
      }
      .ex-scrim.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      .ex-panel {
        position: fixed;
        top: 56px; right: 0; bottom: 0;
        width: min(540px, 92vw);
        background: var(--overlay);
        border-left: 1px solid var(--outline);
        box-shadow: var(--shadow-3);
        transform: translateX(100%);
        transition: transform var(--dur-slow) var(--ease-slow);
        z-index: 90;
        display: flex; flex-direction: column;
        overflow: hidden;
      }
      .ex-panel.is-open { transform: translateX(0); }

      .ex-panel__hd {
        flex: none;
        display: flex; align-items: center; justify-content: space-between;
        padding: 14px 24px;
        border-bottom: 1px solid var(--outline-quiet);
      }
      .ex-panel__hd-crumb {
        font-size: 10px; color: var(--text3);
      }
      .ex-panel__close {
        background: none; border: 1px solid var(--outline-quiet);
        width: 32px; height: 32px;
        border-radius: var(--r-control);
        font-size: 14px; cursor: pointer;
        color: var(--text1);
        transition: background-color var(--dur-fast) var(--ease-fast),
                    border-color var(--dur-fast) var(--ease-fast);
      }
      .ex-panel__close:hover {
        background: var(--highlighter);
        border-color: var(--on-highlighter);
        color: var(--on-highlighter);
      }

      .ex-panel__body {
        flex: 1; min-height: 0;
        overflow-y: auto;
        padding: 0 24px 32px;
        display: flex; flex-direction: column;
        gap: 24px;
      }

      .ex-img {
        margin: 24px 0 0;
        flex: none;
        aspect-ratio: 4 / 3;
        position: relative;
        border-radius: var(--r-surface);
        border: 1px solid var(--outline);
        overflow: hidden;
        background: var(--surface1);
      }
      .ex-img__svg {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        display: block;
      }
      .ex-img__cap {
        position: absolute; left: 12px; bottom: 12px;
        background: var(--surface2);
        color: var(--text2);
        padding: 6px 10px;
        font-size: 10px;
        border: 1px solid var(--outline);
        border-radius: var(--r-control);
      }
      .ex-img__corner {
        position: absolute; right: 12px; top: 12px;
        font-size: 9px;
        color: rgba(12,15,20,0.55);
        background: rgba(255,255,255,0.55);
        padding: 4px 8px;
        border-radius: var(--r-control);
      }

      .ex-label {
        display: flex; flex-direction: column;
        gap: 6px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--outline);
      }
      .ex-label__title {
        font-family: var(--font-editorial);
        font-size: 28px; font-weight: 500;
        line-height: 1.15; letter-spacing: -0.014em;
        color: var(--text1); margin: 0;
      }
      .ex-label__num { font-size: 10px; color: var(--text3); }
      .ex-label__desc {
        font-size: 14px; line-height: 1.5;
        color: var(--text2); margin: 0;
      }

      .ex-section-hd {
        font-size: 10px; color: var(--text3);
        margin: 0 0 10px;
      }
      .ex-essay p {
        font-family: var(--font-body);
        font-size: 15px; line-height: 1.6;
        color: var(--text1); margin: 0;
      }

      .ex-quote {
        margin: 0;
        padding: 16px 18px;
        background: var(--surface1);
        border-radius: var(--r-surface);
        border-left: 1px solid var(--outline);
      }
      .ex-quote blockquote {
        font-family: var(--font-editorial);
        font-size: 19px; line-height: 1.3;
        font-weight: 500;
        margin: 0 0 8px;
        color: var(--text1);
      }
      .ex-quote figcaption {
        font-size: 12px; color: var(--text3);
      }

      .ex-video__frame {
        position: relative;
        aspect-ratio: 16 / 9;
        background: var(--ink);
        color: var(--ink-inverse);
        border-radius: var(--r-surface);
        overflow: hidden;
        display: flex; align-items: center; justify-content: center;
      }
      .ex-video__play {
        width: 56px; height: 56px;
        border-radius: 999px;
        background: var(--ink-inverse);
        color: var(--ink);
        display: flex; align-items: center; justify-content: center;
        font-size: 20px;
        padding-left: 4px;
      }
      .ex-video__cap {
        position: absolute; left: 12px; bottom: 10px;
        font-size: 10px; opacity: 0.75;
      }

      .ex-tryit__bar {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 10px;
      }
      .ex-tryit__open {
        font-family: var(--font-mono);
        font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--text2);
        text-decoration: none;
        padding: 4px 8px;
        border: 1px solid var(--outline-quiet);
        border-radius: var(--r-control);
        transition: background-color var(--dur-fast) var(--ease-fast),
                    color var(--dur-fast) var(--ease-fast);
      }
      .ex-tryit__open:hover {
        background: var(--ink); color: var(--ink-inverse);
        border-color: var(--ink);
      }
      .ex-tryit__frame {
        position: relative;
        aspect-ratio: 4 / 3;
        border-radius: var(--r-surface);
        border: 1px solid var(--outline);
        overflow: hidden;
        background: var(--surface1);
      }
      .ex-tryit__iframe {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        border: none;
      }

      .ex-stub {
        font-size: 11px; color: var(--text3);
        padding: 12px 14px;
        background: var(--surface1);
        border-radius: var(--r-control);
      }

      .ex-panel__ft {
        font-size: 10px; color: var(--text3);
        padding-top: 12px;
        margin-top: auto;
        border-top: 1px solid var(--outline-quiet);
      }

      .ex-miniapp { /* mini-app body styles live in view-mini-apps.jsx */ }
    `}</style>
  );
}

window.ExhibitPopover = ExhibitPopover;
