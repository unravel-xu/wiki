"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  BookIcon,
  LibraryBig,
  FlaskConical,
  Presentation,
  ExternalLink,
  Search,
} from "lucide-react";
import { SiGithub } from 'react-icons/si'; 
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { baseOptions } from "@/lib/layout.shared";

function PillLink({
  href,
  icon,
  children,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
        "text-fd-muted-foreground hover:text-fd-foreground",
        "hover:bg-fd-accent/30",
        active ? "bg-fd-accent/40 text-fd-foreground" : "",
      ].join(" ")}
    >
      <span className="h-4 w-4">{icon}</span>
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
}

export default function HomeNavbar() {
  const pathname = usePathname();
  const { setOpenSearch } = useSearchContext();

  const opts = useMemo(() => baseOptions(), []);
  const githubUrl = opts.githubUrl;

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-fd-border bg-fd-background/95 backdrop-blur supports-[backdrop-filter]:bg-fd-background/80">
        <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-semibold text-fd-foreground">MonoWeb</span>
        </Link>

        {/* Nav pills */}
        <nav className="ml-2 hidden md:flex items-center gap-1 rounded-full border border-fd-border bg-fd-background/40 p-1">
          <PillLink
            href="/reading"
            icon={<BookIcon className="h-4 w-4" />}
            active={pathname?.startsWith("/reading")}
          >
            Reading
          </PillLink>
          <PillLink
            href="/docs"
            icon={<LibraryBig className="h-4 w-4" />}
            active={pathname?.startsWith("/docs")}
          >
            Documentation
          </PillLink>
          <PillLink
            href="/project"
            icon={<FlaskConical className="h-4 w-4" />}
            active={pathname?.startsWith("/project")}
          >
            Project
          </PillLink>
          <PillLink
            href="/presentation"
            icon={<Presentation className="h-4 w-4" />}
            active={pathname?.startsWith("/presentation")}
          >
            Presentation
          </PillLink>
        </nav>

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setOpenSearch(true)}
          className={[
            "ml-auto md:ml-4 flex items-center gap-2 rounded-full",
            "border border-fd-border bg-fd-background/40 px-3 py-1.5",
            "text-sm text-fd-muted-foreground hover:text-fd-foreground",
            "hover:bg-fd-accent/30 transition-colors",
            "w-[180px] sm:w-[240px] md:w-[320px]",
          ].join(" ")}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          <span className="truncate">Search…</span>
          <span className="ml-auto hidden sm:inline rounded-md border border-fd-border px-1.5 py-0.5 text-xs text-fd-muted-foreground">
            ⌘K
          </span>
        </button>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-fd-border bg-fd-background/40 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/30 transition-colors"
            aria-label="GitHub"
            title="GitHub"
          >
            <SiGithub className="h-4 w-4" />
          </a>

          <a
            href="https://monoweb-blog.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-fd-border bg-fd-background/40 text-fd-muted-foreground hover:text-fd-foreground hover:bg-fd-accent/30 transition-colors"
            aria-label="Blog"
            title="Blog"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}