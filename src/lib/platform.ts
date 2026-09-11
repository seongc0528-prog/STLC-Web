/** PWA 설치 안내를 어떤 모양으로 띄울지 정하기 위한 브라우저 판별.
 *
 *  전부 브라우저에서만 의미가 있으므로 클라이언트에서만 부를 것.
 *  User-Agent 기반이라 100% 정확할 수는 없지만, 여기서 틀려도 안내 문구가
 *  한 단계 덜 친절해질 뿐 기능이 깨지지는 않는다. */

/** iOS(그리고 iPadOS). iOS 에서는 크롬/엣지/파폭도 전부 WebKit 껍데기라
 *  브라우저 종류와 무관하게 같은 제약을 받는다: `beforeinstallprompt` 가
 *  없고, 설치는 공유 시트의 '홈 화면에 추가' 로만 가능하다. */
export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return true;
  // iPadOS 13+ 는 기본값이 데스크톱 모드라 UA 에 Mac 이라고 적어 보낸다.
  // 터치 포인트 개수로 진짜 맥과 구분한다.
  return navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}

export type InAppBrowser = "kakaotalk" | "naver" | "instagram" | "facebook" | "line" | "other";

/** 카카오톡·인스타그램 등 앱 안에 내장된 웹뷰. 홈 화면 추가 자체가 막혀 있어서
 *  설치를 안내하려면 먼저 바깥 브라우저로 내보내야 한다. */
export function detectInAppBrowser(): InAppBrowser | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;

  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  if (/NAVER\(inapp/i.test(ua)) return "naver";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV/i.test(ua)) return "facebook";
  if (/\bLine\//i.test(ua)) return "line";
  if (/DaumApps|everytimeApp|KAKAOSTORY/i.test(ua)) return "other";
  return null;
}

/** 카카오톡 웹뷰만 기본 브라우저로 빠져나가는 공식 스킴을 제공한다.
 *  나머지 앱은 사용자가 직접 메뉴를 눌러야 해서 안내 문구로 대체한다. */
export function openExternalUrl(inApp: InAppBrowser): boolean {
  if (inApp !== "kakaotalk") return false;
  location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}`;
  return true;
}

const IN_APP_NAMES: Record<InAppBrowser, string> = {
  kakaotalk: "카카오톡",
  naver: "네이버 앱",
  instagram: "인스타그램",
  facebook: "페이스북",
  line: "라인",
  other: "이 앱",
};

export function inAppBrowserName(inApp: InAppBrowser): string {
  return IN_APP_NAMES[inApp];
}

export type Platform = {
  ios: boolean;
  inApp: InAppBrowser | null;
};

/** 서버 렌더 때 쓰는 값. 아무것도 모르는 상태 = 설치 안내를 띄우지 않는 상태. */
export const SERVER_PLATFORM: Platform = { ios: false, inApp: null };

let cached: Platform | null = null;

/** 판별 결과를 한 번만 계산해서 같은 객체로 돌려준다. useSyncExternalStore 의
 *  스냅샷으로 쓰려면 호출할 때마다 참조가 같아야 한다. */
export function getPlatform(): Platform {
  cached ??= { ios: isIos(), inApp: detectInAppBrowser() };
  return cached;
}
