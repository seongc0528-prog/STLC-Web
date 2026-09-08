import { requireUser } from "@/lib/auth";

export default async function NewsPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("notices")
    .select("*")
    .eq("is_active", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">교회 소식</h1>
      <ul className="flex flex-col divide-y divide-gray-100">
        {data?.map((n) => (
          <li key={n.id} className="py-4">
            <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</p>
            <h2 className="text-lg font-medium text-gray-900">
              {n.pinned && <span className="mr-2 text-red-500">[공지]</span>}
              {n.title}
            </h2>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{n.content}</p>
            {n.attachment_url && (
              <a href={n.attachment_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-blue-600 hover:underline">
                첨부파일
              </a>
            )}
          </li>
        ))}
      </ul>
      {data?.length === 0 && <p className="text-sm text-gray-400">등록된 소식이 없습니다.</p>}
    </main>
  );
}
