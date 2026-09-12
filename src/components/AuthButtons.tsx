"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthButtons() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    // 조회가 실패하면 loggedIn 이 null 로 남고 이 컴포넌트는 아무것도 그리지
    // 않는다 — 로그인 버튼이 통째로 사라져 보인다. 실패해도 '로그아웃 상태'로
    // 확정지어서 최소한 로그인 링크는 남긴다.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setLoggedIn(!!data.session?.user);
      })
      .catch((err) => {
        console.error("session lookup failed:", err);
        if (!cancelled) setLoggedIn(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!cancelled) setLoggedIn(!!session?.user);
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loggedIn === null) return null;

  if (loggedIn) {
    return (
      <button
        onClick={handleLogout}
        className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition hover:border-brand-600 hover:text-brand-600"
      >
        로그아웃
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="text-sm text-ink-soft transition hover:text-brand-600"
      >
        로그인
      </Link>
      <Link
        href="/auth/signup"
        className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700"
      >
        회원가입
      </Link>
    </div>
  );
}
