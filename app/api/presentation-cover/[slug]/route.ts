import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

import { buildPresentationCoverSvg } from '@/lib/presentation-cover';

const SLIDES_DIR = path.join(process.cwd(), 'content', 'slides');

function isValidDateSlug(slug: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(slug);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  if (!isValidDateSlug(slug)) {
    return new Response('Invalid slug', { status: 400 });
  }

  const filePath = path.join(SLIDES_DIR, `${slug}.md`);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const { data } = matter(raw);

    const title =
      typeof data.title === 'string' && data.title.trim().length > 0
        ? data.title.trim()
        : slug;

    const summary =
      typeof data.summary === 'string' && data.summary.trim().length > 0
        ? data.summary.trim()
        : '';

    const tags = Array.isArray(data.tags)
      ? data.tags.filter((item): item is string => typeof item === 'string')
      : [];

    const svg = buildPresentationCoverSvg({
      slug,
      title,
      date: slug,
      summary,
      tags: ['weekly', ...tags],
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}