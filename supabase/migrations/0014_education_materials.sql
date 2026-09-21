-- ================================================================
-- 교육: 인터넷 신청 접수 대신 "교육 자료"를 올린다.
--
-- education_programs / education_applications 는 홈페이지에서 교육 신청을 받으려고
-- 만들었지만, 신청은 계속 교회에서 직접 받기로 했다. 대신 각 교육(직분자 제자훈련 ·
-- 대학청년 · 주일학교)에서 쓰는 자료를 관리자가 올리고 성도가 내려받게 한다.
--
-- 두 테이블 모두 운영 DB에 한 행도 없어 옮길 데이터가 없다 — 그냥 버린다.
-- education_category 이넘은 새 테이블에서 그대로 쓴다.
--
-- 자료실(resources)과 나누는 이유: 목적이 분명한 교육 자료는 교육별로 모아 두는 쪽이
-- 찾기 쉽다. 자료실은 그 밖의 서식·문서를 담는 자리로 남긴다.
-- ================================================================

create table if not exists public.education_materials (
  id uuid primary key default gen_random_uuid(),
  category public.education_category not null,
  title text not null,
  description text,
  file_url text,
  -- 자료가 다루는 날짜(강의일·주차). 비어 있으면 웹에서 등록일을 쓴다.
  material_date date,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists education_materials_category_idx
  on public.education_materials (category, sort_order, created_at desc);

alter table public.education_materials enable row level security;

-- 교육 자료는 성도 대상 — 로그인한 사람만 본다(자료실과 같은 정책).
create policy "education_materials_select_authenticated" on public.education_materials
  for select using (auth.role() = 'authenticated' and (is_active or public.is_admin()));
create policy "education_materials_admin_write" on public.education_materials
  for all using (public.is_admin()) with check (public.is_admin());

drop table if exists public.education_applications;
drop table if exists public.education_programs;
drop type if exists public.application_status;
