import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Presentation } from 'lucide-react';

import {
  getAllPresentations,
  getPresentationBySlug,
  getPresentationMarkdownBySlug,
} from '@/lib/presentations.server';
import PresentationRuntimeViewer from '@/components/presentation/presentation-runtime-viewer';
import PresentationPrintViewer from '@/components/presentation/presentation-print-viewer';
import {
  splitMarkdownSlides,
  renderSlideContent,
} from '@/components/presentation/reveal-slide-utils';

export async function generateStaticParams() {
  const presentations = await getAllPresentations();

  return presentations
    .filter((item) => item.published)
    .map((item) => ({ slug: item.slug }));
}

export default async function PresentationDetailPage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const item = await getPresentationBySlug(slug);
  if (!item || !item.published) return notFound();

  const markdown = await getPresentationMarkdownBySlug(slug);
  if (!markdown) return notFound();

  const slideMarkdownList = splitMarkdownSlides(markdown);
  const renderedSlides = slideMarkdownList.map((slideMarkdown) =>
    renderSlideContent(slideMarkdown)
  );

  const isExportPdf =
    !!searchParams &&
    Object.prototype.hasOwnProperty.call(searchParams, 'export-pdf');

  return (
    <main
      className={
        isExportPdf ? 'bg-white' : 'min-h-[calc(100vh-56px)] bg-fd-background'
      }
    >
      {!isExportPdf && (
        <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="mb-2 text-sm text-fd-muted-foreground">
            <Link
              href="/presentation"
              className="inline-flex items-center gap-1 hover:text-fd-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <span className="mx-2">/</span>
            <span className="text-fd-foreground">{item.title}</span>
          </div>

          <header className="mb-6 border-b border-fd-border pb-6">
            <div className="flex items-center gap-2">
              <Presentation className="h-4 w-4 text-fd-muted-foreground" />
              <h1 className="text-3xl font-bold tracking-tight text-fd-foreground">
                {item.title}
              </h1>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-fd-border bg-fd-background/60 px-2.5 py-1 text-xs text-fd-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-6 text-fd-muted-foreground">
              {item.summary}
            </p>
          </header>
        </section>
      )}

      {isExportPdf ? (
        <PresentationPrintViewer
          title={item.title}
          markdown={markdown}
          renderedSlides={renderedSlides}
        />
      ) : (
        <PresentationRuntimeViewer
          title={item.title}
          markdown={markdown}
          renderedSlides={renderedSlides}
        />
      )}
    </main>
  );
}