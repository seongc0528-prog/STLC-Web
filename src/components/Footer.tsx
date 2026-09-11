import Link from 'next/link'
import { NAV_SECTIONS } from '@/lib/nav'
import { createClient } from '@/lib/supabase/server'
import { Logomark } from '@/components/icons'

export async function Footer() {
  const supabase = await createClient()
  const { data: church } = await supabase
    .from('church_info')
    .select('address, address_en, phone, email, sunday_service, wednesday_service')
    .eq('id', 1)
    .single()

  return (
    <footer className="mt-24 bg-brand-800 text-brand-100">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.2fr_2fr]">
        {/* 교회 정보 */}
        <div>
          <div className="flex items-center gap-3">
            <Logomark className="size-10" />
            <span className="leading-tight">
              <span className="block font-serif text-base font-semibold text-white">
                시드니한인교회
              </span>
              <span className="eyebrow eyebrow-on-dark block text-[0.5625rem]">
                Sydney The Lord&apos;s Church
              </span>
            </span>
          </div>

          <dl className="mt-7 space-y-2 text-sm text-brand-200">
            {church?.address && (
              <div className="flex gap-3">
                <dt className="w-12 shrink-0 text-brand-300">주소</dt>
                <dd className="text-brand-100">{church.address}</dd>
              </div>
            )}
            {church?.phone && (
              <div className="flex gap-3">
                <dt className="w-12 shrink-0 text-brand-300">전화</dt>
                <dd className="text-brand-100">{church.phone}</dd>
              </div>
            )}
            {church?.email && (
              <div className="flex gap-3">
                <dt className="w-12 shrink-0 text-brand-300">이메일</dt>
                <dd className="text-brand-100">{church.email}</dd>
              </div>
            )}
            {(church?.sunday_service || church?.wednesday_service) && (
              <div className="flex gap-3">
                <dt className="w-12 shrink-0 text-brand-300">예배</dt>
                <dd className="text-brand-100">
                  {church?.sunday_service && <>주일 {church.sunday_service}</>}
                  {church?.sunday_service && church?.wednesday_service && (
                    <span className="mx-2 text-brand-300/50">|</span>
                  )}
                  {church?.wednesday_service && <>수요 {church.wednesday_service}</>}
                </dd>
              </div>
            )}
          </dl>

          <Link href="/about/location" className="btn btn-ghost-light mt-7">
            오시는 길
          </Link>
        </div>

        {/* 사이트맵 */}
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
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-brand-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sydney The Lord&apos;s Church. All rights reserved.</p>
          <Link href="/sitemap" className="transition hover:text-white">
            사이트맵
          </Link>
        </div>
      </div>
    </footer>
  )
}
