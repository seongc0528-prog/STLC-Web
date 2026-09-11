import Link from 'next/link'
import { Icon } from '@/components/icons'

export const PAGE_SIZE = 10

/** ?page=N 기반 서버 페이지네이션. 현재 페이지 주변 ±2개 번호만 노출한다. */
export function Pagination({
  page,
  totalCount,
  basePath,
  pageSize = PAGE_SIZE,
}: {
  page: number
  totalCount: number
  basePath: string
  pageSize?: number
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  if (totalPages <= 1) return null

  const href = (p: number) => (p === 1 ? basePath : `${basePath}?page=${p}`)

  const from = Math.max(1, Math.min(page - 2, totalPages - 4))
  const to = Math.min(totalPages, Math.max(page + 2, 5))
  const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i)

  return (
    <nav aria-label="페이지" className="mt-12 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          aria-label="이전 페이지"
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-brand-600 hover:text-brand-600"
        >
          <Icon name="arrowRight" className="size-4 rotate-180" />
        </Link>
      )}

      {numbers.map((p) =>
        p === page ? (
          <span
            key={p}
            aria-current="page"
            className="flex size-9 items-center justify-center rounded-full bg-brand-600 text-sm font-medium text-white"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            className="flex size-9 items-center justify-center rounded-full text-sm text-ink-muted transition hover:bg-brand-50 hover:text-brand-600"
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages && (
        <Link
          href={href(page + 1)}
          aria-label="다음 페이지"
          className="flex size-9 items-center justify-center rounded-full border border-line text-ink-muted transition hover:border-brand-600 hover:text-brand-600"
        >
          <Icon name="arrowRight" className="size-4" />
        </Link>
      )}
    </nav>
  )
}

/** ?page= 값을 1 이상의 정수로 정규화. */
export function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 ? n : 1
}
