// lib/project.ts
import { project } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";

// ✅ 确保是命名导出，不是默认导出
export const projectSource = loader({
  baseUrl: "/project",
  source: toFumadocsSource(project, []),
  plugins: [lucideIconsPlugin()],
});