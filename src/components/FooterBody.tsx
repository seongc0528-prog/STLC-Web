'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS } from '@/lib/nav'

/**
 * 푸터 상단 — 교회 정보와 전체 메뉴 목록.
 *
 * 사이트맵 페이지에서는 본문이 이미 같은 목록이라 메뉴 쪽을 접는다. 푸터는
 * 레이아웃에서 서버 컴포넌트로 그려져 현재 경로를 모르기 때문에, 경로를 아는
 * 이 얇은 클라이언트 껍데기가 판단을 맡는다. 교회 정보는 서버에서 받아온
 * 그대로 children 으로 흘려보낸다.
 */
export function FooterBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = pathname !== '/sitemap'

  return (
    <div
      className={`container-page grid gap-12 py-16 ${showNav ? 'md:grid-cols-[1.2fr_2fr]' : ''}`}
    >
      {children}

      {showNav && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="eyebrow eyebrow-on-dark mb-3">{section.labelEn}</p>
              <p className="mb-3 text-sm font-medium text-white">{section.label}</p>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-brand-200 transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
