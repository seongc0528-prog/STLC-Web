import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { Pagination, parsePage } from "@/components/Pagination";
import { Icon } from "@/components/icons";
import { downloadUrl, fileExtension } from "@/lib/files";
import { parseSongs, praiseLabel } from "@/lib/praise";

export const metadata: Metadata = {
  title: "찬양 콘티",
  description:
    "시드니 주님의 교회 주일 찬양 콘티와 찬양곡 목록입니다. 콘티 파일을 미리 보고 내려받을 수 있습니다.",
};

// 카드마다 곡 목록이 들어가 길어지므로 한 화면에 6개(2열 x 3행)씩 끊는다.
const PRAISE_PAGE_SIZE = 6;

export default async function PraisePage(props: PageProps<"/tv/praise">) {
  const page = parsePage((await props.searchParams).page);
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("praise_setlists")
    .select("id, service_date, title, songs, file_url", { count: "exact" })
    .eq("is_active", true)
    .order("service_date", { ascending: false })
    .range((page - 1) * PRAISE_PAGE_SIZE, page * PRAISE_PAGE_SIZE - 1);

  const setlists = data ?? [];

  return (
    <main>
      <PageHero
        title="찬양 콘티"
        href="/tv/praise"
        description="주일 예배에서 함께 부른 찬양곡 목록과 찬양팀 콘티입니다."
      />

      <div className="container-page py-16">
        {setlists.length > 0 ? (
          <ul className="grid gap-6 lg:grid-cols-2">
            {setlists.map((setlist) => {
              const label = praiseLabel(setlist.service_date, setlist.title);
              const songs = parseSongs(setlist.songs);
              const ext = setlist.file_url ? fileExtension(setlist.file_url) : null;

              return (
                <li key={setlist.id}>
                  <article className="card flex h-full flex-col px-6 py-6">
                    <header className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="display text-base text-ink">{label}</h2>
                        {setlist.title && (
                          <p className="mt-1 text-xs text-ink-muted">
                            {praiseLabel(setlist.service_date)}
                          </p>
                        )}
                      </div>
                      {ext && (
                        <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[0.6875rem] font-medium text-brand-600">
                          {ext}
                        </span>
                      )}
                    </header>

                    {songs.length > 0 ? (
                      <ol className="mt-5 flex flex-col gap-2 text-sm text-ink">
                        {songs.map((song, index) => (
                          <li key={`${song}-${index}`} className="flex gap-3">
                            <span className="w-4 shrink-0 text-right text-xs leading-5 text-ink-muted">
                              {index + 1}
                            </span>
                            <span className="min-w-0">{song}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="mt-5 text-sm text-ink-muted">찬양곡 목록이 등록되지 않았습니다.</p>
                    )}

                    {setlist.file_url && (
                      <div className="mt-auto flex items-center gap-4 pt-6 text-sm">
                        <a
                          href={setlist.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-brand-600 transition hover:gap-2.5"
                        >
                          콘티 보기 <Icon name="arrowRight" className="size-3.5" />
                        </a>
                        <a
                          href={downloadUrl(setlist.file_url, label)}
                          className="text-ink-muted transition hover:text-brand-600"
                        >
                          다운로드
                        </a>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
            등록된 찬양 콘티가 없습니다.
          </p>
        )}

        <Pagination
          page={page}
          totalCount={count ?? 0}
          basePath="/tv/praise"
          pageSize={PRAISE_PAGE_SIZE}
        />
      </div>
    </main>
  );
}
