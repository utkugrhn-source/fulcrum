-- Fulcrum — initial schema
-- Run in Supabase SQL Editor (Project: fulcrum, region: eu-central-1 / Frankfurt)

-- =============================================================================
-- EXTENSIONS
-- =============================================================================
create extension if not exists "pgcrypto";

-- =============================================================================
-- TABLE: subspecialties
-- =============================================================================
create table if not exists public.subspecialties (
  slug          text primary key,
  name_en       text not null,
  name_tr       text not null,
  display_order int  not null default 0,
  created_at    timestamptz not null default now()
);

-- =============================================================================
-- TABLE: journals
-- One row per journal. tier ∈ {1,2,3}.
-- default_subspecialty: best-guess subspecialty slug if a journal is dedicated.
-- NULL when the journal is generalist (e.g. JBJS Am, CORR).
-- =============================================================================
create table if not exists public.journals (
  id                    uuid primary key default gen_random_uuid(),
  nlm_id                text unique,                 -- NLM Unique ID, when available
  title_full            text not null,
  title_iso             text,
  issn_print            text,
  issn_electronic       text,
  tier                  int  not null check (tier in (1,2,3)),
  default_subspecialty  text references public.subspecialties(slug),
  active                boolean not null default true,
  created_at            timestamptz not null default now()
);

create index if not exists journals_tier_idx on public.journals(tier);
create index if not exists journals_title_idx on public.journals using gin (to_tsvector('simple', title_full));

-- =============================================================================
-- TABLE: articles
-- One row per PubMed PMID.
-- =============================================================================
create table if not exists public.articles (
  pmid                text primary key,
  doi                 text,
  title               text not null,
  abstract            text,
  authors             jsonb not null default '[]'::jsonb,
  journal_id          uuid references public.journals(id) on delete set null,
  journal_title_raw   text not null,
  publication_types   text[] not null default '{}',
  mesh_headings       text[] not null default '{}',
  keywords            text[] not null default '{}',
  pub_date            date,
  entrez_date         timestamptz,
  -- Scoring fields, recomputed every score run.
  tier                int,
  type_weight         numeric(5,3),
  recency_weight      numeric(5,3),
  score               numeric(8,2),
  subspecialty        text references public.subspecialties(slug),
  subspecialty_source text,    -- "journal" | "mesh" | "title" | "default"
  -- Bookkeeping
  ingested_at         timestamptz not null default now(),
  scored_at           timestamptz,
  raw_xml             text
);

create index if not exists articles_score_idx on public.articles(score desc);
create index if not exists articles_pubdate_idx on public.articles(pub_date desc);
create index if not exists articles_subspecialty_idx on public.articles(subspecialty);
create index if not exists articles_tier_idx on public.articles(tier);
create index if not exists articles_journal_idx on public.articles(journal_id);
create index if not exists articles_search_idx on public.articles using gin (
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,''))
);

-- =============================================================================
-- TABLE: scoring_runs
-- One row per ingest+score cron invocation.
-- =============================================================================
create table if not exists public.scoring_runs (
  id              uuid primary key default gen_random_uuid(),
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  ok              boolean,
  pubmed_query    text,
  fetched         int not null default 0,
  inserted        int not null default 0,
  updated         int not null default 0,
  scored          int not null default 0,
  errors          jsonb not null default '[]'::jsonb,
  trigger         text not null default 'cron'   -- "cron" | "manual" | "smoke"
);

create index if not exists scoring_runs_started_idx on public.scoring_runs(started_at desc);

-- =============================================================================
-- RLS — anonymous read, service insert/update
-- =============================================================================
alter table public.subspecialties enable row level security;
alter table public.journals       enable row level security;
alter table public.articles       enable row level security;
alter table public.scoring_runs   enable row level security;

-- Public read for the three "view" tables
drop policy if exists "anon read subspecialties" on public.subspecialties;
create policy "anon read subspecialties" on public.subspecialties
  for select using (true);

drop policy if exists "anon read journals" on public.journals;
create policy "anon read journals" on public.journals
  for select using (active);

drop policy if exists "anon read articles" on public.articles;
create policy "anon read articles" on public.articles
  for select using (true);

-- scoring_runs: only the service role should read/write; no anon policy.
-- (Service role bypasses RLS, so no policy required.)

-- =============================================================================
-- VIEW: articles_with_journal (handy for the frontend)
-- =============================================================================
create or replace view public.v_articles as
select
  a.pmid,
  a.doi,
  a.title,
  a.abstract,
  a.authors,
  a.journal_title_raw,
  j.title_full        as journal_title,
  j.title_iso         as journal_iso,
  a.publication_types,
  a.mesh_headings,
  a.keywords,
  a.pub_date,
  a.entrez_date,
  a.tier,
  a.type_weight,
  a.recency_weight,
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

-- Pin the view to the security invoker so RLS on the underlying tables is honoured.
alter view public.v_articles set (security_invoker = true);
