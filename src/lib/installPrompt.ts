"use client";

import { useSyncExternalStore } from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    /** layout.tsx 의 인라인 스크립트가 채워두는 칸. 크로미움은 로드 직후
     *  beforeinstallprompt 를 한 번 쏘고 마는데 그 시점이 리액트 하이드레이션
     *  보다 빠를 수 있어서, 스크립트가 먼저 받아두고 여기 넣어둔다. */
    __stlcInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

/** 위 칸이 바뀔 때마다 인라인 스크립트가 쏘는 신호. */
const CHANGE_EVENT = "stlc:installpromptready";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function getSnapshot(): BeforeInstallPromptEvent | null {
  return window.__stlcInstallPrompt ?? null;
}

/** 브라우저가 '설치 가능' 이라고 판단했을 때만 이벤트를 돌려준다.
 *  iOS 를 포함한 WebKit 에서는 영원히 null 이다. */
export function useInstallPromptEvent(): BeforeInstallPromptEvent | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

/** 이 이벤트는 한 번 쓰면 끝이다. 띄우고 나면 비우고 구독자에게 알린다. */
export function consumeInstallPrompt() {
  window.__stlcInstallPrompt = null;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
