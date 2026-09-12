'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_SECTIONS } from '@/lib/nav'

/**
 * 푸터 전체. 경로에 따라 달라져야 하는 판단 두 가지를 여기서 맡는다 — 푸터는
 * 레이아웃에서 서버 컴포넌트로 그려져 현재 경로를 모르기 때문이다. 교회 정보는
 * 서버에서 받아온 그대로 children 으로 흘려보낸다.
 */
export function FooterBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // 사이트맵 페이지는 본문이 이미 같은 목록이라 메뉴 쪽을 접는다.
  const showNav = pathname !== '/sitemap'

  // 홈은 마지막이 화면 전체를 채우는 CTA 밴드다. 위 여백을 두면 밴드와 푸터 사이에
  // 크림색 띠가 끼어 잘린 것처럼 보이므로 홈에서만 붙인다.
  const flush = pathname === '/'

  return (
    <footer className={`${flush ? '' : 'mt-24'} bg-brand-800 text-brand-100`}>
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

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-brand-300 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Sydney The Lord&apos;s Church in Australia. All rights
            reserved.
          </p>
          <span className="flex items-center gap-4">
            <Link href="/install" className="transition hover:text-white">
              앱 설치 안내
            </Link>
            <Link href="/sitemap" className="transition hover:text-white">
              사이트맵
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
