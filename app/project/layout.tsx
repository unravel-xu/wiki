// app/project/layout.tsx
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { baseOptions } from "@/lib/layout.shared";
import { projectSource } from "@/lib/project";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout {...baseOptions()} tree={projectSource.getPageTree()} sidebar={{ prefetch: false }}>
      {children}
    </DocsLayout>
  );
}