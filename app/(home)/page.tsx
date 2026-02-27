import Link from "next/link";
import Image from "next/image";

type SectionKey = "reading" | "docs" | "project" | "presentation";

const sections: Array<{
  key: SectionKey;
  title: string;
  description: string;
  href: string;
  chips: string[];
  items: Array<{ title: string; href: string; meta?: string }>;
}> = [
  {
    key: "reading",
    title: "Reading",
    description: "论文精读、主题综述与引用脉络。",
    href: "/reading", // 以后你有 content/reading 再实现对应路由
    chips: ["Paper notes", "Surveys", "Tag-based"],
    items: [
      { title: "Start here: Reading Map", href: "/reading" },
      { title: "Alignment / Safety", href: "/reading" },
      { title: "Agents / Tool Use", href: "/reading" },
    ],
  },
  {
    key: "docs",
    title: "Documentation",
    description: "课程笔记、系统化知识与可复用的技术总结。",
    href: "/docs",
    chips: ["Courses", "Systems", "Math"],
    items: [
      { title: "Open documentation", href: "/docs", meta: "current" },
      { title: "Add a new note", href: "/docs" },
      { title: "Structure & conventions", href: "/docs" },
    ],
  },
  {
    key: "project",
    title: "Project",
    description: "研究项目、实验记录、写作与投稿全流程。",
    href: "/project",
    chips: ["Experiments", "Drafts", "Submissions"],
    items: [
      { title: "Current project hub", href: "/project" },
      { title: "Experiment log", href: "/project" },
      { title: "Submission tracker", href: "/project" },
    ],
  },
  {
    key: "presentation",
    title: "Presentation",
    description: "组会 PPT、讨论纪要与 follow-ups。",
    href: "/presentation",
    chips: ["Weekly slides", "Advisor", "Reading group"],
    items: [
      { title: "Weekly slides archive", href: "/presentation" },
      { title: "Meeting notes", href: "/presentation" },
      { title: "Action items", href: "/presentation" },
    ],
  },
];

function SectionPanel({
  title,
  description,
  href,
  chips,
  items,
  defaultOpen = false,
}: {
  title: string;
  description: string;
  href: string;
  chips: string[];
  items: Array<{ title: string; href: string; meta?: string }>;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className={[
        "relative group rounded-2xl p-5 text-left shadow-sm backdrop-blur",
        "border border-white/15 bg-black/35 text-white",
        "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
        "before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-white/10",
        "before:content-[''] before:pointer-events-none",
      ].join(" ")}
      open={defaultOpen}
    >
      <summary className="list-none cursor-pointer select-none">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">{title}</h2>
              <span className="text-white/70 transition-transform group-open:rotate-90">
                ›
              </span>
            </div>
            <p className="mt-1 text-sm text-white/80">{description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/75"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={href}
            className="shrink-0 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
          >
            View all →
          </Link>
        </div>
      </summary>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.title}
            href={it.href}
            className="rounded-xl border border-white/15 bg-white/5 p-4 text-white hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{it.title}</div>
                {it.meta ? (
                  <div className="mt-1 text-xs text-white/70">{it.meta}</div>
                ) : null}
              </div>
              <span className="text-white/60">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </details>
  );
}

export default function HomePage() {
  
  return (
    <div className="home-page relative min-h-[calc(100vh-4rem)]">
      {/* 使用 100% ，继承 html/body 高度 */}
      <div className="fixed inset-0 h-full w-full -z-10">
        <Image
          src="/images/星云.jpg"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      </div>
      
      {/* Content */}
      <div className="mx-auto w-full max-w-5xl px-4 py-12 relative z-10">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            漫游档案馆
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
            LLM research notes · experiments · meetings · living knowledge base
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90"
            >
              Start Reading
            </Link>
            <a
              href="https://monoweb-blog.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15"
            >
              Visit Blog ↗
            </a>
          </div>
        </div>

        {/* Panels */}
        <div className="mt-10 grid gap-4">
          {sections.map((s) => (
            <SectionPanel
              key={s.key}
              title={s.title}
              description={s.description}
              href={s.href}
              chips={s.chips}
              items={s.items}
              defaultOpen={s.key === "docs"}
            />
          ))}
        </div>

        {/* Now */}
        <div className="mt-10 rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-sm backdrop-blur">
          <div className="text-sm font-semibold">Now</div>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>• Working on: TiARA</li>
            <li>• Reading: LoRA 改进相关论文</li>
            <li>• This week: CVPR camera ready版本</li>
          </ul>
        </div>
      </div>
    </div>
  );
}