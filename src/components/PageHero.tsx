import Link from 'next/link'
import { NAV_SECTIONS } from '@/lib/nav'

/**
 * 내부 페이지 공통 헤더. 홈 히어로의 축소판으로,
 * 딥그린 배경 + 영문 eyebrow + 세리프 제목 + 브레드크럼 구조를 공유한다.
 *
 * href를 주면 NAV_SECTIONS에서 상위 섹션과 영문 라벨을 알아서 찾는다.
 */
export function PageHero({
  title,
  titleEn,
  description,
  href,
}: {
  title: string
  titleEn?: string
  description?: string
  href?: string
}) {
  const section = href
    ? NAV_SECTIONS.find((s) => s.items.some((i) => i.href === href))
    : undefined
  const item = section?.items.find((i) => i.href === href)
  const eyebrow = titleEn ?? item?.labelEn ?? section?.labelEn

  return (
    <section className="relative overflow-hidden bg-brand-800">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(45rem 25rem at 80% 0%, #2e7d32 0%, transparent 65%)',
        }}
      />
      <div className="container-page relative py-16 md:py-20">
        {eyebrow && <p className="eyebrow eyebrow-on-dark">{eyebrow}</p>}
        <h1 className="display mt-3 text-2xl text-white md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-brand-100">
            {description}
          </p>
        )}

        {section && (
          <nav aria-label="현재 위치" className="mt-8 flex items-center gap-2 text-xs text-brand-300">
            <Link href="/" className="transition hover:text-white">
              홈
            </Link>
            <span aria-hidden>/</span>
            <span>{section.label}</span>
            {item && (
              <>
                <span aria-hidden>/</span>
                <span className="text-white">{item.label}</span>
              </>
            )}
          </nav>
        )}
      </div>
    </section>
  )
}
