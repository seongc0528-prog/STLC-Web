-- ================================================================
-- 주간 방문자 집계
--
-- SEO 작업 뒤 "주일을 기점으로 한 주에 몇 명이 왔나"를 관리자 대시보드에서 보려면
-- 방문 기록이 필요하다. 외부 분석 도구를 붙이지 않고 최소한만 직접 센다.
--
--   · 방문자 식별은 브라우저가 만든 무작위 id(visitor_key) 하나뿐이다. IP·UA·리퍼러는
--     남기지 않으므로 개인을 특정할 수 없다.
--   · 한 방문자·하루 한 행. 같은 날 다시 오면 hits 만 올라간다
--     → 행 수 = 순 방문자, hits 합 = 페이지뷰.
--   · 날짜는 시드니 기준 — 주 경계(주일)가 교회 시간대와 맞아야 한다.
--   · 기록은 서버가 아니라 브라우저 JS 가 부르므로 크롤러·프리페치는 거의 안 잡힌다.
-- ================================================================

create table if not exists public.site_visits (
  visitor_key text not null,
  visited_on date not null,
  hits int not null default 1,
  first_seen_at timestamptz not null default now(),
  primary key (visitor_key, visited_on)
);
create index if not exists site_visits_visited_on_idx on public.site_visits (visited_on);

alter table public.site_visits enable row level security;

-- 읽기는 관리자만. 쓰기 정책은 일부러 두지 않는다 — 아래 record_visit() 로만 들어온다.
create policy "site_visits_select_admin" on public.site_visits
  for select using (public.is_admin());

create or replace function public.record_visit(visitor text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 길이만 확인해 장난 입력으로 테이블이 불어나는 것을 막는다(uuid = 36자).
  if visitor is null or length(visitor) not between 8 and 64 then
    return;
  end if;
  insert into public.site_visits (visitor_key, visited_on)
  values (visitor, (now() at time zone 'Australia/Sydney')::date)
  on conflict (visitor_key, visited_on) do update set hits = site_visits.hits + 1;
end;
$$;

revoke execute on function public.record_visit(text) from public;
grant execute on function public.record_visit(text) to anon, authenticated;

/**
 * 주(주일 시작) 단위 방문 집계. weeks 는 이번 주를 포함해 몇 주를 돌려줄지.
 * extract(dow) 는 주일이 0 이라, 날짜에서 dow 를 빼면 그 주의 주일이 된다.
 */
create or replace function public.weekly_visits(weeks int default 8)
returns table (week_start date, visitors bigint, pageviews bigint)
language sql
security definer
set search_path = public
stable
as $$
  with bounds as (
    select ((now() at time zone 'Australia/Sydney')::date
            - extract(dow from (now() at time zone 'Australia/Sydney')::date)::int
            - (greatest(coalesce(weeks, 8), 1) - 1) * 7) as since
  )
  select
    (v.visited_on - extract(dow from v.visited_on)::int)::date as week_start,
    count(*)::bigint as visitors,
    sum(v.hits)::bigint as pageviews
  from public.site_visits v, bounds b
  where public.is_admin() and v.visited_on >= b.since
  group by 1
  order by 1 desc;
$$;

revoke execute on function public.weekly_visits(int) from public, anon;
grant execute on function public.weekly_visits(int) to authenticated;
