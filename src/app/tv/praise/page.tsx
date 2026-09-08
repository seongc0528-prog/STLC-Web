import { createClient } from "@/lib/supabase/server";

export default async function PraisePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("praise_videos")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">찬양</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {data?.map((v) => (
          <a
            key={v.id}
            href={v.video_url}
            target="_blank"
            rel="noreferrer"
            className="block rounded border border-gray-200 p-3 hover:bg-gray-50"
          >
            {v.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.thumbnail_url} alt={v.title} className="mb-2 aspect-video w-full rounded object-cover" />
            )}
            <p className="text-sm font-medium text-gray-900">{v.title}</p>
          </a>
        ))}
      </div>
      {data?.length === 0 && <p className="text-sm text-gray-400">등록된 영상이 없습니다.</p>}
    </main>
  );
}
