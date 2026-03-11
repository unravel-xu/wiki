export type PresentationFrontmatter = {
  title?: string;
  summary?: string;
  tags?: string[];
  cover?: string;
  published?: boolean;
};

export type PresentationItem = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  cover: string;
  published: boolean;
};