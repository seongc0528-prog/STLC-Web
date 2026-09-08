"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToPush } from "@/lib/push";
import { useIsStandalone } from "@/lib/useIsStandalone";

export function NotificationOptIn() {
  const isStandalone = useIsStandalone();
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "enabled" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleEnable() {
    setStatus("requesting");
    setErrorMessage(null);
    try {
      const subscription = await subscribeToPush();
      if (!userId) throw new Error("로그인이 필요합니다.");

      const supabase = createClient();
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          device_type: "web",
        },
        { onConflict: "user_id,endpoint" },
      );
      if (error) throw error;
      setStatus("enabled");
    } catch (err) {
      console.error("push subscribe failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "알 수 없는 오류");
      setStatus("error");
    }
  }

  if (!isStandalone || !userId || status === "enabled") return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleEnable}
        disabled={status === "requesting"}
        className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
      >
        {status === "requesting" ? "요청 중..." : status === "error" ? "다시 시도" : "🔔 알림 받기"}
      </button>
      {status === "error" && errorMessage && (
        <p className="max-w-48 text-right text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}
