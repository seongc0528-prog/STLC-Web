/** 주보 카드 제목 — 주보는 그 주일로 식별하므로 날짜를 제목으로 쓴다. */
export function bulletinLabel(sundayDate: string) {
  // bulletins.sunday_date는 'YYYY-MM-DD' date 컬럼 — Date로 파싱하면 UTC 자정이 되어
  // 렌더링 타임존에 따라 하루 밀릴 수 있으므로 문자열 그대로 읽는다.
  const [y, m, d] = sundayDate.split('-').map(Number)
  return `${y}년 ${m}월 ${d}일 주보`
}

/**
 * Supabase Storage 공개 URL에 ?download=<파일명>을 붙이면
 * Content-Disposition: attachment 로 내려온다. 다른 호스트면 원본을 그대로 쓴다.
 */
export function downloadUrl(fileUrl: string, label: string) {
  try {
    const url = new URL(fileUrl)
    if (!url.pathname.includes('/storage/v1/object/')) return fileUrl
    url.searchParams.set('download', `${label}.pdf`)
    return url.toString()
  } catch {
    return fileUrl
  }
}
