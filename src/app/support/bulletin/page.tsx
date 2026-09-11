import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { PdfThumbnail } from "@/components/PdfThumbnail";
import { Pagination, parsePage } from "@/components/Pagination";
import { bulletinLabel, downloadUrl } from "@/lib/bulletin";
import { Icon } from "@/components/icons";

// 카드마다 PDF 1페이지를 실제로 렌더링하므로 설교 목록(10)보다 적게 끊는다 (3열 x 3행)
const BULLETIN_PAGE_SIZE = 9;

export default async function BulletinPage(props: PageProps<"/support/bulletin">) {
  const page = parsePage((await props.searchParams).page);
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("sermons")
    .select("id, file_url, published_at", { count: "exact" })
    .eq("is_active", true)
    .not("file_url", "is", null)
    .order("published_at", { ascending: false })
    .range((page - 1) * BULLETIN_PAGE_SIZE, page * BULLETIN_PAGE_SIZE - 1);

  const bulletins = data ?? [];

  return (
    <main>
      <PageHero
        title="주보"
        href="/support/bulletin"
        description="주일 주보를 미리 보고 PDF로 내려받을 수 있습니다."
      />

      <div className="container-page py-16">
        {bulletins.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bulletins.map((bulletin) => {
              const label = bulletinLabel(bulletin.published_at);
              return (
                <li key={bulletin.id}>
                  <div className="card card-hover flex h-full flex-col overflow-hidden">
                    <Link href={`/support/bulletin/${bulletin.id}`} aria-label={`${label} 보기`}>
                      <PdfThumbnail url={bulletin.file_url!} alt={`${label} 첫 페이지`} />
                    </Link>

                    <div className="flex flex-1 flex-col px-5 py-5">
                      <h2 className="display text-sm text-ink">{label}</h2>

                      <div className="mt-auto flex items-center gap-4 pt-4 text-sm">
                        <Link
                          href={`/support/bulletin/${bulletin.id}`}
                          className="inline-flex items-center gap-1.5 text-brand-600 transition hover:gap-2.5"
                        >
                          보기 <Icon name="arrowRight" className="size-3.5" />
                        </Link>
                        <a
                          href={downloadUrl(bulletin.file_url!, label)}
                          className="text-ink-muted transition hover:text-brand-600"
                        >
                          다운로드
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
            등록된 주보가 없습니다.
          </p>
        )}

        <Pagination
          page={page}
          totalCount={count ?? 0}
          basePath="/support/bulletin"
          pageSize={BULLETIN_PAGE_SIZE}
        />
      </div>
    </main>
  );
}
