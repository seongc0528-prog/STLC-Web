import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageHero } from "@/components/PageHero";
import { NewAlbumForm } from "@/components/NewAlbumForm";
import { Pagination, parsePage } from "@/components/Pagination";
import { formatChurchDate } from "@/lib/date";
import { resizedImage } from "@/lib/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "행사 사진",
  description: "시드니 주님의 교회의 예배와 행사, 함께한 순간들을 사진으로 나눕니다.",
};

// 3열 x 4행 (모바일 2열 x 6행)
const ALBUM_PAGE_SIZE = 12;

// 성도들의 얼굴이 담긴 사진이라 보기도 올리기도 로그인한 성도만.
export default async function PhotosPage(props: PageProps<"/community/photos">) {
  const page = parsePage((await props.searchParams).page);
  const { supabase } = await requireUser();

  const { data, count } = await supabase
    .from("photo_albums")
    .select("id, caption, cover_url, created_at, photo_items(count)", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range((page - 1) * ALBUM_PAGE_SIZE, page * ALBUM_PAGE_SIZE - 1);

  const albums = data ?? [];

  return (
    <main>
      <PageHero
        title="행사 사진"
        href="/community/photos"
        description="교회의 예배와 행사, 함께한 순간들을 사진으로 나눕니다."
      />

      <div className="container-page py-16">
        <details className="mb-10 rounded-card border border-line bg-white px-5 py-4">
          <summary className="cursor-pointer text-sm font-medium text-brand-600">+ 앨범 올리기</summary>
          <div className="mt-4">
            <NewAlbumForm />
          </div>
        </details>

        {albums.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {albums.map((album) => {
              const photoCount: number = album.photo_items?.[0]?.count ?? 0;
              return (
                <li key={album.id}>
                  <Link
                    href={`/community/photos/${album.id}`}
                    className="card card-hover group flex h-full flex-col overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
                      {album.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resizedImage(album.cover_url, { width: 800, height: 600 })}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      )}
                      {photoCount > 0 && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-0.5 text-xs text-white">
                          {photoCount}장
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col px-4 py-4 sm:px-5">
                      <h2 className="line-clamp-2 text-sm font-medium text-ink transition group-hover:text-brand-600">
                        {album.caption}
                      </h2>
                      <p className="mt-auto pt-2 text-xs text-ink-muted">{formatChurchDate(album.created_at)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
            등록된 앨범이 없습니다.
          </p>
        )}

        <Pagination
          page={page}
          totalCount={count ?? 0}
          basePath="/community/photos"
          pageSize={ALBUM_PAGE_SIZE}
        />
      </div>
    </main>
  );
}
