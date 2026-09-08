import { createClient } from "@/lib/supabase/server";

export default async function PastorPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("*")
    .eq("is_senior_pastor", true)
    .eq("is_active", true)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">위임목사 소개</h1>
      {data ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
          {data.photo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo_url} alt={data.name} className="h-48 w-48 rounded object-cover" />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{data.name}</h2>
            <p className="text-sm text-gray-500">{data.position}</p>
            {data.bio && <p className="mt-4 whitespace-pre-line text-gray-700">{data.bio}</p>}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">정보 준비 중입니다.</p>
      )}
    </main>
  );
}
