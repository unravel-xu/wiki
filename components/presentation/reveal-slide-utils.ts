import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import type {
  CellAttrs,
  LayoutAttrs,
  LayoutBlock,
  LayoutCell,
  SlideMeta,
} from './types';

export type RenderedSlideContent = {
  html: string;
  layout: LayoutBlock | null;
  cellHtmlList: string[] | null;
};

export function splitMarkdownSlides(markdown: string) {
  const manualParts = markdown.split(/\r?\n---\r?\n/g);
  const finalSlides: string[] = [];

  manualParts.forEach((part) => {
    const autoParts = part.split(/(?=^#{1,2}\s)/m);

    autoParts.forEach((autoPart) => {
      const trimmed = autoPart.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('# ')) {
        const lines = trimmed.split(/\r?\n/);
        const h1Line = lines[0].trim();
        const rest = lines.slice(1).join('\n').trim();

        finalSlides.push(h1Line);
        if (rest) finalSlides.push(rest);
      } else {
        finalSlides.push(trimmed);
      }
    });
  });

  return finalSlides;
}

// 向后兼容你现有调用
export const splitSlides = splitMarkdownSlides;

export function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeAttr(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function parseAttrString(input: string | undefined): Record<string, string> {
  if (!input) return {};

  const attrs: Record<string, string> = {};
  const regex = /(\w+)\s*=\s*"([^"]*)"/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    attrs[match[1]] = match[2];
  }

  return attrs;
}

export function parseLayoutBlock(slide: string): LayoutBlock | null {
  const layoutMatch = slide.match(
    /^\s*::::layout(?:\{([^}]*)\})?\s*([\s\S]*?)\s*::::\s*$/m
  );
  if (!layoutMatch) return null;

  const [, rawAttrs, inner] = layoutMatch;
  const layoutAttrs = parseAttrString(rawAttrs);

  const attrs: LayoutAttrs = {
    cols: Number(layoutAttrs.cols ?? 12),
    rows: Number(layoutAttrs.rows ?? 12),
    gap: Number(layoutAttrs.gap ?? 16),
  };

  const cells: LayoutCell[] = [];
  const cellRegex = /:::cell(?:\{([^}]*)\})?\s*([\s\S]*?)\s*:::/g;

  let match: RegExpExecArray | null;
  while ((match = cellRegex.exec(inner)) !== null) {
    const [, rawCellAttrs, content] = match;
    const parsed = parseAttrString(rawCellAttrs);

    cells.push({
      attrs: {
        col: parsed.col,
        row: parsed.row,
        align: (parsed.align as CellAttrs['align']) ?? 'stretch',
        justify: (parsed.justify as CellAttrs['justify']) ?? 'stretch',
        padding: parsed.padding,
        className: parsed.className,
      },
      content: content.trim(),
    });
  }

  return { attrs, cells };
}

export function isImageOnlyMarkdown(md: string) {
  return /^!\[[^\]]*]\([^)]+\)\s*$/.test(md.trim());
}

function getMarkedHtml(md: string) {
  const renderer = new marked.Renderer();

  renderer.image = function image({ href, title, text }: any) {
    const src = href ?? '';
    const alt = text ?? '';
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';

    return `<img src="${escapeAttr(
      src
    )}" alt="${escapeAttr(
      alt
    )}"${titleAttr} loading="lazy" decoding="async" data-preview-image data-preview-fit="contain" class="rd-img" />`;
  };

  return marked.parse(md, {
    gfm: true,
    breaks: false,
    renderer,
  }) as string;
}

function renderKatexToHtml(source: string, displayMode: boolean) {
  try {
    return katex.renderToString(source, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      output: 'htmlAndMathml',
    });
  } catch (error) {
    console.error('KaTeX render error:', error);
    return `<span class="math-error">${escapeHtml(source)}</span>`;
  }
}

