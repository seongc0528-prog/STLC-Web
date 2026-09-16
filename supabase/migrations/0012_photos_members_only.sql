-- ================================================================
-- 행사 사진을 다시 로그인한 성도에게만 연다.
--
-- 0009에서 "교회 소식"으로 옮기며 비로그인에게도 열어 두었지만,
-- 앨범에는 성도들의 얼굴이 담기므로 익명에게 공개하지 않는 편이 낫다.
-- 0001의 인증 전용 정책으로 되돌린다. 올리기·수정 정책은 그대로 둔다.
--
-- 파일 자체(member-uploads 버킷)는 0004 이후 public 이므로, 정확한 파일
-- URL을 이미 가진 사람은 여전히 원본을 직접 열 수 있다 — 주소가 무작위라
-- 추측은 안 되지만, 완전한 차단이 필요하면 버킷을 비공개로 돌리고
-- 서명 URL로 바꿔야 한다(별도 작업).
-- ================================================================

drop policy if exists "photo_albums_select_active_or_own_or_admin" on public.photo_albums;
drop policy if exists "photo_albums_select_authenticated" on public.photo_albums;
create policy "photo_albums_select_authenticated" on public.photo_albums
  for select using (
    auth.role() = 'authenticated'
    and (is_active or public.is_admin() or author_id = auth.uid())
  );

drop policy if exists "photo_items_select_visible_album" on public.photo_items;
drop policy if exists "photo_items_select_authenticated" on public.photo_items;
create policy "photo_items_select_authenticated" on public.photo_items
  for select using (
    auth.role() = 'authenticated'
    and exists (select 1 from public.photo_albums a where a.id = album_id)
  );
-- 위 exists는 photo_albums의 RLS를 따르므로, 숨긴 앨범의 사진도 함께 가려진다.
