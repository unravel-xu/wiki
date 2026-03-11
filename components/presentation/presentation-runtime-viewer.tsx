'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eraser,
  Expand,
  LayoutGrid,
  PenLine,
} from 'lucide-react';

import RevealDeck from '@/components/presentation/reveal-deck';
import PresentationAnnotationLayer, {
  PresentationAnnotationLayerRef,
} from '@/components/presentation/presentation-annotation-layer';
import type { RevealDeckApi, SlideMeta } from '@/components/presentation/types';
import type { RenderedSlideContent } from '@/components/presentation/reveal-slide-utils';

const PLAYER_ID = 'presentation-player';

export default function PresentationRuntimeViewer({
  title,
  markdown,
  renderedSlides,
}: {
  title: string;
  markdown: string;
  renderedSlides: RenderedSlideContent[];
}) {
  const [deckApi, setDeckApi] = useState<RevealDeckApi | null>(null);
  const [slides, setSlides] = useState<SlideMeta[]>([]);
  const [showThumbs, setShowThumbs] = useState(false);
  const [penEnabled, setPenEnabled] = useState(false);
  const [activeIndices, setActiveIndices] = useState({ indexh: 0, indexv: 0 });

  const annotationRef = useRef<PresentationAnnotationLayerRef | null>(null);

  const handleFullscreen = () => {
    const el = document.getElementById(PLAYER_ID);
    if (!el) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen();
    }
  };

  const handleExportPdf = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('print-pdf');
    url.searchParams.set('export-pdf', '1');
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const activeFlatIndex = useMemo(() => {
    const index = slides.findIndex(
      (s) => s.indexh === activeIndices.indexh && s.indexv === activeIndices.indexv
    );
    return index >= 0 ? index : 0;
  }, [slides, activeIndices]);

  const progressText = useMemo(() => {
    return `${activeFlatIndex + 1} / ${Math.max(slides.length, 1)}`;
  }, [activeFlatIndex, slides.length]);

  const onRevealReady = useCallback((api: RevealDeckApi) => {
    setDeckApi(api);
  }, []);

  const onSlidesParsed = useCallback((parsedSlides: SlideMeta[]) => {
    setSlides(parsedSlides);
  }, []);

  const onSlideChange = useCallback((indices: { indexh: number; indexv: number }) => {
    setActiveIndices(indices);
    annotationRef.current?.clear();
  }, []);

  const goToSlide = (slide: SlideMeta) => {
    deckApi?.slideTo(slide.indexh, slide.indexv);
  };

  useEffect(() => {
    if (!deckApi) return;

    let raf1 = 0;
    let raf2 = 0;

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        deckApi.layout?.();
      });
    });

    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [deckApi, showThumbs]);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-8 md:px-6 md:pb-10">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-fd-muted-foreground">{title}</div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-fd-border bg-fd-background px-4 text-sm text-fd-foreground transition hover:bg-fd-accent"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>

            <button
              type="button"
              onClick={() => setShowThumbs((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-fd-border bg-fd-background px-4 text-sm text-fd-foreground transition hover:bg-fd-accent"
            >
              <LayoutGrid className="h-4 w-4" />
              Thumbnails
            </button>

            <button
              type="button"
              onClick={() => setPenEnabled((v) => !v)}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition ${
                penEnabled
                  ? 'border-transparent bg-fd-foreground text-fd-background'
                  : 'border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-accent'
              }`}
            >
              <PenLine className="h-4 w-4" />
              Pen
            </button>

            <button
              type="button"
              onClick={() => annotationRef.current?.clear()}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-fd-border bg-fd-background px-4 text-sm text-fd-foreground transition hover:bg-fd-accent"
            >
              <Eraser className="h-4 w-4" />
              Clear
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-fd-border bg-fd-foreground px-4 text-sm text-fd-background transition hover:opacity-90"
            >
              <Expand className="h-4 w-4" />
              Fullscreen
            </button>
          </div>
        </div>

        <div
          className={
            showThumbs
              ? 'grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]'
              : ''
          }
        >
          <div className="min-w-0">
            <div
              id={PLAYER_ID}
              className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-fd-border bg-black [&:fullscreen]:border-none [&:fullscreen]:rounded-none"
            >
              <RevealDeck
                markdown={markdown}
                renderedSlides={renderedSlides}
                onReady={onRevealReady}
                onSlidesParsed={onSlidesParsed}
                onSlideChange={onSlideChange}
              />

              <PresentationAnnotationLayer
                ref={annotationRef}
                enabled={penEnabled}
                containerId={PLAYER_ID}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-fd-muted-foreground">{progressText}</div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => deckApi?.prev()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-accent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => deckApi?.next()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-fd-border bg-fd-background text-fd-foreground hover:bg-fd-accent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {showThumbs && (
            <aside className="max-h-[calc(100vh-220px)] overflow-auto rounded-2xl border border-fd-border bg-fd-background p-3">
              <div className="mb-3 text-sm font-medium text-fd-foreground">Slides</div>

              <div className="space-y-2">
                {slides.map((slide, idx) => {
                  const active =
                    slide.indexh === activeIndices.indexh &&
                    slide.indexv === activeIndices.indexv;

                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(slide)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        active
                          ? 'border-fd-foreground bg-fd-accent'
                          : 'border-fd-border hover:bg-fd-accent/60'
                      }`}
                    >
                      <div className="mb-2 aspect-[16/9] overflow-hidden rounded-lg border border-fd-border bg-muted/40 p-2 text-xs text-fd-muted-foreground">
                        <div className="line-clamp-2 font-medium text-fd-foreground">
                          {slide.title}
                        </div>
                        <div className="mt-1 line-clamp-4">{slide.preview}</div>
                      </div>

                      <div className="text-xs text-fd-muted-foreground">
                        {idx + 1}. {slide.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}