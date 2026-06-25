/* ============================================================
 * floors-structure.js — spatial skeleton for the Museum of Wonder
 *
 * This file owns everything that doesn't come from Notion:
 *   - floor metadata (id, num, name, subtitle, status, palette)
 *   - section geometry (id, name, x/y/w/h, shape path, label/door/dot positions)
 *
 * buildFloors(notionExhibits?) merges Notion exhibit content into the
 * sections. If notionExhibits is omitted (or Notion isn't configured),
 * it falls back to stub exhibits so the app always renders something.
 * ============================================================ */

'use strict';

/* ── stub generator (used when a section has no Notion data yet) ── */
function stubExhibits(count, prefix, tint) {
  const titles = [
    'Untitled, in progress',
    'Pinned for review',
    'Working title TBD',
    'Folder of fragments',
    'Annotated transcript',
    'Loose draft, dated',
  ];
  const bylines = [
    'Caption pending',
    'Awaiting wall text',
    'Curator note forthcoming',
    'To be catalogued',
  ];
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `${prefix}-${i}`,
      label: String(i + 1).padStart(2, '0'),
      title: titles[i % titles.length],
      byline: bylines[i % bylines.length],
      tint,
      essay:
        'This piece is not yet on the wall. The Museum of Wonder is itself a workshop — exhibits arrive ' +
        'in drafts, get re-hung, sometimes get taken down. Check back, or ask a docent what is in the ' +
        'crate next door.',
      isStub: true,
    });
  }
  return out;
}

