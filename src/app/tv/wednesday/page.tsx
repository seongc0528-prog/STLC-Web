import { createClient } from "@/lib/supabase/server";
import { SermonList } from "@/components/SermonList";
import { PageHero } from "@/components/PageHero";
import { Pagination, PAGE_SIZE, parsePage } from "@/components/Pagination";

export default async function WednesdayServicePage(props: PageProps<"/tv/wednesday">) {
  const page = parsePage((await props.searchParams).page);
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("sermons")
    .select("id, title, preacher, scripture, summary, video_url, published_at", {
      count: "exact",
    })
    .eq("service_type", "wednesday")
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  return (
    <main>
      <PageHero
        title="수요 예배"
        href="/tv/wednesday"
        description="수요 예배에서 전한 말씀입니다. 제목을 누르면 설교 전문을 읽을 수 있습니다."
      />

      <div className="container-page py-16">
        <SermonList sermons={data ?? []} basePath="/tv/wednesday" />
        <Pagination page={page} totalCount={count ?? 0} basePath="/tv/wednesday" />
      </div>
    </main>
  );
}
