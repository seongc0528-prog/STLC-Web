import { createClient } from "@/lib/supabase/server";
import { SermonList } from "@/components/SermonList";

export default async function BulletinPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">주보</h1>
      <p className="mb-8 text-sm text-gray-500">주일설교 · 수요예배 게시물의 첨부파일을 함께 확인할 수 있습니다.</p>
      <SermonList sermons={data ?? []} />
    </main>
  );
}
