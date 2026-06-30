/* ============================================================
 * server.js — Museum of Wonder
 *
 * Serves the static front-end and proxies Notion API calls so
 * the API token never reaches the browser. On every request to
 * /api/exhibits it:
 *   1. Queries the Notion database for all active exhibits
 *   2. Maps them into the spatial FLOORS structure
 *   3. Returns JSON
 *
 * If NOTION_TOKEN / NOTION_EXHIBITS_DB_ID are not set, the
 * response falls back to stub data so the app still renders.
 *
 * Usage:
 *   cp .env.example .env   # fill in your tokens
 *   npm install
 *   npm start              # or: npm run dev  (auto-restarts)
 * ============================================================ */

'use strict';

require('dotenv').config();

const express = require('express');
const path    = require('path');
const { buildFloors } = require('./floors-structure');

const app  = express();
const PORT = process.env.PORT || 3000;

const NOTION_TOKEN  = process.env.NOTION_TOKEN;
const NOTION_DB_ID  = process.env.NOTION_EXHIBITS_DB_ID;
const NOTION_VERSION = '2022-06-28';

/* ── static files ── */
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

/* ── /api/exhibits ──────────────────────────────────────────── */
app.get('/api/exhibits', async (req, res) => {
  console.log('[api/exhibits] TOKEN set:', !!NOTION_TOKEN, '| DB_ID set:', !!NOTION_DB_ID);
  try {
    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      console.log('[api/exhibits] Notion not configured — returning fallback data');
      return res.json(buildFloors());
    }

    const notionExhibits = await fetchAllExhibits();
    console.log('[api/exhibits] Fetched', notionExhibits.length, 'entries from Notion');
    console.log('[api/exhibits] Types:', notionExhibits.map(e => e.type).join(', ') || '(none)');
    console.log('[api/exhibits] SectionIds:', notionExhibits.map(e => e.sectionId).join(', ') || '(none)');
    const floors = buildFloors(notionExhibits);
    console.log('[api/exhibits] buildFloors produced', floors.length, 'floors,',
      floors.reduce((n, f) => n + f.sections.length, 0), 'sections,',
      floors.reduce((n, f) => n + f.sections.reduce((m, s) => m + s.exhibits.length, 0), 0), 'exhibits');
    res.json(floors);
  } catch (err) {
    console.error('[api/exhibits] Notion fetch failed:', err.message);
    // Always return something so the museum loads
    res.json(buildFloors());
  }
});

/* ── Notion helpers ─────────────────────────────────────────── */

/** Paginate through all rows in the exhibits database. */
async function fetchAllExhibits() {
  const results = [];
  let cursor;

  do {
    const body = { page_size: 100, filter: { property: 'Active', checkbox: { equals: true } } };
    if (cursor) body.start_cursor = cursor;

    const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Notion ${response.status}: ${text}`);
    }

    const data = await response.json();
    results.push(...data.results.map(pageToExhibit).filter(Boolean));
    cursor = data.next_cursor;
  } while (cursor);

  return results;
}

/**
 * Map a raw Notion page object to the exhibit shape expected by
 * floors-structure.js → buildFloors.
 *
 * Notion property names (case-sensitive) — must match your database:
 *   Title            (title)
 *   Label            (rich_text)   e.g. "01"
 *   Section          (select)      matches section ids in floors-structure
 *   Byline           (rich_text)
 *   Essay            (rich_text)
 *   Quote            (rich_text)
 *   Quote Attribution (rich_text)
 *   Has Video        (checkbox)
 *   Video Caption    (rich_text)
 *   Has Mini App     (checkbox)
 *   Mini App URL     (url)
 *   Try It URL       (url)
 *   Try It Label     (rich_text)
 *   Tint             (select)      CSS custom property, e.g. "var(--warm-tan)"
 *   Wall             (select)      "left" | "right" | "back"
 *   Sort Order       (number)
 *   Active           (checkbox)    already filtered in query, kept for safety
 */
function pageToExhibit(page) {
  const p = page.properties;

  const text   = (prop) => prop?.rich_text?.[0]?.plain_text
                        ?? prop?.title?.[0]?.plain_text
                        ?? '';
  const select = (prop) => prop?.select?.name ?? '';
  const bool   = (prop) => prop?.checkbox ?? false;
  const url    = (prop) => prop?.url ?? '';
  const num    = (prop) => prop?.number ?? 0;

  if (!bool(p['Active'])) return null;

  const quoteText = text(p['Quote']);

  return {
    // page.id gives a stable UUID we can use if no explicit id is set
    id:          page.id,
    sectionId:   select(p['Section']),
    label:       text(p['Label']),
    title:       text(p['Title']),
    byline:      text(p['Byline']),
    tint:        select(p['Tint']) || 'var(--warm-tan)',
    wall:        select(p['Wall']) || 'back',
    essay:       text(p['Essay']),
    quote:       quoteText ? { text: quoteText, attribution: text(p['Quote Attribution']) } : null,
    video:       bool(p['Has Video']) ? { caption: text(p['Video Caption']) } : null,
    hasMiniApp:  bool(p['Has Mini App']),
    miniAppUrl:  url(p['Mini App URL']) || null,
    tryItUrl:    url(p['Try It URL']),
    tryItLabel:  text(p['Try It Label']),
    sortOrder:   num(p['Sort Order']),
  };
}

/* ── boot (local dev only) ── */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Museum of Wonder · http://localhost:${PORT}`);
    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      console.log('  (!) NOTION_TOKEN or NOTION_EXHIBITS_DB_ID not set — using stub data');
      console.log('      Copy .env.example to .env and fill in your credentials to connect Notion.');
    } else {
      console.log('  Notion integration active');
    }
  });
}

module.exports = app;
