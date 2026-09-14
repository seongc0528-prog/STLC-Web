import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHero } from "@/components/PageHero";
import { PostComments } from "@/components/PostComments";
import { ViewCount } from "@/components/ViewCount";
import { Icon } from "@/components/icons";
import { formatChurchDate } from "@/lib/date";
import { loadPostExtras } from "@/lib/comments";

type Neighbor = { id: string; title: string } | null;

function attachmentKind(url: string) {
  const ext = url.split("?")[0].match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if (ext && ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "file";
}

export default async function NoticeDetailPage(props: PageProps<"/support/news/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: notice } = await supabase
    .from("notices")
    .select("id, title, content, attachment_url, author_id, pinned, views, created_at")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (!notice) notFound();

  // 이전글 = 바로 전에 올라온 글, 다음글 = 바로 뒤에 올라온 글 (고정 여부와 무관하게 날짜순)
  const [{ data: older }, { data: newer }, extras] = await Promise.all([
    supabase
      .from("notices")
      .select("id, title")
      .eq("is_active", true)
      .lt("created_at", notice.created_at)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("notices")
      .select("id, title")
      .eq("is_active", true)
      .gt("created_at", notice.created_at)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    loadPostExtras(supabase, "notice", notice.id, notice.author_id),
  ]);

  const content: string = notice.content ?? "";
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const attachment: string | null = notice.attachment_url;
  const kind = attachment ? attachmentKind(attachment) : null;

  const neighbors: { label: string; post: Neighbor }[] = [
    { label: "다음글", post: newer },
    { label: "이전글", post: older },
  ];

  return (
    <main>
      <PageHero title="공지사항" href="/support/news" />

      <div className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/support/news"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-brand-600"
          >
            <Icon name="arrowRight" className="size-4 rotate-180" />
            목록으로
          </Link>

          <header className="mt-6 border-b border-t border-ink/15 py-6">
            {notice.pinned && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[0.6875rem] font-medium text-white">공지</span>
            )}
            <h2 className="display mt-2 text-xl leading-snug text-ink md:text-2xl">{notice.title}</h2>
            <p className="mt-3 text-sm text-ink-muted">
              {extras.signedIn && `${extras.authorName} · `}
              {formatChurchDate(notice.created_at)} ·{" "}
              <ViewCount kind="notice" id={notice.id} initialViews={notice.views} />
            </p>
          </header>

          {paragraphs.length > 0 && (
            <article className="mt-8 space-y-5">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line text-[0.9375rem] leading-[1.9] text-ink">
                  {paragraph}
                </p>
              ))}
            </article>
          )}

          {attachment && kind === "image" && (
            <a href={attachment} target="_blank" rel="noreferrer" className="mt-8 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment}
                alt={`${notice.title} 첨부 이미지`}
                className="w-full rounded-card border border-line"
              />
            </a>
          )}

          {attachment && kind !== "image" && (
            <a
              href={attachment}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex items-center gap-3 rounded-card border border-line bg-white px-5 py-4 text-sm text-ink transition hover:border-brand-600 hover:text-brand-600"
            >
              <Icon name="document" className="size-5 shrink-0 text-brand-600" />
              {kind === "pdf" ? "첨부 PDF 열기" : "첨부파일 열기"}
            </a>
          )}

          <PostComments kind="notice" targetId={notice.id} extras={extras} path={`/support/news/${notice.id}`} />

          <nav aria-label="이전글 다음글" className="mt-14 divide-y divide-line border-y border-line text-sm">
            {neighbors.map(({ label, post }) => (
              <div key={label} className="flex items-center gap-4 px-1 py-4 sm:px-3">
                <span className="w-12 shrink-0 text-ink-muted">{label}</span>
                {post ? (
                  <Link
                    href={`/support/news/${post.id}`}
                    className="truncate text-ink transition hover:text-brand-600"
                  >
                    {post.title}
                  </Link>
                ) : (
                  <span className="text-ink-muted">{label}이 없습니다.</span>
                )}
              </div>
            ))}
          </nav>

          <div className="mt-8 flex justify-center">
            <Link href="/support/news" className="btn btn-outline">
              목록으로
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