/* ── structural skeleton ── */
const FLOOR_SECTIONS = [
  /* ── FLOOR 1 — About Playlab ── */
  {
    floorId: 'about',
    sections: [
      {
        id: 'atrium',
        name: 'The Atrium',
        x: 2, y: 2, w: 6, h: 6,
        shape: {
          path: 'M 2 5 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z',
          label: { x: 5,   y: 4.4, anchor: 'middle' },
          door:  { x: 5,   y: 8,   side: 'south' },
          dots:  [{ x: 4.0, y: 5.5 }, { x: 6.0, y: 5.5 }],
        },
        povStyle: 'gallery',
        stubCount: 2,
        stubPrefix: 'a',
        stubTint: 'var(--warm-tan)',
      },
      {
        id: 'origins',
        name: 'Origins',
        x: 11, y: 1, w: 11, h: 7,
        shape: {
          path: 'M 11 1.5 L 22 1 L 22 7 L 12 7.5 Z',
          label: { x: 17,  y: 3,   anchor: 'middle' },
          door:  { x: 17,  y: 7.3, side: 'south' },
          dots:  [{ x: 14, y: 5 }, { x: 19, y: 4.7 }],
        },
        povStyle: 'schematic',
        stubCount: 2,
        stubPrefix: 'o',
        stubTint: 'var(--palest-pink)',
      },
      {
        id: 'principles',
        name: 'Hall of Five Principles',
        x: 1, y: 8, w: 13, h: 5,
        shape: {
          path: 'M 1 9 Q 7 6.8 13 9 L 13 13 L 1 13 Z',
          label: { x: 7,  y: 11.5, anchor: 'middle' },
          door:  { x: 7,  y: 8.7,  side: 'north' },
          dots:  [{ x: 7, y: 11 }],
        },
        povStyle: 'isometric',
        stubCount: 1,
        stubPrefix: 'p',
        stubTint: 'var(--pale-cyan)',
      },
      {
        id: 'charter',
        name: 'Charter & People',
        x: 14, y: 8, w: 8, h: 5,
        shape: {
          path: 'M 16 8 L 21.5 8.5 L 22 13 L 15 13 L 14 10.5 Z',
          label: { x: 18,  y: 10, anchor: 'middle' },
          door:  { x: 18,  y: 13, side: 'south' },
          dots:  [{ x: 18, y: 11 }],
        },
        povStyle: 'gallery',
        stubCount: 1,
        stubPrefix: 'c',
        stubTint: 'var(--tan)',
      },
    ],
  },

  /* ── FLOOR 2 — Build your first app ── */
  {
    floorId: 'build',
    sections: [
      {
        id: 'b-tables',
        name: 'Workshop tables',
        x: 2, y: 2, w: 12, h: 6,
        shape: {
          path: 'M 2 2 L 14 2 L 14 5 L 9 5 L 9 8 L 2 8 Z',
          label: { x: 5,  y: 4,   anchor: 'middle' },
          dots:  [{ x: 5, y: 4 }, { x: 11.5, y: 3.3 }, { x: 5, y: 6.8 }],
        },
        stubCount: 3,
        stubPrefix: 'b',
        stubTint: 'var(--chartreuse)',
      },
      {
        id: 'b-drafts',
        name: 'Drafts in progress',
        x: 15, y: 2, w: 7, h: 6,
        shape: {
          path: 'M 15.5 5 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z',
          label: { x: 18.5, y: 4.5, anchor: 'middle' },
          dots:  [{ x: 17.5, y: 5 }, { x: 19.5, y: 5 }],
        },
        stubCount: 2,
        stubPrefix: 'b2',
        stubTint: 'var(--lime)',
      },
      {
        id: 'b-finished',
        name: 'Things that shipped',
        x: 2, y: 9, w: 20, h: 4,
        shape: {
          path: 'M 3 9.5 L 21 9.5 Q 22.7 11 21 12.5 L 3 12.5 Q 1.3 11 3 9.5 Z',
          label: { x: 11, y: 11, anchor: 'middle' },
          dots:  [{ x: 11, y: 11 }],
        },
        stubCount: 1,
        stubPrefix: 'b3',
        stubTint: 'var(--olive)',
      },
    ],
  },

  /* ── FLOOR 3 — Special collections ── */
  {
    floorId: 'special',
    sections: [
      {
        id: 's-climate',
        name: 'Wing A · Climate literacy',
        x: 1, y: 1, w: 7, h: 12,
        shape: {
          path: 'M 1 1.5 L 7 1 L 8 13 L 2 13 Z',
          label: { x: 4.5, y: 3.5, anchor: 'middle' },
          dots:  [{ x: 4.5, y: 6 }, { x: 4.5, y: 10 }],
        },
        stubCount: 2,
        stubPrefix: 'sc1',
        stubTint: 'var(--pale-pink)',
      },
      {
        id: 's-language',
        name: 'Wing B · World languages',
        x: 9, y: 1, w: 6, h: 12,
        shape: {
          path: 'M 9 1 L 15 1.5 L 14 13 L 8 13 Z',
          label: { x: 11.5, y: 3.5, anchor: 'middle' },
          dots:  [{ x: 11.5, y: 6.5 }, { x: 11.5, y: 10 }],
        },
        stubCount: 2,
        stubPrefix: 'sc2',
        stubTint: 'var(--pink)',
      },
      {
        id: 's-math',
        name: 'Wing C · Math tools',
        x: 16, y: 1, w: 7, h: 12,
        shape: {
          path: 'M 16 1.5 L 22 1 L 23 13 L 17 13 Z',
          label: { x: 19.5, y: 3.5, anchor: 'middle' },
          dots:  [{ x: 19.5, y: 6.5 }, { x: 19.5, y: 10 }],
        },
        stubCount: 2,
        stubPrefix: 'sc3',
        stubTint: 'var(--palest-pink)',
      },
    ],
  },

  /* ── FLOOR 4 — How young people use Playlab ── */
  {
    floorId: 'youth',
    sections: [
      {
        id: 'y-elem',
        name: 'Elementary works',
        x: 1, y: 8, w: 7, h: 5,
        shape: {
          path: 'M 1 8 L 7 8 L 7 13 L 1 13 Z',
          label: { x: 4, y: 9.5, anchor: 'middle' },
          dots:  [{ x: 3, y: 11 }, { x: 5.5, y: 11 }],
        },
        stubCount: 2,
        stubPrefix: 'ye',
        stubTint: 'var(--pale-cyan)',
      },
      {
        id: 'y-mid',
        name: 'Middle school',
        x: 9, y: 5, w: 7, h: 8,
        shape: {
          path: 'M 9 5 L 15 5 L 15 13 L 8 13 Z',
          label: { x: 11.5, y: 6.5, anchor: 'middle' },
          dots:  [{ x: 11, y: 9 }, { x: 13, y: 11 }],
        },
        stubCount: 2,
        stubPrefix: 'ym',
        stubTint: 'var(--pale-sky)',
      },
      {
        id: 'y-high',
        name: 'High school',
        x: 16, y: 1, w: 7, h: 12,
        shape: {
          path: 'M 16 1 L 23 1 L 23 13 L 17 13 Z',
          label: { x: 19.5, y: 2.5, anchor: 'middle' },
          dots:  [{ x: 18, y: 5 }, { x: 21, y: 9 }],
        },
        stubCount: 2,
        stubPrefix: 'yh',
        stubTint: 'var(--mid-blue)',
      },
    ],
  },

  /* ── FLOOR 5 — The Playlab library ── */
  {
    floorId: 'library',
    sections: [
      {
        id: 'l-stacks',
        name: 'The stacks',
        x: 1, y: 1, w: 14, h: 12,
        shape: {
          path: 'M 1 1 L 15 1 L 15 13 L 1 13 Z',
          label: { x: 8, y: 2.4, anchor: 'middle' },
          dots:  [{ x: 4, y: 5 }, { x: 8, y: 7 }, { x: 12, y: 9.5 }],
        },
        stubCount: 3,
        stubPrefix: 'l1',
        stubTint: 'var(--tan)',
      },
      {
        id: 'l-reading',
        name: 'Reading rotunda',
        x: 16, y: 4, w: 7, h: 7,
        shape: {
          path: 'M 16.5 7.5 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z',
          label: { x: 19.5, y: 7,  anchor: 'middle' },
          dots:  [{ x: 18, y: 8 }, { x: 21, y: 8 }, { x: 19.5, y: 6 }],
        },
        stubCount: 3,
        stubPrefix: 'l2',
        stubTint: 'var(--warm-tan)',
      },
    ],
  },

  /* ── FLOOR 6 — The Playlab lab ── */
  {
    floorId: 'lab',
    sections: [
      {
        id: 'lab-bench',
        name: 'Bench prototypes',
        x: 1, y: 1, w: 10, h: 7,
        shape: {
          path: 'M 1 2 L 10 1 L 11 7 L 2 8 Z',
          label: { x: 5.5, y: 3, anchor: 'middle' },
          dots:  [{ x: 4, y: 5 }, { x: 8, y: 4.5 }],
        },
        stubCount: 2,
        stubPrefix: 'lb',
        stubTint: 'var(--orange)',
      },
      {
        id: 'lab-research',
        name: 'Research notes',
        x: 13, y: 1, w: 10, h: 6,
        shape: {
          path: 'M 15 1 L 21 1 L 23 3 L 23 5 L 21 7 L 15 7 L 13 5 L 13 3 Z',
          label: { x: 18, y: 2.5, anchor: 'middle' },
          dots:  [{ x: 16, y: 4.5 }, { x: 20, y: 4.5 }],
        },
        stubCount: 2,
        stubPrefix: 'lr',
        stubTint: 'var(--yellow)',
      },
      {
        id: 'lab-failed',
        name: 'The room of failed experiments',
        x: 2, y: 9, w: 20, h: 4,
        shape: {
          path: 'M 3 9 L 22 9.5 L 21 13 L 1 12.5 Z',
          label: { x: 11, y: 10.5, anchor: 'middle' },
          dots:  [{ x: 7, y: 11.5 }, { x: 16, y: 11.5 }],
        },
        stubCount: 2,
        stubPrefix: 'lf',
        stubTint: 'var(--red)',
      },
    ],
  },
];

