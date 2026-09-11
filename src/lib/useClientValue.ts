"use client";

import { useSyncExternalStore } from "react";

/** 절대 변하지 않는다는 뜻. 이 훅이 다루는 값은 페이지 로드 시점에 정해져서
 *  끝까지 그대로라, 구독할 대상이 없다. */
function subscribe() {
  return () => {};
}

/** 서버에서는 알 수 없고 브라우저에서만 알 수 있는, 로드 후 고정된 값을 읽는다.
 *  (브라우저 종류, 디스플레이 모드처럼.)
 *
 *  effect 에서 setState 로 채우면 하이드레이션 직후 렌더가 한 번 더 도는데,
 *  useSyncExternalStore 는 서버 스냅샷과 클라이언트 스냅샷을 리액트가 직접
 *  맞춰주므로 그 왕복이 없다.
 *
 *  `getClient` 는 호출할 때마다 같은 참조를 돌려줘야 한다 (원시값이거나 캐시된
 *  객체). 매번 새 객체를 만들면 리액트가 무한 루프로 판단한다. `serverValue`
 *  역시 모듈 상수처럼 안정적인 값이어야 한다. */
export function useClientValue<T>(getClient: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribe, getClient, () => serverValue);
}
