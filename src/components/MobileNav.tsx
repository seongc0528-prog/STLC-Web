'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NAV_SECTIONS } from '@/lib/nav'
import { AuthButtons } from '@/components/AuthButtons'
import { NotificationOptIn } from '@/components/NotificationOptIn'
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

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 right-0 flex w-[min(22rem,88vw)] flex-col bg-cream-50 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <Logomark className="size-8" />
                <span className="font-serif text-sm font-semibold">시드니한인교회</span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                className="flex size-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-white hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label} className="mb-7">
                  <p className="eyebrow mb-1">{section.labelEn}</p>
                  <p className="mb-2 font-serif text-base font-semibold text-ink">
                    {section.label}
                  </p>
                  <ul className="border-l border-line pl-4">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block py-2 text-sm text-ink-soft transition hover:text-brand-600"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <Link
                href="/sitemap"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-ink-soft transition hover:text-brand-600"
              >
                사이트맵
              </Link>
            </nav>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-white px-5 py-4 text-sm">
              <NotificationOptIn />
              <AuthButtons />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
