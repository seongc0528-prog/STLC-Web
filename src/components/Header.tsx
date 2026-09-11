import Link from 'next/link'
import { NAV_SECTIONS } from '@/lib/nav'
import { NotificationOptIn } from '@/components/NotificationOptIn'
import { AuthButtons } from '@/components/AuthButtons'
import { MobileNav } from '@/components/MobileNav'
import { Logomark } from '@/components/icons'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  // 상단바 예배 시간은 church_info 단일 소스에서 읽는다(홈/푸터와 어긋나지 않도록).
  const supabase = await createClient()
  const { data: church } = await supabase
    .from('church_info')
    .select('sunday_service, wednesday_service')
    .eq('id', 1)
    .single()

  return (
    <header className="sticky top-0 z-50">
      {/* 상단 유틸리티 바 */}
      <div className="hidden bg-brand-800 text-white md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="text-brand-200">
            {church?.sunday_service && (
              <>
                주일예배 <span className="text-white">{church.sunday_service}</span>
              </>
            )}
            {church?.sunday_service && church?.wednesday_service && (
              <span className="mx-2 text-brand-300/50">|</span>
            )}
            {church?.wednesday_service && (
              <>
                수요예배 <span className="text-white">{church.wednesday_service}</span>
              </>
            )}
          </p>
          <div className="flex items-center gap-4">
            <Link href="/daily-verse" className="text-brand-200 transition hover:text-white">
              오늘의 말씀
            </Link>
            <Link href="/sitemap" className="text-brand-200 transition hover:text-white">
              사이트맵
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 바 */}
      <div className="border-b border-line bg-white/90 backdrop-blur-md">
        <div className="container-page flex h-18 items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Logomark className="size-10" />
            <span className="leading-tight">
              <span className="block font-serif text-base font-semibold text-ink">
                시드니 주님의 교회
              </span>
              {/* 영문 풀네임이 길어서 좁은 화면에서는 숨긴다 */}
              <span className="eyebrow hidden text-[0.5625rem] tracking-[0.16em] sm:block">
                Sydney The Lord&apos;s Church in Australia
              </span>
            </span>
          </Link>

          <nav className="hidden h-full items-stretch gap-1 lg:flex">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="group relative flex items-center">
                <span className="cursor-default px-4 py-2 text-sm font-medium text-ink-soft transition group-hover:text-brand-600">
                  {section.label}
                </span>
                {/* 밑줄 인디케이터 */}
                <span className="pointer-events-none absolute inset-x-4 bottom-0 h-0.5 origin-left scale-x-0 bg-brand-600 transition-transform duration-200 group-hover:scale-x-100" />

                <div className="invisible absolute left-1/2 top-full z-10 w-56 -translate-x-1/2 translate-y-1 rounded-xl border border-line bg-white p-2 opacity-0 shadow-card transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="eyebrow px-3 pb-2 pt-1">{section.labelEn}</p>
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm text-ink-soft transition hover:bg-brand-50 hover:text-brand-600"
                    >
                      {item.label}
                      <span className="ml-2 text-[0.625rem] tracking-wider text-ink-muted/70">
                        {item.labelEn}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <div className="hidden items-center gap-3 sm:flex">
              <NotificationOptIn />
              <AuthButtons />
            </div>
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
