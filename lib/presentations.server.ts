import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

import type { PresentationFrontmatter, PresentationItem } from './presentations';

const SLIDES_DIR = path.join(process.cwd(), 'content', 'slides');

function isValidDateSlug(slug: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(slug);
}

function normalizePresentation(
  slug: string,
  data: PresentationFrontmatter
): PresentationItem {
  const tags = Array.from(new Set(['weekly', ...(data.tags ?? [])]));

  return {
    slug,
    title: data.title?.trim() || slug,
    summary: data.summary?.trim() || '',
    date: slug,
    tags,
    cover: data.cover || `/api/presentation-cover/${slug}`,
    published: data.published ?? false,
  };
}

export async function getAllPresentations(): Promise<PresentationItem[]> {
  const files = await fs.readdir(SLIDES_DIR);

  const items = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const slug = file.replace(/\.md$/, '');
        if (!isValidDateSlug(slug)) return null;

        const raw = await fs.readFile(path.join(SLIDES_DIR, file), 'utf8');
        const { data } = matter(raw);

        return normalizePresentation(slug, data as PresentationFrontmatter);
      })
  );

  return items
    .filter((item): item is PresentationItem => item !== null)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPresentationBySlug(
  slug: string
): Promise<PresentationItem | null> {
  if (!isValidDateSlug(slug)) return null;

  try {
    const raw = await fs.readFile(path.join(SLIDES_DIR, `${slug}.md`), 'utf8');
    const { data } = matter(raw);

    return normalizePresentation(slug, data as PresentationFrontmatter);
  } catch {
    return null;
  }
}

export async function getPresentationMarkdownBySlug(
  slug: string
): Promise<string | null> {
  if (!isValidDateSlug(slug)) return null;

  try {
    const raw = await fs.readFile(path.join(SLIDES_DIR, `${slug}.md`), 'utf8');
    const { content } = matter(raw);

    return content;
  } catch {
    return null;
  }
}