/* ── floor-level metadata ── */
const FLOOR_META = [
  { id: 'about',   num: 1, name: 'About Playlab',                  subtitle: 'Lobby, origins, the charter',           status: 'open',        palette: 'var(--yellow)'    },
  { id: 'build',   num: 2, name: 'Build your first app',           subtitle: 'Workshop tables, in-progress drafts',   status: 'open',        palette: 'var(--chartreuse)' },
  { id: 'special', num: 3, name: 'Special collections',            subtitle: 'Three rotating wings · changes seasonally', status: 'rotating', palette: 'var(--pale-pink)' },
  { id: 'youth',   num: 4, name: 'How young people use Playlab',   subtitle: 'Permanent collection',                  status: 'open',        palette: 'var(--pale-cyan)'  },
  { id: 'library', num: 5, name: 'The Playlab library',            subtitle: 'A quiet floor · reading allowed',       status: 'open',        palette: 'var(--mid-blue)'   },
  { id: 'lab',     num: 6, name: 'The Playlab lab',                subtitle: 'Work in progress · half of this does not work', status: 'in-progress', palette: 'var(--orange)' },
];

/* ── buildFloors(notionExhibits?) ─────────────────────────────────
 *
 * notionExhibits: array of exhibit objects from Notion, each having:
 *   { id, sectionId, label, title, byline, tint, wall, essay,
 *     quote, video, hasMiniApp, miniAppId, tryItUrl, tryItLabel, sortOrder }
 *
 * Exhibits are injected into their matching section. Sections that
 * receive no Notion exhibits fall back to stub data.
 * ────────────────────────────────────────────────────────────────── */
function buildFloors(notionExhibits) {
  // Group Notion exhibits by sectionId for fast lookup
  const bySection = {};
  if (Array.isArray(notionExhibits)) {
    for (const exhibit of notionExhibits) {
      if (!exhibit.sectionId) continue;
      if (!bySection[exhibit.sectionId]) bySection[exhibit.sectionId] = [];
      bySection[exhibit.sectionId].push(exhibit);
    }
    // Sort each section's exhibits by sortOrder, then label
    for (const sectionId of Object.keys(bySection)) {
      bySection[sectionId].sort((a, b) =>
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.label ?? '').localeCompare(b.label ?? ''),
      );
    }
  }

  return FLOOR_META.map((meta) => {
    const floorSections = FLOOR_SECTIONS.find((f) => f.floorId === meta.id)?.sections ?? [];

    const sections = floorSections.map(({ stubCount, stubPrefix, stubTint, ...section }) => {
      const exhibits = bySection[section.id]?.length
        ? bySection[section.id]
        : stubExhibits(stubCount, stubPrefix, stubTint);

      return { ...section, exhibits };
    });

    return { ...meta, sections };
  });
}

module.exports = { buildFloors };
