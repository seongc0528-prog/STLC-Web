"use client";

import { useEffect, useState } from "react";

/** True once the site is running as an installed PWA (standalone window),
 *  not a regular browser tab. Notifications are gated on this: it keeps
 *  the flow aligned with "install the app to get alerts" and sidesteps
 *  browsers that can't do web push at all (iOS Safari outside of an
 *  installed app, in-app browsers like KakaoTalk's that can't install a
 *  PWA in the first place). */
export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
    const mediaStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(iosStandalone || mediaStandalone);
  }, []);

  return isStandalone;
}
