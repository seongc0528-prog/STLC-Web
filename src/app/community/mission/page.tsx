import { createClient } from "@/lib/supabase/server";

export default async function MissionNewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_news")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">선교 소식</h1>
      <ul className="flex flex-col divide-y divide-gray-100">
        {data?.map((item) => (
          <li key={item.id} className="py-4">
            <p className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</p>
            <h2 className="text-lg font-medium text-gray-900">{item.title}</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{item.content}</p>
          </li>
        ))}
      </ul>
      {data?.length === 0 && <p className="text-sm text-gray-400">등록된 소식이 없습니다.</p>}
    </main>
  );
}
