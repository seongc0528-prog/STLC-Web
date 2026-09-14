"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { resizedImage } from "@/lib/image";

type Photo = { id: string; image_url: string };

/** 앨범 사진 그리드 + 눌렀을 때 뜨는 전체화면 뷰어 (좌우 넘김·스와이프·키보드). */
export function PhotoGallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [current, setCurrent] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const total = photos.length;

  const prev = () => setCurrent((i) => (i === null ? i : (i - 1 + total) % total));
  const next = () => setCurrent((i) => (i === null ? i : (i + 1) % total));

  useEffect(() => {
    if (current === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrent(null);
      if (e.key === "ArrowLeft") setCurrent((i) => (i === null ? i : (i - 1 + total) % total));
      if (e.key === "ArrowRight") setCurrent((i) => (i === null ? i : (i + 1) % total));
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [current === null, total]); // eslint-disable-line react-hooks/exhaustive-deps

  const photo = current === null ? null : photos[current];

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`${title} 사진 ${i + 1} 크게 보기`}
              className="group block aspect-square w-full overflow-hidden rounded-card bg-cream-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resizedImage(p.image_url, { width: 600, height: 600 })}
                alt=""
                loading="lazy"
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {photo && current !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} 사진 ${current + 1} / ${total}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm tabular-nums text-white/80">
              {current + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setCurrent(null)}
              aria-label="닫기"
              className="flex size-10 items-center justify-center rounded-full text-2xl leading-none transition hover:bg-white/15"
            >
              ×
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center" onClick={() => setCurrent(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={photo.id}
              src={resizedImage(photo.image_url, { width: 1600, height: 1600, resize: "contain", quality: 80 })}
              alt={`${title} 사진 ${current + 1}`}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="이전 사진"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:left-4"
                >
                  <Icon name="arrowRight" className="size-5 rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label="다음 사진"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:right-4"
                >
                  <Icon name="arrowRight" className="size-5" />
                </button>
              </>
            )}
          </div>

          <p className="px-4 py-3 text-center text-sm text-white/70">{title}</p>
        </div>
      )}
    </>
  );
}
