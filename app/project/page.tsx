// app/project/page.tsx
import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import fg from "fast-glob";
import matter from "gray-matter";

import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/notebook/page";
import { Card } from "fumadocs-ui/components/card";
import { Tag } from "lucide-react";

type Venue = "CVPR" | "ICML" | "NeurIPS";

type ProjectEntry = {
  venue: Venue;
  year: number;
  title: string;
  slug: string; // /project/{slug}
  oneLine: string;
  status?: "accepted" | "submitted" | "draft";
  track?: string;
  keywords?: string[];
  links?: {
    paper?: string;
    code?: string;
    slides?: string;
  };
};

const venueOrder: Venue[] = ["CVPR", "ICML", "NeurIPS"];

function isVenue(v: string): v is Venue {
  return (venueOrder as string[]).includes(v);
}

/** frontmatter venue 规范化：支持 cvpr/Cvpr/CVPR 等写法 */
function normalizeVenue(v: unknown): Venue | null {
  if (typeof v !== "string") return null;
  const upper = v.trim().toUpperCase();
  return isVenue(upper) ? upper : null;
}

function coerceStatus(s: unknown): ProjectEntry["status"] | undefined {
  if (s === "accepted" || s === "submitted" || s === "draft") return s;
  return undefined;
}

function coerceLinks(x: unknown): ProjectEntry["links"] | undefined {
  if (!x || typeof x !== "object") return undefined;
  const o = x as Record<string, unknown>;
  const pick = (k: string) => (typeof o[k] === "string" ? (o[k] as string) : undefined);
  const links = { paper: pick("paper"), code: pick("code"), slides: pick("slides") };
  if (!links.paper && !links.code && !links.slides) return undefined;
  return links;
}

function coerceKeywords(x: unknown): string[] | undefined {
  if (Array.isArray(x)) return x.filter((t) => typeof t === "string") as string[];
  if (typeof x === "string") {
    const arr = x.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : undefined;
  }
  return undefined;
}

