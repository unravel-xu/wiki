'use client';

import { useEffect, useRef } from 'react';
import type { RevealDeckApi } from './types';

export function useRevealDeck({
  rootRef,
  slideCount,
  onReady,
  onSlideChange,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  slideCount: number;
  onReady?: (api: RevealDeckApi) => void;
  onSlideChange?: (indices: { indexh: number; indexv: number }) => void;
}) {
  const deckRef = useRef<any>(null);

  const onReadyRef = useRef(onReady);
  const onSlideChangeRef = useRef(onSlideChange);

  useEffect(() => {
    onReadyRef.current = onReady;
    onSlideChangeRef.current = onSlideChange;
  }, [onReady, onSlideChange]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!rootRef.current) return;

      const { default: Reveal } = await import('reveal.js');
      const { default: Highlight } = await import(
        'reveal.js/plugin/highlight/highlight.esm.js'
      );

      if (!mounted || !rootRef.current) return;

      if (deckRef.current) {
        try {
          await deckRef.current.destroy();
        } catch {}
        deckRef.current = null;
      }

      const isPrintPdf = new URLSearchParams(window.location.search).has('print-pdf');

      const deck = new Reveal(rootRef.current, {
        embedded: !isPrintPdf,
        controls: !isPrintPdf,
        progress: !isPrintPdf,
        center: false,
        slideNumber: isPrintPdf,
        hash: false,
        width: 1280,
        height: 720,
        margin: 0,
        backgroundTransition: 'none',
        pdfMaxPagesPerSlide: 1,
        pdfSeparateFragments: false,
        plugins: [Highlight],
      });

      deckRef.current = deck;

      deck.on('ready', () => {
        onReadyRef.current?.({
          reveal: deck,
          slideTo: (h: number, v = 0) => deck.slide(h, v),
          prev: () => deck.prev(),
          next: () => deck.next(),
          toggleOverview: () => deck.toggleOverview?.(),
          layout: () => deck.layout?.(),
          getIndices: () => {
            const indices = deck.getIndices();
            return {
              indexh: indices.h ?? 0,
              indexv: indices.v ?? 0,
            };
          },
        } as RevealDeckApi);
      });

      deck.on('slidechanged', (event: any) => {
        onSlideChangeRef.current?.({
          indexh: event.indexh ?? 0,
          indexv: event.indexv ?? 0,
        });
      });

      await deck.initialize();
      deck.layout?.();
    }

    void init();

    return () => {
      mounted = false;

      if (deckRef.current) {
        try {
          deckRef.current.destroy();
        } catch {}
        deckRef.current = null;
      }
    };
  }, [rootRef, slideCount]);

  return deckRef;
}