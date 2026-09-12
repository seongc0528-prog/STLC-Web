"use client";

import { useState } from "react";
import Link from "next/link";
import { consumeInstallPrompt, useInstallPromptEvent } from "@/lib/installPrompt";
import { getPlatform, inAppBrowserName, openExternalUrl, SERVER_PLATFORM } from "@/lib/platform";
import { useClientValue } from "@/lib/useClientValue";
import { useIsStandalone } from "@/lib/useIsStandalone";

const DISMISS_KEY = "stlc:install-prompt-dismissed-at";
/** 한 번 닫으면 이 기간만큼 다시 띄우지 않는다. iOS 는 설치 여부를 알아낼
 *  방법이 홈 화면에서 직접 열어보는 것뿐이라, 닫기 기록이 없으면 이미 설치한
 *  사람에게도 브라우저로 들어올 때마다 계속 뜬다. */
const SNOOZE_DAYS = 14;

function isSnoozed(): boolean {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
    if (!dismissedAt) return false;
    return Date.now() - dismissedAt < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    // 사파리 프라이빗 모드 등에서 localStorage 가 막혀 있으면 그냥 띄운다.
    return false;
  }
}

/** iOS 공유 버튼 모양(네모에서 화살표가 위로). 문구만으로는 어느 버튼인지
 *  못 찾는 사람이 많아서 아이콘을 같이 보여준다. */
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="공유"
      role="img"
      className="inline-block h-4 w-4 shrink-0 align-text-bottom"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15V3" />
      <path d="m8 7 4-4 4 4" />
      <path d="M6 12H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

const buttonClass = "shrink-0 rounded bg-white px-3 py-1 font-medium text-gray-900";

export function InstallPrompt() {
  const isStandalone = useIsStandalone();
  const { ios, inApp } = useClientValue(getPlatform, SERVER_PLATFORM);
  const snoozed = useClientValue(isSnoozed, true);
  const installEvent = useInstallPromptEvent();
  const [dismissed, setDismissed] = useState(false);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // 저장이 막혀 있어도 이번 세션 동안은 닫힌 상태를 유지한다.
    }
    setDismissed(true);
  }

  // 이미 앱으로 실행 중이면 설치를 권할 이유가 없다.
  if (isStandalone || snoozed || dismissed) return null;

  // 어떤 모양으로 띄울지. 인앱 웹뷰가 가장 앞인 건, 카카오톡 웹뷰 안의
  // 아이폰도 결국 iOS 지만 거기서는 '홈 화면에 추가' 자체가 불가능해서
  // 공유 시트를 안내해봐야 헛걸음이기 때문이다.
  if (inApp) {
    return (
      <Banner
        onDismiss={dismiss}
        message={
          <span>
            {inAppBrowserName(inApp)} 안에서는 앱을 설치할 수 없어요.{" "}
            {inApp === "kakaotalk" ? (
              "아래 버튼으로 브라우저에서 열어주세요."
            ) : (
              <>
                화면 구석의 <b className="font-medium">메뉴(⋮ 또는 ···)</b>를 눌러{" "}
                <b className="font-medium">&lsquo;다른 브라우저로 열기&rsquo;</b>를 선택해주세요.
              </>
            )}
          </span>
        }
        action={
          inApp === "kakaotalk" ? (
            <button onClick={() => openExternalUrl(inApp)} className={buttonClass}>
              브라우저로 열기
            </button>
          ) : undefined
        }
      />
    );
  }

  // iOS 에는 설치를 띄우는 API 가 아예 없다 (크롬·엣지로 열어도 속은 WebKit
  // 이라 마찬가지다). 공유 시트로 직접 가도록 안내하는 수밖에 없다.
  if (ios) {
    return (
      <Banner
        onDismiss={dismiss}
        message={
          <span>
            홈 화면에 추가하면 앱처럼 쓰고 알림도 받을 수 있어요. 아래 <ShareIcon /> 공유 버튼을
            누른 뒤 <b className="font-medium">&lsquo;홈 화면에 추가&rsquo;</b>를 선택하세요.
          </span>
        }
        action={
          <Link href="/install" className={buttonClass}>
            그림으로 보기
          </Link>
        }
      />
    );
  }

  // 크로미움 계열. 브라우저가 설치 가능하다고 판단해야만 이벤트를 준다.
  if (!installEvent) return null;

  return (
    <Banner
      onDismiss={dismiss}
      message="홈 화면에 앱으로 설치하면 더 편하게 이용하고, 알림도 받을 수 있어요."
      action={
        <button
          onClick={async () => {
            await installEvent.prompt();
            await installEvent.userChoice;
            // 수락했든 거절했든 이 이벤트는 재사용할 수 없다.
            consumeInstallPrompt();
          }}
          className={buttonClass}
        >
          설치하기
        </button>
      }
    />
  );
}

function Banner({
  message,
  action,
  onDismiss,
}: {
  message: React.ReactNode;
  /** 오른쪽에 붙는 버튼. iOS 처럼 누를 게 없는 경우엔 생략한다. */
  action?: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-start gap-3 bg-gray-900 px-4 py-2 text-sm text-white">
      <div className="flex-1 leading-relaxed">{message}</div>
      {action}
      <button
        onClick={onDismiss}
        aria-label="설치 안내 닫기"
        className="-mr-1 shrink-0 rounded px-2 py-1 text-lg leading-none text-gray-400 hover:text-white"
      >
        &times;
      </button>
    </div>
  );
}
