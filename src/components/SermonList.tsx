import { Icon } from "@/components/icons";
import { youtubeThumbnail } from "@/lib/youtube";

type Sermon = {
  id: string;
  title: string;
  preacher: string | null;
  scripture: string | null;
  summary: string | null;
  video_url: string | null;
  file_url: string | null;
  published_at: string;
};

export function SermonList({ sermons }: { sermons: Sermon[] }) {
  if (sermons.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-line px-6 py-16 text-center text-sm text-ink-muted">
        등록된 게시물이 없습니다.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sermons.map((s) => {
        const thumb = youtubeThumbnail(s.video_url);
        return (
          <li key={s.id} className="card card-hover flex flex-col overflow-hidden">
            <div className="flex aspect-video items-center justify-center bg-brand-800">
              {thumb ? (
                <img src={thumb} alt={s.title} className="size-full object-cover" loading="lazy" />
              ) : (
                <Icon name="cross" className="size-10 text-brand-500" />
              )}
            </div>

            <div className="flex flex-1 flex-col px-6 py-6">
              <p className="text-xs text-ink-muted">
                {new Date(s.published_at).toLocaleDateString("ko-KR")}
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

              <div className="mt-5 flex flex-wrap gap-4 pt-1 text-sm">
                {s.video_url && (
                  <a
                    href={s.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-brand-600 transition hover:gap-2.5"
                  >
                    영상 보기 <Icon name="arrowRight" className="size-3.5" />
                  </a>
                )}
                {s.file_url && (
                  <a
                    href={s.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-ink-muted transition hover:text-brand-600"
                  >
                    주보/첨부파일
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
