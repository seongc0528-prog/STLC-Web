import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** Requests notification permission and returns an FCM registration token,
 *  or null if unsupported / denied. Registers the messaging service worker
 *  with the Firebase config passed via query string (kept out of the
 *  static file so there's a single source of truth: env vars). */
export async function requestFcmToken(): Promise<string | null> {
  if (typeof window === "undefined" || !(await isSupported())) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const params = new URLSearchParams(
    Object.entries(firebaseConfig).filter(([, v]) => v) as [string, string][],
  );
  const registration = await navigator.serviceWorker.register(
    `/firebase-messaging-sw.js?${params.toString()}`,
  );

  const messaging = getMessaging(getFirebaseApp());
  return getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
}
