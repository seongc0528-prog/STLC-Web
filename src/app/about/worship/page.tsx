import { createClient } from "@/lib/supabase/server";

export default async function WorshipPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("church_info").select("*").eq("id", 1).single();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">예배 안내</h1>
      <dl className="flex flex-col gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">주일 예배</dt>
          <dd className="text-lg text-gray-900">{data?.sunday_service ?? "정보 준비 중입니다."}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">수요 예배</dt>
          <dd className="text-lg text-gray-900">{data?.wednesday_service ?? "정보 준비 중입니다."}</dd>
        </div>
      </dl>
    </main>
  );
}
