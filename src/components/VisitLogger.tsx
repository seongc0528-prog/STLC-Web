"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const VISITOR_KEY = "stlc-visitor";

/**
 * 관리자 대시보드의 주간 방문자 집계용 기록. 브라우저가 만든 무작위 id 하나만
 * 보내고(IP·UA는 남기지 않는다), 서버에서 하루 한 행으로 합친다 —
 * 행 수 = 순 방문자, hits 합 = 페이지뷰. 자세한 설계는 0015_site_visits.sql.
 *
 * 서버 렌더가 아니라 브라우저에서 부르는 이유는 ViewCount와 같다 —
 * 크롤러와 링크 프리페치를 방문으로 세지 않기 위해서다.
 */
export function VisitLogger() {
  const pathname = usePathname();
  // 저장소를 못 쓰는 브라우저(사생활 보호 모드 등)에서는 한 세션 동안만 같은 id를 쓴다.
  const fallbackId = useRef<string | null>(null);

  useEffect(() => {
    let visitor: string;
    try {
      const saved = localStorage.getItem(VISITOR_KEY);
      visitor = saved ?? crypto.randomUUID();
      if (!saved) localStorage.setItem(VISITOR_KEY, visitor);
    } catch {
      fallbackId.current ??= crypto.randomUUID();
      visitor = fallbackId.current;
    }
    // 실패해도 화면에는 영향이 없어야 하므로 결과를 보지 않는다.
    void createClient().rpc("record_visit", { visitor });
  }, [pathname]);

  return null;
}
