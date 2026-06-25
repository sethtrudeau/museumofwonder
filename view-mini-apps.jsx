/* ============================================================
 * view-mini-apps.jsx — interactive embeds in popovers
 * ============================================================ */

const MA_STYLES = `
  .ma-frame {
    width: 100%;
    height: 480px;
    border: 1px solid var(--outline-quiet);
    border-radius: var(--r-surface);
  }
  .ma-stub {
    font-size: 11px;
    color: var(--text3);
    padding: 12px;
    background: var(--surface1);
    border-radius: var(--r-control);
  }
`;

function MiniApp({ url }) {
  return (
    <>
      <style>{MA_STYLES}</style>
      {url
        ? <iframe className="ma-frame" src={url} allow="clipboard-write" loading="lazy"/>
        : <div className="ma-stub mono upper">⚐ Mini-app · no embed URL set</div>
      }
    </>
  );
}

window.MiniApp = MiniApp;