function coerceYear(x: unknown): number | null {
  if (typeof x === "number" && Number.isFinite(x)) return x;
  if (typeof x === "string") {
    const n = Number.parseInt(x, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * 扫描并读取 content/project 下的 mdx（扁平结构），生成 entries
 * 期望结构：content/project/{slug}.mdx
 * 期望 frontmatter：venue/year/title/oneLine/...
 */
async function getProjectEntries(): Promise<ProjectEntry[]> {
  const root = process.cwd();
  const contentRoot = path.join(root, "content", "project");

  // ✅ 扁平结构：content/project/*.mdx
  const files = await fg(["*.mdx"], {
    cwd: contentRoot,
    onlyFiles: true,
  });

  const entries = await Promise.all(
    files.map(async (rel) => {
      const abs = path.join(contentRoot, rel);
      const raw = await fs.readFile(abs, "utf8");
      const { data } = matter(raw);

      const slug = rel.replace(/\.mdx$/, "");

      // ✅ venue 来自 frontmatter
      const venue = normalizeVenue((data as any).venue);
      if (!venue) return null; // 没写 venue 或写错则跳过

      const year = coerceYear((data as any).year);
      if (!year) return null;

      const title = typeof (data as any).title === "string" ? (data as any).title : slug;

      // oneLine：优先 oneLine，其次 description
      const oneLine =
        typeof (data as any).oneLine === "string"
          ? (data as any).oneLine
          : typeof (data as any).description === "string"
            ? (data as any).description
            : "—";

      const entry: ProjectEntry = {
        venue,
        year,
        title,
        slug,
        oneLine,
        status: coerceStatus((data as any).status),
        track: typeof (data as any).track === "string" ? (data as any).track : undefined,
        keywords: coerceKeywords((data as any).keywords),
        links: coerceLinks((data as any).links),
      };

      return entry;
    })
  );

  return entries.filter((e): e is ProjectEntry => Boolean(e));
}

function StatusPill({
  status,
  track,
}: {
  status?: ProjectEntry["status"];
  track?: string;
}) {
  const statusLabel =
    status === "accepted"
      ? "Accepted"
      : status === "submitted"
        ? "Submitted"
        : status === "draft"
          ? "Draft"
          : undefined;

  if (!statusLabel && !track) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {statusLabel ? (
        <span className="inline-flex items-center rounded-full border border-fd-border bg-fd-accent/30 px-2 py-0.5 text-xs text-fd-foreground">
          {statusLabel}
        </span>
      ) : null}
      {track ? (
        <span className="inline-flex items-center rounded-full border border-fd-border bg-fd-background/60 px-2 py-0.5 text-xs text-fd-muted-foreground">
          {track}
        </span>
      ) : null}
    </div>
  );
}

function KeywordRow({ keywords }: { keywords?: string[] }) {
  if (!keywords?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {keywords.slice(0, 6).map((k) => (
        <span
          key={k}
          className="inline-flex items-center gap-1 rounded-full border border-fd-border bg-fd-background/60 px-2 py-0.5 text-xs text-fd-muted-foreground"
        >
          <Tag className="h-3.5 w-3.5" />
          {k}
        </span>
      ))}
    </div>
  );
}

function ProjectIndexCard({ e }: { e: ProjectEntry }) {
  // ✅ 扁平路由：不再包含 venue
  const href = `/project/${e.slug}`;

  return (
    <div className="group relative">
      <Card
        href={href}
        title={undefined}
        description={<span className="line-clamp-2">{e.oneLine}</span>}
        className="rounded-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold text-fd-foreground">{e.title}</span>
              <span className="text-xs text-fd-muted-foreground">
                · {e.venue} {e.year}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <StatusPill status={e.status} track={e.track} />
              <span className="text-xs text-fd-muted-foreground group-hover:text-fd-foreground transition-colors">
                Open →
              </span>
            </div>

            <KeywordRow keywords={e.keywords} />
          </div>
        </div>
      </Card>

      <div className="pointer-events-none absolute -inset-2 rounded-[24px] opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100">
        <div className="h-full w-full rounded-[24px] bg-[conic-gradient(from_180deg,rgba(255,255,255,0),rgba(255,255,255,0.18),rgba(255,255,255,0),rgba(255,255,255,0.12),rgba(255,255,255,0))]" />
      </div>
    </div>
  );
}

export default async function ProjectIndexPage() {
  const entries = await getProjectEntries();

  const grouped = (() => {
    const map = new Map<Venue, Map<number, ProjectEntry[]>>();
    for (const v of venueOrder) map.set(v, new Map());

    for (const e of entries) {
      const byYear = map.get(e.venue) ?? new Map<number, ProjectEntry[]>();
      if (!map.has(e.venue)) map.set(e.venue, byYear);

      if (!byYear.has(e.year)) byYear.set(e.year, []);
      byYear.get(e.year)!.push(e);
    }

    const statusRank: Record<string, number> = { accepted: 0, submitted: 1, draft: 2 };
    for (const [, byYear] of map) {
      for (const [y, list] of byYear) {
        list.sort((a, b) => {
          const ra = a.status ? statusRank[a.status] ?? 9 : 9;
          const rb = b.status ? statusRank[b.status] ?? 9 : 9;
          if (ra !== rb) return ra - rb;
          return a.title.localeCompare(b.title);
        });
        byYear.set(y, list);
      }
    }

    return map;
  })();

  return (
    <DocsPage breadcrumb={{ enabled: false }}>
      <div className="mb-2 text-sm text-fd-muted-foreground">
        <Link href="/" className="hover:text-fd-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-fd-foreground">Project</span>
      </div>

      <DocsTitle>Project</DocsTitle>
      <DocsDescription>
        按会议与年份归档研究输出。每条包含一句话 TL;DR、关键词与常用链接（paper/code/slides）。
      </DocsDescription>

      <DocsBody>
        {venueOrder.map((venue) => {
          const byYear = grouped.get(venue);
          const years = byYear ? Array.from(byYear.keys()).sort((a, b) => b - a) : [];
          if (!years.length) return null;

          return (
            <section key={venue} className="not-prose">
              <h2 className="mt-10 scroll-mt-24 text-2xl font-semibold text-fd-foreground">
                {venue}
              </h2>

              {years.map((year) => {
                const list = byYear!.get(year)!;
                if (!list.length) return null;

                return (
                  <div key={year} className="mt-6">
                    <h3 className="scroll-mt-24 text-lg font-semibold text-fd-foreground">
                      {year}
                    </h3>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((e) => (
                        <ProjectIndexCard key={`${e.slug}-${e.year}`} e={e} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}

        <div className="mt-12 not-prose rounded-2xl border border-fd-border bg-fd-background/60 p-5">
          <div className="text-sm">
            <div className="font-medium text-fd-foreground">Next step</div>
            <div className="mt-1 text-fd-muted-foreground">
              索引页已从 content/project/*.mdx 的 frontmatter（venue/year/...）自动生成。
            </div>
          </div>
        </div>
      </DocsBody>
    </DocsPage>
  );
}