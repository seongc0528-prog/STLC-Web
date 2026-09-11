import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { Icon } from "@/components/icons";
import { youtubeId } from "@/lib/youtube";

/**
 * 설교 전문 화면. 주일/수요 두 라우트가 공유한다.
 * 본문은 sermons.summary — 문단이 빈 줄로 구분된 설교 원고 전체다.
 */
export async function SermonDetail({
  id,
  serviceType,
  basePath,
}: {
  id: string;
  serviceType: "sunday" | "wednesday";
  basePath: string;
}) {
  const supabase = await createClient();
  const { data: sermon } = await supabase
    .from("sermons")
    .select("id, title, preacher, scripture, summary, video_url, published_at")
    .eq("id", id)
    .eq("service_type", serviceType)
    .eq("is_active", true)
    .maybeSingle();

  if (!sermon) notFound();

  const videoId = youtubeId(sermon.video_url);
  // supabase 타입이 생성돼 있지 않아 row가 any로 들어온다 — 여기서 좁혀 준다
  const summary: string = sermon.summary ?? "";
  const paragraphs = summary
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main>
      <PageHero title={sermon.title} href={basePath} />

      <div className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-brand-600"
          >
            <Icon name="arrowRight" className="size-4 rotate-180" />
            목록으로
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-6 text-sm text-ink-muted">
            <span>{new Date(sermon.published_at).toLocaleDateString("ko-KR")}</span>
            {sermon.preacher && <span>{sermon.preacher}</span>}
            {sermon.scripture && (
              <span className="inline-flex items-center gap-1.5 text-brand-600">
                <Icon name="book" className="size-4" />
                {sermon.scripture}
              </span>
            )}
          </div>

          {videoId && (
            <div className="mt-10 aspect-video overflow-hidden rounded-card bg-brand-800">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={sermon.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            </div>
          )}

          {paragraphs.length > 0 ? (
            <article className="mt-10 space-y-6">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line text-[0.9375rem] leading-[2] text-ink">
                  {paragraph}
                </p>
              ))}
            </article>
          ) : (
            <p className="mt-10 text-sm text-ink-muted">등록된 본문이 없습니다.</p>
          )}

          <div className="mt-14 border-t border-line pt-8">
            <Link href={basePath} className="btn btn-outline">
              목록으로
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
