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
          {exhibit.byline && <div className="ex-label__byline">{exhibit.byline}</div>}
          {exhibit.label && <div className="ex-label__num mono upper">№ {exhibit.label}</div>}
          {exhibit.description && <p className="ex-label__desc">{exhibit.description}</p>}
        </div>

        {/* essay — property field takes priority; page body used as rich-text fallback */}
        {(exhibit.essay || exhibit.longEssay?.length) && (
          <section className="ex-essay">
            <h3 className="ex-section-hd mono upper">Wall label</h3>
            {exhibit.essay
              ? <p>{exhibit.essay}</p>
              : <LongEssay blocks={exhibit.longEssay}/>
            }
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

        {/* video embed */}
        {exhibit.video && exhibit.video.url && (
          <section className="ex-video">
            <h3 className="ex-section-hd mono upper">Video</h3>
            <div className="ex-video__frame">
              <iframe
                src={exhibit.video.url}
                className="ex-video__iframe"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={exhibit.video.caption || exhibit.title}
              />
            </div>
            {exhibit.video.caption && (
              <div className="ex-video__cap mono upper">{exhibit.video.caption}</div>
            )}
          </section>
        )}

        {/* try-it CTA */}
        {exhibit.tryItUrl && (
          <section className="ex-tryit">
            <h3 className="ex-section-hd mono upper">Try it</h3>
            <a
              className="ex-tryit__btn"
              href={exhibit.tryItUrl}
              target="_blank" rel="noopener noreferrer">
              <span className="ex-tryit__label">{exhibit.tryItLabel || 'Open in Playlab'}</span>
              <span className="ex-tryit__arrow">↗</span>
            </a>
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

/* Render an array of {type, text} blocks from Notion page body. */
function LongEssay({ blocks }) {
  const elements = [];
  let listBuf = [];
  let listType = null;

  const flushList = () => {
    if (!listBuf.length) return;
    const Tag = listType === 'numbered_list_item' ? 'ol' : 'ul';
    elements.push(
      <Tag key={`list-${elements.length}`} className="ex-long-essay__list">
        {listBuf.map((item, i) => <li key={i}>{item}</li>)}
      </Tag>
    );
    listBuf = [];
    listType = null;
  };

  for (let i = 0; i < blocks.length; i++) {
    const { type, text } = blocks[i];
    if (type === 'bulleted_list_item' || type === 'numbered_list_item') {
      if (listType && listType !== type) flushList();
      listType = type;
      listBuf.push(text);
    } else {
      flushList();
      if (type === 'heading_1') {
        elements.push(<h2 key={i} className="ex-long-essay__h1">{text}</h2>);
      } else if (type === 'heading_2') {
        elements.push(<h3 key={i} className="ex-long-essay__h2">{text}</h3>);
      } else if (type === 'heading_3') {
        elements.push(<h4 key={i} className="ex-long-essay__h3">{text}</h4>);
      } else if (type === 'quote') {
        elements.push(<blockquote key={i} className="ex-long-essay__quote">{text}</blockquote>);
      } else {
        elements.push(<p key={i} className="ex-long-essay__p">{text}</p>);
      }
    }
  }
  flushList();
  return <div className="ex-long-essay">{elements}</div>;
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
      .ex-label__byline { font-size: 13px; color: var(--text2); }
      .ex-label__num { font-size: 10px; color: var(--text3); margin-top: 4px; }
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
        border-radius: var(--r-surface);
        overflow: hidden;
        background: var(--ink);
      }
      .ex-video__iframe {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        border: none;
      }
      .ex-video__cap {
        font-size: 10px; color: var(--text3);
        margin-top: 6px;
      }

      .ex-tryit__btn {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px;
        padding: 14px 18px;
        background: var(--ink);
        color: var(--ink-inverse);
        border-radius: var(--r-control);
        text-decoration: none;
        transition: background-color var(--dur-fast) var(--ease-fast);
      }
      .ex-tryit__btn:hover { background: #252528; }
      .ex-tryit__label { font-size: 14px; font-weight: 500; }
      .ex-tryit__arrow { font-size: 18px; opacity: 0.7; }

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

      .ex-long-essay { display: flex; flex-direction: column; gap: 12px; }
      .ex-long-essay__p {
        font-family: var(--font-body);
        font-size: 15px; line-height: 1.6;
        color: var(--text1); margin: 0;
      }
      .ex-long-essay__h1 {
        font-family: var(--font-editorial);
        font-size: 20px; font-weight: 500;
        line-height: 1.2; margin: 8px 0 0;
        color: var(--text1);
      }
      .ex-long-essay__h2 {
        font-family: var(--font-editorial);
        font-size: 17px; font-weight: 500;
        line-height: 1.2; margin: 6px 0 0;
        color: var(--text1);
      }
      .ex-long-essay__h3 {
        font-size: 13px; font-weight: 600;
        letter-spacing: 0.04em; text-transform: uppercase;
        margin: 6px 0 0; color: var(--text2);
      }
      .ex-long-essay__quote {
        margin: 0;
        padding: 12px 16px;
        border-left: 2px solid var(--outline);
        font-family: var(--font-editorial);
        font-size: 16px; font-style: italic;
        color: var(--text2); line-height: 1.45;
      }
      .ex-long-essay__list {
        margin: 0; padding-left: 20px;
        display: flex; flex-direction: column; gap: 6px;
      }
      .ex-long-essay__list li {
        font-family: var(--font-body);
        font-size: 15px; line-height: 1.6;
        color: var(--text1);
      }
    `}</style>
  );
}

window.ExhibitPopover = ExhibitPopover;
