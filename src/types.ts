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

export type Tier = 1 | 2 | 3;

export interface Article {
  pmid: string;
  doi: string | null;
  title: string;
  abstract: string | null;
  authors: Array<{ last_name?: string; fore_name?: string; initials?: string }>;
  journal_title_raw: string;
  journal_title: string | null;
  journal_iso: string | null;
  publication_types: string[];
  mesh_headings: string[];
  keywords: string[];
  pub_date: string | null;
  entrez_date: string | null;
  tier: Tier | null;
  type_weight: number;
  recency_weight: number;
  score: number;
  subspecialty: SubspecialtySlug;
  subspecialty_name_en: string;
  subspecialty_name_tr: string;
  subspecialty_source: "journal" | "mesh" | "title" | "default";
  ingested_at: string;
  scored_at: string | null;
}

export interface Subspecialty {
  slug: SubspecialtySlug;
  name_en: string;
  name_tr: string;
  display_order: number;
}
