import 'server-only';

import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';

import {
  escapeAttr,
  escapeHtml,
  parseLayoutBlock,
} from './reveal-slide-shared';

import type { LayoutBlock } from './types';

export type RenderedSlideContent = {
  html: string;
  layout: LayoutBlock | null;
  cellHtmlList: string[] | null;
};

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
    return { expr: raw.slice(2, -2).trim(), displayMode: true };
  }
  if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
    return { expr: raw.slice(2, -2).trim(), displayMode: true };
  }
  if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
    return { expr: raw.slice(2, -2).trim(), displayMode: false };
  }
  if (raw.startsWith('$') && raw.endsWith('$')) {
    return { expr: raw.slice(1, -1).trim(), displayMode: false };
  }
  return { expr: raw, displayMode: false };
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
      'data-latex-source',
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
    html: '',
    layout,
    cellHtmlList,
  };
}