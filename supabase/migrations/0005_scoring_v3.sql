-- Fulcrum — Scoring v0.3
-- Schema for evidence-based scoring: JIF × OCEBM × Recency × Sample-N × Open Access.
-- Run AFTER 0004_expand_journals.sql.

-- =============================================================================
-- ARTICLES: new metadata + scoring breakdown columns
-- =============================================================================
alter table public.articles
  add column if not exists pmc_id          text,
  add column if not exists sample_size     int,
  add column if not exists ocebm_level     text,     -- "1a", "1b", "2a", "2b", "3", "4", "5"
  add column if not exists jif_weight      numeric(5,3),
  add column if not exists ocebm_weight    numeric(5,3),
  add column if not exists n_weight        numeric(5,3),
  add column if not exists oa_bonus        numeric(5,3);

create index if not exists articles_pmc_idx on public.articles(pmc_id) where pmc_id is not null;
create index if not exists articles_ocebm_idx on public.articles(ocebm_level);

-- =============================================================================
-- VIEW: rebuild v_articles to surface new fields
-- =============================================================================
drop view if exists public.v_articles;

create or replace view public.v_articles as
select
  a.pmid,
  a.doi,
  a.pmc_id,
  a.title,
  a.abstract,
  a.authors,
  a.journal_title_raw,
  j.title_full        as journal_title,
  j.title_iso         as journal_iso,
  j.impact_factor     as journal_if,
  a.publication_types,
  a.mesh_headings,
  a.keywords,
  a.pub_date,
  a.entrez_date,
  a.sample_size,
  a.ocebm_level,
  a.tier,
  a.type_weight,
  a.recency_weight,
  a.jif_weight,
  a.ocebm_weight,
  a.n_weight,
  a.oa_bonus,
  a.score,
  a.subspecialty,
  s.name_en           as subspecialty_name_en,
  s.name_tr           as subspecialty_name_tr,
  a.subspecialty_source,
  a.ingested_at,
  a.scored_at
from public.articles a
left join public.journals j        on j.id = a.journal_id
left join public.subspecialties s  on s.slug = a.subspecialty;

alter view public.v_articles set (security_invoker = true);
