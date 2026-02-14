create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 20),
  age text not null,
  family text not null,
  housing text not null,
  occupation text not null,
  income text not null,
  experience text not null,
  nisa text not null,
  risk text not null,
  policy text not null,
  main_product text not null,
  sub_product text not null,
  invest_ratio int not null check (invest_ratio between 0 and 100),
  cash_ratio int not null check (cash_ratio between 0 and 100),
  perf_1y numeric(7,2) not null check (perf_1y between -1000 and 1000),
  perf_since numeric(7,2) not null check (perf_since between -1000 and 1000),
  note text not null check (char_length(note) between 1 and 200),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  note text default '',
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.reports enable row level security;

drop policy if exists "published posts are readable" on public.posts;
create policy "published posts are readable"
on public.posts for select
using (status = 'published');

drop policy if exists "authenticated users can insert posts" on public.posts;
create policy "authenticated users can insert posts"
on public.posts for insert
to authenticated
with check (auth.uid() = user_id and status = 'published');

drop policy if exists "reporter can read own reports" on public.reports;
create policy "reporter can read own reports"
on public.reports for select
to authenticated
using (auth.uid() = reporter_user_id);

drop policy if exists "authenticated users can create reports" on public.reports;
create policy "authenticated users can create reports"
on public.reports for insert
to authenticated
with check (auth.uid() = reporter_user_id);

create index if not exists idx_posts_status_created_at on public.posts(status, created_at desc);
create index if not exists idx_reports_post_id on public.reports(post_id);
