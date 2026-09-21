-- ================================================================
-- 용량 사용량 — 관리자 대시보드에서 "얼마나 썼고 얼마나 남았나"를 본다.
--
-- Supabase 대시보드를 열지 않고도 DB 디스크와 Storage 사용량을 확인할 수 있게,
-- 관리자만 부를 수 있는 함수 하나로 묶어서 돌려준다. 남은 용량은 플랜 포함량을
-- 알아야 계산되므로, 한도는 DB 가 아니라 관리자 페이지 상수에 둔다
-- (STLC_Admin/src/lib/usage.ts).
--
-- pg_database_size / storage.objects 는 일반 사용자가 못 읽으므로 security definer 다.
-- ================================================================

create or replace function public.db_usage()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  select jsonb_build_object(
    'database_bytes', pg_database_size(current_database()),
    'storage_bytes', coalesce((select sum((metadata->>'size')::bigint) from storage.objects), 0),
    'tables', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'bytes', bytes, 'rows', rows)), '[]'::jsonb)
      from (
        select c.relname as name,
               pg_total_relation_size(c.oid) as bytes,
               -- reltuples 는 ANALYZE 시점의 추정치다. 정확한 행 수는 대시보드가
               -- 게시판별로 따로 센다(여기 값은 "어느 표가 큰가"를 보는 용도).
               greatest(c.reltuples, 0)::bigint as rows
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relkind = 'r'
        order by pg_total_relation_size(c.oid) desc
        limit 8
      ) t
    ),
    'buckets', (
      select coalesce(jsonb_agg(jsonb_build_object('name', name, 'bytes', bytes, 'files', files)), '[]'::jsonb)
      from (
        select bucket_id as name,
               coalesce(sum((metadata->>'size')::bigint), 0) as bytes,
               count(*)::bigint as files
        from storage.objects
        group by bucket_id
        order by 2 desc
      ) b
    )
  ) into result;

  return result;
end;
$$;

revoke execute on function public.db_usage() from public, anon;
grant execute on function public.db_usage() to authenticated;
