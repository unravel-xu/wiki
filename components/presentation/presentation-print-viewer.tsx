'use client';

import { useEffect, useMemo } from 'react';

import { CoverSlide, StandardSlide } from '@/components/presentation/reveal-renderers';
import {
  buildSlideMetas,
  splitMarkdownSlides,
  type RenderedSlideContent,
} from '@/components/presentation/reveal-slide-utils';

export default function PresentationPrintViewer({
  title,
  markdown,
  renderedSlides,
}: {
  title: string;
  markdown: string;
  renderedSlides: RenderedSlideContent[];
}) {
  const slides = useMemo(() => splitMarkdownSlides(markdown), [markdown]);
  const metas = useMemo(() => buildSlideMetas(slides), [slides]);

  useEffect(() => {
    document.body.classList.add('presentation-print-mode');

    const timer = window.setTimeout(() => {
      window.print();
    }, 700);

    return () => {
      document.body.classList.remove('presentation-print-mode');
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <PrintGlobalStyles />

      <main className="rd-theme pdf-root min-h-screen bg-white text-[var(--rd-text)]">
        <header className="sr-only">
          <h1>{title}</h1>
        </header>

        {slides.map((slide, index) => {
          const slideMeta = metas[index];
          const rendered = renderedSlides[index];
          const html = rendered?.html ?? '';
          const cellHtmlList = rendered?.cellHtmlList ?? null;

          return (
            <section
              key={slideMeta?.id ?? `slide-${index}`}
              className="pdf-slide"
              aria-label={slideMeta?.title ?? `Slide ${index + 1}`}
            >
              <div className="pdf-slide-inner">
                {slideMeta?.isCover ? (
                  <CoverSlide slide={slide} html={html} printMode />
                ) : (
                  <StandardSlide
                    slide={slide}
                    html={html}
                    cellHtmlList={cellHtmlList}
                    printMode
                  />
                )}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}

function PrintGlobalStyles() {
  return (
    <style jsx global>{`
      @page {
        size: A4 landscape;
        margin: 0;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .rd-theme {
        --rd-app-bg: #ffffff;
        --rd-slide-bg: #f8fafc;
        --rd-cell-bg: #ffffff;
        --rd-cell-border: #cbd5e1;
        --rd-text: #0f172a;
        --rd-muted: #334155;
        --rd-link: #0369a1;
        --rd-ui: #475569;
      }

      .pdf-root {
        width: 100%;
        background: #ffffff;
        margin: 0 auto;
        padding: 0;
      }

      .pdf-slide {
        width: 297mm;
        min-height: 210mm;
        height: auto;
        margin: 0;
        page-break-after: always;
        break-after: page;
        overflow: visible;
        background: #ffffff;
      }

      .pdf-slide:last-child {
        page-break-after: auto;
        break-after: auto;
      }

      .pdf-slide-inner {
        width: 100%;
        min-height: 210mm;
        height: auto;
        overflow: visible;
      }

      .pdf-root .rd-slide-root {
        width: 100%;
        box-sizing: border-box;
      }

      .pdf-root .custom-slide-scroll {
        scrollbar-width: none;
      }

      .pdf-root .custom-slide-scroll::-webkit-scrollbar {
        display: none;
      }

      .pdf-root .rd-img {
        display: block;
        max-width: 100%;
        object-fit: contain;
        border-radius: 12px;
      }

      .pdf-root .rd-prose {
        color: var(--rd-text);
      }

      .pdf-root .rd-prose :where(h1, h2, h3, h4, h5, h6, strong, code) {
        color: var(--rd-text);
      }

      .pdf-root .rd-prose :where(p, li, blockquote, figcaption) {
        color: var(--rd-muted);
      }

      .pdf-root .rd-prose a {
        color: var(--rd-link);
        text-decoration: underline;
      }

      .pdf-root .rd-prose pre {
        background: #020617;
        color: #e2e8f0;
        white-space: pre-wrap;
        word-break: break-word;
        overflow: visible;
      }

      .pdf-root .rd-prose code {
        word-break: break-word;
      }

      .pdf-root .rd-prose img {
        max-width: 100%;
        height: auto;
      }

      .pdf-root .katex {
        color: inherit;
      }

      .pdf-root .math-error {
        color: #b91c1c;
      }

      .pdf-root .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      @media print {
        body.presentation-print-mode header,
        body.presentation-print-mode nav,
        body.presentation-print-mode footer,
        body.presentation-print-mode aside {
          display: none !important;
        }

        body.presentation-print-mode main {
          margin: 0 !important;
          padding: 0 !important;
          max-width: none !important;
          min-height: auto !important;
          background: #ffffff !important;
        }

        .pdf-root,
        .pdf-slide,
        .pdf-slide-inner,
        .pdf-root .rd-slide-root {
          break-inside: auto;
          page-break-inside: auto;
        }
      }
    `}</style>
  );
}