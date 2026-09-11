"use client";

import { useClientValue } from "./useClientValue";

function getIsStandalone(): boolean {
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  const mediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
  return iosStandalone || mediaStandalone;
}

/** True once the site is running as an installed PWA (standalone window),
 *  not a regular browser tab. Notifications are gated on this: it keeps
 *  the flow aligned with "install the app to get alerts" and sidesteps
 *  browsers that can't do web push at all (iOS Safari outside of an
 *  installed app, in-app browsers like KakaoTalk's that can't install a
 *  PWA in the first place). */
export function useIsStandalone() {
  // 서버에서는 알 길이 없으니 일단 '브라우저 탭' 으로 렌더한다.
  return useClientValue(getIsStandalone, false);
}
