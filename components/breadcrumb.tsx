"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useBreadcrumb } from "fumadocs-core/breadcrumb";
import type * as PageTree from "fumadocs-core/page-tree";

type Crumb = { name: string; url?: string };

export function ProjectBreadcrumb({
  tree,
  baseLabel = "Project",
  baseHref = "/project",
}: {
  tree: PageTree.Root;
  baseLabel?: string;
  baseHref?: string;
}) {
  const pathname = usePathname();
  const raw = useBreadcrumb(pathname, tree) as Crumb[];

  const items = useMemo(() => {
    const withBase: Crumb[] = [{ name: baseLabel, url: baseHref }, ...raw];

    // ✅ 去重：同名连续节点（Cvpr/Cvpr）只保留一个
    const deduped: Crumb[] = [];
    for (const it of withBase) {
      const prev = deduped[deduped.length - 1];
      if (prev && prev.name === it.name) {
        // 如果前一个没有 url 而当前有 url，保留更“可点击”的那个
        if (!prev.url && it.url) deduped[deduped.length - 1] = it;
        continue;
      }
      deduped.push(it);
    }

    return deduped;
  }, [raw, baseLabel, baseHref]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="-mb-3 flex flex-row items-center gap-1 text-sm font-medium text-fd-muted-foreground"
    >
      {items.map((item, i) => (
        <Fragment key={`${item.name}-${i}`}>
          {i !== 0 && <ChevronRight className="size-4 shrink-0 rtl:rotate-180" />}
          {item.url ? (
            <Link href={item.url} className="truncate hover:text-fd-accent-foreground">
              {item.name}
            </Link>
          ) : (
            <span className="truncate">{item.name}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}