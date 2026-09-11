import Link from "next/link";
import { Icon } from "@/components/icons";
import { youtubeThumbnail } from "@/lib/youtube";
import { formatChurchDate } from "@/lib/date";

export type SermonListItem = {
  id: string;
  title: string;
  preacher: string | null;
  scripture: string | null;
  summary: string | null;
  video_url: string | null;
  published_at: string;
};

/**
 * 설교 목록. 카드 전체가 상세 페이지 링크다.
 * file_url(주보 PDF)은 여기서 다루지 않는다 — 주보는 /support/bulletin 담당.
 */
export function SermonList({
  sermons,
  basePath,
}: {
  sermons: SermonListItem[];
  basePath: string;
}) {
  if (sermons.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
        등록된 설교가 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sermons.map((s) => {
        const thumb = youtubeThumbnail(s.video_url);
        return (
          <li key={s.id}>
            <Link
              href={`${basePath}/${s.id}`}
              className="card card-hover flex h-full flex-col overflow-hidden"
            >
              {/* 영상이 있으면 16:9 썸네일, 없으면 아이콘만 들어갈 만큼의 얕은 띠 */}
              {thumb ? (
                <div className="aspect-video bg-brand-800">
                  <img
                    src={thumb}
                    alt={s.title}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex h-16 items-center justify-center bg-brand-800">
                  <Icon name="cross" className="size-7 text-brand-400" />
                </div>
              )}

              <div className="flex flex-1 flex-col px-6 py-6">
                <p className="text-xs text-ink-muted">
                  {formatChurchDate(s.published_at)}
                </p>
                <h2 className="display mt-2 text-base text-ink">{s.title}</h2>
                {(s.preacher || s.scripture) && (
                  <p className="mt-2 text-sm text-ink-muted">
                    {s.preacher}
                    {s.preacher && s.scripture && " · "}
                    {s.scripture}
                  </p>
                )}
                {s.summary && (
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                    {s.summary}
                  </p>
                )}

                <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm text-brand-600">
                  설교 전문 보기 <Icon name="arrowRight" className="size-3.5" />
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
