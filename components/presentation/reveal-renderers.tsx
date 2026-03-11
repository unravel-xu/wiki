'use client';

import {
  getFlexItems,
  getFlexJustify,
  isImageOnlyMarkdown,
  parseLayoutBlock,
} from './reveal-slide-utils';

function HtmlBlock({
  html,
  className = '',
}: {
  html: string;
  className?: string;
}) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

const baseContentClass = [
  'rd-prose prose max-w-none w-full min-w-0',
  'text-[24px] leading-[1.6]',
  'prose-h1:text-[52px] prose-h1:leading-[1.2] prose-h1:font-bold prose-h1:mb-6',
  'prose-h2:text-[38px] prose-h2:leading-[1.25] prose-h2:font-bold prose-h2:mb-5',
  'prose-h3:text-[30px] prose-h3:leading-[1.3] prose-h3:font-semibold',
  'prose-li:my-2 prose-p:my-3',
  'prose-pre:text-[20px] prose-pre:leading-snug',
  '[&>h1:first-child]:mt-0 [&>h2:first-child]:mt-0 [&>h3:first-child]:mt-0',
  '[&_.rd-img]:mx-auto [&_.rd-img]:block [&_.rd-img]:max-w-full [&_.rd-img]:object-contain',
].join(' ');

export function CoverSlide({
  slide,
  html,
  printMode = false,
}: {
  slide: string;
  html: string;
  printMode?: boolean;
}) {
  void slide;

  return (
    <div
      className={`rd-slide-root w-full bg-[var(--rd-slide-bg)] px-14 py-12 text-center text-[var(--rd-text)] ${
        printMode ? 'min-h-[210mm] h-auto flex items-center justify-center' : 'h-full flex items-center justify-center'
      }`}
    >
      <HtmlBlock
        html={html}
        className="rd-prose prose max-w-none w-full break-words prose-h1:my-0 prose-h1:text-[64px] prose-h1:leading-[1.15] prose-h1:font-extrabold"
      />
    </div>
  );
}

