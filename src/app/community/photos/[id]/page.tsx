import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHero } from "@/components/PageHero";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PostComments } from "@/components/PostComments";
import { ViewCount } from "@/components/ViewCount";
import { Icon } from "@/components/icons";
import { formatChurchDate } from "@/lib/date";
import { loadPostExtras } from "@/lib/comments";
import type { Metadata } from "next";

export async function generateMetadata(
  props: PageProps<"/community/photos/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("photo_albums")
    .select("caption")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();
  // 로그인해야 보이는 사진이라, 비로그인(검색봇·링크 미리보기 포함)에는 앨범 정보가 오지 않는다.
  // 사진이 링크 미리보기로 새어나가지 않도록 커버 이미지도 넣지 않는다.
  if (!data) return { title: "행사 사진" };
  return { title: data.caption };
}

// 성도들의 얼굴이 담긴 사진이라 로그인한 성도만 본다.
export default async function PhotoAlbumPage(props: PageProps<"/community/photos/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireUser();

  const { data: album } = await supabase
    .from("photo_albums")
    .select("id, caption, author_id, views, created_at, photo_items(id, image_url, sort_order)")
    .eq("id", id)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "photo_items", ascending: true })
    .maybeSingle();

  if (!album) notFound();

  const photos: { id: string; image_url: string }[] = album.photo_items ?? [];
  const extras = await loadPostExtras(supabase, "album", album.id, album.author_id);

  return (
    <main>
      <PageHero title={album.caption} href="/community/photos" />

      <div className="container-page py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <Link
            href="/community/photos"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-brand-600"
          >
            <Icon name="arrowRight" className="size-4 rotate-180" />
            앨범 목록
          </Link>
          <p className="text-sm text-ink-muted">
            {extras.signedIn && `${extras.authorName} · `}
            {formatChurchDate(album.created_at)} · 사진 {photos.length}장 ·{" "}
            <ViewCount kind="album" id={album.id} initialViews={album.views} />
          </p>
        </div>

        {photos.length > 0 ? (
          <div className="mt-8">
            <PhotoGallery photos={photos} title={album.caption} />
          </div>
        ) : (
          <p className="mt-8 rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
            이 앨범에는 사진이 없습니다.
          </p>
        )}

        <div className="mx-auto max-w-3xl">
          <PostComments kind="album" targetId={album.id} extras={extras} path={`/community/photos/${album.id}`} />
        </div>
      </div>
    </main>
  );
}
