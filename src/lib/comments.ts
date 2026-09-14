import type { createClient } from "./supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** 조회수·댓글이 붙는 글 종류. DB 함수(increment_views, comment_count)의 kind 값과 같다. */
export type PostKind = "album" | "notice";

export const COMMENT_TABLES = {
  album: { table: "photo_comments", column: "album_id" },
  notice: { table: "notice_comments", column: "notice_id" },
} as const;

export type PostComment = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

/** 상세 페이지에 붙는 작성자·댓글 정보.
 *  비로그인은 댓글 개수만 받는다 — 성도 이름과 댓글 내용은 로그인해야 보인다. */
export type PostExtras =
  | { signedIn: false; commentCount: number }
  | { signedIn: true; userId: string; isAdmin: boolean; authorName: string; comments: PostComment[] };

export async function loadPostExtras(
  supabase: ServerClient,
  kind: PostKind,
  targetId: string,
  postAuthorId: string | null,
): Promise<PostExtras> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    const { data } = await supabase.rpc("comment_count", { kind, target: targetId });
    return { signedIn: false, commentCount: typeof data === "number" ? data : 0 };
  }

  const { table, column } = COMMENT_TABLES[kind];
  const [{ data: rows }, { data: profile }] = await Promise.all([
    supabase
      .from(table)
      .select("id, author_id, content, created_at")
      .eq(column, targetId)
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
  ]);
  const comments = rows ?? [];

  const ids = [...new Set([postAuthorId, ...comments.map((c) => c.author_id)].filter(Boolean))];
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data } = await supabase.rpc("author_names", { ids });
    for (const row of (data ?? []) as { id: string; name: string }[]) names.set(row.id, row.name);
  }

  return {
    signedIn: true,
    userId: user.id,
    isAdmin: profile?.role === "admin",
    // 이관된 공지는 author_id 가 비어 있다 — 관리자 앱에서 올린 글이다.
    authorName: postAuthorId ? (names.get(postAuthorId) ?? "성도") : "관리자",
    comments: comments.map((c) => ({
      id: c.id,
      authorId: c.author_id,
      authorName: names.get(c.author_id) ?? "성도",
      content: c.content,
      createdAt: c.created_at,
    })),
  };
}
