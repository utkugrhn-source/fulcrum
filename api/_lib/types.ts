// Shared types between API routes, scripts and the frontend.

export type SubspecialtySlug =
  | "trauma"
  | "sports"
  | "arthroplasty"
  | "spine"
  | "pediatric"
  | "hand-upper"
  | "foot-ankle"
  | "shoulder-elbow"
  | "onc"
  | "basic"
  | "general";

export const SUBSPECIALTY_SLUGS: SubspecialtySlug[] = [
  "trauma",
  "sports",
  "arthroplasty",
  "spine",
  "pediatric",
  "hand-upper",
  "foot-ankle",
  "shoulder-elbow",
  "onc",
  "basic",
  "general",
];

export type Tier = 1 | 2 | 3;

export type SubspecialtySource = "journal" | "mesh" | "title" | "default";

export interface PubMedAuthor {
  last_name?: string;
  fore_name?: string;
  initials?: string;
  affiliation?: string;
}

export interface PubMedArticle {
  pmid: string;
  doi?: string;
  title: string;
  abstract?: string;
  authors: PubMedAuthor[];
  journal_title_raw: string;
  journal_iso?: string;
  issn?: string;
  publication_types: string[];
  mesh_headings: string[];
  keywords: string[];
  pub_date?: string;       // ISO date YYYY-MM-DD
  entrez_date?: string;    // ISO datetime
}

export interface ScoredArticle extends PubMedArticle {
  tier: Tier | null;
  type_weight: number;
  recency_weight: number;
  score: number;
  subspecialty: SubspecialtySlug;
  subspecialty_source: SubspecialtySource;
  journal_id: string | null;
}

export interface JournalRow {
  id: string;
  title_full: string;
  title_iso: string | null;
  issn_print: string | null;
  issn_electronic: string | null;
  tier: Tier;
  default_subspecialty: SubspecialtySlug | null;
}
