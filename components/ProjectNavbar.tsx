// components/ProjectNavbar.tsx
import Link from "next/link";

export function ProjectNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          MonoWeb
        </Link>

        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/project" className="hover:text-foreground">
            Project
          </Link>
          <Link href="/docs" className="hover:text-foreground">
            Documentation
          </Link>
        </nav>
      </div>
    </header>
  );
}