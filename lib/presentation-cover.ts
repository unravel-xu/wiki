export type PresentationCoverData = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary?: string;
};

type Palette = {
  bg0: string;
  bg1: string;
  grid: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  line: string;
  pillBg: string;
  pillText: string;
};

const PALETTES: Palette[] = [
  {
    bg0: '#F8FAFC',
    bg1: '#E2E8F0',
    grid: 'rgba(15,23,42,0.08)',
    accent: '#0F172A',
    accentSoft: '#334155',
    text: '#0F172A',
    muted: '#475569',
    line: 'rgba(15,23,42,0.10)',
    pillBg: 'rgba(15,23,42,0.08)',
    pillText: '#0F172A',
  },
  {
    bg0: '#F5F7FB',
    bg1: '#DCE7F5',
    grid: 'rgba(30,41,59,0.08)',
    accent: '#1E3A5F',
    accentSoft: '#3B82A6',
    text: '#0F172A',
    muted: '#475569',
    line: 'rgba(15,23,42,0.10)',
    pillBg: 'rgba(30,58,95,0.08)',
    pillText: '#1E3A5F',
  },
  {
    bg0: '#F8FAFC',
    bg1: '#E5E7EB',
    grid: 'rgba(17,24,39,0.08)',
    accent: '#111827',
    accentSoft: '#374151',
    text: '#111827',
    muted: '#4B5563',
    line: 'rgba(17,24,39,0.10)',
    pillBg: 'rgba(17,24,39,0.08)',
    pillText: '#111827',
  },
  {
    bg0: '#F7FAFC',
    bg1: '#E6EEF5',
    grid: 'rgba(15,23,42,0.08)',
    accent: '#1D3557',
    accentSoft: '#457B9D',
    text: '#0F172A',
    muted: '#475569',
    line: 'rgba(15,23,42,0.10)',
    pillBg: 'rgba(29,53,87,0.08)',
    pillText: '#1D3557',
  },
];

function escapeXml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickPalette(seed: string) {
  return PALETTES[hashString(seed) % PALETTES.length];
}

function formatDateLabel(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function clampText(input: string, maxLength: number) {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength - 1)}…`;
}

function splitTitleLines(title: string) {
  const words = title.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= 18) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);

  if (lines.length === 0) return ['Untitled'];
  if (lines.length <= 3) return lines;

  const merged = [...lines.slice(0, 2), lines.slice(2).join(' ')];
  return [
    merged[0],
    merged[1],
    clampText(merged[2], 22),
  ];
}

function renderTags(tags: string[], palette: Palette) {
  const clean = Array.from(new Set(tags.filter(Boolean))).slice(0, 4);
  if (clean.length === 0) return '';

  let x = 1040;
  const y = 112;
  const gap = 12;

  return clean
    .map((tag) => {
      const label = escapeXml(clampText(tag, 16));
      const width = Math.max(96, 24 + label.length * 13);
      const svg = `
        <g transform="translate(${x}, ${y})">
          <rect width="${width}" height="42" rx="21" fill="${palette.pillBg}" stroke="${palette.line}" />
          <text
            x="${width / 2}"
            y="27"
            text-anchor="middle"
            font-size="20"
            font-weight="600"
            fill="${palette.pillText}"
            font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >${label}</text>
        </g>
      `;
      x += width + gap;
      return svg;
    })
    .join('');
}

export function buildPresentationCoverSvg(data: PresentationCoverData) {
  const palette = pickPalette(`${data.slug}-${data.title}`);
  const titleLines = splitTitleLines(data.title || 'Untitled');
  const dateLabel = formatDateLabel(data.date);
  const summary = clampText((data.summary || '').trim(), 120);
  const safeTitleLines = titleLines.map(escapeXml);
  const safeDate = escapeXml(dateLabel);
  const safeSummary = escapeXml(summary);

  return `
