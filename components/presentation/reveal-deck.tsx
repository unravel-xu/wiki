'use client';

import { useEffect, useMemo, useRef } from 'react';
import 'reveal.js/dist/reveal.css';
import 'reveal.js/dist/theme/white.css';
import 'reveal.js/plugin/highlight/monokai.css';

import { CoverSlide, RevealGlobalStyles, StandardSlide } from './reveal-renderers';
import { buildSlideMetas, isH1Cover, splitSlides } from './reveal-slide-utils';
import { useRevealDeck } from './use-reveal-deck';
import type { RevealDeckApi, SlideMeta } from './types';
import type { RenderedSlideContent } from './reveal-slide-utils';

export default function RevealDeck({
  markdown,
  renderedSlides,
  onReady,
  onSlidesParsed,
  onSlideChange,
}: {
  markdown: string;
  renderedSlides: RenderedSlideContent[];
  onReady?: (api: RevealDeckApi) => void;
  onSlidesParsed?: (slides: SlideMeta[]) => void;
  onSlideChange?: (indices: { indexh: number; indexv: number }) => void;
}) {
  const revealRootRef = useRef<HTMLDivElement | null>(null);

  const slides = useMemo(() => splitSlides(markdown), [markdown]);
  const slideMetas = useMemo(() => buildSlideMetas(slides), [slides]);

  useEffect(() => {
    onSlidesParsed?.(slideMetas);
  }, [slideMetas, onSlidesParsed]);

  useRevealDeck({
    rootRef: revealRootRef,
    slideCount: renderedSlides.length,
    onReady,
    onSlideChange,
  });

  return (
    <div ref={revealRootRef} className="reveal h-full w-full">
      <RevealGlobalStyles />

      <div className="slides">
        {slides.map((slide, index) => {
          const slideMeta = slideMetas[index];
          const rendered = renderedSlides[index];
          const html = rendered?.html ?? '';
          const cellHtmlList = rendered?.cellHtmlList ?? null;

          return (
            <section key={slideMeta.id} data-slide-id={slideMeta.id}>
              {isH1Cover(slide) ? (
                <CoverSlide slide={slide} html={html} />
              ) : (
                <StandardSlide
                  slide={slide}
                  html={html}
                  cellHtmlList={cellHtmlList}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}