/**
 * 홈 퀵메뉴 / 섹션용 라인 아이콘.
 * 레퍼런스 사이트는 Font Awesome CDN을 쓰지만, 외부 요청 없이 쓰려고
 * 필요한 것만 24px 그리드 stroke 아이콘으로 인라인해 둔다.
 */
export type IconName = keyof typeof ICON_PATHS

const ICON_PATHS = {
  // 위임목사 / 사람
  user: (
    <>
      <path d="M20 21a8 8 0 1 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  // 예배 시간
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  // 주보 / 문서
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  // 설교 영상
  play: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" />
    </>
  ),
  // 찬양
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="16" r="2.5" />
    </>
  ),
  // 오늘의 말씀 / 성경
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M12 7v5M9.5 9.5h5" />
    </>
  ),
  // 행사 사진
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5-7 7" />
    </>
  ),
  // 은혜 간증
  chat: (
    <>
      <path d="M21 12a8 8 0 0 1-8 8H8l-4 2 1.2-3.6A8 8 0 1 1 21 12z" />
    </>
  ),
  // 선교
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
    </>
  ),
  // 헌금
  heart: (
    <>
      <path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z" />
    </>
  ),
  // 교육 신청
  graduation: (
    <>
      <path d="M12 4L2 9l10 5 10-5z" />
      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
    </>
  ),
  // 오시는 길
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  // 교회 소식
  megaphone: (
    <>
      <path d="M3 11v2a2 2 0 0 0 2 2h2l8 4V5L7 9H5a2 2 0 0 0-2 2z" />
      <path d="M19 9.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  // 십자가
  cross: (
    <>
      <path d="M10 3h4v5h5v4h-5v9h-4v-9H5V8h5z" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
} as const

export function Icon({
  name,
  className = "size-6",
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name]}
    </svg>
  )
}

/** 헤더/푸터 로고 마크 */
export function Logomark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="10" className="fill-brand-600" />
      <path
        d="M18 9h4v7h7v4h-7v11h-4V20h-7v-4h7z"
        fill="#fff"
        fillOpacity="0.95"
      />
    </svg>
  )
}
