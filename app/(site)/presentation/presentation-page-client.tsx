'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Tag } from 'lucide-react';

import type { PresentationItem } from '@/lib/presentations';

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Title A-Z', value: 'title-asc' },
  { label: 'Title Z-A', value: 'title-desc' },
] as const;

type SortValue = (typeof sortOptions)[number]['value'];

function formatDate(date: string) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function PresentationCard({
  item,
  eager = false,
}: {
  item: PresentationItem;
  eager?: boolean;
}) {
  return (
    <Link
      href={`/presentation/${item.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-fd-border bg-fd-card transition-all duration-200 hover:-translate-y-0.5 hover:border-fd-foreground/20"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-fd-accent/20">
        <Image
          src={item.cover || `/api/presentation-cover/${item.slug}`}
          alt={item.title}
          fill
          unoptimized
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80" />
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-fd-border bg-fd-background/60 px-2 py-0.5 text-xs text-fd-muted-foreground"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-lg font-semibold leading-tight text-fd-foreground">
            {item.title}
          </h2>

          <span className="shrink-0 text-xs text-fd-muted-foreground transition-colors group-hover:text-fd-foreground">
            Open →
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-fd-muted-foreground">
          {item.summary}
        </p>

        <div className="mt-4 text-xs text-fd-muted-foreground">
          {formatDate(item.date)}
        </div>
      </div>

      <div className="pointer-events-none absolute -inset-2 rounded-[24px] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100">
        <div className="h-full w-full rounded-[24px] bg-[conic-gradient(from_180deg,rgba(255,255,255,0),rgba(255,255,255,0.16),rgba(255,255,255,0),rgba(255,255,255,0.10),rgba(255,255,255,0))]" />
      </div>
    </Link>
  );
}

export default function PresentationPageClient({
  presentations,
}: {
  presentations: PresentationItem[];
}) {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [query, setQuery] = useState('');

  const publishedPresentations = useMemo(
    () => presentations.filter((item) => item.published),
    [presentations]
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();

    publishedPresentations.forEach((item) => {
      item.tags.forEach((tag) => tagSet.add(tag));
    });

    return ['all', ...Array.from(tagSet).sort((a, b) => a.localeCompare(b))];
  }, [publishedPresentations]);

  const filteredAndSorted = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = publishedPresentations.filter((item) => {
      const matchesTag =
        selectedTag === 'all' || item.tags.includes(selectedTag);

      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.summary.toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesTag && matchesQuery;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return +new Date(a.date) - +new Date(b.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'newest':
        default:
          return +new Date(b.date) - +new Date(a.date);
      }
    });
  }, [publishedPresentations, query, selectedTag, sortBy]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="mb-2 text-sm text-fd-muted-foreground">
        <Link href="/" className="hover:text-fd-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-fd-foreground">Presentation</span>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-fd-foreground">
          Presentation
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-fd-muted-foreground">
          组会汇报、reading 分享和项目展示的统一入口。你可以按主题筛选、搜索标题或标签，并按时间或标题排序。
        </p>
      </header>

      <section className="mb-8 rounded-2xl border border-fd-border bg-fd-background/60 p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fd-muted-foreground" />
              <input
                id="presentation-search"
                name="presentation-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search presentations..."
                className="h-11 w-full rounded-xl border border-fd-border bg-fd-background pl-10 pr-4 text-sm text-fd-foreground outline-none transition placeholder:text-fd-muted-foreground focus:border-fd-foreground/30"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 text-sm text-fd-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Sort</span>
              </div>

              <select
                id="presentation-sort"
                name="presentation-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortValue)}
                className="h-11 rounded-xl border border-fd-border bg-fd-background px-3 text-sm text-fd-foreground outline-none transition focus:border-fd-foreground/30"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = selectedTag === tag;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'border-fd-foreground bg-fd-foreground text-fd-background'
                      : 'border-fd-border bg-fd-background/60 text-fd-muted-foreground hover:bg-fd-accent/30 hover:text-fd-foreground',
                  ].join(' ')}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {filteredAndSorted.length > 0 ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredAndSorted.map((item, index) => (
            <PresentationCard
              key={item.slug}
              item={item}
              eager={index === 0}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-fd-border bg-fd-background/40 p-8 text-center">
          <h2 className="text-lg font-medium text-fd-foreground">
            No presentations found
          </h2>
          <p className="mt-2 text-sm text-fd-muted-foreground">
            Try changing the keyword, tag, or sort condition.
          </p>
        </section>
      )}
    </main>
  );
}