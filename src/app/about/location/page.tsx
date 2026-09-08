import { createClient } from "@/lib/supabase/server";

export default async function LocationPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("church_info").select("*").eq("id", 1).single();

  const mapQuery = encodeURIComponent(data?.address ?? "");

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">오시는 길</h1>
      <p className="text-lg text-gray-900">{data?.address ?? "주소 정보 준비 중입니다."}</p>
      {data?.address_en && <p className="mt-1 text-sm text-gray-500">{data.address_en}</p>}
      {data?.phone && <p className="mt-4 text-sm text-gray-600">전화: {data.phone}</p>}
      {data?.address && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          구글 지도에서 보기
        </a>
      )}
    </main>
  );
}
