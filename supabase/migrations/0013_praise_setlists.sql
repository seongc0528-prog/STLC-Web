-- ================================================================
-- 찬양: 영상 대신 "콘티"를 올린다.
--
-- praise_videos 는 유튜브 링크 한 줄을 받는 테이블이었지만, 실제로 찬양 영상·
-- 음원을 올릴 계획이 없다. 대신 매주 찬양팀이 쓰는 콘티 파일(PDF 등)과 그 주에
-- 부른 찬양곡 목록을 올려서, 홈페이지에서 곡 목록을 보고 콘티를 내려받게 한다.
--
-- praise_videos 는 운영 DB에 한 행도 없어 옮길 데이터가 없다 — 그냥 버린다.
--
-- songs: 한 줄에 한 곡. 관리자 페이지 textarea 로 입력하고 웹에서 줄 단위로 끊어
--        목록으로 보여 준다. 곡마다 행을 따로 두면 관리자 입력이 번거로워진다.
-- ================================================================

create table if not exists public.praise_setlists (
  id uuid primary key default gen_random_uuid(),
  -- 찬양한 주일. 시각이 없는 date 라 렌더링 타임존에 따라 밀리지 않는다(주보와 같은 방식).
  service_date date not null,
  -- 특별 찬양·절기 찬양처럼 이름을 붙이고 싶을 때만 쓴다. 비면 날짜가 제목이 된다.
  title text,
  songs text,
  file_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists praise_setlists_service_date_idx
  on public.praise_setlists (service_date desc);

alter table public.praise_setlists enable row level security;

-- 찬양은 "찬양과 예배" 섹션 — 주보·설교처럼 누구나 본다.
create policy "praise_setlists_select_active_or_admin" on public.praise_setlists
  for select using (is_active or public.is_admin());
create policy "praise_setlists_admin_write" on public.praise_setlists
  for all using (public.is_admin()) with check (public.is_admin());

drop table if exists public.praise_videos;
