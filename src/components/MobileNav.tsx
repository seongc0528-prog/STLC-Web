'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NAV_SECTIONS } from '@/lib/nav'
import { DrawerAccount } from '@/components/DrawerAccount'
import { Logomark } from '@/components/icons'

export function MobileNav() {
  // 드로어 안의 모든 Link는 onClick에서 직접 닫는다(effect로 pathname을 감시하면
  // react-hooks/set-state-in-effect에 걸린다).
  const [open, setOpen] = useState(false)

  // 드로어가 열려 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="전체 메뉴 열기"
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-full border border-line text-ink transition hover:border-brand-600 hover:text-brand-600 lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* 드로어는 항상 마운트해 두고 transform만 바꾼다 — 열고 닫을 때 모두 슬라이드된다. */}
      <div
        className={`fixed inset-0 z-[60] overflow-hidden lg:hidden ${
          open ? '' : 'pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-brand-900/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* 패널: 웜 아이보리 + 골드 테두리 — 흰 헤더와도, 초록 히어로와도 경계가 선다.
            높이는 dvh로 잡는다. 모바일 브라우저에서 fixed 요소의 100%는 주소창을 포함한
            large viewport라, inset-y-0 로 두면 하단 로그인 바가 화면 밖으로 밀린다. */}
        <div
          className={`absolute top-0 right-0 flex h-[100dvh] max-h-[100dvh] w-[min(21rem,86vw)] flex-col border-l-4 border-[#c8a04a] bg-[#f6f3ea] shadow-[-18px_0_40px_rgba(15,36,18,0.28)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="전체 메뉴"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[#e0d7bf] bg-[#efe9d8] px-5 py-4">
            <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
              <Logomark className="size-8" />
              <span className="font-serif text-sm font-semibold text-ink">시드니 주님의 교회</span>
            </Link>
            <button
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              aria-label="메뉴 닫기"
              className="flex size-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-white hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
            <DrawerAccount onNavigate={() => setOpen(false)} />

            {NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                {/* 섹션 헤더 — 골드 룰로 구분해 초록 배경 위에서도 끊겨 보이지 않는다. */}
                <div className="flex items-baseline gap-2 border-y border-[#e0d7bf] bg-[#ece5d1] px-5 py-2.5">
                  <span className="font-serif text-sm font-semibold text-brand-700">
                    {section.label}
                  </span>
                  <span className="text-[0.625rem] font-medium tracking-[0.2em] text-[#a98a3f] uppercase">
                    {section.labelEn}
                  </span>
                </div>
                <ul>
                  {/* 한 줄에 하나씩 — 줄바꿈 없이 전체 폭을 쓴다. */}
                  {section.items.map((item) => (
                    <li key={item.href} className="border-b border-[#e6dfcc] last:border-b-0">
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        tabIndex={open ? 0 : -1}
                        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-[0.9375rem] leading-normal whitespace-nowrap text-ink-soft transition hover:bg-white hover:text-brand-600"
                      >
                        <span>{item.label}</span>
                        <svg
                          viewBox="0 0 24 24"
                          className="size-4 shrink-0 text-[#c8a04a]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <Link
              href="/sitemap"
              onClick={() => setOpen(false)}
              tabIndex={open ? 0 : -1}
              className="block border-y border-[#e0d7bf] bg-[#ece5d1] px-5 py-3.5 text-sm font-medium whitespace-nowrap text-brand-700 transition hover:bg-white"
            >
              사이트맵
            </Link>
          </nav>
        </div>
      </div>
    </>
  )
}
