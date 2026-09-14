-- ================================================================
-- 1) 홈 팝업(popups)
--
-- 행사·이벤트가 있을 때 홈에 들어오면 이미지 팝업을 띄운다.
-- 게시 기간은 시드니 기준 date로 잡는다 — 시각이 없어 렌더링 타임존에 밀리지 않는다.
-- link_url은 사이트 안 경로('/support/news')나 외부 주소('https://...') 둘 다 받는다.
-- ================================================================

create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  starts_on date not null default ((now() at time zone 'Australia/Sydney')::date),
  ends_on date,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint popups_period_valid check (ends_on is null or ends_on >= starts_on)
);

alter table public.popups enable row level security;

create policy "popups_select_active_or_admin" on public.popups
  for select using (is_active or public.is_admin());
create policy "popups_admin_write" on public.popups
  for all using (public.is_admin()) with check (public.is_admin());

-- ================================================================
-- 2) 메뉴 재편: "교회 소식"(누구나) / "성도 마당"(로그인)
--
--   누구나:  오늘의 말씀 · 행사 사진 · 공지사항(notices) · 주보
--   로그인:  은혜 간증 · 선교 소식(mission_news) · 자료실 · 온라인 헌금
-- ================================================================

-- 행사 사진: 비로그인도 게시된 앨범과 사진을 본다. 올리기는 여전히 본인 계정으로만.
drop policy if exists "photo_albums_select_authenticated" on public.photo_albums;
create policy "photo_albums_select_active_or_own_or_admin" on public.photo_albums
  for select using (is_active or public.is_admin() or author_id = auth.uid());

drop policy if exists "photo_items_select_authenticated" on public.photo_items;
create policy "photo_items_select_visible_album" on public.photo_items
  for select using (
    exists (select 1 from public.photo_albums a where a.id = album_id)
  );
-- 위 exists는 photo_albums의 RLS를 그대로 따르므로, 숨긴 앨범의 사진은 비로그인에게 안 보인다.

-- 공지사항: 비로그인도 게시된 글을 본다.
drop policy if exists "notices_select_authenticated" on public.notices;
create policy "notices_select_active_or_admin" on public.notices
  for select using (is_active or public.is_admin());

-- 선교 소식: 로그인한 성도만 본다.
drop policy if exists "mission_news_select_active_or_admin" on public.mission_news;
create policy "mission_news_select_authenticated" on public.mission_news
  for select using (auth.role() = 'authenticated' and (is_active or public.is_admin()));
