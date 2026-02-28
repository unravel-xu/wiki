// app/project/[slug]/page.tsx
import defaultMdxComponents from "fumadocs-ui/mdx";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectSource } from "@/lib/project";
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from "fumadocs-ui/layouts/notebook/page";

export default async function ProjectDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  // ⚠️ 这里从 [venue, slug] 变成 [slug]
  const page = projectSource.getPage([slug]);
  if (!page) return notFound();

  const MdxContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc} breadcrumb={{ enabled: false }}>
      {/* breadcrumb 不再链接到 /project/cvpr */}
      <div className="mb-2 text-sm text-fd-muted-foreground">
        <Link href="/" className="hover:text-fd-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/project" className="hover:text-fd-foreground">Project</Link>
        <span className="mx-2">/</span>
        <span className="text-fd-foreground">{page.data.title}</span>
      </div>

      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? <DocsDescription>{page.data.description}</DocsDescription> : null}

      <DocsBody>
        <MdxContent components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}