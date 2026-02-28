"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

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
    href: "/reading",
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

/** 打字机：支持 reduced-motion；可选“停顿后保持” */
function TypewriterTitle({
  text,
  speed = 150,
  startDelay = 200,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
}) {
  const [shown, setShown] = useState("");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (prefersReduced) {
      setShown(text);
      return;
    }

    let i = 0;
    let last = performance.now();
    let started = false;

    const tick = (now: number) => {
      if (!started) {
        if (now - last >= startDelay) {
          started = true;
          last = now;
        }
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (now - last >= speed) {
        i += 1;
        setShown(text.slice(0, i));
        last = now;
      }

      if (i < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, startDelay]);

  return (
    <span className="inline-flex items-baseline">
      <span>{shown}</span>
      {/* 光标 */}
      <span
        aria-hidden
        className="ml-1 inline-block h-[1.05em] w-[2px] translate-y-[2px] bg-white/80 animate-caret"
      />
    </span>
  );
}

/** details 内容高度动画：用 max-height + opacity + translate */
function AnimatedDetails({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "grid transition-[grid-template-rows] duration-300 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      ].join(" ")}
    >
      <div
        className={[
          "overflow-hidden",
          // 内层 fade/slide
          "transition-all duration-300 ease-out",
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

function SectionPanel({
  sectionKey,
  title,
  description,
  href,
  chips,
  items,
  open,
  onToggle,
}: {
  sectionKey: SectionKey;
  title: string;
  description: string;
  href: string;
  chips: string[];
  items: Array<{ title: string; href: string; meta?: string }>;
  open: boolean;
  onToggle: (key: SectionKey) => void;
}) {
  return (
    <div
      className={[
        "relative rounded-2xl p-5 text-left shadow-sm backdrop-blur",
        "border border-white/15 bg-black/35 text-white",

        // 原本的细边框渐变（保留）
        "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
        "before:bg-gradient-to-r before:from-white/10 before:via-white/5 before:to-white/10",
        "before:content-[''] before:pointer-events-none",

        // ✅ 外发光环（在卡片外侧）
        "after:absolute after:content-[''] after:pointer-events-none",
        "after:rounded-[calc(1rem+10px)]", // 2xl(1rem) + 外扩
        "after:-inset-[10px]",            // 向外扩 10px（外发光关键）
        "after:opacity-0 after:transition-opacity after:duration-300",
        "after:blur-xl",

        // 发光颜色：你可以改透明度/渐变方向
        "after:bg-[conic-gradient(from_180deg,rgba(255,255,255,0.00),rgba(255,255,255,0.25),rgba(255,255,255,0.00),rgba(255,255,255,0.18),rgba(255,255,255,0.00))]",

        // 只在 hover / focus / open 时出现并脉冲
        "hover:after:opacity-100 focus-within:after:opacity-100",
        open ? "after:opacity-100 after:animate-haloOuter" : "hover:after:animate-haloOuter",
      ].join(" ")}
    >
      {/* header clickable */}
      <button
        type="button"
        onClick={() => onToggle(sectionKey)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight sm:text-lg">
                {title}
              </h2>
              <span
                className={[
                  "text-white/70 transition-transform duration-300 ease-out",
                  open ? "rotate-90" : "rotate-0",
                ].join(" ")}
              >
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
            className="shrink-0 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View all →
          </Link>
        </div>
      </button>

      <AnimatedDetails open={open}>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => (
            <Link
              key={it.title}
              href={it.href}
              className={[
                "rounded-xl border border-white/15 bg-white/5 p-4 text-white",
                "hover:bg-white/10 transition-colors",
                // stagger
                open ? "animate-itemIn" : "",
              ].join(" ")}
              style={
                open
                  ? ({ ["--d" as any]: `${idx * 55}ms` } as React.CSSProperties)
                  : undefined
              }
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
      </AnimatedDetails>
    </div>
  );
}

export default function HomePage() {
  // 手风琴：一次只开一个
  // const defaultKey: SectionKey = "docs";
  // const [openKey, setOpenKey] = useState<SectionKey | null>(defaultKey);
  const [openKey, setOpenKey] = useState<SectionKey | null>(null);

  const panels = useMemo(() => sections, []);

  return (
    <div className="home-page relative min-h-[calc(100svh-4rem)]">
      {/* 背景 */}
      <div className="fixed inset-0 h-[100svh] w-full -z-10 will-change-transform [transform:translateZ(0)]">
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
          <h1 className="font-bold tracking-tight text-white text-4xl sm:text-6xl md:text-7xl">
            <TypewriterTitle text="漫游档案馆" />
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80 sm:text-base">
            LLM research notes · experiments · meetings · living knowledge base
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/docs"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
            >
              Start Reading
            </Link>
            <a
              href="https://monoweb-blog.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 transition"
            >
              Visit Blog ↗
            </a>
          </div>

          {/* 轻微装饰线 */}
          <div className="mx-auto mt-10 h-px w-24 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        </div>

        {/* Panels */}
        <div className="mt-10 grid gap-4">
          {panels.map((s) => (
            <SectionPanel
              key={s.key}
              sectionKey={s.key}
              title={s.title}
              description={s.description}
              href={s.href}
              chips={s.chips}
              items={s.items}
              open={openKey === s.key}
              onToggle={(k) => setOpenKey((prev) => (prev === k ? null : k))}
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

      {/* 仅此页面用的小动画（你也可以搬到 globals.css） */}
      <style jsx global>{`
        @keyframes caret {
          0%,
          45% {
            opacity: 1;
          }
          46%,
          100% {
            opacity: 0;
          }
        }
        .animate-caret {
          animation: caret 1s steps(1, end) infinite;
        }

        @keyframes itemIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-itemIn {
          animation: itemIn 320ms ease-out both;
          animation-delay: var(--d, 0ms);
        }

        @keyframes haloOuter {
          0%   { transform: scale(0.985); opacity: .35; filter: blur(18px); }
          50%  { transform: scale(1.01);  opacity: .85; filter: blur(26px); }
          100% { transform: scale(0.985); opacity: .35; filter: blur(18px); }
        }
        .after\:animate-haloOuter::after,
        .animate-haloOuter::after {
          animation: haloOuter 1.6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .after\:animate-haloOuter::after,
          .animate-haloOuter::after {
            animation: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .after\\:animate-halo::after,
          .animate-halo::after {
            animation: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-caret,
          .animate-itemIn {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}