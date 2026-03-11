export type LayoutAttrs = {
  cols: number;
  rows: number;
  gap: number;
};

export type CellAttrs = {
  col?: string;
  row?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'stretch';
  padding?: string;
  className?: string;
};

export type LayoutCell = {
  attrs: CellAttrs;
  content: string;
};

export type LayoutBlock = {
  attrs: LayoutAttrs;
  cells: LayoutCell[];
};

export type SlideMeta = {
  id: string;
  index: number;
  indexh: number;
  indexv: number;
  title: string;
  preview: string;
  isCover: boolean;
};

export type RevealDeckApi = {
  reveal: any | null;
  slideTo: (indexh: number, indexv?: number) => void;
  prev: () => void;
  next: () => void;
  toggleOverview: () => void;
  layout: () => void;
  getIndices: () => { indexh: number; indexv: number };
};