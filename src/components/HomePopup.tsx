"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";

export type Popup = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
};

const HIDE_KEY = "stlc-popup-hidden-on";

/**
 * 링크가 이 사이트 안이면 경로로 바꿔 같은 창에서 연다.
 * 관리자가 '/support/news'로 적든 'https://<우리 도메인>/support/news'로 적든 같게 다룬다.
 * 바깥 주소는 새 창으로 연다 — 설치된 앱(standalone)에서 같은 창으로 나가면
 * 앱 화면이 외부 사이트로 바뀌어 돌아오기 불편하기 때문이다.
 */
function resolveLink(link: string): { href: string; external: boolean } {
  try {
    const url = new URL(link, window.location.origin);
    if (url.origin === window.location.origin) {
      return { href: url.pathname + url.search + url.hash, external: false };
    }
    return { href: url.href, external: true };
  } catch {
    return { href: link, external: false };
  }
}

const noSubscribe = () => () => {};

function isHiddenOn(today: string) {
  try {
    return localStorage.getItem(HIDE_KEY) === today;
  } catch {
    return false;
  }
}

export function HomePopup({ popups, today }: { popups: Popup[]; today: string }) {
  // "오늘 하루 보지 않기"는 브라우저에만 기억한다. 서버 렌더에서는 숨긴 상태로 두고
  // 하이드레이션 뒤에 브라우저 값을 읽어 연다 — 서버/클라이언트 마크업이 어긋나지 않는다.
  const hiddenToday = useSyncExternalStore(noSubscribe, () => isHiddenOn(today), () => true);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const open = popups.length > 0 && !hiddenToday && !dismissed;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDismissed(true);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % popups.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + popups.length) % popups.length);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, popups.length]);

  if (!open || popups.length === 0) return null;

  const popup = popups[index];
  const many = popups.length > 1;

  function hideToday() {
    try {
      localStorage.setItem(HIDE_KEY, today);
    } catch {}
    setDismissed(true);
  }

  // eslint-disable-next-line @next/next/no-img-element
  const image = <img src={popup.image_url} alt={popup.title} className="block max-h-[70vh] w-full object-contain" />;
  const link = popup.link_url ? resolveLink(popup.link_url) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={popup.title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={() => setDismissed(true)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-card bg-white shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-cream-200">
          {link ? (
            link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setDismissed(true)}>
                {image}
              </a>
            ) : (
              <Link href={link.href} onClick={() => setDismissed(true)}>
                {image}
              </Link>
            )
          ) : (
            image
          )}

          {many && (
            <>
              <button
                type="button"
                aria-label="이전"
                onClick={() => setIndex((i) => (i - 1 + popups.length) % popups.length)}
                className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 rotate-180 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
              >
                <Icon name="arrowRight" className="size-4" />
              </button>
              <button
                type="button"
                aria-label="다음"
                onClick={() => setIndex((i) => (i + 1) % popups.length)}
                className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
              >
                <Icon name="arrowRight" className="size-4" />
              </button>
              <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2.5 py-0.5 text-xs text-white">
                {index + 1} / {popups.length}
              </span>
            </>
          )}
        </div>

        <div className="flex divide-x divide-line border-t border-line text-sm">
          <button type="button" onClick={hideToday} className="flex-1 py-3.5 text-ink-muted transition hover:bg-brand-50">
            오늘 하루 보지 않기
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex-1 py-3.5 font-medium text-ink transition hover:bg-brand-50"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
