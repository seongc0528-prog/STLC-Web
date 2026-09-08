function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export type WebPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

/** Requests notification permission and returns a Web Push subscription.
 *  Throws a descriptive error (rather than failing silently) so the UI can
 *  tell the user what actually went wrong — this matters a lot on mobile,
 *  where support/permission failures are common (e.g. iOS Safari only
 *  supports this when the site has been added to the home screen). */
export async function subscribeToPush(): Promise<WebPushSubscription> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("이 브라우저는 웹 푸시를 지원하지 않습니다. (iPhone은 홈 화면에 설치한 뒤 그 앱에서 시도해 주세요)");
  }

  const permission = await Notification.requestPermission();
  if (permission === "denied") {
    throw new Error("알림 권한이 차단되어 있습니다. 브라우저 설정에서 이 사이트의 알림 권한을 허용해 주세요.");
  }
  if (permission !== "granted") {
    throw new Error("알림 권한이 허용되지 않았습니다.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
  });
  return subscription.toJSON() as WebPushSubscription;
}
