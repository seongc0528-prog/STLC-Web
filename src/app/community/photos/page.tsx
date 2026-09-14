import { createClient } from "@/lib/supabase/server";
import { NewAlbumForm } from "@/components/NewAlbumForm";

// 보기는 누구나, 앨범 올리기는 로그인한 성도만.
export default async function PhotosPage() {
  const supabase = await createClient();
  const [{ data: userData }, { data }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("photo_albums")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">행사 사진</h1>
      {userData.user && <NewAlbumForm />}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {data?.map((album) => (
          <div key={album.id} className="text-center">
            {album.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={album.cover_url} alt={album.caption} className="aspect-square w-full rounded object-cover" />
            ) : (
              <div className="aspect-square w-full rounded bg-gray-100" />
            )}
            <p className="mt-2 text-sm text-gray-700">{album.caption}</p>
          </div>
        ))}
      </div>
      {data?.length === 0 && <p className="text-sm text-gray-400">등록된 앨범이 없습니다.</p>}
    </main>
  );
}