function stripMathDelimiters(raw: string): { expr: string; displayMode: boolean } {
  if (raw.startsWith('$$') && raw.endsWith('$$')) {
    return {
      expr: raw.slice(2, -2).trim(),
      displayMode: true,
    };
  }

  if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
    return {
      expr: raw.slice(2, -2).trim(),
      displayMode: true,
    };
  }

  if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
    return {
      expr: raw.slice(2, -2).trim(),
      displayMode: false,
    };
  }

  if (raw.startsWith('$') && raw.endsWith('$')) {
    return {
      expr: raw.slice(1, -1).trim(),
      displayMode: false,
    };
  }

  return {
    expr: raw,
    displayMode: false,
  };
}

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: [
      'math',
      'semantics',
      'mrow',
      'mi',
      'mn',
      'mo',
      'msup',
      'msub',
      'mfrac',
      'annotation',
      'annotation-xml',
    ],
    ADD_ATTR: [
      'class',
      'style',
      'aria-hidden',
      'xmlns',
      'encoding',
      'display',
      'focusable',
      'role',
      'target',
      'rel',
      'loading',
      'decoding',
      'data-preview-image',
      'data-preview-video',
      'data-preview-link',
      'data-preview-fit',
    ],
  });
}

export function renderMarkdownSafeMath(md: string) {
  const mathHtmlBlocks: string[] = [];

  let processed = md.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
    const token = `MATHBLOCKTOKEN${mathHtmlBlocks.length}END`;
    const { expr, displayMode } = stripMathDelimiters(match);
    mathHtmlBlocks.push(renderKatexToHtml(expr, displayMode));
    return token;
  });

  processed = processed.replace(/(\\\(.*?\\\)|\$[^\n$]+?\$)/g, (match) => {
    const token = `MATHBLOCKTOKEN${mathHtmlBlocks.length}END`;
    const { expr, displayMode } = stripMathDelimiters(match);
    mathHtmlBlocks.push(renderKatexToHtml(expr, displayMode));
    return token;
  });

  let html = getMarkedHtml(processed);

  mathHtmlBlocks.forEach((mathHtml, i) => {
    html = html.replaceAll(`MATHBLOCKTOKEN${i}END`, mathHtml);
  });

  return sanitizeHtml(html);
}

export function renderSlideContent(slide: string): RenderedSlideContent {
  const layout = parseLayoutBlock(slide);

  if (!layout) {
    return {
      html: renderMarkdownSafeMath(slide),
      layout: null,
      cellHtmlList: null,
    };
  }

  const cellHtmlList = layout.cells.map((cell) => renderMarkdownSafeMath(cell.content));

  return {
    // layout 页整体 html 不再用于内容展示，只保留空串即可
    html: '',
    layout,
    cellHtmlList,
  };
}

export function isH1Cover(slide: string) {
  return slide.startsWith('# ') && !slide.includes('\n');
}

export function extractSlideTitle(slide: string, fallbackIndex: number) {
  const headingMatch = slide.match(/^#{1,3}\s+(.+)$/m);
  if (headingMatch?.[1]) return headingMatch[1].trim();

  const text = slide.replace(/[#>*`\-\[\]\(\)!]/g, ' ').replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 40);

  return `Slide ${fallbackIndex + 1}`;
}

export function extractSlidePreview(slide: string) {
  return slide
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '[image]')
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\$[^$]+\$/g, '[math]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

export function buildSlideMetas(slides: string[]): SlideMeta[] {
  return slides.map((slide, index) => ({
    id: `slide-${index}`,
    index,
    indexh: index,
    indexv: 0,
    title: extractSlideTitle(slide, index),
    preview: extractSlidePreview(slide),
    isCover: isH1Cover(slide),
  }));
}

export function getFlexJustify(align?: CellAttrs['align']) {
  switch (align) {
    case 'center':
      return 'justify-center';
    case 'end':
      return 'justify-end';
    default:
      return 'justify-start';
  }
}

export function getFlexItems(justify?: CellAttrs['justify']) {
  switch (justify) {
    case 'center':
      return 'items-center';
    case 'end':
      return 'items-end';
    case 'stretch':
      return 'items-stretch';
    default:
      return 'items-start';
  }
}