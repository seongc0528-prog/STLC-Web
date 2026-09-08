import { createClient } from "@/lib/supabase/server";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("history").select("*").order("sort_order");

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">교회 연혁</h1>
      <ol className="flex flex-col gap-4">
        {data?.map((item) => (
          <li key={item.id} className="border-l-2 border-gray-200 pl-4">
            <span className="text-sm font-semibold text-gray-900">
              {item.year}
              {item.month ? `. ${item.month}` : ""}
            </span>
            <p className="text-sm text-gray-700">{item.content}</p>
          </li>
        ))}
      </ol>
      {data?.length === 0 && <p className="text-sm text-gray-400">정보 준비 중입니다.</p>}
    </main>
  );
}
