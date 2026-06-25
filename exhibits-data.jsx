/* ============================================================
 * Museum of Wonder — exhibit data
 *
 * Shape:
 *   floors[]            ← 6 floors
 *     id, num, name, subtitle, status
 *     palette           ← alt-palette tint hex used in mocks
 *     sections[]        ← rooms on the floorplan (top-down)
 *       id, name, x, y, w, h   (units = floorplan grid cells, 0..24 × 0..14)
 *       povStyle         ← override default POV style for variety
 *       exhibits[]      ← pieces in the room
 *         id, label (e.g. "01"), title, byline,
 *         tint           ← alt-palette token name for placeholder image
 *         essay          ← short wall label / essay
 *         quote { text, attribution }
 *         video           ← { caption } — placeholder
 *         hasMiniApp      ← bool, whether to show an embedded mini-app
 *         miniAppUrl       ← embed URL for the iframe
 *         tryItUrl
 *         tryItLabel
 *
 * Only Floor 1 is fully fleshed out — other floors carry stub exhibits.
 * Later, swap any exhibit's resolver to read from Notion.
 * ============================================================ */

const FLOORS = [
  /* ─────────────────────────────────────────────────────────
   * FLOOR 1 — ABOUT PLAYLAB (HERO, fully fleshed)
   *
   * Whimsical floorplan: a circular Atrium, a trapezoidal Origins
   * gallery, an arc-topped Hall of Principles, and a pentagonal
   * Charter room. Each section carries its own SVG path in grid
   * units, plus explicit label & exhibit-dot positions.
   * ───────────────────────────────────────────────────────── */
  {
    id: 'about',
    num: 1,
    name: 'About Playlab',
    subtitle: 'Lobby, origins, the charter',
    status: 'open',
    palette: 'var(--yellow)',
    sections: [
      {
        id: 'atrium',
        name: 'The Atrium',
        // bbox used by the building cutaway only
        x: 2, y: 2, w: 6, h: 6,
        shape: {
          // circle: M cx-r cy a r r 0 1 0 2r 0 a r r 0 1 0 -2r 0 z
          path: 'M 2 5 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z',
          label:  { x: 5,    y: 4.4, anchor: 'middle' },
          door:   { x: 5,    y: 8,   side: 'south' },
          dots:   [{ x: 4.0, y: 5.5 }, { x: 6.0, y: 5.5 }],
        },
        povStyle: 'gallery',
        exhibits: [
          {
            id: 'a-welcome',
            label: '01',
            title: 'Welcome to the Museum of Wonder',
            byline: 'Wall text · Atrium · 2026',
            tint: 'var(--warm-tan)',
            wall: 'left',
            essay:
              'This museum is a workshop disguised as a building. Every floor holds something a teacher, ' +
              'a student, or a researcher made with Playlab — drafts, finished things, things still in motion. ' +
              'Walk slowly. The labels are written by the people who made the work, not by us.',
            quote: {
              text: 'We make material, not product. The material to make is always visible and legible.',
              attribution: 'Playlab principle №1',
            },
            tryItUrl: 'https://playlab.ai',
            tryItLabel: 'Open Playlab',
          },
          {
            id: 'a-map',
            label: '02',
            title: 'How to read this building',
            byline: 'Visitor handout · Atrium · 2026',
            tint: 'var(--pale-sky)',
            wall: 'right',
            essay:
              'Six floors. Floor 1 is where you are. Two floors up is a special collections wing that ' +
              'rotates three times a year. The library is the calm one — read there. The Lab is the loud ' +
              'one — half the things on display do not yet work.',
            hasMiniApp: true,
            miniAppUrl: '',
          },
        ],
      },
      {
        id: 'origins',
        name: 'Origins',
        x: 11, y: 1, w: 11, h: 7,
        shape: {
          // trapezoid (top edge longer than bottom, slanting right)
          path: 'M 11 1.5 L 22 1 L 22 7 L 12 7.5 Z',
          label:  { x: 17,   y: 3,   anchor: 'middle' },
          door:   { x: 17,   y: 7.3, side: 'south' },
          dots:   [{ x: 14,  y: 5 }, { x: 19, y: 4.7 }],
        },
        povStyle: 'schematic',
        exhibits: [
          {
            id: 'o-founding',
            label: '03',
            title: 'Founding documents, 2023',
            byline: 'Cabinet · Origins · 2023–24',
            tint: 'var(--palest-pink)',
            wall: 'back',
            essay:
              'Before there was a platform, there was a question: what does AI in a classroom feel like when ' +
              'a teacher is the one driving? The earliest prototypes were Google Docs with comments turned on. ' +
              'Several of them are framed here in their original margins.',
            quote: {
              text: 'I wanted my students to make the tool, not be a user of the tool.',
              attribution: 'Founding teacher, Boston public schools',
            },
            video: { caption: 'Founding workshop, recorded in a school library — 8 min loop' },
          },
          {
            id: 'o-firstapp',
            label: '04',
            title: 'The first app ever shipped',
            byline: 'Vitrine · Origins · spring 2024',
            tint: 'var(--olive)',
            wall: 'back',
            essay:
              'A 9th-grade ELA teacher made a Socratic-questioning tutor for a class reading of Frankenstein. ' +
              'It asked one question at a time. It refused to summarize. The full prompt sits behind glass.',
            hasMiniApp: true,
            miniAppUrl: '',
            tryItUrl: 'https://playlab.ai',
            tryItLabel: 'Build something like this',
          },
        ],
      },
      {
        id: 'principles',
        name: 'Hall of Five Principles',
        x: 1, y: 8, w: 13, h: 5,
        shape: {
          // long gallery with an arc-topped wall (the curved side faces the atrium)
          path: 'M 1 9 Q 7 6.8 13 9 L 13 13 L 1 13 Z',
          label:  { x: 7,   y: 11.5, anchor: 'middle' },
          door:   { x: 7,   y: 8.7, side: 'north' },
          dots:   [{ x: 7,  y: 11 }],
        },
        povStyle: 'isometric',
        exhibits: [
          {
            id: 'p-wall',
            label: '05',
            title: 'The five principles, in full',
            byline: 'Wall text · Principles · ongoing',
            tint: 'var(--pale-cyan)',
            wall: 'back',
            essay:
              'These five sentences govern every design decision Playlab makes. They are printed at scale ' +
              'on the north wall of this hall. Each carries sub-rules for interface, voice, and image; ask ' +
              'a docent for the full pamphlet, or read the wall.',
            hasMiniApp: true,
            miniAppUrl: '',
          },
        ],
      },
      {
        id: 'charter',
        name: 'Charter & People',
        x: 14, y: 8, w: 8, h: 5,
        shape: {
          // pentagon — a five-sided room for the charter
          path: 'M 16 8 L 21.5 8.5 L 22 13 L 15 13 L 14 10.5 Z',
          label:  { x: 18,   y: 10, anchor: 'middle' },
          door:   { x: 18,   y: 13, side: 'south' },
          dots:   [{ x: 18,  y: 11 }],
        },
        povStyle: 'gallery',
        exhibits: [
          {
            id: 'c-nonprofit',
            label: '06',
            title: 'We are a non-profit',
            byline: 'Document · Charter · 2024',
            tint: 'var(--tan)',
            wall: 'back',
            essay:
              'Playlab is a 501(c)(3). The charter is plain: no upsells, no growth nudges, the educator owns ' +
              'what they make. A scan of the filed charter hangs in this room, lightly redacted for the ' +
              'home addresses of the original board.',
            quote: {
              text: 'We are a workshop, not a storefront.',
              attribution: 'Playlab principle №4',
            },
          },
        ],
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────
   * FLOOR 2 — BUILD YOUR FIRST APP (stubbed)
   * Floorplan: L-shaped workshop, circular drafts nook,
   * pill-shaped "things that shipped" rail at the bottom.
   * ───────────────────────────────────────────────────────── */
  {
    id: 'build',
    num: 2,
    name: 'Build your first app',
    subtitle: 'Workshop tables, in-progress drafts',
    status: 'open',
    palette: 'var(--chartreuse)',
    sections: [
      {
        id: 'b-tables', name: 'Workshop tables',
        x: 2, y: 2, w: 12, h: 6,
        shape: {
          path: 'M 2 2 L 14 2 L 14 5 L 9 5 L 9 8 L 2 8 Z',
          label: { x: 5,  y: 4,   anchor: 'middle' },
          dots:  [{ x: 5, y: 4 }, { x: 11.5, y: 3.3 }, { x: 5, y: 6.8 }],
        },
        exhibits: stubExhibits(3, 'b', 'var(--chartreuse)'),
      },
      {
        id: 'b-drafts', name: 'Drafts in progress',
        x: 15, y: 2, w: 7, h: 6,
        shape: {
          path: 'M 15.5 5 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z',
          label: { x: 18.5, y: 4.5, anchor: 'middle' },
          dots:  [{ x: 17.5, y: 5 }, { x: 19.5, y: 5 }],
        },
        exhibits: stubExhibits(2, 'b2', 'var(--lime)'),
      },
      {
        id: 'b-finished', name: 'Things that shipped',
        x: 2, y: 9, w: 20, h: 4,
        shape: {
          path: 'M 3 9.5 L 21 9.5 Q 22.7 11 21 12.5 L 3 12.5 Q 1.3 11 3 9.5 Z',
          label: { x: 11, y: 11, anchor: 'middle' },
          dots:  [{ x: 11, y: 11 }],
        },
        exhibits: stubExhibits(1, 'b3', 'var(--olive)'),
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────
   * FLOOR 3 — SPECIAL COLLECTIONS (stubbed)
   * Three tilted banners — like flags hanging side by side
   * ───────────────────────────────────────────────────────── */
  {
    id: 'special',
    num: 3,
    name: 'Special collections',
    subtitle: 'Three rotating wings · changes seasonally',
    status: 'rotating',
    palette: 'var(--pale-pink)',
    sections: [
      {
        id: 's-climate', name: 'Wing A · Climate literacy',
        x: 1, y: 1, w: 7, h: 12,
        shape: {
          path: 'M 1 1.5 L 7 1 L 8 13 L 2 13 Z',
          label: { x: 4.5, y: 3.5, anchor: 'middle' },
          dots:  [{ x: 4.5, y: 6 }, { x: 4.5, y: 10 }],
        },
        exhibits: stubExhibits(2, 'sc1', 'var(--pale-pink)'),
      },
      {
        id: 's-language', name: 'Wing B · World languages',
        x: 9, y: 1, w: 6, h: 12,
        shape: {
          path: 'M 9 1 L 15 1.5 L 14 13 L 8 13 Z',
          label: { x: 11.5, y: 3.5, anchor: 'middle' },
          dots:  [{ x: 11.5, y: 6.5 }, { x: 11.5, y: 10 }],
        },
        exhibits: stubExhibits(2, 'sc2', 'var(--pink)'),
      },
      {
        id: 's-math', name: 'Wing C · Math tools',
        x: 16, y: 1, w: 7, h: 12,
        shape: {
          path: 'M 16 1.5 L 22 1 L 23 13 L 17 13 Z',
          label: { x: 19.5, y: 3.5, anchor: 'middle' },
          dots:  [{ x: 19.5, y: 6.5 }, { x: 19.5, y: 10 }],
        },
        exhibits: stubExhibits(2, 'sc3', 'var(--palest-pink)'),
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────
   * FLOOR 4 — HOW YOUNG PEOPLE USE PLAYLAB (stubbed)
   * Stepped/cascading rooms — small → medium → large
   * ───────────────────────────────────────────────────────── */
  {
    id: 'youth',
    num: 4,
    name: 'How young people use Playlab',
    subtitle: 'Permanent collection',
    status: 'open',
    palette: 'var(--pale-cyan)',
    sections: [
      {
        id: 'y-elem', name: 'Elementary works',
        x: 1, y: 8, w: 7, h: 5,
        shape: {
          path: 'M 1 8 L 7 8 L 7 13 L 1 13 Z',
          label: { x: 4, y: 9.5, anchor: 'middle' },
          dots:  [{ x: 3, y: 11 }, { x: 5.5, y: 11 }],
        },
        exhibits: stubExhibits(2, 'ye', 'var(--pale-cyan)'),
      },
      {
        id: 'y-mid', name: 'Middle school',
        x: 9, y: 5, w: 7, h: 8,
        shape: {
          path: 'M 9 5 L 15 5 L 15 13 L 8 13 Z',
          label: { x: 11.5, y: 6.5, anchor: 'middle' },
          dots:  [{ x: 11, y: 9 }, { x: 13, y: 11 }],
        },
        exhibits: stubExhibits(2, 'ym', 'var(--pale-sky)'),
      },
      {
        id: 'y-high', name: 'High school',
        x: 16, y: 1, w: 7, h: 12,
        shape: {
          path: 'M 16 1 L 23 1 L 23 13 L 17 13 Z',
          label: { x: 19.5, y: 2.5, anchor: 'middle' },
          dots:  [{ x: 18, y: 5 }, { x: 21, y: 9 }],
        },
        exhibits: stubExhibits(2, 'yh', 'var(--mid-blue)'),
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────
   * FLOOR 5 — THE PLAYLAB LIBRARY (stubbed)
   * Tall stacks (bookshelves) + a small reading rotunda
   * ───────────────────────────────────────────────────────── */
  {
    id: 'library',
    num: 5,
    name: 'The Playlab library',
    subtitle: 'A quiet floor · reading allowed',
    status: 'open',
    palette: 'var(--mid-blue)',
    sections: [
      {
        id: 'l-stacks', name: 'The stacks',
        x: 1, y: 1, w: 14, h: 12,
        shape: {
          path: 'M 1 1 L 15 1 L 15 13 L 1 13 Z',
          label: { x: 8, y: 2.4, anchor: 'middle' },
          dots:  [{ x: 4, y: 5 }, { x: 8, y: 7 }, { x: 12, y: 9.5 }],
        },
        exhibits: stubExhibits(3, 'l1', 'var(--tan)'),
      },
      {
        id: 'l-reading', name: 'Reading rotunda',
        x: 16, y: 4, w: 7, h: 7,
        shape: {
          path: 'M 16.5 7.5 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0 z',
          label: { x: 19.5, y: 7,   anchor: 'middle' },
          dots:  [{ x: 18, y: 8 }, { x: 21, y: 8 }, { x: 19.5, y: 6 }],
        },
        exhibits: stubExhibits(3, 'l2', 'var(--warm-tan)'),
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────
   * FLOOR 6 — THE LAB (stubbed)
   * Scattered work pods — three irregular rooms at angles
   * ───────────────────────────────────────────────────────── */
  {
    id: 'lab',
    num: 6,
    name: 'The Playlab lab',
    subtitle: 'Work in progress · half of this does not work',
    status: 'in-progress',
    palette: 'var(--orange)',
    sections: [
      {
        id: 'lab-bench', name: 'Bench prototypes',
        x: 1, y: 1, w: 10, h: 7,
        shape: {
          path: 'M 1 2 L 10 1 L 11 7 L 2 8 Z',
          label: { x: 5.5, y: 3, anchor: 'middle' },
          dots:  [{ x: 4, y: 5 }, { x: 8, y: 4.5 }],
        },
        exhibits: stubExhibits(2, 'lb', 'var(--orange)'),
      },
      {
        id: 'lab-research', name: 'Research notes',
        x: 13, y: 1, w: 10, h: 6,
        shape: {
          // octagonal note room
          path: 'M 15 1 L 21 1 L 23 3 L 23 5 L 21 7 L 15 7 L 13 5 L 13 3 Z',
          label: { x: 18, y: 2.5, anchor: 'middle' },
          dots:  [{ x: 16, y: 4.5 }, { x: 20, y: 4.5 }],
        },
        exhibits: stubExhibits(2, 'lr', 'var(--yellow)'),
      },
      {
        id: 'lab-failed', name: 'The room of failed experiments',
        x: 2, y: 9, w: 20, h: 4,
        shape: {
          // jagged "x'd out" room — angled corners
          path: 'M 3 9 L 22 9.5 L 21 13 L 1 12.5 Z',
          label: { x: 11, y: 10.5, anchor: 'middle' },
          dots:  [{ x: 7, y: 11.5 }, { x: 16, y: 11.5 }],
        },
        exhibits: stubExhibits(2, 'lf', 'var(--red)'),
      },
    ],
  },
];

/* ── Helper to mint stub exhibits for non-hero floors ── */
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
      tint: tint,
      essay:
        'This piece is not yet on the wall. The Museum of Wonder is itself a workshop — exhibits arrive ' +
        'in drafts, get re-hung, sometimes get taken down. Check back, or ask a docent what is in the ' +
        'crate next door.',
      isStub: true,
    });
  }
  return out;
}

window.FLOORS = FLOORS;
