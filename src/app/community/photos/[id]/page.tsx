import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Icon } from "@/components/icons";
import { formatChurchDate } from "@/lib/date";

export default async function PhotoAlbumPage(props: PageProps<"/community/photos/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: album } = await supabase
    .from("photo_albums")
    .select("id, caption, created_at, photo_items(id, image_url, thumb_url, sort_order)")
    .eq("id", id)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "photo_items", ascending: true })
    .maybeSingle();

  if (!album) notFound();

  const photos: { id: string; image_url: string; thumb_url: string | null }[] = album.photo_items ?? [];

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
            {formatChurchDate(album.created_at)} · 사진 {photos.length}장
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
      </div>
    </main>
  );
}
