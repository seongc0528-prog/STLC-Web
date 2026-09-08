import { createClient } from "@/lib/supabase/server";
import { SermonList } from "@/components/SermonList";

export default async function WednesdayServicePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("*")
    .eq("service_type", "wednesday")
    .eq("is_active", true)
    .order("published_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">수요 예배</h1>
      <SermonList sermons={data ?? []} />
    </main>
  );
}
