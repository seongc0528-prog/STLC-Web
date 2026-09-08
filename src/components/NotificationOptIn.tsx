"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToPush } from "@/lib/push";

export function NotificationOptIn() {
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "requesting" | "enabled" | "error">("idle");

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
    try {
      const subscription = await subscribeToPush();
      if (!subscription || !userId) {
        setStatus("error");
        return;
      }
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
      setStatus(error ? "error" : "enabled");
    } catch {
      setStatus("error");
    }
  }

  if (!userId || status === "enabled") return null;

  return (
    <button
      onClick={handleEnable}
      disabled={status === "requesting"}
      className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
    >
      {status === "requesting" ? "요청 중..." : status === "error" ? "알림 설정 실패 (다시 시도)" : "🔔 알림 받기"}
    </button>
  );
}
