import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { Pagination, PAGE_SIZE, parsePage } from "@/components/Pagination";
import { Icon } from "@/components/icons";
import { formatChurchDate } from "@/lib/date";

export default async function NewsPage(props: PageProps<"/support/news">) {
  const page = parsePage((await props.searchParams).page);
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("notices")
    .select("id, title, pinned, attachment_url, created_at", { count: "exact" })
    .eq("is_active", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const notices = data ?? [];

  return (
    <main>
      <PageHero title="공지사항" href="/support/news" description="교회의 소식과 안내를 전해 드립니다." />

      <div className="container-page py-16">
        <div className="mx-auto max-w-3xl">
          {notices.length > 0 ? (
            <ul className="divide-y divide-line border-y border-ink/15">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <Link
                    href={`/support/news/${notice.id}`}
                    className="group flex flex-col gap-1.5 px-1 py-5 transition hover:bg-brand-50/60 sm:flex-row sm:items-center sm:gap-6 sm:px-3"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2.5">
                      {notice.pinned && (
                        <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[0.6875rem] font-medium text-white">
                          공지
                        </span>
                      )}
                      <span className="truncate text-[0.9375rem] text-ink transition group-hover:text-brand-600">
                        {notice.title}
                      </span>
                      {notice.attachment_url && (
                        <Icon name="document" className="size-4 shrink-0 text-ink-muted" aria-label="첨부파일" />
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-ink-muted">{formatChurchDate(notice.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
              등록된 공지사항이 없습니다.
            </p>
          )}

          <Pagination page={page} totalCount={count ?? 0} basePath="/support/news" />
        </div>
      </div>
    </main>
  );
}
