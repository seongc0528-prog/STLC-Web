"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayInSydney } from "@/lib/date";
import type { PostKind } from "@/lib/comments";

/** "조회 N" — 열면 1 올린다. 같은 브라우저에서 같은 글은 시드니 기준 하루 한 번만 센다.
 *  서버 렌더에서 세지 않는 건 링크 prefetch·크롤러까지 조회로 잡히지 않게 하려는 것. */
export function ViewCount({ kind, id, initialViews }: { kind: PostKind; id: string; initialViews: number }) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const key = `stlc-viewed:${kind}:${id}`;
    const today = todayInSydney();
    try {
      if (localStorage.getItem(key) === today) return;
      // 요청보다 먼저 기록해서, 개발 모드의 effect 두 번 실행에도 한 번만 센다.
      localStorage.setItem(key, today);
    } catch {
      // 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)는 열 때마다 센다.
    }
    createClient()
      .rpc("increment_views", { kind, target: id })
      .then(({ data }) => {
        if (typeof data === "number") setViews(data);
      });
  }, [kind, id]);

  return <>조회 {views.toLocaleString("ko-KR")}</>;
}
