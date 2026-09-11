/** 주보 카드 제목 — 주보는 그 주일로 식별하므로 날짜를 제목으로 쓴다. */
export function bulletinLabel(publishedAt: string) {
  const d = new Date(publishedAt)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 주보`
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
