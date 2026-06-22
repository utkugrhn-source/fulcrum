-- Fulcrum email subscribers (v1.0)
-- Double opt-in: pending -> confirmed; user can self-unsubscribe at any time.

create table if not exists public.email_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  status          text not null check (status in ('pending', 'confirmed', 'unsubscribed')) default 'pending',
  -- Single random token used for both confirmation and unsubscribe links.
  -- Rotated on each lifecycle change so old links die.
  token           text not null default encode(gen_random_bytes(24), 'hex'),
  language        text not null check (language in ('tr', 'en')) default 'en',
  created_at      timestamptz not null default now(),
  confirmed_at    timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at    timestamptz,
  -- IP / UA captured at signup for abuse mitigation (anti-spam audit only)
  ip              inet,
  user_agent      text
);

create index if not exists email_subscribers_status_idx
  on public.email_subscribers (status);
create index if not exists email_subscribers_token_idx
  on public.email_subscribers (token);

alter table public.email_subscribers enable row level security;

-- No public read or write. Only service_role hits this table.
-- (Implicit: with RLS on and no policies, anon/authenticated roles get nothing.)

-- =============================================================================
-- VERIFY
-- =============================================================================
-- select count(*) from public.email_subscribers;
-- select status, count(*) from public.email_subscribers group by status;
