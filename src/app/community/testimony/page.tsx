import { requireUser } from "@/lib/auth";
import { TestimonyForm } from "@/components/TestimonyForm";

export default async function TestimonyPage() {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from("testimonies")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">은혜 간증</h1>
      <TestimonyForm />
      <ul className="flex flex-col divide-y divide-gray-100">
        {data?.map((t) => (
          <li key={t.id} className="py-4">
            <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString()}</p>
            <h2 className="text-lg font-medium text-gray-900">{t.title}</h2>
            <p className="mt-1 whitespace-pre-line text-sm text-gray-600">{t.content}</p>
          </li>
        ))}
      </ul>
      {data?.length === 0 && <p className="text-sm text-gray-400">등록된 간증이 없습니다.</p>}
    </main>
  );
}