<svg width="1600" height="900" viewBox="0 0 1600 900" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(data.title)} cover">
  <defs>
    <linearGradient id="bgGradient" x1="0" y1="0" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.bg0}" />
      <stop offset="1" stop-color="${palette.bg1}" />
    </linearGradient>

    <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(1320 160) rotate(90) scale(320 420)">
      <stop stop-color="${palette.accent}" stop-opacity="0.14" />
      <stop offset="1" stop-color="${palette.accent}" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(1180 700) rotate(90) scale(260 380)">
      <stop stop-color="${palette.accentSoft}" stop-opacity="0.12" />
      <stop offset="1" stop-color="${palette.accentSoft}" stop-opacity="0" />
    </radialGradient>

    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${palette.grid}" stroke-width="1"/>
    </pattern>

    <filter id="cardShadow" x="0" y="0" width="1600" height="900" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="18" stdDeviation="30" flood-color="#0F172A" flood-opacity="0.10" />
    </filter>
  </defs>

  <rect x="0" y="0" width="1600" height="900" fill="url(#bgGradient)" />
  <rect x="0" y="0" width="1600" height="900" fill="url(#grid)" />
  <rect x="0" y="0" width="1600" height="900" fill="url(#glowA)" />
  <rect x="0" y="0" width="1600" height="900" fill="url(#glowB)" />

  <g filter="url(#cardShadow)">
    <rect x="28" y="28" width="1544" height="844" rx="36" fill="rgba(255,255,255,0.74)" />
    <rect x="28.5" y="28.5" width="1543" height="843" rx="35.5" stroke="${palette.line}" />
  </g>

  <rect x="76" y="74" width="840" height="752" rx="28" fill="rgba(255,255,255,0.80)" stroke="${palette.line}" />
  <line x1="76" y1="186" x2="916" y2="186" stroke="${palette.line}" />

  <text
    x="104"
    y="138"
    font-size="24"
    font-weight="700"
    letter-spacing="0.16em"
    fill="${palette.muted}"
    font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  >WEEKLY PRESENTATION</text>

  ${renderTags(data.tags, palette)}

  ${
    safeTitleLines[0]
      ? `<text x="104" y="300" font-size="86" font-weight="800" fill="${palette.text}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${safeTitleLines[0]}</text>`
      : ''
  }
  ${
    safeTitleLines[1]
      ? `<text x="104" y="404" font-size="86" font-weight="800" fill="${palette.text}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${safeTitleLines[1]}</text>`
      : ''
  }
  ${
    safeTitleLines[2]
      ? `<text x="104" y="508" font-size="86" font-weight="800" fill="${palette.text}" font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">${safeTitleLines[2]}</text>`
      : ''
  }

  ${
    safeSummary
      ? `
      <foreignObject x="104" y="560" width="760" height="120">
        <div xmlns="http://www.w3.org/1999/xhtml" style="
          color:${palette.muted};
          font: 500 28px/1.6 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          letter-spacing: 0.01em;
        ">
          ${safeSummary}
        </div>
      </foreignObject>
    `
      : ''
  }

  <text
    x="104"
    y="760"
    font-size="30"
    font-weight="700"
    fill="${palette.accent}"
    font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  >${safeDate}</text>

  <text
    x="104"
    y="804"
    font-size="22"
    font-weight="500"
    fill="${palette.muted}"
    font-family="Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  >Academic · Research · Weekly Update</text>

  <g opacity="0.95">
    <circle cx="1220" cy="320" r="162" fill="none" stroke="${palette.accent}" stroke-width="2.5" opacity="0.18"/>
    <circle cx="1220" cy="320" r="116" fill="none" stroke="${palette.accentSoft}" stroke-width="2.5" opacity="0.22"/>
    <circle cx="1220" cy="320" r="68" fill="${palette.accent}" fill-opacity="0.08"/>
    <path d="M1140 560C1180 498 1260 474 1332 490C1404 506 1454 558 1470 626" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round" opacity="0.20"/>
    <path d="M1100 612C1168 640 1228 648 1300 636C1372 624 1432 592 1484 540" stroke="${palette.accentSoft}" stroke-width="3" stroke-linecap="round" opacity="0.22"/>
    <rect x="1084" y="154" width="314" height="504" rx="28" fill="none" stroke="${palette.line}" />
    <line x1="1084" y1="230" x2="1398" y2="230" stroke="${palette.line}" />
    <line x1="1084" y1="606" x2="1398" y2="606" stroke="${palette.line}" />
  </g>
</svg>
  `.trim();
}