import Link from 'next/link'
import { NAV_SECTIONS } from '@/lib/nav'

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Sydney The Lord&apos;s Church
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="group relative">
              <span className="cursor-pointer text-sm font-medium text-gray-700">{section.label}</span>
              <div className="absolute left-0 top-full z-10 hidden min-w-40 flex-col rounded border border-gray-200 bg-white py-2 shadow-md group-hover:flex">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href="/sitemap" className="text-sm font-medium text-gray-700">
            사이트맵
          </Link>
        </nav>
        <div className="flex gap-3 text-sm">
          <Link href="/auth/login">로그인</Link>
          <Link href="/auth/signup">회원가입</Link>
        </div>
      </div>
    </header>
  )
}
