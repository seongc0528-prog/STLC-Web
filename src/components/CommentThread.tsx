"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { COMMENT_TABLES, type PostComment, type PostKind } from "@/lib/comments";
import { formatChurchDate } from "@/lib/date";
import { Icon } from "@/components/icons";

type Props = {
  kind: PostKind;
  targetId: string;
  comments: PostComment[];
  userId: string;
  isAdmin: boolean;
};

/** 로그인한 성도용 댓글 목록 + 쓰기. 지우기는 본인 댓글(관리자는 전부). */
export function CommentThread({ kind, targetId, comments, userId, isAdmin }: Props) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { table, column } = COMMENT_TABLES[kind];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    const { error } = await createClient()
      .from(table)
      .insert({ [column]: targetId, author_id: userId, content: text });
    setBusy(false);
    if (error) {
      setError("댓글을 올리지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setContent("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("댓글을 삭제할까요?")) return;
    setBusy(true);
    const { error } = await createClient().from(table).delete().eq("id", id);
    setBusy(false);
    if (error) {
      setError("댓글을 삭제하지 못했습니다.");
      return;
    }
    router.refresh();
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-14">
      <h3 id="comments-heading" className="flex items-center gap-2 text-base font-medium text-ink">
        <Icon name="chat" className="size-5 text-brand-600" />
        댓글 <span className="text-brand-600">{comments.length}</span>
      </h3>

      {comments.length > 0 ? (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {comments.map((comment) => (
            <li key={comment.id} className="px-1 py-4 sm:px-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-ink">{comment.authorName}</span>
                <span className="text-xs text-ink-muted">{formatChurchDate(comment.createdAt)}</span>
                {(comment.authorId === userId || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    disabled={busy}
                    className="ml-auto text-xs text-ink-muted transition hover:text-red-600 disabled:opacity-50"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="mt-1.5 whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink">{comment.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 border-y border-line py-6 text-center text-sm text-ink-muted">첫 댓글을 남겨 주세요.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="댓글을 입력해 주세요"
          aria-label="댓글 입력"
          className="w-full resize-y rounded-card border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-brand-600"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy || !content.trim()} className="btn btn-primary self-end disabled:opacity-50">
          {busy ? "올리는 중..." : "댓글 등록"}
        </button>
      </form>
    </section>
  );
}
