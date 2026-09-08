import { requireUser } from "@/lib/auth";

export default async function ResourcesPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("resources")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">자료실</h1>
      <ul className="flex flex-col divide-y divide-gray-100">
        {data?.map((r) => (
          <li key={r.id} className="py-4">
            <p className="text-xs text-gray-400">{r.category}</p>
            <a href={r.file_url} target="_blank" rel="noreferrer" className="text-lg font-medium text-gray-900 hover:underline">
              {r.title}
            </a>
            {r.description && <p className="mt-1 text-sm text-gray-600">{r.description}</p>}
          </li>
        ))}
      </ul>
      {data?.length === 0 && <p className="text-sm text-gray-400">등록된 자료가 없습니다.</p>}
    </main>
  );
}
