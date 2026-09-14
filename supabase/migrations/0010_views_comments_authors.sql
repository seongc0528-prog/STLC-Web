-- ================================================================
-- 행사 사진(앨범) · 공지사항 상세의 조회수 / 댓글 / 작성자 이름
--
--   조회수   : 누구나 본다. 올리는 건 increment_views() 로만 (같은 브라우저 하루 1회는 웹에서 거른다).
--   댓글     : 비로그인은 개수만(comment_count), 로그인하면 읽기·쓰기·본인 삭제.
--   작성자   : 로그인한 사용자에게만 이름을 보여 준다(author_names). 관리자 계정은 "관리자"로.
--
-- profiles 에는 email·phone 이 있어서 테이블 select 를 넓히지 않고,
-- 이름만 돌려주는 security definer 함수로 연다.
-- ================================================================

-- 1) 공지 댓글 — photo_comments 와 같은 모양
create table if not exists public.notice_comments (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.notices(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists notice_comments_notice_id_idx on public.notice_comments (notice_id);

alter table public.notice_comments enable row level security;

create policy "notice_comments_select_authenticated" on public.notice_comments
  for select using (auth.role() = 'authenticated');
create policy "notice_comments_insert_own" on public.notice_comments
  for insert with check (author_id = auth.uid());
create policy "notice_comments_delete_own_or_admin" on public.notice_comments
  for delete using (author_id = auth.uid() or public.is_admin());

-- 2) 조회수 +1 — 비로그인은 update 권한이 없으므로 함수로만 올린다. 게시 중인 글만.
create or replace function public.increment_views(kind text, target uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  result integer;
begin
  if kind = 'album' then
    update public.photo_albums set views = views + 1
      where id = target and is_active returning views into result;
  elsif kind = 'notice' then
    update public.notices set views = views + 1
      where id = target and is_active returning views into result;
  else
    raise exception 'unknown kind: %', kind;
  end if;
  return result;
end;
$$;

revoke execute on function public.increment_views(text, uuid) from public;
grant execute on function public.increment_views(text, uuid) to anon, authenticated;

-- 3) 댓글 개수 — 비로그인에게 "댓글 N개"를 보여 주기 위한 것. 내용·작성자는 안 나간다.
create or replace function public.comment_count(kind text, target uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select case kind
    when 'album' then (
      select count(*)::int from public.photo_comments c
      join public.photo_albums a on a.id = c.album_id
      where c.album_id = target and c.is_active and a.is_active
    )
    when 'notice' then (
      select count(*)::int from public.notice_comments c
      join public.notices n on n.id = c.notice_id
      where c.notice_id = target and c.is_active and n.is_active
    )
  end;
$$;

revoke execute on function public.comment_count(text, uuid) from public;
grant execute on function public.comment_count(text, uuid) to anon, authenticated;

-- 4) 작성자 이름 — 로그인한 사용자만. 관리자 계정의 글·댓글은 "관리자"로 표시한다.
create or replace function public.author_names(ids uuid[])
returns table (id uuid, name text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, case when p.role = 'admin' then '관리자' else p.name end
  from public.profiles p
  where auth.uid() is not null and p.id = any(ids);
$$;

revoke execute on function public.author_names(uuid[]) from public, anon;
grant execute on function public.author_names(uuid[]) to authenticated;
