// app/(site)/project/[slug]/page.tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectSource } from "@/lib/project";

export default async function ProjectDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  const page = projectSource.getPage([slug]);
  if (!page) return notFound();

  const MdxContent = page.data.body;

  return (
    <main className="mx-auto w-full max-w-4xl">
      <div className="mb-2 text-sm text-fd-muted-foreground">
        <Link href="/" className="hover:text-fd-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/project" className="hover:text-fd-foreground">
          Project
        </Link>
        <span className="mx-2">/</span>
        <span className="text-fd-foreground">{page.data.title}</span>
      </div>

      <header className="mb-8 border-b border-fd-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-fd-foreground">
          {page.data.title}
        </h1>

        {page.data.description ? (
          <p className="mt-3 text-sm leading-6 text-fd-muted-foreground">
            {page.data.description}
          </p>
        ) : null}
      </header>

      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <MdxContent components={defaultMdxComponents} />
      </article>
    </main>
  );
}