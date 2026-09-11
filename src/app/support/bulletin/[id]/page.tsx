import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { bulletinLabel, downloadUrl } from "@/lib/bulletin";
import { Icon } from "@/components/icons";

export default async function BulletinDetailPage(props: PageProps<"/support/bulletin/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: bulletin } = await supabase
    .from("sermons")
    .select("id, file_url, published_at")
    .eq("id", id)
    .eq("is_active", true)
    .not("file_url", "is", null)
    .maybeSingle();

  if (!bulletin?.file_url) notFound();

  const label = bulletinLabel(bulletin.published_at);

  return (
    <main>
      <PageHero title={label} href="/support/bulletin" />

      <div className="container-page py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/support/bulletin"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-brand-600"
          >
            <Icon name="arrowRight" className="size-4 rotate-180" />
            주보 목록
          </Link>

          <div className="flex flex-wrap gap-3">
            <a
              href={downloadUrl(bulletin.file_url, label)}
              className="btn btn-primary"
            >
              PDF 다운로드
            </a>
            <a
              href={bulletin.file_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              새 탭에서 열기
            </a>
          </div>
        </div>

        {/* 브라우저 내장 PDF 뷰어. iOS Safari 등 미지원 환경을 위해 위의
            "새 탭에서 열기"를 항상 함께 둔다. */}
        <div className="mt-8 overflow-hidden rounded-card border border-line bg-cream-200">
          <iframe
            src={bulletin.file_url}
            title={label}
            className="h-[min(140vw,80vh)] w-full md:h-[85vh]"
          />
        </div>
      </div>
    </main>
  );
}
