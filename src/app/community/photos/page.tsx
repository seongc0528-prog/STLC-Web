import { requireUser } from "@/lib/auth";
import { NewAlbumForm } from "@/components/NewAlbumForm";

export default async function PhotosPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("photo_albums")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">행사 사진</h1>
      <NewAlbumForm />
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
