import { defineConfig, defineDocs, defineCollections } from 'fumadocs-mdx/config';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from "zod";

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export const project = defineCollections({
  type: "doc",
  dir: "content/project",
  files: ["*.mdx"],

  schema: pageSchema.extend({
    venue: z.enum(["CVPR", "ICML", "NeurIPS"]),
    year: z.number(),
    status: z.enum(["accepted", "submitted", "draft"]).optional(),
    track: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    links: z
      .object({
        paper: z.string().optional(),
        code: z.string().optional(),
        slides: z.string().optional(),
      })
      .optional(),
  }),
});

export default defineConfig({
  mdxOptions: {
    // MDX options
  },
});
