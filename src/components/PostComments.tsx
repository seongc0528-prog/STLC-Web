import Link from "next/link";
import { CommentThread } from "@/components/CommentThread";
import { Icon } from "@/components/icons";
import type { PostExtras, PostKind } from "@/lib/comments";

/** 상세 페이지 아래 댓글 영역. 비로그인은 개수와 로그인 버튼만, 로그인하면 목록과 쓰기. */
export function PostComments({
  kind,
  targetId,
  extras,
  path,
}: {
  kind: PostKind;
  targetId: string;
  extras: PostExtras;
  /** 로그인 후 돌아올 이 글의 경로 */
  path: string;
}) {
  if (!extras.signedIn) {
    return (
      <section className="mt-14 flex flex-col items-center gap-4 rounded-card border border-line bg-white px-6 py-6 sm:flex-row sm:justify-between">
        <p className="flex items-center gap-2 text-sm text-ink">
          <Icon name="chat" className="size-5 text-brand-600" />
          댓글 <span className="font-medium text-brand-600">{extras.commentCount}</span>개
        </p>
        <Link href={`/auth/login?next=${encodeURIComponent(path)}`} className="btn btn-outline">
          로그인하고 댓글 보기
        </Link>
      </section>
    );
  }

  return (
    <CommentThread
      kind={kind}
      targetId={targetId}
      comments={extras.comments}
      userId={extras.userId}
      isAdmin={extras.isAdmin}
    />
  );
}
