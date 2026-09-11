"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthButtons() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
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
