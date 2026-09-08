import { createClient } from "@/lib/supabase/server";

export default async function StaffPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("staff")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">섬기는 사람들</h1>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {data?.map((person) => (
          <div key={person.id} className="text-center">
            {person.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={person.photo_url}
                alt={person.name}
                className="mx-auto h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="mx-auto h-24 w-24 rounded-full bg-gray-200" />
            )}
            <p className="mt-2 text-sm font-medium text-gray-900">{person.name}</p>
            <p className="text-xs text-gray-500">{person.position}</p>
          </div>
        ))}
      </div>
      {data?.length === 0 && <p className="text-sm text-gray-400">정보 준비 중입니다.</p>}
    </main>
  );
}
