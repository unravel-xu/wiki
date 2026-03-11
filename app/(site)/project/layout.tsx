// app/(site)/project/layout.tsx
import type { ReactNode } from "react";

export default function ProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section className="min-h-[calc(100vh-56px)] bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </div>
    </section>
  );
}