export function StandardSlide({
  slide,
  html,
  cellHtmlList,
  printMode = false,
}: {
  slide: string;
  html: string;
  cellHtmlList?: string[] | null;
  printMode?: boolean;
}) {
  const layout = parseLayoutBlock(slide);

  if (!layout) {
    return (
      <div
        className={`rd-slide-root w-full bg-[var(--rd-slide-bg)] text-[var(--rd-text)] ${
          printMode ? 'min-h-[210mm] h-auto' : 'h-full'
        }`}
      >
        <div
          className={`custom-slide-scroll w-full ${
            printMode ? 'h-auto overflow-visible' : 'h-full overflow-y-auto'
          }`}
          style={{ padding: printMode ? '32px 48px 48px' : '40px 60px 80px' }}
        >
          <HtmlBlock html={html} className={baseContentClass} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rd-slide-root w-full bg-[var(--rd-slide-bg)] text-[var(--rd-text)] ${
        printMode ? 'min-h-[210mm] h-auto' : 'h-full'
      }`}
    >
      <div
        className={`${printMode ? 'min-h-[210mm] h-auto' : 'h-full'} w-full p-6`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${layout.attrs.cols}, minmax(0, 1fr))`,
          gridTemplateRows: printMode
            ? undefined
            : `repeat(${layout.attrs.rows}, minmax(0, 1fr))`,
          gap: `${layout.attrs.gap}px`,
          alignItems: printMode ? 'start' : undefined,
        }}
      >
        {layout.cells.map((cell, index) => {
          const imageOnly = isImageOnlyMarkdown(cell.content);
          const cellHtml = cellHtmlList?.[index] ?? '';

          return (
            <div
              key={index}
              className={`min-w-0 flex flex-col ${
                printMode ? 'min-h-fit overflow-visible' : 'min-h-0 overflow-hidden'
              } ${cell.attrs.className ?? ''}`}
              style={{
                gridColumn: cell.attrs.col,
                gridRow: cell.attrs.row,
              }}
            >
              <div
                className={`custom-slide-scroll flex flex-col ${
                  printMode ? 'h-auto overflow-visible flex-none' : 'flex-1 overflow-y-auto'
                } ${
                  imageOnly
                    ? 'justify-center items-center'
                    : `${getFlexJustify(cell.attrs.align)} ${getFlexItems(cell.attrs.justify)}`
                }`}
                style={{ padding: cell.attrs.padding ?? '24px' }}
              >
                <HtmlBlock
                  html={cellHtml}
                  className={`${baseContentClass} ${
                    imageOnly
                      ? '[&_.rd-img]:max-h-full [&_.rd-img]:w-auto [&_.rd-img]:h-auto [&>p]:my-0 [&>p]:h-full [&>p]:w-full [&>p]:flex [&>p]:items-center [&>p]:justify-center'
                      : '[&_.rd-img]:max-h-[320px] [&_.rd-img]:w-auto'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RevealGlobalStyles() {
  return (
    <style jsx global>{`
      .reveal {
        --rd-app-bg: #f8fafc;
        --rd-slide-bg: #f8fafc;
        --rd-cell-bg: #ffffff;
        --rd-cell-border: #cbd5e1;
        --rd-text: #0f172a;
        --rd-muted: #334155;
        --rd-link: #0369a1;
        --rd-ui: #475569;
        background: var(--rd-app-bg);
        width: 100%;
        height: 100%;
      }

      @media (prefers-color-scheme: dark) {
        .reveal {
          --rd-app-bg: #111827;
          --rd-slide-bg: #111827;
          --rd-cell-bg: #1f2937;
          --rd-cell-border: #334155;
          --rd-text: #e5e7eb;
          --rd-muted: #cbd5e1;
          --rd-link: #7dd3fc;
          --rd-ui: #cbd5e1;
        }
      }

      .dark .reveal {
        --rd-app-bg: #111827;
        --rd-slide-bg: #111827;
        --rd-cell-bg: #1f2937;
        --rd-cell-border: #334155;
        --rd-text: #e5e7eb;
        --rd-muted: #cbd5e1;
        --rd-link: #7dd3fc;
        --rd-ui: #cbd5e1;
      }

      .light .reveal {
        --rd-app-bg: #f8fafc;
        --rd-slide-bg: #f8fafc;
        --rd-cell-bg: #ffffff;
        --rd-cell-border: #cbd5e1;
        --rd-text: #0f172a;
        --rd-muted: #334155;
        --rd-link: #0369a1;
        --rd-ui: #475569;
      }

      .reveal .slides {
        text-align: left;
      }

      .reveal section {
        height: 100%;
      }

      .reveal .slides section .rd-slide-root {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
      }

      .reveal .controls,
      .reveal .progress,
      .reveal .slide-number {
        color: var(--rd-ui);
      }

      .reveal .progress {
        background: transparent;
      }

      .reveal .progress span {
        background: var(--rd-ui);
      }

      .reveal .katex {
        color: inherit;
      }

      .reveal .custom-slide-scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(148, 163, 184, 0.7) transparent;
      }

      .reveal .custom-slide-scroll::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      .reveal .custom-slide-scroll::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.7);
        border-radius: 9999px;
      }

      .reveal .custom-slide-scroll::-webkit-scrollbar-track {
        background: transparent;
      }

      .reveal .rd-img {
        cursor: zoom-in;
        border-radius: 12px;
      }

      .reveal .rd-prose {
        color: var(--rd-text);
      }

      .reveal .rd-prose :where(h1, h2, h3, h4, h5, h6, strong, code) {
        color: var(--rd-text);
      }

      .reveal .rd-prose :where(p, li, blockquote, figcaption) {
        color: var(--rd-muted);
      }

      .reveal .rd-prose a {
        color: var(--rd-link);
      }

      .reveal .rd-prose hr {
        border-color: var(--rd-cell-border);
      }

      .reveal .rd-prose pre {
        background: #020617;
        color: #e2e8f0;
      }

      .reveal .rd-prose ul,
      .reveal .rd-prose ol {
        padding-left: 1.2em;
      }

      .reveal .rd-prose p,
      .reveal .rd-prose ul,
      .reveal .rd-prose ol,
      .reveal .rd-prose blockquote,
      .reveal .rd-prose pre {
        width: 100%;
      }
    `}</style>
  );
}