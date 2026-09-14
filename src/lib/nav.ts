export type NavItem = {
  label: string
  labelEn: string
  href: string
  requiresAuth?: boolean
}

export type NavSection = {
  label: string
  labelEn: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: '교회 소개',
    labelEn: 'About',
    items: [
      { label: '담임목사 소개', labelEn: 'Senior Pastor', href: '/about/pastor' },
      { label: '섬기는 사람들', labelEn: 'Our Staff', href: '/about/staff' },
      { label: '예배 안내', labelEn: 'Worship Info', href: '/about/worship' },
      { label: '교회 연혁', labelEn: 'History', href: '/about/history' },
      { label: '오시는 길', labelEn: 'Location', href: '/about/location' },
    ],
  },
  {
    label: '찬양과 예배',
    labelEn: 'Worship & Praise',
    items: [
      { label: '주일 설교', labelEn: 'Sunday Sermon', href: '/tv/sunday' },
      { label: '수요 예배', labelEn: 'Wednesday Service', href: '/tv/wednesday' },
      { label: '찬양', labelEn: 'Praise', href: '/tv/praise' },
    ],
  },
  // 누구나 보는 메뉴와 로그인한 성도만 보는 메뉴를 섹션 단위로 나눈다.
  // href는 예전 섹션 이름(/community, /support)을 그대로 둔다 — 공유된 링크·푸시 링크 보존.
  {
    label: '교회 소식',
    labelEn: 'Church News',
    items: [
      { label: '오늘의 말씀', labelEn: 'Daily Verse', href: '/daily-verse' },
      { label: '행사 사진', labelEn: 'Photos', href: '/community/photos' },
      { label: '공지사항', labelEn: 'Notice', href: '/support/news' },
      { label: '주보', labelEn: 'Bulletin', href: '/support/bulletin' },
    ],
  },
  {
    label: '성도 마당',
    labelEn: 'Members',
    items: [
      { label: '은혜 간증', labelEn: 'Testimony', href: '/community/testimony', requiresAuth: true },
      { label: '선교 소식', labelEn: 'Mission News', href: '/community/mission', requiresAuth: true },
      { label: '자료실', labelEn: 'Resources', href: '/support/resources', requiresAuth: true },
      { label: '온라인 헌금', labelEn: 'Online Giving', href: '/support/donate', requiresAuth: true },
    ],
  },
  {
    label: '교육 신청',
    labelEn: 'Education',
    items: [
      { label: '직분자 제자훈련', labelEn: 'Officer Training', href: '/education/officer', requiresAuth: true },
      { label: '대학청년', labelEn: 'Young Adult', href: '/education/young-adult', requiresAuth: true },
      { label: '주일학교', labelEn: 'Sunday School', href: '/education/sunday-school', requiresAuth: true },
    ],
  },
]
