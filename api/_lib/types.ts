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

/** OCEBM Levels of Evidence (Oxford Centre for Evidence-Based Medicine). */
export type OcebmLevel = "1a" | "1b" | "2a" | "2b" | "3" | "4" | "5";

export interface PubMedAuthor {
  last_name?: string;
  fore_name?: string;
  initials?: string;
  affiliation?: string;
}

export interface PubMedArticle {
  pmid: string;
  doi?: string;
  pmc_id?: string;            // PMC full-text ID, when available — signals open access
  title: string;
  abstract?: string;
  authors: PubMedAuthor[];
  journal_title_raw: string;
  journal_iso?: string;
  issn?: string;
  publication_types: string[];
  mesh_headings: string[];
  keywords: string[];
  pub_date?: string;          // ISO date YYYY-MM-DD
  entrez_date?: string;       // ISO datetime
  sample_size?: number;       // extracted from abstract when present
}

export interface ScoredArticle extends PubMedArticle {
  tier: Tier | null;
  type_weight: number;        // legacy: kept for backward compatibility, equal to ocebm_weight in v0.3
  recency_weight: number;
  jif_weight: number;
  ocebm_weight: number;
  ocebm_level: OcebmLevel | null;
  n_weight: number;
  oa_bonus: number;
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
  impact_factor: number | null;
}
