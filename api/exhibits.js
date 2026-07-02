'use strict';

require('dotenv').config();

const { buildFloors } = require('../floors-structure');

const NOTION_VERSION = '2022-06-28';

module.exports = async (req, res) => {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DB_ID = process.env.NOTION_EXHIBITS_DB_ID;
  try {
    if (!NOTION_TOKEN || !NOTION_DB_ID) {
      console.log('[api/exhibits] Notion not configured — returning fallback data');
      return res.json(buildFloors());
    }
    const exhibits = await fetchAllExhibits(NOTION_TOKEN, NOTION_DB_ID);
    const exhibitsWithEssays = await attachLongEssays(exhibits, NOTION_TOKEN);
    res.json(buildFloors(exhibitsWithEssays));
  } catch (err) {
    console.error('[api/exhibits] failed:', err.message);
    res.json(buildFloors());
  }
};

async function fetchAllExhibits(NOTION_TOKEN, NOTION_DB_ID) {
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

/** Fetch page body blocks for all exhibits concurrently and attach as longEssay. */
async function attachLongEssays(exhibits, NOTION_TOKEN) {
  return Promise.all(exhibits.map(async (exhibit) => {
    try {
      const response = await fetch(`https://api.notion.com/v1/blocks/${exhibit.id}/children?page_size=100`, {
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
        },
      });
      if (!response.ok) return exhibit;
      const data = await response.json();
      const longEssay = serializeBlocks(data.results || []);
      return longEssay.length ? { ...exhibit, longEssay } : exhibit;
    } catch {
      return exhibit;
    }
  }));
}

/** Convert Notion block objects to a simple array of {type, text} for the client. */
function serializeBlocks(blocks) {
  const out = [];
  for (const block of blocks) {
    const type = block.type;
    const richText = block[type]?.rich_text ?? [];
    const text = richText.map(t => t.plain_text).join('');
    if (!text.trim()) continue;
    out.push({ type, text });
  }
  return out;
}

function pageToExhibit(page) {
  const p = page.properties;

  const text   = (prop) => prop?.rich_text?.[0]?.plain_text ?? prop?.title?.[0]?.plain_text ?? '';
  const select = (prop) => prop?.select?.name ?? '';
  const bool   = (prop) => prop?.checkbox ?? false;
  const url    = (prop) => prop?.url ?? '';
  const num    = (prop) => prop?.number ?? 0;

  if (!bool(p['Active'])) return null;

  const type      = select(p['Type']) || 'Exhibit';
  const quoteText = text(p['Quote']);

  return {
    id:          page.id,
    type,
    sectionId:   select(p['Section']),
    title:       text(p['Title']),
    description: text(p['Description']),
    label:       text(p['Label']),
    byline:      text(p['Byline']),
    tint:        select(p['Tint ']) || 'var(--warm-tan)',
    wall:        select(p['Wall']) || null,
    essay:       text(p['Essay']),
    quote:       quoteText ? { text: quoteText, attribution: text(p['Quote Attribution']) } : null,
    video:       bool(p['Has Video']) ? { caption: text(p['Video Caption']), url: url(p['Mini App URL']) || null } : null,
    hasMiniApp:  bool(p['Has Mini App']),
    miniAppUrl:  url(p['Mini App URL']) || null,
    tryItUrl:    url(p['Try It URL']),
    tryItLabel:  text(p['Try It Label']),
    sortOrder:   num(p['Sort Order']),
  };
}
